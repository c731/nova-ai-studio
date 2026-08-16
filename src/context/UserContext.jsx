import React, { createContext, useCallback, useContext, useState } from 'react';
import { DB } from '../services/db.js';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => DB.currentUser());
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(() => setUser(DB.currentUser()), []);

  const value = {
    user,
    isAdmin,
    setIsAdmin,
    refresh,
    logout() {
      DB.logout();
      setUser(null);
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
