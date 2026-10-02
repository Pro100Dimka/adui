import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function CardExample(){return <U.Grid minChildWidth="14rem" gap={3}>{(["card","glass","ruby","tile"] as const).map(material=><U.Card key={material} material={material} title={material} icon="music" border={material==="ruby"}><U.Typography tone="muted">Один Card вместо Surface и AnimatedBorder.</U.Typography></U.Card>)}</U.Grid>}
