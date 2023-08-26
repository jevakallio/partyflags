import { Hono } from "hono";
import type {
  PartyExecutionContext,
  PartyLobby,
  PartyRequest,
  PartyWorker,
} from "partykit/server";

export const api = new Hono<{ Bindings: PartyLobby }>();

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

export default class FeatureFlagServer {
  static async onFetch(
    req: PartyRequest,
    lobby: PartyLobby,
    ctx: PartyExecutionContext
  ) {
    return api.fetch(req as unknown as Request, lobby, ctx);
  }
}

FeatureFlagServer satisfies PartyWorker;
