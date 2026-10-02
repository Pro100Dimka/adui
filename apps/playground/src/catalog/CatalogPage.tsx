import { useEffect } from "react";
import { Grid, Stack } from "@ad-voice/ui";
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
    <Grid
      className="docs-layout"
      columns={{ base: 1, md: "minmax(15rem, 18rem) minmax(0, 1fr)" }}
    >
      <CatalogSidebar activeItem={item} />
      <Stack as="main" className="docs-main" gap={4}>
        {item ? <ComponentDocsPage item={item} /> : <CatalogOverview />}
      </Stack>
    </Grid>
  );
}
