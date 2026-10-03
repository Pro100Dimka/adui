import { Grid, Illustration } from "@ad-voice/ui";

const height = { height: "clamp(9rem, 26dvh, 15rem)" };

export default function IllustrationExample() {
  return (
    <Grid minChildWidth="12rem" gap={4}>
      <Illustration variant="planet" label="Планета" style={height} />
      <Illustration variant="mountains" framed label="Горы" style={height} />
    </Grid>
  );
}
