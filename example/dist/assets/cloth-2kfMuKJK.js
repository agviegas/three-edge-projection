import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-Bw7mdRhQ.js";
import { W as WebGPURenderer, i as instancedArray, u as uniform, F as Fn, I as If, c as instanceIndex, r as uint, R as Return, L as Loop, x as select, y as triNoise3D, z as time, f as float, S as SpriteNodeMaterial, A as LineBasicNodeMaterial, B as attribute, D as MeshStandardNodeMaterial, E as MeshPhysicalNodeMaterial, G as cross, H as transformNormalToView } from "./three.tsl-CucFAqAO.js";
import { O as OrbitControls } from "./OrbitControls-BwrKLbo_.js";
import { U as UltraHDRLoader } from "./UltraHDRLoader-BUUPTmsQ.js";
import { W as WebGPU } from "./WebGPU-BAUYnajR.js";
import { ao as NeutralToneMapping, a4 as Scene, h as PerspectiveCamera, ap as EquirectangularReflectionMapping, w as Clock, V as Vector3, s as Mesh, E as PlaneGeometry, n as BufferAttribute, u as InstancedBufferGeometry, p as Line, an as IcosahedronGeometry, m as BufferGeometry, C as Color, D as DoubleSide } from "./three.core-CntQ0PPt.js";
import "./three.module-Jt-9Ru2o.js";
let renderer, scene, camera, controls;
const clothWidth = 1;
const clothHeight = 1;
const clothNumSegmentsX = 30;
const clothNumSegmentsY = 30;
const sphereRadius = 0.15;
let vertexPositionBuffer, vertexForceBuffer, vertexParamsBuffer;
let springVertexIdBuffer, springRestLengthBuffer, springForceBuffer;
let springListBuffer;
let computeSpringForces, computeVertexForces;
let dampeningUniform, spherePositionUniform, stiffnessUniform, sphereUniform, windUniform;
let vertexWireframeObject, springWireframeObject;
let clothMesh, clothMaterial, sphere;
let timeSinceLastStep = 0;
let timestamp = 0;
const verletVertices = [];
const verletSprings = [];
const verletVertexColumns = [];
const clock = new Clock();
const params = {
  wireframe: false,
  sphere: true,
  wind: 1
};
const API = {
  color: 2113664,
  // sRGB
  sheenColor: 16777215
  // sRGB
};
if (WebGPU.isAvailable() === false) {
  document.body.appendChild(WebGPU.getErrorMessage());
  throw new Error("No WebGPU support");
}
init();
async function init() {
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  scene = new Scene();
  camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.set(-1.6, -0.1, -1.6);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 3;
  controls.target.set(0, -0.1, 0);
  controls.update();
  const hdrLoader = new UltraHDRLoader().setPath("textures/equirectangular/");
  const hdrTexture = await hdrLoader.loadAsync("royal_esplanade_2k.hdr.jpg");
  hdrTexture.mapping = EquirectangularReflectionMapping;
  scene.background = hdrTexture;
  scene.backgroundBlurriness = 0.5;
  scene.environment = hdrTexture;
  setupCloth();
  const gui = renderer.inspector.createParameters("Settings");
  gui.add(stiffnessUniform, "value", 0.1, 0.5, 0.01).name("stiffness");
  gui.add(params, "wireframe");
  gui.add(params, "sphere");
  gui.add(params, "wind", 0, 5, 0.1);
  const materialFolder = gui.addFolder("material");
  materialFolder.addColor(API, "color").onChange(function(color) {
    clothMaterial.color.setHex(color);
  });
  materialFolder.add(clothMaterial, "roughness", 0, 1, 0.01);
  materialFolder.add(clothMaterial, "sheen", 0, 1, 0.01);
  materialFolder.add(clothMaterial, "sheenRoughness", 0, 1, 0.01);
  materialFolder.addColor(API, "sheenColor").onChange(function(color) {
    clothMaterial.sheenColor.setHex(color);
  });
  window.addEventListener("resize", onWindowResize);
  renderer.setAnimationLoop(render);
}
function setupVerletGeometry() {
  const addVerletVertex = (x, y, z, isFixed) => {
    const id = verletVertices.length;
    const vertex = {
      id,
      position: new Vector3(x, y, z),
      isFixed,
      springIds: []
    };
    verletVertices.push(vertex);
    return vertex;
  };
  const addVerletSpring = (vertex0, vertex1) => {
    const id = verletSprings.length;
    const spring = {
      id,
      vertex0,
      vertex1
    };
    vertex0.springIds.push(id);
    vertex1.springIds.push(id);
    verletSprings.push(spring);
    return spring;
  };
  for (let x = 0; x <= clothNumSegmentsX; x++) {
    const column = [];
    for (let y = 0; y <= clothNumSegmentsY; y++) {
      const posX = x * (clothWidth / clothNumSegmentsX) - clothWidth * 0.5;
      const posZ = y * (clothHeight / clothNumSegmentsY);
      const isFixed = y === 0 && x % 5 === 0;
      const vertex = addVerletVertex(posX, clothHeight * 0.5, posZ, isFixed);
      column.push(vertex);
    }
    verletVertexColumns.push(column);
  }
  for (let x = 0; x <= clothNumSegmentsX; x++) {
    for (let y = 0; y <= clothNumSegmentsY; y++) {
      const vertex0 = verletVertexColumns[x][y];
      if (x > 0) addVerletSpring(vertex0, verletVertexColumns[x - 1][y]);
      if (y > 0) addVerletSpring(vertex0, verletVertexColumns[x][y - 1]);
      if (x > 0 && y > 0) addVerletSpring(vertex0, verletVertexColumns[x - 1][y - 1]);
      if (x > 0 && y < clothNumSegmentsY) addVerletSpring(vertex0, verletVertexColumns[x - 1][y + 1]);
    }
  }
}
function setupVerletVertexBuffers() {
  const vertexCount = verletVertices.length;
  const springListArray = [];
  const vertexPositionArray = new Float32Array(vertexCount * 3);
  const vertexParamsArray = new Uint32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    const vertex = verletVertices[i];
    vertexPositionArray[i * 3] = vertex.position.x;
    vertexPositionArray[i * 3 + 1] = vertex.position.y;
    vertexPositionArray[i * 3 + 2] = vertex.position.z;
    vertexParamsArray[i * 3] = vertex.isFixed ? 1 : 0;
    if (!vertex.isFixed) {
      vertexParamsArray[i * 3 + 1] = vertex.springIds.length;
      vertexParamsArray[i * 3 + 2] = springListArray.length;
      springListArray.push(...vertex.springIds);
    }
  }
  vertexPositionBuffer = instancedArray(vertexPositionArray, "vec3").setPBO(true);
  vertexForceBuffer = instancedArray(vertexCount, "vec3");
  vertexParamsBuffer = instancedArray(vertexParamsArray, "uvec3");
  springListBuffer = instancedArray(new Uint32Array(springListArray), "uint").setPBO(true);
}
function setupVerletSpringBuffers() {
  const springCount = verletSprings.length;
  const springVertexIdArray = new Uint32Array(springCount * 2);
  const springRestLengthArray = new Float32Array(springCount);
  for (let i = 0; i < springCount; i++) {
    const spring = verletSprings[i];
    springVertexIdArray[i * 2] = spring.vertex0.id;
    springVertexIdArray[i * 2 + 1] = spring.vertex1.id;
    springRestLengthArray[i] = spring.vertex0.position.distanceTo(spring.vertex1.position);
  }
  springVertexIdBuffer = instancedArray(springVertexIdArray, "uvec2").setPBO(true);
  springRestLengthBuffer = instancedArray(springRestLengthArray, "float");
  springForceBuffer = instancedArray(springCount * 3, "vec3").setPBO(true);
}
function setupUniforms() {
  dampeningUniform = uniform(0.99);
  spherePositionUniform = uniform(new Vector3(0, 0, 0));
  sphereUniform = uniform(1);
  windUniform = uniform(1);
  stiffnessUniform = uniform(0.2);
}
function setupComputeShaders() {
  const vertexCount = verletVertices.length;
  const springCount = verletSprings.length;
  computeSpringForces = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(springCount)), () => {
      Return();
    });
    const vertexIds = springVertexIdBuffer.element(instanceIndex);
    const restLength = springRestLengthBuffer.element(instanceIndex);
    const vertex0Position = vertexPositionBuffer.element(vertexIds.x);
    const vertex1Position = vertexPositionBuffer.element(vertexIds.y);
    const delta = vertex1Position.sub(vertex0Position).toVar();
    const dist = delta.length().max(1e-6).toVar();
    const force = dist.sub(restLength).mul(stiffnessUniform).mul(delta).mul(0.5).div(dist);
    springForceBuffer.element(instanceIndex).assign(force);
  })().compute(springCount).setName("Spring Forces");
  computeVertexForces = Fn(() => {
    If(instanceIndex.greaterThanEqual(uint(vertexCount)), () => {
      Return();
    });
    const params2 = vertexParamsBuffer.element(instanceIndex).toVar();
    const isFixed = params2.x;
    const springCount2 = params2.y;
    const springPointer = params2.z;
    If(isFixed, () => {
      Return();
    });
    const position = vertexPositionBuffer.element(instanceIndex).toVar("vertexPosition");
    const force = vertexForceBuffer.element(instanceIndex).toVar("vertexForce");
    force.mulAssign(dampeningUniform);
    const ptrStart = springPointer.toVar("ptrStart");
    const ptrEnd = ptrStart.add(springCount2).toVar("ptrEnd");
    Loop({ start: ptrStart, end: ptrEnd, type: "uint", condition: "<" }, ({ i }) => {
      const springId = springListBuffer.element(i).toVar("springId");
      const springForce = springForceBuffer.element(springId);
      const springVertexIds = springVertexIdBuffer.element(springId);
      const factor = select(springVertexIds.x.equal(instanceIndex), 1, -1);
      force.addAssign(springForce.mul(factor));
    });
    force.y.subAssign(5e-5);
    const noise = triNoise3D(position, 1, time).sub(0.2).mul(1e-4);
    const windForce = noise.mul(windUniform);
    force.z.subAssign(windForce);
    const deltaSphere = position.add(force).sub(spherePositionUniform);
    const dist = deltaSphere.length();
    const sphereForce = float(sphereRadius).sub(dist).max(0).mul(deltaSphere).div(dist).mul(sphereUniform);
    force.addAssign(sphereForce);
    vertexForceBuffer.element(instanceIndex).assign(force);
    vertexPositionBuffer.element(instanceIndex).addAssign(force);
  })().compute(vertexCount).setName("Vertex Forces");
}
function setupWireframe() {
  const vertexWireframeMaterial = new SpriteNodeMaterial();
  vertexWireframeMaterial.positionNode = vertexPositionBuffer.element(instanceIndex);
  vertexWireframeObject = new Mesh(new PlaneGeometry(0.01, 0.01), vertexWireframeMaterial);
  vertexWireframeObject.frustumCulled = false;
  vertexWireframeObject.count = verletVertices.length;
  scene.add(vertexWireframeObject);
  const springWireframePositionBuffer = new BufferAttribute(new Float32Array(6), 3, false);
  const springWireframeIndexBuffer = new BufferAttribute(new Uint32Array([0, 1]), 1, false);
  const springWireframeMaterial = new LineBasicNodeMaterial();
  springWireframeMaterial.positionNode = Fn(() => {
    const vertexIds = springVertexIdBuffer.element(instanceIndex);
    const vertexId = select(attribute("vertexIndex").equal(0), vertexIds.x, vertexIds.y);
    return vertexPositionBuffer.element(vertexId);
  })();
  const springWireframeGeometry = new InstancedBufferGeometry();
  springWireframeGeometry.setAttribute("position", springWireframePositionBuffer);
  springWireframeGeometry.setAttribute("vertexIndex", springWireframeIndexBuffer);
  springWireframeGeometry.instanceCount = verletSprings.length;
  springWireframeObject = new Line(springWireframeGeometry, springWireframeMaterial);
  springWireframeObject.frustumCulled = false;
  springWireframeObject.count = verletSprings.length;
  scene.add(springWireframeObject);
}
function setupSphere() {
  const geometry = new IcosahedronGeometry(sphereRadius * 0.95, 4);
  const material = new MeshStandardNodeMaterial();
  sphere = new Mesh(geometry, material);
  scene.add(sphere);
}
function setupClothMesh() {
  const vertexCount = clothNumSegmentsX * clothNumSegmentsY;
  const geometry = new BufferGeometry();
  const verletVertexIdArray = new Uint32Array(vertexCount * 4);
  const indices = [];
  const getIndex = (x, y) => {
    return y * clothNumSegmentsX + x;
  };
  for (let x = 0; x < clothNumSegmentsX; x++) {
    for (let y = 0; y < clothNumSegmentsX; y++) {
      const index = getIndex(x, y);
      verletVertexIdArray[index * 4] = verletVertexColumns[x][y].id;
      verletVertexIdArray[index * 4 + 1] = verletVertexColumns[x + 1][y].id;
      verletVertexIdArray[index * 4 + 2] = verletVertexColumns[x][y + 1].id;
      verletVertexIdArray[index * 4 + 3] = verletVertexColumns[x + 1][y + 1].id;
      if (x > 0 && y > 0) {
        indices.push(getIndex(x, y), getIndex(x - 1, y), getIndex(x - 1, y - 1));
        indices.push(getIndex(x, y), getIndex(x - 1, y - 1), getIndex(x, y - 1));
      }
    }
  }
  const verletVertexIdBuffer = new BufferAttribute(verletVertexIdArray, 4, false);
  const positionBuffer = new BufferAttribute(new Float32Array(vertexCount * 3), 3, false);
  geometry.setAttribute("position", positionBuffer);
  geometry.setAttribute("vertexIds", verletVertexIdBuffer);
  geometry.setIndex(indices);
  clothMaterial = new MeshPhysicalNodeMaterial({
    color: new Color().setHex(API.color),
    side: DoubleSide,
    transparent: true,
    opacity: 0.85,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new Color().setHex(API.sheenColor)
  });
  clothMaterial.positionNode = Fn(({ material }) => {
    const vertexIds = attribute("vertexIds");
    const v0 = vertexPositionBuffer.element(vertexIds.x).toVar();
    const v1 = vertexPositionBuffer.element(vertexIds.y).toVar();
    const v2 = vertexPositionBuffer.element(vertexIds.z).toVar();
    const v3 = vertexPositionBuffer.element(vertexIds.w).toVar();
    const top = v0.add(v1);
    const right = v1.add(v3);
    const bottom = v2.add(v3);
    const left = v0.add(v2);
    const tangent = right.sub(left).normalize();
    const bitangent = bottom.sub(top).normalize();
    const normal = cross(tangent, bitangent);
    material.normalNode = transformNormalToView(normal).toVarying();
    return v0.add(v1).add(v2).add(v3).mul(0.25);
  })();
  clothMesh = new Mesh(geometry, clothMaterial);
  clothMesh.frustumCulled = false;
  scene.add(clothMesh);
}
function setupCloth() {
  setupVerletGeometry();
  setupVerletVertexBuffers();
  setupVerletSpringBuffers();
  setupUniforms();
  setupComputeShaders();
  setupWireframe();
  setupSphere();
  setupClothMesh();
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function updateSphere() {
  sphere.position.set(Math.sin(timestamp * 2.1) * 0.1, 0, Math.sin(timestamp * 0.8));
  spherePositionUniform.value.copy(sphere.position);
}
async function render() {
  sphere.visible = params.sphere;
  sphereUniform.value = params.sphere ? 1 : 0;
  windUniform.value = params.wind;
  clothMesh.visible = !params.wireframe;
  vertexWireframeObject.visible = params.wireframe;
  springWireframeObject.visible = params.wireframe;
  const deltaTime = Math.min(clock.getDelta(), 1 / 60);
  const stepsPerSecond = 360;
  const timePerStep = 1 / stepsPerSecond;
  timeSinceLastStep += deltaTime;
  while (timeSinceLastStep >= timePerStep) {
    timestamp += timePerStep;
    timeSinceLastStep -= timePerStep;
    updateSphere();
    renderer.compute(computeSpringForces);
    renderer.compute(computeVertexForces);
  }
  renderer.render(scene, camera);
}
//# sourceMappingURL=cloth-2kfMuKJK.js.map
