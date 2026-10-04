const n=`import { useEffect, useState } from "react";\r
\r
/** Per slice of the track: the loudest sample (peak) and the average loudness (RMS), 0..1. */\r
export interface WaveformData {\r
  peaks: number[];\r
  rms: number[];\r
}\r
\r
/** Splits the track (all channels) into \`bins\` equal slices and measures each one. */\r
async function decode(src: string | Blob, bins: number): Promise<WaveformData> {\r
  const data =\r
    typeof src === "string"\r
      ? await (await fetch(src)).arrayBuffer()\r
      : await src.arrayBuffer();\r
  const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(\r
    data,\r
  );\r
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>\r
    audio.getChannelData(i),\r
  );\r
  const size = Math.max(1, Math.floor(audio.length / bins));\r
  const peaks: number[] = [];\r
  const rms: number[] = [];\r
  for (let bin = 0; bin < bins; bin += 1) {\r
    let peak = 0;\r
    let sum = 0;\r
    for (const channel of channels)\r
      for (let i = bin * size, end = i + size; i < end; i += 1) {\r
        const sample = Math.abs(channel[i] ?? 0);\r
        peak = Math.max(peak, sample);\r
        sum += sample * sample;\r
      }\r
    peaks.push(peak);\r
    rms.push(Math.sqrt(sum / (size * channels.length)));\r
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
 * without a source.\r
 */\r
export function useWaveformPeaks(src?: string | Blob | null, bins = 600) {\r
  const [data, setData] = useState<WaveformData | null>(null);\r
  useEffect(() => {\r
    setData(null);\r
    if (!src) return;\r
    let alive = true;\r
    decode(src, bins).then(\r
      (values) => alive && setData(values),\r
      () => alive && setData({ peaks: [], rms: [] }),\r
    );\r
    return () => {\r
      alive = false;\r
    };\r
  }, [src, bins]);\r
  return src ? data : null;\r
}\r
`;export{n as default};
