import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="max-w-md mx-auto card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Seven
          </p>
          <h1 className="mt-2 font-heading text-3xl">Register</h1>
          <p className="mt-3 text-sm text-white/70">
            UI only — account creation comes in Phase 2.
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
              Create Account
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
