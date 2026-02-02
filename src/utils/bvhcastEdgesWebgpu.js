
import * as THREEWEBGPU from 'three/webgpu';
import { float, Fn, If, Loop, instancedArray, instanceIndex, uint, int, vec3, vec4, mat4, Break, Continue, max, min, cross, normalize, dot, abs, select, mix } from 'three/tsl';

const EPSILON = 1e-10; // Threshold for floating point comparisons
const AREA_EPSILON = 1e-16; // Threshold for degenerate triangle detection
const DIST_EPSILON = 1e-16; // Threshold for distance comparisons in overlap calculation

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

				// Check for degenerate triangle (area too small)
				// Area = 0.5 * |cross(edge1, edge2)|, so |cross|^2 < (2*AREA_EPSILON)^2 means degenerate
				const normalLengthSq = normal.dot( normal );
				If( normalLengthSq.lessThan( float( 4 * AREA_EPSILON * AREA_EPSILON ) ), () => {

					Continue();

				} );

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
					const highestLineY = max( edgeStart.y, edgeEnd.y );

					// Y-bounds culling: skip if triangle is completely below the line
					// (triangle's highest Y is at or below line's lowest Y)
					If( highestTriangleY.lessThanEqual( lowestLineY ), () => {

						Continue();

					} );

					// Fast path: if the entire line is below the triangle's lowest point,
					// no trimming needed - the whole line is "beneath" the triangle plane
					const lineFullyBelow = highestLineY.lessThan( lowestTriangleY );

					// Calculate triangle plane (normal already computed, need constant d)
					// Plane equation: normal · p + d = 0, so d = -normal · v0
					const planeNormal = normalize( normal );
					const planeD = planeNormal.dot( v0 ).negate();

					// Ensure plane faces up (for consistent "below" definition)
					// If normal.y < 0, flip the plane
					const facingDown = planeNormal.y.lessThan( 0 );
					const adjustedNormal = select( facingDown, planeNormal.negate(), planeNormal );
					const adjustedD = select( facingDown, planeD.negate(), planeD );

					// Calculate signed distances from line endpoints to plane
					// distance = normal · point + d (positive = above, negative = below)
					const startDist = adjustedNormal.dot( edgeStart ).add( adjustedD );
					const endDist = adjustedNormal.dot( edgeEnd ).add( adjustedD );

					// Check positions relative to plane
					const isStartBelow = startDist.lessThan( float( EPSILON ).negate() );
					const isEndBelow = endDist.lessThan( float( EPSILON ).negate() );
					const bothAbove = isStartBelow.not().and( isEndBelow.not() );
					const bothBelow = isStartBelow.and( isEndBelow );

					// Skip if both endpoints are above the plane (or on it)
					If( bothAbove, () => {

						Continue();

					} );

					// Determine the trimmed line segment (portion below the plane)
					// If both below OR line fully below triangle's Y-range, use original line
					// Otherwise, find intersection and clip

					// Calculate intersection parameter t where line crosses plane
					// t = -startDist / (endDist - startDist)
					const denominator = endDist.sub( startDist );
					const t = startDist.negate().div( denominator );

					// Calculate intersection point
					const intersectionPoint = mix( edgeStart, edgeEnd, t );

					// Determine trimmed line endpoints
					// If start is below, keep start; otherwise use intersection
					// If end is below, keep end; otherwise use intersection
					const trimmedStart = vec3(
						select( isStartBelow, edgeStart.x, intersectionPoint.x ),
						select( isStartBelow, edgeStart.y, intersectionPoint.y ),
						select( isStartBelow, edgeStart.z, intersectionPoint.z )
					);
					const trimmedEnd = vec3(
						select( isEndBelow, edgeEnd.x, intersectionPoint.x ),
						select( isEndBelow, edgeEnd.y, intersectionPoint.y ),
						select( isEndBelow, edgeEnd.z, intersectionPoint.z )
					);

					// Skip if trimmed line is degenerate (too short)
					const trimmedDelta = trimmedEnd.sub( trimmedStart );
					const trimmedLengthSq = trimmedDelta.dot( trimmedDelta );
					If( trimmedLengthSq.lessThan( float( EPSILON ) ), () => {

						Continue();

					} );

					// Check if line is a triangle edge (isLineTriangleEdge)
					// If line start and end both match triangle vertices, skip it (self-shadowing)
					const startToV0 = edgeStart.sub( v0 );
					const startToV1 = edgeStart.sub( v1 );
					const startToV2 = edgeStart.sub( v2 );
					const endToV0 = edgeEnd.sub( v0 );
					const endToV1 = edgeEnd.sub( v1 );
					const endToV2 = edgeEnd.sub( v2 );

					const startMatchesV0 = startToV0.dot( startToV0 ).lessThanEqual( float( EPSILON ) );
					const startMatchesV1 = startToV1.dot( startToV1 ).lessThanEqual( float( EPSILON ) );
					const startMatchesV2 = startToV2.dot( startToV2 ).lessThanEqual( float( EPSILON ) );
					const endMatchesV0 = endToV0.dot( endToV0 ).lessThanEqual( float( EPSILON ) );
					const endMatchesV1 = endToV1.dot( endToV1 ).lessThanEqual( float( EPSILON ) );
					const endMatchesV2 = endToV2.dot( endToV2 ).lessThanEqual( float( EPSILON ) );

					const startMatchesAny = startMatchesV0.or( startMatchesV1 ).or( startMatchesV2 );
					const endMatchesAny = endMatchesV0.or( endMatchesV1 ).or( endMatchesV2 );
					const isTriangleEdge = startMatchesAny.and( endMatchesAny );

					If( isTriangleEdge, () => {

						Continue();

					} );

					// ============================================
					// getProjectedLineOverlap - project to Y=0 and find overlap
					// ============================================

					// Flatten triangle and line to Y=0
					const flatV0 = vec3( v0.x, float( 0 ), v0.z );
					const flatV1 = vec3( v1.x, float( 0 ), v1.z );
					const flatV2 = vec3( v2.x, float( 0 ), v2.z );
					const flatLineStart = vec3( trimmedStart.x, float( 0 ), trimmedStart.z );
					const flatLineEnd = vec3( trimmedEnd.x, float( 0 ), trimmedEnd.z );

					// Check if flattened triangle is degenerate
					const flatEdge1 = flatV1.sub( flatV0 );
					const flatEdge2 = flatV2.sub( flatV0 );
					const flatNormal = cross( flatEdge1, flatEdge2 );
					const flatAreaSq = flatNormal.dot( flatNormal );
					If( flatAreaSq.lessThanEqual( float( 4 * AREA_EPSILON * AREA_EPSILON ) ), () => {

						Continue();

					} );

					// Calculate line direction and length
					const flatLineDelta = flatLineEnd.sub( flatLineStart );
					const flatLineDistSq = flatLineDelta.dot( flatLineDelta );
					If( flatLineDistSq.lessThan( float( EPSILON ) ), () => {

						Continue();

					} );
					const flatLineDist = flatLineDistSq.sqrt();
					const lineDir = flatLineDelta.div( flatLineDist );

					// Create orthogonal plane along the line
					// ortho = lineDir × flatNormal (normalized)
					// For Y=0 projection, flatNormal is (0, ±area, 0), so cross simplifies
					const flatNormalNorm = normalize( flatNormal );
					const ortho = cross( lineDir, flatNormalNorm );
					// orthoPlane: normal=ortho, passes through flatLineStart
					// distance to point p = ortho · (p - flatLineStart)

					// Find triangle-plane intersections (up to 2 points)
					// We'll track intersections using variables
					const triLineStartX = float( 0 ).toVar();
					const triLineStartZ = float( 0 ).toVar();
					const triLineEndX = float( 0 ).toVar();
					const triLineEndZ = float( 0 ).toVar();
					const intersectCount = uint( 0 ).toVar();

					// Helper: check edge p1->p2 intersection with ortho plane
					// Process edge 0: flatV0 -> flatV1
					const d0_e0 = ortho.dot( flatV0.sub( flatLineStart ) );
					const d1_e0 = ortho.dot( flatV1.sub( flatLineStart ) );
					const onPlane0_e0 = abs( d0_e0 ).lessThan( float( DIST_EPSILON ) );
					const onPlane1_e0 = abs( d1_e0 ).lessThan( float( DIST_EPSILON ) );
					const crosses_e0 = onPlane0_e0.not().and( onPlane1_e0.not() ).and( d0_e0.mul( d1_e0 ).lessThan( 0 ) );

					// Edge 0 intersection
					If( crosses_e0, () => {

						const t_e0 = d0_e0.div( d0_e0.sub( d1_e0 ) );
						const ix = mix( flatV0.x, flatV1.x, t_e0 );
						const iz = mix( flatV0.z, flatV1.z, t_e0 );
						If( intersectCount.equal( 0 ), () => {

							triLineStartX.assign( ix );
							triLineStartZ.assign( iz );

						} ).Else( () => {

							triLineEndX.assign( ix );
							triLineEndZ.assign( iz );

						} );
						intersectCount.addAssign( 1 );

					} ).ElseIf( onPlane0_e0, () => {

						If( intersectCount.equal( 0 ), () => {

							triLineStartX.assign( flatV0.x );
							triLineStartZ.assign( flatV0.z );

						} ).Else( () => {

							triLineEndX.assign( flatV0.x );
							triLineEndZ.assign( flatV0.z );

						} );
						intersectCount.addAssign( 1 );

					} );

					// Process edge 1: flatV1 -> flatV2
					const d0_e1 = d1_e0; // reuse
					const d1_e1 = ortho.dot( flatV2.sub( flatLineStart ) );
					const onPlane0_e1 = onPlane1_e0; // reuse
					const onPlane1_e1 = abs( d1_e1 ).lessThan( float( DIST_EPSILON ) );
					const crosses_e1 = onPlane0_e1.not().and( onPlane1_e1.not() ).and( d0_e1.mul( d1_e1 ).lessThan( 0 ) );

					If( intersectCount.lessThan( 2 ), () => {

						If( crosses_e1, () => {

							const t_e1 = d0_e1.div( d0_e1.sub( d1_e1 ) );
							const ix = mix( flatV1.x, flatV2.x, t_e1 );
							const iz = mix( flatV1.z, flatV2.z, t_e1 );
							If( intersectCount.equal( 0 ), () => {

								triLineStartX.assign( ix );
								triLineStartZ.assign( iz );

							} ).Else( () => {

								triLineEndX.assign( ix );
								triLineEndZ.assign( iz );

							} );
							intersectCount.addAssign( 1 );

						} ).ElseIf( onPlane0_e1.and( crosses_e0.not() ).and( onPlane0_e0.not() ), () => {

							// V1 is on plane and wasn't counted from edge 0
							If( intersectCount.equal( 0 ), () => {

								triLineStartX.assign( flatV1.x );
								triLineStartZ.assign( flatV1.z );

							} ).Else( () => {

								triLineEndX.assign( flatV1.x );
								triLineEndZ.assign( flatV1.z );

							} );
							intersectCount.addAssign( 1 );

						} );

					} );

					// Process edge 2: flatV2 -> flatV0
					const d0_e2 = d1_e1; // reuse
					const d1_e2 = d0_e0; // reuse
					const onPlane0_e2 = onPlane1_e1; // reuse
					const onPlane1_e2 = onPlane0_e0; // reuse
					const crosses_e2 = onPlane0_e2.not().and( onPlane1_e2.not() ).and( d0_e2.mul( d1_e2 ).lessThan( 0 ) );

					If( intersectCount.lessThan( 2 ), () => {

						If( crosses_e2, () => {

							const t_e2 = d0_e2.div( d0_e2.sub( d1_e2 ) );
							const ix = mix( flatV2.x, flatV0.x, t_e2 );
							const iz = mix( flatV2.z, flatV0.z, t_e2 );
							If( intersectCount.equal( 0 ), () => {

								triLineStartX.assign( ix );
								triLineStartZ.assign( iz );

							} ).Else( () => {

								triLineEndX.assign( ix );
								triLineEndZ.assign( iz );

							} );
							intersectCount.addAssign( 1 );

						} ).ElseIf( onPlane0_e2.and( crosses_e1.not() ).and( onPlane0_e1.not() ), () => {

							// V2 is on plane and wasn't counted
							If( intersectCount.equal( 0 ), () => {

								triLineStartX.assign( flatV2.x );
								triLineStartZ.assign( flatV2.z );

							} ).Else( () => {

								triLineEndX.assign( flatV2.x );
								triLineEndZ.assign( flatV2.z );

							} );
							intersectCount.addAssign( 1 );

						} );

					} );

					// Need exactly 2 intersections to have an overlap
					If( intersectCount.notEqual( 2 ), () => {

						Continue();

					} );

					// Calculate overlap along the line direction
					const triLineStart2D = vec3( triLineStartX, float( 0 ), triLineStartZ );
					const triLineEnd2D = vec3( triLineEndX, float( 0 ), triLineEndZ );

					// Project triLine endpoints onto line direction
					const triDir = triLineEnd2D.sub( triLineStart2D );
					const triDirDot = triDir.dot( lineDir );

					// Swap if pointing opposite direction
					const triS = vec3( triLineStartX, float( 0 ), triLineStartZ ).toVar();
					const triE = vec3( triLineEndX, float( 0 ), triLineEndZ ).toVar();
					If( triDirDot.lessThan( 0 ), () => {

						const tmpX = triLineStartX;
						const tmpZ = triLineStartZ;
						triS.x.assign( triLineEndX );
						triS.z.assign( triLineEndZ );
						triE.x.assign( tmpX );
						triE.z.assign( tmpZ );

					} );

					// Calculate 1D positions along the line
					const s1 = float( 0 ); // line start at 0
					const e1 = flatLineDist; // line end at distance
					const s2 = triS.sub( flatLineStart ).dot( lineDir );
					const e2 = triE.sub( flatLineStart ).dot( lineDir );

					// Check for separation
					const separated = e1.lessThanEqual( s2 ).or( e2.lessThanEqual( s1 ) );
					If( separated, () => {

						Continue();

					} );

					// Calculate overlap range (normalized 0-1 along original line)
					const overlapStart = max( s1, s2 ).div( flatLineDist );
					const overlapEnd = min( e1, e2 ).div( flatLineDist );

					// We have a valid overlap! Count it
					// TODO: Store the overlap range (overlapStart, overlapEnd) for this edge
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
