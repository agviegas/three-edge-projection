import "./modulepreload-polyfill-DaKOjhqt.js";
import { I as Inspector } from "./Inspector-Bw7mdRhQ.js";
import { af as nodeObject, ag as convertToTexture, ah as TempNode, u as uniform, ai as passTexture, aj as NodeUpdateType, ak as RendererUtils, al as QuadMesh, X as uv, a8 as vec2, F as Fn, a as vec4, f as float, N as NodeMaterial, am as premultiplyAlpha, an as unpremultiplyAlpha, M as MeshBasicNodeMaterial, aa as positionWorld, i as instancedArray, c as instanceIndex, U as hash, r as uint, V as vec3, ac as texture, I as If, z as time, p as positionLocal, P as screenUV, Q as color, W as WebGPURenderer, ao as pass, ap as PostProcessing, D as MeshStandardNodeMaterial } from "./three.tsl-CucFAqAO.js";
import { b as Vector2, b4 as RenderTarget, m as BufferGeometry, M as Matrix4, V as Vector3, v as Vector4, n as BufferAttribute, h as PerspectiveCamera, a4 as Scene, am as Fog, a5 as DirectionalLight, b7 as HemisphereLight, j as OrthographicCamera, a$ as HalfFloatType, aD as NearestFilter, _ as SphereGeometry, E as PlaneGeometry, s as Mesh, ac as MeshStandardMaterial, a_ as ACESFilmicToneMapping, G as Group, b8 as ConeGeometry, A as CylinderGeometry } from "./three.core-CntQ0PPt.js";
import "./three.module-Jt-9Ru2o.js";
import { O as OrbitControls } from "./OrbitControls-BwrKLbo_.js";
const _quadMesh = /* @__PURE__ */ new QuadMesh();
let _rendererState;
class GaussianBlurNode extends TempNode {
  static get type() {
    return "GaussianBlurNode";
  }
  /**
   * Constructs a new gaussian blur node.
   *
   * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
   * @param {Node<vec2|float>} directionNode - Defines the direction and radius of the blur.
   * @param {number} sigma - Controls the kernel of the blur filter. Higher values mean a wider blur radius.
   * @param {Object} [options={}] - Additional options for the gaussian blur effect.
   * @param {boolean} [options.premultipliedAlpha=false] - Whether to use premultiplied alpha for the blur effect.
   * @param {number} [options.resolutionScale=1] - The resolution of the effect. 0.5 means half the resolution of the texture node.
   */
  constructor(textureNode, directionNode = null, sigma = 4, options = {}) {
    super("vec4");
    this.textureNode = textureNode;
    this.directionNode = directionNode;
    this.sigma = sigma;
    this._invSize = uniform(new Vector2());
    this._passDirection = uniform(new Vector2());
    this._horizontalRT = new RenderTarget(1, 1, { depthBuffer: false });
    this._horizontalRT.texture.name = "GaussianBlurNode.horizontal";
    this._verticalRT = new RenderTarget(1, 1, { depthBuffer: false });
    this._verticalRT.texture.name = "GaussianBlurNode.vertical";
    this._textureNode = passTexture(this, this._verticalRT.texture);
    this._textureNode.uvNode = textureNode.uvNode;
    this.updateBeforeType = NodeUpdateType.FRAME;
    this.resolutionScale = options.resolutionScale || 1;
    this.premultipliedAlpha = options.premultipliedAlpha || false;
  }
  /**
   * Sets the size of the effect.
   *
   * @param {number} width - The width of the effect.
   * @param {number} height - The height of the effect.
   */
  setSize(width, height) {
    width = Math.max(Math.round(width * this.resolutionScale), 1);
    height = Math.max(Math.round(height * this.resolutionScale), 1);
    this._invSize.value.set(1 / width, 1 / height);
    this._horizontalRT.setSize(width, height);
    this._verticalRT.setSize(width, height);
  }
  /**
   * This method is used to render the effect once per frame.
   *
   * @param {NodeFrame} frame - The current node frame.
   */
  updateBefore(frame) {
    const { renderer: renderer2 } = frame;
    _rendererState = RendererUtils.resetRendererState(renderer2, _rendererState);
    const textureNode = this.textureNode;
    const map = textureNode.value;
    const currentTexture = textureNode.value;
    _quadMesh.material = this._material;
    this.setSize(map.image.width, map.image.height);
    const textureType = map.type;
    this._horizontalRT.texture.type = textureType;
    this._verticalRT.texture.type = textureType;
    renderer2.setRenderTarget(this._horizontalRT);
    this._passDirection.value.set(1, 0);
    _quadMesh.name = "Gaussian Blur [ Horizontal Pass ]";
    _quadMesh.render(renderer2);
    textureNode.value = this._horizontalRT.texture;
    renderer2.setRenderTarget(this._verticalRT);
    this._passDirection.value.set(0, 1);
    _quadMesh.name = "Gaussian Blur [ Vertical Pass ]";
    _quadMesh.render(renderer2);
    textureNode.value = currentTexture;
    RendererUtils.restoreRendererState(renderer2, _rendererState);
  }
  /**
   * Returns the result of the effect as a texture node.
   *
   * @return {PassTextureNode} A texture node that represents the result of the effect.
   */
  getTextureNode() {
    return this._textureNode;
  }
  /**
   * This method is used to setup the effect's TSL code.
   *
   * @param {NodeBuilder} builder - The current node builder.
   * @return {PassTextureNode}
   */
  setup(builder) {
    const textureNode = this.textureNode;
    const uvNode = uv();
    const directionNode = vec2(this.directionNode || 1);
    let sampleTexture, output;
    if (this.premultipliedAlpha) {
      sampleTexture = (uv2) => premultiplyAlpha(textureNode.sample(uv2));
      output = (color2) => unpremultiplyAlpha(color2);
    } else {
      sampleTexture = (uv2) => textureNode.sample(uv2);
      output = (color2) => color2;
    }
    const blur = Fn(() => {
      const kernelSize = 3 + 2 * this.sigma;
      const gaussianCoefficients = this._getCoefficients(kernelSize);
      const invSize = this._invSize;
      const direction = directionNode.mul(this._passDirection);
      const diffuseSum = vec4(sampleTexture(uvNode).mul(gaussianCoefficients[0])).toVar();
      for (let i = 1; i < kernelSize; i++) {
        const x = float(i);
        const w = float(gaussianCoefficients[i]);
        const uvOffset = vec2(direction.mul(invSize.mul(x))).toVar();
        const sample1 = sampleTexture(uvNode.add(uvOffset));
        const sample2 = sampleTexture(uvNode.sub(uvOffset));
        diffuseSum.addAssign(sample1.add(sample2).mul(w));
      }
      return output(diffuseSum);
    });
    const material = this._material || (this._material = new NodeMaterial());
    material.fragmentNode = blur().context(builder.getSharedContext());
    material.name = "Gaussian_blur";
    material.needsUpdate = true;
    const properties = builder.getNodeProperties(this);
    properties.textureNode = textureNode;
    return this._textureNode;
  }
  /**
   * Frees internal resources. This method should be called
   * when the effect is no longer required.
   */
  dispose() {
    this._horizontalRT.dispose();
    this._verticalRT.dispose();
  }
  /**
   * Computes gaussian coefficients depending on the given kernel radius.
   *
   * @private
   * @param {number} kernelRadius - The kernel radius.
   * @return {Array<number>}
   */
  _getCoefficients(kernelRadius) {
    const coefficients = [];
    const sigma = kernelRadius / 3;
    for (let i = 0; i < kernelRadius; i++) {
      coefficients.push(0.39894 * Math.exp(-0.5 * i * i / (sigma * sigma)) / sigma);
    }
    return coefficients;
  }
  /**
   * The resolution scale.
   *
   * @deprecated
   * @type {Vector2}
   * @default {(1,1)}
   */
  get resolution() {
    console.warn('THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.');
    return new Vector2(this.resolutionScale, this.resolutionScale);
  }
  set resolution(value) {
    console.warn('THREE.GaussianBlurNode: The "resolution" property has been renamed to "resolutionScale" and is now of type `number`.');
    this.resolutionScale = value.x;
  }
}
const gaussianBlur = (node, directionNode, sigma, options = {}) => nodeObject(new GaussianBlurNode(convertToTexture(node), directionNode, sigma, options));
class TeapotGeometry extends BufferGeometry {
  /**
   * Constructs a new teapot geometry.
   *
   * @param {number} [size=50] - Relative scale of the teapot.
   * @param {number} [segments=10] - Number of line segments to subdivide each patch edge.
   * @param {boolean} [bottom=true] - Whether the bottom of the teapot is generated or not.
   * @param {boolean} [lid=true] - Whether the lid is generated or not.
   * @param {boolean} [body=true] - Whether the body is generated or not.
   * @param {boolean} [fitLid=true] - Whether the lid is slightly stretched to prevent gaps between the body and lid or not.
   * @param {boolean} [blinn=true] -  Whether the teapot is scaled vertically for better aesthetics or not.
   */
  constructor(size = 50, segments = 10, bottom = true, lid = true, body = true, fitLid = true, blinn = true) {
    const teapotPatches = [
      /*rim*/
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      3,
      16,
      17,
      18,
      7,
      19,
      20,
      21,
      11,
      22,
      23,
      24,
      15,
      25,
      26,
      27,
      18,
      28,
      29,
      30,
      21,
      31,
      32,
      33,
      24,
      34,
      35,
      36,
      27,
      37,
      38,
      39,
      30,
      40,
      41,
      0,
      33,
      42,
      43,
      4,
      36,
      44,
      45,
      8,
      39,
      46,
      47,
      12,
      /*body*/
      12,
      13,
      14,
      15,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      15,
      25,
      26,
      27,
      51,
      60,
      61,
      62,
      55,
      63,
      64,
      65,
      59,
      66,
      67,
      68,
      27,
      37,
      38,
      39,
      62,
      69,
      70,
      71,
      65,
      72,
      73,
      74,
      68,
      75,
      76,
      77,
      39,
      46,
      47,
      12,
      71,
      78,
      79,
      48,
      74,
      80,
      81,
      52,
      77,
      82,
      83,
      56,
      56,
      57,
      58,
      59,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91,
      92,
      93,
      94,
      95,
      59,
      66,
      67,
      68,
      87,
      96,
      97,
      98,
      91,
      99,
      100,
      101,
      95,
      102,
      103,
      104,
      68,
      75,
      76,
      77,
      98,
      105,
      106,
      107,
      101,
      108,
      109,
      110,
      104,
      111,
      112,
      113,
      77,
      82,
      83,
      56,
      107,
      114,
      115,
      84,
      110,
      116,
      117,
      88,
      113,
      118,
      119,
      92,
      /*handle*/
      120,
      121,
      122,
      123,
      124,
      125,
      126,
      127,
      128,
      129,
      130,
      131,
      132,
      133,
      134,
      135,
      123,
      136,
      137,
      120,
      127,
      138,
      139,
      124,
      131,
      140,
      141,
      128,
      135,
      142,
      143,
      132,
      132,
      133,
      134,
      135,
      144,
      145,
      146,
      147,
      148,
      149,
      150,
      151,
      68,
      152,
      153,
      154,
      135,
      142,
      143,
      132,
      147,
      155,
      156,
      144,
      151,
      157,
      158,
      148,
      154,
      159,
      160,
      68,
      /*spout*/
      161,
      162,
      163,
      164,
      165,
      166,
      167,
      168,
      169,
      170,
      171,
      172,
      173,
      174,
      175,
      176,
      164,
      177,
      178,
      161,
      168,
      179,
      180,
      165,
      172,
      181,
      182,
      169,
      176,
      183,
      184,
      173,
      173,
      174,
      175,
      176,
      185,
      186,
      187,
      188,
      189,
      190,
      191,
      192,
      193,
      194,
      195,
      196,
      176,
      183,
      184,
      173,
      188,
      197,
      198,
      185,
      192,
      199,
      200,
      189,
      196,
      201,
      202,
      193,
      /*lid*/
      203,
      203,
      203,
      203,
      204,
      205,
      206,
      207,
      208,
      208,
      208,
      208,
      209,
      210,
      211,
      212,
      203,
      203,
      203,
      203,
      207,
      213,
      214,
      215,
      208,
      208,
      208,
      208,
      212,
      216,
      217,
      218,
      203,
      203,
      203,
      203,
      215,
      219,
      220,
      221,
      208,
      208,
      208,
      208,
      218,
      222,
      223,
      224,
      203,
      203,
      203,
      203,
      221,
      225,
      226,
      204,
      208,
      208,
      208,
      208,
      224,
      227,
      228,
      209,
      209,
      210,
      211,
      212,
      229,
      230,
      231,
      232,
      233,
      234,
      235,
      236,
      237,
      238,
      239,
      240,
      212,
      216,
      217,
      218,
      232,
      241,
      242,
      243,
      236,
      244,
      245,
      246,
      240,
      247,
      248,
      249,
      218,
      222,
      223,
      224,
      243,
      250,
      251,
      252,
      246,
      253,
      254,
      255,
      249,
      256,
      257,
      258,
      224,
      227,
      228,
      209,
      252,
      259,
      260,
      229,
      255,
      261,
      262,
      233,
      258,
      263,
      264,
      237,
      /*bottom*/
      265,
      265,
      265,
      265,
      266,
      267,
      268,
      269,
      270,
      271,
      272,
      273,
      92,
      119,
      118,
      113,
      265,
      265,
      265,
      265,
      269,
      274,
      275,
      276,
      273,
      277,
      278,
      279,
      113,
      112,
      111,
      104,
      265,
      265,
      265,
      265,
      276,
      280,
      281,
      282,
      279,
      283,
      284,
      285,
      104,
      103,
      102,
      95,
      265,
      265,
      265,
      265,
      282,
      286,
      287,
      266,
      285,
      288,
      289,
      270,
      95,
      94,
      93,
      92
    ];
    const teapotVertices = [
      1.4,
      0,
      2.4,
      1.4,
      -0.784,
      2.4,
      0.784,
      -1.4,
      2.4,
      0,
      -1.4,
      2.4,
      1.3375,
      0,
      2.53125,
      1.3375,
      -0.749,
      2.53125,
      0.749,
      -1.3375,
      2.53125,
      0,
      -1.3375,
      2.53125,
      1.4375,
      0,
      2.53125,
      1.4375,
      -0.805,
      2.53125,
      0.805,
      -1.4375,
      2.53125,
      0,
      -1.4375,
      2.53125,
      1.5,
      0,
      2.4,
      1.5,
      -0.84,
      2.4,
      0.84,
      -1.5,
      2.4,
      0,
      -1.5,
      2.4,
      -0.784,
      -1.4,
      2.4,
      -1.4,
      -0.784,
      2.4,
      -1.4,
      0,
      2.4,
      -0.749,
      -1.3375,
      2.53125,
      -1.3375,
      -0.749,
      2.53125,
      -1.3375,
      0,
      2.53125,
      -0.805,
      -1.4375,
      2.53125,
      -1.4375,
      -0.805,
      2.53125,
      -1.4375,
      0,
      2.53125,
      -0.84,
      -1.5,
      2.4,
      -1.5,
      -0.84,
      2.4,
      -1.5,
      0,
      2.4,
      -1.4,
      0.784,
      2.4,
      -0.784,
      1.4,
      2.4,
      0,
      1.4,
      2.4,
      -1.3375,
      0.749,
      2.53125,
      -0.749,
      1.3375,
      2.53125,
      0,
      1.3375,
      2.53125,
      -1.4375,
      0.805,
      2.53125,
      -0.805,
      1.4375,
      2.53125,
      0,
      1.4375,
      2.53125,
      -1.5,
      0.84,
      2.4,
      -0.84,
      1.5,
      2.4,
      0,
      1.5,
      2.4,
      0.784,
      1.4,
      2.4,
      1.4,
      0.784,
      2.4,
      0.749,
      1.3375,
      2.53125,
      1.3375,
      0.749,
      2.53125,
      0.805,
      1.4375,
      2.53125,
      1.4375,
      0.805,
      2.53125,
      0.84,
      1.5,
      2.4,
      1.5,
      0.84,
      2.4,
      1.75,
      0,
      1.875,
      1.75,
      -0.98,
      1.875,
      0.98,
      -1.75,
      1.875,
      0,
      -1.75,
      1.875,
      2,
      0,
      1.35,
      2,
      -1.12,
      1.35,
      1.12,
      -2,
      1.35,
      0,
      -2,
      1.35,
      2,
      0,
      0.9,
      2,
      -1.12,
      0.9,
      1.12,
      -2,
      0.9,
      0,
      -2,
      0.9,
      -0.98,
      -1.75,
      1.875,
      -1.75,
      -0.98,
      1.875,
      -1.75,
      0,
      1.875,
      -1.12,
      -2,
      1.35,
      -2,
      -1.12,
      1.35,
      -2,
      0,
      1.35,
      -1.12,
      -2,
      0.9,
      -2,
      -1.12,
      0.9,
      -2,
      0,
      0.9,
      -1.75,
      0.98,
      1.875,
      -0.98,
      1.75,
      1.875,
      0,
      1.75,
      1.875,
      -2,
      1.12,
      1.35,
      -1.12,
      2,
      1.35,
      0,
      2,
      1.35,
      -2,
      1.12,
      0.9,
      -1.12,
      2,
      0.9,
      0,
      2,
      0.9,
      0.98,
      1.75,
      1.875,
      1.75,
      0.98,
      1.875,
      1.12,
      2,
      1.35,
      2,
      1.12,
      1.35,
      1.12,
      2,
      0.9,
      2,
      1.12,
      0.9,
      2,
      0,
      0.45,
      2,
      -1.12,
      0.45,
      1.12,
      -2,
      0.45,
      0,
      -2,
      0.45,
      1.5,
      0,
      0.225,
      1.5,
      -0.84,
      0.225,
      0.84,
      -1.5,
      0.225,
      0,
      -1.5,
      0.225,
      1.5,
      0,
      0.15,
      1.5,
      -0.84,
      0.15,
      0.84,
      -1.5,
      0.15,
      0,
      -1.5,
      0.15,
      -1.12,
      -2,
      0.45,
      -2,
      -1.12,
      0.45,
      -2,
      0,
      0.45,
      -0.84,
      -1.5,
      0.225,
      -1.5,
      -0.84,
      0.225,
      -1.5,
      0,
      0.225,
      -0.84,
      -1.5,
      0.15,
      -1.5,
      -0.84,
      0.15,
      -1.5,
      0,
      0.15,
      -2,
      1.12,
      0.45,
      -1.12,
      2,
      0.45,
      0,
      2,
      0.45,
      -1.5,
      0.84,
      0.225,
      -0.84,
      1.5,
      0.225,
      0,
      1.5,
      0.225,
      -1.5,
      0.84,
      0.15,
      -0.84,
      1.5,
      0.15,
      0,
      1.5,
      0.15,
      1.12,
      2,
      0.45,
      2,
      1.12,
      0.45,
      0.84,
      1.5,
      0.225,
      1.5,
      0.84,
      0.225,
      0.84,
      1.5,
      0.15,
      1.5,
      0.84,
      0.15,
      -1.6,
      0,
      2.025,
      -1.6,
      -0.3,
      2.025,
      -1.5,
      -0.3,
      2.25,
      -1.5,
      0,
      2.25,
      -2.3,
      0,
      2.025,
      -2.3,
      -0.3,
      2.025,
      -2.5,
      -0.3,
      2.25,
      -2.5,
      0,
      2.25,
      -2.7,
      0,
      2.025,
      -2.7,
      -0.3,
      2.025,
      -3,
      -0.3,
      2.25,
      -3,
      0,
      2.25,
      -2.7,
      0,
      1.8,
      -2.7,
      -0.3,
      1.8,
      -3,
      -0.3,
      1.8,
      -3,
      0,
      1.8,
      -1.5,
      0.3,
      2.25,
      -1.6,
      0.3,
      2.025,
      -2.5,
      0.3,
      2.25,
      -2.3,
      0.3,
      2.025,
      -3,
      0.3,
      2.25,
      -2.7,
      0.3,
      2.025,
      -3,
      0.3,
      1.8,
      -2.7,
      0.3,
      1.8,
      -2.7,
      0,
      1.575,
      -2.7,
      -0.3,
      1.575,
      -3,
      -0.3,
      1.35,
      -3,
      0,
      1.35,
      -2.5,
      0,
      1.125,
      -2.5,
      -0.3,
      1.125,
      -2.65,
      -0.3,
      0.9375,
      -2.65,
      0,
      0.9375,
      -2,
      -0.3,
      0.9,
      -1.9,
      -0.3,
      0.6,
      -1.9,
      0,
      0.6,
      -3,
      0.3,
      1.35,
      -2.7,
      0.3,
      1.575,
      -2.65,
      0.3,
      0.9375,
      -2.5,
      0.3,
      1.125,
      -1.9,
      0.3,
      0.6,
      -2,
      0.3,
      0.9,
      1.7,
      0,
      1.425,
      1.7,
      -0.66,
      1.425,
      1.7,
      -0.66,
      0.6,
      1.7,
      0,
      0.6,
      2.6,
      0,
      1.425,
      2.6,
      -0.66,
      1.425,
      3.1,
      -0.66,
      0.825,
      3.1,
      0,
      0.825,
      2.3,
      0,
      2.1,
      2.3,
      -0.25,
      2.1,
      2.4,
      -0.25,
      2.025,
      2.4,
      0,
      2.025,
      2.7,
      0,
      2.4,
      2.7,
      -0.25,
      2.4,
      3.3,
      -0.25,
      2.4,
      3.3,
      0,
      2.4,
      1.7,
      0.66,
      0.6,
      1.7,
      0.66,
      1.425,
      3.1,
      0.66,
      0.825,
      2.6,
      0.66,
      1.425,
      2.4,
      0.25,
      2.025,
      2.3,
      0.25,
      2.1,
      3.3,
      0.25,
      2.4,
      2.7,
      0.25,
      2.4,
      2.8,
      0,
      2.475,
      2.8,
      -0.25,
      2.475,
      3.525,
      -0.25,
      2.49375,
      3.525,
      0,
      2.49375,
      2.9,
      0,
      2.475,
      2.9,
      -0.15,
      2.475,
      3.45,
      -0.15,
      2.5125,
      3.45,
      0,
      2.5125,
      2.8,
      0,
      2.4,
      2.8,
      -0.15,
      2.4,
      3.2,
      -0.15,
      2.4,
      3.2,
      0,
      2.4,
      3.525,
      0.25,
      2.49375,
      2.8,
      0.25,
      2.475,
      3.45,
      0.15,
      2.5125,
      2.9,
      0.15,
      2.475,
      3.2,
      0.15,
      2.4,
      2.8,
      0.15,
      2.4,
      0,
      0,
      3.15,
      0.8,
      0,
      3.15,
      0.8,
      -0.45,
      3.15,
      0.45,
      -0.8,
      3.15,
      0,
      -0.8,
      3.15,
      0,
      0,
      2.85,
      0.2,
      0,
      2.7,
      0.2,
      -0.112,
      2.7,
      0.112,
      -0.2,
      2.7,
      0,
      -0.2,
      2.7,
      -0.45,
      -0.8,
      3.15,
      -0.8,
      -0.45,
      3.15,
      -0.8,
      0,
      3.15,
      -0.112,
      -0.2,
      2.7,
      -0.2,
      -0.112,
      2.7,
      -0.2,
      0,
      2.7,
      -0.8,
      0.45,
      3.15,
      -0.45,
      0.8,
      3.15,
      0,
      0.8,
      3.15,
      -0.2,
      0.112,
      2.7,
      -0.112,
      0.2,
      2.7,
      0,
      0.2,
      2.7,
      0.45,
      0.8,
      3.15,
      0.8,
      0.45,
      3.15,
      0.112,
      0.2,
      2.7,
      0.2,
      0.112,
      2.7,
      0.4,
      0,
      2.55,
      0.4,
      -0.224,
      2.55,
      0.224,
      -0.4,
      2.55,
      0,
      -0.4,
      2.55,
      1.3,
      0,
      2.55,
      1.3,
      -0.728,
      2.55,
      0.728,
      -1.3,
      2.55,
      0,
      -1.3,
      2.55,
      1.3,
      0,
      2.4,
      1.3,
      -0.728,
      2.4,
      0.728,
      -1.3,
      2.4,
      0,
      -1.3,
      2.4,
      -0.224,
      -0.4,
      2.55,
      -0.4,
      -0.224,
      2.55,
      -0.4,
      0,
      2.55,
      -0.728,
      -1.3,
      2.55,
      -1.3,
      -0.728,
      2.55,
      -1.3,
      0,
      2.55,
      -0.728,
      -1.3,
      2.4,
      -1.3,
      -0.728,
      2.4,
      -1.3,
      0,
      2.4,
      -0.4,
      0.224,
      2.55,
      -0.224,
      0.4,
      2.55,
      0,
      0.4,
      2.55,
      -1.3,
      0.728,
      2.55,
      -0.728,
      1.3,
      2.55,
      0,
      1.3,
      2.55,
      -1.3,
      0.728,
      2.4,
      -0.728,
      1.3,
      2.4,
      0,
      1.3,
      2.4,
      0.224,
      0.4,
      2.55,
      0.4,
      0.224,
      2.55,
      0.728,
      1.3,
      2.55,
      1.3,
      0.728,
      2.55,
      0.728,
      1.3,
      2.4,
      1.3,
      0.728,
      2.4,
      0,
      0,
      0,
      1.425,
      0,
      0,
      1.425,
      0.798,
      0,
      0.798,
      1.425,
      0,
      0,
      1.425,
      0,
      1.5,
      0,
      0.075,
      1.5,
      0.84,
      0.075,
      0.84,
      1.5,
      0.075,
      0,
      1.5,
      0.075,
      -0.798,
      1.425,
      0,
      -1.425,
      0.798,
      0,
      -1.425,
      0,
      0,
      -0.84,
      1.5,
      0.075,
      -1.5,
      0.84,
      0.075,
      -1.5,
      0,
      0.075,
      -1.425,
      -0.798,
      0,
      -0.798,
      -1.425,
      0,
      0,
      -1.425,
      0,
      -1.5,
      -0.84,
      0.075,
      -0.84,
      -1.5,
      0.075,
      0,
      -1.5,
      0.075,
      0.798,
      -1.425,
      0,
      1.425,
      -0.798,
      0,
      0.84,
      -1.5,
      0.075,
      1.5,
      -0.84,
      0.075
    ];
    super();
    segments = Math.max(2, Math.floor(segments));
    const blinnScale = 1.3;
    const maxHeight = 3.15 * (blinn ? 1 : blinnScale);
    const maxHeight2 = maxHeight / 2;
    const trueSize = size / maxHeight2;
    let numTriangles = bottom ? (8 * segments - 4) * segments : 0;
    numTriangles += lid ? (16 * segments - 4) * segments : 0;
    numTriangles += body ? 40 * segments * segments : 0;
    const indices = new Uint32Array(numTriangles * 3);
    let numVertices = bottom ? 4 : 0;
    numVertices += lid ? 8 : 0;
    numVertices += body ? 20 : 0;
    numVertices *= (segments + 1) * (segments + 1);
    const vertices = new Float32Array(numVertices * 3);
    const normals = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);
    const ms = new Matrix4();
    ms.set(
      -1,
      3,
      -3,
      1,
      3,
      -6,
      3,
      0,
      -3,
      3,
      0,
      0,
      1,
      0,
      0,
      0
    );
    const g = [];
    const sp = [];
    const tp = [];
    const dsp = [];
    const dtp = [];
    const mgm = [];
    const vert = [];
    const sdir = [];
    const tdir = [];
    const norm = new Vector3();
    let tcoord;
    let sval;
    let tval;
    let p;
    let dsval = 0;
    let dtval = 0;
    const normOut = new Vector3();
    const gmx = new Matrix4();
    const tmtx = new Matrix4();
    const vsp = new Vector4();
    const vtp = new Vector4();
    const vdsp = new Vector4();
    const vdtp = new Vector4();
    const vsdir = new Vector3();
    const vtdir = new Vector3();
    const mst = ms.clone();
    mst.transpose();
    const notDegenerate = (vtx1, vtx2, vtx3) => (
      // if any vertex matches, return false
      !(vertices[vtx1 * 3] === vertices[vtx2 * 3] && vertices[vtx1 * 3 + 1] === vertices[vtx2 * 3 + 1] && vertices[vtx1 * 3 + 2] === vertices[vtx2 * 3 + 2] || vertices[vtx1 * 3] === vertices[vtx3 * 3] && vertices[vtx1 * 3 + 1] === vertices[vtx3 * 3 + 1] && vertices[vtx1 * 3 + 2] === vertices[vtx3 * 3 + 2] || vertices[vtx2 * 3] === vertices[vtx3 * 3] && vertices[vtx2 * 3 + 1] === vertices[vtx3 * 3 + 1] && vertices[vtx2 * 3 + 2] === vertices[vtx3 * 3 + 2])
    );
    for (let i = 0; i < 3; i++) {
      mgm[i] = new Matrix4();
    }
    const minPatches = body ? 0 : 20;
    const maxPatches = bottom ? 32 : 28;
    const vertPerRow = segments + 1;
    let surfCount = 0;
    let vertCount = 0;
    let normCount = 0;
    let uvCount = 0;
    let indexCount = 0;
    for (let surf = minPatches; surf < maxPatches; surf++) {
      if (lid || (surf < 20 || surf >= 28)) {
        for (let i = 0; i < 3; i++) {
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              g[c * 4 + r] = teapotVertices[teapotPatches[surf * 16 + r * 4 + c] * 3 + i];
              if (fitLid && (surf >= 20 && surf < 28) && i !== 2) {
                g[c * 4 + r] *= 1.077;
              }
              if (!blinn && i === 2) {
                g[c * 4 + r] *= blinnScale;
              }
            }
          }
          gmx.set(g[0], g[1], g[2], g[3], g[4], g[5], g[6], g[7], g[8], g[9], g[10], g[11], g[12], g[13], g[14], g[15]);
          tmtx.multiplyMatrices(gmx, ms);
          mgm[i].multiplyMatrices(mst, tmtx);
        }
        for (let sstep = 0; sstep <= segments; sstep++) {
          const s = sstep / segments;
          for (let tstep = 0; tstep <= segments; tstep++) {
            const t = tstep / segments;
            for (p = 4, sval = tval = 1; p--; ) {
              sp[p] = sval;
              tp[p] = tval;
              sval *= s;
              tval *= t;
              if (p === 3) {
                dsp[p] = dtp[p] = 0;
                dsval = dtval = 1;
              } else {
                dsp[p] = dsval * (3 - p);
                dtp[p] = dtval * (3 - p);
                dsval *= s;
                dtval *= t;
              }
            }
            vsp.fromArray(sp);
            vtp.fromArray(tp);
            vdsp.fromArray(dsp);
            vdtp.fromArray(dtp);
            for (let i = 0; i < 3; i++) {
              tcoord = vsp.clone();
              tcoord.applyMatrix4(mgm[i]);
              vert[i] = tcoord.dot(vtp);
              tcoord = vdsp.clone();
              tcoord.applyMatrix4(mgm[i]);
              sdir[i] = tcoord.dot(vtp);
              tcoord = vsp.clone();
              tcoord.applyMatrix4(mgm[i]);
              tdir[i] = tcoord.dot(vdtp);
            }
            vsdir.fromArray(sdir);
            vtdir.fromArray(tdir);
            norm.crossVectors(vtdir, vsdir);
            norm.normalize();
            if (vert[0] === 0 && vert[1] === 0) {
              normOut.set(0, vert[2] > maxHeight2 ? 1 : -1, 0);
            } else {
              normOut.set(norm.x, norm.z, -norm.y);
            }
            vertices[vertCount++] = trueSize * vert[0];
            vertices[vertCount++] = trueSize * (vert[2] - maxHeight2);
            vertices[vertCount++] = -trueSize * vert[1];
            normals[normCount++] = normOut.x;
            normals[normCount++] = normOut.y;
            normals[normCount++] = normOut.z;
            uvs[uvCount++] = 1 - t;
            uvs[uvCount++] = 1 - s;
          }
        }
        for (let sstep = 0; sstep < segments; sstep++) {
          for (let tstep = 0; tstep < segments; tstep++) {
            const v1 = surfCount * vertPerRow * vertPerRow + sstep * vertPerRow + tstep;
            const v2 = v1 + 1;
            const v3 = v2 + vertPerRow;
            const v4 = v1 + vertPerRow;
            if (notDegenerate(v1, v2, v3)) {
              indices[indexCount++] = v1;
              indices[indexCount++] = v2;
              indices[indexCount++] = v3;
            }
            if (notDegenerate(v1, v3, v4)) {
              indices[indexCount++] = v1;
              indices[indexCount++] = v3;
              indices[indexCount++] = v4;
            }
          }
        }
        surfCount++;
      }
    }
    this.setIndex(new BufferAttribute(indices, 1));
    this.setAttribute("position", new BufferAttribute(vertices, 3));
    this.setAttribute("normal", new BufferAttribute(normals, 3));
    this.setAttribute("uv", new BufferAttribute(uvs, 2));
    this.computeBoundingSphere();
  }
}
const maxParticleCount = 1e5;
let camera, scene, renderer;
let controls;
let computeParticles;
let postProcessing;
let collisionCamera, collisionPosRT, collisionPosMaterial;
init();
async function init() {
  const { innerWidth, innerHeight } = window;
  camera = new PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(20, 2, 20);
  camera.layers.enable(2);
  camera.lookAt(0, 40, 0);
  scene = new Scene();
  scene.fog = new Fog(998455, 5, 40);
  const dirLight = new DirectionalLight(16383899, 9);
  dirLight.castShadow = true;
  dirLight.position.set(10, 10, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.bias = -9e-3;
  scene.add(dirLight);
  scene.add(new HemisphereLight(998455, 527632, 100));
  collisionCamera = new OrthographicCamera(-50, 50, 50, -50, 0.1, 50);
  collisionCamera.position.y = 50;
  collisionCamera.lookAt(0, 0, 0);
  collisionCamera.layers.enable(1);
  collisionPosRT = new RenderTarget(1024, 1024);
  collisionPosRT.texture.type = HalfFloatType;
  collisionPosRT.texture.magFilter = NearestFilter;
  collisionPosRT.texture.minFilter = NearestFilter;
  collisionPosRT.texture.generateMipmaps = false;
  collisionPosMaterial = new MeshBasicNodeMaterial();
  collisionPosMaterial.fog = false;
  collisionPosMaterial.toneMapped = false;
  collisionPosMaterial.colorNode = positionWorld.y;
  const positionBuffer = instancedArray(maxParticleCount, "vec3");
  const scaleBuffer = instancedArray(maxParticleCount, "vec3");
  const staticPositionBuffer = instancedArray(maxParticleCount, "vec3");
  const dataBuffer = instancedArray(maxParticleCount, "vec4");
  const randUint = () => uint(Math.random() * 16777215);
  const computeInit = Fn(() => {
    const position = positionBuffer.element(instanceIndex);
    const scale = scaleBuffer.element(instanceIndex);
    const particleData = dataBuffer.element(instanceIndex);
    const randX = hash(instanceIndex);
    const randY = hash(instanceIndex.add(randUint()));
    const randZ = hash(instanceIndex.add(randUint()));
    position.x = randX.mul(100).add(-50);
    position.y = randY.mul(500).add(3);
    position.z = randZ.mul(100).add(-50);
    scale.xyz = hash(instanceIndex.add(Math.random())).mul(0.8).add(0.2);
    staticPositionBuffer.element(instanceIndex).assign(vec3(1e3, 1e4, 1e3));
    particleData.y = randY.mul(-0.1).add(-0.02);
    particleData.x = position.x;
    particleData.z = position.z;
    particleData.w = randX;
  })().compute(maxParticleCount).setName("Init Particles");
  const surfaceOffset = 0.2;
  const speed = 0.4;
  const computeUpdate = Fn(() => {
    const getCoord = (pos) => pos.add(50).div(100);
    const position = positionBuffer.element(instanceIndex);
    const scale = scaleBuffer.element(instanceIndex);
    const particleData = dataBuffer.element(instanceIndex);
    const velocity = particleData.y;
    const random = particleData.w;
    const rippleOnSurface = texture(collisionPosRT.texture, getCoord(position.xz)).toInspector("Collision Test", () => {
      return texture(collisionPosRT.texture).y;
    });
    const rippleFloorArea = rippleOnSurface.y.add(scale.x.mul(surfaceOffset));
    If(position.y.greaterThan(rippleFloorArea), () => {
      position.x = particleData.x.add(time.mul(random.mul(random)).mul(speed).sin().mul(3));
      position.z = particleData.z.add(time.mul(random).mul(speed).cos().mul(random.mul(10)));
      position.y = position.y.add(velocity);
    }).Else(() => {
      staticPositionBuffer.element(instanceIndex).assign(position);
    });
  });
  computeParticles = computeUpdate().compute(maxParticleCount);
  computeParticles.name = "Update Particles";
  const geometry = new SphereGeometry(surfaceOffset, 5, 5);
  function particle(staticParticles2) {
    const posBuffer = staticParticles2 ? staticPositionBuffer : positionBuffer;
    const layer = staticParticles2 ? 1 : 2;
    const staticMaterial = new MeshStandardNodeMaterial({
      color: 15658734,
      roughness: 0.9,
      metalness: 0
    });
    staticMaterial.positionNode = positionLocal.mul(scaleBuffer.toAttribute()).add(posBuffer.toAttribute());
    const rainParticles = new Mesh(geometry, staticMaterial);
    rainParticles.count = maxParticleCount;
    rainParticles.castShadow = true;
    rainParticles.layers.disableAll();
    rainParticles.layers.enable(layer);
    return rainParticles;
  }
  const dynamicParticles = particle();
  const staticParticles = particle(true);
  scene.add(dynamicParticles);
  scene.add(staticParticles);
  const floorGeometry = new PlaneGeometry(100, 100);
  floorGeometry.rotateX(-Math.PI / 2);
  const plane = new Mesh(floorGeometry, new MeshStandardMaterial({
    color: 794142,
    roughness: 0.5,
    metalness: 0,
    transparent: true
  }));
  plane.material.opacityNode = positionLocal.xz.mul(0.05).distance(0).saturate().oneMinus();
  scene.add(plane);
  function tree(count = 8) {
    const coneMaterial = new MeshStandardNodeMaterial({
      color: 870700,
      roughness: 0.6,
      metalness: 0
    });
    const object = new Group();
    for (let i = 0; i < count; i++) {
      const radius = 1 + i;
      const coneGeometry = new ConeGeometry(radius * 0.95, radius * 1.25, 32);
      const cone2 = new Mesh(coneGeometry, coneMaterial);
      cone2.castShadow = true;
      cone2.position.y = (count - i) * 1.5 + count * 0.6;
      object.add(cone2);
    }
    const geometry2 = new CylinderGeometry(1, 1, count, 32);
    const cone = new Mesh(geometry2, coneMaterial);
    cone.position.y = count / 2;
    object.add(cone);
    return object;
  }
  const teapotTree = new Mesh(new TeapotGeometry(0.5, 18), new MeshBasicNodeMaterial({
    color: 16579486
  }));
  teapotTree.name = "Teapot Pass";
  teapotTree.position.y = 18;
  scene.add(tree());
  scene.add(teapotTree);
  scene.backgroundNode = screenUV.distance(0.5).mul(2).mix(color(999744), color(395789));
  renderer = new WebGPURenderer({ antialias: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);
  await renderer.init();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 10, 0);
  controls.minDistance = 25;
  controls.maxDistance = 35;
  controls.maxPolarAngle = Math.PI / 1.7;
  controls.autoRotate = true;
  controls.autoRotateSpeed = -0.7;
  controls.update();
  const scenePass = pass(scene, camera);
  const scenePassColor = scenePass.getTextureNode();
  const vignette = screenUV.distance(0.5).mul(1.35).clamp().oneMinus();
  const teapotTreePass = pass(teapotTree, camera).getTextureNode();
  const teapotTreePassBlurred = gaussianBlur(teapotTreePass, vec2(1), 6);
  teapotTreePassBlurred.resolutionScale = 0.2;
  const scenePassColorBlurred = gaussianBlur(scenePassColor);
  scenePassColorBlurred.resolutionScale = 0.5;
  scenePassColorBlurred.directionNode = vec2(1);
  let totalPass = scenePass.toInspector("Scene");
  totalPass = totalPass.add(scenePassColorBlurred.mul(0.1));
  totalPass = totalPass.mul(vignette);
  totalPass = totalPass.add(teapotTreePass.mul(10).add(teapotTreePassBlurred).toInspector("Teapot Blur"));
  postProcessing = new PostProcessing(renderer);
  postProcessing.outputNode = totalPass;
  renderer.compute(computeInit);
  window.addEventListener("resize", onWindowResize);
}
function onWindowResize() {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
function animate() {
  controls.update();
  scene.name = "Collider Position";
  scene.overrideMaterial = collisionPosMaterial;
  renderer.setRenderTarget(collisionPosRT);
  renderer.render(scene, collisionCamera);
  renderer.compute(computeParticles);
  scene.name = "Scene";
  scene.overrideMaterial = null;
  renderer.setRenderTarget(null);
  postProcessing.render();
}
//# sourceMappingURL=snow-BMC8YID7.js.map
