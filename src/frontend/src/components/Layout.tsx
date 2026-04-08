import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isResultPage = currentPath === "/result";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header — game UI style */}
      <header
        className="sticky top-0 z-50 bg-card border-b border-border shadow-elevated"
        data-ocid="app-header"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.03 270) 0%, oklch(0.14 0.02 260) 100%)",
          borderBottom: "2px solid oklch(var(--primary) / 0.4)",
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: back or fruit icon */}
          <div className="w-10 flex items-center">
            {isResultPage ? (
              <Link to="/draw">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-foreground hover:bg-secondary/20 transition-smooth"
                  aria-label="Back to drawing"
                  data-ocid="btn-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-elevated"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--secondary)))",
                  boxShadow:
                    "0 0 12px oklch(var(--primary) / 0.5), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                🍑
              </div>
            )}
          </div>

          {/* Center: App name */}
          <Link
            to="/draw"
            className="flex items-center gap-2 select-none"
            data-ocid="nav-logo"
          >
            <span
              className="font-display font-black text-2xl tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 8px oklch(var(--primary) / 0.4))",
              }}
            >
              Fruit Forge
            </span>
            <span
              className="text-xs font-display font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(var(--secondary))",
                color: "oklch(var(--secondary-foreground))",
              }}
            >
              ⚡ AI
            </span>
          </Link>

          {/* Right: spacer for symmetry */}
          <div className="w-10" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col" data-ocid="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border py-3 px-4 text-center"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.02 260) 0%, oklch(0.11 0.015 260) 100%)",
          borderTop: "1px solid oklch(var(--border))",
        }}
        data-ocid="app-footer"
      >
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-200"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
