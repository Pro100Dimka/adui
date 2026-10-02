import fs from "node:fs";
const app = fs.readFileSync("apps/playground/src/App.tsx", "utf8"),
  router = fs.readFileSync(
    "packages/ui/src/components/navigation/Router/Router.tsx",
    "utf8",
  ),
  forms = fs.readFileSync(
    "packages/ui/src/components/forms/FormFields/FormFields.tsx",
    "utf8",
  );
const banned = [
  "rolesWithTypes",
  "default_roles",
  "access_levels",
  "typesReg",
  "fk_user_types_reg",
  "disabledSiteStatuses",
];
const all = [app, router, forms].join("\n");
const errors = [];
if (!app.includes("<Router routes={routes}"))
  errors.push("playground does not use A&D Router");
if (app.includes("hashchange") || app.includes("location.hash||"))
  errors.push("legacy manual hash router remains in App");
for (const key of banned)
  if (all.includes(key)) errors.push(`legacy restriction key remains: ${key}`);
if (!forms.includes("defaultFieldRegistry"))
  errors.push("FormFields registry missing");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Router + Forms architecture OK");
