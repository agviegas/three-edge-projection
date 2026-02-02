
import * as THREEWEBGPU from 'three/webgpu';
import { float, Fn, If, instancedArray, instanceIndex } from 'three/tsl';

export function getEdgesTrianglesGroups( edgesBvh, bvh, mesh, webgpuData, counter, meshIndex ) {

	edgesBvh.bvhcast( bvh, mesh.matrixWorld, {

		intersectsRanges: ( edgeOffset, edgeCount, meshOffset, meshCount ) => {

			// pairs.push( edgeOffset, edgeCount, meshOffset, meshCount );
			webgpuData.edgeOffsets[ counter ] = edgeOffset;
			webgpuData.edgeCounts[ counter ] = edgeCount;
			webgpuData.meshOffsets[ counter ] = meshOffset;
			webgpuData.meshCounts[ counter ] = meshCount;
			webgpuData.meshIndex[ counter ] = meshIndex;
			counter ++;

		},

	} );

	return counter;

}

export async function getBvhcastEdgesWebgpu( webgpuData, meshes, edgesBvh, hiddenOverlapMap ) {

	const renderer = new THREEWEBGPU.WebGPURenderer();
	await renderer.init();

	const meshIndex = instancedArray( webgpuData.meshIndex, 'uint' );
	const edgeOffsets = instancedArray( webgpuData.edgeOffsets, 'uint' );
	const edgeCounts = instancedArray( webgpuData.edgeCounts, 'uint' );
	const meshOffsets = instancedArray( webgpuData.meshOffsets, 'uint' );
	const meshCounts = instancedArray( webgpuData.meshCounts, 'uint' );

	const meshesPosInstancedArrays = [];
	const meshesIndicesInstancedArrays = [];

	for ( let i = 0; i < meshes.length; i ++ ) {

		meshesPosInstancedArrays.push( instancedArray( meshes[ i ].geometry.attributes.position.array, 'float' ) );

	}

	for ( let i = 0; i < meshes.length; i ++ ) {

		meshesIndicesInstancedArrays.push( instancedArray( meshes[ i ].geometry.index.array, 'uint' ) );

	}

	// const computeShader = Fn( () => {




	// } )().compute( webgpuData.meshStarts.length ); // Request 5 invocations (dispatches 1 workgroup of 64 threads)


	// // 4. Execute on GPU
	// await renderer.computeAsync( computeShader );


	// // 5. Read results back
	// const resultBuffer = await renderer.getArrayBufferAsync( buffer.value );
	// const result = new Float32Array( resultBuffer );
	// console.log( Array.from( result ).join( ', ' ) );

}
