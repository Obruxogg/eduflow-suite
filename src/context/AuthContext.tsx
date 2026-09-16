import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "professor" | null;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: AppRole;
  fullName: string;
  authLoading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<AppRole>(null);
  const [fullName, setFullName] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  const loadProfile = useMemo(
    () => async (id: string) => {
      setRoleLoading(true);
      try {
        const [{ data: roleRows }, { data: profile }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", id),
          supabase.from("profiles").select("full_name").eq("id", id).maybeSingle(),
        ]);
        const roles = (roleRows ?? []).map((r) => r.role);
        setRole(roles.includes("admin") ? "admin" : roles.includes("professor") ? "professor" : null);
        setFullName(profile?.full_name ?? "");
      } finally {
        setRoleLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setFullName("");
      return;
    }
    void loadProfile(userId);
  }, [userId, loadProfile]);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    role,
    fullName,
    authLoading,
    roleLoading,
    signOut: async () => {
      await supabase.auth.signOut();
      setRole(null);
      setFullName("");
    },
    refresh: async () => {
      if (userId) await loadProfile(userId);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
