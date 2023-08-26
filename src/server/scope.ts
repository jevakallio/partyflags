import type {
  Party,
  PartyConnection,
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
  socket: PartySocket;

  constructor(readonly party: Party) {
    const [projectId, scopeId] = party.id.split(":");
    this.projectId = projectId;
    this.scopeId = scopeId;

    // create a socket to listen for flag updates
    this.socket = new PartySocket({
      id: this.scopeId,
      host: "localhost:1999",
      party: "flags",
      room: this.projectId,
      startClosed: true,
    });
    this.socket.addEventListener("message", this.handleFlagUpdateEvent);
  }

  onStart(): Promise<void> {
    // wait for flags to sync before allowing connections
    return new Promise((resolve) => {
      const connect = () => {
        trace("Scope:connected", this.projectId, this.scopeId, this.socket.url);
        this.socket.removeEventListener("connect", sync);
      };

      const sync = () => {
        trace("Scope:synced", this.projectId, this.scopeId, this.socket.url);
        this.socket.removeEventListener("message", sync);
        resolve();
      };

      this.socket.addEventListener("connect", connect);
      this.socket.addEventListener("message", sync);
      this.socket.reconnect();
    });
  }

  onRequest(req: PartyRequest) {
    if (req.method === "GET") {
      return new Response(JSON.stringify(this.flags));
    }

    return new Response("Not found", { status: 404 });
  }

  // handle client connecting to this party
  onConnect(connection: PartyConnection) {
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
    trace("Scope:updated", this.projectId, this.scopeId, this.socket.url);
    this.setFlags(JSON.parse(event.data));
    this.party.broadcast(JSON.stringify(this.flags));
  };

  setFlags(update: FlagUpdate) {
    this.flags = update.flags;
    this.party.storage.put("flags", this.flags);
  }
}

ScopeFlags satisfies PartyWorker;
