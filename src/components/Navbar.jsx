import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "../firebase/firebase";

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, userProfile, loading, logout, dashboardPath } = useAuth();

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Scroll background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load recent notifications
  useEffect(() => {
    async function loadNotifications() {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(items);
        setHasUnread(items.some((n) => n.status !== "READ"));
      } catch (e) {
        // silently fail (index errors shouldn't break navbar)
        console.error("Notifications load failed", e);
      }
    }

    loadNotifications();
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function onLogout() {
    await logout();
    navigate("/");
  }

  const barClass =
    "fixed top-0 left-0 right-0 z-50 transition " +
    (scrolled
      ? "bg-ink/85 backdrop-blur border-b border-white/10"
      : "bg-transparent");

  return (
    <header className={barClass}>
      <div className="container-x h-16 flex items-center justify-between">
        {/* Logo */}
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

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          {!loading && currentUser && (
            <div className="relative" ref={notifRef}>
              {/* Bell */}
              <button
                className="relative gold-outline-btn px-3"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
              >
                🔔
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gold" />
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-white/10 bg-ink/95 backdrop-blur shadow-xl">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Notifications
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="p-4 text-sm text-white/60">
                        No notifications yet.
                      </p>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => {
                          navigate("/guest/notifications");
                          setNotifOpen(false);
                        }}
                      >
                        <p className="text-sm text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 text-center">
                    <Link
                      to="/guest/notifications"
                      className="text-xs text-gold hover:underline"
                      onClick={() => setNotifOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !currentUser && (
            <>
              <Link className="gold-outline-btn" to="/login">
                Login
              </Link>
              <Link className="gold-solid-btn" to="/register">
                Register
              </Link>
            </>
          )}

          {!loading && currentUser && (
            <>
              <Link className="gold-outline-btn" to={dashboardPath()}>
                Dashboard
              </Link>
              <button className="gold-solid-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="lg:hidden gold-outline-btn px-4 py-2"
          onClick={() => setOpen((v) => !v)}
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

            <div className="pt-2 flex flex-col gap-3">
              {!loading && !currentUser && (
                <>
                  <Link className="gold-solid-btn w-full" to="/login">
                    Login
                  </Link>
                  <Link className="gold-outline-btn w-full" to="/register">
                    Register
                  </Link>
                </>
              )}

              {!loading && currentUser && (
                <>
                  <Link className="gold-solid-btn w-full" to={dashboardPath()}>
                    Dashboard
                  </Link>
                  <Link
                    className="gold-outline-btn w-full"
                    to="/guest/notifications"
                  >
                    Notifications
                  </Link>
                  <button className="gold-outline-btn w-full" onClick={onLogout}>
                    Logout
                  </button>
                  <p className="text-xs text-white/50">
                    Signed in as {userProfile?.email}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
