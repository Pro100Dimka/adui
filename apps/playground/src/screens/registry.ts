import type { ScreenId, ScreenDefinition, ScreenHandle } from "./types"; import type { VectorNode } from "@ad-voice/ui/core";
import settings from "./settings";
import join from "./join";
import room from "./room";
import room_full from "./room-full";
import analysis from "./analysis";
import performances from "./performances";
import queue from "./queue";
import editor from "./editor";
type Item={definition:ScreenDefinition;assets:Record<string,VectorNode>;css:string;init:(ctx:ScreenHandle)=>void};
export const screenRegistry:Record<ScreenId,Item>={
  "settings": settings,
  "join": join,
  "room": room,
  "room-full": room_full,
  "analysis": analysis,
  "performances": performances,
  "queue": queue,
  "editor": editor,
};
