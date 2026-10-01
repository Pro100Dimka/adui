import React, { useEffect, useState } from "react";
import { ThemeProvider, MotionProvider, Switch, IconTile, useReducedMotion } from "@ad-voice/ui";
import { CatalogPage } from "./catalog/CatalogPage";
import { ScreensPage } from "./app/ScreensPage";
import { catalog } from "./catalog/componentRegistry";
export default function App() {
  const [hash, setHash] = useState(() => location.hash || "#/components"), [explicit, setExplicit] = useState<boolean>();
  const reduced = useReducedMotion(), motion = explicit ?? !reduced;
  useEffect(() => { const change = () => setHash(location.hash || "#/components"); window.addEventListener("hashchange", change); return () => window.removeEventListener("hashchange", change); }, []);
  const page = hash.startsWith("#/screens") ? "screens" : "components";
  useEffect(() => { document.title = `A&D UI · React — ${page === "screens" ? "Экраны" : "Компоненты"}`; document.documentElement.dataset.ready = "true"; document.documentElement.dataset.adMotion = motion ? "on" : "off"; }, [page,motion]);
  return <ThemeProvider><MotionProvider enabled={motion}><div id="app"><header className="site-top"><a className="site-brand" href="#/components"><IconTile icon="wave" iconSize={25} /><span><strong>A&D UI</strong><small>REACT COMPONENT SYSTEM</small></span></a><nav className="site-pages" aria-label="Страницы"><a className={page === "components" ? "active" : ""} href="#/components">Компоненты <span className="nav-count">{catalog.length}</span></a><a className={page === "screens" ? "active" : ""} href="#/screens/advanced">Экраны <span className="nav-count">12</span></a></nav><div className="site-tools"><span className="site-version">REACT + TYPESCRIPT · 1.0.0</span><Switch label="Анимации" checked={motion} onValueChange={setExplicit} /></div></header>{page === "components" ? <CatalogPage /> : <ScreensPage routeId={hash.split("/")[2] ?? "advanced"} motion={motion} />}</div></MotionProvider></ThemeProvider>;
}
