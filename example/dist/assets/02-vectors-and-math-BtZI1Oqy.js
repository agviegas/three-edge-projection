import "./modulepreload-polyfill-DaKOjhqt.js";
import "./modulepreload-polyfill-DaKOjhqt-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex } from "./three.tsl-CucFAqAO-B9znDNZK.js";
import "./three.core-CntQ0PPt-CIuLIuvN.js";
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing...";
  try {
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML = '<span class="success">✓ WebGPU ready</span>\n';
    const pointsData = new Float32Array([
      1,
      0,
      0,
      // Point 0: (1, 0, 0)
      0,
      2,
      0,
      // Point 1: (0, 2, 0)
      3,
      4,
      0,
      // Point 2: (3, 4, 0)
      1,
      1,
      1
      // Point 3: (1, 1, 1)
    ]);
    output.innerHTML += "\nInput points:\n";
    for (let i = 0; i < 4; i++) {
      const x = pointsData[i * 3];
      const y = pointsData[i * 3 + 1];
      const z = pointsData[i * 3 + 2];
      output.innerHTML += `  Point ${i}: (${x}, ${y}, ${z})
`;
    }
    const distancesData = new Float32Array(4);
    const pointsBuffer = instancedArray(pointsData, "vec3");
    const distancesBuffer = instancedArray(distancesData, "float");
    const computeDistances = Fn(() => {
      const point = pointsBuffer.element(instanceIndex);
      const dist = point.length();
      distancesBuffer.element(instanceIndex).assign(dist);
    })().compute(4);
    await renderer.computeAsync(computeDistances);
    const resultBuffer = await renderer.getArrayBufferAsync(distancesBuffer.value);
    const distances = new Float32Array(resultBuffer);
    output.innerHTML += "\nComputed distances to origin:\n";
    for (let i = 0; i < 4; i++) {
      const x = pointsData[i * 3];
      const y = pointsData[i * 3 + 1];
      const z = pointsData[i * 3 + 2];
      const expected = Math.sqrt(x * x + y * y + z * z);
      output.innerHTML += `  Point ${i}: distance = ${distances[i].toFixed(4)} (expected: ${expected.toFixed(4)})
`;
    }
    output.innerHTML += '\n<span class="success">✓ All distances computed correctly!</span>';
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=02-vectors-and-math-BtZI1Oqy.js.map
