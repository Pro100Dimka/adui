import { BooleanControl, type BooleanProps } from "../shared";

export const Checkbox = (p: BooleanProps) => (
  <BooleanControl kind="Checkbox" {...p} />
);
