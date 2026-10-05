import { tr } from "@ad-voice/ui";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CollapsibleSection,
  Divider,
  Icon,
  Link,
  ScrollArea,
  Stack,
  TextField,
  Typography,
} from "@ad-voice/ui";
import { catalog, componentHref, type CatalogMeta } from "./componentRegistry";
import { catalogCategories, getCategoryForItem } from "./catalogNavigation";

function ItemLink({
  item,
  active,
  className = "",
}: {
  item: CatalogMeta;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      className={`${className} ${active ? "active" : ""}`}
      href={componentHref(item.name)}
      underline="none"
    >
      <Typography variant="body-sm">{item.name}</Typography>
    </Link>
  );
}

function OverviewLink({ className }: { className: string }) {
  return (
    <Link
      className={className}
      href="#/components/overview"
      underline="none"
      icon="grid"
    >
      <Typography variant="label">{tr("Обзор")}</Typography>
      <Badge>{catalog.length}</Badge>
    </Link>
  );
}

export function CatalogSidebar({ activeItem }: { activeItem?: CatalogMeta }) {
  const activeCategory = activeItem && getCategoryForItem(activeItem);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(activeCategory?.id ?? "fields");

  useEffect(() => {
    if (activeCategory) setOpenId(activeCategory.id);
  }, [activeCategory]);

  // "/" focuses the search field, as on most documentation sites.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      event.preventDefault();
      document
        .querySelector<HTMLInputElement>(".docs-nav-search input")
        ?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const needle = query.trim().toLowerCase();
  const groups = catalogCategories
    .map((category) => ({
      category,
      items: category.items.filter((item) =>
        `${item.name} ${item.description} ${tr(item.description)}`.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.items.length);

  return (
    <Stack as="aside" className="docs-sidebar" gap={3}>
      <CollapsibleSection
        className="docs-mobile-nav"
        title={activeItem?.name ?? tr("Компоненты")}
        icon="list"
      >
        <Stack className="docs-mobile-nav-panel" gap={3}>
          <OverviewLink className="docs-mobile-overview" />
          {catalogCategories.map((category) => (
            <Stack key={category.id} gap={2}>
              <Stack direction="row" gap={2} align="center">
                <Icon name={category.icon} />
                <Typography variant="label" weight="bold">
                  {tr(category.label)}
                </Typography>
                <Badge>{category.items.length}</Badge>
              </Stack>
              <Stack gap={1}>
                {category.items.map((item) => (
                  <ItemLink
                    key={item.name}
                    item={item}
                    active={item === activeItem}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CollapsibleSection>

      <Card className="docs-sidebar-head" material="glass" padding="sm">
        <Stack gap={3}>
          <Typography variant="eyebrow" tone="muted">
            {tr("Документация компонентов")}
          </Typography>
          <Stack className="docs-nav-search">
            <TextField
              size="sm"
              value={query}
              onValueChange={setQuery}
              placeholder={tr("Найти компонент…")}
              startAdornment={<Icon name="search" />}
              endAdornment={
                <Typography variant="mono" tone="muted">
                  /
                </Typography>
              }
              clearable
            />
          </Stack>
          <OverviewLink
            className={`docs-overview-link ${activeItem ? "" : "active"}`}
          />
        </Stack>
      </Card>

      <ScrollArea
        className="docs-nav-scroll"
        height="none"
        label={tr("Навигация по компонентам")}
      >
        <Stack as="nav" className="docs-nav" gap={2} aria-label={tr("Компоненты")}>
          {groups.map(({ category, items }) => {
            const expanded = !!needle || openId === category.id;
            return (
              <Stack
                className="docs-nav-group"
                key={category.id}
                gap={1}
                data-current={category === activeCategory || undefined}
              >
                <Button
                  className="docs-nav-category"
                  size="sm"
                  variant="ghost"
                  icon={category.icon}
                  endIcon="chevron"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? "" : category.id)}
                >
                  <Typography as="span" variant="label" truncate>
                    {tr(category.label)}
                  </Typography>
                  <Badge>{items.length}</Badge>
                </Button>
                {expanded && (
                  <Stack className="docs-nav-items" gap={0}>
                    {items.map((item) => (
                      <ItemLink
                        key={item.name}
                        className="docs-nav-item"
                        item={item}
                        active={item === activeItem}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>
      </ScrollArea>

      <Divider />
      <Stack className="docs-sidebar-foot" gap={1}>
        <Typography variant="caption" tone="muted">
          React + TypeScript
        </Typography>
        <Typography variant="caption" tone="muted">
          {tr("Один компонент · одна страница")}
        </Typography>
      </Stack>
    </Stack>
  );
}
