import {
	BufferGeometry,
	Vector3,
	BufferAttribute,
	Mesh,
	Scene,
} from 'three';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import { isYProjectedLineDegenerate } from './utils/triangleLineUtils.js';
import { overlapsToLines } from './utils/overlapUtils.js';
import { EdgeGenerator } from './EdgeGenerator.js';
import { LineObjectsBVH } from './utils/LineObjectsBVH.js';
import { bvhcastEdges } from './utils/bvhcastEdges.js';
import { getAllMeshes } from './utils/getAllMeshes.js';
import { VisibilityCuller } from './VisibilityCuller.js';
import { Logger } from './utils/Logger.js';
import { getBvhcastEdgesWebgpu, getEdgesTrianglesGroups } from './utils/bvhcastEdgesWebgpu.js';

// these shared variables are not used across "yield" boundaries in the
// generator so there's no risk of overwriting another tasks data
const UP_VECTOR = /* @__PURE__ */ new Vector3( 0, 1, 0 );

function toLineGeometry( edges ) {

	const edgeArray = new Float32Array( edges.length * 6 );
	let c = 0;
	for ( let i = 0, l = edges.length; i < l; i ++ ) {

		const line = edges[ i ];
		edgeArray[ c ++ ] = line[ 0 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 2 ];
		edgeArray[ c ++ ] = line[ 3 ];
		edgeArray[ c ++ ] = 0;
		edgeArray[ c ++ ] = line[ 5 ];

	}

	const edgeGeom = new BufferGeometry();
	const edgeBuffer = new BufferAttribute( edgeArray, 3, true );
	edgeGeom.setAttribute( 'position', edgeBuffer );
	return edgeGeom;

}

class ProjectedEdgeCollector {

	constructor( scene, useWebGPU = true ) {

		this.meshes = getAllMeshes( scene );
		this.bvhs = new Map();
		this.visibleEdges = [];
		this.hiddenEdges = [];
		this.iterationTime = 30;
		this.useWebGPU = useWebGPU;

	}

	reset() {

		this.visibleEdges.length = 0;
		this.hiddenEdges.length = 0;

	}

	getVisibleLineGeometry() {

		return toLineGeometry( this.visibleEdges );

	}

	getHiddenLineGeometry() {

		return toLineGeometry( this.hiddenEdges );


	}

	addEdges( ...args ) {

		const currIterationTime = this.iterationTime;
		this.iterationTime = Infinity;

		const result = this.addEdgesGenerator( ...args ).next().value;
		this.iterationTime = currIterationTime;

		return result;

	}

	// all edges are expected to be in world coordinates
	*addEdgesGenerator( edges, options = {} ) {

		const { meshes, bvhs, visibleEdges, hiddenEdges, iterationTime } = this;
		let time = performance.now();

		// Build mesh BVHs
		Logger.startStep( 'Building mesh BVH' );
		for ( let i = 0; i < meshes.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			const mesh = meshes[ i ];
			const geometry = mesh.geometry;
			if ( ! bvhs.has( geometry ) ) {

				const bvh = geometry.boundsTree || new MeshBVH( geometry );
				bvhs.set( geometry, bvh );

			}

		}

		// initialize hidden line object
		const hiddenOverlapMap = {};
		for ( let i = 0; i < edges.length; i ++ ) {

			hiddenOverlapMap[ i ] = [];

		}

		// Build line BVH
		Logger.startStep( 'Building line BVH' );
		const edgesBvh = new LineObjectsBVH( edges, { maxLeafSize: 2, strategy: SAH } );

		// BVHcast overlaps
		Logger.startStep( 'BVHcast overlaps' );
		time = performance.now();

		const bvhStats = { candidates: 0, used: 0 };
		const useWebGpu = this.useWebGPU;
		const size = 99999999;
		const webgpuData = {};

		if ( useWebGpu ) {

			webgpuData.edgeOffsets = new Uint32Array( size );
			webgpuData.edgeCounts = new Uint32Array( size );
			webgpuData.meshOffsets = new Uint32Array( size );
			webgpuData.meshCounts = new Uint32Array( size );
			webgpuData.meshIndex = new Uint32Array( size );
			webgpuData.groupCount = 0;

		}

		for ( let m = 0; m < meshes.length; m ++ ) {

			if ( performance.now() - time > iterationTime ) {

				if ( options.onProgress ) {

					options.onProgress( m, meshes.length );

				}

				yield;
				time = performance.now();

			}

			// use bvhcast to compare all edges against all meshes
			const mesh = meshes[ m ];
			if ( useWebGpu ) {

				// bvhcastEdges( edgesBvh, bvhs.get( mesh.geometry ), mesh, hiddenOverlapMap );
				getEdgesTrianglesGroups( edgesBvh, bvhs.get( mesh.geometry ), mesh, webgpuData, m );

			} else {

				bvhcastEdges( edgesBvh, bvhs.get( mesh.geometry ), mesh, hiddenOverlapMap, bvhStats );

			}

		}


		if ( useWebGpu ) {

			// Wait for async WebGPU computation to complete
			let webgpuFinished = false;
			getBvhcastEdgesWebgpu( webgpuData, meshes, edgesBvh, hiddenOverlapMap, bvhStats ).then( () => {

				webgpuFinished = true;

			} );

			while ( ! webgpuFinished ) {

				yield;

			}

		}

		Logger.setStat( 'BVH candidate pairs (edge × triangle)', bvhStats.candidates.toLocaleString() );
		Logger.setStat( 'Pairs producing overlaps', bvhStats.used.toLocaleString() );
		if ( bvhStats.candidates > 0 ) {

			Logger.setStat( 'BVH efficiency (used/candidates)', ( bvhStats.used / bvhStats.candidates * 100 ).toFixed( 3 ) + '%' );

		}

		// Convert overlaps to lines
		Logger.startStep( 'Converting overlaps to lines' );
		for ( let i = 0; i < edges.length; i ++ ) {

			if ( performance.now() - time > iterationTime ) {

				yield;
				time = performance.now();

			}

			// convert the overlap points to proper lines
			const line = edges[ i ];
			const hiddenOverlaps = hiddenOverlapMap[ i ];
			overlapsToLines( line, hiddenOverlaps, false, visibleEdges );
			overlapsToLines( line, hiddenOverlaps, true, hiddenEdges );

		}

	}

}

export class ProjectionGenerator {

	constructor() {

		this.iterationTime = 30;
		this.angleThreshold = 50;
		this.includeIntersectionEdges = true;
		this.useWebGPU = true;

	}

	generateAsync( geometry, options = {} ) {

		return new Promise( ( resolve, reject ) => {

			const { signal } = options;
			const task = this.generate( geometry, options );
			run();

			function run() {

				if ( signal && signal.aborted ) {

					reject( new Error( 'ProjectionGenerator: Process aborted via AbortSignal.' ) );
					return;

				}

				const result = task.next();
				if ( result.done ) {

					resolve( result.value );

				} else {

					requestAnimationFrame( run );

				}

			}


		} );

	}

	*generate( scene, options ) {

		const { iterationTime, angleThreshold, includeIntersectionEdges } = this;
		const {
			onProgress = () => {},
			visibilityCuller = null,
		} = options;

		Logger.reset();
		Logger.startTotal();

		if ( scene.isBufferGeometry ) {

			scene = new Mesh( scene );

		}

		if ( visibilityCuller ) {

			Logger.startStep( 'Visibility culling' );
			let finished = false;
			visibilityCuller.cull( scene ).then( res => {

				// TODO: the functions should be able to handle an array of objects
				scene = new Scene();
				scene.children = res;
				finished = true;

			} );

			while ( ! finished ) {

				yield;

			}

		}

		const edgeGenerator = new EdgeGenerator();
		edgeGenerator.iterationTime = iterationTime;
		edgeGenerator.thresholdAngle = angleThreshold;
		edgeGenerator.projectionDirection.copy( UP_VECTOR );

		Logger.startStep( 'Generating candidate edges' );
		onProgress( 'Generating candidate edges' );
		let edges = [];
		yield* edgeGenerator.getEdgesGenerator( scene, edges, options );
		if ( includeIntersectionEdges ) {

			Logger.startStep( 'Generating intersection edges' );
			onProgress( 'Generating intersection edges' );
			yield* edgeGenerator.getIntersectionEdgesGenerator( scene, edges, options );

		}

		// filter out any degenerate projected edges
		Logger.startStep( 'Pre-filtering edges' );
		onProgress( 'Pre-filtering edges' );
		edges = edges.filter( e => ! isYProjectedLineDegenerate( e ) );

		yield;

		const collector = new ProjectedEdgeCollector( scene, this.useWebGPU );
		collector.iterationTime = iterationTime;

		onProgress( 'Building BVH & computing overlaps' );
		yield* collector.addEdgesGenerator( edges, {
			onProgress: ! onProgress ? null : ( prog, tot ) => {

				onProgress( 'Building BVH & computing overlaps', prog / tot, collector );

			},
		} );
		Logger.printSummary();

		return collector;

	}

}
