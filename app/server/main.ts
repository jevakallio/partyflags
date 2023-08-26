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

api.get("/flags/:project", async (c) => {
  const id = c.req.param("project");
  return c.env.parties.flags.get(id).fetch({ method: "GET" });
});

api.post("/flags/:project", async (c) => {
  const id = c.req.param("project");
  return c.env.parties.flags
    .get(id)
    .fetch({ method: "POST", body: c.req.body });
});

api.get("/flags/:project/:scope", async (c) => {
  return c.env.parties.flags.get(c.req.param("project")).fetch({
    method: "GET",
    headers: {
      "X-Scope": c.req.param("scope"),
    },
  });
});

api.post("/flags/:project/:scope", async (c) => {
  return c.env.parties.flags.get(c.req.param("project")).fetch({
    method: "POST",
    body: c.req.body,
    headers: {
      "X-Scope": c.req.param("scope"),
    },
  });
});

api.get("/scopes/:project", async (c) => {
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

const handleRemixRequest = createRequestHandler({ build });

export default class FeatureFlagServer implements PartyServer {
  static onFetch(
    req: PartyRequest,
    lobby: PartyFetchLobby,
    ctx: PartyExecutionContext
  ) {
    const url = new URL(req.url);
    console.log(url.hostname);
    if (url.hostname.startsWith("api/")) {
      return api.fetch(req as unknown as Request, lobby, ctx);
    } else {
      return handleRemixRequest(req, lobby, ctx);
    }
  }
}

FeatureFlagServer satisfies PartyWorker;
