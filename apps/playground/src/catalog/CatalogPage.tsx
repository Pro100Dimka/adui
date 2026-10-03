import { useEffect, useRef } from "react";
import { Grid, Stack } from "@ad-voice/ui";
import { useSmoothWheel } from "@ad-voice/ui/core";
import { getCatalogItemBySlug } from "./componentRegistry";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogOverview } from "./CatalogOverview";
import { ComponentDocsPage } from "./ComponentDocsPage";

export function CatalogPage({ routeId }: { routeId?: string }) {
  const item = getCatalogItemBySlug(routeId);
  const main = useRef<HTMLElement>(null);
  useSmoothWheel(main);

  useEffect(() => {
    document.title = item ? `${item.name} · Neo UI` : "Neo UI · React";
    main.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [item]);

  return (
    <Grid
      className="docs-layout"
      columns={{ base: 1, md: "minmax(15rem, 18rem) minmax(0, 1fr)" }}
    >
      <CatalogSidebar activeItem={item} />
      <Stack as="main" className="docs-main" gap={4} ref={main}>
        {item ? (
          <ComponentDocsPage key={item.name} item={item} />
        ) : (
          <CatalogOverview />
        )}
      </Stack>
    </Grid>
  );
}
