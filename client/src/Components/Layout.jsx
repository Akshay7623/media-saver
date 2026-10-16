import { Outlet, ScrollRestoration } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-fg"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* New pages start at the top; Back returns to where you were. Links
          like /#faq scroll to that section. */}
      <ScrollRestoration />
    </div>
  );
}
