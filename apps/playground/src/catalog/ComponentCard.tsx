import React, { Component } from "react";
import { Button, copyText } from "@ad-voice/ui";
import { getExample, getExampleSource, type CatalogMeta } from "./componentRegistry";

class ExampleBoundary extends Component<{ name: string; children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(`[A&D UI] Example ${this.props.name} crashed`, error); }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="component-example-error" role="alert"><strong>{this.props.name}</strong><span>Ошибка только в этом примере. Остальной каталог продолжает работать.</span><code>{this.state.error.message}</code></div>;
  }
}

const trulyWide = new Set(["PianoRollGrid", "DataTable", "Grid", "Illustration"]);

export function ComponentCard({ item }: { item: CatalogMeta }) {
  const source = getExampleSource(item.name);
  const LiveExample = getExample(item.name);
  const wide = item.wide && trulyWide.has(item.name);
  return <article className={`catalog-component ${wide ? "wide" : ""}`} data-example={item.name}>
    <header className="component-head"><div><h3>{item.name}</h3><p>{item.description}</p></div><span className="component-index">REACT</span></header>
    <div className="component-demo"><ExampleBoundary name={item.name}>{LiveExample ? <LiveExample /> : <div>Нет example.tsx</div>}</ExampleBoundary></div>
    <footer className="component-bottom"><code>{item.name}</code><span className="source-use">Код ниже соответствует текущему demo</span></footer>
    <details className="component-code"><summary>Показать код текущего примера</summary><pre>{source}</pre><Button className="copy-code" variant="ghost" size="sm" icon="copy" onClick={() => { void copyText(source); }}>Копировать весь пример</Button></details>
  </article>;
}
