import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-lAmZ_l45.js";
import { u as uniform, a as vec4, F as Fn, Z as StorageBufferAttribute, _ as storage, c as instanceIndex, I as If, $ as objectWorldMatrix, z as screenUV, a0 as color, a1 as MeshNormalNodeMaterial, T as attribute, W as WebGPURenderer } from "./three.tsl-CltecYTk.js";
import { G as GLTFLoader } from "./GLTFLoader-BkJNM6c3.js";
import { O as OrbitControls } from "./OrbitControls-BsoZaNxp.js";
import { h as PerspectiveCamera, a4 as Scene, i as Raycaster, b as Vector2 } from "./three.core-DwEPwZOL.js";
import "./three.module-CudnH-mZ.js";
import "./BufferGeometryUtils-MCjIhRez.js";
let camera, scene, renderer;
let raycaster, pointer;
let mesh;
const pointerPosition = uniform(vec4(0));
const elasticity = uniform(0.4);
const damping = uniform(0.94);
const brushSize = uniform(0.25);
const brushStrength = uniform(0.22);
init();
const jelly = Fn(({ renderer: renderer2, geometry, object }) => {
  const count = geometry.attributes.position.count;
  const positionBaseAttribute = geometry.attributes.position;
  const positionStorageBufferAttribute = new StorageBufferAttribute(count, 3);
  const speedBufferAttribute = new StorageBufferAttribute(count, 3);
  geometry.setAttribute("storagePosition", positionStorageBufferAttribute);
  const positionAttribute = storage(positionBaseAttribute, "vec3", count);
  const positionStorageAttribute = storage(positionStorageBufferAttribute, "vec3", count);
  const speedAttribute = storage(speedBufferAttribute, "vec3", count);
  const basePosition = positionAttribute.element(instanceIndex);
  const currentPosition = positionStorageAttribute.element(instanceIndex);
  const currentSpeed = speedAttribute.element(instanceIndex);
  const computeInit = Fn(() => {
    currentPosition.assign(basePosition);
  })().compute(count);
  const computeUpdate = Fn(() => {
    If(pointerPosition.w.equal(1), () => {
      const worldPosition = objectWorldMatrix(object).mul(currentPosition);
      const dist = worldPosition.distance(pointerPosition.xyz);
      const direction = pointerPosition.xyz.sub(worldPosition).normalize();
      const power = brushSize.sub(dist).max(0).mul(brushStrength);
      currentPosition.addAssign(direction.mul(power));
    });
    const distance = basePosition.distance(currentPosition);
    const force = elasticity.mul(distance).mul(basePosition.sub(currentPosition));
    currentSpeed.addAssign(force);
    currentSpeed.mulAssign(damping);
    currentPosition.addAssign(currentSpeed);
  })().compute(count).setName("Update Jelly");
  computeUpdate.onInit(() => renderer2.compute(computeInit));
  return computeUpdate;
});
function init() {
  camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 0, 1);
  scene = new Scene();
  raycaster = new Raycaster();
  pointer = new Vector2();
  const bgColor = screenUV.y.mix(color(10455031), color(15912397));
  const bgVignette = screenUV.distance(0.5).remapClamp(0.3, 0.8).oneMinus();
  const bgIntensity = 4;
  scene.backgroundNode = bgColor.mul(bgVignette.mul(color(10981366).mul(bgIntensity)));
  new GLTFLoader().load("models/gltf/LeePerrySmith/LeePerrySmith.glb", function(gltf) {
    const material = new MeshNormalNodeMaterial();
    material.geometryNode = jelly();
    material.positionNode = attribute("storagePosition");
    mesh = gltf.scene.children[0];
    mesh.scale.setScalar(0.1);
    mesh.material = material;
    scene.add(mesh);
  });
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.7;
  controls.maxDistance = 2;
  const gui = renderer.inspector.createParameters("Settings");
  gui.add(elasticity, "value", 0, 0.5).name("elasticity");
  gui.add(damping, "value", 0.9, 0.98).name("damping");
  gui.add(brushSize, "value", 0.1, 0.5).name("brush size");
  gui.add(brushStrength, "value", 0.1, 0.3).name("brush strength");
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("pointermove", onPointerMove);
}
function onPointerMove(event) {
  pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(scene);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    pointerPosition.value.copy(intersect.point);
    pointerPosition.value.w = 1;
  } else {
    pointerPosition.value.w = 0;
  }
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
async function animate() {
  renderer.render(scene, camera);
}
//# sourceMappingURL=geometry-DspyLQ2-.js.map
