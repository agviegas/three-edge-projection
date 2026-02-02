
import * as THREEWEBGPU from 'three/webgpu';
import { float, Fn, If, instancedArray, instanceIndex } from 'three/tsl';

export function getEdgesTrianglesGroups( edgesBvh, bvh, mesh, edgeOffsets, edgeCounts, meshOffsets, meshCounts ) {

	let counter = 0;

	edgesBvh.bvhcast( bvh, mesh.matrixWorld, {

		intersectsRanges: ( edgeOffset, edgeCount, meshOffset, meshCount ) => {

			// pairs.push( edgeOffset, edgeCount, meshOffset, meshCount );
			edgeOffsets[ counter ] = edgeOffset;
			edgeCounts[ counter ] = edgeCount;
			meshOffsets[ counter ] = meshOffset;
			meshCounts[ counter ] = meshCount;
			counter ++;

		},

	} );

	// console.log( counter );

	return counter;

}

export async function getBvhcastEdgesWebgpu( edgeOffsets, edgeCounts, meshOffsets, meshCounts ) {

	const renderer = new THREEWEBGPU.WebGPURenderer();
	await renderer.init();

	// 1. Create input data
	const inputData = new Float32Array( [ 1, 2, 3, 4, 5 ] );

	// 2. Upload to GPU buffer
	// instancedArray creates a storage buffer on the GPU
	// 'float' means each element is a single float
	const buffer = instancedArray( inputData, 'float' );

	const test = [
		instancedArray( new Float32Array( inputData.length ), 'float' ),
		instancedArray( new Float32Array( inputData.length ), 'float' ),
	];

	// 3. Define the compute shader
	const computeShader = Fn( () => {

		// instanceIndex is a built-in: which thread am I?
		// buffer.element(i) accesses the i-th element
		const value = buffer.element( instanceIndex );

		If( value.lessThan( 2 ), () => {

    		test[ 0 ].element( instanceIndex ).assign( float( 1.0 ) );

		} ).ElseIf( value.greaterThan( 2 ), () => {

    		test[ 1 ].element( instanceIndex ).assign( float( 1.0 ) );

		} );

		// Multiply by 2 and write back
		// .assign() is like = in regular code
		// .mul() is like * in regular code
		value.assign( value.mul( 2 ) );

	} )().compute( 5 ); // Request 5 invocations (dispatches 1 workgroup of 64 threads)


	// 4. Execute on GPU
	await renderer.computeAsync( computeShader );


	// 5. Read results back
	const resultBuffer = await renderer.getArrayBufferAsync( buffer.value );
	const result = new Float32Array( resultBuffer );
	console.log( Array.from( result ).join( ', ' ) );

	const firstResultBuffer = await renderer.getArrayBufferAsync( test[ 0 ].value );
	const firstResult = new Float32Array( firstResultBuffer );
	console.log( Array.from( firstResult ).join( ', ' ) );

	const secondResultBuffer = await renderer.getArrayBufferAsync( test[ 1 ].value );
	const secondResult = new Float32Array( secondResultBuffer );
	console.log( Array.from( secondResult ).join( ', ' ) );

}
