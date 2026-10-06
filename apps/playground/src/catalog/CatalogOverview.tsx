import { tr } from "@ad-voice/ui";
import { ExamplePreviewContext } from "../../../../packages/ui/src/dev/exampleHelpers";
import { Badge, Card, Header, Icon, Stack, Typography, usePauseOffscreen } from "@ad-voice/ui";
import { useRef } from "react";
import { CopyButton } from "./CopyButton";
import {
  catalog,
  componentCount,
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
            <Badge>{componentCount} {tr("компонентов")}</Badge>
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

/** A fixed-size preview: artwork may animate, but the catalog grid never reflows around it. */
function ShowcaseTile({ item }: { item: CatalogMeta }) {
  const ref = useRef<HTMLDivElement>(null);
  const Example = getExample(item.name);
  usePauseOffscreen(ref);

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
