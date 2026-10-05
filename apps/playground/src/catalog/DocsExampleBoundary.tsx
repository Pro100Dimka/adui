import { tr } from "@ad-voice/ui";
import { Component, type ReactNode } from "react";
import { Card, Stack, Typography } from "@ad-voice/ui";

/** Keeps one broken example from taking the whole docs page down with it. */
export class DocsExampleBoundary extends Component<
  { name: string; children: ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`[Neo UI] Docs example ${this.props.name} crashed`, error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Card className="docs-example-error" material="danger" padding="sm">
        <Stack gap={2}>
          <Typography variant="label" weight="bold">
            {tr("Пример {name} не отрисовался", { name: this.props.name })}
          </Typography>
          <Typography variant="mono">{this.state.error.message}</Typography>
        </Stack>
      </Card>
    );
  }
}
