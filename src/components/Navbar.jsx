import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Hotels", href: "/#hotels" },
  { label: "Dining", href: "/#dining" },
  { label: "Wellness", href: "/#wellness" },
  { label: "Events", href: "/#events" },
  { label: "Offers", href: "/#offers" },
  { label: "About", href: "/#about" },
  { label: "FAQs", href: "/#faqs" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const barClass =
    "fixed top-0 left-0 right-0 z-50 transition " +
    (scrolled
      ? "bg-ink/85 backdrop-blur border-b border-white/10"
      : "bg-transparent");

  return (
    <header className={barClass}>
      <div className="container-x h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl tracking-wide text-gold">
            Seven
          </span>
          <span className="hidden sm:inline text-xs tracking-[0.3em] uppercase text-white/60">
            Hotels & Resorts
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <NavLink className="gold-outline-btn" to="/login">
            Login
          </NavLink>
        </div>

        {/* Mobile Button */}
        <button
          className="lg:hidden gold-outline-btn px-4 py-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-ink/95 backdrop-blur">
          <div className="container-x py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-white/80 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2">
              <NavLink className="gold-solid-btn w-full" to="/login">
                Login
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
