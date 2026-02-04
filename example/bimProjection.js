import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import * as OBC from '@thatopen/components';
import { ProjectionGenerator, VisibilityCuller } from '..';
import {Logger} from '../src/utils/Logger.js';


const params = {
	displayModel: true,
	logging: true,
	displayDrawThroughProjection: false,
	includeIntersectionEdges: false,
	useWebGPU: true,
	rotate: () => {

		const randomQuaternion = new THREE.Quaternion();
		randomQuaternion.random();

		allMeshes.quaternion.copy(randomQuaternion);
		allMeshes.position.set(0, 0, 0);
		allMeshes.updateMatrixWorld(true);

	},
	regenerate: () => {

		task = updateEdges();

	},
};

const ANGLE_THRESHOLD = 50;
// let needsRender = false;
let gui;
let projection, drawThroughProjection;
let outputContainer;
let task = null;
Logger.enabled = params.logging;


const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const container = document.getElementById("container");

const world = worlds.create();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.OrthoPerspectiveCamera(components);

components.init();

world.scene.setup();
// world.camera.three.far = 10000;

world.scene.three.add(new THREE.AxesHelper());

outputContainer = document.getElementById('output');


// load model



// prettier-ignore
const githubUrl =
	"https://thatopen.github.io/engine_fragment/resources/worker.mjs";
const fetchedUrl = await fetch(githubUrl);
const workerBlob = await fetchedUrl.blob();
const workerFile = new File([workerBlob], "worker.mjs", {
	type: "text/javascript",
});
const workerUrl = URL.createObjectURL(workerFile);
const fragments = components.get(OBC.FragmentsManager);
fragments.init(workerUrl);

world.camera.controls.addEventListener("control", () =>
	fragments.core.update(true),
);

// Remove z fighting
fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
	if (!("isLodMaterial" in material && material.isLodMaterial)) {
		material.polygonOffset = true;
		material.polygonOffsetUnits = 1;
		material.polygonOffsetFactor = Math.random();
	}
});

async function loadModel(
	url,
	id = url,
	raw = false,
) {
	const fetched = await fetch(url);
	const buffer = await fetched.arrayBuffer();

	const model = await fragments.core.load(buffer, {
		modelId: id,
		camera: world.camera.three,
		raw,
	});

	world.scene.three.add(model.object);
	model.object.rotation.x = Math.PI / 4;
	model.object.rotation.y = Math.PI / 4;
	const now = performance.now();
	await fragments.core.update(true);
	const then = performance.now();
	console.log(`Time taken: ${then - now}ms`);

	return model;
}

const model = await loadModel("/frags/metal.frag");

// const clipper = components.get(OBC.Clipper);
// const planeId = clipper.createFromNormalAndCoplanarPoint(world, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0));
// const plane = clipper.list.get(planeId);

// projectedMeshes = new THREE.Group();
// world.scene.three.add(projectedMeshes);

const allMeshes = new THREE.Group();
// world.scene.three.add(allMeshes);
// allMeshes.rotation.x = Math.PI / 4;
// allMeshes.rotation.y = Math.PI / 4;
// allMeshes.rotation.z = Math.PI / 4;


const material = new THREE.MeshLambertMaterial({
	color: new THREE.Color("white"),
});

// Add picking meshes (deduplicating geometries to save memory)
const idsWithGeometry = await model.getItemsIdsWithGeometry();
const allMeshesData = await model.getItemsGeometry(idsWithGeometry);

const geometries = new Map();

for (const itemId in allMeshesData) {
	const meshData = allMeshesData[itemId];
	for (const geomData of meshData) {
		if (
			!geomData.positions ||
			!geomData.indices ||
			!geomData.transform ||
			!geomData.representationId
		) {
			continue;
		}

		const representationId = geomData.representationId;
		if (!geometries.has(representationId)) {
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute(
				"position",
				new THREE.Float32BufferAttribute(geomData.positions, 3),
			);
			geometry.setAttribute(
				"normal",
				new THREE.Float32BufferAttribute(geomData.normals, 3),
			);
			geometry.setIndex(Array.from(geomData.indices));
			geometries.set(representationId, geometry);
		}

		const geometry = geometries.get(representationId);

		const mesh = new THREE.Mesh(geometry, material);
		mesh.userData.localId = geomData.localId;
		mesh.applyMatrix4(geomData.transform);
		// TODO: Applying this matrix to allMeshes hurts the performance a lot
		// What if we processed geometries with no transformation at all? (by parts to prevent memory bloat)
		mesh.applyMatrix4(model.object.matrixWorld);
		mesh.updateWorldMatrix(true, true);
		allMeshes.add(mesh);
	}
}

// initialize BVHs
allMeshes.traverse(c => {

	if (c.geometry && !c.geometry.boundsTree) {

		const elCount = c.geometry.index ? c.geometry.index.count : c.geometry.attributes.position.count;
		c.geometry.groups.forEach(group => {

			if (group.count === Infinity) {

				group.count = elCount - group.start;

			}

		});

		c.geometry.boundsTree = new MeshBVH(c.geometry, { maxLeafSize: 1, strategy: SAH });

	}

});

// Compute bounding box of allMeshes
allMeshes.updateWorldMatrix(true, true);
const box = new THREE.Box3();
allMeshes.traverse((child) => {
	if (child.isMesh && child.geometry) {
		child.updateWorldMatrix(false, false);
		box.expandByObject(child, true);
	}
});

const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());

// Create white ground plane on top of the bounding box (plus 3m offset)
const planeHeight = box.max.y + 3;
const planeSize = Math.max(size.x, size.z) * 1.5;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	transparent: true,
	opacity: 0.8,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
plane.position.set(center.x, planeHeight, center.z);
world.scene.three.add(plane);

// create projection display mesh
// Position projection at plane height + 1 cm offset
const projectionmaterial = new THREE.LineBasicMaterial({ color: "black", transparent: true });
projection = new THREE.LineSegments(new THREE.BufferGeometry(), projectionmaterial);
projection.position.y = planeHeight + 0.01;

drawThroughProjection = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xcacaca, depthTest: false }));
drawThroughProjection.position.y = planeHeight + 0.01;
drawThroughProjection.renderOrder = - 1;
world.scene.three.add(projection, drawThroughProjection);

gui = new GUI();
gui.add(params, 'includeIntersectionEdges');
gui.add(params, 'useWebGPU');
gui.add(params, 'logging').onChange(() => {
	Logger.enabled = params.logging;
});
gui.add(params, 'rotate');
gui.add(params, 'regenerate');

world.renderer.onBeforeUpdate.add(() => {

	if (task) {

		const res = task.next();
		if (res.done) {

			task = null;

		}

	}

	// projectedMeshes.visible = params.displayModel;
	drawThroughProjection.visible = params.displayDrawThroughProjection;

});


function* updateEdges(runTime = 30) {

	outputContainer.innerText = 'Generating...';


	// const previous = [...projectedMeshes.children];
	// for (const child of previous) {
	// 	projectedMeshes.remove(child);
	// 	child.geometry = null;
	// }

	// const tempBbox = new THREE.Box3();

	// for (const child of allMeshes.children) {
		
	// 	// INSERT_YOUR_CODE
	// 	// Compute the bounding box in world space for this mesh
	// 	// tempBbox.setFromObject(child);

	// 	// Assume the clipping plane is horizontal and defined by params.clippingHeight
	// 	// Only add meshes whose bbox.min.y is below the clipping height, i.e., at least partially under
	// 	// if (tempBbox.min.y > plane.three.constant) {
	// 	// 	continue;
	// 	// }

	// 	const newMesh = new THREE.Mesh(child.geometry, projectedMaterial);
	// 	newMesh.userData.itemId = child.userData.itemId;
	// 	newMesh.applyMatrix4(child.matrixWorld);

	// 	projectedMeshes.add(newMesh);
	// }

	// dispose the geometry
	projection.geometry.dispose();
	drawThroughProjection.geometry.dispose();

	// initialize an empty geometry
	projection.geometry = new THREE.BufferGeometry();
	drawThroughProjection.geometry = new THREE.BufferGeometry();

	const timeStart = window.performance.now();
	const generator = new ProjectionGenerator();
	generator.iterationTime = runTime;
	generator.angleThreshold = ANGLE_THRESHOLD;
	generator.includeIntersectionEdges = params.includeIntersectionEdges;
	generator.useWebGPU = params.useWebGPU;
	console.log(generator.includeIntersectionEdges);

	const collection = yield* generator.generate(allMeshes, {
		visibilityCuller: new VisibilityCuller(world.renderer.three, { pixelsPerMeter: 0.02 }),
		onProgress: (msg, tot, edges) => {

			outputContainer.innerText = msg;
			if (tot) outputContainer.innerText += ' ' + (100 * tot).toFixed(1) + '%';

			if (edges) {

				projection.geometry.dispose();
				projection.geometry = edges.getVisibleLineGeometry();

			}

		},
	});
	drawThroughProjection.geometry.dispose();
	drawThroughProjection.geometry = collection.getHiddenLineGeometry();

	projection.geometry.dispose();
	projection.geometry = collection.getVisibleLineGeometry();
	const geometry = projection.geometry;
	const trimTime = window.performance.now() - timeStart;

	projection.geometry.dispose();
	projection.geometry = geometry;
	outputContainer.innerText = `Generation time: ${trimTime.toFixed(2)}ms`;

}

// task = updateEdges();

