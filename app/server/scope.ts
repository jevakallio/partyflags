import type {
  Party,
  PartyConnection,
  PartyConnectionContext,
  PartyRequest,
  PartyServer,
  PartyWorker,
} from "partykit/server";
import type { Flags, FlagUpdate } from "../types";
import PartySocket from "partysocket";
import { trace } from "../utils";

/**
 * This is the Party that the client connects to.
 * Because the Party is created on connection, it's always created
 * in a CloudFlare location nearest to the user.
 */
export default class ScopeFlags implements PartyServer {
  flags: Flags = {};
  projectId: string;
  scopeId: string;
  socket: PartySocket | undefined;

  constructor(readonly party: Party) {
    const [projectId, scopeId] = party.id.split(":");
    this.projectId = projectId;
    this.scopeId = scopeId;

    trace("Scope:constructor", this.projectId, this.scopeId);
  }

  // TODO: This should be onStart, but we need the request to get the host
  async initialize(request: PartyRequest): Promise<PartySocket> {
    if (this.socket) {
      return this.socket;
    }

    const host = new URL(request.url).host;
    // create a socket to listen for flag updates
    const socket = (this.socket = new PartySocket({
      id: this.scopeId,
      host,
      party: "flags",
      room: this.projectId,
      startClosed: true,
    }));

    socket.addEventListener("message", this.handleFlagUpdateEvent);

    socket.addEventListener("open", () => {
      trace("Scope:opened", this.projectId, this.scopeId);
    });
    socket.addEventListener("close", () => {
      trace("Scope:closed", this.projectId, this.scopeId);
    });
    socket.addEventListener("error", () => {
      trace("Scope:error", this.projectId, this.scopeId);
    });

    trace("Scope:onStart", this.projectId, this.scopeId);

    // wait for flags to sync before allowing connections
    return new Promise((resolve) => {
      const connect = () => {
        trace("Scope:connected", this.projectId, this.scopeId, socket.url);
        socket.removeEventListener("connect", sync);
      };

      const sync = () => {
        trace("Scope:synced", this.projectId, this.scopeId, socket.url);
        socket.removeEventListener("message", sync);
        resolve(socket);
      };

      socket.addEventListener("connect", connect);
      socket.addEventListener("message", sync);
      socket.reconnect();
    });
  }

  async onRequest(req: PartyRequest) {
    await this.initialize(req);
    if (req.method === "GET") {
      return new Response(JSON.stringify(this.flags));
    }

    return new Response("Not found", { status: 404 });
  }

  // handle client connecting to this party
  async onConnect(
    connection: PartyConnection,
    context: PartyConnectionContext
  ) {
    await this.initialize(context.request);
    trace(
      "Scope:client-connected",
      this.projectId,
      this.scopeId,
      connection.id
    );
    connection.send(JSON.stringify(this.flags));
  }

  // handle flags updating (only fires when client is connected)
  handleFlagUpdateEvent = (event: WebSocketEventMap["message"]) => {
    trace("Scope:updated", this.projectId, this.scopeId, this.socket?.url);
    this.setFlags(JSON.parse(event.data));
    this.party.broadcast(JSON.stringify(this.flags));
  };

  setFlags(update: FlagUpdate) {
    this.flags = update.flags;
    this.party.storage.put("flags", this.flags);
  }
}

ScopeFlags satisfies PartyWorker;
