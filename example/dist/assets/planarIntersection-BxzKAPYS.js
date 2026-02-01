import "./modulepreload-polyfill-DaKOjhqt.js";
import { W as WebGLRenderer } from "./three.module-Jt-9Ru2o.js";
import { M as MeshBVH, g, P as PlanarIntersectionGenerator } from "./PlanarIntersectionGenerator-BMMayE_N.js";
import { O as OrbitControls } from "./OrbitControls-BwrKLbo_.js";
import { G as GLTFLoader } from "./GLTFLoader-B7y50lGg.js";
import { m as mergeGeometries } from "./BufferGeometryUtils-D7RCbN6D.js";
import { M as MeshoptDecoder } from "./meshopt_decoder.module-CjP2QqSg.js";
import { a4 as Scene, a5 as DirectionalLight, a6 as AmbientLight, G as Group, B as Box3, s as Mesh, E as PlaneGeometry, x as MeshBasicMaterial, D as DoubleSide, aa as LineSegments, m as BufferGeometry, N as LineBasicMaterial, h as PerspectiveCamera } from "./three.core-CntQ0PPt.js";
const params = {
  displayModel: true,
  planePosition: 1
};
let renderer, camera, scene, gui, bvh;
let model, projection, group, plane;
let outputContainer;
init();
async function init() {
  outputContainer = document.getElementById("output");
  const bgColor = 1118481;
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(bgColor, 1);
  renderer.clear();
  document.body.appendChild(renderer.domElement);
  scene = new Scene();
  const light = new DirectionalLight(16777215, 3.5);
  light.position.set(1, 2, 3);
  scene.add(light);
  const ambientLight = new AmbientLight(11583173, 0.5);
  scene.add(ambientLight);
  group = new Group();
  scene.add(group);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync("https://raw.githubusercontent.com/gkjohnson/3d-demo-data/main/models/nasa-m2020/Perseverance.glb");
  model = gltf.scene;
  const geometries = [];
  model.updateWorldMatrix(true, true);
  model.traverse((c) => {
    if (c.geometry) {
      const clone = c.geometry.clone();
      clone.applyMatrix4(c.matrixWorld);
      for (const key in clone.attributes) {
        if (key !== "position") {
          clone.deleteAttribute(key);
        }
      }
      geometries.push(clone);
    }
  });
  const mergedGeometry = mergeGeometries(geometries, false);
  bvh = new MeshBVH(mergedGeometry, { maxLeafSize: 1 });
  const box = new Box3();
  box.setFromObject(model, true);
  box.getCenter(group.position).multiplyScalar(-1);
  group.position.y = Math.max(0, -box.min.y) + 1;
  group.add(model);
  plane = new Mesh(new PlaneGeometry(5, 5), new MeshBasicMaterial({ color: 3355443, transparent: true, opacity: 0.5, side: DoubleSide }));
  plane.rotation.x = -Math.PI / 2;
  group.add(plane);
  projection = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: 15658734 }));
  projection.scale.y = 0;
  scene.add(projection);
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.setScalar(3.5);
  camera.updateProjectionMatrix();
  new OrbitControls(camera, renderer.domElement);
  updateLines();
  gui = new g();
  gui.add(params, "displayModel");
  gui.add(params, "planePosition", 0, 2.5).onChange(() => updateLines());
  render();
  window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);
}
function updateLines() {
  projection.geometry.dispose();
  const generator = new PlanarIntersectionGenerator();
  generator.plane.constant = -params.planePosition;
  let start, delta;
  start = performance.now();
  projection.geometry = generator.generate(bvh);
  delta = performance.now() - start;
  outputContainer.innerText = `${delta.toFixed(2)}ms`;
}
function render() {
  requestAnimationFrame(render);
  group.visible = params.displayModel;
  projection.visible = params.displayProjection;
  plane.position.y = params.planePosition;
  renderer.render(scene, camera);
}
//# sourceMappingURL=planarIntersection-BxzKAPYS.js.map
