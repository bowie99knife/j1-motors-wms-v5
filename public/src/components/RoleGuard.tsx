import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/useSession";
import type { StaffRole } from "../lib/types";

export default function RoleGuard({
  allowed, children
}: { allowed: StaffRole[]; children: ReactNode }) {
  const { profile, loading } = useSession();
  if (loading) return <div className="panel">Loading…</div>;
  if (!profile || !allowed.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return children;
}