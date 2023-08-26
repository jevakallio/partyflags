export type Flags = Record<string, boolean | string | number>;
export type FlagScope = "user" | "base";

export type FlagUpdate =
  | { flags: Flags; scope: "base" }
  | {
      flags: Flags;
      scope: "user";
      userId: string;
    };

export type FlagSyncMessage = {
  type: "sync";
  flags: Flags;
};
