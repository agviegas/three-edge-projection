import "./modulepreload-polyfill-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex } from "./three.tsl-CucFAqAO.js";
import "./three.core-CntQ0PPt.js";
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing WebGPU...";
  try {
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML += '\n<span class="success">✓ WebGPU initialized</span>';
    const inputData = new Float32Array([1, 2, 3, 4, 5]);
    output.innerHTML += `

Input:  [${inputData.join(", ")}]`;
    const buffer = instancedArray(inputData, "float");
    const computeShader = Fn(() => {
      const value = buffer.element(instanceIndex);
      value.assign(value.mul(2));
    })().compute(5);
    output.innerHTML += "\n\nRunning compute shader...";
    await renderer.computeAsync(computeShader);
    const resultBuffer = await renderer.getArrayBufferAsync(buffer.value);
    const result = new Float32Array(resultBuffer);
    output.innerHTML += '\n<span class="success">✓ Compute shader finished</span>';
    output.innerHTML += `

Output: [${Array.from(result).join(", ")}]`;
    output.innerHTML += '\n\n<span class="success">✓ Each element was doubled!</span>';
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=01-hello-compute-DPzqWxk4.js.map
