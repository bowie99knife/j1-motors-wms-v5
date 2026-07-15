import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/useSession";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useSession();
  if (loading) return <div className="panel">Loading…</div>;
  if (!authenticated) return <Navigate to="/staff" replace />;
  return children;
}
