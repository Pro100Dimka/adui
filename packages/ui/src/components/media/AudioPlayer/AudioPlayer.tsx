import { useEffect, useRef, useState } from "react";
import { clamp, mark, timeText, useControllable } from "../../../core/base";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import { Waveform } from "../Waveform/Waveform";
import type { AudioPlayerProps } from "../shared";
export const AudioPlayer = (p: AudioPlayerProps) => {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [muted, setMuted] = useState(false);
  const [volume, setVolume] = useControllable(p.volume, p.defaultVolume ?? 0.7);
  const duration = p.duration ?? 51;
  useEffect(() => {
    if (!p.src) return;
    const media = new Audio(p.src);
    audio.current = media;
    const time = () => {
      setPosition(media.currentTime);
      p.onTimeChange?.(media.currentTime);
    };
    media.addEventListener("timeupdate", time);
    return () => {
      media.pause();
      media.removeEventListener("timeupdate", time);
      audio.current = null;
    };
  }, [p.src]);
  // Without a source the timeline still runs, so the player can be shown alive in demos.
  useEffect(() => {
    if (p.src || !playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      setPosition((v) => {
        const next = v + (now - last) / 1000;
        if (next >= duration) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [p.src, playing, duration]);
  useEffect(() => {
    if (audio.current) {
      audio.current.muted = muted;
      audio.current.volume = clamp(volume, 0, 1);
    }
  }, [muted, volume]);
  const toggle = () => {
    const next = !playing;
    setPlaying(next);
    p.onPlayingChange?.(next);
    if (audio.current) {
      if (next) void audio.current.play();
      else audio.current.pause();
    }
  };
  const seek = (v: number) => {
    setPosition(v);
    if (audio.current) audio.current.currentTime = v;
    p.onTimeChange?.(v);
  };
  return (
    <div {...mark("AudioPlayer", p)} data-playing={playing || undefined}>
      <span className="ad-player-play">
        <IconButton
          variant="primary"
          round
          icon={playing ? "pause" : "play"}
          label={playing ? "Пауза" : "Воспроизвести"}
          onClick={toggle}
        />
      </span>
      <div className="ad-player-track">
        <Waveform
          duration={duration}
          position={position}
          onSeek={seek}
          points={p.points}
        />
        <div className="ad-player-times">
          <span className="ad-time">{timeText(position)}</span>
          <span className="ad-time">−{timeText(duration - position)}</span>
        </div>
      </div>
      <div className="ad-player-volume">
        <IconButton
          variant="ghost"
          icon="volume"
          label={muted ? "Включить звук" : "Выключить звук"}
          aria-pressed={muted}
          data-muted={muted || undefined}
          onClick={() => setMuted((v) => !v)}
        />
        {p.showVolume !== false && (
          <Slider
            size="sm"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onValueChange={(v) => {
              setMuted(false);
              setVolume(v);
            }}
            label="Громкость"
          />
        )}
      </div>
    </div>
  );
};
