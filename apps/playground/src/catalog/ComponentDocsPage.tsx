import { tr } from "@ad-voice/ui";
import { useEffect, useState } from "react";
import { CopyButton } from "./CopyButton";
import { DocsExampleBoundary } from "./DocsExampleBoundary";
import { LiveEditor } from "./LiveEditor";
import { toModule } from "./liveCode";
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
} from "@ad-voice/ui";
import {
  catalog,
  componentHref,
  getDocumentationParts,
  getExample,
  getImportPath,
  loadSources,
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
        <CopyButton text={code} />
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
  const [liveCode, setLiveCode] = useState<string>();
  const [modal, setModal] = useState<"example" | "api" | "source">();
  const [sources, setSources] =
    useState<Awaited<ReturnType<typeof loadSources>>>();
  useEffect(() => {
    let alive = true;
    void loadSources().then((module) => alive && setSources(module));
    return () => {
      alive = false;
    };
  }, []);
  const loading = "// Загрузка…";
  const sourcePath = sources?.getComponentSourcePath(item.name);
  const parts = getDocumentationParts(item.name);
  const codeViews = {
    example: {
      title: tr("песочница"),
      file: "Example.tsx",
      code: liveCode
        ? toModule(withImports(liveCode, item.name, getImportPath(item)), sources?.getExampleSource(item.name))
        : (sources?.getExampleSource(item.name) ?? loading),
    },
    api: {
      title: "API",
      file: `${item.name}Props`,
      code: sources
        ? [item, ...parts].map((component) => `// ${component.name}\n${sources.getComponentApiSource(component.name)}`).join("\n\n")
        : loading,
      language: "ts",
    },
    source: {
      title: tr("исходник"),
      file: sourcePath || `${item.name}.tsx`,
      code: sources
        ? sources.getComponentSource(item.name) || "// Исходник не найден"
        : loading,
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
                  {tr("Компоненты")}
                </Typography>
              </Link>
              <Icon name="chevron" />
              <Typography variant="caption" tone="muted">
                {category ? tr(category.label) : tr("Компонент")}
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
            description={tr(item.description)}
          />
          {!!parts.length && (
            <Stack direction="row" gap={2} align="center" wrap>
              <Typography variant="caption" tone="muted">{tr("Вместе с")}</Typography>
              {parts.map((part) => <Badge key={part.name}>{part.name}</Badge>)}
            </Stack>
          )}
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
            title={tr("Пример")}
            description={
              liveCode
                ? tr("Меняйте настройки, а в «Коде» правьте пример и сразу смотрите результат.")
                : tr("Живой компонент из текущих исходников.")
            }
            actions={
              <Stack direction="row" gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="braces"
                  onClick={() => setModal("example")}
                >
                  {tr("Код")}
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
                  {tr("Для компонента пока нет example.tsx.")}
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
            title={related.length ? tr("Связанные") : tr("Исходник")}
            actions={
              <Stack
                as="nav"
                className="docs-prev-next"
                direction="row"
                gap={2}
                align="center"
                wrap
                aria-label={tr("Соседние компоненты и исходник")}
              >
                {previous && (
                  <Link
                    className="docs-prev"
                    href={componentHref(previous.name)}
                    underline="none"
                    icon="chevron"
                    title={tr("Предыдущий компонент")}
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
                    title={tr("Следующий компонент")}
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
                  {tr("Исходник")}
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
                      {tr(candidate.description)}
                    </Typography>
                  </Stack>
                </Link>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>

      <Dialog
        className={`docs-code-dialog ${modal === "example" ? "docs-code-dialog--live" : ""}`}
        open={!!modal}
        onOpenChange={(open) => !open && setModal(undefined)}
        title={`${item.name} — ${modal ? codeViews[modal].title : ""}`}
        cancelLabel={false}
        confirmLabel={tr("Готово")}
      >
        {modal === "example" ? (
          <LiveEditor name={item.name} original={codeViews.example.code} />
        ) : (
          modal && <CodeBlock {...codeViews[modal]} />
        )}
      </Dialog>
    </Stack>
  );
}
