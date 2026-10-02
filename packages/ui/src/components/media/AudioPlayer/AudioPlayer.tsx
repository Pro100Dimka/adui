import React, { useEffect, useRef, useState } from "react";
import {
  clamp,
  define,
  mark,
  timeText,
  useControllable,
} from "../../../core/base";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import { Waveform } from "../Waveform/Waveform";
import type { AudioPlayerProps } from "../shared";
export const AudioPlayer = define<AudioPlayerProps>("AudioPlayer", (p) => {
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
    <div {...mark("AudioPlayer", p)}>
      <IconButton
        variant="primary"
        icon={playing ? "pause" : "play"}
        label={playing ? "Пауза" : "Воспроизвести"}
        onClick={toggle}
      />
      <div className="ad-player-track">
        <Waveform
          duration={duration}
          position={position}
          onSeek={seek}
          points={p.points}
        />
        <span className="ad-time">
          {timeText(position)} / {timeText(duration)}
        </span>
      </div>
      <IconButton
        variant="ghost"
        icon="volume"
        label="Mute"
        aria-pressed={muted}
        onClick={() => setMuted((v) => !v)}
      />
      {p.showVolume !== false && (
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onValueChange={setVolume}
          label="Громкость"
        />
      )}
    </div>
  );
});
