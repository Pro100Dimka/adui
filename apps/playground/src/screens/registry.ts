import type {ScreenId,ScreenDefinition,ScreenHandle} from "./types";
import type {VectorNode} from "@ad-voice/ui/core";
import l0 from "./layouts/settings.json";
import a0 from "./artwork/settings.json";
import c0 from "./styles/settings.css?inline";
import init0 from "./controllers/settings.js";
import l1 from "./layouts/join.json";
import a1 from "./artwork/join.json";
import c1 from "./styles/join.css?inline";
import init1 from "./controllers/join.js";
import l2 from "./layouts/room.json";
import a2 from "./artwork/room.json";
import c2 from "./styles/room.css?inline";
import init2 from "./controllers/room.js";
import l3 from "./layouts/room-full.json";
import a3 from "./artwork/room-full.json";
import c3 from "./styles/room-full.css?inline";
import init3 from "./controllers/room-full.js";
import l4 from "./layouts/analysis.json";
import a4 from "./artwork/analysis.json";
import c4 from "./styles/analysis.css?inline";
import init4 from "./controllers/analysis.js";
import l5 from "./layouts/performances.json";
import a5 from "./artwork/performances.json";
import c5 from "./styles/performances.css?inline";
import init5 from "./controllers/performances.js";
import l6 from "./layouts/queue.json";
import a6 from "./artwork/queue.json";
import c6 from "./styles/queue.css?inline";
import init6 from "./controllers/queue.js";
import l7 from "./layouts/editor.json";
import a7 from "./artwork/editor.json";
import c7 from "./styles/editor.css?inline";
import init7 from "./controllers/editor.js";
export const screenRegistry:Record<ScreenId,{definition:ScreenDefinition;assets:Record<string,VectorNode>;css:string;init:(ctx:ScreenHandle)=>void}>={
"settings":{definition:l0 as unknown as ScreenDefinition,assets:a0 as unknown as Record<string,VectorNode>,css:c0,init:init0},
"join":{definition:l1 as unknown as ScreenDefinition,assets:a1 as unknown as Record<string,VectorNode>,css:c1,init:init1},
"room":{definition:l2 as unknown as ScreenDefinition,assets:a2 as unknown as Record<string,VectorNode>,css:c2,init:init2},
"room-full":{definition:l3 as unknown as ScreenDefinition,assets:a3 as unknown as Record<string,VectorNode>,css:c3,init:init3},
"analysis":{definition:l4 as unknown as ScreenDefinition,assets:a4 as unknown as Record<string,VectorNode>,css:c4,init:init4},
"performances":{definition:l5 as unknown as ScreenDefinition,assets:a5 as unknown as Record<string,VectorNode>,css:c5,init:init5},
"queue":{definition:l6 as unknown as ScreenDefinition,assets:a6 as unknown as Record<string,VectorNode>,css:c6,init:init6},
"editor":{definition:l7 as unknown as ScreenDefinition,assets:a7 as unknown as Record<string,VectorNode>,css:c7,init:init7},
};
