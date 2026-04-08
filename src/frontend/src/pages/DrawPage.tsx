import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Eye, EyeOff, Loader2, Trash2, Undo2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useCamera } from "../hooks/useCamera";
import { useGenerateDesign } from "../hooks/useGenerateDesign";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stroke {
  imageData: ImageData;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#FF3CA0",
  "#FF6B35",
  "#FFB830",
  "#FFEC3D",
  "#7ED957",
  "#00C896",
  "#00B4D8",
  "#6A5AFF",
  "#CC44FF",
  "#FF85C2",
  "#A0522D",
  "#607080",
  "#111827",
  "#FFFFFF",
  "custom",
];

const MAX_HISTORY = 30;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DrawPage() {
  const navigate = useNavigate();
  const { setDrawingDataURL, setDesignPrompt, designPrompt } = useAppContext();
  const { generate, isLoading, error: generateError } = useGenerateDesign();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [strokeHistory, setStrokeHistory] = useState<Stroke[]>([]);
  const [hasStrokes, setHasStrokes] = useState(false);

  const [color, setColor] = useState("#6A5AFF");
  const [brushSize, setBrushSize] = useState(8);
  const [showCustomColor, setShowCustomColor] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [refPhoto, setRefPhoto] = useState<string | null>(null);
  const [showRefOverlay, setShowRefOverlay] = useState(true);
  const [refOpacity, setRefOpacity] = useState(0.3);

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef: camCanvasRef,
  } = useCamera({ facingMode: "environment", width: 1280, height: 720 });

  // ─── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const snapshot = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      const bgCtx = canvas.getContext("2d", { willReadFrequently: true });
      if (bgCtx) {
        bgCtx.fillStyle = "#12103a";
        bgCtx.fillRect(0, 0, canvas.width, canvas.height);
        if (snapshot) bgCtx.putImageData(snapshot, 0, 0);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = "#12103a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // ─── Drawing helpers ────────────────────────────────────────────────────────
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const saveStroke = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => {
      const next = [...prev, { imageData: snap }];
      return next.slice(-MAX_HISTORY);
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isLoading) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    saveStroke();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
    const ctx = canvasRef.current?.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    setHasStrokes(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isLoading) return;
    const ctx = canvasRef.current?.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx || !lastPosRef.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // ─── Undo / Clear ───────────────────────────────────────────────────────────
  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const prev = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(prev.imageData, 0, 0);
    setStrokeHistory((h) => h.slice(0, -1));
    if (strokeHistory.length <= 1) setHasStrokes(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    saveStroke();
    ctx.fillStyle = "#12103a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  // ─── Camera capture ─────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    setShowCamera(true);
    await startCamera();
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRefPhoto(url);
    setShowRefOverlay(true);
    await stopCamera();
    setShowCamera(false);
  };

  const handleCloseCamera = async () => {
    await stopCamera();
    setShowCamera(false);
  };

  // ─── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    setDrawingDataURL(dataURL);
    setDesignPrompt(designPrompt);
    await generate({
      drawingBase64: dataURL.split(",")[1] ?? dataURL,
      prompt: designPrompt,
    });
    if (!generateError) {
      navigate({ to: "/result" });
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
      {/* Page heading */}
      <div className="px-4 pt-4 pb-2 text-center">
        <h1
          className="font-display font-black text-2xl leading-tight"
          style={{
            background:
              "linear-gradient(90deg, oklch(var(--primary)), oklch(var(--accent)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 6px oklch(var(--primary) / 0.3))",
          }}
        >
          Draw Your Blox Fruit! 🍑
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          Draw any fruit shape and make it super powerful!
        </p>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden mx-3 rounded-2xl border-game"
        style={{
          minHeight: 0,
          background: "#12103a",
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.5), 0 0 0 2px oklch(var(--primary) / 0.3)",
        }}
      >
        {/* Reference photo overlay */}
        {refPhoto && showRefOverlay && (
          <img
            src={refPhoto}
            alt="Reference"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            style={{ opacity: refOpacity }}
          />
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-20"
          style={{
            touchAction: "none",
            cursor: isLoading ? "not-allowed" : "crosshair",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-ocid="drawing-canvas"
        />

        {/* Floating camera button */}
        <button
          type="button"
          className="absolute top-3 right-3 z-30 w-12 h-12 rounded-2xl flex items-center justify-center shadow-elevated transition-smooth active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--secondary)), oklch(0.55 0.28 290))",
          }}
          onClick={handleOpenCamera}
          aria-label="Open camera for reference photo"
          disabled={isLoading}
          data-ocid="btn-open-camera"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>

        {/* Reference overlay toggle */}
        {refPhoto && (
          <div className="absolute top-3 left-3 z-30">
            <button
              type="button"
              className="w-11 h-11 rounded-xl bg-card/90 backdrop-blur border border-border shadow-subtle flex items-center justify-center transition-smooth active:scale-95"
              onClick={() => setShowRefOverlay((v) => !v)}
              aria-label={
                showRefOverlay
                  ? "Hide reference overlay"
                  : "Show reference overlay"
              }
              data-ocid="btn-toggle-overlay"
            >
              {showRefOverlay ? (
                <EyeOff className="w-4 h-4 text-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-40 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-elevated glow-pulse text-4xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--secondary)))",
              }}
            >
              <Loader2 className="w-9 h-9 text-white animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-display font-black text-lg text-foreground">
                Forging your fruit… 🔥
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                The AI is giving it superpowers!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom toolbar */}
      <div
        className="sticky bottom-0 z-30 border-t border-border px-3 pt-3"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background:
            "linear-gradient(180deg, oklch(0.15 0.02 260) 0%, oklch(0.12 0.015 260) 100%)",
          borderTop: "2px solid oklch(var(--primary) / 0.3)",
        }}
        data-ocid="bottom-toolbar"
      >
        {/* Ref opacity slider */}
        {refPhoto && showRefOverlay && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <Eye className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Slider
              min={0.05}
              max={0.8}
              step={0.05}
              value={[refOpacity]}
              onValueChange={([v]) => setRefOpacity(v ?? refOpacity)}
              className="flex-1"
              data-ocid="slider-ref-opacity"
            />
            <span className="text-xs text-muted-foreground w-8 text-right font-mono">
              {Math.round(refOpacity * 100)}%
            </span>
          </div>
        )}

        {/* Brush size row */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div
            className="flex-shrink-0 rounded-full"
            style={{
              width: Math.max(6, Math.min(brushSize, 20)),
              height: Math.max(6, Math.min(brushSize, 20)),
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
          <Slider
            min={2}
            max={40}
            step={1}
            value={[brushSize]}
            onValueChange={([v]) => setBrushSize(v ?? brushSize)}
            className="flex-1"
            disabled={isLoading}
            data-ocid="slider-brush-size"
          />
          <span className="text-xs text-muted-foreground w-6 text-right font-mono">
            {brushSize}
          </span>
        </div>

        {/* Color palette label */}
        <p className="text-xs font-display font-bold text-accent mb-1.5 px-1 uppercase tracking-widest">
          🎨 Fruit Colors
        </p>

        {/* Colors + undo/clear */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {PRESET_COLORS.map((c) =>
              c === "custom" ? (
                <label
                  key="custom"
                  className="w-8 h-8 rounded-xl border-2 border-dashed border-border cursor-pointer overflow-hidden relative transition-smooth active:scale-90 flex-shrink-0"
                  aria-label="Custom color picker"
                  title="Pick any color!"
                  data-ocid="btn-custom-color"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-destructive opacity-80" />
                  <input
                    type="color"
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    value={showCustomColor ? color : "#FF3CA0"}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setShowCustomColor(true);
                    }}
                    disabled={isLoading}
                  />
                </label>
              ) : (
                <button
                  key={c}
                  type="button"
                  className="w-8 h-8 rounded-xl transition-smooth active:scale-90 flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                    boxShadow:
                      color === c
                        ? `0 0 0 2px oklch(0.12 0.02 260), 0 0 10px ${c}90`
                        : "none",
                    border:
                      c === "#FFFFFF"
                        ? "1.5px solid rgba(255,255,255,0.3)"
                        : "none",
                  }}
                  onClick={() => {
                    setColor(c);
                    setShowCustomColor(false);
                  }}
                  aria-label={`Pick color ${c}`}
                  disabled={isLoading}
                  data-ocid={`btn-color-${c.replace("#", "")}`}
                />
              ),
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              type="button"
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-smooth active:scale-90 disabled:opacity-40"
              style={{ background: "oklch(var(--secondary))" }}
              onClick={handleUndo}
              disabled={strokeHistory.length === 0 || isLoading}
              aria-label="Undo last stroke"
              data-ocid="btn-undo"
            >
              <Undo2 className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              className="w-11 h-11 rounded-xl bg-destructive/15 flex items-center justify-center transition-smooth active:scale-90 disabled:opacity-40"
              onClick={handleClear}
              disabled={!hasStrokes || isLoading}
              aria-label="Clear canvas"
              data-ocid="btn-clear"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>

        {/* Prompt + generate */}
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/60 transition-smooth"
            rows={2}
            placeholder="What power does your fruit have? ⚡ (e.g. fire, ice, lightning, shadow...)"
            value={designPrompt}
            onChange={(e) => setDesignPrompt(e.target.value)}
            disabled={isLoading}
            data-ocid="input-prompt"
          />
          <button
            type="button"
            className="h-16 px-5 rounded-xl font-display font-black text-sm text-white shadow-elevated transition-smooth active:scale-95 disabled:opacity-60 flex-shrink-0 flex flex-col items-center justify-center gap-0.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary)), oklch(0.55 0.22 45))",
              boxShadow: "0 4px 20px oklch(var(--primary) / 0.4)",
            }}
            onClick={handleGenerate}
            disabled={isLoading}
            data-ocid="btn-generate"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-lg leading-none">⚡</span>
                <span className="text-xs leading-none">Forge It!</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-display font-black text-white text-base">
              📸 Take a Reference Photo
            </span>
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center transition-smooth active:scale-90"
              onClick={handleCloseCamera}
              aria-label="Close camera"
              data-ocid="btn-close-camera"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div
            className="flex-1 relative overflow-hidden"
            style={{ minHeight: 0 }}
          >
            {isSupported === false ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-white/70 text-sm text-center">
                  Camera not supported in this browser.
                </p>
              </div>
            ) : cameraError ? (
              <div className="flex items-center justify-center h-full p-6">
                <p className="text-red-400 text-sm text-center">
                  {cameraError.message}
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ minHeight: "200px" }}
              />
            )}
            <canvas ref={camCanvasRef} className="hidden" />
          </div>

          <div className="px-4 py-6 flex flex-col items-center gap-3">
            <p className="text-white/60 text-xs font-body text-center">
              Snap a photo to use as a drawing guide!
            </p>
            <button
              type="button"
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center transition-smooth active:scale-90 disabled:opacity-50"
              onClick={handleCapture}
              disabled={!isActive || cameraLoading}
              aria-label="Capture photo"
              data-ocid="btn-capture"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
