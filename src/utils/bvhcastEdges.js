import { isLineTriangleEdge } from './triangleLineUtils.js';
import { trimToBeneathTriPlane } from './trimToBeneathTriPlane.js';
import { getProjectedLineOverlap } from './getProjectedLineOverlap.js';
import { appendOverlapRange } from './getProjectedOverlaps.js';
import { BackSide, DoubleSide, Line3, Vector3 } from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';

const UP_VECTOR = new Vector3( 0, 1, 0 );
const DIST_THRESHOLD = 1e-10;
const _beneathLine = /* @__PURE__ */ new Line3();
const _overlapLine = /* @__PURE__ */ new Line3();
const _tri = /* @__PURE__ */ new ExtendedTriangle();
_tri.update = () => {

	// override the "update" function so we only calculate the piece we need
	_tri.plane.setFromCoplanarPoints( ..._tri.points );

};

export function bvhcastEdges( edgesBvh, bvh, mesh, hiddenOverlapMap, stats = null ) {

	const { geometry, matrixWorld, material } = mesh;
	const side = material.side;
	const inverted = matrixWorld.determinant() < 0;
	const edges = edgesBvh.lines;

	edgesBvh.bvhcast( bvh, matrixWorld, {

		intersectsRanges: ( edgeOffset, edgeCount, meshOffset, meshCount ) => {

			if ( stats ) stats.candidates += edgeCount * meshCount;

			for ( let i = meshOffset, l = meshCount + meshOffset; i < l; i ++ ) {

				let i0 = 3 * i + 0;
				let i1 = 3 * i + 1;
				let i2 = 3 * i + 2;
				if ( geometry.index ) {

					i0 = geometry.index.getX( i0 );
					i1 = geometry.index.getX( i1 );
					i2 = geometry.index.getX( i2 );

				}

				// Transform mesh triangle to world space
				const { a, b, c } = _tri;
				a.fromBufferAttribute( geometry.attributes.position, i0 ).applyMatrix4( matrixWorld );
				b.fromBufferAttribute( geometry.attributes.position, i1 ).applyMatrix4( matrixWorld );
				c.fromBufferAttribute( geometry.attributes.position, i2 ).applyMatrix4( matrixWorld );
				_tri.needsUpdate = true;
				_tri.update();

				// back face culling
				if ( side !== DoubleSide ) {

					const faceUp = _tri.plane.normal.dot( UP_VECTOR ) !== inverted;
					if ( faceUp === ( side === BackSide ) ) {

						if ( stats ) stats.backFaceCulled += edgeCount;
						continue;

					}

				}

				const highestTriangleY = Math.max( a.y, b.y, c.y );
				const lowestTriangleY = Math.min( a.y, b.y, c.y );

				for ( let e = edgeOffset, le = edgeCount + edgeOffset; e < le; e ++ ) {

					const _line = edges[ e ];

					// Calculate edge and triangle bounds
					const lowestLineY = Math.min( _line.start.y, _line.end.y );
					const highestLineY = Math.max( _line.start.y, _line.end.y );

					// Skip if triangle is completely below the line
					if ( highestTriangleY <= lowestLineY ) {

						if ( stats ) stats.yBoundsCulled ++;
						continue;

					}

					// Oriented XZ overlap test: project triangle onto edge's
					// local axes (direction + perpendicular) for a tight 2D check.
					// dir = normalized edge direction in XZ
					// perp = 90° rotation of dir: (-dz, dx)
					const dx = _line.end.x - _line.start.x;
					const dz = _line.end.z - _line.start.z;
					const lenSq = dx * dx + dz * dz;

					if ( lenSq > 1e-20 ) {

						const invLen = 1 / Math.sqrt( lenSq );
						const dirX = dx * invLen;
						const dirZ = dz * invLen;
						const perpX = - dirZ;
						const perpZ = dirX;

						// Project triangle vertices onto dir axis (relative to edge start)
						const oax = a.x - _line.start.x;
						const oaz = a.z - _line.start.z;
						const obx = b.x - _line.start.x;
						const obz = b.z - _line.start.z;
						const ocx = c.x - _line.start.x;
						const ocz = c.z - _line.start.z;

						const da = oax * dirX + oaz * dirZ;
						const db = obx * dirX + obz * dirZ;
						const dc = ocx * dirX + ocz * dirZ;

						// Edge spans [0, len] on the dir axis
						const len = Math.sqrt( lenSq );
						const triMinDir = Math.min( da, db, dc );
						const triMaxDir = Math.max( da, db, dc );

						if ( triMaxDir < 0 || triMinDir > len ) {

							if ( stats ) stats.xzBoundsCulled ++;
							continue;

						}

						// Project triangle vertices onto perp axis
						// Edge has zero width on perp, so it sits at perp=0
						// Triangle must straddle perp=0 (min <= 0 && max >= 0)
						const pa = oax * perpX + oaz * perpZ;
						const pb = obx * perpX + obz * perpZ;
						const pc = ocx * perpX + ocz * perpZ;

						const triMinPerp = Math.min( pa, pb, pc );
						const triMaxPerp = Math.max( pa, pb, pc );

						if ( triMinPerp > 0 || triMaxPerp < 0 ) {

							if ( stats ) stats.xzBoundsCulled ++;
							continue;

						}

					}

					// Skip if this line lies on a triangle edge
					if ( isLineTriangleEdge( _tri, _line ) ) {

						if ( stats ) stats.triangleEdgeCulled ++;
						continue;

					}

					// Retrieve the portion of line that is below the triangle plane
					if ( highestLineY < lowestTriangleY ) {

						_beneathLine.copy( _line );

					} else if ( ! trimToBeneathTriPlane( _tri, _line, _beneathLine ) ) {

						if ( stats ) stats.planeTrimCulled ++;
						continue;

					}

					// Cull overly small edges
					if ( _beneathLine.distance() < DIST_THRESHOLD ) {

						if ( stats ) stats.distThresholdCulled ++;
						continue;

					}

					// Calculate projected overlap and store in hiddenOverlapMap
					if ( getProjectedLineOverlap( _beneathLine, _tri, _overlapLine ) ) {

						if ( stats ) stats.used ++;
						appendOverlapRange( _line, _overlapLine, hiddenOverlapMap[ e ] );

					} else {

						if ( stats ) stats.noOverlapCulled ++;

					}

				}

			}

		},

	} );

}
