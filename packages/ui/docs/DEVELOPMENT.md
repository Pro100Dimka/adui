# Development

Do not develop this package by opening `packages/ui` alone. Use the repository root:

```bash
npm run dev
```

The root playground consumes `packages/ui/src` directly through Vite aliases, so component edits appear immediately.

When satisfied:

```bash
npm run package
```

The installable tarball is created under `/release`.
