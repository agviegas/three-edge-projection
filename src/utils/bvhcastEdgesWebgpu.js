
import * as THREEWEBGPU from 'three/webgpu';
import { float, Fn, If, instancedArray, instanceIndex, uint, vec3, vec4, mat4 } from 'three/tsl';

// Convert edges (Line3[]) to flat Float32Array
// Layout: [start.x, start.y, start.z, end.x, end.y, end.z, ...] per edge
export function edgesToFloat32Array( edges ) {

	const data = new Float32Array( edges.length * 6 );
	for ( let i = 0; i < edges.length; i ++ ) {

		const edge = edges[ i ];
		data[ i * 6 + 0 ] = edge.start.x;
		data[ i * 6 + 1 ] = edge.start.y;
		data[ i * 6 + 2 ] = edge.start.z;
		data[ i * 6 + 3 ] = edge.end.x;
		data[ i * 6 + 4 ] = edge.end.y;
		data[ i * 6 + 5 ] = edge.end.z;

	}

	return data;

}

export function getEdgesTrianglesGroups( edgesBvh, bvh, mesh, webgpuData, meshIndex ) {

	edgesBvh.bvhcast( bvh, mesh.matrixWorld, {

		intersectsRanges: ( edgeOffset, edgeCount, meshOffset, meshCount ) => {

			webgpuData.edgeOffsets[ webgpuData.groupCount ] = edgeOffset;
			webgpuData.edgeCounts[ webgpuData.groupCount ] = edgeCount;
			webgpuData.meshOffsets[ webgpuData.groupCount ] = meshOffset;
			webgpuData.meshCounts[ webgpuData.groupCount ] = meshCount;
			webgpuData.meshIndex[ webgpuData.groupCount ] = meshIndex;
			webgpuData.groupCount ++;

		},

	} );

}

// Number of meshes to process in each GPU batch
// We concatenate mesh data within each batch to stay under WebGPU's 8 storage buffer limit
const MESHES_PER_BATCH = 64;

export async function getBvhcastEdgesWebgpu( webgpuData, meshes, edgesBvh, hiddenOverlapMap ) {

	const renderer = new THREEWEBGPU.WebGPURenderer();
	await renderer.init();

	// Edges data is shared across all batches
	const edgesData = instancedArray( edgesToFloat32Array( edgesBvh.lines ), 'float' );

	console.log( 'Number of meshes:', meshes.length );
	console.log( 'Group count:', webgpuData.groupCount );

	// Process meshes in batches
	const numBatches = Math.ceil( meshes.length / MESHES_PER_BATCH );

	for ( let batchIdx = 0; batchIdx < numBatches; batchIdx ++ ) {

		const batchStart = batchIdx * MESHES_PER_BATCH;
		const batchEnd = Math.min( batchStart + MESHES_PER_BATCH, meshes.length );
		const batchMeshCount = batchEnd - batchStart;

		console.log( `Processing batch ${batchIdx + 1}/${numBatches} (meshes ${batchStart}-${batchEnd - 1})` );

		// Calculate sizes for concatenated buffers
		let totalPositions = 0;
		let totalIndices = 0;
		const meshVertexStarts = []; // Where each mesh's vertices start in concatenated buffer
		const meshTriangleStarts = []; // Where each mesh's triangles start in concatenated buffer

		for ( let i = batchStart; i < batchEnd; i ++ ) {

			const geometry = meshes[ i ].geometry;
			meshVertexStarts.push( totalPositions / 3 ); // Vertex index, not float index
			meshTriangleStarts.push( totalIndices / 3 ); // Triangle index, not index index
			totalPositions += geometry.attributes.position.array.length;
			totalIndices += geometry.index.array.length;

		}

		// Concatenate positions and indices for this batch
		const batchPositionsArray = new Float32Array( totalPositions );
		const batchIndicesArray = new Uint32Array( totalIndices );

		let posOffset = 0;
		let idxOffset = 0;
		let vertexOffset = 0;

		for ( let i = batchStart; i < batchEnd; i ++ ) {

			const geometry = meshes[ i ].geometry;
			const srcPositions = geometry.attributes.position.array;
			const srcIndices = geometry.index.array;

			// Copy positions
			batchPositionsArray.set( srcPositions, posOffset );
			posOffset += srcPositions.length;

			// Copy indices, adjusting by vertex offset
			for ( let j = 0; j < srcIndices.length; j ++ ) {

				batchIndicesArray[ idxOffset + j ] = srcIndices[ j ] + vertexOffset;

			}

			idxOffset += srcIndices.length;
			vertexOffset += geometry.attributes.position.count;

		}

		// Concatenate matrices for this batch (16 floats per mesh)
		const batchMatricesArray = new Float32Array( batchMeshCount * 16 );
		for ( let i = batchStart; i < batchEnd; i ++ ) {

			const localIdx = i - batchStart;
			batchMatricesArray.set( meshes[ i ].matrixWorld.elements, localIdx * 16 );

		}

		// Filter groups that belong to this batch's meshes
		// Also convert local mesh triangle offset to global batch triangle offset
		const batchGroups = {
			edgeOffsets: [],
			edgeCounts: [],
			triangleOffsets: [], // Now global within batch (not per-mesh)
			meshCounts: [],
			localMeshIndex: [] // Which mesh within this batch (for matrix lookup)
		};

		for ( let i = 0; i < webgpuData.groupCount; i ++ ) {

			const globalMeshIdx = webgpuData.meshIndex[ i ];
			if ( globalMeshIdx >= batchStart && globalMeshIdx < batchEnd ) {

				const localMeshIdx = globalMeshIdx - batchStart;
				const globalTriOffset = meshTriangleStarts[ localMeshIdx ] + webgpuData.meshOffsets[ i ];

				batchGroups.edgeOffsets.push( webgpuData.edgeOffsets[ i ] );
				batchGroups.edgeCounts.push( webgpuData.edgeCounts[ i ] );
				batchGroups.triangleOffsets.push( globalTriOffset );
				batchGroups.meshCounts.push( webgpuData.meshCounts[ i ] );
				batchGroups.localMeshIndex.push( localMeshIdx );

			}

		}

		if ( batchGroups.edgeOffsets.length === 0 ) {

			console.log( `  Batch ${batchIdx + 1}: no groups, skipping` );
			continue;

		}

		console.log( `  Batch ${batchIdx + 1}: ${batchGroups.edgeOffsets.length} groups, ${totalPositions / 3} vertices, ${totalIndices / 3} triangles` );

		// Create instanced arrays - 8 storage buffers (at the limit!)
		// 1. positions (concatenated)
		// 2. indices (concatenated)
		// 3. matrices (concatenated, 16 floats per mesh)
		// 4. triangleOffsets (per group)
		// 5. localMeshIndex (per group, for matrix lookup)
		// 6. edgeOffsets (per group)
		// 7. edgesData (shared across batches)
		// 8. testOutput

		const batchPositions = instancedArray( batchPositionsArray, 'float' );
		const batchIndices = instancedArray( batchIndicesArray, 'uint' );
		const batchMatrices = instancedArray( batchMatricesArray, 'float' );
		const batchTriangleOffsets = instancedArray( new Uint32Array( batchGroups.triangleOffsets ), 'uint' );
		const batchLocalMeshIndex = instancedArray( new Uint32Array( batchGroups.localMeshIndex ), 'uint' );
		const batchEdgeOffsets = instancedArray( new Uint32Array( batchGroups.edgeOffsets ), 'uint' );

		// Test output for this batch - now 6 floats per group (edge start + end)
		const testOutput = instancedArray( new Float32Array( batchGroups.edgeOffsets.length * 6 ), 'float' );

		// Build compute shader - now with simple dynamic indexing!
		const computeShader = Fn( () => {

			const groupIdx = instanceIndex;
			const edgeOffset = batchEdgeOffsets.element( groupIdx );

			// Read first edge in this group (6 floats per edge: start xyz, end xyz)
			const edgeDataOffset = edgeOffset.mul( 6 );
			const edgeStartX = edgesData.element( edgeDataOffset );
			const edgeStartY = edgesData.element( edgeDataOffset.add( 1 ) );
			const edgeStartZ = edgesData.element( edgeDataOffset.add( 2 ) );
			const edgeEndX = edgesData.element( edgeDataOffset.add( 3 ) );
			const edgeEndY = edgesData.element( edgeDataOffset.add( 4 ) );
			const edgeEndZ = edgesData.element( edgeDataOffset.add( 5 ) );

			// Write edge start and end to test output (6 floats per group)
			const outOffset = groupIdx.mul( 6 );
			testOutput.element( outOffset ).assign( edgeStartX );
			testOutput.element( outOffset.add( 1 ) ).assign( edgeStartY );
			testOutput.element( outOffset.add( 2 ) ).assign( edgeStartZ );
			testOutput.element( outOffset.add( 3 ) ).assign( edgeEndX );
			testOutput.element( outOffset.add( 4 ) ).assign( edgeEndY );
			testOutput.element( outOffset.add( 5 ) ).assign( edgeEndZ );

		} )().compute( batchGroups.edgeOffsets.length );

		// Execute on GPU
		await renderer.computeAsync( computeShader );

		// Read results back
		const resultBuffer = await renderer.getArrayBufferAsync( testOutput.value );
		const result = new Float32Array( resultBuffer );

		// Log first few results to verify edge reading
		console.log( `  Test output (first 3 groups - edge start/end):` );
		for ( let i = 0; i < Math.min( 3, batchGroups.edgeOffsets.length ); i ++ ) {

			const start = `(${result[ i * 6 ].toFixed( 2 )}, ${result[ i * 6 + 1 ].toFixed( 2 )}, ${result[ i * 6 + 2 ].toFixed( 2 )})`;
			const end = `(${result[ i * 6 + 3 ].toFixed( 2 )}, ${result[ i * 6 + 4 ].toFixed( 2 )}, ${result[ i * 6 + 5 ].toFixed( 2 )})`;
			console.log( `    Group ${i}: start=${start} end=${end}` );

		}

	}

}
