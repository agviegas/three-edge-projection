import "./modulepreload-polyfill-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex, a3 as atomicAdd } from "./three.tsl-CucFAqAO.js";
import "./three.core-CntQ0PPt.js";
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing...";
  try {
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML = '<span class="success">✓ WebGPU ready</span>\n';
    const inputData = new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const expectedSum = inputData.reduce((a, b) => a + b, 0);
    output.innerHTML += `
Input: [${Array.from(inputData).join(", ")}]
`;
    output.innerHTML += `Expected sum: ${expectedSum}
`;
    const inputBuffer = instancedArray(inputData, "uint");
    const counterBuffer = instancedArray(new Uint32Array([0]), "uint").toAtomic();
    const sumKernel = Fn(() => {
      const value = inputBuffer.element(instanceIndex);
      atomicAdd(counterBuffer.element(0), value);
    })().compute(inputData.length);
    output.innerHTML += "\nRunning kernel...\n";
    await renderer.computeAsync(sumKernel);
    const gpuBuffer = await renderer.getArrayBufferAsync(counterBuffer.value);
    const sum = new Uint32Array(gpuBuffer)[0];
    output.innerHTML += `
GPU computed sum: ${sum}
`;
    if (sum === expectedSum) {
      output.innerHTML += '\n<span class="success">✓ Correct! atomicAdd worked perfectly.</span>';
    } else {
      output.innerHTML += `
<span class="error">✗ Wrong sum. Expected ${expectedSum}, got ${sum}</span>`;
    }
    output.innerHTML += '\n\n<span class="warning">Note: Without atomicAdd, parallel threads would corrupt the sum!</span>';
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=04-atomics-Bt01jBMp.js.map
