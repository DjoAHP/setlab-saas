import React, { createContext, useContext } from "react";
import { useSetlabStore } from "../hooks/useSetlabStore";

type StoreType = ReturnType<typeof useSetlabStore>;

const SetlabContext = createContext<StoreType | undefined>(undefined);

export function SetlabProvider({ children }: { children: React.ReactNode }) {
  const store = useSetlabStore();
  return <SetlabContext.Provider value={store}>{children}</SetlabContext.Provider>;
}

export function useSetlab(): StoreType {
  const context = useContext(SetlabContext);
  if (!context) {
    throw new Error("useSetlab doit être utilisé à l'intérieur de SetlabProvider");
  }
  return context;
}
