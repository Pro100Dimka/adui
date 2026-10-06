import { useTr } from "@ad-voice/ui";
import { Component, type ReactNode } from "react";
import { Card, Stack, Typography } from "@ad-voice/ui";

function ExampleError({ name, error }: { name: string; error: Error }) {
  const tr = useTr();
  return (
    <Card className="docs-example-error" material="danger" padding="sm">
      <Stack gap={2}>
        <Typography variant="label" weight="bold">{tr("Пример {name} не отрисовался", { name })}</Typography>
        <Typography variant="mono">{error.message}</Typography>
      </Stack>
    </Card>
  );
}

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
    return <ExampleError name={this.props.name} error={this.state.error} />;
  }
}
