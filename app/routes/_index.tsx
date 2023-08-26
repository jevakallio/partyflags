import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs, V2_MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import type { Flags } from "~/types";

declare const PARTYKIT_HOST: string;
const scope = "test-room:jevakallio";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Partymix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request, context }: DataFunctionArgs): Promise<{
  host: string;
  room: string;
  party: string;
  initial: Flags;
}> {
  return {
    host: PARTYKIT_HOST,
    room: scope,
    party: "scope",
    initial: await context.lobby.parties.scope
      .get(scope)
      .fetch({ method: "GET" })
      .then((res) => res.json()),
  };
}

const useFeatureFlags = () => {
  const { host, room, party, initial } = useLoaderData<typeof loader>();
  const [flags, setFlags] = useState<Flags>(initial);
  usePartySocket({
    host,
    room,
    party,
    onMessage(event) {
      setFlags(JSON.parse(event.data));
    },
  });
  return flags;
};

const App = () => {
  const flags = useFeatureFlags();
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
