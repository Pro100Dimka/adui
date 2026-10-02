import React from "react";
import { catalog } from "./componentRegistry";
import { catalogPages } from "./catalogPages";

export function CatalogSidebar({ routeId }: { routeId?: string }) {
  return <aside className="sidebar">
    <div className="sidebar-section">
      <div className="sidebar-label">Каталог компонентов</div>
      <a className={`sidebar-link ${!routeId || routeId === "overview" ? "active" : ""}`} href="#/components/overview">Обзор<small>{catalog.length}</small></a>
      {catalogPages.map(page => <a key={page.id} className={`sidebar-link ${routeId === page.id ? "active" : ""}`} href={`#/components/${page.id}`}>{page.label}<small>{catalog.filter(page.matches).length}</small></a>)}
    </div>
    <div className="side-rule" />
    <div className="sidebar-foot">React · TypeScript · SVG<br />Каждая группа — отдельная страница.<br />Компоненты остаются живыми.</div>
  </aside>;
}
