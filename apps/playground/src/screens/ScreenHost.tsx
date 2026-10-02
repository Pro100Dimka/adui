import React, {
  createElement,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import * as UI from "@ad-voice/ui";
import { SvgAsset, domProps, type ReferenceProps } from "./legacyUiInternals";
import type { VectorNode } from "./types";
import { createScreenContext } from "./context.js";
import { screenRegistry } from "./registry";
import type { ScreenHandle, ScreenId, LayoutNode } from "./types";
import uiCSS from "@ad-voice/ui/styles.css?inline";

const voidTags = new Set([
  "input",
  "br",
  "hr",
  "meta",
  "link",
  "source",
  "col",
  "wbr",
  "area",
  "embed",
  "param",
  "track",
]);
const baseComponents = UI as unknown as Record<
  string,
  React.ComponentType<ReferenceProps>
>;
const legacyAliases: Record<string, string> = {
  PageHeader: "Header",
  SectionHeader: "Header",
  DialogHeader: "Header",
  IconTile: "Icon",
  Surface: "Card",
  MetricCard: "Card",
  AnimatedBorder: "Card",
  SceneIllustration: "Illustration",
  ArtworkFrame: "Illustration",
  CircularGauge: "RotaryKnob",
  VolumeControl: "Slider",
  TransportBar: "AudioPlayer",
  LatencyIndicator: "Sparkline",
  ParticleLayer: "WaveDecoration",
  PianoKeyboard: "PianoRollGrid",
  TimeRuler: "PianoRollGrid",
  LyricsLane: "PianoRollGrid",
  NoteBlock: "PianoRollGrid",
  Playhead: "PianoRollGrid",
  SelectionOverlay: "PianoRollGrid",
  UndoRedoControls: "Toolbar",
  ZoomControl: "Slider",
  CodeViewer: "TextArea",
  CopyableField: "TextField",
  PathField: "TextField",
  DiagnosticsPanel: "Card",
  ModelStatusCard: "Card",
  PerformanceSummary: "Card",
  ProcessingTaskCard: "Card",
  ProfileCard: "Card",
  RecordingCard: "Card",
  RoomConnectionForm: "Card",
  StorageSummary: "Card",
};
const components = new Proxy(baseComponents, {
  get(target, key: PropertyKey) {
    if (typeof key !== "string") return undefined;
    return target[key] ?? target[legacyAliases[key]];
  },
});
function treeNode(
  node: LayoutNode | string,
  assets: Record<string, VectorNode>,
  key: number,
): React.ReactNode {
  if (typeof node === "string") return node;
  if (node.art) {
    const asset = assets[node.art];
    return asset ? (
      <SvgAsset
        key={key}
        node={asset}
        unique={false}
        component={node.component ?? undefined}
      />
    ) : null;
  }
  const tag = node.tag ?? "div",
    attrs = { ...node.props };
  if (tag === "select" && attrs.value === undefined) {
    const options = (children: Array<LayoutNode | string>): LayoutNode[] =>
      children.flatMap((child) =>
        typeof child === "string"
          ? []
          : child.tag === "option"
            ? [child]
            : options(child.children ?? []),
      );
    const selected = options(node.children ?? []).filter(
      (option) =>
        option.props?.selected !== undefined && option.props.selected !== false,
    );
    if (selected.length) {
      const values = selected.map(
        (option) =>
          option.props?.value ??
          (option.children ?? [])
            .filter((child) => typeof child === "string")
            .join(""),
      );
      attrs.value =
        attrs.multiple !== undefined && attrs.multiple !== false
          ? values
          : values[0];
    }
  }
  const children = voidTags.has(tag)
    ? undefined
    : (node.children ?? []).map((n, i) => treeNode(n, assets, i));
  const Component = node.component ? components[node.component] : null;
  if (Component)
    return (
      <Component
        key={key}
        __reference={{ tag, attrs, children, material: node.material }}
      />
    );
  return voidTags.has(tag)
    ? createElement(tag, { ...domProps(attrs, "", false, tag), key })
    : createElement(tag, { ...domProps(attrs, "", false, tag), key }, children);
}

interface DocumentProps {
  id: ScreenId;
  host: HTMLDivElement;
  root: ShadowRoot;
  onReady: (handle: ScreenHandle | null) => void;
  onNotice?: (message: string) => void;
}
/**
 * React renders the initial tree. The preserved controller owns its imperative subtree afterwards.
 * This memoized boundary NEVER reconciles controller-mutated children. A reset remounts the whole
 * boundary; disposal precedes removal. Do not put changing props into this subtree.
 */
const ReferenceDocument = memo(function ReferenceDocument({
  id,
  host,
  root,
  onReady,
  onNotice,
}: DocumentProps) {
  const item = screenRegistry[id];
  const bodyRef = useRef<HTMLDivElement>(null);
  const nodes = useMemo(
    () => item.definition.tree.map((n, i) => treeNode(n, item.assets, i)),
    [item],
  );
  const notify = useRef(onNotice);
  notify.current = onNotice;
  useLayoutEffect(() => {
    let context: ScreenHandle | null = null,
      disposed = false;
    // Delayed setup lets StrictMode's development setup-cleanup-setup cycle settle before a
    // third-party controller mutates the tree. Its first scheduled setup is cancelled below.
    const scheduled = window.setTimeout(() => {
      if (disposed || !bodyRef.current) return;
      context = createScreenContext(
        host,
        root,
        bodyRef.current,
        item.definition,
      ) as unknown as ScreenHandle;
      context.notify = (message) => notify.current?.(message);
      try {
        context.resize();
        item.init(context);
        context.installBorders();
        context.start();
      } catch (reason) {
        const message =
          reason instanceof Error ? reason.message : String(reason);
        context.errors.push(message);
        console.error(`Screen ${id}: ${message}`);
      }
      onReady(context);
    }, 0);
    return () => {
      disposed = true;
      clearTimeout(scheduled);
      context?.dispose();
      onReady(null);
    };
  }, [id, host, root, item, onReady]);
  return (
    <>
      <style>
        {item.css +
          "\n" +
          uiCSS +
          `
      :host{display:block;width:100%;height:100%;position:relative;color:var(--ad-text);}
      .ad-legacy-body{height:100%;width:100%;min-height:0;min-width:0;display:grid;place-items:center;position:relative;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;margin:0;background:transparent;}
      .ad-legacy-body::-webkit-scrollbar{width:clamp(.45rem,.3rem + .25vw,.7rem);height:clamp(.45rem,.3rem + .25vw,.7rem);}.ad-legacy-body::-webkit-scrollbar-thumb{background:#7e304a;border-radius:999rem;}.ad-legacy-body::-webkit-scrollbar-track{background:#100911;}
      :host([data-inactive]) *, :host([data-ad-motion="off"]) *{animation-play-state:paused!important;}
      [data-inspect-hover]{outline:0.125rem solid #4df6cf!important;outline-offset:0.1875rem;}
      .ad-border{z-index:20;}
      /* Screen action buttons keep each screen's placement/geometry, but share the UI-library material. */
      [data-ad-component="Button"],[data-ad-component="IconButton"],[data-ad-component="ToggleButton"]{
        position:relative;isolation:isolate;color:#fff7fa;border-color:#ff6f8e42!important;
        background:linear-gradient(180deg,#18111a,#07090d 62%,#06060a)!important;
        box-shadow:inset 0 .0625rem .125rem #ffe2ed29,inset 0 0 .5rem #e6c3ff06,0 .1875rem .4375rem #0005!important;
        transition:filter .18s,box-shadow .18s,transform .18s,border-color .18s!important;
        backdrop-filter:blur(.5rem) saturate(1.06);
      }
      [data-ad-component="Button"]::before,[data-ad-component="IconButton"]::before,[data-ad-component="ToggleButton"]::before{
        content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
        background:linear-gradient(180deg,#ffffff20 0%,#ffffff08 10%,transparent 34%),radial-gradient(85% 90% at 50% -6%,#ff5b7f30 0%,#ff5b7f0c 42%,transparent 78%);
      }
      [data-ad-component="Button"]:hover:not(:disabled),[data-ad-component="IconButton"]:hover:not(:disabled),[data-ad-component="ToggleButton"]:hover:not(:disabled){
        filter:brightness(1.18);box-shadow:0 0 .9375rem #ff35552a,inset 0 .0625rem .125rem #ffd4e438!important;transform:translateY(-.0625rem);
      }
      [data-ad-component="Button"]:active:not(:disabled),[data-ad-component="IconButton"]:active:not(:disabled),[data-ad-component="ToggleButton"]:active:not(:disabled){filter:brightness(.95);transform:translateY(0);}
      [data-ad-component="ToggleButton"][aria-pressed="true"],[data-ad-component="IconButton"][aria-pressed="true"],
      [data-ad-component="Button"][data-primary],[data-ad-component="IconButton"][data-primary],
      .pa-play[data-ad-component="IconButton"],.leave-button[data-ad-component="Button"],.rejoin-button[data-ad-component="Button"]{
        border-color:#ff8aa65e!important;background:linear-gradient(180deg,#8e1438,#3b0616 55%,#24040d)!important;
        box-shadow:inset 0 .0625rem .125rem #ffe2ed75,inset 0 0 .9375rem #ff1d4548,0 0 .3125rem #ff45634c,0 0 1.1875rem #ff214b30!important;
      }
      [data-ad-component="IconButton"] svg,[data-ad-component="ToggleButton"] svg{filter:drop-shadow(0 0 .1875rem #ff8da6a6);}
    `}
      </style>
      <div ref={bodyRef} className="ad-legacy-body">
        {nodes}
      </div>
    </>
  );
});

export interface ScreenHostProps {
  screen: ScreenId;
  active?: boolean;
  motion?: boolean;
  tab?: string;
  zoom?: "fit" | "actual";
  onReady?: (context: ScreenHandle | null) => void;
  onNotice?: (message: string) => void;
  inspect?: boolean;
  onInspect?: (name: string, info: Record<string, unknown>) => void;
  onTabChange?: (tab: string) => void;
}
export function ScreenHost({
  screen,
  active = true,
  motion = true,
  tab,
  zoom = "fit",
  onReady,
  onNotice,
  inspect = false,
  onInspect,
  onTabChange,
}: ScreenHostProps) {
  const [mount, setMount] = useState<{
    host: HTMLDivElement;
    root: ShadowRoot;
  } | null>(null);
  const [context, setContext] = useState<ScreenHandle | null>(null);
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  const ref = useCallback((host: HTMLDivElement | null) => {
    if (host)
      setMount({
        host,
        root: host.shadowRoot ?? host.attachShadow({ mode: "open" }),
      });
  }, []);
  const ready = useCallback((handle: ScreenHandle | null) => {
    setContext(handle);
    readyCallback.current?.(handle);
  }, []);
  useEffect(() => {
    if (context) {
      context.setActive(active);
      if (active) context.resize();
    }
  }, [context, active, zoom]);
  useEffect(() => {
    context?.setMotion(motion);
  }, [context, motion]);
  useEffect(() => {
    if (active && tab) context?.api.SettingsDemo?.navigate?.(tab);
  }, [context, active, tab]);
  const tabChange = useRef(onTabChange);
  tabChange.current = onTabChange;
  useEffect(() => {
    if (!context) return;
    const handle = (e: Event) => {
      const tab = (e as CustomEvent<{ tab: string }>).detail?.tab;
      if (tab) tabChange.current?.(tab);
    };
    context.root.addEventListener("settings:tab-change", handle);
    return () =>
      context.root.removeEventListener("settings:tab-change", handle);
  }, [context]);
  useEffect(() => {
    if (!context || !inspect || !active) return;
    let hover: Element | null = null;
    const move = (event: Event) => {
      const element = event
        .composedPath()
        .find(
          (n) =>
            n instanceof Element &&
            n.getAttribute("data-ad-component") &&
            n.getAttribute("data-ad-component") !== "AnimatedBorder",
        ) as Element | undefined;
      if (!element) return;
      if (hover !== element) {
        hover?.removeAttribute("data-inspect-hover");
        hover = element;
        hover.setAttribute("data-inspect-hover", "");
      }
      onInspect?.(element.getAttribute("data-ad-component")!, {
        tag: element.localName,
        id: element.id,
        material: element.getAttribute("data-ad-material"),
      });
    };
    const block = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    context.root.addEventListener("pointermove", move);
    context.root.addEventListener("click", block, true);
    return () => {
      hover?.removeAttribute("data-inspect-hover");
      context.root.removeEventListener("pointermove", move);
      context.root.removeEventListener("click", block, true);
    };
  }, [context, inspect, active, onInspect]);
  return (
    <div
      className="ad-screen-host"
      data-screen={screen}
      data-zoom={zoom}
      data-inactive={active ? undefined : ""}
      hidden={!active}
      ref={ref}
    >
      {mount &&
        createPortal(
          <ReferenceDocument
            id={screen}
            host={mount.host}
            root={mount.root}
            onReady={ready}
            onNotice={onNotice}
          />,
          mount.root,
        )}
    </div>
  );
}
