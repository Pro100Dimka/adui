import { useEffect, useState } from "react";

/** Per slice of the track: the loudest sample (peak) and the average loudness (RMS), 0..1. */
export interface WaveformData {
  peaks: number[];
  rms: number[];
}

/** Splits the track (all channels) into `bins` equal slices and measures each one. */
async function decode(src: string | Blob, bins: number, signal: AbortSignal): Promise<WaveformData> {
  const data =
    typeof src === "string"
      ? await (await fetch(src, { signal })).arrayBuffer()
      : await src.arrayBuffer();
  signal.throwIfAborted();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(
    data,
  );
  signal.throwIfAborted();
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>
    audio.getChannelData(i),
  );
  bins = Math.min(10_000, Math.max(1, Number.isFinite(bins) ? Math.round(bins) : 600));
  const peaks: number[] = [];
  const rms: number[] = [];
  let sliceStart = performance.now();
  let samples = 0;
  for (let bin = 0; bin < bins; bin += 1) {
    const from = Math.floor(bin * audio.length / bins);
    const to = Math.max(from + 1, Math.floor((bin + 1) * audio.length / bins));
    let peak = 0;
    let sum = 0;
    for (const channel of channels)
      for (let i = from; i < to; i += 1) {
        const sample = Math.abs(channel[i] ?? 0);
        peak = Math.max(peak, sample);
        sum += sample * sample;
        // Measuring a long file is CPU work, not part of decodeAudioData's async task.
        // Leave input and rendering time between short slices, including inside a large bin.
        if (++samples % 1024 === 0 && performance.now() - sliceStart >= 8) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
          signal.throwIfAborted();
          sliceStart = performance.now();
        }
      }
    peaks.push(peak);
    rms.push(Math.sqrt(sum / ((to - from) * channels.length)));
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
 * without a source. Superseded work is aborted, and measuring samples yields to input.
 */
export function useWaveformPeaks(src?: string | Blob | null, bins = 600) {
  const [data, setData] = useState<WaveformData | null>(null);
  useEffect(() => {
    setData(null);
    if (!src) return;
    const controller = new AbortController();
    decode(src, bins, controller.signal).then(
      (values) => !controller.signal.aborted && setData(values),
      () => !controller.signal.aborted && setData({ peaks: [], rms: [] }),
    );
    return () => {
      controller.abort();
    };
  }, [src, bins]);
  return src ? data : null;
}
