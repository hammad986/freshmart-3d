import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="form-card auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="meta">It takes less than a minute.</p>
        {error && <div className="flash flash-error">{error}</div>}
        <label>Full name<input required autoFocus value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>Confirm password<input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        <button className="btn btn-large btn-block" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Sign up"}
        </button>
        <p className="auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
