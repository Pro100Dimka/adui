import React, { Component, useState } from "react";
import { Button, Icon, TextField, WaveDecoration, copyText } from "@ad-voice/ui";
import { catalog, getExample, getExampleSource } from "./componentRegistry";

class ExampleBoundary extends Component<{ name: string; children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(`[A&D UI] Example ${this.props.name} crashed`, error); }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="component-example-error" role="alert"><strong>{this.props.name}</strong><span>Ошибка только в этом примере. Остальной каталог продолжает работать.</span><code>{this.state.error.message}</code></div>;
  }
}

export const categories = [
  ["foundation", "Основа"], ["layout", "Поверхности и компоновка"], ["actions", "Кнопки и навигация"], ["forms", "Поля и выбор"], ["data", "Данные и состояния"], ["effects", "Свет и иллюстрации"], ["audio", "Аудиокомпоненты"], ["editor", "Редактор мелодии"], ["patterns", "Готовые композиции"]
] as const;
export function CatalogSidebar() {
  return <aside className="sidebar"><div className="sidebar-section"><div className="sidebar-label">Каталог React-компонентов</div>{categories.map(([id, label]) => <a key={id} className="sidebar-link" href={`#/components/${id}`} onClick={() => setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0)}>{label}<small>{catalog.filter(x => x.category === id).length}</small></a>)}</div><div className="side-rule" /><div className="sidebar-foot">React · TypeScript · SVG<br />Один источник материалов.<br />Управление через props и state.</div></aside>;
}
export function CatalogPage() {
  const [search, setSearch] = useState("");
  const matches = catalog.filter(x => `${x.name} ${x.description}`.toLowerCase().includes(search.toLowerCase()));
  return <><CatalogSidebar /><main className="catalog-main"><header className="catalog-hero"><p className="eyebrow">A&D VOICE · REACT COMPONENT SYSTEM</p><h1>Один язык. Все экраны.</h1><p>Живой каталог согласованного интерфейса A&D Voice. Нативные React-компоненты, типизированные параметры, общие материалы и независимый слой анимации.</p><div className="hero-stats"><span><b>{catalog.length}</b>КОМПОНЕНТОВ</span><span><b>12</b>ЭКРАНОВ</span><span><b>TSX</b>ИСХОДНИКИ</span></div><div className="hero-art"><WaveDecoration /></div></header>
    <div className="catalog-search-row"><div className="catalog-search"><TextField icon="search" label="Найти компонент" placeholder="Поиск по названию или назначению…" value={search} onValueChange={setSearch} clearable /></div><span className="search-help">{matches.length} / {catalog.length} · живые примеры компонентов</span></div>
    {categories.map(([id, label], groupIndex) => {
      const items = matches.filter(x => x.category === id);
      return items.length ? <section key={id} id={id} className="catalog-section"><header className="section-caption"><span>{String(groupIndex + 1).padStart(2, "0")}</span><h2>{label}</h2><small>{items.length} компонентов</small></header><div className="catalog-grid">{items.map(item => {
        const source = getExampleSource(item.name); const LiveExample = getExample(item.name);
        return <article className={`catalog-component ${item.wide ? "wide" : ""}`} key={item.name} data-example={item.name}>
          <header className="component-head"><div><h3>{item.name}</h3><p>{item.description}</p></div><span className="component-index">REACT</span></header>
          <div className="component-demo"><ExampleBoundary name={item.name}>{LiveExample ? <LiveExample /> : <div>Нет example.tsx</div>}</ExampleBoundary></div>
          <footer className="component-bottom"><code>{item.name}</code><span className="source-use">Код ниже соответствует текущему demo</span></footer>
          <details className="component-code"><summary>Показать код текущего примера</summary><pre>{source}</pre><Button className="copy-code" variant="ghost" size="small" icon="copy" onClick={() => { void copyText(source); }}>Копировать весь пример</Button></details>
        </article>;
      })}</div></section> : null;
    })}
    {!matches.length && <p className="catalog-empty">Совпадений нет.</p>}
  </main></>;
}
