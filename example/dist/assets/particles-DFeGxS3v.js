import "./modulepreload-polyfill-DaKOjhqt.js";
import "./modulepreload-polyfill-DaKOjhqt-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-DrFBWtkP-DKZg1P_w.js";
import { u as uniform, i as instancedArray, f as float, F as Fn, c as instanceIndex, U as hash, V as vec3, I as If, S as SpriteNodeMaterial, X as uv, Y as shapeCircle, W as WebGPURenderer } from "./three.tsl-CucFAqAO-B9znDNZK.js";
import { O as OrbitControls } from "./OrbitControls-BwrKLbo_-CIX7YvzQ.js";
import { V as Vector3, v as PerspectiveCamera, o as Scene, aY as Sprite, aZ as GridHelper, W as PlaneGeometry, g as Mesh, r as MeshBasicMaterial, d as Raycaster, c as Vector2, ag as TOUCH } from "./three.core-CntQ0PPt-CIuLIuvN.js";
import "./three.module-Jt-9Ru2o-vl5c8U10.js";
const particleCount = 2e5;
const gravity = uniform(-98e-5);
const bounce = uniform(0.8);
const friction = uniform(0.99);
const size = uniform(0.12);
const clickPosition = uniform(new Vector3());
let camera, scene, renderer;
let controls;
let computeParticles;
let isOrbitControlsActive;
init();
async function init() {
  const { innerWidth, innerHeight } = window;
  camera = new PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1e3);
  camera.position.set(0, 5, 20);
  scene = new Scene();
  const positions = instancedArray(particleCount, "vec3");
  const velocities = instancedArray(particleCount, "vec3");
  const colors = instancedArray(particleCount, "vec3");
  const separation = 0.2;
  const amount = Math.sqrt(particleCount);
  const offset = float(amount / 2);
  const computeInit = Fn(() => {
    const position = positions.element(instanceIndex);
    const color = colors.element(instanceIndex);
    const x = instanceIndex.mod(amount);
    const z = instanceIndex.div(amount);
    position.x = offset.sub(x).mul(separation);
    position.z = offset.sub(z).mul(separation);
    color.x = hash(instanceIndex);
    color.y = hash(instanceIndex.add(2));
  })().compute(particleCount).setName("Init Particles");
  const computeUpdate = Fn(() => {
    const position = positions.element(instanceIndex);
    const velocity = velocities.element(instanceIndex);
    velocity.addAssign(vec3(0, gravity, 0));
    position.addAssign(velocity);
    velocity.mulAssign(friction);
    If(position.y.lessThan(0), () => {
      position.y = 0;
      velocity.y = velocity.y.negate().mul(bounce);
      velocity.x = velocity.x.mul(0.9);
      velocity.z = velocity.z.mul(0.9);
    });
  });
  computeParticles = computeUpdate().compute(particleCount).setName("Update Particles");
  const material = new SpriteNodeMaterial();
  material.colorNode = uv().mul(colors.element(instanceIndex));
  material.positionNode = positions.toAttribute();
  material.scaleNode = size;
  material.opacityNode = shapeCircle();
  material.alphaToCoverage = true;
  material.transparent = true;
  const particles = new Sprite(material);
  particles.count = particleCount;
  particles.frustumCulled = false;
  scene.add(particles);
  const helper = new GridHelper(90, 45, 3158064, 3158064);
  scene.add(helper);
  const geometry = new PlaneGeometry(200, 200);
  geometry.rotateX(-Math.PI / 2);
  const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
  scene.add(plane);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  await renderer.init();
  renderer.compute(computeInit);
  const computeHit = Fn(() => {
    const position = positions.element(instanceIndex);
    const velocity = velocities.element(instanceIndex);
    const dist = position.distance(clickPosition);
    const direction = position.sub(clickPosition).normalize();
    const distArea = float(3).sub(dist).max(0);
    const power = distArea.mul(0.01);
    const relativePower = power.mul(hash(instanceIndex).mul(1.5).add(0.5));
    velocity.assign(velocity.add(direction.mul(relativePower)));
  })().compute(particleCount).setName("Hit Particles");
  function onMove(event) {
    if (isOrbitControlsActive) return;
    pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(plane, false);
    if (intersects.length > 0) {
      const { point } = intersects[0];
      clickPosition.value.copy(point);
      clickPosition.value.y = -1;
      renderer.compute(computeHit);
    }
  }
  renderer.domElement.addEventListener("pointermove", onMove);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 5;
  controls.maxDistance = 200;
  controls.target.set(0, -8, 0);
  controls.update();
  controls.addEventListener("start", () => {
    isOrbitControlsActive = true;
  });
  controls.addEventListener("end", () => {
    isOrbitControlsActive = false;
  });
  controls.touches = {
    ONE: null,
    TWO: TOUCH.DOLLY_PAN
  };
  window.addEventListener("resize", onWindowResize);
  const gui = renderer.inspector.createParameters("Settings");
  gui.add(gravity, "value", -98e-4, 0, 1e-4).name("gravity");
  gui.add(bounce, "value", 0.1, 1, 0.01).name("bounce");
  gui.add(friction, "value", 0.96, 0.99, 0.01).name("friction");
  gui.add(size, "value", 0.12, 0.5, 0.01).name("size");
}
function onWindowResize() {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
function animate() {
  controls.update();
  renderer.compute(computeParticles);
  renderer.render(scene, camera);
}
//# sourceMappingURL=particles-DFeGxS3v.js.map
