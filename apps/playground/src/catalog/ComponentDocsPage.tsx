import { useState } from "react";
import { DocsExampleBoundary } from "./DocsExampleBoundary";
import { HeroBackdrop } from "./HeroBackdrop";
import { ExampleCodeContext } from "../../../../packages/ui/src/dev/exampleHelpers";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Divider,
  Grid,
  Header,
  Icon,
  Link,
  Stack,
  Typography,
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

/** A code listing with its file name and a copy button that confirms itself. */
function CodeBlock({
  file,
  code,
  language = "tsx",
}: {
  file: string;
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
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
            {file}
          </Typography>
        </Stack>
        <Button
          size="xs"
          variant={copied ? "primary" : "secondary"}
          icon={copied ? "check" : "copy"}
          onClick={() => {
            void copyText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Скопировано" : "Копировать"}
        </Button>
      </Stack>
      <Divider />
      <div className="docs-code-body">
        <Typography as="pre" className="docs-code-pre" variant="mono">
          {code}
        </Typography>
      </div>
    </Card>
  );
}

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
  const [modal, setModal] = useState<"example" | "api" | "source">();
  const apiSource = getComponentApiSource(item.name);
  const componentSource = getComponentSource(item.name);
  const sourcePath = getComponentSourcePath(item.name);
  const importPath = getImportPath(item);
  const usage = liveCode
    ? withImports(liveCode, item.name, importPath)
    : exampleSource;
  const codeViews = {
    example: { title: "код примера", file: "Example.tsx", code: usage },
    api: {
      title: "API",
      file: `${item.name}Props`,
      code: apiSource,
      language: "ts",
    },
    source: {
      title: "исходник",
      file: sourcePath || `${item.name}.tsx`,
      code: componentSource || "// Исходник не найден",
    },
  };
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
    <Stack
      as="article"
      className="docs-component-shell docs-component-content"
      gap={4}
    >
      <Card
        className="docs-component-hero"
        id="overview"
        material="shell"
        border
        padding="md"
      >
        <HeroBackdrop index={catalog.indexOf(item)} />
        <Stack className="docs-hero-content" gap={4}>
          <Stack
            className="docs-hero-top"
            direction="row"
            justify="between"
            align="center"
            gap={3}
            wrap
          >
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
            <Stack
              className="docs-component-badges"
              direction="row"
              gap={2}
              wrap
            >
              <Badge tone="success">Stable</Badge>
              <Badge>React</Badge>
              <Badge>Neo UI</Badge>
            </Stack>
          </Stack>

          <Header
            as="div"
            level={1}
            title={item.name}
            description={item.description}
          />
        </Stack>
      </Card>

      <Card
        className="docs-section docs-section--example"
        id="example"
        material="card"
        padding="md"
      >
        <Stack gap={4}>
          <Header
            level={2}
            compact
            title="Пример"
            description={
              liveCode
                ? "Меняйте настройки — в «Коде» будет ровно то, что вы видите."
                : "Живой компонент из текущих исходников."
            }
            actions={
              <Stack direction="row" gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="braces"
                  onClick={() => setModal("example")}
                >
                  Код
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="list"
                  onClick={() => setModal("api")}
                >
                  API
                </Button>
              </Stack>
            }
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
        className="docs-section docs-section--related"
        id="related"
        material="card"
        padding="md"
      >
        <Stack gap={4}>
          <Header
            level={2}
            compact
            title={related.length ? "Связанные" : "Исходник"}
            actions={
              <Stack
                as="nav"
                className="docs-prev-next"
                direction="row"
                gap={2}
                align="center"
                wrap
                aria-label="Соседние компоненты и исходник"
              >
                {previous && (
                  <Link
                    className="docs-prev"
                    href={componentHref(previous.name)}
                    underline="none"
                    icon="chevron"
                    title="Предыдущий компонент"
                  >
                    {previous.name}
                  </Link>
                )}
                {next && (
                  <Link
                    className="docs-next"
                    href={componentHref(next.name)}
                    underline="none"
                    endIcon="chevron"
                    title="Следующий компонент"
                  >
                    {next.name}
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  icon="document"
                  onClick={() => setModal("source")}
                >
                  Исходник
                </Button>
              </Stack>
            }
          />
          {!!related.length && (
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
          )}
        </Stack>
      </Card>

      <Dialog
        className="docs-code-dialog"
        open={!!modal}
        onOpenChange={(open) => !open && setModal(undefined)}
        title={`${item.name} — ${modal ? codeViews[modal].title : ""}`}
        cancelLabel={false}
        confirmLabel="Готово"
      >
        {modal && <CodeBlock {...codeViews[modal]} />}
      </Dialog>
    </Stack>
  );
}
