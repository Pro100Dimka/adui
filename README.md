# A&D Voice UI 1.1.0

Premium React + TypeScript UI library and documentation workspace.

## Start development

```bash
npm install
npm run dev
```

On Windows you can also run `START_DEV.cmd`.

The playground imports the source package directly, so changes in `packages/ui/src` appear through Vite HMR without rebuilding the npm package.

## Documentation portal

The component docs use one route per public component:

```text
#/components/button
#/components/text-field
#/components/rotary-knob
#/components/animated-border
```

Navigation is grouped into collapsible categories. Every component page contains:

- live preview from the real `example.tsx`;
- real example source;
- TypeScript props extracted from current source;
- implementation source on demand;
- related components;
- previous / next navigation.

On small screens the permanent sidebar becomes a compact documentation navigator.

## Source structure

```text
packages/ui/src/components/<category>/<Component>/
├─ <Component>.tsx
├─ styles.css
├─ example.tsx
└─ meta.ts
```

Public components do not use local barrel `index.ts` files. One component lives in one folder with its styles, example and metadata.

The internal compatibility-only `Field` implementation is intentionally not documented or exported publicly.

## Release checks

Run:

```bash
npm run check
```

or `CHECK_ALL.cmd` on Windows.

The release checks cover:

- component structure and colocation;
- public primitive API;
- catalog examples;
- responsive units and scroll/layout contracts;
- animated-border/motion contracts;
- Grid and control-size contracts;
- button visual/layout contracts;
- isolated examples;
- documentation portal structure;
- TypeScript typecheck (after dependencies are installed).

## Build

```bash
npm run build
```

## Create installable npm package

```bash
npm run package
```

or run `CREATE_NPM_PACKAGE.cmd`.

The package is written into `release/`, for example:

```text
release/ad-voice-ui-1.1.0.tgz
```

Install it in another project:

```bash
npm install ../ad-voice-ui-dev-workspace/release/ad-voice-ui-1.1.0.tgz
```

Then use:

```tsx
import { Button, Card, TextField } from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";
```

Additional entry points:

```tsx
import { PianoRollGrid } from "@ad-voice/ui/editor";
import { ParticipantCard } from "@ad-voice/ui/composites";
```

## Release notes

See `RELEASE_NOTES_1.0.md`.

## Router + Forms (1.2)

```tsx
import { Router, type RouteDefinition } from "@ad-voice/ui/router";
import { Form, FormFields, useForm } from "@ad-voice/ui/forms";
```

The playground itself now uses `Router`; the previous manual `location.hash` state router was removed.
See `ARCHITECTURE_ROUTER_FORMS.md` for the migration rationale from `comp.zip`.
