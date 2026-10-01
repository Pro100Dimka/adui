import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp, define, mark, timeText, useControllable, type CommonProps } from "../../../core/base";
import { useDecoration } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { Surface } from "../../layout/Surface/Surface";
import { Badge } from "../../feedback/Badge/Badge";
import { MessageBar } from "../../feedback/MessageBar/MessageBar";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Select } from "../../controls/Select/Select";
import { Slider } from "../../controls/Slider/Slider";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import { type WaveformProps, type VolumeControlProps, type AudioPlayerProps, type LevelMeterProps, type RotaryKnobProps, type RotaryKnobController, type CircularGaugeProps, type SparklineProps } from "../shared";
import { WaveDecoration } from "../WaveDecoration/WaveDecoration";
import { ParticleLayer } from "../ParticleLayer/ParticleLayer";
import { Waveform } from "../Waveform/Waveform";
import { VolumeControl } from "../VolumeControl/VolumeControl";
import { TransportBar } from "../TransportBar/TransportBar";
import { LevelMeter } from "../LevelMeter/LevelMeter";
import { RotaryKnob } from "../RotaryKnob/RotaryKnob";
import { CircularGauge } from "../CircularGauge/CircularGauge";
import { Sparkline } from "../Sparkline/Sparkline";
import { LatencyIndicator } from "../LatencyIndicator/LatencyIndicator";

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
