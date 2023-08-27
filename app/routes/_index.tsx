import type { V2_MetaFunction } from "partymix";
import {
  featureFlagLoader,
  useFeatureFlagsWithLoader,
} from "~/hooks/useFeatureFlags";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Partymix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = featureFlagLoader;

export default function Index() {
  const flags = useFeatureFlagsWithLoader();
  return (
    <main
      className="mx-auto max-w-4xl p-4"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <h1 className="text-4xl font-bold">Feature Flags ⛳️ </h1>
      <pre>{JSON.stringify(flags, null, 2)}</pre>
    </main>
  );
}
