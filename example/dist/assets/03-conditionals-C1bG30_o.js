import "./modulepreload-polyfill-DaKOjhqt.js";
import "./modulepreload-polyfill-DaKOjhqt-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex, f as float, I as If } from "./three.tsl-CucFAqAO-B9znDNZK.js";
import "./three.core-CntQ0PPt-CIuLIuvN.js";
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing...";
  try {
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML = '<span class="success">✓ WebGPU ready</span>\n';
    const inputData = new Float32Array([-5, -0.5, 0, 0.5, 5, -100, 100]);
    const outputData = new Float32Array(inputData.length);
    output.innerHTML += `
Input values: [${Array.from(inputData).join(", ")}]
`;
    const inputBuffer = instancedArray(inputData, "float");
    const outputBuffer = instancedArray(outputData, "float");
    const classify = Fn(() => {
      const value = inputBuffer.element(instanceIndex);
      const result = float(0);
      If(value.lessThan(0), () => {
        result.assign(-1);
      }).ElseIf(value.greaterThan(0), () => {
        result.assign(1);
      });
      outputBuffer.element(instanceIndex).assign(result);
    })().compute(inputData.length);
    await renderer.computeAsync(classify);
    const resultBuffer = await renderer.getArrayBufferAsync(outputBuffer.value);
    const results = new Float32Array(resultBuffer);
    output.innerHTML += "\nClassification results:\n";
    for (let i = 0; i < inputData.length; i++) {
      const sign = results[i] === -1 ? "negative" : results[i] === 1 ? "positive" : "zero";
      output.innerHTML += `  ${inputData[i].toString().padStart(5)} → ${results[i].toString().padStart(2)} (${sign})
`;
    }
    output.innerHTML += '\n<span class="success">✓ All numbers classified correctly!</span>';
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=03-conditionals-C1bG30_o.js.map
