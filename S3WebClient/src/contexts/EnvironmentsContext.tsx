/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Environment, EnvColor } from "../types/env";
import { environmentRepository } from "../repositories";

interface EnvironmentsContextValue {
  environments: Environment[]; // visible environments only
  allEnvironments: Environment[]; // includes hidden
  refresh: () => Promise<void>;
  add: (env: { key: string; name: string; color?: EnvColor; colorHex?: string }) => Promise<void>;
  setHidden: (key: string, hidden: boolean) => Promise<void>;
  findByKey: (key: string) => Environment | undefined;
}

const EnvironmentsContext = createContext<EnvironmentsContextValue>({
  environments: [],
  allEnvironments: [],
  refresh: async () => undefined,
  add: async () => undefined,
  setHidden: async () => undefined,
  findByKey: () => undefined,
});

export const EnvironmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [allEnvironments, setAllEnvironments] = useState<Environment[]>([]);

  const load = async () => {
    let all = await environmentRepository.getAll({ includeHidden: true });
    if (all.length === 0) {
      try {
        await environmentRepository.add({
          key: "dev",
          name: "Development",
          color: "success",
          colorHex: "#2e7d32",
          hidden: 0,
        });
        all = await environmentRepository.getAll({ includeHidden: true });
      } catch {
        // ignore if already created by a concurrent call due to unique index
        all = await environmentRepository.getAll({ includeHidden: true });
      }
    }
    const visible = all.filter((e) => e.hidden === 0);
    setEnvironments(visible);
    setAllEnvironments(all);
  };

  useEffect(() => {
    load();
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    await load();
  };

  const add: EnvironmentsContextValue["add"] = async (env) => {
    // Prevent duplicate by display name (case-insensitive)
    const existing = await environmentRepository.getAll({ includeHidden: true });
    const targetName = env.name.trim().toLowerCase();
    if (existing.some((e) => e.name.trim().toLowerCase() === targetName)) {
      throw new Error("An environment with this name already exists");
    }
    await environmentRepository.add({ ...env, color: env.color ?? "info", hidden: 0 });
    await load();
  };

  const setHidden: EnvironmentsContextValue["setHidden"] = async (key, hidden) => {
    await environmentRepository.updateByKey(key, { hidden: hidden ? 1 : 0 });
    await load();
  };

  const findByKey = (key: string) => allEnvironments.find((e) => e.key === key);

  const value = useMemo<EnvironmentsContextValue>(
    () => ({ environments, allEnvironments, refresh, add, setHidden, findByKey }),
    [environments, allEnvironments]
  );

  return <EnvironmentsContext.Provider value={value}>{children}</EnvironmentsContext.Provider>;
};

export const useEnvironments = () => useContext(EnvironmentsContext);
