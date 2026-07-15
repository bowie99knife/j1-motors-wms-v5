import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { configured, supabase } from "./supabase";
import type { Profile } from "./types";
import { getDemoProfile } from "./demoAuth";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(
    configured ? null : getDemoProfile(),
  );
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      const syncDemo = () => {
        setProfile(getDemoProfile());
        setLoading(false);
      };
      syncDemo();
      window.addEventListener("j1-demo-auth", syncDemo);
      window.addEventListener("storage", syncDemo);
      return () => {
        window.removeEventListener("j1-demo-auth", syncDemo);
        window.removeEventListener("storage", syncDemo);
      };
    }

    async function sync(next: Session | null) {
      setSession(next);
      if (!next) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", next.user.id)
        .single();
      setProfile(data as Profile | null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => sync(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return {
    session,
    profile,
    loading,
    authenticated: configured ? Boolean(session) : Boolean(profile),
  };
}
