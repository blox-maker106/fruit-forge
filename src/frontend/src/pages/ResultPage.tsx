import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Download, RefreshCw, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { FruitDisplay } from "../components/FruitDisplay";
import { useAppContext } from "../context/AppContext";
import type { Generation } from "../types";

// ─── Loading skeleton ───────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div
      className="flex-1 flex flex-col gap-5 p-4 animate-pulse"
      data-ocid="result-loading"
    >
      <Skeleton className="h-5 w-40 rounded-full mx-auto" />
      <Skeleton className="h-64 w-64 rounded-full mx-auto" />
      <Skeleton className="h-4 w-64 rounded-full mx-auto" />
      <div className="flex gap-3 justify-center">
        <Skeleton className="h-11 w-32 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────

function ResultError({
  message,
  onRetry,
}: { message: string; onRetry: () => void }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-center"
      data-ocid="result-error"
    >
      <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center text-5xl">
        😵
      </div>
      <div className="space-y-1">
        <h2 className="font-display font-black text-xl text-foreground">
          Uh oh! Something broke!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs font-body">
          {message}
        </p>
      </div>
      <Button
        onClick={onRetry}
        className="text-white rounded-xl font-black px-6 h-12 shadow-elevated transition-smooth"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--primary)), oklch(0.55 0.22 45))",
        }}
        data-ocid="btn-retry-error"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again!
      </Button>
    </div>
  );
}

// ─── Recent thumbnail strip ───────────────────────────────────────────────────

function RecentThumbnail({ gen }: { gen: Generation }) {
  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden border-2 shadow-subtle"
      style={{
        width: 72,
        height: 72,
        borderColor: "oklch(var(--primary) / 0.5)",
      }}
      data-ocid="recent-thumbnail"
    >
      <FruitDisplay imageUrl={gen.imageUrl} alt={gen.prompt} size="sm" />
    </div>
  );
}

// ─── Main Result Page ─────────────────────────────────────────────────────────

export default function ResultPage() {
  const navigate = useNavigate();
  const { currentGeneration, drawingDataURL, designPrompt } = useAppContext();

  const isLoading =
    !currentGeneration ||
    currentGeneration.status.kind === "pending" ||
    currentGeneration.status.kind === "processing";
  const hasFailed = currentGeneration?.status.kind === "failed";
  const failureMessage = hasFailed
    ? (
        currentGeneration.status as Extract<
          typeof currentGeneration.status,
          { kind: "failed" }
        >
      ).error
    : "";
  const isComplete = currentGeneration?.status.kind === "complete";

  useEffect(() => {
    if (!currentGeneration) {
      void navigate({ to: "/draw" });
    }
  }, [currentGeneration, navigate]);

  const recentGens: Generation[] =
    isComplete && currentGeneration ? [currentGeneration] : [];

  const handleDownload = () => {
    if (!currentGeneration?.imageUrl) return;
    const a = document.createElement("a");
    a.href = currentGeneration.imageUrl;
    a.download = "blox-fruit-design.png";
    a.click();
    toast.success("Saving your Blox Fruit! ⚡🍑");
  };

  const handleShare = async () => {
    const url = currentGeneration?.imageUrl ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Blox Fruit Design — Fruit Forge",
          text: designPrompt || "Check out my awesome Blox Fruit design!",
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied! Share it with your crew! 🏴‍☠️");
    }
  };

  const handleTryAgain = () => {
    void navigate({ to: "/draw" });
  };

  if (isLoading) return <ResultSkeleton />;
  if (hasFailed) {
    return (
      <ResultError
        message={failureMessage || "Generation failed. Please try again!"}
        onRetry={handleTryAgain}
      />
    );
  }
  if (!currentGeneration) return <ResultSkeleton />;

  return (
    <div className="flex-1 flex flex-col gap-0 pb-8" data-ocid="result-page">
      {/* Hero fruit section */}
      <section
        className="flex flex-col items-center gap-4 px-4 pt-6 pb-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, oklch(var(--secondary) / 0.18) 0%, transparent 65%), " +
            "linear-gradient(180deg, oklch(0.14 0.03 280) 0%, oklch(0.1 0.015 260) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <Badge
            variant="outline"
            className="font-display font-bold text-sm border-none px-4 py-1.5"
            style={{
              background:
                "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--secondary)))",
              color: "white",
              boxShadow: "0 0 15px oklch(var(--primary) / 0.4)",
            }}
          >
            ⚡ Your Blox Fruit design is ready!
          </Badge>

          {/* Fruit display */}
          <div className="relative" data-ocid="fruit-display-container">
            <div
              className="absolute -inset-10 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, oklch(var(--secondary) / 0.2) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <FruitDisplay
              imageUrl={currentGeneration.imageUrl}
              alt="Your Blox Fruit design"
              size="lg"
            />
          </div>

          {/* Power level badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              background: "oklch(0.18 0.03 260)",
              borderColor: "oklch(var(--accent) / 0.5)",
            }}
          >
            <span className="text-lg">🔥</span>
            <span
              className="font-display font-black text-sm"
              style={{ color: "oklch(var(--accent))" }}
            >
              LEGENDARY FRUIT UNLOCKED!
            </span>
            <span className="text-lg">🔥</span>
          </div>
        </motion.div>
      </section>

      {/* Details + actions */}
      <section className="px-4 -mt-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card
            className="rounded-2xl border shadow-elevated p-4 space-y-3"
            style={{
              background: "oklch(0.16 0.022 265)",
              borderColor: "oklch(var(--primary) / 0.3)",
            }}
          >
            <div data-ocid="generation-prompt">
              <p
                className="text-xs font-display font-bold mb-1 uppercase tracking-widest"
                style={{ color: "oklch(var(--accent))" }}
              >
                ⚡ Fruit Power
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed">
                {currentGeneration.prompt ||
                  "A mysterious devil fruit with unknown powers…"}
              </p>
            </div>

            {drawingDataURL && (
              <div
                className="flex items-center gap-3 pt-2 border-t"
                style={{ borderColor: "oklch(var(--border))" }}
                data-ocid="original-drawing-thumb"
              >
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border"
                  style={{
                    borderColor: "oklch(var(--primary) / 0.4)",
                    background: "#12103a",
                  }}
                >
                  <img
                    src={drawingDataURL}
                    alt="Your original sketch"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">
                    ✏️ Your sketch
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    The drawing that started it all!
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex gap-3"
          data-ocid="result-actions"
        >
          <Button
            onClick={handleDownload}
            className="flex-1 text-white font-black rounded-xl h-12 shadow-elevated transition-smooth active:scale-95 border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary)), oklch(0.55 0.22 45))",
              boxShadow: "0 4px 20px oklch(var(--primary) / 0.4)",
            }}
            data-ocid="btn-download"
          >
            <Download className="w-4 h-4 mr-2" />
            Save My Fruit!
          </Button>
          <Button
            onClick={handleTryAgain}
            variant="outline"
            className="flex-1 rounded-xl h-12 font-black transition-smooth active:scale-95"
            style={{
              borderColor: "oklch(var(--secondary) / 0.6)",
              color: "oklch(var(--secondary))",
            }}
            data-ocid="btn-try-again"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Fruit!
          </Button>
          <Button
            onClick={() => void handleShare()}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl flex-shrink-0 transition-smooth active:scale-95"
            style={{ borderColor: "oklch(var(--border))" }}
            aria-label="Share design with friends"
            data-ocid="btn-share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Generated image preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card
            className="rounded-2xl border overflow-hidden shadow-subtle"
            style={{
              background: "oklch(0.16 0.022 265)",
              borderColor: "oklch(var(--border))",
            }}
            data-ocid="generated-image-preview"
          >
            <div
              className="p-3 border-b"
              style={{ borderColor: "oklch(var(--border))" }}
            >
              <p
                className="text-xs font-display font-bold uppercase tracking-widest"
                style={{ color: "oklch(var(--accent))" }}
              >
                🍑 Flat Fruit Design
              </p>
            </div>
            <div
              className="p-4 flex justify-center"
              style={{ background: "oklch(0.12 0.01 260)" }}
            >
              <img
                src={currentGeneration.imageUrl}
                alt="Your Blox Fruit flat design"
                className="max-w-full rounded-xl shadow-elevated object-contain"
                style={{ maxHeight: 200 }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Recent generations */}
        {recentGens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            data-ocid="recent-generations"
          >
            <p
              className="text-xs font-display font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Recent Fruits
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentGens.map((gen) => (
                <RecentThumbnail key={gen.id} gen={gen} />
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
