import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ServerArtExample() {
  return (
    <Playground
      knobs={{ upload: { value: false } }}
      code={(v) =>
        jsx("ServerArt", { label: "Сервер комнат", upload: v.upload })
      }
    >
      {(v) => <U.ServerArt label="Сервер комнат" upload={v.upload} />}
    </Playground>
  );
}
