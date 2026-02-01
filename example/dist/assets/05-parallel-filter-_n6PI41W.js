import "./modulepreload-polyfill-DaKOjhqt.js";
import "./modulepreload-polyfill-DaKOjhqt-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex, I as If, a3 as atomicAdd, r as uint } from "./three.tsl-CucFAqAO-B9znDNZK.js";
import "./three.core-CntQ0PPt-CIuLIuvN.js";
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing...";
  try {
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML = '<span class="success">✓ WebGPU ready</span>\n';
    const inputData = new Float32Array([
      -5,
      3,
      0,
      7,
      -2,
      1,
      -1,
      8,
      0,
      4,
      -3,
      2
    ]);
    const expectedOutput = Array.from(inputData).filter((x) => x > 0);
    output.innerHTML += `
Input:    [${Array.from(inputData).join(", ")}]
`;
    output.innerHTML += `Expected: [${expectedOutput.join(", ")}] (${expectedOutput.length} items)
`;
    const inputBuffer = instancedArray(inputData, "float");
    const outputBuffer = instancedArray(new Float32Array(inputData.length), "float");
    const counterBuffer = instancedArray(new Uint32Array([0]), "uint").toAtomic();
    const filterKernel = Fn(() => {
      const value = inputBuffer.element(instanceIndex);
      If(value.greaterThan(0), () => {
        const outputIndex = atomicAdd(counterBuffer.element(0), uint(1));
        outputBuffer.element(outputIndex).assign(value);
      });
    })().compute(inputData.length);
    output.innerHTML += "\nRunning parallel filter...\n";
    await renderer.computeAsync(filterKernel);
    const countBuffer = await renderer.getArrayBufferAsync(counterBuffer.value);
    const count = new Uint32Array(countBuffer)[0];
    const resultBuffer = await renderer.getArrayBufferAsync(outputBuffer.value);
    const results = new Float32Array(resultBuffer).slice(0, count);
    output.innerHTML += `
GPU output: [${Array.from(results).join(", ")}] (${count} items)
`;
    const sortedExpected = [...expectedOutput].sort((a, b) => a - b);
    const sortedResults = [...results].sort((a, b) => a - b);
    const isCorrect = sortedExpected.length === sortedResults.length && sortedExpected.every((v, i) => v === sortedResults[i]);
    if (isCorrect) {
      output.innerHTML += '\n<span class="success">✓ All positive numbers were filtered correctly!</span>';
      output.innerHTML += `
<span class="success">  (Order may differ due to parallel execution - that's OK)</span>`;
    } else {
      output.innerHTML += `
<span class="error">✗ Results don't match expected output</span>`;
    }
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=05-parallel-filter-_n6PI41W.js.map
