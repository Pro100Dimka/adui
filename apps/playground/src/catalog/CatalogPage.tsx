import { useEffect } from "react";
import { Stack } from "@ad-voice/ui";
import { getCatalogItemBySlug } from "./componentRegistry";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogOverview } from "./CatalogOverview";
import { ComponentDocsPage } from "./ComponentDocsPage";

export function CatalogPage({ routeId }: { routeId?: string }) {
  const item = getCatalogItemBySlug(routeId);

  useEffect(() => {
    document.title = item ? `${item.name} · A&D UI` : "A&D UI · React";
  }, [item]);

  return (
    <>
      <CatalogSidebar activeItem={item} />
      <Stack as="main" className="catalog-main docs-main" gap={4}>
        {item ? <ComponentDocsPage item={item} /> : <CatalogOverview />}
      </Stack>
    </>
  );
}
