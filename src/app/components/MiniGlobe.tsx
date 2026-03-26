"use client";

import { useEffect, useState } from "react";

interface MiniGlobeProps {
  size?: number;
}

export default function MiniGlobe({ size = 28 }: MiniGlobeProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const r = size / 2;

  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 40% 35%, rgba(139,92,246,0.2), #0a0a2e 70%)",
        boxShadow: "0 0 8px rgba(139,92,246,0.2)",
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox={`0 0 ${size} ${size}`}>
        {/* Equator */}
        <ellipse cx={r} cy={r} rx={r * 0.9} ry={r * 0.15} fill="none" stroke="white" strokeWidth="0.5" />
        {/* Meridian */}
        <ellipse
          cx={r} cy={r}
          rx={Math.cos((rotation * Math.PI) / 180) * r * 0.4}
          ry={r * 0.85}
          fill="none" stroke="white" strokeWidth="0.5"
        />
      </svg>

      {/* Tiny hotspots */}
      {[
        { x: 0.35, y: 0.3, color: "bg-red-500" },
        { x: 0.65, y: 0.45, color: "bg-amber-500" },
        { x: 0.5, y: 0.65, color: "bg-emerald-500" },
      ].map((dot, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${dot.color}`}
          style={{
            left: `${dot.x * 100}%`,
            top: `${dot.y * 100}%`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}
