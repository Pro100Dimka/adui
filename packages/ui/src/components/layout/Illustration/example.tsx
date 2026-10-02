import { Grid, Illustration } from "@ad-voice/ui";

export default function IllustrationExample() {
  return (
    <Grid minChildWidth="12rem" gap={4}>
      <Illustration variant="planet" label="Планета" />
      <Illustration variant="mountains" framed label="Горы" />
    </Grid>
  );
}
