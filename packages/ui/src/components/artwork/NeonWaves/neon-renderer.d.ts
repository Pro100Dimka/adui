interface Track {
  xs: number[];
  ys: number[];
  lengths: number[];
  total: number;
}
interface NeonGeometry {
  W: number;
  H: number;
  COMET_LAP: number;
  COMET_DASH: number;
  COMET_WIDTH: number;
  toPath(curve: number[]): string;
  ridgeStrand(t: number, drift: number): number[];
  twistStrand(t: number, drift: number, main: boolean): number[];
  measure(curve: number[]): Track;
  pointAt(track: Track, fraction: number): { x: number; y: number };
  cometStrand(index: number, comets: number, strands: number): number;
}
interface NeonOptions {
  strands: number;
  phase: number;
  shape: "ridge" | "twist";
  comets: number;
  time: number;
}
export function createNeonGeometry(): NeonGeometry;
export const neonGeometry: NeonGeometry;
export function setNeonFrameRate(fps: number): void;
export function createNeonRenderer(
  root: HTMLElement,
  svg: SVGSVGElement,
  initial: NeonOptions,
): {
  ready: boolean;
  update(options?: NeonOptions): void;
  dispose(): void;
} | null;
