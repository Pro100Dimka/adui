import { tr, useTr } from "../../../core/i18n";
import { useEffect, useRef, useState } from "react";
import { clamp, mark, timeText, useControllable } from "../../../core/base";
import { useTick } from "../../../core/motion/hooks";
import { IconButton } from "../../controls/IconButton/IconButton";
import { Slider } from "../../controls/Slider/Slider";
import { Waveform } from "../Waveform/Waveform";
import type { AudioPlayerProps } from "../shared";
export const AudioPlayer = (p: AudioPlayerProps) => {
  const tr = useTr();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [muted, setMuted] = useState(false);
  const [volume, setVolume] = useControllable(p.volume, p.defaultVolume ?? 0.7);
  const [fileDuration, setFileDuration] = useState<number>();
  const duration = p.duration ?? fileDuration ?? 51;
  const start = (media: HTMLAudioElement) => {
    void media.play().catch(() => {
      if (audio.current === media) {
        setPlaying(false);
        p.onPlayingChange?.(false);
      }
    });
  };
  useEffect(() => {
    if (!p.src) return;
    const media = new Audio(p.src);
    audio.current = media;
    media.muted = muted;
    media.volume = clamp(volume, 0, 1);
    if (playing) start(media);
    const meta = () =>
      Number.isFinite(media.duration) && setFileDuration(media.duration);
    const ended = () => {
      setPlaying(false);
      p.onPlayingChange?.(false);
    };
    media.addEventListener("loadedmetadata", meta);
    media.addEventListener("ended", ended);
    return () => {
      media.pause();
      media.removeEventListener("loadedmetadata", meta);
      media.removeEventListener("ended", ended);
      audio.current = null;
      setFileDuration(undefined);
    };
  }, [p.src]);
  // While playing, the position is read on every tick of the shared motion clock (timeupdate
  // fires only ~4 times a second), so the cursor glides. Without a source the timeline runs on its own,
  // so the player can be shown alive in demos.
  const lastTick = useRef(0);
  useTick((now) => {
    const media = audio.current;
    if (media) {
      setPosition(media.currentTime);
      p.onTimeChange?.(media.currentTime);
    } else
      setPosition((v) => {
        const next = v + (now - (lastTick.current || now)) / 1000;
        if (next < duration) return next;
        setPlaying(false);
        return 0;
      });
    lastTick.current = now;
  }, playing);
  useEffect(() => {
    if (!playing) lastTick.current = 0;
  }, [playing]);
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
      if (next) start(audio.current);
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
          label={playing ? tr("Пауза") : tr("Воспроизвести")}
          onClick={toggle}
        />
      </span>
      <div className="ad-player-track">
        <Waveform
          duration={duration}
          position={position}
          onSeek={seek}
          points={p.points}
          src={p.points ? undefined : p.src}
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
          label={muted ? tr("Включить звук") : tr("Выключить звук")}
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
            label={tr("Громкость")}
          />
        )}
      </div>
    </div>
  );
};
