export type Flags = Record<string, boolean | string | number>;
export type FlagScope = "zone" | "base";

export type FlagUpdate =
  | { flags: Flags; scope: "base" }
  | {
      flags: Flags;
      scope: "zone";
      zoneId: string;
    };

export type FlagSyncMessage = {
  type: "sync";
  flags: Flags;
};
