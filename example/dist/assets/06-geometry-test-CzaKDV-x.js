import "./modulepreload-polyfill-DaKOjhqt.js";
import { W as WebGPURenderer, i as instancedArray, F as Fn, c as instanceIndex, x as select } from "./three.tsl-CucFAqAO.js";
import "./three.core-CntQ0PPt.js";
const triangle = [
  { x: 0.5, y: 0.1 },
  // A (bottom)
  { x: 0.15, y: 0.85 },
  // B (top-left)
  { x: 0.85, y: 0.85 }
  // C (top-right)
];
const numPoints = 100;
const points = [];
for (let i = 0; i < numPoints; i++) {
  points.push({
    x: Math.random(),
    y: Math.random()
  });
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
function drawScene(results = null) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(triangle[0].x * w, (1 - triangle[0].y) * h);
  ctx.lineTo(triangle[1].x * w, (1 - triangle[1].y) * h);
  ctx.lineTo(triangle[2].x * w, (1 - triangle[2].y) * h);
  ctx.closePath();
  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(79, 195, 247, 0.1)";
  ctx.fill();
  for (const v of triangle) {
    ctx.beginPath();
    ctx.arc(v.x * w, (1 - v.y) * h, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#81c784";
    ctx.fill();
  }
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    ctx.beginPath();
    ctx.arc(p.x * w, (1 - p.y) * h, 4, 0, Math.PI * 2);
    if (results === null) {
      ctx.fillStyle = "#666";
    } else if (results[i]) {
      ctx.fillStyle = "#81c784";
    } else {
      ctx.fillStyle = "#ef5350";
    }
    ctx.fill();
  }
}
drawScene();
window.runExample = async function() {
  const output = document.getElementById("output");
  output.innerHTML = "Initializing...";
  try {
    let cpuPointInTriangle = function(p, a, b, c) {
      const sign = (p2, a2, b2) => (p2.x - b2.x) * (a2.y - b2.y) - (a2.x - b2.x) * (p2.y - b2.y);
      const d1 = sign(p, a, b);
      const d2 = sign(p, b, c);
      const d3 = sign(p, c, a);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      return !(hasNeg && hasPos);
    };
    const renderer = new WebGPURenderer();
    await renderer.init();
    output.innerHTML = '<span class="success">✓ WebGPU ready</span>\n';
    const triangleData = new Float32Array([
      triangle[0].x,
      triangle[0].y,
      0,
      0,
      triangle[1].x,
      triangle[1].y,
      0,
      0,
      triangle[2].x,
      triangle[2].y,
      0,
      0
    ]);
    const pointsData = new Float32Array(numPoints * 4);
    for (let i = 0; i < numPoints; i++) {
      pointsData[i * 4 + 0] = points[i].x;
      pointsData[i * 4 + 1] = points[i].y;
      pointsData[i * 4 + 2] = 0;
      pointsData[i * 4 + 3] = 0;
    }
    const triangleBuffer = instancedArray(triangleData, "vec4");
    const pointsBuffer = instancedArray(pointsData, "vec4");
    const resultsBuffer = instancedArray(new Uint32Array(numPoints), "uint");
    const pointInTriangleKernel = Fn(() => {
      const point = pointsBuffer.element(instanceIndex).xy;
      const a = triangleBuffer.element(0).xy;
      const b = triangleBuffer.element(1).xy;
      const c = triangleBuffer.element(2).xy;
      const sign = (px, py, ax, ay, bx, by) => {
        return px.sub(bx).mul(ay.sub(by)).sub(ax.sub(bx).mul(py.sub(by)));
      };
      const d1 = sign(point.x, point.y, a.x, a.y, b.x, b.y);
      const d2 = sign(point.x, point.y, b.x, b.y, c.x, c.y);
      const d3 = sign(point.x, point.y, c.x, c.y, a.x, a.y);
      const hasNeg = d1.lessThan(0).or(d2.lessThan(0)).or(d3.lessThan(0));
      const hasPos = d1.greaterThan(0).or(d2.greaterThan(0)).or(d3.greaterThan(0));
      const inside = hasNeg.and(hasPos).not();
      resultsBuffer.element(instanceIndex).assign(select(inside, 1, 0));
    })().compute(numPoints);
    output.innerHTML += `
Testing ${numPoints} points against triangle...
`;
    await renderer.computeAsync(pointInTriangleKernel);
    const resultBuffer = await renderer.getArrayBufferAsync(resultsBuffer.value);
    const results = new Uint32Array(resultBuffer);
    let insideCount = 0;
    const boolResults = [];
    for (let i = 0; i < numPoints; i++) {
      boolResults.push(results[i] === 1);
      if (results[i] === 1) insideCount++;
    }
    output.innerHTML += `
<span class="success">Points inside:  ${insideCount}</span>`;
    output.innerHTML += `
<span class="error">Points outside: ${numPoints - insideCount}</span>`;
    let mismatches = 0;
    for (let i = 0; i < numPoints; i++) {
      const cpuResult = cpuPointInTriangle(points[i], triangle[0], triangle[1], triangle[2]);
      if (cpuResult !== boolResults[i]) mismatches++;
    }
    if (mismatches === 0) {
      output.innerHTML += `

<span class="success">✓ All ${numPoints} results match CPU verification!</span>`;
    } else {
      output.innerHTML += `

<span class="error">✗ ${mismatches} mismatches with CPU</span>`;
    }
    drawScene(boolResults);
    renderer.dispose();
  } catch (error) {
    output.innerHTML += `
<span class="error">✗ Error: ${error.message}</span>`;
    console.error(error);
  }
};
//# sourceMappingURL=06-geometry-test-CzaKDV-x.js.map
