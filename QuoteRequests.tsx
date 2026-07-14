import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { configured, supabase } from "../lib/supabase";
import { demoLogin } from "../lib/demoAuth";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!configured) {
      const profile = demoLogin(staffId, password);
      if (!profile) {
        setMessage("Invalid Staff ID or password.");
        return;
      }
      navigate("/dashboard");
      return;
    }

    const email = `${staffId.trim().toLowerCase()}@j1motors.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("Invalid Staff ID or password.");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <form className="login panel" onSubmit={login}>
      <span className="brandMark large">J1</span>
      <h1>Staff Portal</h1>
      <p>Authorised personnel only</p>
      <label>
        Staff ID
        <input
          required
          autoCapitalize="characters"
          value={staffId}
          onChange={(event) => setStaffId(event.target.value.toUpperCase())}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button className="primary">Sign in</button>
      {message && <p className="notice">{message}</p>}
    </form>
  );
}
