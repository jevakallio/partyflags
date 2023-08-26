import type {
  Party,
  PartyRequest,
  PartyServer,
  PartyWorker,
} from "partykit/server";
import type { Flags, FlagScope, FlagUpdate } from "./types";

const getBaseId = (zoneId: string) => {
  return zoneId.split(":")[0];
};

export default class FeatureFlagZone implements PartyServer {
  base: Flags = {};
  zone: Flags = {};

  getFlags() {
    return { ...this.base, ...this.zone };
  }

  async saveFlags(scope: FlagScope, flags: Flags) {
    this[scope] = { ...this[scope], ...flags };
    return this.party.storage.put(scope, this[scope]);
  }

  constructor(readonly party: Party) {}

  async onStart() {
    // TODO: keep base flags in sync
    let base = await this.party.storage.get<Flags>("base");
    if (base === undefined) {
      const baseId = getBaseId(this.party.id);
      const baseParty = this.party.context.parties.main.get(baseId);
      const baseResponse = await baseParty.fetch({
        method: "GET",
      });
      if (baseResponse.ok) {
        base = (await baseResponse.json()) as Flags;
      }
    }

    this.base = base ?? {};
    this.zone = (await this.party.storage.get<Flags>("zone")) ?? {};
  }

  async onRequest(req: PartyRequest) {
    // GET: return current flags
    if (req.method === "GET") {
      return new Response(JSON.stringify(this.getFlags()));
    }

    // POST: update flags
    if (req.method === "POST") {
      const update = await req.json<FlagUpdate>();
      this.saveFlags(update.scope, update.flags);
      return new Response("OK", { status: 200 });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}

FeatureFlagZone satisfies PartyWorker;
