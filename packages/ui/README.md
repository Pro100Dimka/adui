# @neo-ui-kit/react

Migration: replace `@ad-voice/ui` with `@neo-ui-kit/react` in dependencies and imports, including CSS and `/core`, `/forms`, `/editor`, `/router` subpaths. Install `@neo-ui-kit/react`; component APIs and CSS class names are unchanged. The old package name is not an alias.

NEO UI — React + TypeScript UI kit: glass/ruby surfaces, animated neon borders, fields, tabs, dialogs, audio controls and a melody editor.

## Install

Live docs: https://pro100dimka.github.io/adui/#/components/overview

Install the package in your application. React and ReactDOM are peer dependencies; the declared range is React 18.2 through 19.

```bash
npm install @neo-ui-kit/react
```

Package: [@neo-ui-kit/react on npm](https://www.npmjs.com/package/@neo-ui-kit/react).

Import the stylesheet once in the app entry point:

```ts
import "@neo-ui-kit/react/styles.css";
```

To test repository changes before publishing, run `npm run package` from the repository root and install the resulting archive in a separate application:

```bash
npm install /path/to/adui/release/neo-ui-kit-react-1.2.0.tgz
```

Maintainers publish new versions from `Pro100Dimka/adui` using the `release.yml` GitHub Actions workflow, a matching `v<version>` tag, and the `npm-publication` environment. npm trusts its OIDC identity; no `NPM_TOKEN` is required. The workflow checks the project and packed consumer before publishing the tested archive. Published `1.0.0` cannot be overwritten: code and README changes in npm require a new package version. See the [repository release instructions](https://github.com/Pro100Dimka/adui#npm-пакет).

## Theme

Two colours build the whole palette (a primary scale, a secondary scale and tinted neutrals):

```tsx
import { ThemeProvider } from "@neo-ui-kit/react";

<ThemeProvider theme="violet">…</ThemeProvider>            // a ready pair
<ThemeProvider primary="#2f7bff" secondary="#9cc4ff">…</ThemeProvider>
<ThemeProvider tokens={{ "primary-900": "#0a1430" }}>…</ThemeProvider> // any token by hand
```

## Usage

```tsx
import { Button, Card, Switch, TextField } from "@neo-ui-kit/react";

export function SettingsCard() {
  return (
    <Card title="Настройки" border>
      <TextField label="Имя в онлайн-комнате" defaultValue="BBB" clearable />
      <Switch label="Радио включено" defaultChecked />
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
    </Card>
  );
}
```

Fields that declare `value` / `defaultValue` support controlled and uncontrolled values; checkboxes and switches use `checked` / `defaultChecked`. Dialog supports `open` / `defaultOpen` and `onOpenChange`; Popover requires controlled `open`. See each component's API for its supported state and event names; a change callback reports a user action, while the owner applies the new controlled value.

The package ships ESM only. Import styles once and wrap the UI in `ThemeProvider`; no playground CSS or router is required. `@neo-ui-kit/react/core`, `/forms`, `/editor`, and `/router` share the same provider contexts with the root entry.

The library code is licensed under [MIT](./LICENSE). Bundled third-party materials retain their respective licenses and notices: `dist/fonts/melodix/OFL-PlayfairDisplay.txt` for the font and `dist/components/artwork/QuantumField/UPSTREAM-LICENSE.txt` for Quantum Fields.

## QuantumField

`QuantumField` is an original, theme-native 3D audio visualization for backgrounds and panels. It renders immediately—there is no Enter gate—and its seven `mode` values are `orbit`, `vortex`, `lattice`, `wave`, `bloom`, `helix`, and `terrain`. Its bounded WebGL renderer uses static particle and filament buffers without post-processing; Canvas 2D is a fallback when WebGL is unavailable. `quality="auto"` limits pixels and particles, and drawing pauses outside the viewport, in hidden tabs, or when the kit's motion setting is off. `interactive` enables deep wheel zoom, local pointer influence, and drag-to-rotate; hovering alone never rotates the whole field. `density`, `speed`, `quality`, `interactive`, and `paused` are optional. Normally its colours follow the nearest `ThemeProvider`; `palette={[primary, secondary]}` overrides one instance.

```tsx
import { QuantumField, ThemeProvider } from "@neo-ui-kit/react";

<ThemeProvider primary="#10c99a" secondary="#7cf3d0">
  <QuantumField mode="vortex" quality="auto" aria-label="Audio field" />
</ThemeProvider>
```

To react to a microphone, request access only from a user click and pass the resulting stream. The component owns and releases its audio analysis graph; your app still owns the stream and stops its tracks when no longer needed.

```tsx
import { useEffect, useState } from "react";
import { Button, QuantumField } from "@neo-ui-kit/react";

function MicrophoneField() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);
  return <>
    <Button onClick={async () => setStream(await navigator.mediaDevices.getUserMedia({ audio: true }))}>
      Enable microphone
    </Button>
    <QuantumField mode="terrain" stream={stream ?? undefined} />
  </>;
}
```

For a file player, `createQuantumFieldAudio()` provides a small optional transport. Create it in response to a user action, call `loadFile(file)` (which does **not** autoplay), then pass `controller.analyser` as `audio`. Its `play`, `pause`, `seek`, `media`, and `dispose` members let you build the controls with the kit's `FilePicker`, `Button`, and `Slider`. `requestMicrophone()` is explicit and stops only the stream it requested; `connectStream(stream)` accepts an app-owned stream without taking ownership.

```tsx
import { useEffect, useRef, useState } from "react";
import { Button, FilePicker, QuantumField, createQuantumFieldAudio } from "@neo-ui-kit/react";

function FileField() {
  const controller = useRef<ReturnType<typeof createQuantumFieldAudio> | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  useEffect(() => () => { void controller.current?.dispose(); }, []);

  return <>
    <FilePicker variant="button" accept="audio/*" label="Choose audio" onFiles={([file]) => {
      if (!file) return;
      const audio = controller.current ??= createQuantumFieldAudio();
      audio.loadFile(file); // does not autoplay
      setAnalyser(audio.analyser);
    }} />
    <Button disabled={!analyser} onClick={() => { void controller.current?.play(); }}>Play</Button>
    <QuantumField mode="wave" audio={analyser ?? undefined} />
  </>;
}
```

An existing audio engine can also pass its own `AnalyserNode` as `audio`, or a callback returning `{ bands: [bass, …, air], energy, beat }` with seven normalized band levels. Playback and permission handling stay outside the visualizer, so mounting it never captures audio unexpectedly.

## DataTable

`DataTable` includes multi-column sorting, per-column filters with distinct-value autocomplete, grouping and aggregates, search, selection, column visibility/order/pinning, lazy row details, row actions, row numbers, density controls, CSV export, and responsive cards. Readers can resize columns by dragging the header edge or focusing it and pressing ←/→; double-clicking the edge restores its original width. `resizableColumns={false}` disables all handles, and `resizable: false` disables one column.

Set `pageSize` to enable pagination. `pageSizeOptions` provides footer choices (the initial size is always included), and the footer shows the visible result range. The reset button clears sorting, filters, grouping, search, hidden columns, resized widths, and the chosen page size. See the live `DataTable` example in the documentation for complete column and row definitions.

Click a header to cycle ascending/descending/unsorted; Shift-click adds another sort criterion. `sorting` / `defaultSorting` / `onSortingChange` manage the ordered array of criteria. The existing single-column `sort` API remains supported. `columnOrder` and `columnPinning` have the same controlled/default/change pattern; pinning is `{ left: ["name"], right: ["status"] }`. The Columns menu exposes keyboard-accessible reordering and pinning. `renderRowDetails(row, index)` is called only for expanded, mounted rows; `expandedRows` contains stable row keys. `renderRowActions` adds an isolated actions cell (`rowActionsWidth` defaults to 120px). Enable `rowNumbers` and `densityToggle` as needed.

For a remote table, supply only the current page and control the state used by your data client:

```tsx
import { useState } from "react";
import { DataTable, type DataTablePagination, type DataTableSort } from "@neo-ui-kit/react";

type Person = { id: string; name: string };
const columns = [{ key: "name", title: "Name" }];

export function PeopleTable({ rows, total, loading }: { rows: Person[]; total: number; loading: boolean }) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({ pageIndex: 0, pageSize: 25 });
  // Your data client loads rows for query, sorting and pagination; cancel stale requests there.
  return <DataTable columns={columns} rows={rows} rowCount={total} loading={loading}
    searchable query={query} onQueryChange={setQuery}
    sorting={sorting} onSortingChange={setSorting}
    pagination={pagination} onPaginationChange={setPagination}
    manualFiltering manualSorting manualPagination />;
}
```

Manual flags are independent: the table does not fetch data and does not re-filter, re-sort or re-slice the corresponding server results. Provide `rowCount` for exact remote page counts. Without it, remote pagination keeps the current page and offers Next while the received page is full. Selection keys survive changing remote pages. Column filters search the complete distinct-value set before offering up to 100 suggestions; the actual row filter is not capped.

For an unpaginated large dataset use `virtualize maxHeight={480}`. The table mounts a viewport-sized range plus `overscan`, measures variable row/detail heights, and keeps a scrollable table on narrow screens rather than converting virtual rows into cards. Pinned tables also keep their horizontal table layout on narrow screens. `estimatedRowHeight` is the initial estimate, not a fixed-height restriction. Small paginated tables do not need virtualization. Stable row keys are important for measured heights, details and selection.

## Responsiveness

The package pauses decorative work outside the viewport and in hidden tabs. Its shared motion clock stops when no visible work remains; consumers do not need a separate animation scheduler. Playback updates are isolated from transport and volume controls. Audio analysis and loader image processing yield between short CPU work slices, and unmounting cancels stale results. Processed loader images are capped at 2048px on the longest side; turning background removal off restores the original upload.

Router updates are immediate by default. Opt into native snapshot transitions with `transition` only when their temporary interruption of pointer interaction suits your screen; normal CSS entrances do not require it.

Animated border geometry is initialized and resized in small batches on the shared clock, only while visible. Light positions use the cached contour instead of querying SVG geometry on every frame. Offscreen borders keep their light position without measuring layout or advancing the effect.

Keep `rows`, `columns`, `options`, and `initialValues` immutable: replace them when their contents change. Stable references allow expensive derived results to be reused across selection, navigation, and other local UI changes. Do not memoize every prop automatically.

For large tables, use `pageSize` or opt into `virtualize` to bound mounted rows. Virtualization bounds rendering, not the cost of client-side sorting/filtering: use the manual server contracts for datasets that are too large to process locally. Open Select/Autocomplete lists are not virtualized: filter very large datasets before supplying options. `PeoplePicker.onSearch(query, signal)` receives an optional `AbortSignal`; forward it to your data client to cancel superseded requests. Expensive custom renderers, validators, and aggregates still need their own work budget.

## Entry points

```ts
import { Button, Card, Dialog, AudioPlayer } from "@neo-ui-kit/react";
import { PianoRoll } from "@neo-ui-kit/react/editor";
import { Router } from "@neo-ui-kit/react/router";
import { Form, FormFields, useForm } from "@neo-ui-kit/react/forms";
import { ThemeProvider, useMotion } from "@neo-ui-kit/react/core";
```

## RotaryKnob

Canvas-rendered volume knob. Drag near the edge to rotate, drag from the center to move linearly, click the outer scale to jump. Wheel and arrow keys change the value, Shift gives a fine step, PageUp/PageDown change by 10, Home/End set 0/100, Escape cancels a drag, double-click resets. `onValueChange` fires while adjusting, `onValueCommit` after the gesture. `readOnly` turns it into a gauge.

## 1.2.0 release notes

- `QuantumBackground` takes `threeUrl`, the base address of a three.js 0.182 copy (the folder with `build/` and `examples/jsm/`), so the scene can work offline and without a third-party CDN. A relative address keeps the scene's import map — and its CSP hash — the same wherever the app runs. The default stays `quantumBackgroundThreeUrl` (unpkg).
- The scene no longer loads web fonts from Google Fonts: it makes no requests beyond three.js.

## 1.1.0 release notes

- **`QuantumBackground` is configured through props.** Every scene setting (`field`, `sensitivity`, `density`, `bloom`, …) is an optional prop with defaults in `quantumBackgroundDefaults`; `quantumBackgroundControls` describes them for building a settings panel. **The component no longer draws its own control panel** — build one next to it (the documentation page shows how) and drive audio through the ref (`QuantumBackgroundHandle`) with `onTransportChange` / `onWaveformChange`.
- New `QuantumBackground` props: `spectrum` / `spectrumRange` (sound from the host app), `particleCount`, `fieldSize`, `fullscreen` / `onFullscreenChange`, and `children` laid over the scene.
- Reaction lines, particle trails and lens/anamorphic light take the theme's colours at the presets' brightness, so the bloom still flashes in any theme.
- The field fills the scene edge to edge in full screen; the running reaction lights toggle and every documented setting reaches the renderer.
- New `resolveTokens` resolves many theme tokens with one style recalculation; `resolveToken` and the `ThemeEditor` use it.
- Dialog, Card and Spotlight pointer lights no longer restyle everything inside them on each pointer move.

## 1.0.3 release notes

- Point the npm Homepage link directly to the documentation overview.
- Runtime code is unchanged from 1.0.2.

## 1.0.2 release notes

- Restore the complete visualizer on the original documentation route and name it `QuantumBackground`.
- Export `QuantumBackground` and `QuantumBackgroundProps`. `QuantumFieldExperience` remains a compatible alias of the same component; existing imports keep working.
- Preserve the original renderer, particles, post-processing, audio controls and theme integration. The separate lightweight `QuantumField` primitive retains its existing API.
- Both legacy documentation links, `quantum-field` and `quantum-field-experience`, open the `QuantumBackground` page.

## 1.0.1 release notes

- Clarifies npm installation and documents GitHub Actions trusted publishing through OIDC.
- Corrects the documented DataTable `rowActionsWidth` default to 120px.
- Runtime code is unchanged from 1.0.0.

## 1.0.0 hardening notes

Version 1.0.0 is the new NEO UI starting point. Rebuild the local archive after changing source files.

- React 18 element refs now reach their public DOM targets. Controlled fields and RotaryKnob keep the supplied value until their owner accepts a change.
- Nested layers close in order with Escape. Dialog restores focus, discards obsolete async confirmations, and keeps actions available in narrow containers.
- Fields preserve explicit accessible names and descriptions. Select applies `style` / `className` to its layout wrapper and `id` / `data-*` to its trigger; text fields target their native input. Compound pickers retain their existing outer `id` / `data-*` location.
- Select and ColorPicker button names include their rendered value or placeholder after the field label, including explicit `aria-label` / `aria-labelledby`. Exact accessible-name queries should include that value; external label references retain priority over `aria-label`.
- AnimatedBorder follows independent elliptical corner radii, resizes without repeated contour work, resumes after motion preference changes, and does not enlarge scroll geometry. Visible borders follow the shared animation cadence; this improves smoothness at a higher CPU cost than the previous 10fps idle path.
- Border overlays and moving lights share the exact border box, including fractional sizes, asymmetric borders, scrolling and transforms.
- DataTable fills its container with pinned columns, keeps sorting/filtering/select-all visible in its narrow card layout, and resets density and details with the rest of the view. The default row-actions width is now 120px (previously 96px); set `rowActionsWidth` explicitly to retain a custom layout.
- Icon and Loader accept `xs`, `sm`, `md`, `lg` alongside their existing numeric/CSS-length sizes. RotaryKnob fits narrow containers throughout rotation; documentation uses named size presets and NumberField for numeric parameters.
- Badge text follows the theme foreground for readable status labels in light and dark schemes. StatusIndicator's offline text rule is scoped to that component.
- `AudioPlayer.onVolumeChange` is additive. Pair it with `volume` when an external audio engine owns playback.
- Explicit empty Waveform/Sparkline arrays now render empty data. Omit the data prop if you want the demonstration shape.
- PianoRoll cancellation reports zero offsets before `onNoteDragEnd`. Apply offsets relative to the gesture start to restore a cancelled edit.
- SplitButton `items` now uses the Menu item contract. Invalid item shapes that slipped through the previous `any[]` type must be corrected.
- The root entry exports `FormProps` and `FormFieldsProps`. Artwork declarations work without `resolveJsonModule` or `skipLibCheck` in the consuming app.

Repository evidence, browser runners, before/after measurements and coverage limits are recorded in `evidence/`. Unit and renderer checks complement actual browser geometry and interaction checks; they do not certify untested physical devices or browser engines.

## QuantumBackground

`QuantumBackground` is the complete Quantum Fields visualizer inside an iframe. It renders only the scene: every visual and audio-reaction setting is an optional prop, so one component serves a hero background, a music page or a configurable studio. It follows the nearest `ThemeProvider` palette: particles, connection lines, the running reaction lights, particle trails and the lens-flare/anamorphic tints all take the theme's colours, whichever `field` is chosen. This experience includes MIT-licensed upstream code and CDN-loaded Three.js modules; the upstream notice is shipped as `UPSTREAM-LICENSE.txt`. It is not mounted in overview-card previews.

```tsx
import { QuantumBackground, ThemeProvider } from "@neo-ui-kit/react";
import "@neo-ui-kit/react/styles.css";

<ThemeProvider theme="violet">
  <QuantumBackground field="Neutrino" bloom={0.8} connectionsEnabled={false} interactive={false} style={{ height: "100vh" }}>
    <h1>Over the field</h1>
  </QuantumBackground>
</ThemeProvider>
```

Settings (`QuantumBackgroundSettings`): `field` (one of `quantumBackgroundFields`), `sensitivity`, `density`, `timeScale`, `paused`, `interactive`, nebula, connection, crawler, particle-trail, lens-flare, depth-of-field, camera-shake, bloom, trails, chromatic, anamorphic, god-ray, grain, vortex, pulse, bass-gate, onset, audio-camera, terrain-height and adaptive-quality values. Unset props use `quantumBackgroundDefaults`; only props that change are sent to the scene. `quantumBackgroundControls` lists each setting's group, label, range, step and the switch it depends on, for building your own settings panel next to the component. `particleCount` sets how many particles are drawn across both layers (0 to `quantumBackgroundMaxParticles`, 85 000); leave it unset to follow `density`. Adaptive quality may draw fewer, so turn `adaptiveQualityEnabled` off when the exact count matters. `particleBudget` is an upper cap on top of either. `fieldSize` is the share of the scene the field spans (0.78 by default, 1 reaches the edges). `fullscreen` makes the scene cover the whole viewport above the page, and the field then runs edge to edge (`quantumBackgroundFullscreenFieldSize`, 1.1) unless `fieldSize` is set (in the browser's top layer, so no ancestor's `overflow`, `transform` or `z-index` clips it, and the iframe keeps running); Escape calls `onFullscreenChange(false)`, so keep it controlled. `children` are laid over the scene, e.g. a close button while full screen. This differs from `ref.toggleFullscreen()`, which uses the browser's Fullscreen API and needs a click.

`threeUrl` points the scene at your own copy of three.js 0.182 instead of unpkg (for example `threeUrl="./vendor/three/"` with `build/three.module.js` and `examples/jsm/` served there); with it the scene makes no network requests at all. Only the scene's import map changes, so a strict CSP pins the same script hashes everywhere.

`spectrum` feeds sound the scene cannot hear itself — a native audio engine, a WebRTC call, a server stream: band levels 0–1 from low to high frequencies, log-spaced across `spectrumRange` (default `[40, 12000]` Hz), any band count. Pass a new array whenever the levels change (10–60 times a second); bands, beats, reaction lines and flashes follow it exactly as they follow a playing song. A file or microphone started from the ref takes over while it plays; `spectrum={undefined}` returns the scene to silence.

```tsx
const [bands, setBands] = useState<number[]>();
useEffect(() => engine.onSpectrum(setBands), []); // e.g. 18 bands from 40 Hz to 12 kHz
<QuantumBackground spectrum={bands} spectrumRange={[40, 12000]} />
```

Audio is a one-off action rather than a setting, so it is on the ref (`QuantumBackgroundHandle`): `loadFile(file)`, `togglePlayback()`, `seek(seconds)`, `toggleMicrophone()`, `screenshot()` and `toggleFullscreen()`. `onTransportChange` reports `{ mode, playing, current, duration, track }`, and `onWaveformChange` reports the peaks of a loaded file, so a kit `FilePicker`, `AudioPlayer` and `IconButton`s can drive it:

```tsx
const scene = useRef<QuantumBackgroundHandle>(null);
const [transport, setTransport] = useState<QuantumBackgroundTransport>();

<QuantumBackground ref={scene} field={field} sensitivity={sensitivity} onTransportChange={setTransport} />
<FilePicker variant="button" accept="audio/*" onFiles={([file]) => file && scene.current?.loadFile(file)} />
<AudioPlayer playing={transport?.playing} position={transport?.current} duration={transport?.duration}
  onPlayingChange={() => scene.current?.togglePlayback()} onTimeChange={(s) => scene.current?.seek(s)} />
```

The documentation page builds exactly such a panel (song, player, microphone, snapshot, fullscreen, field and sensitivity, plus a closed “Тонкая настройка” section) outside the component. `QuantumFieldExperience`, `QuantumFieldExperienceProps` and `quantumFieldExperienceControls` remain compatible aliases; note that `QuantumFieldExperience` no longer renders its own control panel. The separate lightweight `QuantumField` primitive documented above keeps its original props and rendering; it is not an alias of the full background.
