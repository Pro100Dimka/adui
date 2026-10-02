import { Card, Stack, Typography } from "../../../index";
import { Router, matchRoute, type RouteDefinition } from "./Router";
const routes: RouteDefinition[] = [
  { path: "/users/:id" },
  { path: "/settings" },
  { path: "*" },
];
export default function RouterExample() {
  const match = matchRoute(routes, "/users/42");
  return (
    <Stack gap={3}>
      <Card material="glass">
        <Stack gap={2}>
          <Typography variant="label">Typed match</Typography>
          <Typography variant="mono">
            /users/:id → params.id = {match?.params.id}
          </Typography>
        </Stack>
      </Card>
      <Router
        routes={[]}
        fallback={
          <Typography variant="caption" tone="muted">
            Router fallback
          </Typography>
        }
      />
    </Stack>
  );
}
