// import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs } from "partymix";
import { FeatureToggle } from "~/components/FeatureToggle";
import type { ScopeList } from "~/types";

export const loader = async ({ params, context }: DataFunctionArgs) => {
  if (!params.project) {
    throw new Error(":project parameters not found");
  }

  // TODO: dedupe with main.ts
  const scopes = await context.lobby.parties.flags
    .get(params.project)
    .fetch({ method: "GET", headers: { "X-Scope-List": "1" } })
    .then((res) => res.json());

  return scopes as ScopeList;
};

export default function ProjectPage() {
  const { global, scopes } = useLoaderData<typeof loader>();
  const keys = Object.keys(global.flags);
  return (
    <main className="mx-auto max-w-4xl p-4">
      <div className="flex flex-col space-y-2">
        {keys.map((key) => (
          <FeatureToggle
            key={key}
            name={key}
            value={global.flags[key]}
            scopes={scopes}
          />
        ))}
      </div>

      <pre>{JSON.stringify(global, null, 2)}</pre>
      <pre>{JSON.stringify(scopes, null, 2)}</pre>
    </main>
  );
}
