import { Link, useNavigate } from "react-router-dom";
import { configured, supabase } from "../lib/supabase";
import { useSession } from "../lib/useSession";
import { demoLogout } from "../lib/demoAuth";

export default function Dashboard() {
  const { profile } = useSession();
  const navigate = useNavigate();
  if (!profile) return null;

  const admin = profile.role === "admin";

  async function logout() {
    if (configured) await supabase.auth.signOut();
    else demoLogout();
    navigate("/staff");
  }

  return (
    <section>
      <div className="dashboardHead">
        <div>
          <span className="eyebrow">{profile.role.replaceAll("_", " ")}</span>
          <h1>Welcome, {profile.full_name}</h1>
        </div>
        <div className="actions">
          <button className="secondary" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="dashboardGrid">
        <Link className="dashCard" to="/dashboard/bookings">
          <h3>Bookings</h3>
          <p>View customer appointments.</p>
        </Link>
        <Link className="dashCard" to="/dashboard/jobs">
          <h3>Job Cards</h3>
          <p>Create, upload and update workshop jobs.</p>
        </Link>
        {admin && (
          <Link className="dashCard admin" to="/dashboard/quotes">
            <h3>Quote Requests</h3>
            <p>Admin access only.</p>
          </Link>
        )}
        {admin && (
          <Link className="dashCard admin" to="/dashboard/revenue">
            <h3>Revenue</h3>
            <p>Admin access only.</p>
          </Link>
        )}
        {admin && (
          <Link className="dashCard admin" to="/dashboard/staff">
            <h3>Staff Management</h3>
            <p>Manage staff access.</p>
          </Link>
        )}
      </div>
    </section>
  );
}
