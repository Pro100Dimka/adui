# Router + Forms architecture

## What came from `comp.zip`

The archive was used as a design reference, not copied verbatim.

### Router

The old router mixed routing with application-specific authorization (`roles`, `default_roles`, `access_levels`, `rolesWithTypes`, `typesReg`, user store/status checks and a fixed `/403`). Those keys are intentionally not part of A&D UI.

The new `Router` is TypeScript-first and only knows:

- `path`
- `element`
- `redirectTo`
- optional `access(context)` predicate
- optional `denied`

Authorization policy belongs to the consuming application. The router only executes a supplied predicate.

### Forms

The old `getFormik` inspired the form lifecycle: initial values, reinitialization, validation, submit and field binding. The new `useForm` does not require Formik and keeps the UI package dependency-free.

### Declarative Fields

The old `RenderFormikFields` inspired `FormFields`: schema -> registry -> responsive `Grid` -> field. Business-specific MUI components were not carried over.

Built-in kinds:
`text`, `number`, `textarea`, `select`, `autocomplete`, `checkbox`, `switch`.

Applications can extend the registry without changing A&D UI.
