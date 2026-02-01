import "./three.module-Jt-9Ru2o-vl5c8U10.js";
import { ab as Loader, a$ as HalfFloatType, a6 as RGBAFormat, b0 as DataTexture, b1 as UVMapping, aG as ClampToEdgeWrapping, aC as LinearFilter, b2 as LinearMipMapLinearFilter, as as LinearSRGBColorSpace, ad as FileLoader, b3 as DataUtils } from "./three.core-CntQ0PPt-CIuLIuvN.js";
const SRGB_TO_LINEAR = new Float64Array(1024);
for (let i = 0; i < 1024; i++) {
  SRGB_TO_LINEAR[i] = Math.pow(i * 3717127e-9 + 0.0521327014, 2.4);
}
class UltraHDRLoader extends Loader {
  /**
   * Constructs a new Ultra HDR loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(manager) {
    super(manager);
    this.type = HalfFloatType;
  }
  /**
   * Sets the texture type.
   *
   * @param {(HalfFloatType|FloatType)} value - The texture type to set.
   * @return {UltraHDRLoader} A reference to this loader.
   */
  setDataType(value) {
    this.type = value;
    return this;
  }
  /**
   * Parses the given Ultra HDR texture data.
   *
   * @param {ArrayBuffer} buffer - The raw texture data.
   * @param {Function} onLoad - The `onLoad` callback.
   */
  parse(buffer, onLoad) {
    const xmpMetadata = {
      version: null,
      baseRenditionIsHDR: null,
      gainMapMin: null,
      gainMapMax: null,
      gamma: null,
      offsetSDR: null,
      offsetHDR: null,
      hdrCapacityMin: null,
      hdrCapacityMax: null
    };
    const textDecoder = new TextDecoder();
    const bytes = new Uint8Array(buffer);
    const sections = [];
    let offset = 0;
    while (offset < bytes.length - 1) {
      if (bytes[offset] !== 255) {
        offset++;
        continue;
      }
      const markerType = bytes[offset + 1];
      if (markerType === 216) {
        sections.push({
          sectionType: markerType,
          section: bytes.subarray(offset, offset + 2),
          sectionOffset: offset + 2
        });
        offset += 2;
        continue;
      }
      if (markerType === 224 || markerType === 225 || markerType === 226) {
        const segmentLength = bytes[offset + 2] << 8 | bytes[offset + 3];
        const segmentEnd = offset + 2 + segmentLength;
        sections.push({
          sectionType: markerType,
          section: bytes.subarray(offset, segmentEnd),
          sectionOffset: offset + 2
        });
        offset = segmentEnd;
        continue;
      }
      if (markerType >= 192 && markerType <= 254 && markerType !== 217 && (markerType < 208 || markerType > 215)) {
        const segmentLength = bytes[offset + 2] << 8 | bytes[offset + 3];
        offset += 2 + segmentLength;
        continue;
      }
      offset += 2;
    }
    let primaryImage, gainmapImage;
    for (let i = 0; i < sections.length; i++) {
      const { sectionType, section, sectionOffset } = sections[i];
      if (sectionType === 224) ;
      else if (sectionType === 225) {
        this._parseXMPMetadata(
          textDecoder.decode(new Uint8Array(section)),
          xmpMetadata
        );
      } else if (sectionType === 226) {
        const sectionData = new DataView(section.buffer, section.byteOffset + 2, section.byteLength - 2);
        const sectionHeader = sectionData.getUint32(2, false);
        if (sectionHeader === 1297106432) {
          const mpfLittleEndian = sectionData.getUint32(6) === 1229531648;
          const mpfBytesOffset = 60;
          const primaryImageSize = sectionData.getUint32(
            mpfBytesOffset,
            mpfLittleEndian
          );
          const primaryImageOffset = sectionData.getUint32(
            mpfBytesOffset + 4,
            mpfLittleEndian
          );
          const gainmapImageSize = sectionData.getUint32(
            mpfBytesOffset + 16,
            mpfLittleEndian
          );
          const gainmapImageOffset = sectionData.getUint32(mpfBytesOffset + 20, mpfLittleEndian) + sectionOffset + 6;
          primaryImage = new Uint8Array(
            buffer,
            primaryImageOffset,
            primaryImageSize
          );
          gainmapImage = new Uint8Array(
            buffer,
            gainmapImageOffset,
            gainmapImageSize
          );
        }
      }
    }
    if (!xmpMetadata.version) {
      throw new Error("THREE.UltraHDRLoader: Not a valid UltraHDR image");
    }
    if (primaryImage && gainmapImage) {
      this._applyGainmapToSDR(
        xmpMetadata,
        primaryImage,
        gainmapImage,
        (hdrBuffer, width, height) => {
          onLoad({
            width,
            height,
            data: hdrBuffer,
            format: RGBAFormat,
            type: this.type
          });
        },
        (error) => {
          throw new Error(error);
        }
      );
    } else {
      throw new Error("THREE.UltraHDRLoader: Could not parse UltraHDR images");
    }
  }
  /**
   * Starts loading from the given URL and passes the loaded Ultra HDR texture
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the files to be loaded. This can also be a data URI.
   * @param {function(DataTexture, Object)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   * @return {DataTexture} The Ultra HDR texture.
   */
  load(url, onLoad, onProgress, onError) {
    const texture = new DataTexture(
      this.type === HalfFloatType ? new Uint16Array() : new Float32Array(),
      0,
      0,
      RGBAFormat,
      this.type,
      UVMapping,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      LinearFilter,
      LinearMipMapLinearFilter,
      1,
      LinearSRGBColorSpace
    );
    texture.generateMipmaps = true;
    texture.flipY = true;
    const loader = new FileLoader(this.manager);
    loader.setResponseType("arraybuffer");
    loader.setRequestHeader(this.requestHeader);
    loader.setPath(this.path);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, (buffer) => {
      try {
        this.parse(
          buffer,
          (texData) => {
            texture.image = {
              data: texData.data,
              width: texData.width,
              height: texData.height
            };
            texture.needsUpdate = true;
            if (onLoad) onLoad(texture, texData);
          }
        );
      } catch (error) {
        if (onError) onError(error);
        console.error(error);
      }
    }, onProgress, onError);
    return texture;
  }
  _parseXMPMetadata(xmpDataString, xmpMetadata) {
    const domParser = new DOMParser();
    const xmpXml = domParser.parseFromString(
      xmpDataString.substring(
        xmpDataString.indexOf("<"),
        xmpDataString.lastIndexOf(">") + 1
      ),
      "text/xml"
    );
    const [hasHDRContainerDescriptor] = xmpXml.getElementsByTagName(
      "Container:Directory"
    );
    if (hasHDRContainerDescriptor) ;
    else {
      const [gainmapNode] = xmpXml.getElementsByTagName("rdf:Description");
      xmpMetadata.version = gainmapNode.getAttribute("hdrgm:Version");
      xmpMetadata.baseRenditionIsHDR = gainmapNode.getAttribute("hdrgm:BaseRenditionIsHDR") === "True";
      xmpMetadata.gainMapMin = parseFloat(
        gainmapNode.getAttribute("hdrgm:GainMapMin") || 0
      );
      xmpMetadata.gainMapMax = parseFloat(
        gainmapNode.getAttribute("hdrgm:GainMapMax") || 1
      );
      xmpMetadata.gamma = parseFloat(
        gainmapNode.getAttribute("hdrgm:Gamma") || 1
      );
      xmpMetadata.offsetSDR = parseFloat(
        gainmapNode.getAttribute("hdrgm:OffsetSDR") / (1 / 64)
      );
      xmpMetadata.offsetHDR = parseFloat(
        gainmapNode.getAttribute("hdrgm:OffsetHDR") / (1 / 64)
      );
      xmpMetadata.hdrCapacityMin = parseFloat(
        gainmapNode.getAttribute("hdrgm:HDRCapacityMin") || 0
      );
      xmpMetadata.hdrCapacityMax = parseFloat(
        gainmapNode.getAttribute("hdrgm:HDRCapacityMax") || 1
      );
    }
  }
  _srgbToLinear(value) {
    if (value < 10.31475) {
      return value * 303527e-9;
    }
    if (value < 1024) {
      return SRGB_TO_LINEAR[value | 0];
    }
    return Math.pow(value * 3717127e-9 + 0.0521327014, 2.4);
  }
  _applyGainmapToSDR(xmpMetadata, sdrBuffer, gainmapBuffer, onSuccess, onError) {
    const decodeImage = (data) => createImageBitmap(new Blob([data], { type: "image/jpeg" }));
    Promise.all([decodeImage(sdrBuffer), decodeImage(gainmapBuffer)]).then(([sdrImage, gainmapImage]) => {
      const sdrWidth = sdrImage.width;
      const sdrHeight = sdrImage.height;
      const sdrImageAspect = sdrWidth / sdrHeight;
      const gainmapImageAspect = gainmapImage.width / gainmapImage.height;
      if (sdrImageAspect !== gainmapImageAspect) {
        onError(
          "THREE.UltraHDRLoader Error: Aspect ratio mismatch between SDR and Gainmap images"
        );
        return;
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
        colorSpace: "srgb"
      });
      canvas.width = sdrWidth;
      canvas.height = sdrHeight;
      ctx.drawImage(
        gainmapImage,
        0,
        0,
        gainmapImage.width,
        gainmapImage.height,
        0,
        0,
        sdrWidth,
        sdrHeight
      );
      const gainmapImageData = ctx.getImageData(
        0,
        0,
        sdrWidth,
        sdrHeight,
        { colorSpace: "srgb" }
      );
      ctx.drawImage(sdrImage, 0, 0);
      const sdrImageData = ctx.getImageData(
        0,
        0,
        sdrWidth,
        sdrHeight,
        { colorSpace: "srgb" }
      );
      const maxDisplayBoost = 1.8 ** (xmpMetadata.hdrCapacityMax * 0.5);
      const unclampedWeightFactor = (Math.log2(maxDisplayBoost) - xmpMetadata.hdrCapacityMin) / (xmpMetadata.hdrCapacityMax - xmpMetadata.hdrCapacityMin);
      const weightFactor = Math.min(
        Math.max(unclampedWeightFactor, 0),
        1
      );
      const sdrData = sdrImageData.data;
      const gainmapData = gainmapImageData.data;
      const dataLength = sdrData.length;
      const gainMapMin = xmpMetadata.gainMapMin;
      const gainMapMax = xmpMetadata.gainMapMax;
      const offsetSDR = xmpMetadata.offsetSDR;
      const offsetHDR = xmpMetadata.offsetHDR;
      const invGamma = 1 / xmpMetadata.gamma;
      const useGammaOne = xmpMetadata.gamma === 1;
      const isHalfFloat = this.type === HalfFloatType;
      const toHalfFloat = DataUtils.toHalfFloat;
      const srgbToLinear = this._srgbToLinear;
      const hdrBuffer = isHalfFloat ? new Uint16Array(dataLength).fill(15360) : new Float32Array(dataLength).fill(1);
      for (let i = 0; i < dataLength; i += 4) {
        for (let c = 0; c < 3; c++) {
          const idx = i + c;
          const sdrValue = sdrData[idx];
          const gainmapValue = gainmapData[idx] * 0.00392156862745098;
          const logRecovery = useGammaOne ? gainmapValue : Math.pow(gainmapValue, invGamma);
          const logBoost = gainMapMin + (gainMapMax - gainMapMin) * logRecovery;
          const hdrValue = (sdrValue + offsetSDR) * (logBoost * weightFactor === 0 ? 1 : Math.pow(2, logBoost * weightFactor)) - offsetHDR;
          const linearHDRValue = Math.min(
            Math.max(srgbToLinear(hdrValue), 0),
            65504
          );
          hdrBuffer[idx] = isHalfFloat ? toHalfFloat(linearHDRValue) : linearHDRValue;
        }
      }
      onSuccess(hdrBuffer, sdrWidth, sdrHeight);
    }).catch((e) => {
      onError(e);
    });
  }
}
export {
  UltraHDRLoader as U
};
//# sourceMappingURL=UltraHDRLoader-BUUPTmsQ-BdFFozEz.js.map
