import React, { useEffect, useMemo, useState } from "react";
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
import {
  catalog,
  componentSlug,
  getCatalogItemBySlug,
} from "./componentRegistry";
import { catalogCategories, getCategoryForItem } from "./catalogNavigation";

export function CatalogSidebar({ routeId }: { routeId?: string }) {
  const activeItem = getCatalogItemBySlug(routeId);
  const activeCategory = activeItem
    ? getCategoryForItem(activeItem)
    : undefined;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activeCategory ? [activeCategory.id] : ["fields", "buttons"]),
  );

  useEffect(() => {
    if (!activeCategory) return;
    setOpen((current) =>
      current.has(activeCategory.id)
        ? current
        : new Set([...current, activeCategory.id]),
    );
  }, [activeCategory?.id]);

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
  const groups = useMemo(
    () =>
      catalogCategories
        .map((category) => ({
          category,
          items: catalog
            .filter(category.matches)
            .filter(
              (item) =>
                !needle ||
                `${item.name} ${item.description}`
                  .toLowerCase()
                  .includes(needle),
            ),
        }))
        .filter((group) => group.items.length),
    [needle],
  );

  const toggle = (id: string) =>
    setOpen((current) => (current.has(id) ? new Set() : new Set([id])));

  return (
    <Stack as="aside" className="sidebar docs-sidebar" gap={3}>
      <CollapsibleSection
        className="docs-mobile-nav"
        title={activeItem?.name ?? "Компоненты"}
        icon="menu"
      >
        <Stack className="docs-mobile-nav-panel" gap={3}>
          <Link
            className="docs-mobile-overview"
            href="#/components/overview"
            underline="none"
            icon="grid"
          >
            <Typography variant="label">Обзор</Typography>
            <Badge>{catalog.length}</Badge>
          </Link>
          {catalogCategories.map((category) => {
            const items = catalog.filter(category.matches);
            return (
              <Stack key={category.id} gap={2}>
                <Stack direction="row" gap={2} align="center">
                  <Icon name={category.icon} />
                  <Typography variant="label" weight="bold">
                    {category.label}
                  </Typography>
                  <Badge>{items.length}</Badge>
                </Stack>
                <Stack gap={1}>
                  {items.map((item) => (
                    <Link
                      key={item.name}
                      className={item.name === activeItem?.name ? "active" : ""}
                      href={`#/components/${componentSlug(item.name)}`}
                      underline="none"
                    >
                      <Typography variant="body-sm">{item.name}</Typography>
                    </Link>
                  ))}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CollapsibleSection>

      <Card className="docs-sidebar-head" material="glass" padding="sm">
        <Stack gap={3}>
          <Typography variant="eyebrow" tone="muted">
            Документация компонентов
          </Typography>
          <Stack className="docs-nav-search">
            <TextField
              size="sm"
              value={query}
              onValueChange={setQuery}
              placeholder="Найти компонент…"
              startAdornment={<Icon name="search" />}
              endAdornment={
                <Typography variant="mono" tone="muted">
                  /
                </Typography>
              }
              clearable
            />
          </Stack>
          <Link
            className={`docs-overview-link ${!routeId || routeId === "overview" ? "active" : ""}`}
            href="#/components/overview"
            underline="none"
            icon="grid"
          >
            <Typography variant="label">Обзор</Typography>
            <Badge>{catalog.length}</Badge>
          </Link>
        </Stack>
      </Card>

      <ScrollArea className="docs-nav-scroll" label="Навигация по компонентам">
        <Stack as="nav" className="docs-nav" gap={2} aria-label="Компоненты">
          {groups.map(({ category, items }) => {
            const expanded = needle ? true : open.has(category.id);
            const current = category.id === activeCategory?.id;
            return (
              <Stack
                className="docs-nav-group"
                key={category.id}
                gap={1}
                data-current={current || undefined}
              >
                <Button
                  className="docs-nav-category"
                  size="sm"
                  variant="ghost"
                  icon={category.icon}
                  endIcon="chevron"
                  aria-expanded={expanded}
                  onClick={() => toggle(category.id)}
                >
                  {category.label}
                  <Badge>{items.length}</Badge>
                </Button>
                {expanded && (
                  <Stack className="docs-nav-items" gap={0}>
                    {items.map((item) => (
                      <Link
                        key={item.name}
                        className={`docs-nav-item ${item.name === activeItem?.name ? "active" : ""}`}
                        href={`#/components/${componentSlug(item.name)}`}
                        underline="none"
                      >
                        <Typography variant="body-sm">{item.name}</Typography>
                      </Link>
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
          Один компонент · одна страница
        </Typography>
      </Stack>
    </Stack>
  );
}
