interface FruitDisplayProps {
  imageUrl: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { outer: 80, inner: 64 },
  md: { outer: 160, inner: 132 },
  lg: { outer: 240, inner: 196 },
};

export function FruitDisplay({
  imageUrl,
  alt = "Blox Fruit design",
  size = "lg",
}: FruitDisplayProps) {
  const cfg = sizeConfig[size];

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: cfg.outer, height: cfg.outer }}
      aria-label={alt}
      role="img"
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full glow-pulse"
        style={{
          background:
            "radial-gradient(circle, oklch(var(--secondary) / 0.25) 0%, transparent 70%)",
        }}
      />

      {/* Decorative swirl ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `${size === "sm" ? 3 : size === "md" ? 5 : 7}px solid transparent`,
          background:
            "linear-gradient(oklch(0.12 0.02 260), oklch(0.12 0.02 260)) padding-box, " +
            "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--secondary)), oklch(var(--accent)), oklch(var(--primary))) border-box",
          borderRadius: "50%",
        }}
      />

      {/* Inner fruit circle */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: cfg.inner,
          height: cfg.inner,
          background:
            "radial-gradient(ellipse at 35% 30%, oklch(0.22 0.03 280), oklch(0.12 0.02 260))",
          boxShadow:
            "inset 0 -4px 16px rgba(0,0,0,0.4), inset 0 4px 12px rgba(255,255,255,0.08)",
        }}
      >
        {/* Design image */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Highlight overlay — top-left sphere shine */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.22) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Fruit stem (only on md/lg) */}
      {size !== "sm" && (
        <div
          className="absolute"
          style={{
            width: size === "lg" ? 10 : 7,
            height: size === "lg" ? 20 : 14,
            background:
              "linear-gradient(180deg, oklch(0.55 0.15 130), oklch(0.4 0.1 130))",
            borderRadius: "4px 4px 0 0",
            top: -((size === "lg" ? 20 : 14) * 0.55),
            left: "50%",
            transform: "translateX(-50%) rotate(-10deg)",
            boxShadow: "0 0 6px oklch(0.55 0.15 130 / 0.5)",
          }}
        />
      )}

      {/* Spiral stripe decoration */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
        style={{ borderRadius: "50%" }}
      >
        <div
          className="absolute"
          style={{
            width: "200%",
            height: "16%",
            background: `oklch(var(--primary) / ${size === "sm" ? "0.25" : "0.3"})`,
            top: "38%",
            left: "-50%",
            transform: "rotate(-15deg)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "200%",
            height: "12%",
            background: `oklch(var(--accent) / ${size === "sm" ? "0.2" : "0.25"})`,
            top: "55%",
            left: "-50%",
            transform: "rotate(-15deg)",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}
