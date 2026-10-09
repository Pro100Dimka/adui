import { expect, it, vi } from "vitest";
import { createQuantumFieldRenderer } from "../src/components/artwork/QuantumField/renderer";

it("runs the expensive halo shader only for sparse highlight particles", () => {
  const drawArrays = vi.fn();
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    ARRAY_BUFFER: 5, STATIC_DRAW: 6, DYNAMIC_DRAW: 7, FLOAT: 8,
    DEPTH_TEST: 9, BLEND: 10, COLOR_BUFFER_BIT: 11, LINES: 12, POINTS: 13,
    SRC_ALPHA: 14, ONE_MINUS_SRC_ALPHA: 15, ONE: 16,
    createShader: () => ({}), shaderSource() {}, compileShader() {}, getShaderParameter: () => true,
    createProgram: () => ({}), createBuffer: () => ({}), attachShader() {}, linkProgram() {},
    getProgramParameter: () => true, bindBuffer() {}, bufferData() {}, useProgram() {},
    getAttribLocation: () => 0, enableVertexAttribArray() {}, vertexAttribPointer() {},
    getUniformLocation: () => ({}), disable() {}, enable() {}, viewport() {},
    isContextLost: () => false, clearColor() {}, clear() {}, uniform1f() {}, uniform2f() {},
    uniform1fv() {}, uniform3fv() {}, blendFunc() {}, drawArrays,
    deleteBuffer() {}, deleteProgram() {}, deleteShader() {},
  };
  const canvas = { width: 400, height: 200, clientWidth: 400, getContext: () => gl } as unknown as HTMLCanvasElement;
  const renderer = createQuantumFieldRenderer(canvas, "orbit", 10_000);
  expect(renderer).not.toBeNull();
  renderer!.draw(0, { zoom: 3.5, yaw: 0, pitch: 0.16 });
  const points = drawArrays.mock.calls.filter(([mode]) => mode === gl.POINTS);
  expect(points).toHaveLength(2);
  expect(points[0]?.[2]).toBeLessThan(500);
  expect(points[1]?.[2]).toBe(10_000);
  renderer!.dispose();
});
