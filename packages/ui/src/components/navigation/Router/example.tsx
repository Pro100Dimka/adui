import { Typography } from "@ad-voice/ui";
import { matchRoute, type RouteDefinition } from "@ad-voice/ui/router";

const routes: RouteDefinition[] = [
  { path: "/rooms/:id", element: (m) => `Комната ${m.params.id}` },
  { path: "/settings", element: "Настройки" },
  { path: "*", redirectTo: "/settings" },
];

/** <Router routes={routes} /> renders the match for the current hash; matchRoute is the same matcher. */
export default function RouterExample() {
  const match = matchRoute(routes, "/rooms/42");
  return (
    <Typography variant="mono">
      /rooms/42 → {match?.route.path} · id = {match?.params.id}
    </Typography>
  );
}
