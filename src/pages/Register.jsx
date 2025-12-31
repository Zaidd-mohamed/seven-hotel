import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseErrorMessage } from "../firebase/authService";

export default function Register() {
  const { register, dashboardPath } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      await register({ name, email, password });
      navigate(dashboardPath(), { replace: true });
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="max-w-md mx-auto card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Seven
          </p>
          <h1 className="mt-2 font-heading text-3xl">Register</h1>
          <p className="mt-3 text-sm text-white/70">
            Create your account (role defaults to guest).
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label-luxe">Name</label>
              <input
                className="input-luxe"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="label-luxe">Email</label>
              <input
                type="email"
                className="input-luxe"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label-luxe">Password</label>
              <input
                type="password"
                className="input-luxe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button disabled={busy} className="gold-solid-btn w-full">
              {busy ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/60">
            Already have an account?{" "}
            <Link className="text-gold hover:underline" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
