import { ExamplePreviewContext } from "../../../../packages/ui/src/dev/exampleHelpers";
import { Badge, Card, Header, Icon, Stack, Typography } from "@ad-voice/ui";
import { catalog, componentHref, getExample } from "./componentRegistry";
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
            title="Компоненты, от которых не оторвать глаз"
            description="Здесь вся библиотека вживую. Наведите на понравившийся компонент и откройте его: там настройки, код и API."
          />
          <Stack direction="row" gap={2} wrap>
            <Badge tone="success">{catalog.length} компонентов</Badge>
            <Badge>{catalogCategories.length} категорий</Badge>
            <Badge>TypeScript</Badge>
          </Stack>
        </Stack>
      </Card>

      {catalogCategories.map((category) => (
        <Stack
          as="section"
          className="docs-showcase"
          key={category.id}
          gap={3}
          aria-label={category.label}
        >
          <Header
            level={2}
            compact
            icon={category.icon}
            title={category.label}
            description={category.description}
            actions={<Badge>{category.items.length}</Badge>}
          />
          <div className="docs-showcase-grid">
            {category.items.map((item) => {
              const Example = getExample(item.name);
              return (
                <div
                  key={item.name}
                  className="docs-showcase-tile"
                  data-wide={item.wide || undefined}
                >
                  <div className="docs-showcase-preview" inert>
                    <DocsExampleBoundary name={item.name}>
                      <ExamplePreviewContext.Provider value>
                        {Example && <Example />}
                      </ExamplePreviewContext.Provider>
                    </DocsExampleBoundary>
                  </div>
                  <div className="docs-showcase-foot">
                    <Stack gap={0}>
                      <a
                        className="docs-showcase-link"
                        href={componentHref(item.name)}
                      >
                        <Typography variant="label" weight="bold">
                          {item.name}
                        </Typography>
                      </a>
                      <Typography variant="caption" tone="muted" truncate>
                        {item.description}
                      </Typography>
                    </Stack>
                    <Icon name="chevron" />
                  </div>
                </div>
              );
            })}
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
