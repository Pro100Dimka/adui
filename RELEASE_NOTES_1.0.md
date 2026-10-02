# A&D UI 1.0.0 — release notes

## Documentation portal

- One public component per documentation route (`#/components/<component>`).
- Collapsible category navigation with search and current-component highlighting.
- Compact overview with category cards and direct component links.
- Component pages place live preview and real usage code in the first viewport on desktop.
- TypeScript API is extracted from current source, not duplicated manually.
- Source implementation is available on demand instead of occupying page height by default.
- Related components and previous/next navigation are compact and contextual.
- A dedicated mobile documentation navigator replaces the permanent desktop sidebar on small screens.

## Layout policy

- Small controls stay content-sized.
- Wide components (`Grid`, `DataTable`, `PianoRollGrid`, etc.) may use the full preview width.
- Documentation cards avoid artificial minimum heights.
- Code blocks are scrollable with bounded heights so pages remain quick to scan.
- Overview uses 3 / 2 / 1 category columns depending on available width.

## Release checks

`CHECK_ALL.cmd` now validates component structure, colocation, catalog examples, primitive API, responsive units, layout, motion, Grid, control sizes, button contracts, example isolation, documentation contracts and TypeScript.
