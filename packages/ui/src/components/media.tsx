import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../core/base";
import { useDecoration } from "../core/motion";
import { Icon, Surface } from "./layout";
import { Badge, MessageBar } from "./feedback";
import { IconButton, Select, Slider, ToggleButton } from "./controls";

export const WaveDecoration = define<CommonProps>("WaveDecoration", p => {
  const ref = useRef<SVGSVGElement>(null); const uid = useId().replace(/:/g, "");
  const paint = (t: number) => ref.current?.querySelectorAll("path").forEach((path, j) => {
    let d = "";
    for (let i = 0; i <= 65; i++) { const x = i / 65 * 600, y = 65 + (j - 11) * 2.5 + Math.sin(i * .115 + t * .6 + j * .08) * 24 + Math.sin(i * .19 - t * .31) * 9; d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`; }
    path.setAttribute("d", d);
  });
  useDecoration(ref, paint);
  return <svg {...mark("WaveDecoration", p)} ref={ref} viewBox="0 0 600 130" aria-hidden="true"><defs><linearGradient id={`wave-${uid}`}>{[[0, 0], [.2, .3], [.7, 1], [1, .35]].map(([offset, opacity]) => <stop key={offset} offset={offset} stopColor="#ff426d" stopOpacity={opacity} />)}</linearGradient></defs>{Array.from({ length: 22 }, (_, j) => <path key={j} d="M0 65H600" fill="none" stroke={`url(#wave-${uid})`} strokeWidth={j % 7 === 0 ? 1.2 : .65} opacity={.5 + j % 4 * .13} />)}</svg>;
});
export const ParticleLayer = define<CommonProps>("ParticleLayer", p => {
  const ref = useRef<SVGSVGElement>(null);
  const points = useMemo(() => { let seed = 23; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647); return Array.from({ length: 65 }, () => ({ x: rnd() * 600, y: rnd() * 130, r: .3 + rnd() * 1.3, a: .1 + rnd() * .7 })); }, []);
  useDecoration(ref, t => ref.current?.querySelectorAll("circle").forEach((n, i) => n.setAttribute("opacity", String(.15 + .65 * (.5 + .5 * Math.sin(t * .8 + i))))));
  return <svg {...mark("ParticleLayer", p)} ref={ref} viewBox="0 0 600 130" aria-hidden="true">{points.map((v, i) => <circle key={i} cx={v.x} cy={v.y} r={v.r} opacity={v.a} fill={i % 6 ? "#ff426d" : "#ffe2eb"} />)}</svg>;
});
export interface WaveformProps extends CommonProps { duration?: number; position?: number; defaultPosition?: number; onSeek?: (time: number) => void; points?: number[]; color?: string; label?: string; disabled?: boolean }
export const Waveform = define<WaveformProps>("Waveform", p => {
  const duration = Math.max(.001, p.duration ?? 231);
  const [position, seek] = useControllable(p.position, p.defaultPosition ?? 0, p.onSeek);
  const d = useMemo(() => {
    const points = p.points ?? Array.from({ length: 280 }, (_, i) => (2 + 24 * (.3 + .7 * Math.sin(i * .032) ** 2) * (.22 + .78 * Math.abs(Math.sin(i * 1.723)))) / 32);
    return points.map((v, i) => { const x = i / Math.max(1, points.length - 1) * 600, a = clamp(Math.abs(v), 0, 1) * 30; return `M${x.toFixed(2)} ${(32 - a).toFixed(2)}V${(32 + a).toFixed(2)}`; }).join("");
  }, [p.points]);
  const x = clamp(position / duration, 0, 1) * 600;
  return <div {...mark("Waveform", p)}><svg viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true"><path d={d} stroke={p.color ?? "#ff416c"} strokeWidth={1} fill="none" /><path d={`M${x} 3V61`} stroke="#ffe0e5" strokeWidth={1.5} /></svg><input type="range" min={0} max={duration} step={.01} value={clamp(position, 0, duration)} disabled={p.disabled} aria-label={p.label ?? "Позиция воспроизведения"} onChange={e => seek(Number(e.currentTarget.value))} /></div>;
});
export interface VolumeControlProps extends CommonProps { value?: number; defaultValue?: number; onValueChange?: (value: number) => void; muted?: boolean; defaultMuted?: boolean; onMute?: (muted: boolean) => void; showValue?: boolean }
export const VolumeControl = define<VolumeControlProps>("VolumeControl", p => {
  const [volume, setVolume] = useControllable(p.value, p.defaultValue ?? 35, p.onValueChange);
  const [muted, setMuted] = useControllable(p.muted, p.defaultMuted ?? false, p.onMute);
  return <div {...mark("VolumeControl", p, "glass")}><ToggleButton checked={muted} onValueChange={setMuted} icon="volume" label="Выключить звук" variant="ghost" /><Slider value={volume} onValueChange={setVolume} label="Громкость" />{p.showValue !== false && <output>{volume}</output>}</div>;
});
export interface AudioPlayerProps extends CommonProps { src?: string; duration?: number; onTimeChange?: (time: number) => void; onPlayingChange?: (playing: boolean) => void; points?: number[]; volume?: number }
export const AudioPlayer = define<AudioPlayerProps>("AudioPlayer", p => {
  const audio = useRef<HTMLAudioElement | null>(null); const mounted = useRef(true);
  const [playing, setPlaying] = useState(false), [position, setPosition] = useState(0), [muted, setMuted] = useState(false);
  const [realDuration, setDuration] = useState<number | undefined>(), [error, setError] = useState<string>();
  const duration = realDuration ?? p.duration ?? 51;
  const now = useRef({ position: 0, at: 0 }); const onTime = useRef(p.onTimeChange); onTime.current = p.onTimeChange;
  const onPlaying = useRef(p.onPlayingChange); onPlaying.current = p.onPlayingChange;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    setPlaying(false); setPosition(0); setDuration(undefined); setError(undefined); now.current = { position: 0, at: performance.now() };
    if (!p.src) return;
    const media = new Audio(); media.preload = "metadata"; media.src = p.src; audio.current = media;
    const time = () => { setPosition(media.currentTime); onTime.current?.(media.currentTime); };
    const metadata = () => { if (Number.isFinite(media.duration)) setDuration(media.duration); };
    const end = () => { setPlaying(false); setPosition(0); media.currentTime = 0; };
    const fail = () => { setError("Не удалось открыть аудиофайл"); setPlaying(false); };
    media.addEventListener("timeupdate", time); media.addEventListener("loadedmetadata", metadata); media.addEventListener("ended", end); media.addEventListener("error", fail);
    return () => { media.pause(); media.removeEventListener("timeupdate", time); media.removeEventListener("loadedmetadata", metadata); media.removeEventListener("ended", end); media.removeEventListener("error", fail); media.removeAttribute("src"); media.load(); audio.current = null; };
  }, [p.src]);
  useEffect(() => { if (audio.current) { audio.current.muted = muted; audio.current.volume = clamp(p.volume ?? .7, 0, 1); } }, [muted, p.volume, p.src]);
  useEffect(() => {
    onPlaying.current?.(playing);
    if (!playing) { audio.current?.pause(); return; }
    now.current = { position, at: performance.now() };
    if (audio.current) { void audio.current.play().catch(() => { if (mounted.current) { setError("Браузер не запустил воспроизведение"); setPlaying(false); } }); return; }
    const id = window.setInterval(() => {
      const time = now.current.position + (performance.now() - now.current.at) / 1000;
      if (time >= duration) { setPosition(0); setPlaying(false); onTime.current?.(0); }
      else { setPosition(time); onTime.current?.(time); }
    }, 80);
    return () => clearInterval(id);
  }, [playing, p.src, duration]);
  function seek(value: number) { const t = clamp(value, 0, duration); setPosition(t); now.current = { position: t, at: performance.now() }; if (audio.current) audio.current.currentTime = t; onTime.current?.(t); }
  return <div {...mark("AudioPlayer", p)}>
    <IconButton round variant="primary" icon={playing ? "pause" : "play"} label={playing ? "Пауза" : "Воспроизвести"} aria-pressed={playing} onClick={() => setPlaying(v => !v)} />
    <div className="ad-player-track"><Waveform duration={duration} position={position} onSeek={seek} points={p.points} /><span className="ad-time">{timeText(position)} / {timeText(duration)}</span>{error && <span role="alert" className="ad-field-error">{error}</span>}</div>
    <ToggleButton icon="volume" variant="ghost" label="Отключить звук" checked={muted} onValueChange={setMuted} />
  </div>;
});
export const TransportBar = define<AudioPlayerProps>("TransportBar", p => <Surface className={`ad-transport-bar ${p.className ?? ""}`}><AudioPlayer {...p} duration={p.duration ?? 231} /><VolumeControl defaultValue={70} showValue={false} /><Select label="Масштаб дорожки" options={["100%", "125%", "150%"]} /></Surface>);
export interface LevelMeterProps extends CommonProps { value?: number; label?: string; segmented?: boolean }
export const LevelMeter = define<LevelMeterProps>("LevelMeter", p => {
  const value = clamp(p.value ?? 72);
  return <div {...mark("LevelMeter", p)} role="meter" aria-label={p.label ?? "Уровень сигнала"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>{Array.from({ length: 28 }, (_, i) => <i key={i} data-lit={i / 28 < value / 100} style={{ height: p.segmented ? 18 : 12 + 19 * Math.sin(i * .35) ** 2 }} />)}</div>;
});
export interface CircularGaugeProps extends CommonProps { value?: number; label?: string; icon?: string; unit?: string }
function GaugeFace({ value = 72, icon = "volume", label = "Микрофон", unit = "%" }: CircularGaugeProps) {
  const path = "M22 86A51 51 0 1 1 98 86";
  return <><svg viewBox="0 0 120 100" aria-hidden="true"><path d={path} fill="none" stroke="#342634" strokeWidth={6} strokeLinecap="round" /><path d={path} fill="none" stroke="#ff426b" strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={`${clamp(value)} 100`} style={{ filter: "drop-shadow(0 0 4px #ff315c)" }} /></svg><Icon name={icon} size={30} /><strong>{value}{unit}</strong><small>{label}</small></>;
}
export const CircularGauge = define<CircularGaugeProps>("CircularGauge", p => <div {...mark("CircularGauge", p)} role="meter" aria-label={p.label ?? "Микрофон"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamp(p.value ?? 72)}><GaugeFace {...p} /></div>);
export interface RotaryKnobProps extends CircularGaugeProps { defaultValue?: number; onValueChange?: (value: number) => void; disabled?: boolean; step?: number }
export const RotaryKnob = define<RotaryKnobProps>("RotaryKnob", p => {
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? 72, p.onValueChange); const drag = useRef<{ y: number; value: number } | null>(null);
  const update = (next: number) => setValue(Math.round(clamp(next) / (p.step ?? 1)) * (p.step ?? 1));
  return <div {...mark("RotaryKnob", p, undefined, "ad-circular-gauge")} tabIndex={p.disabled ? -1 : 0} role="slider" aria-disabled={p.disabled} aria-label={p.label ?? "Громкость"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
    onPointerDown={e => { if (e.button || p.disabled) return; drag.current = { y: e.clientY, value }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (drag.current) update(drag.current.value + (drag.current.y - e.clientY) * .6); }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
    onKeyDown={e => { if (p.disabled) return; const steps: Record<string, number> = { ArrowUp: p.step ?? 1, ArrowRight: p.step ?? 1, ArrowDown: -(p.step ?? 1), ArrowLeft: -(p.step ?? 1), PageUp: 10, PageDown: -10 }; if (e.key in steps || e.key === "Home" || e.key === "End") { e.preventDefault(); update(e.key === "Home" ? 0 : e.key === "End" ? 100 : value + steps[e.key]); } }}>
    <GaugeFace {...p} value={value} /><div className="ad-knob-disc" />
  </div>;
});
export interface SparklineProps extends CommonProps { values?: number[]; color?: string; label?: string }
export const Sparkline = define<SparklineProps>("Sparkline", p => {
  const values = p.values ?? [12, 23, 17, 31, 43, 24, 28, 20, 41, 29, 51, 34, 38, 22, 31, 16, 23];
  return <svg {...mark("Sparkline", p)} viewBox="0 0 240 70" role={p.label ? "img" : undefined} aria-label={p.label} aria-hidden={!p.label}><polyline points={values.map((v, i) => `${i / Math.max(1, values.length - 1) * 240},${65 - v}`).join(" ")} fill="none" stroke={p.color ?? "#ff416a"} strokeWidth={1.4} style={{ filter: "drop-shadow(0 0 4px #ff315c)" }} /></svg>;
});
export const LatencyIndicator = define<CircularGaugeProps>("LatencyIndicator", p => <div {...mark("LatencyIndicator", p)}><div><small>Задержка</small><strong>{p.value ?? 68} мс</strong><Badge tone="success">{p.label ?? "Отлично"}</Badge></div><Sparkline /></div>);
