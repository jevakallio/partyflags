export type Flags = Record<string, boolean | string | number>;
export type FlagLevel = "base" | "scope";

export type FlagUpdate = { flags: Flags };

export type FlagSyncMessage = {
  type: "sync";
  flags: Flags;
};

export type Scope = {
  scopeId: string;
  flags: Flags;
  updatedAt: string;
  createdAt: string;
};

export type ScopeList = {
  global: Scope;
  scopes: Scope[];
};
