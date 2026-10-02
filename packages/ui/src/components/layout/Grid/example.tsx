import { Card, Grid } from "@ad-voice/ui";

export default function GridExample() {
  return (
    <Grid columns={{ base: 1, md: 12 }} gap={3}>
      <Grid span={{ base: "full", md: 8 }}>
        <Card title="Основная область" description="8 из 12 колонок" />
      </Grid>
      <Grid span={{ base: "full", md: 4 }}>
        <Card title="Сбоку" description="4 из 12" />
      </Grid>
      <Grid span="full">
        <Grid minChildWidth="9rem" gap={3}>
          {["Вокал", "Минус", "Мелодия", "Эффекты"].map((title) => (
            <Card key={title} title={title} description="auto-fit" />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
