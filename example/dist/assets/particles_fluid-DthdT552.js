import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-lAmZ_l45.js";
import { W as WebGPURenderer, a5 as IndirectStorageBufferAttribute, _ as storage, F as Fn, a6 as struct, i as instancedArray, u as uniform, I as If, c as instanceIndex, r as uint, G as Return, a7 as atomicStore, a8 as ivec3, f as float, a9 as array, L as Loop, A as vec3, aa as int, ab as atomicAdd, ac as atomicLoad, w as max, ad as pow, h as mat3, a as vec4, X as cross, ae as clamp, U as MeshStandardNodeMaterial, T as attribute, E as step } from "./three.tsl-CltecYTk.js";
import { O as OrbitControls } from "./OrbitControls-BsoZaNxp.js";
import { U as UltraHDRLoader } from "./UltraHDRLoader-4idvMtN1.js";
import { a as mergeVertices } from "./BufferGeometryUtils-MCjIhRez.js";
import { W as WebGPU } from "./WebGPU-BAUYnajR.js";
import { V as Vector3, cx as ACESFilmicToneMapping, a4 as Scene, h as PerspectiveCamera, cV as TOUCH, cl as EquirectangularReflectionMapping, c as MathUtils, w as Clock, dm as IcosahedronGeometry, s as Mesh, i as Raycaster, P as Plane, b as Vector2 } from "./three.core-DwEPwZOL.js";
import "./three.module-CudnH-mZ.js";
let renderer, scene, camera, controls;
const clock = new Clock();
const maxParticles = 8192 * 16;
const gridSize1d = 64;
const workgroupSize = 64;
const gridSize = new Vector3(gridSize1d, gridSize1d, gridSize1d);
const fixedPointMultiplier = 1e7;
let particleCountUniform, stiffnessUniform, restDensityUniform, dynamicViscosityUniform, dtUniform, gravityUniform, gridSizeUniform;
let particleBuffer, cellBuffer, cellBufferFloat;
let clearGridKernel, p2g1Kernel, p2g2Kernel, updateGridKernel, g2pKernel, workgroupKernel;
let p2g1KernelWorkgroupBuffer, p2g2KernelWorkgroupBuffer, g2pKernelWorkgroupBuffer;
let particleMesh;
const mouseCoord = new Vector3();
const prevMouseCoord = new Vector3();
let mouseRayOriginUniform, mouseRayDirectionUniform, mouseForceUniform;
if (WebGPU.isAvailable() === false) {
  document.body.appendChild(WebGPU.getErrorMessage());
  throw new Error("No WebGPU support");
}
const params = {
  particleCount: 8192 * 4
};
init();
async function init() {
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  scene = new Scene();
  camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.set(-1.3, 1.3, -1.3);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 3;
  controls.maxPolarAngle = Math.PI * 0.35;
  controls.touches = { TWO: TOUCH.DOLLY_ROTATE };
  const hdrLoader = new UltraHDRLoader().setPath("textures/equirectangular/");
  const hdrTexture = await hdrLoader.loadAsync("royal_esplanade_2k.hdr.jpg");
  hdrTexture.mapping = EquirectangularReflectionMapping;
  scene.background = hdrTexture;
  scene.backgroundBlurriness = 0.5;
  scene.environment = hdrTexture;
  setupParticles();
  const gui = renderer.inspector.createParameters("Settings");
  const numWorkgroups = Math.ceil(params.particleCount / workgroupSize);
  p2g1KernelWorkgroupBuffer = new IndirectStorageBufferAttribute(new Uint32Array([numWorkgroups, 1, 1]), 1);
  p2g2KernelWorkgroupBuffer = new IndirectStorageBufferAttribute(new Uint32Array([numWorkgroups, 1, 1]), 1);
  g2pKernelWorkgroupBuffer = new IndirectStorageBufferAttribute(new Uint32Array([numWorkgroups, 1, 1]), 1);
  const p2g1WorkgroupStorage = storage(p2g1KernelWorkgroupBuffer, "uint", 3);
  const p2g2WorkgroupStorage = storage(p2g2KernelWorkgroupBuffer, "uint", 3);
  const g2pWorkgroupStorage = storage(g2pKernelWorkgroupBuffer, "uint", 3);
  workgroupKernel = Fn(() => {
    const workgroupsToDispatch = particleCountUniform.sub(1).div(workgroupSize).add(1);
    p2g1WorkgroupStorage.element(0).assign(workgroupsToDispatch);
    p2g2WorkgroupStorage.element(0).assign(workgroupsToDispatch);
    g2pWorkgroupStorage.element(0).assign(workgroupsToDispatch);
  })().compute(1);
  gui.add(params, "particleCount", 4096, maxParticles, 4096).onChange((value) => {
    particleMesh.count = value;
    particleCountUniform.value = value;
  });
  window.addEventListener("resize", onWindowResize);
  controls.update();
  renderer.setAnimationLoop(render);
}
function setupBuffers() {
  const particleStruct = struct({
    position: { type: "vec3" },
    velocity: { type: "vec3" },
    C: { type: "mat3" }
  });
  const particleStructSize = 20;
  const particleArray = new Float32Array(maxParticles * particleStructSize);
  for (let i = 0; i < maxParticles; i++) {
    particleArray[i * particleStructSize] = Math.random() * 0.8 + 0.1;
    particleArray[i * particleStructSize + 1] = Math.random() * 0.8 + 0.1;
    particleArray[i * particleStructSize + 2] = Math.random() * 0.8 + 0.1;
  }
  particleBuffer = instancedArray(particleArray, particleStruct);
  const cellCount = gridSize.x * gridSize.y * gridSize.z;
  const cellStruct = struct({
    x: { type: "int", atomic: true },
    y: { type: "int", atomic: true },
    z: { type: "int", atomic: true },
    mass: { type: "int", atomic: true }
  });
  cellBuffer = instancedArray(cellCount, cellStruct);
  cellBufferFloat = instancedArray(cellCount, "vec4");
}
function setupUniforms() {
  gridSizeUniform = uniform(gridSize);
  particleCountUniform = uniform(params.particleCount, "uint");
  stiffnessUniform = uniform(50);
  restDensityUniform = uniform(1.5);
  dynamicViscosityUniform = uniform(0.1);
  dtUniform = uniform(1 / 60);
  gravityUniform = uniform(new Vector3(0, -96.23610000000001, 0));
  mouseRayOriginUniform = uniform(new Vector3(0, 0, 0));
  mouseRayDirectionUniform = uniform(new Vector3(0, 0, 0));
  mouseForceUniform = uniform(new Vector3(0, 0, 0));
}
function setupComputeShaders() {
  const encodeFixedPoint = (f32) => {
    return int(f32.mul(fixedPointMultiplier));
  };
  const decodeFixedPoint = (i32) => {
    return float(i32).div(fixedPointMultiplier);
  };
  const cellCount = gridSize.x * gridSize.y * gridSize.z;
  clearGridKernel = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(cellCount)), () => {
      Return();
    });
    atomicStore(cellBuffer.element(instanceIndex).get("x"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("y"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("z"), 0);
    atomicStore(cellBuffer.element(instanceIndex).get("mass"), 0);
  })().compute(cellCount).setName("clearGridKernel");
  p2g1Kernel = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });
    const particlePosition = particleBuffer.element(instanceIndex).get("position").toConst("particlePosition");
    const particleVelocity = particleBuffer.element(instanceIndex).get("velocity").toConst("particleVelocity");
    const C = particleBuffer.element(instanceIndex).get("C").toConst("C");
    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const cellIndex = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const w0 = float(0.5).mul(float(0.5).sub(cellDiff)).mul(float(0.5).sub(cellDiff));
    const w1 = float(0.75).sub(cellDiff.mul(cellDiff));
    const w2 = float(0.5).mul(float(0.5).add(cellDiff)).mul(float(0.5).add(cellDiff));
    const weights = array([w0, w1, w2]).toConst("weights");
    Loop({ start: 0, end: 3, type: "int", name: "gx", condition: "<" }, ({ gx }) => {
      Loop({ start: 0, end: 3, type: "int", name: "gy", condition: "<" }, ({ gy }) => {
        Loop({ start: 0, end: 3, type: "int", name: "gz", condition: "<" }, ({ gz }) => {
          const weight = weights.element(gx).x.mul(weights.element(gy).y).mul(weights.element(gz).z);
          const cellX = cellIndex.add(ivec3(gx, gy, gz)).toConst();
          const cellDist = vec3(cellX).add(0.5).sub(gridPosition).toConst("cellDist");
          const Q = C.mul(cellDist);
          const massContrib = weight;
          const velContrib = massContrib.mul(particleVelocity.add(Q)).toConst("velContrib");
          const cellPtr = cellX.x.mul(int(gridSize.y * gridSize.z)).add(cellX.y.mul(int(gridSize.z))).add(cellX.z).toConst();
          const cell = cellBuffer.element(cellPtr);
          atomicAdd(cell.get("x"), encodeFixedPoint(velContrib.x));
          atomicAdd(cell.get("y"), encodeFixedPoint(velContrib.y));
          atomicAdd(cell.get("z"), encodeFixedPoint(velContrib.z));
          atomicAdd(cell.get("mass"), encodeFixedPoint(massContrib));
        });
      });
    });
  })().compute(params.particleCount, [workgroupSize, 1, 1]).setName("p2g1Kernel");
  p2g2Kernel = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });
    const particlePosition = particleBuffer.element(instanceIndex).get("position").toConst("particlePosition");
    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const cellIndex = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const w0 = float(0.5).mul(float(0.5).sub(cellDiff)).mul(float(0.5).sub(cellDiff));
    const w1 = float(0.75).sub(cellDiff.mul(cellDiff));
    const w2 = float(0.5).mul(float(0.5).add(cellDiff)).mul(float(0.5).add(cellDiff));
    const weights = array([w0, w1, w2]).toConst("weights");
    const density = float(0).toVar("density");
    Loop({ start: 0, end: 3, type: "int", name: "gx", condition: "<" }, ({ gx }) => {
      Loop({ start: 0, end: 3, type: "int", name: "gy", condition: "<" }, ({ gy }) => {
        Loop({ start: 0, end: 3, type: "int", name: "gz", condition: "<" }, ({ gz }) => {
          const weight = weights.element(gx).x.mul(weights.element(gy).y).mul(weights.element(gz).z);
          const cellX = cellIndex.add(ivec3(gx, gy, gz)).toConst();
          const cellPtr = cellX.x.mul(int(gridSize.y * gridSize.z)).add(cellX.y.mul(int(gridSize.z))).add(cellX.z).toConst();
          const cell = cellBuffer.element(cellPtr);
          const mass = decodeFixedPoint(atomicLoad(cell.get("mass")));
          density.addAssign(mass.mul(weight));
        });
      });
    });
    const volume = float(1).div(density);
    const pressure = max(0, pow(density.div(restDensityUniform), 5).sub(1).mul(stiffnessUniform)).toConst("pressure");
    const stress = mat3(pressure.negate(), 0, 0, 0, pressure.negate(), 0, 0, 0, pressure.negate()).toVar("stress");
    const dudv = particleBuffer.element(instanceIndex).get("C").toConst("C");
    const strain = dudv.add(dudv.transpose());
    stress.addAssign(strain.mul(dynamicViscosityUniform));
    const eq16Term0 = volume.mul(-4).mul(stress).mul(dtUniform);
    Loop({ start: 0, end: 3, type: "int", name: "gx", condition: "<" }, ({ gx }) => {
      Loop({ start: 0, end: 3, type: "int", name: "gy", condition: "<" }, ({ gy }) => {
        Loop({ start: 0, end: 3, type: "int", name: "gz", condition: "<" }, ({ gz }) => {
          const weight = weights.element(gx).x.mul(weights.element(gy).y).mul(weights.element(gz).z);
          const cellX = cellIndex.add(ivec3(gx, gy, gz)).toConst();
          const cellDist = vec3(cellX).add(0.5).sub(gridPosition).toConst("cellDist");
          const momentum = eq16Term0.mul(weight).mul(cellDist).toConst("momentum");
          const cellPtr = cellX.x.mul(int(gridSize.y * gridSize.z)).add(cellX.y.mul(int(gridSize.z))).add(cellX.z).toConst();
          const cell = cellBuffer.element(cellPtr);
          atomicAdd(cell.get("x"), encodeFixedPoint(momentum.x));
          atomicAdd(cell.get("y"), encodeFixedPoint(momentum.y));
          atomicAdd(cell.get("z"), encodeFixedPoint(momentum.z));
        });
      });
    });
  })().compute(params.particleCount, [workgroupSize, 1, 1]).setName("p2g2Kernel");
  updateGridKernel = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(cellCount)), () => {
      Return();
    });
    const cell = cellBuffer.element(instanceIndex);
    const mass = decodeFixedPoint(atomicLoad(cell.get("mass"))).toConst();
    If(mass.lessThanEqual(0), () => {
      Return();
    });
    const vx = decodeFixedPoint(atomicLoad(cell.get("x"))).div(mass).toVar();
    const vy = decodeFixedPoint(atomicLoad(cell.get("y"))).div(mass).toVar();
    const vz = decodeFixedPoint(atomicLoad(cell.get("z"))).div(mass).toVar();
    const x = int(instanceIndex).div(int(gridSize.z * gridSize.y));
    const y = int(instanceIndex).div(int(gridSize.z)).mod(int(gridSize.y));
    const z = int(instanceIndex).mod(int(gridSize.z));
    If(x.lessThan(int(1)).or(x.greaterThan(int(gridSize.x).sub(int(2)))), () => {
      vx.assign(0);
    });
    If(y.lessThan(int(1)).or(y.greaterThan(int(gridSize.y).sub(int(2)))), () => {
      vy.assign(0);
    });
    If(z.lessThan(int(1)).or(z.greaterThan(int(gridSize.z).sub(int(2)))), () => {
      vz.assign(0);
    });
    cellBufferFloat.element(instanceIndex).assign(vec4(vx, vy, vz, mass));
  })().compute(cellCount).setName("updateGridKernel");
  const clampToRoundedBox = (pos, box, radius) => {
    const result = pos.sub(0.5).toVar();
    const pp = step(box, result.abs()).mul(result.add(box.negate().mul(result.sign())));
    const ppLen = pp.length().toVar();
    const dist = ppLen.sub(radius);
    If(dist.greaterThan(0), () => {
      result.subAssign(pp.normalize().mul(dist).mul(1.3));
    });
    result.addAssign(0.5);
    return result;
  };
  g2pKernel = Fn(() => {
    If(instanceIndex.greaterThanEqual(particleCountUniform), () => {
      Return();
    });
    const particlePosition = particleBuffer.element(instanceIndex).get("position").toVar("particlePosition");
    const gridPosition = particlePosition.mul(gridSizeUniform).toVar();
    const particleVelocity = vec3(0).toVar();
    const cellIndex = ivec3(gridPosition).sub(1).toConst("cellIndex");
    const cellDiff = gridPosition.fract().sub(0.5).toConst("cellDiff");
    const w0 = float(0.5).mul(float(0.5).sub(cellDiff)).mul(float(0.5).sub(cellDiff));
    const w1 = float(0.75).sub(cellDiff.mul(cellDiff));
    const w2 = float(0.5).mul(float(0.5).add(cellDiff)).mul(float(0.5).add(cellDiff));
    const weights = array([w0, w1, w2]).toConst("weights");
    const B = mat3(0).toVar("B");
    Loop({ start: 0, end: 3, type: "int", name: "gx", condition: "<" }, ({ gx }) => {
      Loop({ start: 0, end: 3, type: "int", name: "gy", condition: "<" }, ({ gy }) => {
        Loop({ start: 0, end: 3, type: "int", name: "gz", condition: "<" }, ({ gz }) => {
          const weight = weights.element(gx).x.mul(weights.element(gy).y).mul(weights.element(gz).z);
          const cellX = cellIndex.add(ivec3(gx, gy, gz)).toConst();
          const cellDist = vec3(cellX).add(0.5).sub(gridPosition).toConst("cellDist");
          const cellPtr = cellX.x.mul(int(gridSize.y * gridSize.z)).add(cellX.y.mul(int(gridSize.z))).add(cellX.z).toConst();
          const weightedVelocity = cellBufferFloat.element(cellPtr).xyz.mul(weight).toConst("weightedVelocity");
          const term = mat3(
            weightedVelocity.mul(cellDist.x),
            weightedVelocity.mul(cellDist.y),
            weightedVelocity.mul(cellDist.z)
          );
          B.addAssign(term);
          particleVelocity.addAssign(weightedVelocity);
        });
      });
    });
    particleBuffer.element(instanceIndex).get("C").assign(B.mul(4));
    particleVelocity.addAssign(gravityUniform.mul(dtUniform));
    particleVelocity.divAssign(gridSizeUniform);
    const dist = cross(mouseRayDirectionUniform, particlePosition.sub(mouseRayOriginUniform)).length();
    const force = dist.mul(3).oneMinus().max(0).pow(2);
    particleVelocity.addAssign(mouseForceUniform.mul(force));
    particlePosition.addAssign(particleVelocity.mul(dtUniform));
    particlePosition.assign(clamp(particlePosition, vec3(1).div(gridSizeUniform), vec3(gridSize).sub(1).div(gridSizeUniform)));
    const innerBox = gridSizeUniform.mul(0.5).sub(9).div(gridSizeUniform).toVar();
    const innerRadius = float(6).div(gridSizeUniform.x);
    const posNext = particlePosition.add(particleVelocity.mul(dtUniform).mul(2)).toConst("posNext");
    const posNextClamped = clampToRoundedBox(posNext, innerBox, innerRadius);
    particleVelocity.addAssign(posNextClamped.sub(posNext));
    particleVelocity.mulAssign(gridSizeUniform);
    particleBuffer.element(instanceIndex).get("position").assign(particlePosition);
    particleBuffer.element(instanceIndex).get("velocity").assign(particleVelocity);
  })().compute(params.particleCount, [workgroupSize, 1, 1]).setName("g2pKernel");
}
function setupMesh() {
  const geometry = mergeVertices(new IcosahedronGeometry(8e-3, 1).deleteAttribute("uv"));
  const material = new MeshStandardNodeMaterial({
    color: "#0066FF"
  });
  material.positionNode = Fn(() => {
    const particlePosition = particleBuffer.element(instanceIndex).get("position");
    return attribute("position").add(particlePosition);
  })();
  particleMesh = new Mesh(geometry, material);
  particleMesh.count = params.particleCount;
  particleMesh.position.set(-0.5, 0, -0.5);
  particleMesh.frustumCulled = false;
  scene.add(particleMesh);
}
function setupMouse() {
  const raycaster = new Raycaster();
  const raycastPlane = new Plane(new Vector3(0, 1, 0));
  const onMove = (event) => {
    const pointer = new Vector2(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.origin.x += 0.5;
    raycaster.ray.origin.z += 0.5;
    mouseRayOriginUniform.value.copy(raycaster.ray.origin);
    mouseRayDirectionUniform.value.copy(raycaster.ray.direction);
    raycaster.ray.intersectPlane(raycastPlane, mouseCoord);
  };
  renderer.domElement.addEventListener("pointermove", onMove);
}
function setupParticles() {
  setupBuffers();
  setupUniforms();
  setupComputeShaders();
  setupMesh();
  setupMouse();
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
async function render() {
  const deltaTime = MathUtils.clamp(clock.getDelta(), 1e-5, 1 / 60);
  dtUniform.value = deltaTime;
  mouseForceUniform.value.copy(mouseCoord).sub(prevMouseCoord).multiplyScalar(2);
  const mouseForceLength = mouseForceUniform.value.length();
  if (mouseForceLength > 0.3) {
    mouseForceUniform.value.multiplyScalar(0.3 / mouseForceLength);
  }
  prevMouseCoord.copy(mouseCoord);
  renderer.compute(workgroupKernel);
  renderer.compute(clearGridKernel);
  renderer.compute(p2g1Kernel, p2g1KernelWorkgroupBuffer);
  renderer.compute(p2g2Kernel, p2g2KernelWorkgroupBuffer);
  renderer.compute(updateGridKernel);
  renderer.compute(g2pKernel, g2pKernelWorkgroupBuffer);
  renderer.render(scene, camera);
}
//# sourceMappingURL=particles_fluid-DthdT552.js.map
