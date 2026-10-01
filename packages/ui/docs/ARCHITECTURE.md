# Package architecture

- `src/core/` — shared types, providers, motion hooks and border engine.
- `src/components/controls.tsx` — buttons, tabs, fields, selects, switches, sliders and file controls.
- `src/components/layout.tsx` — surfaces, cards, headers, icons and structural primitives.
- `src/components/feedback.tsx` — dialogs, menus, status, progress, messages and notifications.
- `src/components/media.tsx` — waveform/audio controls, gauges, meters and knobs.
- `src/components/compositions.tsx` — reusable application-level compositions.
- `src/components/editor.tsx` — melody-editor primitives.
- `src/tokens.css` — design tokens/material variables.
- `src/components.css` — component visuals.
- `src/styles.css` — stylesheet entry point.

The package intentionally keeps React and ReactDOM out of the bundle through peer dependencies.
