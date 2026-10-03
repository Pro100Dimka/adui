import { Landscape, NeonWaves, Planet, Spectrum } from "@ad-voice/ui";

/** Living scenes for page heroes; neighbouring pages get different ones. */
const scenes = [
  () => <NeonWaves phase={0.9} />,
  () => <Landscape shade={false} />,
  () => <Spectrum variant="segmented" />,
  () => <Planet />,
  () => <NeonWaves phase={3.1} strands={34} />,
  () => <Spectrum variant="bars" />,
];

/** Fills its hero behind the content, fading out under the title on the left. */
export function HeroBackdrop({ index }: { index: number }) {
  const Scene = scenes[index % scenes.length];
  return (
    <div className="docs-hero-backdrop" aria-hidden="true">
      <Scene />
    </div>
  );
}
