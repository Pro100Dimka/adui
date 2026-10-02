import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, CodeViewer, IconButton, Select, Toast } from "@ad-voice/ui";
import { ScreenHost } from "../screens/ScreenHost";
import {
  routes,
  type Route,
  type ScreenHandle,
  type ScreenId,
} from "../screens/types";
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
      <aside className="sidebar">
        {[true, false].map((isSettings) => (
          <div className="sidebar-section" key={String(isSettings)}>
            <div className="sidebar-label">
              {isSettings ? "Настройки" : "Экраны приложения"}
            </div>
            {routes
              .filter((x) => (x.screen === "settings") === isSettings)
              .map((item) => (
                <button
                  className={`sidebar-link ${item.id === route.id ? "active" : ""}`}
                  key={item.id}
                  data-route={item.id}
                  onClick={() => navigate(item.id)}
                >
                  {item.title}
                  <small>{isSettings ? "TAB" : "UI"}</small>
                </button>
              ))}
          </div>
        ))}
        <div className="side-rule" />
        <div className="sidebar-foot">
          React-деревья + согласованные стили.
          <br />
          Контроллеры сцен изолированы.
          <br />
          Без iframe и HTML-подложек.
        </div>
      </aside>
      <main className="screen-main">
        <div className="screen-toolbar">
          <div className="screen-heading">
            <strong>{route.title}</strong>
            <small>{definition.source} · React</small>
          </div>
          <Select
            label="Масштаб предпросмотра"
            options={[
              { value: "fit", label: "Вписать" },
              { value: "actual", label: "100%" },
            ]}
            value={zoom}
            onValueChange={(v) => setZoom(v as "fit" | "actual")}
          />
          <Button
            variant="ghost"
            icon="cursor"
            aria-pressed={inspect}
            onClick={() => setInspect((v) => !v)}
          >
            Компоненты
          </Button>
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
        </div>
        <div className="screen-stage">
          <div
            className="screen-frame"
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
          </div>
        </div>
        <footer className="screen-foot">
          <span>
            {definition.width} × {definition.height} · исходная геометрия
          </span>
          <span>{count} экземпляров компонентов</span>
          <span>
            Сервисы приложения не подключены · демонстрационные данные
          </span>
        </footer>
      </main>
      {inspect && (
        <aside className="inspect-panel">
          <p className="eyebrow">ИНСПЕКТОР КОМПОНЕНТОВ</p>
          <strong>{selected?.name ?? "Наведите на элемент"}</strong>
          <code>
            {selected
              ? `<${selected.name} ${Object.entries(selected.info)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                  .join(" ")} />`
              : "Имя React-компонента и общие параметры"}
          </code>
          <p>
            Размеры сцены сохранены. Управление сложной сценой выполняет её
            изолированный контроллер.
          </p>
        </aside>
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
