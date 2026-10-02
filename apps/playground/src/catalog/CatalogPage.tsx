import React, { useMemo, useState } from "react";
import { Icon, TextField, WaveDecoration } from "@ad-voice/ui";
import { catalog } from "./componentRegistry";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogOverview } from "./CatalogOverview";
import { ComponentCard } from "./ComponentCard";
import { getCatalogPage } from "./catalogPages";

export function CatalogPage({ routeId }: { routeId?: string }) {
  const page = getCatalogPage(routeId);
  const [search, setSearch] = useState("");
  const pageItems = useMemo(() => page ? catalog.filter(page.matches) : [], [page]);
  const query = search.trim().toLowerCase();
  const matches = pageItems.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(query));

  const groups = page?.groups?.map(group => ({
    ...group,
    items: matches.filter(group.matches)
  })).filter(group => group.items.length) ?? [];

  const groupedNames = new Set(groups.flatMap(group => group.items.map(item => item.name)));
  const remainder = matches.filter(item => !groupedNames.has(item.name));

  return <>
    <CatalogSidebar routeId={routeId} />
    <main className="catalog-main">
      {!page ? <CatalogOverview /> : <>
        <header className="catalog-hero catalog-hero--compact">
          <p className="eyebrow">A&D VOICE · {page.label.toUpperCase()}</p>
          <h1>{page.label}</h1>
          <p>{page.description}</p>
          <div className="hero-stats"><span><b>{pageItems.length}</b>КОМПОНЕНТОВ</span><span><b>LIVE</b>ПРИМЕРЫ</span><span><b>TSX</b>КОД</span></div>
          <div className="hero-art"><WaveDecoration /></div>
        </header>
        <div className="catalog-search-row">
          <div className="catalog-search"><TextField startAdornment={<Icon name="search" />} label="Найти компонент" placeholder={`Поиск в разделе «${page.label}»…`} value={search} onValueChange={setSearch} clearable /></div>
          <span className="search-help">{matches.length} / {pageItems.length} · компоненты раздела</span>
        </div>

        {groups.map((group, index) => <section className="catalog-section catalog-family" key={group.id}>
          <header className="section-caption">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{group.label}</h2>{group.description && <p>{group.description}</p>}</div>
            <small>{group.items.length}</small>
          </header>
          <div className="catalog-grid catalog-grid--compact">{group.items.map(item => <ComponentCard key={item.name} item={item} />)}</div>
        </section>)}

        {!!remainder.length && <section className="catalog-section catalog-family">
          <header className="section-caption"><span>{String(groups.length + 1).padStart(2, "0")}</span><h2>Остальное</h2><small>{remainder.length}</small></header>
          <div className="catalog-grid catalog-grid--compact">{remainder.map(item => <ComponentCard key={item.name} item={item} />)}</div>
        </section>}

        {!page.groups && !!matches.length && <section className="catalog-section catalog-section--page">
          <header className="section-caption"><span>01</span><h2>{page.label}</h2><small>{matches.length}</small></header>
          <div className="catalog-grid catalog-grid--compact">{matches.map(item => <ComponentCard key={item.name} item={item} />)}</div>
        </section>}
        {!matches.length && <p className="catalog-empty">Совпадений в этом разделе нет.</p>}
      </>}
    </main>
  </>;
}
