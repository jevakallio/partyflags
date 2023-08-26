/// <reference types="@remix-run/dev" />

import type { PartyFetchLobby } from "partykit/server";

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    lobby: PartyFetchLobby;
  }
}
