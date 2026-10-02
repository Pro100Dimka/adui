import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Header,
  IconButton,
  ScrollArea,
  Select,
  Stack,
  Toast,
  ToggleButton,
  Toolbar,
  Typography,
} from "@ad-voice/ui";
import { ScreenHost } from "../screens/ScreenHost";
import { routes, type ScreenHandle, type ScreenId } from "../screens/types";
import { screenRegistry } from "../screens/registry";

export function ScreensPage({
  routeId,
  motion,
}: {
  routeId: string;
  motion: boolean;
}) {
  const route = routes.find((x) => x.id === routeId) ?? routes[4];
  const [mounted, setMounted] = useState<ScreenId[]>([route.screen]);
  const [generation, setGeneration] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState<"fit" | "actual">("fit"),
    [inspect, setInspect] = useState(false),
    [selected, setSelected] = useState<{
      name: string;
      info: Record<string, unknown>;
    } | null>(null);
  const [notice, setNotice] = useState(""),
    [count, setCount] = useState(0);
  const contexts = useRef(new Map<ScreenId, ScreenHandle>());
  const currentRef = useRef(route);
  currentRef.current = route;
  const definition = screenRegistry[route.screen].definition;

  useEffect(() => {
    setMounted((old) =>
      old.includes(route.screen) ? old : [...old, route.screen],
    );
  }, [route.screen]);
  useEffect(() => {
    const ctx = contexts.current.get(route.screen);
    setCount(ctx?.root.querySelectorAll("[data-ad-component]").length ?? 0);
  }, [route]);
  const onInspect = useCallback(
    (name: string, info: Record<string, unknown>) =>
      setSelected({ name, info }),
    [],
  );
  const navigate = (id: string) => {
    location.hash = `#/screens/${id}`;
  };

  useEffect(() => {
    const debug = {
      go: navigate,
      routes,
      cache: contexts.current,
      get context() {
        return contexts.current.get(currentRef.current.screen);
      },
      get current() {
        return currentRef.current;
      },
      setMotion(value: boolean) {
        contexts.current.forEach((ctx) => ctx.setMotion(value));
      },
      reset() {
        setGeneration((old) => ({
          ...old,
          [currentRef.current.screen]:
            (old[currentRef.current.screen] ?? 0) + 1,
        }));
      },
    };
    (window as unknown as { ADReactScreens?: typeof debug }).ADReactScreens =
      debug;
    return () => {
      delete (window as unknown as { ADReactScreens?: typeof debug })
        .ADReactScreens;
    };
  }, []);

  return (
    <>
      <Stack as="aside" className="sidebar screens-sidebar" gap={3}>
        <ScrollArea className="screens-nav-scroll" label="Навигация по экранам">
          <Stack gap={4}>
            {[true, false].map((isSettings) => (
              <Stack
                className="sidebar-section"
                gap={2}
                key={String(isSettings)}
              >
                <Typography variant="eyebrow" tone="muted">
                  {isSettings ? "Настройки" : "Экраны приложения"}
                </Typography>
                <Stack gap={1}>
                  {routes
                    .filter((x) => (x.screen === "settings") === isSettings)
                    .map((item) => (
                      <Button
                        className={`sidebar-link ${item.id === route.id ? "active" : ""}`}
                        size="sm"
                        variant={item.id === route.id ? "primary" : "ghost"}
                        key={item.id}
                        onClick={() => navigate(item.id)}
                      >
                        {item.title}
                        <Badge>{isSettings ? "Tab" : "UI"}</Badge>
                      </Button>
                    ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </ScrollArea>
        <Divider />
        <Stack className="sidebar-foot" gap={1}>
          <Typography variant="caption" tone="muted">
            React-деревья + согласованные стили.
          </Typography>
          <Typography variant="caption" tone="muted">
            Контроллеры сцен изолированы.
          </Typography>
          <Typography variant="caption" tone="muted">
            Без iframe и HTML-подложек.
          </Typography>
        </Stack>
      </Stack>

      <Stack as="main" className="screen-main" gap={3}>
        <Toolbar className="screen-toolbar">
          <Stack
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="between"
            gap={3}
          >
            <Header
              as="div"
              level={2}
              compact
              title={route.title}
              description={`${definition.source} · React`}
            />
            <Stack direction="row" align="center" gap={2} wrap>
              <Select
                label="Масштаб предпросмотра"
                options={[
                  { value: "fit", label: "Вписать" },
                  { value: "actual", label: "100%" },
                ]}
                value={zoom}
                onValueChange={(v) => setZoom(v as "fit" | "actual")}
              />
              <ToggleButton
                variant="secondary"
                icon="cursor"
                checked={inspect}
                onValueChange={setInspect}
              >
                Компоненты
              </ToggleButton>
              <IconButton
                icon="refresh"
                label="Сбросить пример"
                onClick={() =>
                  setGeneration((old) => ({
                    ...old,
                    [route.screen]: (old[route.screen] ?? 0) + 1,
                  }))
                }
              />
            </Stack>
          </Stack>
        </Toolbar>

        <Card className="screen-stage" material="shell" padding="none">
          <Stack
            className="screen-frame"
            align="center"
            justify="center"
            style={
              zoom === "actual"
                ? { width: definition.width, height: definition.height }
                : undefined
            }
          >
            {mounted.map((id) => (
              <ScreenHost
                key={`${id}-${generation[id] ?? 0}`}
                screen={id}
                active={id === route.screen}
                motion={motion}
                zoom={zoom}
                tab={id === "settings" ? route.tab : undefined}
                inspect={inspect}
                onInspect={onInspect}
                onNotice={setNotice}
                onTabChange={(tab) => {
                  if (
                    currentRef.current.screen === "settings" &&
                    currentRef.current.tab !== tab &&
                    routes.some((x) => x.id === tab)
                  )
                    navigate(tab);
                }}
                onReady={(ctx) => {
                  if (ctx) contexts.current.set(id, ctx);
                  else contexts.current.delete(id);
                  if (id === currentRef.current.screen)
                    setCount(
                      ctx?.root.querySelectorAll("[data-ad-component]")
                        .length ?? 0,
                    );
                }}
              />
            ))}
          </Stack>
        </Card>

        <Stack as="footer" className="screen-foot" direction="row" gap={2} wrap>
          <Badge>
            {definition.width} × {definition.height}
          </Badge>
          <Badge>{count} компонентов</Badge>
          <Typography variant="caption" tone="muted">
            Сервисы приложения не подключены · демонстрационные данные
          </Typography>
        </Stack>
      </Stack>

      {inspect && (
        <Card className="inspect-panel" material="glass" border padding="md">
          <Stack gap={3}>
            <Header
              level={3}
              compact
              eyebrow="Инспектор компонентов"
              title={selected?.name ?? "Наведите на элемент"}
            />
            <Typography variant="mono">
              {selected
                ? `<${selected.name} ${Object.entries(selected.info)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                    .join(" ")} />`
                : "Имя React-компонента и общие параметры"}
            </Typography>
            <Typography variant="body-sm" tone="muted">
              Размеры сцены сохранены. Управление сложной сценой выполняет её
              изолированный контроллер.
            </Typography>
          </Stack>
        </Card>
      )}

      <Toast
        floating
        open={!!notice}
        message={notice}
        onClose={() => setNotice("")}
      />
    </>
  );
}
