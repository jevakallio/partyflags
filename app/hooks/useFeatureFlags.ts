import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs } from "partymix";
import usePartySocket from "partysocket/react";
import { useState } from "react";
import type { Flags } from "~/types";

declare const PARTYKIT_HOST: string;

const scope = "test-room:jevakallio";

type FeatureFlagArgs = {
  host: string;
  room: string;
  party: string;
  initial: Flags;
};

export async function featureFlagLoader({
  context,
}: DataFunctionArgs): Promise<FeatureFlagArgs> {
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

export const useFeatureFlags = ({
  host,
  room,
  party,
  initial = {},
}: FeatureFlagArgs) => {
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

export const useFeatureFlagsWithLoader = (
  args: Partial<FeatureFlagArgs> = {}
) => {
  const base = useLoaderData<typeof featureFlagLoader>();
  const flags = useFeatureFlags({ ...base, ...args });
  return flags;
};
