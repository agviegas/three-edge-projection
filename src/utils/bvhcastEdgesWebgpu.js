
import * as THREEWEBGPU from 'three/webgpu';
import { float, Fn, If, Loop, instancedArray, instanceIndex, uint, int, vec3, vec4, mat4, Break, Continue, max, min, cross, normalize, dot } from 'three/tsl';

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

// Group info layout: [edgeOffset, edgeCount, triOffset, triCount, meshIdx] per group
const GROUP_INFO_STRIDE = 5;

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

		// Filter groups that belong to this batch's meshes and pack into groupInfo
		// Layout: [edgeOffset, edgeCount, triOffset, triCount, meshIdx] per group
		const batchGroupsList = [];

		for ( let i = 0; i < webgpuData.groupCount; i ++ ) {

			const globalMeshIdx = webgpuData.meshIndex[ i ];
			if ( globalMeshIdx >= batchStart && globalMeshIdx < batchEnd ) {

				const localMeshIdx = globalMeshIdx - batchStart;
				const globalTriOffset = meshTriangleStarts[ localMeshIdx ] + webgpuData.meshOffsets[ i ];

				batchGroupsList.push( {
					edgeOffset: webgpuData.edgeOffsets[ i ],
					edgeCount: webgpuData.edgeCounts[ i ],
					triOffset: globalTriOffset,
					triCount: webgpuData.meshCounts[ i ],
					meshIdx: localMeshIdx
				} );

			}

		}

		if ( batchGroupsList.length === 0 ) {

			console.log( `  Batch ${batchIdx + 1}: no groups, skipping` );
			continue;

		}

		// Pack group info into a single Uint32Array
		const batchGroupInfoArray = new Uint32Array( batchGroupsList.length * GROUP_INFO_STRIDE );
		for ( let i = 0; i < batchGroupsList.length; i ++ ) {

			const g = batchGroupsList[ i ];
			const offset = i * GROUP_INFO_STRIDE;
			batchGroupInfoArray[ offset + 0 ] = g.edgeOffset;
			batchGroupInfoArray[ offset + 1 ] = g.edgeCount;
			batchGroupInfoArray[ offset + 2 ] = g.triOffset;
			batchGroupInfoArray[ offset + 3 ] = g.triCount;
			batchGroupInfoArray[ offset + 4 ] = g.meshIdx;

		}

		console.log( `  Batch ${batchIdx + 1}: ${batchGroupsList.length} groups, ${totalPositions / 3} vertices, ${totalIndices / 3} triangles` );

		// Create instanced arrays - 7 storage buffers (1 spare!)
		// 1. positions (concatenated)
		// 2. indices (concatenated)
		// 3. matrices (concatenated, 16 floats per mesh)
		// 4. groupInfo (packed: edgeOffset, edgeCount, triOffset, triCount, meshIdx)
		// 5. edgesData (shared across batches)
		// 6. testOutput
		// 7. (spare for overlaps output later)

		const batchPositions = instancedArray( batchPositionsArray, 'float' );
		const batchIndices = instancedArray( batchIndicesArray, 'uint' );
		const batchMatrices = instancedArray( batchMatricesArray, 'float' );
		const batchGroupInfo = instancedArray( batchGroupInfoArray, 'uint' );

		// Test output: count of edge-triangle pairs processed per group (1 uint per group)
		const testOutput = instancedArray( new Uint32Array( batchGroupsList.length ), 'uint' );

		// Build compute shader
		const computeShader = Fn( () => {

			const groupIdx = instanceIndex;

			// Unpack group info
			const infoOffset = groupIdx.mul( GROUP_INFO_STRIDE );
			const edgeOffset = batchGroupInfo.element( infoOffset );
			const edgeCount = batchGroupInfo.element( infoOffset.add( 1 ) );
			const triOffset = batchGroupInfo.element( infoOffset.add( 2 ) );
			const triCount = batchGroupInfo.element( infoOffset.add( 3 ) );
			const meshIdx = batchGroupInfo.element( infoOffset.add( 4 ) );

			// Read matrix for this mesh (16 floats, column-major)
			const matOffset = meshIdx.mul( 16 );
			const matrix = mat4(
				batchMatrices.element( matOffset ),
				batchMatrices.element( matOffset.add( 1 ) ),
				batchMatrices.element( matOffset.add( 2 ) ),
				batchMatrices.element( matOffset.add( 3 ) ),
				batchMatrices.element( matOffset.add( 4 ) ),
				batchMatrices.element( matOffset.add( 5 ) ),
				batchMatrices.element( matOffset.add( 6 ) ),
				batchMatrices.element( matOffset.add( 7 ) ),
				batchMatrices.element( matOffset.add( 8 ) ),
				batchMatrices.element( matOffset.add( 9 ) ),
				batchMatrices.element( matOffset.add( 10 ) ),
				batchMatrices.element( matOffset.add( 11 ) ),
				batchMatrices.element( matOffset.add( 12 ) ),
				batchMatrices.element( matOffset.add( 13 ) ),
				batchMatrices.element( matOffset.add( 14 ) ),
				batchMatrices.element( matOffset.add( 15 ) )
			);

			// Counter for pairs processed
			const pairCount = uint( 0 ).toVar();

			// Loop over triangles in this group
			// Using custom range loop: { start, end, type, condition, name }
			Loop( { start: int( 0 ), end: triCount.toInt(), type: 'int', condition: '<', name: 'triIdx' }, ( { triIdx } ) => {

				// Calculate global triangle index within batch
				const globalTriIdx = triOffset.add( triIdx.toUint() );

				// Read triangle indices (3 per triangle)
				const baseIdx = globalTriIdx.mul( 3 );
				const i0 = batchIndices.element( baseIdx );
				const i1 = batchIndices.element( baseIdx.add( 1 ) );
				const i2 = batchIndices.element( baseIdx.add( 2 ) );

				// Read local vertex positions
				const localV0 = vec3(
					batchPositions.element( i0.mul( 3 ) ),
					batchPositions.element( i0.mul( 3 ).add( 1 ) ),
					batchPositions.element( i0.mul( 3 ).add( 2 ) )
				);
				const localV1 = vec3(
					batchPositions.element( i1.mul( 3 ) ),
					batchPositions.element( i1.mul( 3 ).add( 1 ) ),
					batchPositions.element( i1.mul( 3 ).add( 2 ) )
				);
				const localV2 = vec3(
					batchPositions.element( i2.mul( 3 ) ),
					batchPositions.element( i2.mul( 3 ).add( 1 ) ),
					batchPositions.element( i2.mul( 3 ).add( 2 ) )
				);

				// Transform to world coordinates
				const v0 = matrix.mul( vec4( localV0, float( 1.0 ) ) ).xyz;
				const v1 = matrix.mul( vec4( localV1, float( 1.0 ) ) ).xyz;
				const v2 = matrix.mul( vec4( localV2, float( 1.0 ) ) ).xyz;

				// Calculate triangle normal for back-face culling
				const edge1 = v1.sub( v0 );
				const edge2 = v2.sub( v0 );
				const normal = cross( edge1, edge2 );
				// normal.y > 0 means triangle faces up (away from camera looking down)

				// Back-face culling: skip triangles that face down (away from camera looking down)
				// normal.y < 0 means triangle faces down (back face from top-down view)
				// TODO: Handle DoubleSide and BackSide materials, and inverted matrices
				If( normal.y.lessThan( 0 ), () => {

					Continue();

				} );

				// Calculate triangle Y bounds (for early culling)
				const highestTriangleY = max( v0.y, max( v1.y, v2.y ) );
				const lowestTriangleY = min( v0.y, min( v1.y, v2.y ) );

				// Loop over edges in this group
				Loop( { start: int( 0 ), end: edgeCount.toInt(), type: 'int', condition: '<', name: 'edgeIdx' }, ( { edgeIdx } ) => {

					// Calculate global edge index
					const globalEdgeIdx = edgeOffset.add( edgeIdx.toUint() );

					// Read edge (6 floats per edge: start xyz, end xyz)
					const edgeDataOffset = globalEdgeIdx.mul( 6 );
					const edgeStart = vec3(
						edgesData.element( edgeDataOffset ),
						edgesData.element( edgeDataOffset.add( 1 ) ),
						edgesData.element( edgeDataOffset.add( 2 ) )
					);
					const edgeEnd = vec3(
						edgesData.element( edgeDataOffset.add( 3 ) ),
						edgesData.element( edgeDataOffset.add( 4 ) ),
						edgesData.element( edgeDataOffset.add( 5 ) )
					);

					// Calculate edge Y bounds
					const lowestLineY = min( edgeStart.y, edgeEnd.y );

					// Y-bounds culling: skip if triangle is completely below the line
					// (triangle's highest Y is at or below line's lowest Y)
					If( highestTriangleY.lessThanEqual( lowestLineY ), () => {

						Continue();

					} );

					// Passed culling - count this pair
					pairCount.addAssign( 1 );

				} );

			} );

			// Write pair count to output
			testOutput.element( groupIdx ).assign( pairCount );

		} )().compute( batchGroupsList.length );

		// Execute on GPU
		await renderer.computeAsync( computeShader );

		// Read results back
		const resultBuffer = await renderer.getArrayBufferAsync( testOutput.value );
		const result = new Uint32Array( resultBuffer );

		// Log first few results and totals
		let totalPairs = 0;
		for ( let i = 0; i < batchGroupsList.length; i ++ ) {

			totalPairs += result[ i ];

		}

		console.log( `  Test output (first 5 groups - pair counts):` );
		for ( let i = 0; i < Math.min( 5, batchGroupsList.length ); i ++ ) {

			const g = batchGroupsList[ i ];
			const expected = g.edgeCount * g.triCount;
			console.log( `    Group ${i}: ${result[ i ]} pairs (expected ${expected} = ${g.edgeCount} edges × ${g.triCount} tris)` );

		}

		console.log( `  Total pairs processed: ${totalPairs}` );

	}

}
