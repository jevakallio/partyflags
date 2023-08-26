import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs, V2_MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import type { Flags } from "~/types";

const PARTYKIT_HOST = "localhost:1999";
const scope = "test-room:jevakallio";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Partymix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ context }: DataFunctionArgs): Promise<Flags> {
  return context.lobby.parties.scope
    .get(scope)
    .fetch({ method: "GET" })
    .then((res) => res.json());
}

const App = () => {
  const serverFlags = useLoaderData<typeof loader>();
  const [flags, setFlags] = useState<Flags>(serverFlags);

  usePartySocket({
    host: PARTYKIT_HOST,
    room: scope,
    party: "scope",
    onMessage(event) {
      setFlags(JSON.parse(event.data));
    },
  });

  return <pre>{JSON.stringify(flags, null, 2)}</pre>;
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>🎈 PartyKit ⤫ Remix 💿 </h1>
      <App />
    </div>
  );
}
