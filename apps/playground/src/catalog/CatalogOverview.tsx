import React from "react";
import {
  Badge,
  Card,
  Grid,
  Header,
  Icon,
  Link,
  Stack,
  Typography,
  WaveDecoration,
} from "@ad-voice/ui";
import { catalog, componentSlug } from "./componentRegistry";
import { catalogCategories } from "./catalogNavigation";

export function CatalogOverview() {
  return (
    <Stack as="section" className="docs-overview" gap={5}>
      <Card className="docs-overview-hero" material="shell" border padding="lg">
        <Grid
          columns={{ base: 1, lg: "minmax(0,1fr) minmax(15rem,32%)" }}
          gap={5}
          align="center"
        >
          <Stack gap={4}>
            <Header
              level={1}
              eyebrow="A&D UI · Component documentation"
              title="Компоненты, которые хочется использовать"
              description="Каждый компонент имеет собственную страницу: живой preview, реальный TSX, API и связанные элементы. Навигация раскрывается по категориям и не превращает документацию в длинный каталог."
            />
            <Stack className="docs-overview-stats" direction="row" gap={2} wrap>
              <Badge tone="success">{catalog.length} компонентов</Badge>
              <Badge>Live preview</Badge>
              <Badge>TypeScript API</Badge>
            </Stack>
          </Stack>
          <WaveDecoration />
        </Grid>
      </Card>

      <Grid
        className="docs-category-list"
        minChildWidth="min(100%,22rem)"
        gap={4}
      >
        {catalogCategories.map((category) => {
          const items = catalog.filter(category.matches);
          const first = items[0];
          return (
            <Card
              className="docs-category-panel"
              key={category.id}
              padding="md"
              material="card"
            >
              <Stack gap={4}>
                <Header
                  level={2}
                  compact
                  icon={category.icon}
                  title={category.label}
                  description={category.description}
                  actions={<Badge>{items.length}</Badge>}
                />
                <Stack
                  className="docs-category-components"
                  direction="row"
                  gap={2}
                  wrap
                >
                  {items.map((item) => (
                    <Link
                      key={item.name}
                      href={`#/components/${componentSlug(item.name)}`}
                      underline="none"
                    >
                      <Typography variant="label">{item.name}</Typography>
                    </Link>
                  ))}
                </Stack>
                {first && (
                  <Link
                    className="docs-category-enter"
                    href={`#/components/${componentSlug(first.name)}`}
                    underline="none"
                    endIcon="chevron"
                  >
                    <Typography variant="label">
                      Открыть документацию
                    </Typography>
                  </Link>
                )}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
}
