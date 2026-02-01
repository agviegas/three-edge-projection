import { V as Vector3, u as OrthographicCamera, B as Box3, h as Mesh, ab as WebGLRenderTarget, C as Color, a1 as ShaderMaterial, b as Vector4, ak as NoBlending, al as GLSL3 } from "./PlanarIntersectionGenerator-8oHhWbT_-Xl0VRrR8.js";
function encodeId(id, target) {
  target.x = (id & 255) / 255;
  target.y = (id >> 8 & 255) / 255;
  target.z = (id >> 16 & 255) / 255;
  target.w = 1;
}
function decodeId(buffer, index) {
  return buffer[index] | buffer[index + 1] << 8 | buffer[index + 2] << 16;
}
function collectAllObjects(objects) {
  const result = /* @__PURE__ */ new Set();
  objects.traverse((c) => {
    if (c.isMesh) {
      result.add(c);
    }
  });
  return Array.from(result);
}
class VisibilityCuller {
  constructor(renderer, options = {}) {
    const { pixelsPerMeter = 0.1 } = options;
    this.pixelsPerMeter = pixelsPerMeter;
    this.renderer = renderer;
  }
  async cull(objects) {
    objects = collectAllObjects(objects);
    const { renderer, pixelsPerMeter } = this;
    const size = new Vector3();
    const camera = new OrthographicCamera();
    const box = new Box3();
    const idMesh = new Mesh(void 0, new IDMaterial());
    idMesh.matrixAutoUpdate = false;
    idMesh.matrixWorldAutoUpdate = false;
    const target = new WebGLRenderTarget(1, 1);
    box.makeEmpty();
    objects.forEach((o) => {
      box.expandByObject(o);
    });
    box.getSize(size);
    const maxTextureSize = Math.min(renderer.capabilities.maxTextureSize, 2 ** 13);
    const pixelWidth = Math.ceil(size.x / pixelsPerMeter);
    const pixelHeight = Math.ceil(size.z / pixelsPerMeter);
    const tilesX = Math.ceil(pixelWidth / maxTextureSize);
    const tilesY = Math.ceil(pixelHeight / maxTextureSize);
    target.setSize(Math.ceil(pixelWidth / tilesX), Math.ceil(pixelHeight / tilesY));
    camera.rotation.x = -Math.PI / 2;
    camera.far = box.max.y - box.min.y;
    camera.position.y = box.max.y;
    const color = renderer.getClearColor(new Color());
    const alpha = renderer.getClearAlpha();
    const renderTarget = renderer.getRenderTarget();
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setClearColor(0, 0);
    renderer.setRenderTarget(target);
    const readBuffer = new Uint8Array(target.width * target.height * 4);
    const visibleSet = /* @__PURE__ */ new Set();
    const stepX = size.x / tilesX;
    const stepY = size.z / tilesY;
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        camera.left = box.min.x + stepX * x;
        camera.bottom = box.min.z + stepY * y;
        camera.right = camera.left + stepX;
        camera.top = camera.bottom + stepY;
        camera.updateProjectionMatrix();
        renderer.clear();
        for (let i = 0; i < objects.length; i++) {
          const object = objects[i];
          idMesh.matrixWorld.copy(object.matrixWorld);
          idMesh.geometry = object.geometry;
          idMesh.material.objectId = i;
          renderer.render(idMesh, camera);
        }
        const buffer = await renderer.readRenderTargetPixelsAsync(target, 0, 0, target.width, target.height, readBuffer);
        for (let i = 0, l = buffer.length; i < l; i += 4) {
          if (buffer[i + 3] === 0) continue;
          const id = decodeId(buffer, i);
          visibleSet.add(objects[id]);
        }
      }
    }
    renderer.setClearColor(color, alpha);
    renderer.setRenderTarget(renderTarget);
    renderer.autoClear = autoClear;
    idMesh.material.dispose();
    target.dispose();
    console.log(objects.length, visibleSet.size);
    return Array.from(visibleSet);
  }
}
class IDMaterial extends ShaderMaterial {
  set objectId(v) {
    encodeId(v, this.uniforms.objectId.value);
  }
  constructor(params) {
    super({
      glslVersion: GLSL3,
      blending: NoBlending,
      uniforms: {
        objectId: { value: new Vector4() }
      },
      vertexShader: (
        /* glsl */
        `
				void main() {

					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `
				layout(location = 0) out vec4 out_id;
				uniform vec4 objectId;

				void main() {

					out_id = objectId;

				}
			`
      )
    });
    this.setValues(params);
  }
}
export {
  VisibilityCuller as V
};
//# sourceMappingURL=VisibilityCuller-1jF7k2nk-Bzy_tDws.js.map
