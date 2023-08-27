// import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs } from "partymix";
import { useMemo, useState } from "react";
import { FeatureToggle } from "~/components/FeatureToggle";
import { ScopePicker } from "~/components/ScopePicker";
import type { Scope, ScopeList } from "~/types";

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
  const [currentScope, setCurrentScope] = useState<Scope>(global);
  const scopeOptions = useMemo(() => {
    return [
      { id: global.scopeId, label: "Global" },
      ...scopes.map((scope) => ({
        id: scope.scopeId,
        label: scope.scopeId,
      })),
    ];
  }, [global, scopes]);

  const keys = Object.keys(global.flags);
  return (
    <main className="mx-auto max-w-4xl p-4 flex flex-col space-y-6">
      <div className="flex">
        <ScopePicker
          scopes={scopeOptions}
          value={currentScope.scopeId}
          setValue={(id) => {
            console.log("id", id);
            setCurrentScope(
              scopes.find((scope) => scope.scopeId === id) ?? global
            );
          }}
        />
      </div>
      <div className="flex flex-col space-y-2">
        {keys.map((key) => (
          <FeatureToggle
            key={currentScope.scopeId + key}
            name={key}
            value={currentScope.flags[key]}
            baseValue={global.flags[key]}
          />
        ))}
      </div>

      <pre>{JSON.stringify(currentScope, null, 2)}</pre>
    </main>
  );
}
