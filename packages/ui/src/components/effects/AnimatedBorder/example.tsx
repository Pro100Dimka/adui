import { AnimatedBorder, Card, Typography } from "@ad-voice/ui";

/** Wraps any block in the animated neon outline; Card has the same effect as `border`. */
export default function AnimatedBorderExample() {
  return (
    <AnimatedBorder style={{ borderRadius: "var(--ad-radius)" }}>
      <Card material="glass" title="Выступление в эфире">
        <Typography variant="body-sm" tone="muted">
          Обводка привлекает внимание к активному блоку.
        </Typography>
      </Card>
    </AnimatedBorder>
  );
}
