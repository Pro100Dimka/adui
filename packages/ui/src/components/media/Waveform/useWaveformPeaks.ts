import { useEffect, useState } from "react";

/** Per slice of the track: the loudest sample (peak) and the average loudness (RMS), 0..1. */
export interface WaveformData {
  peaks: number[];
  rms: number[];
}

/** Splits the track (all channels) into `bins` equal slices and measures each one. */
async function decode(src: string | Blob, bins: number): Promise<WaveformData> {
  const data =
    typeof src === "string"
      ? await (await fetch(src)).arrayBuffer()
      : await src.arrayBuffer();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(
    data,
  );
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>
    audio.getChannelData(i),
  );
  const size = Math.max(1, Math.floor(audio.length / bins));
  const peaks: number[] = [];
  const rms: number[] = [];
  for (let bin = 0; bin < bins; bin += 1) {
    let peak = 0;
    let sum = 0;
    for (const channel of channels)
      for (let i = bin * size, end = i + size; i < end; i += 1) {
        const sample = Math.abs(channel[i] ?? 0);
        peak = Math.max(peak, sample);
        sum += sample * sample;
      }
    peaks.push(peak);
    rms.push(Math.sqrt(sum / (size * channels.length)));
  }
  const loudest = Math.max(...peaks, 0.0001);
  return {
    peaks: peaks.map((v) => v / loudest),
    rms: rms.map((v) => v / loudest),
  };
}

/**
 * Peaks and average loudness of an audio file for a waveform, decoded in the browser.
 * `null` while loading, empty arrays when the file cannot be read; nothing is fetched
 * without a source.
 */
export function useWaveformPeaks(src?: string | Blob | null, bins = 600) {
  const [data, setData] = useState<WaveformData | null>(null);
  useEffect(() => {
    setData(null);
    if (!src) return;
    let alive = true;
    decode(src, bins).then(
      (values) => alive && setData(values),
      () => alive && setData({ peaks: [], rms: [] }),
    );
    return () => {
      alive = false;
    };
  }, [src, bins]);
  return src ? data : null;
}
