import { AudioPlayer } from "@neo-ui-kit/react";

/** Pass `src` to play a file; without it the player shows its timeline only. */
export default function AudioPlayerExample() {
  return <AudioPlayer duration={51} defaultVolume={0.7} />;
}
