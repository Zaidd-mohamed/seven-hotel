import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="max-w-md mx-auto card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Seven
          </p>
          <h1 className="mt-2 font-heading text-3xl">Login</h1>
          <p className="mt-3 text-sm text-white/70">
            UI only — authentication comes in Phase 2.
          </p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="label-luxe">Email</label>
              <input type="email" className="input-luxe" placeholder="you@email.com" />
            </div>
            <div>
              <label className="label-luxe">Password</label>
              <input type="password" className="input-luxe" placeholder="••••••••" />
            </div>

            <button type="button" className="gold-solid-btn w-full">
              Sign In
            </button>
          </form>

          <p className="mt-6 text-sm text-white/60">
            Don’t have an account?{" "}
            <Link className="text-gold hover:underline" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
