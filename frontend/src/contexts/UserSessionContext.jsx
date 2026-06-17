import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const SESSION_KEY = "gadgetmarket_session";
const ROLE_KEY = "gadgetmarket_role";

const UserSessionContext = createContext(null);

export function UserSessionProvider({ children }) {
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? Number(saved) : null;
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem(ROLE_KEY) || null;
  });
  const [lastListingId, setLastListingId] = useState(null);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(SESSION_KEY, String(userId));
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ROLE_KEY);
      setUserRole(null);
    }
  }, [userId]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem(ROLE_KEY, userRole);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  }, [userRole]);

  useEffect(() => {
    if (!userId) {
      setUserRole(null);
      return;
    }
    let alive = true;
    async function checkSession() {
      try {
        const data = await api.getMe();
        if (alive) {
          setUserRole(data.role);
        }
      } catch (e) {
        if (alive) {
          setUserId(null);
        }
      }
    }
    checkSession();
    return () => { alive = false; };
  }, [userId]); 

  const value = useMemo(
    () => ({
      userId,
      setUserId,
      userRole,
      setUserRole,
      lastListingId,
      setLastListingId
    }),
    [userId, userRole, lastListingId]
  );

  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>;
}

export function useUserSession() {
  const ctx = useContext(UserSessionContext);
  if (!ctx) {
    throw new Error("useUserSession must be used within UserSessionProvider");
  }
  return ctx;
}