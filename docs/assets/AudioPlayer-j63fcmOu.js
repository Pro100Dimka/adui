const n=`import { useTr } from "../../../core/i18n";
import { useEffect, useRef, useState, type RefObject } from "react";
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
    [muted, setMuted] = useState(false);
  const [volume, setVolume] = useControllable(p.volume, p.defaultVolume ?? 0.7);
  const [fileDuration, setFileDuration] = useState<number>();
  const duration = p.duration ?? fileDuration ?? 51;
  const controlled = p.playing !== undefined;
  const active = p.playing ?? playing;
  const start = (media: HTMLAudioElement) => {
    void media.play().catch(() => {
      if (audio.current === media) {
        setPlaying(false);
        p.onPlayingChange?.(false);
      }
    });
  };
  useEffect(() => {
    if (controlled || !p.src) return;
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
  }, [p.src, controlled]);
  useEffect(() => {
    if (audio.current) {
      audio.current.muted = muted;
      audio.current.volume = clamp(volume, 0, 1);
    }
  }, [muted, volume]);
  const toggle = () => {
    const next = !active;
    if (!controlled) setPlaying(next);
    p.onPlayingChange?.(next);
    if (!controlled && audio.current) {
      if (next) start(audio.current);
      else audio.current.pause();
    }
  };
  return (
    <div {...mark("AudioPlayer", p)} data-playing={active || undefined}>
      <span className="ad-player-play">
        <IconButton
          variant="primary"
          round
          icon={active ? "pause" : "play"}
          label={active ? tr("Пауза") : tr("Воспроизвести")}
          disabled={p.disabled}
          onClick={toggle}
        />
      </span>
      <PlaybackTrack
        key={p.src}
        audio={audio}
        playing={active}
        position={p.position}
        disabled={p.disabled}
        duration={duration}
        points={p.points}
        src={p.src}
        onTimeChange={p.onTimeChange}
        onEnded={() => { setPlaying(false); p.onPlayingChange?.(false); }}
      />
      {p.showVolume !== false && <div className="ad-player-volume">
        <IconButton
          variant="ghost"
          icon="volume"
          label={muted ? tr("Включить звук") : tr("Выключить звук")}
          aria-pressed={muted}
          data-muted={muted || undefined}
          onClick={() => setMuted((v) => !v)}
        />
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
      </div>}
    </div>
  );
};

/** The clock updates only the timeline; transport and volume controls stay untouched. */
function PlaybackTrack({ audio, playing, position: controlledPosition, disabled, duration, points, src, onTimeChange, onEnded }: Pick<AudioPlayerProps, "points" | "src" | "onTimeChange" | "position" | "disabled"> & {
  audio: RefObject<HTMLAudioElement | null>;
  playing: boolean;
  duration: number;
  onEnded: () => void;
}) {
  const [localPosition, setPosition] = useState(0);
  const position = controlledPosition ?? localPosition;
  const current = useRef(0);
  const lastTick = useRef<number | undefined>(undefined);
  useTick((now) => {
    const media = audio.current;
    const next = media?.currentTime ?? current.current + (now - (lastTick.current ?? now)) / 1000;
    lastTick.current = now;
    current.current = !media && next >= duration ? 0 : next;
    setPosition(current.current);
    if (media) onTimeChange?.(next);
    else if (next >= duration) onEnded();
  }, playing && controlledPosition === undefined);
  useEffect(() => {
    if (!playing) lastTick.current = undefined;
  }, [playing]);
  const seek = (next: number) => {
    if (controlledPosition !== undefined) {
      onTimeChange?.(next);
      return;
    }
    current.current = next;
    setPosition(next);
    if (audio.current) audio.current.currentTime = next;
    onTimeChange?.(next);
  };
  return (
    <div className="ad-player-track">
      <Waveform duration={duration} position={position} onSeek={seek} points={points} src={points ? undefined : src} disabled={disabled} />
      <div className="ad-player-times">
        <span className="ad-time">{timeText(position)}</span>
        <span className="ad-time">−{timeText(duration - position)}</span>
      </div>
    </div>
  );
}
`;export{n as default};
