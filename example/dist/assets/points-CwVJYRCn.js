import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-lAmZ_l45.js";
import { i as instancedArray, F as Fn, c as instanceIndex, u as uniform, D as vec2, f as float, af as PointsNodeMaterial, a0 as color, W as WebGPURenderer } from "./three.tsl-CltecYTk.js";
import { b as Vector2, j as OrthographicCamera, a4 as Scene, m as BufferGeometry, n as BufferAttribute, l as Points } from "./three.core-DwEPwZOL.js";
import "./three.module-CudnH-mZ.js";
let camera, scene, renderer;
let computeNode;
const pointerVector = new Vector2(-10, -10);
const scaleVector = new Vector2(1, 1);
init();
async function init() {
  camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;
  scene = new Scene();
  const particlesCount = 3e5;
  const particleArray = instancedArray(particlesCount, "vec2");
  const velocityArray = instancedArray(particlesCount, "vec2");
  const computeShaderFn = Fn(() => {
    const particle = particleArray.element(instanceIndex);
    const velocity = velocityArray.element(instanceIndex);
    const pointer = uniform(pointerVector);
    const limit = uniform(scaleVector);
    const position = particle.add(velocity).toVar();
    velocity.x = position.x.abs().greaterThanEqual(limit.x).select(velocity.x.negate(), velocity.x);
    velocity.y = position.y.abs().greaterThanEqual(limit.y).select(velocity.y.negate(), velocity.y);
    position.assign(position.min(limit).max(limit.negate()));
    const pointerSize = 0.1;
    const distanceFromPointer = pointer.sub(position).length();
    particle.assign(distanceFromPointer.lessThanEqual(pointerSize).select(vec2(), position));
  });
  computeNode = computeShaderFn().compute(particlesCount).setName("Update Particles");
  computeNode.onInit(({ renderer: renderer2 }) => {
    const precomputeShaderNode = Fn(() => {
      const particleIndex = float(instanceIndex);
      const randomAngle = particleIndex.mul(5e-3).mul(Math.PI * 2);
      const randomSpeed = particleIndex.mul(1e-8).add(1e-7);
      const velX = randomAngle.sin().mul(randomSpeed);
      const velY = randomAngle.cos().mul(randomSpeed);
      const velocity = velocityArray.element(instanceIndex);
      velocity.xy = vec2(velX, velY);
    });
    renderer2.compute(precomputeShaderNode().compute(particlesCount));
  });
  const pointsGeometry = new BufferGeometry();
  pointsGeometry.setAttribute("position", new BufferAttribute(new Float32Array(3), 3));
  pointsGeometry.drawRange.count = 1;
  const pointsMaterial = new PointsNodeMaterial();
  pointsMaterial.colorNode = particleArray.element(instanceIndex).add(color(16777215));
  pointsMaterial.positionNode = particleArray.element(instanceIndex);
  const mesh = new Points(pointsGeometry, pointsMaterial);
  mesh.count = particlesCount;
  scene.add(mesh);
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  await renderer.init();
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
  const gui = renderer.inspector.createParameters("Settings");
  gui.add(scaleVector, "x", 0, 1, 0.01);
  gui.add(scaleVector, "y", 0, 1, 0.01);
}
function onWindowResize() {
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onMouseMove(event) {
  const x = event.clientX;
  const y = event.clientY;
  const width = window.innerWidth;
  const height = window.innerHeight;
  pointerVector.set(
    (x / width - 0.5) * 2,
    (-y / height + 0.5) * 2
  );
}
function animate() {
  renderer.compute(computeNode);
  renderer.render(scene, camera);
}
//# sourceMappingURL=points-CwVJYRCn.js.map
