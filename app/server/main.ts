import { createRequestHandler, logDevReady } from "partymix";
import * as build from "@remix-run/dev/server-build";
import { Hono } from "hono";
import type {
  PartyExecutionContext,
  PartyRequest,
  PartyWorker,
  PartyFetchLobby,
  PartyServer,
} from "partykit/server";

export const api = new Hono<{ Bindings: PartyFetchLobby }>();

api.get("/api/flags/:project", async (c) => {
  const id = c.req.param("project");
  return c.env.parties.flags.get(id).fetch({ method: "GET" });
});

api.post("/api/flags/:project", async (c) => {
  const id = c.req.param("project");
  return c.env.parties.flags
    .get(id)
    .fetch({ method: "POST", body: c.req.body });
});

api.get("/api/flags/:project/:scope", async (c) => {
  return c.env.parties.flags.get(c.req.param("project")).fetch({
    method: "GET",
    headers: {
      "X-Scope": c.req.param("scope"),
    },
  });
});

api.post("/api/flags/:project/:scope", async (c) => {
  return c.env.parties.flags.get(c.req.param("project")).fetch({
    method: "POST",
    body: c.req.body,
    headers: {
      "X-Scope": c.req.param("scope"),
    },
  });
});

api.get("/api/scopes/:project", async (c) => {
  return c.env.parties.flags.get(c.req.param("project")).fetch({
    method: "GET",
    headers: {
      "X-Scope-List": "1",
    },
  });
});

if (process.env.NODE_ENV === "development") {
  // trigger a reload on the remix dev server
  logDevReady(build);
}

const handleRemixRequest = createRequestHandler({
  build,
  getLoadContext(_req, lobby, _ctx) {
    return { lobby };
  },
});

export default class FeatureFlagServer implements PartyServer {
  static onFetch(
    req: PartyRequest,
    lobby: PartyFetchLobby,
    ctx: PartyExecutionContext
  ) {
    if (new URL(req.url).pathname.startsWith("/api")) {
      return api.fetch(req as unknown as Request, lobby, ctx);
    }

    return handleRemixRequest(req, lobby, ctx);
  }
}

FeatureFlagServer satisfies PartyWorker;
