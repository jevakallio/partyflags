import type {
  Party,
  PartyConnection,
  PartyRequest,
  PartyServer,
  PartyServerOptions,
  PartyWorker,
} from "partykit/server";
import type { FlagUpdate, Flags, Scope } from "../types";
import { trace } from "../utils";

type Scopes = Record<string, Scope>;

const GLOBAL_SCOPE = "__global__";

export default class FeatureFlags implements PartyServer {
  scopes: Scopes = {};
  options: PartyServerOptions = {
    hibernate: true,
  };

  constructor(readonly party: Party) {}

  async onStart() {
    // load scopes from storage
    this.scopes = (await this.party.storage.get<Scopes>("scopes")) ?? {};
  }

  async onConnect(connection: PartyConnection) {
    trace("Flags:scope-connected", this.party.id, connection.id);
    // immediately send flags to connecting client as part of handshake
    const flags = this.getFlags(connection.id);
    connection.send(JSON.stringify({ flags } satisfies FlagUpdate));
  }

  async onClose(connection: PartyConnection) {
    trace("Flags:scope-disconnected", this.party.id, connection.id);
  }

  async onRequest(req: PartyRequest) {
    const scopeId = req.headers.get("X-Scope") ?? GLOBAL_SCOPE;

    if (req.method === "GET") {
      // TODO: Better way to pass parameters than custom headers

      if (req.headers.get("X-Scope-List")) {
        trace("Flags:get-scope-list", this.party.id);
        return new Response(JSON.stringify(this.scopes));
      }

      if (scopeId) {
        trace("Flags:get-scope-flags", this.party.id, scopeId);
        return new Response(JSON.stringify(this.getFlags(scopeId)));
      } else {
        trace("Flags:get-global-flags", this.party.id);
        return new Response(JSON.stringify(this.getFlags(GLOBAL_SCOPE)));
      }
    }

    if (req.method === "POST") {
      trace("Flags:update-flags", this.party.id, scopeId);
      const update = await req.json<FlagUpdate>();
      await this.setFlags(scopeId, update.flags);
      return new Response("OK", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }

  getFlags(scopeId: string) {
    const globalFlags = this.scopes[GLOBAL_SCOPE]?.flags ?? {};
    if (scopeId === GLOBAL_SCOPE) {
      return globalFlags;
    }

    return {
      ...globalFlags,
      ...(this.scopes[scopeId]?.flags ?? {}),
    };
  }

  async setFlags(scopeId: string, flags: Flags) {
    const scope = this.scopes[scopeId];
    const now = new Date().toISOString();

    // update local state
    if (scope) {
      scope.updatedAt = now;
      scope.flags = { ...scope.flags, ...flags };
    } else {
      this.scopes[scopeId] = {
        scopeId,
        createdAt: now,
        updatedAt: now,
        flags,
      };
    }

    // store state
    await this.party.storage.put("scopes", this.scopes);

    // notify listeners
    await this.notifyConnectedScopes(scopeId, flags);
  }

  async notifyConnectedScopes(updatedScopeId: string, flags: Flags) {
    if (updatedScopeId === GLOBAL_SCOPE) {
      trace("Flags:broadcast-global-flags", this.party.id);
      // broadcast global scope updates to all connections
      for (const connection of this.party.getConnections()) {
        connection.send(
          JSON.stringify({
            flags: this.getFlags(connection.id),
          } satisfies FlagUpdate)
        );
      }
    } else {
      trace("Flags:broadcast-scope-flags", this.party.id);
      // send specific scope update to that scope, if connected
      const connection = this.party.getConnection(updatedScopeId);
      if (connection) {
        trace("Flags:send-scope-flags", this.party.id);
        connection.send(
          JSON.stringify({
            flags: this.getFlags(updatedScopeId),
          } satisfies FlagUpdate)
        );
      }
    }
  }
}

FeatureFlags satisfies PartyWorker;
