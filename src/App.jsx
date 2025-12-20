import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
