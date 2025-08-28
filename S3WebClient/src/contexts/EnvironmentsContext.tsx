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
    const visible = await environmentRepository.getVisible();
    const all = await environmentRepository.getAll({ includeHidden: true });
    setEnvironments(visible);
    setAllEnvironments(all);
  };

  useEffect(() => {
    load();
  }, []);

  // Ensure at least one environment exists on startup
  useEffect(() => {
    (async () => {
      try {
        const all = await environmentRepository.getAll({ includeHidden: true });
        if (all.length === 0) {
          await environmentRepository.add({
            key: "dev",
            name: "Development",
            color: "success",
            colorHex: "#2e7d32",
            hidden: 0,
          });
          await load();
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    await load();
  };

  const add: EnvironmentsContextValue["add"] = async (env) => {
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
