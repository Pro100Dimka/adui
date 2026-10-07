const n=`import { useEffect, useState } from "react";\r
\r
/** Per slice of the track: the loudest sample (peak) and the average loudness (RMS), 0..1. */\r
export interface WaveformData {\r
  peaks: number[];\r
  rms: number[];\r
}\r
\r
/** Splits the track (all channels) into \`bins\` equal slices and measures each one. */\r
async function decode(src: string | Blob, bins: number, signal: AbortSignal): Promise<WaveformData> {
  const data =\r
    typeof src === "string"\r
      ? await (await fetch(src, { signal })).arrayBuffer()
      : await src.arrayBuffer();
  signal.throwIfAborted();
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(
    data,
  );
  signal.throwIfAborted();
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>\r
    audio.getChannelData(i),\r
  );\r
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
  }\r
  const loudest = Math.max(...peaks, 0.0001);\r
  return {\r
    peaks: peaks.map((v) => v / loudest),\r
    rms: rms.map((v) => v / loudest),\r
  };\r
}\r
\r
/**\r
 * Peaks and average loudness of an audio file for a waveform, decoded in the browser.\r
 * \`null\` while loading, empty arrays when the file cannot be read; nothing is fetched\r
 * without a source. Superseded work is aborted, and measuring samples yields to input.
 */\r
export function useWaveformPeaks(src?: string | Blob | null, bins = 600) {\r
  const [data, setData] = useState<WaveformData | null>(null);\r
  useEffect(() => {\r
    setData(null);\r
    if (!src) return;\r
    const controller = new AbortController();
    decode(src, bins, controller.signal).then(
      (values) => !controller.signal.aborted && setData(values),
      () => !controller.signal.aborted && setData({ peaks: [], rms: [] }),
    );\r
    return () => {\r
      controller.abort();
    };\r
  }, [src, bins]);\r
  return src ? data : null;\r
}\r
`;export{n as default};
