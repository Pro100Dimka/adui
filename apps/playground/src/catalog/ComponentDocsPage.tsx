import React, { Component, useState } from "react";
import { ExampleCodeContext } from "../../../../packages/ui/src/dev/exampleHelpers";
import {
  Badge,
  Button,
  Card,
  CollapsibleSection,
  Divider,
  Grid,
  Header,
  Icon,
  Link,
  ScrollArea,
  Stack,
  Typography,
  WaveDecoration,
  copyText,
} from "@ad-voice/ui";
import {
  catalog,
  componentHref,
  getComponentApiSource,
  getComponentSource,
  getComponentSourcePath,
  getExample,
  getExampleSource,
  getImportPath,
  type CatalogMeta,
} from "./componentRegistry";
import { getCategoryForItem } from "./catalogNavigation";

class DocsExampleBoundary extends Component<
  { name: string; children: React.ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`[A&D UI] Docs example ${this.props.name} crashed`, error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Card className="docs-example-error" material="danger" padding="sm">
        <Stack gap={2}>
          <Typography variant="label" weight="bold">
            Пример {this.props.name} не отрисовался
          </Typography>
          <Typography variant="mono">{this.state.error.message}</Typography>
        </Stack>
      </Card>
    );
  }
}

function CodeBlock({
  title,
  code,
  language = "tsx",
}: {
  title: string;
  code: string;
  language?: string;
}) {
  return (
    <Card className="docs-code-block" material="glass" padding="none">
      <Stack
        className="docs-code-head"
        direction="row"
        justify="between"
        align="center"
        gap={3}
      >
        <Stack
          className="docs-code-title"
          direction="row"
          gap={2}
          align="center"
        >
          <Badge>{language.toUpperCase()}</Badge>
          <Typography variant="label" truncate>
            {title}
          </Typography>
        </Stack>
        <Button
          size="xs"
          variant="ghost"
          icon="copy"
          onClick={() => {
            void copyText(code);
          }}
        >
          Копировать
        </Button>
      </Stack>
      <Divider />
      <ScrollArea
        className="docs-code-scroll"
        height="clamp(10rem,32dvh,24rem)"
        label={title}
      >
        <Typography as="pre" className="docs-code-pre" variant="mono">
          {code}
        </Typography>
      </ScrollArea>
    </Card>
  );
}

const sections = [
  ["overview", "Обзор"],
  ["preview", "Live preview"],
  ["usage", "Использование"],
  ["api", "API"],
  ["source", "Исходник"],
  ["related", "Связанные"],
] as const;

const scrollToSection =
  (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

/** Adds the import line for every component tag used in a generated snippet. */
function withImports(code: string, name: string, path: string) {
  const tags = [
    ...new Set([...code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1])),
  ];
  const others = tags.filter((tag) => tag !== name);
  const lines =
    path === "@ad-voice/ui"
      ? [`import { ${[name, ...others].join(", ")} } from "@ad-voice/ui";`]
      : [
          `import { ${name} } from "${path}";`,
          ...(others.length
            ? [`import { ${others.join(", ")} } from "@ad-voice/ui";`]
            : []),
        ];
  return [...lines, "", code].join("\n");
}

export function ComponentDocsPage({ item }: { item: CatalogMeta }) {
  const category = getCategoryForItem(item);
  const LiveExample = getExample(item.name);
  const exampleSource = getExampleSource(item.name);
  const [liveCode, setLiveCode] = useState<string>();
  const apiSource = getComponentApiSource(item.name);
  const componentSource = getComponentSource(item.name);
  const sourcePath = getComponentSourcePath(item.name);
  const importPath = getImportPath(item);
  const importLine = `import { ${item.name} } from "${importPath}";`;
  const usage = liveCode
    ? withImports(liveCode, item.name, importPath)
    : exampleSource;
  const categoryItems = category?.items ?? catalog;
  const index = categoryItems.findIndex(
    (candidate) => candidate.name === item.name,
  );
  const previous = categoryItems[index - 1];
  const next = categoryItems[index + 1];
  const related = categoryItems
    .filter((candidate) => candidate.name !== item.name)
    .slice(0, 5);

  return (
    <Grid
      className="docs-component-shell"
      columns={{ base: 1, xl: "minmax(0,1fr) 12rem" }}
      gap={5}
      align="start"
    >
      <Stack as="article" className="docs-component-content" gap={5}>
        <Card
          className="docs-component-hero"
          id="overview"
          material="shell"
          border
          padding="lg"
        >
          <Stack gap={4}>
            <Stack
              className="docs-breadcrumbs"
              direction="row"
              gap={2}
              align="center"
              wrap
            >
              <Link href="#/components/overview" underline="none">
                <Typography variant="caption" tone="muted">
                  Компоненты
                </Typography>
              </Link>
              <Icon name="chevron" />
              <Typography variant="caption" tone="muted">
                {category?.label ?? "Компонент"}
              </Typography>
              <Icon name="chevron" />
              <Typography variant="caption" weight="bold">
                {item.name}
              </Typography>
            </Stack>

            <Grid
              className="docs-component-title-row"
              columns={{ base: 1, lg: "minmax(0,1fr) 14rem" }}
              gap={4}
              align="center"
            >
              <Stack gap={3}>
                <Stack
                  className="docs-component-badges"
                  direction="row"
                  gap={2}
                  wrap
                >
                  <Badge tone="success">Stable</Badge>
                  <Badge>React</Badge>
                  <Badge>A&D UI</Badge>
                </Stack>
                <Header
                  as="div"
                  level={1}
                  title={item.name}
                  description={item.description}
                />
              </Stack>
              <WaveDecoration />
            </Grid>

            <Card className="docs-import" material="glass" padding="sm">
              <Stack
                direction={{ base: "column", sm: "row" }}
                justify="between"
                align={{ base: "stretch", sm: "center" }}
                gap={3}
              >
                <Typography variant="mono" truncate>
                  {importLine}
                </Typography>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="copy"
                  onClick={() => {
                    void copyText(importLine);
                  }}
                >
                  Копировать import
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Card>

        <Grid
          className="docs-primary-grid"
          columns={{ base: 1, lg: "minmax(0,1.15fr) minmax(20rem,.85fr)" }}
          gap={4}
          align="start"
        >
          <Card
            className="docs-section docs-section--preview"
            id="preview"
            material="card"
            padding="md"
          >
            <Stack gap={4}>
              <Header
                level={2}
                compact
                eyebrow="01"
                title="Live preview"
                description="Настоящий компонент из текущих исходников."
                actions={<Badge tone="success">Live</Badge>}
              />
              <Card
                className={`docs-live-stage ${item.wide ? "docs-live-stage--wide" : ""}`}
                material="glass"
                padding={item.wide ? "sm" : "md"}
              >
                <DocsExampleBoundary name={item.name}>
                  {LiveExample ? (
                    <ExampleCodeContext.Provider value={setLiveCode}>
                      <LiveExample />
                    </ExampleCodeContext.Provider>
                  ) : (
                    <Typography variant="body-sm" tone="muted">
                      Для компонента пока нет example.tsx.
                    </Typography>
                  )}
                </DocsExampleBoundary>
              </Card>
            </Stack>
          </Card>

          <Card
            className="docs-section docs-section--usage"
            id="usage"
            material="card"
            padding="md"
          >
            <Stack gap={4}>
              <Header
                level={2}
                compact
                eyebrow="02"
                title="Использование"
                description={
                  liveCode
                    ? "Меняется вместе с настройками примера."
                    : "Готовый код — копируйте и используйте."
                }
              />
              <CodeBlock title="Example.tsx" code={usage} />
            </Stack>
          </Card>
        </Grid>

        <Card
          className="docs-section docs-section--api"
          id="api"
          material="card"
          padding="md"
        >
          <Stack gap={4}>
            <Header
              level={2}
              compact
              eyebrow="03"
              title="API"
              description="TypeScript props из текущей версии."
            />
            <CodeBlock
              title={`${item.name}Props`}
              code={apiSource}
              language="ts"
            />
          </Stack>
        </Card>

        <Grid
          className="docs-secondary-grid"
          columns={{ base: 1, lg: related.length ? 2 : 1 }}
          gap={4}
          align="start"
        >
          <Card
            className="docs-section docs-section--source"
            id="source"
            material="card"
            padding="md"
          >
            <Stack gap={4}>
              <Header
                level={2}
                compact
                eyebrow="04"
                title="Исходник"
                description={sourcePath || "Реализация компонента"}
              />
              <CollapsibleSection title="Показать реализацию" icon="braces">
                <CodeBlock
                  title={sourcePath || `${item.name}.tsx`}
                  code={componentSource || "// Исходник не найден"}
                />
              </CollapsibleSection>
            </Stack>
          </Card>

          {!!related.length && (
            <Card
              className="docs-section docs-section--related"
              id="related"
              material="card"
              padding="md"
            >
              <Stack gap={4}>
                <Header
                  level={2}
                  compact
                  eyebrow="05"
                  title="Связанные"
                  description="Компоненты из той же категории."
                />
                <Grid
                  className="docs-related-grid"
                  minChildWidth="min(100%,13rem)"
                  gap={2}
                >
                  {related.map((candidate) => (
                    <Link
                      key={candidate.name}
                      href={componentHref(candidate.name)}
                      underline="none"
                      endIcon="chevron"
                    >
                      <Stack gap={1}>
                        <Typography variant="label" weight="bold">
                          {candidate.name}
                        </Typography>
                        <Typography variant="caption" tone="muted">
                          {candidate.description}
                        </Typography>
                      </Stack>
                    </Link>
                  ))}
                </Grid>
              </Stack>
            </Card>
          )}
        </Grid>

        <Stack
          as="nav"
          className="docs-prev-next"
          direction={{ base: "column", sm: "row" }}
          justify="between"
          gap={3}
          aria-label="Следующий и предыдущий компонент"
        >
          {previous ? (
            <Link
              className="docs-prev"
              href={componentHref(previous.name)}
              underline="none"
              icon="chevron"
            >
              <Stack gap={0}>
                <Typography variant="caption" tone="muted">
                  Назад
                </Typography>
                <Typography variant="label" weight="bold">
                  {previous.name}
                </Typography>
              </Stack>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="docs-next"
              href={componentHref(next.name)}
              underline="none"
              endIcon="chevron"
            >
              <Stack gap={0} align="end">
                <Typography variant="caption" tone="muted">
                  Дальше
                </Typography>
                <Typography variant="label" weight="bold">
                  {next.name}
                </Typography>
              </Stack>
            </Link>
          ) : null}
        </Stack>
      </Stack>

      <Stack as="aside" className="docs-toc" gap={3}>
        <Card className="docs-toc-card" material="glass" padding="sm">
          <Stack gap={2}>
            <Typography variant="eyebrow" tone="muted">
              На этой странице
            </Typography>
            {sections
              .filter(([id]) => id !== "related" || related.length > 0)
              .map(([id, label]) => (
                <Link
                  key={id}
                  href={`#${id}`}
                  underline="none"
                  onClick={scrollToSection(id)}
                >
                  <Typography variant="body-sm">{label}</Typography>
                </Link>
              ))}
            <Divider />
            <Typography variant="caption" tone="muted">
              {category?.label}
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </Grid>
  );
}
