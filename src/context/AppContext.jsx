import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadState, saveState } from '../data/store.js';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));

  return <AppContext.Provider value={{ state, update }}>{children}</AppContext.Provider>;
}
