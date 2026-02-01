import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-lAmZ_l45.js";
import { M as MeshBasicNodeMaterial, v as varying, a as vec4, s as sub, p as positionLocal, b as add, W as WebGPURenderer, i as instancedArray, u as uniform, N as NodeMaterial, F as Fn, c as instanceIndex, n as normalize, I as If, d as vertexIndex, e as sin, m as modelWorldMatrix, l as length, f as float, g as sqrt, h as mat3, j as negate, k as cameraProjectionMatrix, o as cameraViewMatrix, q as dot, L as Loop, r as uint, C as Continue, t as cos, w as max } from "./three.tsl-CltecYTk.js";
import { O as OrbitControls } from "./OrbitControls-BsoZaNxp.js";
import { W as WebGPU } from "./WebGPU-BAUYnajR.js";
import { h as PerspectiveCamera, a4 as Scene, dl as Fog, b as Vector2, i as Raycaster, dm as IcosahedronGeometry, a3 as BackSide, s as Mesh, cv as NeutralToneMapping, V as Vector3, D as DoubleSide, z as InstancedMesh, m as BufferGeometry, n as BufferAttribute } from "./three.core-DwEPwZOL.js";
import "./three.module-CudnH-mZ.js";
let container;
let camera, scene, renderer;
let last = performance.now();
let pointer, raycaster;
let computeVelocity, computePosition, effectController;
const BIRDS = 16384;
const SPEED_LIMIT = 9;
const BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
class BirdGeometry extends BufferGeometry {
  constructor() {
    super();
    const points = 3 * 3;
    const vertices = new BufferAttribute(new Float32Array(points * 3), 3);
    this.setAttribute("position", vertices);
    let v = 0;
    function verts_push() {
      for (let i = 0; i < arguments.length; i++) {
        vertices.array[v++] = arguments[i];
      }
    }
    const wingsSpan = 20;
    verts_push(
      0,
      0,
      -20,
      0,
      -8,
      10,
      0,
      0,
      30
    );
    verts_push(
      0,
      0,
      -15,
      -wingsSpan,
      0,
      5,
      0,
      0,
      15
    );
    verts_push(
      0,
      0,
      15,
      wingsSpan,
      0,
      5,
      0,
      0,
      -15
    );
    this.scale(0.2, 0.2, 0.2);
  }
}
if (WebGPU.isAvailable() === false) {
  document.body.appendChild(WebGPU.getErrorMessage());
  throw new Error("No WebGPU support");
}
function init() {
  container = document.createElement("div");
  document.body.appendChild(container);
  camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5e3);
  camera.position.z = 1e3;
  scene = new Scene();
  scene.fog = new Fog(16777215, 700, 3e3);
  pointer = new Vector2();
  raycaster = new Raycaster();
  const geometry = new IcosahedronGeometry(1, 6);
  const material = new MeshBasicNodeMaterial({
    // Use vertex positions to create atmosphere colors
    colorNode: varying(
      vec4(
        sub(0.25, positionLocal.y),
        sub(-0.25, positionLocal.y),
        add(1.5, positionLocal.y),
        1
      )
    ),
    side: BackSide
  });
  const mesh = new Mesh(geometry, material);
  mesh.rotation.z = 0.75;
  mesh.scale.setScalar(1200);
  scene.add(mesh);
  renderer = new WebGPURenderer({ antialias: true, forceWebGL: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  renderer.toneMapping = NeutralToneMapping;
  renderer.inspector = new Inspector();
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera);
  controls.connect(renderer.domElement);
  const positionArray = new Float32Array(BIRDS * 3);
  const velocityArray = new Float32Array(BIRDS * 3);
  const phaseArray = new Float32Array(BIRDS);
  for (let i = 0; i < BIRDS; i++) {
    const posX = Math.random() * BOUNDS - BOUNDS_HALF;
    const posY = Math.random() * BOUNDS - BOUNDS_HALF;
    const posZ = Math.random() * BOUNDS - BOUNDS_HALF;
    positionArray[i * 3 + 0] = posX;
    positionArray[i * 3 + 1] = posY;
    positionArray[i * 3 + 2] = posZ;
    const velX = Math.random() - 0.5;
    const velY = Math.random() - 0.5;
    const velZ = Math.random() - 0.5;
    velocityArray[i * 3 + 0] = velX * 10;
    velocityArray[i * 3 + 1] = velY * 10;
    velocityArray[i * 3 + 2] = velZ * 10;
    phaseArray[i] = 1;
  }
  const positionStorage = instancedArray(positionArray, "vec3").setName("positionStorage");
  const velocityStorage = instancedArray(velocityArray, "vec3").setName("velocityStorage");
  const phaseStorage = instancedArray(phaseArray, "float").setName("phaseStorage");
  positionStorage.setPBO(true);
  velocityStorage.setPBO(true);
  phaseStorage.setPBO(true);
  effectController = {
    separation: uniform(15).setName("separation"),
    alignment: uniform(20).setName("alignment"),
    cohesion: uniform(20).setName("cohesion"),
    freedom: uniform(0.75).setName("freedom"),
    now: uniform(0),
    deltaTime: uniform(0).setName("deltaTime"),
    rayOrigin: uniform(new Vector3()).setName("rayOrigin"),
    rayDirection: uniform(new Vector3()).setName("rayDirection")
  };
  const birdGeometry = new BirdGeometry();
  const birdMaterial = new NodeMaterial();
  const birdVertexTSL = Fn(() => {
    const position = positionLocal.toVar();
    const newPhase = phaseStorage.element(instanceIndex).toVar();
    const newVelocity = normalize(velocityStorage.element(instanceIndex)).toVar();
    If(vertexIndex.equal(4).or(vertexIndex.equal(7)), () => {
      position.y = sin(newPhase).mul(5);
    });
    const newPosition = modelWorldMatrix.mul(position);
    newVelocity.z.mulAssign(-1);
    const xz = length(newVelocity.xz);
    const xyz = float(1);
    const x = sqrt(newVelocity.y.mul(newVelocity.y).oneMinus());
    const cosry = newVelocity.x.div(xz).toVar();
    const sinry = newVelocity.z.div(xz).toVar();
    const cosrz = x.div(xyz);
    const sinrz = newVelocity.y.div(xyz).toVar();
    const maty = mat3(
      cosry,
      0,
      negate(sinry),
      0,
      1,
      0,
      sinry,
      0,
      cosry
    );
    const matz = mat3(
      cosrz,
      sinrz,
      0,
      negate(sinrz),
      cosrz,
      0,
      0,
      0,
      1
    );
    const finalVert = maty.mul(matz).mul(newPosition);
    finalVert.addAssign(positionStorage.element(instanceIndex));
    return cameraProjectionMatrix.mul(cameraViewMatrix).mul(finalVert);
  });
  birdMaterial.vertexNode = birdVertexTSL();
  birdMaterial.side = DoubleSide;
  const birdMesh = new InstancedMesh(birdGeometry, birdMaterial, BIRDS);
  birdMesh.rotation.y = Math.PI / 2;
  birdMesh.matrixAutoUpdate = false;
  birdMesh.frustumCulled = false;
  birdMesh.updateMatrix();
  computeVelocity = Fn(() => {
    const PI = float(3.141592653589793);
    const PI_2 = PI.mul(2);
    const limit = float(SPEED_LIMIT).toVar("limit");
    const { alignment, separation, cohesion, deltaTime, rayOrigin, rayDirection } = effectController;
    const zoneRadius = separation.add(alignment).add(cohesion).toConst();
    const separationThresh = separation.div(zoneRadius).toConst();
    const alignmentThresh = separation.add(alignment).div(zoneRadius).toConst();
    const zoneRadiusSq = zoneRadius.mul(zoneRadius).toConst();
    const birdIndex = instanceIndex.toConst("birdIndex");
    const position = positionStorage.element(birdIndex).toVar();
    const velocity = velocityStorage.element(birdIndex).toVar();
    const directionToRay = rayOrigin.sub(position).toConst();
    const projectionLength = dot(directionToRay, rayDirection).toConst();
    const closestPoint = rayOrigin.sub(rayDirection.mul(projectionLength)).toConst();
    const directionToClosestPoint = closestPoint.sub(position).toConst();
    const distanceToClosestPoint = length(directionToClosestPoint).toConst();
    const distanceToClosestPointSq = distanceToClosestPoint.mul(distanceToClosestPoint).toConst();
    const rayRadius = float(150).toConst();
    const rayRadiusSq = rayRadius.mul(rayRadius).toConst();
    If(distanceToClosestPointSq.lessThan(rayRadiusSq), () => {
      const velocityAdjust = distanceToClosestPointSq.div(rayRadiusSq).sub(1).mul(deltaTime).mul(100);
      velocity.addAssign(normalize(directionToClosestPoint).mul(velocityAdjust));
      limit.addAssign(5);
    });
    const dirToCenter = position.toVar();
    dirToCenter.y.mulAssign(2.5);
    velocity.subAssign(normalize(dirToCenter).mul(deltaTime).mul(5));
    Loop({ start: uint(0), end: uint(BIRDS), type: "uint", condition: "<" }, ({ i }) => {
      If(i.equal(birdIndex), () => {
        Continue();
      });
      const birdPosition = positionStorage.element(i);
      const dirToBird = birdPosition.sub(position);
      const distToBird = length(dirToBird);
      If(distToBird.lessThan(1e-4), () => {
        Continue();
      });
      const distToBirdSq = distToBird.mul(distToBird);
      If(distToBirdSq.greaterThan(zoneRadiusSq), () => {
        Continue();
      });
      const percent = distToBirdSq.div(zoneRadiusSq);
      If(percent.lessThan(separationThresh), () => {
        const velocityAdjust = separationThresh.div(percent).sub(1).mul(deltaTime);
        velocity.subAssign(normalize(dirToBird).mul(velocityAdjust));
      }).ElseIf(percent.lessThan(alignmentThresh), () => {
        const threshDelta = alignmentThresh.sub(separationThresh);
        const adjustedPercent = percent.sub(separationThresh).div(threshDelta);
        const birdVelocity = velocityStorage.element(i);
        const cosRange = cos(adjustedPercent.mul(PI_2));
        const cosRangeAdjust = float(0.5).sub(cosRange.mul(0.5)).add(0.5);
        const velocityAdjust = cosRangeAdjust.mul(deltaTime);
        velocity.addAssign(normalize(birdVelocity).mul(velocityAdjust));
      }).Else(() => {
        const threshDelta = alignmentThresh.oneMinus();
        const adjustedPercent = threshDelta.equal(0).select(1, percent.sub(alignmentThresh).div(threshDelta));
        const cosRange = cos(adjustedPercent.mul(PI_2));
        const adj1 = cosRange.mul(-0.5);
        const adj2 = adj1.add(0.5);
        const adj3 = float(0.5).sub(adj2);
        const velocityAdjust = adj3.mul(deltaTime);
        velocity.addAssign(normalize(dirToBird).mul(velocityAdjust));
      });
    });
    If(length(velocity).greaterThan(limit), () => {
      velocity.assign(normalize(velocity).mul(limit));
    });
    velocityStorage.element(birdIndex).assign(velocity);
  })().compute(BIRDS).setName("Birds Velocity");
  computePosition = Fn(() => {
    const { deltaTime } = effectController;
    positionStorage.element(instanceIndex).addAssign(velocityStorage.element(instanceIndex).mul(deltaTime).mul(15));
    const velocity = velocityStorage.element(instanceIndex);
    const phase = phaseStorage.element(instanceIndex);
    const modValue = phase.add(deltaTime).add(length(velocity.xz).mul(deltaTime).mul(3)).add(max(velocity.y, 0).mul(deltaTime).mul(6));
    phaseStorage.element(instanceIndex).assign(modValue.mod(62.83));
  })().compute(BIRDS).setName("Birds Position");
  scene.add(birdMesh);
  container.style.touchAction = "none";
  container.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);
  const gui = renderer.inspector.createParameters("Birds settings");
  gui.add(effectController.separation, "value", 0, 100, 1).name("Separation");
  gui.add(effectController.alignment, "value", 0, 100, 1e-3).name("Alignment ");
  gui.add(effectController.cohesion, "value", 0, 100, 0.025).name("Cohesion");
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onPointerMove(event) {
  if (event.isPrimary === false) return;
  pointer.x = event.clientX / window.innerWidth * 2 - 1;
  pointer.y = 1 - event.clientY / window.innerHeight * 2;
}
function render() {
  const now = performance.now();
  let deltaTime = (now - last) / 1e3;
  if (deltaTime > 1) deltaTime = 1;
  last = now;
  raycaster.setFromCamera(pointer, camera);
  effectController.now.value = now;
  effectController.deltaTime.value = deltaTime;
  effectController.rayOrigin.value.copy(raycaster.ray.origin);
  effectController.rayDirection.value.copy(raycaster.ray.direction);
  renderer.compute(computeVelocity);
  renderer.compute(computePosition);
  renderer.render(scene, camera);
  pointer.y = 10;
}
init();
//# sourceMappingURL=birds-CWXxUIJo.js.map
