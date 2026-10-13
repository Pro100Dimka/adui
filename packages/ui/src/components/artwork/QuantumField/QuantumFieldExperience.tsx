import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useThemePalette } from "../../foundation/ThemeProvider/ThemeProvider";
import reference from "./reference.html?raw";

export const quantumBackgroundFields = ["Photon (EM)", "Gluon (Strong)", "Higgs (Mass)", "Gravity", "Dark Energy", "Neutrino", "Waveform Terrain"] as const;
export type QuantumBackgroundField = typeof quantumBackgroundFields[number];

/** Every visual and audio-reaction setting of the scene. All of them are optional props of `QuantumBackground`. */
export interface QuantumBackgroundSettings {
  field: QuantumBackgroundField;
  sensitivity: number;
  density: number;
  /** Share of the scene the field spans: 1 reaches the edges, above 1 runs past them. */
  fieldSize: number;
  timeScale: number;
  nebulaEnabled: boolean;
  nebulaIntensity: number;
  connectionsEnabled: boolean;
  connectionThreshold: number;
  connectionOpacity: number;
  crawlersEnabled: boolean;
  particleTrailsEnabled: boolean;
  particleTrailOpacity: number;
  lensFlareEnabled: boolean;
  lensFlareIntensity: number;
  dofEnabled: boolean;
  dofFocus: number;
  dofFocalLength: number;
  dofBokehStrength: number;
  cameraShake: number;
  bloom: number;
  trails: number;
  chromaticAberration: number;
  anamorphicStretch: number;
  godRaysEnabled: boolean;
  godRaysIntensity: number;
  filmGrain: number;
  vortexStrength: number;
  pulseIntensity: number;
  bassGateEnabled: boolean;
  bassGateThreshold: number;
  bassGateAttack: number;
  bassGateRelease: number;
  onsetSensitivity: number;
  audioCameraEnabled: boolean;
  audioCameraIntensity: number;
  waveformTerrainHeight: number;
  adaptiveQualityEnabled: boolean;
  targetFPS: number;
  interactive: boolean;
  paused: boolean;
}
export type QuantumBackgroundSettingKey = keyof QuantumBackgroundSettings;

export type QuantumBackgroundControl = {
  key: QuantumBackgroundSettingKey;
  label: string;
  value: number | boolean | string;
  min?: number; max?: number; step?: number;
  options?: readonly string[];
  /** A boolean setting that has to be on for this one to have an effect. */
  enabledBy?: QuantumBackgroundSettingKey;
};

/** Ranges, defaults and labels of every setting, grouped, for building a settings panel next to the scene. */
export const quantumBackgroundControls: readonly { id: string; label: string; controls: readonly QuantumBackgroundControl[] }[] = [
  { id: "field", label: "Поле", controls: [
    { key: "field", label: "Тип поля", value: "Gluon (Strong)", options: quantumBackgroundFields },
    { key: "sensitivity", label: "Чувствительность", value: 1.1, min: 0.1, max: 3, step: 0.01 },
    { key: "density", label: "Плотность", value: 0.043, min: 0.017, max: 0.14, step: 0.001 },
    { key: "timeScale", label: "Скорость", value: 1, min: 0, max: 3, step: 0.01 },
    { key: "fieldSize", label: "Размер поля", value: 0.78, min: 0.3, max: 1.2, step: 0.01 },
  ] },
  { id: "environment", label: "Среда", controls: [
    { key: "nebulaEnabled", label: "Туманность", value: false },
    { key: "nebulaIntensity", label: "Яркость туманности", value: 0.3, min: 0, max: 2, step: 0.01, enabledBy: "nebulaEnabled" },
    { key: "connectionsEnabled", label: "Сеть связей", value: true },
    { key: "connectionThreshold", label: "Дальность связей", value: 20, min: 5, max: 25, step: 0.1, enabledBy: "connectionsEnabled" },
    { key: "connectionOpacity", label: "Яркость связей", value: 0.75, min: 0.1, max: 1, step: 0.01, enabledBy: "connectionsEnabled" },
    { key: "crawlersEnabled", label: "Бегущие огни", value: true },
    { key: "particleTrailsEnabled", label: "Следы частиц", value: true },
    { key: "particleTrailOpacity", label: "Яркость следов", value: 1, min: 0, max: 1, step: 0.01, enabledBy: "particleTrailsEnabled" },
  ] },
  { id: "camera", label: "Камера", controls: [
    { key: "lensFlareEnabled", label: "Блики", value: true },
    { key: "lensFlareIntensity", label: "Сила бликов", value: 0.1, min: 0, max: 2, step: 0.01, enabledBy: "lensFlareEnabled" },
    { key: "dofEnabled", label: "Глубина резкости", value: false },
    { key: "dofFocus", label: "Фокус", value: 0.04, min: 0, max: 0.1015, step: 0.0001, enabledBy: "dofEnabled" },
    { key: "dofFocalLength", label: "Падение фокуса", value: 0.4, min: 0.05, max: 0.5, step: 0.01, enabledBy: "dofEnabled" },
    { key: "dofBokehStrength", label: "Размытие", value: 0.36, min: 0, max: 1, step: 0.01, enabledBy: "dofEnabled" },
    { key: "cameraShake", label: "Дрожание", value: 0.65, min: 0, max: 2, step: 0.01 },
  ] },
  { id: "effects", label: "Эффекты", controls: [
    { key: "bloom", label: "Свечение", value: 0.3, min: 0, max: 3, step: 0.01 },
    { key: "trails", label: "Шлейф", value: 0.66144, min: 0.5, max: 0.98, step: 0.001 },
    { key: "chromaticAberration", label: "Хроматика", value: 0.004, min: 0, max: 0.025, step: 0.0001 },
    { key: "anamorphicStretch", label: "Анаморфный свет", value: 0.1, min: 0, max: 1, step: 0.01 },
    { key: "godRaysEnabled", label: "Световые лучи", value: false },
    { key: "godRaysIntensity", label: "Сила лучей", value: 0.078, min: 0, max: 1, step: 0.01, enabledBy: "godRaysEnabled" },
    { key: "filmGrain", label: "Зерно", value: 0.001, min: 0, max: 0.2, step: 0.001 },
  ] },
  { id: "physics", label: "Физика", controls: [
    { key: "vortexStrength", label: "Вихрь", value: 0.73, min: 0, max: 1, step: 0.01 },
    { key: "pulseIntensity", label: "Пульсация", value: 0.15, min: 0, max: 2.5, step: 0.01 },
  ] },
  { id: "audio", label: "Аудио", controls: [
    { key: "bassGateEnabled", label: "Бас-гейт", value: false },
    { key: "bassGateThreshold", label: "Порог", value: 0.12, min: 0, max: 0.5, step: 0.01, enabledBy: "bassGateEnabled" },
    { key: "bassGateAttack", label: "Атака", value: 0.3, min: 0.01, max: 0.3, step: 0.01, enabledBy: "bassGateEnabled" },
    { key: "bassGateRelease", label: "Спад", value: 0.136, min: 0.05, max: 0.5, step: 0.01, enabledBy: "bassGateEnabled" },
  ] },
  { id: "advanced", label: "Дополнительно", controls: [
    { key: "onsetSensitivity", label: "Реакция на акценты", value: 1, min: 0.5, max: 3, step: 0.01 },
    { key: "audioCameraEnabled", label: "Аудиокамера", value: true },
    { key: "audioCameraIntensity", label: "Реакция камеры", value: 0.3, min: 0, max: 1, step: 0.01, enabledBy: "audioCameraEnabled" },
    { key: "waveformTerrainHeight", label: "Высота рельефа", value: 20, min: 5, max: 30, step: 0.1 },
    { key: "adaptiveQualityEnabled", label: "Автокачество", value: true },
    { key: "targetFPS", label: "Целевая частота", value: 45, min: 30, max: 60, step: 1, enabledBy: "adaptiveQualityEnabled" },
    { key: "interactive", label: "Управление мышью", value: true },
    { key: "paused", label: "Пауза анимации", value: false },
  ] },
];

/** Values the scene uses for settings that are not passed as props. */
export const quantumBackgroundDefaults = Object.freeze(Object.fromEntries(
  quantumBackgroundControls.flatMap(({ controls }) => controls.map(({ key, value }) => [key, value])),
) as unknown as QuantumBackgroundSettings);
const settingKeys = Object.keys(quantumBackgroundDefaults) as QuantumBackgroundSettingKey[];

/** `fieldSize` used while `fullscreen` is on and no `fieldSize` is given: the field runs past the screen edges. */
export const quantumBackgroundFullscreenFieldSize = 1.1;

/** Most particles the scene can draw across both layers (35 000 field + 50 000 secondary). */
export const quantumBackgroundMaxParticles = 85_000;

/** Audio state of the scene, reported through `onTransportChange`. */
export type QuantumBackgroundTransport = {
  /** `"file"` while a loaded song is the source, `"mic"` while the microphone is, otherwise `null`. */
  mode: "file" | "mic" | null;
  playing: boolean;
  /** Seconds; 0 unless a file is loaded. */
  current: number;
  duration: number;
  track: string;
};

/** Audio and capture actions, reached through `ref`. Settings are props; these are one-off commands. */
export interface QuantumBackgroundHandle {
  /** Decodes the file and starts playing it as the scene's audio source. */
  loadFile(file: File): void;
  /** Plays or pauses the loaded file. */
  togglePlayback(): void;
  seek(seconds: number): void;
  /** Starts the microphone, or stops it when it is the current source. */
  toggleMicrophone(): void;
  /** Downloads a PNG of the current frame. */
  screenshot(): void;
  /** Opens the scene full screen, or leaves full screen. */
  toggleFullscreen(): void;
}

export type QuantumBackgroundProps = Partial<QuantumBackgroundSettings> & Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * Number of particles across both layers, 0–`quantumBackgroundMaxParticles`. Unset follows `density`.
   * Adaptive quality may draw fewer; turn `adaptiveQualityEnabled` off to keep the exact count.
   */
  particleCount?: number;
  /** Maximum number of visible particles across both field layers. Adaptive quality may draw fewer. */
  particleBudget?: number;
  /**
   * Sound the scene cannot hear itself — a native audio engine, a WebRTC call, a server stream: band
   * levels 0–1 from low to high frequencies, log-spaced across `spectrumRange`. Any band count works;
   * pass a new array whenever the levels change (10–60 times a second). While set, it drives the field
   * like a playing song; a file or microphone started from the ref takes over while it plays.
   * `undefined` returns the scene to silence.
   */
  spectrum?: readonly number[];
  /** Frequencies in Hz of the first and last `spectrum` band. Default `[40, 12000]`. */
  spectrumRange?: readonly [number, number];
  /** Covers the whole viewport above the page; the field then fills it edge to edge unless `fieldSize` is set. */
  fullscreen?: boolean;
  /** Asks to leave `fullscreen` when the viewer presses Escape. */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** Content laid over the scene, e.g. a hero heading. */
  children?: ReactNode;
  /** Called when the audio source, playback state or position changes (about 4 times a second while playing). */
  onTransportChange?: (transport: QuantumBackgroundTransport) => void;
  /** Peaks (0–1) of a newly loaded file, for drawing its waveform. */
  onWaveformChange?: (points: number[]) => void;
};

/** Full MIT-licensed audio-reactive scene. Every setting is a prop; audio actions are on the ref. */
export const QuantumBackground = /* @__PURE__ */ forwardRef<QuantumBackgroundHandle, QuantumBackgroundProps>(function QuantumBackground(props, ref) {
  const {
    className = "", particleCount, particleBudget, fullscreen = false, spectrum, spectrumRange, children,
    onTransportChange, onWaveformChange, onFullscreenChange, ...rest
  } = props;
  const settings = {} as Record<QuantumBackgroundSettingKey, unknown>;
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key in quantumBackgroundDefaults) settings[key as QuantumBackgroundSettingKey] = value;
    else attributes[key] = value;
  }
  if (fullscreen) settings.fieldSize ??= quantumBackgroundFullscreenFieldSize;
  for (const key of settingKeys) settings[key] ??= quantumBackgroundDefaults[key];

  const frame = useRef<HTMLIFrameElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const theme = useThemePalette();
  const [mounted, setMounted] = useState(typeof IntersectionObserver === "undefined");
  const [ready, setReady] = useState(false);
  const sent = useRef<Partial<Record<QuantumBackgroundSettingKey, unknown>>>({});
  const callbacks = useRef({ onTransportChange, onWaveformChange, onFullscreenChange });
  callbacks.current = { onTransportChange, onWaveformChange, onFullscreenChange };
  const normalizedBudget = typeof particleBudget === "number" && Number.isFinite(particleBudget)
    ? Math.max(0, Math.floor(particleBudget)) : undefined;
  const normalizedCount = typeof particleCount === "number" && Number.isFinite(particleCount)
    ? Math.min(quantumBackgroundMaxParticles, Math.max(0, Math.floor(particleCount))) : undefined;
  const send = useCallback((key: string, value?: unknown) => frame.current?.contentWindow?.postMessage({ type: "ad-qf-control", key, value }, "*"), []);

  useImperativeHandle(ref, () => ({
    loadFile: (file) => send("file", file),
    togglePlayback: () => send("play"),
    seek: (seconds) => send("seek", seconds),
    toggleMicrophone: () => send("mic"),
    screenshot: () => send("screenshot"),
    toggleFullscreen: () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void root.current?.requestFullscreen?.();
    },
  }), [send]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const { type, value } = event.data ?? {};
      if (type === "ad-qf-ready") setReady(true);
      else if (type === "ad-qf-transport") callbacks.current.onTransportChange?.(value as QuantumBackgroundTransport);
      else if (type === "ad-qf-waveform" && Array.isArray(value)) callbacks.current.onWaveformChange?.(value);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (mounted || !root.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setMounted(true);
    }, { rootMargin: "120px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [mounted]);
  // Only settings that changed since the last render reach the iframe.
  useEffect(() => {
    if (!ready) return;
    for (const key of settingKeys) {
      if (sent.current[key] === settings[key]) continue;
      sent.current[key] = settings[key];
      send(key, settings[key]);
    }
  });
  useEffect(() => {
    if (ready) send("particleBudget", normalizedBudget);
  }, [ready, normalizedBudget]);
  useEffect(() => {
    if (ready) send("particleCount", normalizedCount);
  }, [ready, normalizedCount]);
  const [low = 40, high = 12000] = spectrumRange ?? [];
  useEffect(() => {
    if (ready) send("spectrum", { bands: spectrum ? [...spectrum] : null, range: [low, high] });
  }, [ready, spectrum, low, high]);
  // The top layer lifts the scene above every stacking context without moving it in the DOM,
  // so the iframe keeps running; browsers without popovers fall back to the fixed CSS position.
  useLayoutEffect(() => {
    const node = root.current;
    if (!fullscreen || !node?.showPopover) return;
    node.showPopover();
    return () => { if (node.matches(":popover-open")) node.hidePopover(); };
  }, [fullscreen]);
  useEffect(() => {
    if (!fullscreen) return;
    const leave = (event: KeyboardEvent) => { if (event.key === "Escape") callbacks.current.onFullscreenChange?.(false); };
    document.addEventListener("keydown", leave);
    return () => document.removeEventListener("keydown", leave);
  }, [fullscreen]);
  useEffect(() => {
    if (!ready || !root.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) send("visible", entry.isIntersecting);
    }, { rootMargin: "0px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    send("palette", [theme.primary, theme.secondary]);
  }, [ready, theme.primary, theme.secondary]);

  return <div data-ad-component="QuantumBackground" ref={root} className={`ad-quantum-background ${className}`.trim()}
    data-fullscreen={fullscreen || undefined} popover={fullscreen ? "manual" : undefined} {...attributes}>
    {mounted && <iframe ref={frame} title="Quantum Background visualizer" srcDoc={reference} allow="microphone"
      data-particle-budget={normalizedBudget} data-particle-count={normalizedCount} />}
    {children != null && <div className="ad-qb-content">{children}</div>}
  </div>;
});

/** @deprecated Use QuantumBackground. The original import remains compatible. */
export const QuantumFieldExperience = QuantumBackground;
/** @deprecated Use QuantumBackgroundProps. */
export type QuantumFieldExperienceProps = QuantumBackgroundProps;
/** @deprecated Use quantumBackgroundControls. */
export const quantumFieldExperienceControls = quantumBackgroundControls;
