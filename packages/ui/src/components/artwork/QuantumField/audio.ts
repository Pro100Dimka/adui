/** Optional transport for a QuantumField. Nothing records, plays, or requests permission until called. */
export function createQuantumFieldAudio() {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  let source: AudioNode | null = null;
  let media: HTMLAudioElement | null = null;
  let url: string | null = null;
  let ownedStream: MediaStream | null = null;
  let disposed = false;

  const disconnect = () => {
    media?.pause();
    source?.disconnect();
    analyser.disconnect();
    ownedStream?.getTracks().forEach((track) => track.stop());
    if (url) URL.revokeObjectURL(url);
    media = null;
    source = null;
    url = null;
    ownedStream = null;
  };
  const assertOpen = () => {
    if (disposed) throw new Error("QuantumField audio controller is disposed");
  };
  const connectStream = (stream: MediaStream) => {
    assertOpen();
    disconnect();
    source = context.createMediaStreamSource(stream);
    source.connect(analyser);
  };

  return {
    analyser,
    get media() { return media; },
    /** Replaces the current source; playback starts only when play() is called. */
    loadFile(file: Blob) {
      assertOpen();
      disconnect();
      url = URL.createObjectURL(file);
      media = new Audio(url);
      source = context.createMediaElementSource(media);
      source.connect(analyser);
      analyser.connect(context.destination);
      return media;
    },
    /** Connects an app-owned stream. The app remains responsible for its tracks. */
    connectStream,
    /** Explicit user-gesture operation; only streams created here are stopped by the controller. */
    async requestMicrophone() {
      assertOpen();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      try {
        connectStream(stream);
        ownedStream = stream;
        await context.resume();
        return stream;
      } catch (error) {
        stream.getTracks().forEach((track) => track.stop());
        throw error;
      }
    },
    async play() {
      assertOpen();
      await context.resume();
      await media?.play();
    },
    pause() { media?.pause(); },
    seek(seconds: number) {
      if (media) media.currentTime = Math.max(0, seconds);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      disconnect();
      await context.close();
    },
  };
}
