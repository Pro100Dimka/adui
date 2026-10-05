import { tr } from "@ad-voice/ui";
import { ExamplePreviewContext } from "../../../../packages/ui/src/dev/exampleHelpers";
import { Badge, Card, Header, Icon, Stack, Typography, usePauseOffscreen } from "@ad-voice/ui";
import { useLayoutEffect, useRef } from "react";
import { CopyButton } from "./CopyButton";
import {
  catalog,
  componentHref,
  getExample,
  installCommand,
  packageVersion,
  type CatalogMeta,
} from "./componentRegistry";
import { catalogCategories } from "./catalogNavigation";
import { DocsExampleBoundary } from "./DocsExampleBoundary";
import { HeroBackdrop } from "./HeroBackdrop";

/**
 * The storefront: every component is shown live, grouped by category, so a visitor sees
 * the whole kit on one page and opens whatever catches the eye.
 */
export function CatalogOverview() {
  return (
    <Stack as="section" className="docs-overview" gap={5}>
      <Card
        className="docs-overview-hero docs-component-hero"
        material="shell"
        border
        padding="md"
      >
        <HeroBackdrop index={0} />
        <Stack gap={3}>
          <Header
            level={1}
            eyebrow="Neo UI · React component system"
            title={tr("Компоненты, от которых не оторвать глаз")}
            description={tr("Здесь вся библиотека вживую. Наведите на понравившийся компонент и откройте его: там настройки, код и API.")}
          />
          <Stack direction="row" gap={2} wrap>
            <Badge tone="success">v{packageVersion}</Badge>
            <Badge>{catalog.length} {tr("компонентов")}</Badge>
            <Badge>{catalogCategories.length} {tr("категорий")}</Badge>
            <Badge>TypeScript</Badge>
          </Stack>
          <Card className="docs-install" material="glass" padding="sm">
            <Stack gap={2}>
              <Typography variant="eyebrow" tone="muted">
                {tr("Установка")}
              </Typography>
              {[installCommand, 'import "@ad-voice/ui/styles.css";'].map(
                (line) => (
                  <Stack key={line} direction="row" align="center" gap={3}>
                    <Typography
                      as="code"
                      variant="mono"
                      className="docs-install-line"
                    >
                      {line}
                    </Typography>
                    <CopyButton text={line} />
                  </Stack>
                ),
              )}
            </Stack>
          </Card>
        </Stack>
      </Card>

      {catalogCategories.map((category) => (
        <Stack
          as="section"
          className="docs-showcase"
          key={category.id}
          gap={3}
          aria-label={tr(category.label)}
        >
          <Header
            level={2}
            compact
            icon={category.icon}
            title={tr(category.label)}
            description={tr(category.description)}
            actions={<Badge>{category.items.length}</Badge>}
          />
          <div className="docs-showcase-grid">
            {category.items.map((item) => (
              <ShowcaseTile key={item.name} item={item} />
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  );
}

/** How many extra lines the wrapping rows inside the specimen have spilled onto. */
function wraps(root: HTMLElement) {
  let extra = 0;
  for (const node of root.querySelectorAll<HTMLElement>("*")) {
    const style = getComputedStyle(node);
    if (!style.display.includes("flex") || style.flexWrap === "nowrap")
      continue;
    const tops = new Set(
      [...node.children]
        .filter((child) => {
          const position = getComputedStyle(child).position;
          return position !== "absolute" && position !== "fixed";
        })
        .map((child) => (child as HTMLElement).offsetTop),
    );
    extra += tops.size - 1;
  }
  return extra;
}

/**
 * A live tile that takes as many grid columns as its specimen needs: it widens while the
 * preview overflows, while a row of variants wraps (or while widening still makes it
 * shorter) and stays narrow otherwise;
 * a specimen still too tall is scaled down to be seen whole.
 */
function ShowcaseTile({ item }: { item: CatalogMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const Example = getExample(item.name);
  // Specimens out of view hold their animations still.
  usePauseOffscreen(ref);

  useLayoutEffect(() => {
    const tile = ref.current;
    const grid = tile?.parentElement;
    const preview = tile?.firstElementChild as HTMLElement | null;
    if (!tile || !grid || !preview) return;
    const fit = () => {
      const specimen = preview.firstElementChild as HTMLElement | null;
      if (specimen) specimen.style.zoom = "";
      const columns =
        getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      let span = Math.min(columns, item.wide ? 2 : 1);
      tile.style.gridColumn = `span ${span}`;
      while (span < columns) {
        const wide = preview.scrollWidth > preview.clientWidth + 1;
        const tall = preview.scrollHeight > preview.clientHeight + 1;
        const lines = wraps(preview);
        if (!wide && !tall && !lines) break;
        const height = preview.scrollHeight;
        tile.style.gridColumn = `span ${span + 1}`;
        // Widening must help: fewer wrapped lines or a shorter specimen, else stay narrow.
        if (
          !wide &&
          wraps(preview) >= lines &&
          preview.scrollHeight >= height - 1
        ) {
          tile.style.gridColumn = `span ${span}`;
          break;
        }
        span += 1;
      }
      // Still taller than the tile: scale the specimen down, step by step since it
      // reflows as it shrinks, until it is seen whole.
      let zoom = 1;
      for (
        let step = 0;
        specimen &&
        step < 6 &&
        zoom > 0.4 &&
        preview.scrollHeight > preview.clientHeight + 1;
        step += 1
      ) {
        zoom *= Math.max(0.8, preview.clientHeight / preview.scrollHeight);
        specimen.style.zoom = String(zoom);
      }
    };
    // Refit when the grid resizes, when the specimen changes size (it may finish drawing
    // later) and when an off-screen tile is rendered for the first time. Size changes caused
    // by the fit itself land in the same frames and are ignored.
    let frame = 0;
    let settling = false;
    const schedule = () => {
      if (settling) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        settling = true;
        fit();
        frame = requestAnimationFrame(() =>
          requestAnimationFrame(() => (settling = false)),
        );
      });
    };
    fit();
    const observer = new ResizeObserver(schedule);
    observer.observe(grid);
    const stage =
      preview.querySelector(".example-stage") ?? preview.firstElementChild;
    if (stage) observer.observe(stage);
    tile.addEventListener("contentvisibilityautostatechange", schedule);
    return () => {
      observer.disconnect();
      tile.removeEventListener("contentvisibilityautostatechange", schedule);
      cancelAnimationFrame(frame);
    };
  }, [item.wide]);

  return (
    <div ref={ref} className="docs-showcase-tile">
      <div className="docs-showcase-preview" inert>
        <DocsExampleBoundary name={item.name}>
          <ExamplePreviewContext.Provider value>
            {Example && <Example />}
          </ExamplePreviewContext.Provider>
        </DocsExampleBoundary>
      </div>
      <div className="docs-showcase-foot">
        <Stack gap={0}>
          <a className="docs-showcase-link" href={componentHref(item.name)}>
            <Typography variant="label" weight="bold">
              {item.name}
            </Typography>
          </a>
          <Typography variant="caption" tone="muted" truncate>
            {tr(item.description)}
          </Typography>
        </Stack>
        <Icon name="chevron" />
      </div>
    </div>
  );
}
