const e=`import { memo, useCallback, useEffect, useRef, useState, type HTMLAttributes, type RefObject } from "react";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { Slider } from "../../controls/Slider/Slider";
import { Switch } from "../../controls/Switch/Switch";
import { Tabs } from "../../controls/Tabs/Tabs";
import { CollapsibleSection } from "../../feedback/CollapsibleSection/CollapsibleSection";
import { Tooltip } from "../../feedback/Tooltip/Tooltip";
import { useThemePalette } from "../../foundation/ThemeProvider/ThemeProvider";
import { AudioPlayer } from "../../media/AudioPlayer/AudioPlayer";
import reference from "./reference.html?raw";

type Control = { key: string; label: string; value: number | boolean | string; min?: number; max?: number; step?: number; options?: readonly string[] };
const fields = ["Photon (EM)", "Gluon (Strong)", "Higgs (Mass)", "Gravity", "Dark Energy", "Neutrino", "Waveform Terrain"] as const;
export const quantumFieldExperienceControls: readonly { id: string; label: string; controls: readonly Control[] }[] = [
  { id: "field", label: "Поле", controls: [
    { key: "field", label: "Тип поля", value: "Gluon (Strong)", options: fields },
    { key: "sensitivity", label: "Чувствительность", value: 1.1, min: 0.1, max: 3, step: 0.01 },
    { key: "density", label: "Плотность", value: 0.043, min: 0.017, max: 0.14, step: 0.001 },
    { key: "timeScale", label: "Скорость", value: 1, min: 0, max: 3, step: 0.01 },
  ] },
  { id: "environment", label: "Среда", controls: [
    { key: "nebulaEnabled", label: "Туманность", value: false },
    { key: "nebulaIntensity", label: "Яркость туманности", value: 0.3, min: 0, max: 2, step: 0.01 },
    { key: "connectionsEnabled", label: "Сеть связей", value: true },
    { key: "connectionThreshold", label: "Дальность связей", value: 20, min: 5, max: 25, step: 0.1 },
    { key: "connectionOpacity", label: "Яркость связей", value: 0.75, min: 0.1, max: 1, step: 0.01 },
    { key: "crawlersEnabled", label: "Бегущие огни", value: true },
    { key: "particleTrailsEnabled", label: "Следы частиц", value: true },
    { key: "particleTrailOpacity", label: "Яркость следов", value: 1, min: 0, max: 1, step: 0.01 },
  ] },
  { id: "camera", label: "Камера", controls: [
    { key: "lensFlareEnabled", label: "Блики", value: true },
    { key: "lensFlareIntensity", label: "Сила бликов", value: 0.1, min: 0, max: 2, step: 0.01 },
    { key: "dofEnabled", label: "Глубина резкости", value: false },
    { key: "dofFocus", label: "Фокус", value: 0.04, min: 0, max: 0.1015, step: 0.0001 },
    { key: "dofFocalLength", label: "Падение фокуса", value: 0.4, min: 0.05, max: 0.5, step: 0.01 },
    { key: "dofBokehStrength", label: "Размытие", value: 0.36, min: 0, max: 1, step: 0.01 },
    { key: "cameraShake", label: "Дрожание", value: 0.65, min: 0, max: 2, step: 0.01 },
  ] },
  { id: "effects", label: "Эффекты", controls: [
    { key: "bloom", label: "Свечение", value: 0.3, min: 0, max: 3, step: 0.01 },
    { key: "trails", label: "Шлейф", value: 0.66144, min: 0.5, max: 0.98, step: 0.001 },
    { key: "chromaticAberration", label: "Хроматика", value: 0.004, min: 0, max: 0.025, step: 0.0001 },
    { key: "anamorphicStretch", label: "Анаморфный свет", value: 0.1, min: 0, max: 1, step: 0.01 },
    { key: "godRaysEnabled", label: "Световые лучи", value: false },
    { key: "godRaysIntensity", label: "Сила лучей", value: 0.078, min: 0, max: 1, step: 0.01 },
    { key: "filmGrain", label: "Зерно", value: 0.001, min: 0, max: 0.2, step: 0.001 },
  ] },
  { id: "physics", label: "Физика", controls: [
    { key: "vortexStrength", label: "Вихрь", value: 0.73, min: 0, max: 1, step: 0.01 },
    { key: "pulseIntensity", label: "Пульсация", value: 0.15, min: 0, max: 2.5, step: 0.01 },
  ] },
  { id: "audio", label: "Аудио", controls: [
    { key: "bassGateEnabled", label: "Бас-гейт", value: false },
    { key: "bassGateThreshold", label: "Порог", value: 0.12, min: 0, max: 0.5, step: 0.01 },
    { key: "bassGateAttack", label: "Атака", value: 0.3, min: 0.01, max: 0.3, step: 0.01 },
    { key: "bassGateRelease", label: "Спад", value: 0.136, min: 0.05, max: 0.5, step: 0.01 },
  ] },
  { id: "advanced", label: "Дополнительно", controls: [
    { key: "onsetSensitivity", label: "Реакция на акценты", value: 1, min: 0.5, max: 3, step: 0.01 },
    { key: "audioCameraEnabled", label: "Аудиокамера", value: true },
    { key: "audioCameraIntensity", label: "Реакция камеры", value: 0.3, min: 0, max: 1, step: 0.01 },
    { key: "waveformTerrainHeight", label: "Высота рельефа", value: 20, min: 5, max: 30, step: 0.1 },
    { key: "adaptiveQualityEnabled", label: "Автокачество", value: true },
    { key: "targetFPS", label: "Целевая частота", value: 45, min: 30, max: 60, step: 1 },
    { key: "interactive", label: "Управление мышью", value: true },
    { key: "paused", label: "Пауза анимации", value: false },
  ] },
];

const initial = Object.fromEntries(quantumFieldExperienceControls.flatMap(({ controls }) => controls.map(({ key, value }) => [key, value]))) as Record<string, string | number | boolean>;
const essentialControls = quantumFieldExperienceControls[0]!.controls.slice(0, 2);
const detailedGroups = [
  { ...quantumFieldExperienceControls[0]!, controls: quantumFieldExperienceControls[0]!.controls.slice(2) },
  ...quantumFieldExperienceControls.slice(1),
];
const enabledBy: Record<string, string> = {
  nebulaIntensity: "nebulaEnabled",
  connectionThreshold: "connectionsEnabled", connectionOpacity: "connectionsEnabled",
  particleTrailOpacity: "particleTrailsEnabled",
  lensFlareIntensity: "lensFlareEnabled",
  dofFocus: "dofEnabled", dofFocalLength: "dofEnabled", dofBokehStrength: "dofEnabled",
  godRaysIntensity: "godRaysEnabled",
  bassGateThreshold: "bassGateEnabled", bassGateAttack: "bassGateEnabled", bassGateRelease: "bassGateEnabled",
  audioCameraIntensity: "audioCameraEnabled", targetFPS: "adaptiveQualityEnabled",
};
type Transport = { mode: string | null; playing: boolean; current: number; duration: number; track: string };
const emptyTransport: Transport = { mode: null, playing: false, current: 0, duration: 0, track: "" };
type FrameMessage = { type?: string; value?: unknown };
const TransportControls = memo(function TransportControls({ send, viewport, receive }: {
  send: (key: string, value?: unknown) => void;
  viewport: RefObject<HTMLDivElement | null>;
  receive: RefObject<((message: FrameMessage) => void) | null>;
}) {
  const [transport, setTransport] = useState<Transport>(emptyTransport);
  const [waveformPoints, setWaveformPoints] = useState<number[]>();
  useEffect(() => {
    receive.current = ({ type, value }) => {
      if (type === "ad-qf-transport") setTransport(value as Transport);
      if (type === "ad-qf-waveform" && Array.isArray(value)) setWaveformPoints(value);
    };
    return () => { receive.current = null; };
  }, [receive]);

  return <>
    <FilePicker variant="button" size="sm" label={transport.track || "Выбрать песню"} accept="audio/*" onFiles={([file]) => {
      if (!file) return;
      setWaveformPoints(undefined);
      setTransport({ ...emptyTransport, track: file.name });
      send("file", file);
    }} />
    <AudioPlayer playing={transport.playing} position={transport.current} duration={transport.duration}
      points={waveformPoints} disabled={transport.mode !== "file"} showVolume={false}
      onPlayingChange={() => send("play")} onTimeChange={(value) => send("seek", value)} />
    <div className="ad-qf-actions">
      <Tooltip content={transport.mode === "mic" ? "Выключить микрофон" : "Включить микрофон"}>
        <IconButton size="sm" icon="mic" label={transport.mode === "mic" ? "Выключить микрофон" : "Микрофон"} title=""
          onClick={() => { setWaveformPoints(undefined); send("mic"); }} />
      </Tooltip>
      <Tooltip content="Сохранить снимок поля">
        <IconButton size="sm" icon="photo" label="Снимок" title="" onClick={() => send("screenshot")} />
      </Tooltip>
      <Tooltip content="Развернуть поле на весь экран">
        <IconButton size="sm" icon="fit" label="На весь экран" title=""
          onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void viewport.current?.requestFullscreen?.(); }} />
      </Tooltip>
    </div>
  </>;
});
export type QuantumFieldExperienceProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Maximum number of visible particles across both field layers. Adaptive quality may draw fewer. */
  particleBudget?: number;
};

/** Full MIT-licensed renderer; the host kit owns the controls and theme. */
export function QuantumFieldExperience({ className = "", particleBudget, ...props }: QuantumFieldExperienceProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const theme = useThemePalette();
  const [mounted, setMounted] = useState(typeof IntersectionObserver === "undefined");
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(detailedGroups[0]!.id);
  const [settings, setSettings] = useState(initial);
  const transportReceiver = useRef<((message: FrameMessage) => void) | null>(null);
  const normalizedBudget = typeof particleBudget === "number" && Number.isFinite(particleBudget)
    ? Math.max(0, Math.floor(particleBudget)) : undefined;
  const group = detailedGroups.find(({ id }) => id === tab) ?? detailedGroups[0]!;
  const send = useCallback((key: string, value?: unknown) => frame.current?.contentWindow?.postMessage({ type: "ad-qf-control", key, value }, "*"), []);
  const change = (key: string, value: string | number | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
    if (ready) send(key, value);
  };
  const renderControl = (control: Control) => {
    const value = settings[control.key] ?? control.value;
    if (control.options) return <Select key={control.key} label={control.label} options={[...control.options]} value={String(value)} onValueChange={(next) => { if (next) change(control.key, next); }} />;
    if (typeof value === "boolean") return <Switch key={control.key} label={control.label} checked={value} onValueChange={(next) => change(control.key, next)} />;
    return <div className="ad-qf-setting" key={control.key}>
      <Slider label={control.label} value={Number(value)} min={control.min} max={control.max} step={control.step} onValueChange={(next) => change(control.key, next)} />
      <output>{Number(value).toFixed(control.step && control.step < 0.001 ? 4 : control.step && control.step < 0.01 ? 3 : 2)}</output>
    </div>;
  };

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "ad-qf-ready") setReady(true);
      transportReceiver.current?.(event.data);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (mounted || !viewport.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setMounted(true);
    }, { rootMargin: "120px" });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [mounted]);
  useEffect(() => {
    if (!ready) return;
    for (const [key, value] of Object.entries(settings)) send(key, value);
  }, [ready]);
  useEffect(() => {
    if (ready) send("particleBudget", normalizedBudget);
  }, [ready, normalizedBudget]);
  useEffect(() => {
    if (!ready || !viewport.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) send("visible", entry.isIntersecting);
    }, { rootMargin: "0px" });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    send("palette", [theme.primary, theme.secondary]);
  }, [ready, theme.primary, theme.secondary]);

  return <div data-ad-component="QuantumFieldExperience" className={\`ad-quantum-field-experience \${className}\`.trim()} {...props}>
    <div className="ad-qf-viewport" ref={viewport}>
      {mounted && <iframe ref={frame} title="Quantum Field visualizer" srcDoc={reference} allow="microphone" data-particle-budget={normalizedBudget} />}
    </div>
    <div className="ad-qf-controls">
      <div className="ad-qf-toolbar">
        <TransportControls send={send} viewport={viewport} receive={transportReceiver} />
        <div className="ad-qf-setting-grid ad-qf-essentials">{essentialControls.map(renderControl)}</div>
      </div>
      <CollapsibleSection title="Тонкая настройка" description="Среда, камера, эффекты и реакция на звук" icon="settings" defaultOpen={false}>
        <Tabs label="Тонкая настройка Quantum Field" items={detailedGroups.map(({ id, label }) => ({ value: id, label }))} value={tab} onValueChange={setTab} />
        <div className="ad-qf-control-panel" role="tabpanel" aria-label={group.label}>
          <div className="ad-qf-setting-grid">{group.controls.filter(({ key }) => !enabledBy[key] || settings[enabledBy[key]] === true).map(renderControl)}</div>
        </div>
      </CollapsibleSection>
    </div>
  </div>;
}
`;export{e as default};
