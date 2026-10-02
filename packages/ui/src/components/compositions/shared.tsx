import type { CommonProps } from "../../core/base";
export interface RoleEmblemProps extends CommonProps {
  role?: "host" | "guest";
}
export interface ParticipantCardProps extends CommonProps {
  name?: string;
  role?: "host" | "guest";
  volume?: number;
  onVolumeChange?: (v: number) => void;
  muted?: boolean;
  onMuteChange?: (v: boolean) => void;
}
