import type {
  Party,
  PartyConnection,
  PartyConnectionContext,
  PartyLobby,
  PartyRequest,
  PartyServer,
  PartyWorker,
} from "partykit/server";
import type { FlagUpdate, Flags } from "./types";

const route = (req: PartyRequest, lobby: PartyLobby) => {
  const url = new URL(req.url);
  const zoneId = url.searchParams.get("zone");

  if (!zoneId) {
    return req;
  }

  // @ts-expect-error fix request type compatibility
  return lobby.parties.zone.get(`${lobby.id}:${zoneId}`).fetch(req);
};

export default class FeatureFlag implements PartyServer {
  flags: Flags = {};

  constructor(readonly party: Party) {}

  static onBeforeRequest(req: PartyRequest, lobby: PartyLobby) {
    // route get requests to the nearest zone
    if (req.method === "GET") {
      return route(req, lobby);
    }
    return req;
  }

  static onBeforeConnect(req: PartyRequest, lobby: PartyLobby) {
    // route websocket connections to the nearest zone
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
      // update flags in target zone
      if (update.scope === "zone") {
        const zone = this.party.context.parties.zones.get(update.zoneId);
        // @ts-expect-error fix request type compatibility
        return zone.fetch(req);
      }

      if (update.scope === "base") {
        // update flags in base zone
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

FeatureFlag satisfies PartyWorker;
