"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  createStorageKeys,
  type DevConsoleConfig,
  type DevConsoleStorageKeys,
} from "./config";

type DevConsoleContextValue = DevConsoleConfig & {
  keys: DevConsoleStorageKeys;
};

const DevConsoleContext = createContext<DevConsoleContextValue | null>(null);

export function DevConsoleProvider({
  config,
  children,
}: {
  config: DevConsoleConfig;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ ...config, keys: createStorageKeys(config.storagePrefix) }),
    [config],
  );
  return (
    <DevConsoleContext.Provider value={value}>{children}</DevConsoleContext.Provider>
  );
}

export function useDevConsoleConfig(): DevConsoleContextValue {
  const ctx = useContext(DevConsoleContext);
  if (!ctx) {
    throw new Error("useDevConsoleConfig は DevConsoleProvider 内で使ってください");
  }
  return ctx;
}
