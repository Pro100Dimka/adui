import React from "react";
import { Icon } from "@ad-voice/ui";
import { catalog } from "./componentRegistry";
import { catalogPages } from "./catalogPages";

const icons: Record<string, string> = {
  fields: "edit",
  buttons: "cursor",
  navigation: "menu",
  layout: "grid",
  typography: "text",
  feedback: "info",
  audio: "audio",
  editor: "pencil",
  composites: "layers",
  motion: "sparkles"
};

export function CatalogOverview() {
  return <section className="catalog-overview">
    <header className="catalog-page-head"><p className="eyebrow">КОМПОНЕНТЫ</p><h1>Каталог по разделам</h1><p>Выбери группу — внутри будут только связанные компоненты, без длинной общей страницы.</p></header>
    <div className="catalog-category-grid">
      {catalogPages.map(page => <a key={page.id} href={`#/components/${page.id}`} className="catalog-category-card">
        <span className="catalog-category-icon"><Icon name={icons[page.id] ?? "grid"} /></span>
        <span className="catalog-category-copy"><strong>{page.label}</strong><small>{page.description}</small></span>
        <span className="catalog-category-count">{catalog.filter(page.matches).length}</span>
      </a>)}
    </div>
  </section>;
}
