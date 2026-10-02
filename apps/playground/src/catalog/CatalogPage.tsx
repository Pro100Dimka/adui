import React, { useEffect } from "react";
import { Stack, Typography } from "@ad-voice/ui";
import {
  catalog,
  componentSlug,
  getCatalogItemBySlug,
} from "./componentRegistry";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogOverview } from "./CatalogOverview";
import { ComponentDocsPage } from "./ComponentDocsPage";
import { getCategoryById } from "./catalogNavigation";

export function CatalogPage({ routeId }: { routeId?: string }) {
  const categoryRoute = getCategoryById(routeId);
  const item = getCatalogItemBySlug(routeId);

  useEffect(() => {
    if (!categoryRoute) return;
    const first = catalog.find(categoryRoute.matches);
    if (first) location.replace(`#/components/${componentSlug(first.name)}`);
  }, [categoryRoute?.id]);

  return (
    <>
      <CatalogSidebar routeId={routeId} />
      <Stack as="main" className="catalog-main docs-main" gap={4}>
        {!routeId || routeId === "overview" || (!item && !categoryRoute) ? (
          <CatalogOverview />
        ) : item ? (
          <ComponentDocsPage item={item} />
        ) : (
          <Typography
            className="docs-route-loading"
            variant="body-sm"
            tone="muted"
          >
            Открываю компонент…
          </Typography>
        )}
      </Stack>
    </>
  );
}
