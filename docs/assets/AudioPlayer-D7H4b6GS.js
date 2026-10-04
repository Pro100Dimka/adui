const n=`import { useEffect, useRef, useState } from "react";
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
  const [fileDuration, setFileDuration] = useState<number>();
  const duration = p.duration ?? fileDuration ?? 51;
  useEffect(() => {
    if (!p.src) return;
    const media = new Audio(p.src);
    audio.current = media;
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
  // While playing, the position is read every display refresh (timeupdate fires only ~4
  // times a second), so the cursor glides. Without a source the timeline runs on its own,
  // so the player can be shown alive in demos.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const media = audio.current;
      if (media) {
        setPosition(media.currentTime);
        p.onTimeChange?.(media.currentTime);
      } else
        setPosition((v) => {
          const next = v + (now - last) / 1000;
          if (next < duration) return next;
          setPlaying(false);
          return 0;
        });
      last = now;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
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
`;export{n as default};
