import { useContext, useEffect, useRef, useState } from "react";
import type { QuantumBackgroundControl, QuantumBackgroundHandle, QuantumBackgroundSettings, QuantumBackgroundTransport } from "./QuantumFieldExperience";
import { ExampleCodeContext, ExamplePreviewContext, U } from "../../../dev/exampleHelpers";

const groups = U.quantumBackgroundControls;
const essentials = groups[0]!.controls.slice(0, 2);
const detailed = [{ ...groups[0]!, controls: groups[0]!.controls.slice(2) }, ...groups.slice(1)];
const tabs = detailed.map(({ id, label }) => ({ value: id, label }));
const emptyTransport: QuantumBackgroundTransport = { mode: null, playing: false, current: 0, duration: 0, track: "" };

/** Settings always printed in the code, so the props are visible before anything is changed. */
const shownProps: readonly (keyof QuantumBackgroundSettings)[] = ["density", "fieldSize", "timeScale", "bloom", "trails", "nebulaEnabled", "connectionsEnabled", "interactive"];

/** How many particles the scene draws for a density when `particleCount` is not set. */
const densityParticles = (density: number) => Math.floor(250_000 * Math.min(density, 0.14)) + 50_000;

const prop = (key: string, value: unknown) =>
  value === true ? key : typeof value === "string" ? `${key}="${value}"` : `${key}={${value}}`;

/** A complete, runnable component: the field and sensitivity are wired to the panel, the rest are plain props. */
function quantumBackgroundCode(settings: Partial<QuantumBackgroundSettings>, particleCount: number) {
  const value = (key: keyof QuantumBackgroundSettings) => settings[key] ?? U.quantumBackgroundDefaults[key];
  const keys = [...shownProps, ...(Object.keys(settings) as (keyof QuantumBackgroundSettings)[])
    .filter((key) => key !== "field" && key !== "sensitivity" && !shownProps.includes(key))];
  return `import { useRef, useState } from "react";
import {
  AudioPlayer, FilePicker, Grid, IconButton, QuantumBackground, Select, Slider, Stack,
  quantumBackgroundFields, quantumBackgroundMaxParticles,
  type QuantumBackgroundField, type QuantumBackgroundHandle, type QuantumBackgroundTransport,
} from "@neo-ui-kit/react";

export default function Example() {
  const scene = useRef<QuantumBackgroundHandle>(null);
  const [field, setField] = useState<QuantumBackgroundField>("${value("field")}");
  const [sensitivity, setSensitivity] = useState(${value("sensitivity")});
  const [particleCount, setParticleCount] = useState(${particleCount});
  const [fullscreen, setFullscreen] = useState(false);
  const [transport, setTransport] = useState<QuantumBackgroundTransport>();
  const [waveform, setWaveform] = useState<number[]>();

  return (
    <Stack gap={3} style={{ width: "100%" }}>
      <QuantumBackground
        ref={scene}
        field={field}
        sensitivity={sensitivity}
        particleCount={particleCount}
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
${keys.map((key) => `        ${prop(key, value(key))}`).join("\n")}
        onTransportChange={setTransport}
        onWaveformChange={setWaveform}
      >
        {fullscreen && (
          <IconButton icon="close" label="Выйти из полноэкранного режима" style={{ position: "absolute", top: 16, right: 16 }}
            onClick={() => setFullscreen(false)} />
        )}
      </QuantumBackground>
      <Stack direction="row" align="start" justify="between" wrap gap={2}>
        <FilePicker variant="button" size="sm" label="Выбрать песню" accept="audio/*"
          onFiles={([file]) => file && scene.current?.loadFile(file)} />
        <Stack direction="row" gap={1}>
          <IconButton size="sm" icon="mic" label="Микрофон" onClick={() => scene.current?.toggleMicrophone()} />
          <IconButton size="sm" icon="photo" label="Снимок" onClick={() => scene.current?.screenshot()} />
          <IconButton size="sm" icon="fit" label="На весь экран" onClick={() => setFullscreen(true)} />
        </Stack>
      </Stack>
      <AudioPlayer playing={transport?.playing} position={transport?.current} duration={transport?.duration}
        points={waveform} disabled={transport?.mode !== "file"} showVolume={false}
        onPlayingChange={() => scene.current?.togglePlayback()} onTimeChange={(seconds) => scene.current?.seek(seconds)} />
      <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap={4} align="end">
        <Select label="Тип поля" options={[...quantumBackgroundFields]} value={field}
          onValueChange={(next) => next && setField(next as QuantumBackgroundField)} />
        <Slider label="Чувствительность" min={0.1} max={3} step={0.01} value={sensitivity}
          onValueChange={setSensitivity} />
        <Slider label="Частицы" min={0} max={quantumBackgroundMaxParticles} step={1000} value={particleCount}
          onValueChange={setParticleCount} />
      </Grid>
    </Stack>
  );
}`;
}

/** The scene with a settings panel built from the kit's controls. The panel only passes props. */
export default function QuantumBackgroundExample() {
  const preview = useContext(ExamplePreviewContext);
  const report = useContext(ExampleCodeContext);
  const scene = useRef<QuantumBackgroundHandle>(null);
  const [settings, setSettings] = useState<Partial<QuantumBackgroundSettings>>({});
  const [tab, setTab] = useState(detailed[0]!.id);
  const [transport, setTransport] = useState(emptyTransport);
  const [waveform, setWaveform] = useState<number[]>();
  const [particleCount, setParticleCount] = useState<number>();
  const [fullscreen, setFullscreen] = useState(false);
  const shownCount = particleCount ?? densityParticles(settings.density ?? U.quantumBackgroundDefaults.density);
  const code = quantumBackgroundCode(settings, shownCount);
  useEffect(() => { report?.(code); }, [report, code]);
  if (preview) return <U.QuantumField paused quality="low" />;

  const value = (key: keyof QuantumBackgroundSettings) => settings[key] ?? U.quantumBackgroundDefaults[key];
  const change = (key: keyof QuantumBackgroundSettings, next: string | number | boolean) => setSettings((current) => {
    const { [key]: _, ...rest } = current;
    return next === U.quantumBackgroundDefaults[key] ? rest : { ...rest, [key]: next };
  });
  const control = (item: QuantumBackgroundControl) => {
    const current = value(item.key);
    if (item.options) return <U.Select key={item.key} label={item.label} options={[...item.options]} value={String(current)} onValueChange={(next) => { if (next) change(item.key, next); }} />;
    if (typeof current === "boolean") return <U.Switch key={item.key} label={item.label} checked={current} onValueChange={(next) => change(item.key, next)} />;
    const step = item.step ?? 1;
    return <div className="qb-setting" key={item.key}>
      <U.Slider label={item.label} value={Number(current)} min={item.min} max={item.max} step={step} onValueChange={(next) => change(item.key, next)} />
      <output>{Number(current).toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : 2)}</output>
    </div>;
  };
  const group = detailed.find(({ id }) => id === tab) ?? detailed[0]!;
  const mic = transport.mode === "mic";

  return <div className="qb-example">
    <U.QuantumBackground ref={scene} {...settings} particleCount={particleCount} fullscreen={fullscreen}
      onFullscreenChange={setFullscreen} onTransportChange={setTransport} onWaveformChange={setWaveform}>
      {fullscreen && <U.IconButton className="qb-exit" icon="close" label="Выйти из полноэкранного режима" onClick={() => setFullscreen(false)} />}
    </U.QuantumBackground>
    <div className="qb-panel">
      <div className="qb-toolbar">
        <U.FilePicker variant="button" size="sm" label={transport.track || "Выбрать песню"} accept="audio/*" onFiles={([file]) => {
          if (!file) return;
          setWaveform(undefined);
          setTransport({ ...emptyTransport, track: file.name });
          scene.current?.loadFile(file);
        }} />
        <U.AudioPlayer playing={transport.playing} position={transport.current} duration={transport.duration}
          points={waveform} disabled={transport.mode !== "file"} showVolume={false}
          onPlayingChange={() => scene.current?.togglePlayback()} onTimeChange={(seconds) => scene.current?.seek(seconds)} />
        <div className="qb-actions">
          <U.Tooltip content={mic ? "Выключить микрофон" : "Включить микрофон"}>
            <U.IconButton size="sm" icon="mic" label={mic ? "Выключить микрофон" : "Микрофон"} title=""
              onClick={() => { setWaveform(undefined); scene.current?.toggleMicrophone(); }} />
          </U.Tooltip>
          <U.Tooltip content="Сохранить снимок поля">
            <U.IconButton size="sm" icon="photo" label="Снимок" title="" onClick={() => scene.current?.screenshot()} />
          </U.Tooltip>
          <U.Tooltip content="Развернуть поле на весь экран">
            <U.IconButton size="sm" icon="fit" label="На весь экран" title="" onClick={() => setFullscreen(true)} />
          </U.Tooltip>
        </div>
        <div className="qb-grid qb-essentials">{essentials.map(control)}</div>
      </div>
      <U.CollapsibleSection title="Тонкая настройка" description="Среда, камера, эффекты и реакция на звук" icon="settings" defaultOpen={false}>
        <U.Tabs label="Тонкая настройка Quantum Background" items={tabs} value={tab} onValueChange={setTab} />
        <div className="qb-grid" role="tabpanel" aria-label={group.label}>
          {group.controls.filter(({ enabledBy }) => !enabledBy || value(enabledBy) === true).map(control)}
          {group.id === "field" && <>
            <U.Switch label="Своё количество частиц" checked={particleCount !== undefined}
              onValueChange={(on) => setParticleCount(on ? shownCount : undefined)} />
            {particleCount !== undefined && <div className="qb-setting">
              <U.Slider label="Количество частиц" value={particleCount} min={0} max={U.quantumBackgroundMaxParticles} step={1000} onValueChange={setParticleCount} />
              <output>{particleCount.toLocaleString("ru-RU")}</output>
            </div>}
            <U.Switch label="На весь экран" checked={fullscreen} onValueChange={setFullscreen} />
          </>}
        </div>
      </U.CollapsibleSection>
    </div>
  </div>;
}
