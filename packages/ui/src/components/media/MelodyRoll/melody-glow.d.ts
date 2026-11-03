interface MelodyGlowState {
  beat: number;
  pitch?: number;
  high: number;
  rows: number;
  lead: number;
  accuracy: number;
  level: number;
  hit: boolean;
  position: number;
  span: number;
  notes?: readonly { id: string; start: number; end: number; pitch: number; lyric?: string }[];
  hits?: string;
  showLyrics?: boolean;
  trail?: readonly { t: number; pitch?: number }[];
}
export function createMelodyGlow(root: HTMLElement, state: MelodyGlowState, onReady: (ready: boolean) => void): {
  update(state: MelodyGlowState): void;
  dispose(): void;
} | null;
