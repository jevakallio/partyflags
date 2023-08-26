import type {
  Party,
  PartyLobby,
  PartyRequest,
  PartyServer,
  PartyWorker,
} from "partykit/server";
import type { FlagUpdate, Flags } from "./types";

const route = (req: PartyRequest, lobby: PartyLobby) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user");

  if (!userId) {
    return req;
  }

  // @ts-expect-error fix request type compatibility
  return lobby.parties.user.get(`${lobby.id}:${userId}`).fetch(req);
};

export default class FeatureFlags implements PartyServer {
  flags: Flags = {};

  constructor(readonly party: Party) {}

  static onBeforeRequest(req: PartyRequest, lobby: PartyLobby) {
    // route get requests to the nearest user
    if (req.method === "GET") {
      return route(req, lobby);
    }

    return req;
  }

  static onBeforeConnect(req: PartyRequest, lobby: PartyLobby) {
    // route websocket connections to the nearest user
    return route(req, lobby);
  }

  async onRequest(req: PartyRequest) {
    // GET: return current flags
    if (req.method === "GET") {
      return new Response(JSON.stringify(this.flags));
    }

    // POST: update flags
    if (req.method === "POST") {
      const update = await req.json<FlagUpdate>();
      // update flags in target user
      if (update.scope === "user") {
        const userId = `${this.party.id}:${update.userId}`;
        const user = this.party.context.parties.user.get(userId);
        // @ts-expect-error fix request type compatibility
        return user.fetch({
          ...req,
          method: "POST",
          body: JSON.stringify(update),
        });
      }

      if (update.scope === "base") {
        // update flags in base user
        this.setFlags(update.flags);
        return new Response("OK", { status: 200 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }

  async onStart() {
    this.flags = (await this.party.storage.get<Flags>("flags")) ?? {};
  }

  async setFlags(flags: Flags) {
    this.flags = { ...this.flags, ...flags };
    return this.party.storage.put("flags", this.flags);
  }
}

FeatureFlags satisfies PartyWorker;
