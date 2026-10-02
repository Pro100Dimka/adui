import type { ScreenDefinition, ScreenHandle } from "../types";
import type { VectorNode } from "../types";
import definition from "./layout.json"; import assets from "./artwork.json"; import css from "./styles.css?inline"; import init from "./controller.js";
export default { definition: definition as unknown as ScreenDefinition, assets: assets as unknown as Record<string, VectorNode>, css, init: init as (ctx: ScreenHandle)=>void };
