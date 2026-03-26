"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Hotspot Data ──
interface Hotspot {
  id: string;
  label: string;
  domain: string;
  lat: number;
  lng: number;
  status: "critical" | "warning" | "stable";
  score: number;
}

const HOTSPOTS: Hotspot[] = [
  { id: "fed-rate", label: "Fed Rate", domain: "economic", lat: 38.9, lng: -77.0, status: "warning", score: 0.55 },
  { id: "sp500", label: "S&P 500", domain: "economic", lat: 40.7, lng: -74.0, status: "stable", score: 0.62 },
  { id: "bitcoin", label: "Bitcoin", domain: "economic", lat: 37.8, lng: -122.4, status: "critical", score: 0.48 },
  { id: "oil-price", label: "Oil", domain: "economic", lat: 26.0, lng: 50.5, status: "warning", score: 0.42 },
  { id: "ai-regulation", label: "AI Regulation", domain: "tech", lat: 47.6, lng: -122.3, status: "warning", score: 0.58 },
  { id: "nvidia", label: "NVIDIA", domain: "tech", lat: 37.4, lng: -122.1, status: "stable", score: 0.71 },
  { id: "pa-senate", label: "PA Senate", domain: "political", lat: 40.3, lng: -76.9, status: "critical", score: 0.52 },
  { id: "ethereum", label: "Ethereum", domain: "tech", lat: 51.5, lng: -0.1, status: "stable", score: 0.59 },
  { id: "gold", label: "Gold", domain: "economic", lat: 25.3, lng: 55.3, status: "stable", score: 0.65 },
  { id: "tiktok", label: "TikTok", domain: "tech", lat: 39.9, lng: 116.4, status: "warning", score: 0.38 },
];

// Arc connections between hotspots
const ARCS = [
  [0, 1], // Fed Rate → S&P 500
  [2, 5], // Bitcoin → NVIDIA
  [7, 3], // Ethereum → Oil
  [4, 9], // AI Regulation → TikTok
  [6, 0], // PA Senate → Fed Rate
];

// ── Simplified continent data (lat/lng points for dot rendering) ──
// These are simplified coastline coordinates for rendering Earth's continents as dots
const CONTINENTS = generateContinentPoints();

function generateContinentPoints(): Array<[number, number]> {
  const points: Array<[number, number]> = [];

  // North America
  const naCoast: Array<[number, number]> = [
    [70,-140],[68,-135],[65,-168],[63,-165],[60,-165],[58,-155],[55,-165],[52,-175],
    [50,-130],[48,-125],[45,-124],[40,-124],[35,-120],[32,-117],[28,-115],[25,-110],
    [22,-106],[20,-105],[18,-95],[16,-88],[18,-88],[20,-87],[22,-90],[25,-82],
    [28,-82],[30,-85],[30,-88],[30,-90],[28,-96],[26,-97],[30,-94],[30,-90],
    [32,-80],[35,-76],[38,-75],[40,-74],[42,-70],[43,-66],[45,-67],[47,-60],
    [47,-53],[50,-55],[52,-56],[55,-60],[58,-62],[55,-77],[58,-78],[60,-95],
    [63,-90],[65,-85],[67,-80],[70,-85],[72,-95],[75,-95],[72,-120],[70,-140],
  ];
  fillRegion(points, naCoast, 2.5);

  // South America
  const saCoast: Array<[number, number]> = [
    [12,-72],[10,-75],[8,-77],[5,-77],[2,-80],[0,-80],[-5,-81],[-8,-80],
    [-12,-77],[-15,-75],[-18,-70],[-20,-63],[-22,-60],[-25,-48],[-28,-49],
    [-30,-51],[-33,-53],[-35,-57],[-40,-62],[-42,-65],[-45,-67],[-50,-70],
    [-53,-72],[-55,-68],[-53,-65],[-48,-65],[-45,-62],[-40,-58],[-35,-52],
    [-30,-47],[-25,-45],[-22,-40],[-18,-38],[-15,-39],[-10,-37],[-5,-35],
    [0,-50],[2,-52],[5,-60],[8,-62],[10,-67],[12,-72],
  ];
  fillRegion(points, saCoast, 2.8);

  // Europe
  const euCoast: Array<[number, number]> = [
    [36,-10],[38,-8],[40,-8],[42,-9],[44,-1],[46,1],[48,5],[50,2],[51,4],
    [53,6],[55,8],[57,10],[58,12],[60,5],[62,5],[65,12],[68,15],[70,20],
    [71,28],[70,30],[65,30],[60,28],[58,24],[55,20],[54,18],[52,14],
    [50,14],[48,17],[46,15],[44,12],[42,15],[40,20],[38,24],[36,28],
    [35,25],[36,22],[38,18],[40,14],[38,12],[36,5],[36,-5],[36,-10],
  ];
  fillRegion(points, euCoast, 1.8);

  // Africa
  const afCoast: Array<[number, number]> = [
    [37,10],[35,0],[33,-8],[30,-10],[25,-15],[20,-17],[15,-17],[12,-16],
    [8,-13],[5,-10],[5,0],[2,10],[0,10],[-2,12],[-5,12],[-8,14],
    [-12,15],[-15,17],[-20,15],[-22,14],[-25,15],[-28,17],[-30,18],
    [-33,20],[-34,22],[-35,25],[-34,28],[-30,32],[-25,35],[-20,37],
    [-15,40],[-10,42],[-5,40],[0,42],[5,45],[10,45],[12,44],
    [15,42],[18,40],[20,38],[22,36],[25,35],[28,33],[30,32],
    [32,32],[34,30],[35,35],[37,15],[37,10],
  ];
  fillRegion(points, afCoast, 2.5);

  // Asia
  const asCoast: Array<[number, number]> = [
    [42,30],[40,35],[38,40],[35,45],[30,48],[25,55],[20,60],[15,55],
    [10,52],[8,50],[5,45],[0,50],[-2,55],[-5,60],[-8,65],[0,70],
    [5,75],[10,78],[12,80],[10,98],[8,100],[5,103],[2,105],
    [0,110],[-2,115],[-5,120],[-8,115],[-7,110],[5,105],
    [10,100],[15,100],[20,106],[22,108],[25,120],[28,122],[30,122],
    [32,130],[35,132],[38,135],[40,140],[42,145],[45,143],[48,140],
    [50,143],[52,140],[55,135],[58,140],[60,150],[63,160],[65,170],
    [68,175],[70,170],[72,140],[72,120],[70,100],[68,90],[65,80],
    [62,70],[58,60],[55,55],[52,50],[48,45],[45,40],[42,30],
  ];
  fillRegion(points, asCoast, 2.5);

  // Australia
  const auCoast: Array<[number, number]> = [
    [-12,130],[-14,127],[-16,123],[-18,122],[-20,119],[-22,114],
    [-25,114],[-28,114],[-30,115],[-32,116],[-34,118],[-35,120],
    [-38,145],[-37,150],[-35,151],[-33,152],[-30,153],[-28,153],
    [-25,152],[-22,150],[-20,148],[-18,146],[-16,146],[-14,135],
    [-12,132],[-12,130],
  ];
  fillRegion(points, auCoast, 2.2);

  return points;
}

function fillRegion(
  output: Array<[number, number]>,
  coastline: Array<[number, number]>,
  density: number
) {
  // Add coastline points
  for (const [lat, lng] of coastline) {
    output.push([lat, lng]);
  }

  // Fill interior with a grid, checking if points are inside the polygon
  const lats = coastline.map(c => c[0]);
  const lngs = coastline.map(c => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  for (let lat = minLat; lat <= maxLat; lat += density) {
    for (let lng = minLng; lng <= maxLng; lng += density) {
      if (isPointInPolygon(lat, lng, coastline)) {
        // Add slight randomness for organic look
        output.push([
          lat + (Math.random() - 0.5) * density * 0.4,
          lng + (Math.random() - 0.5) * density * 0.4,
        ]);
      }
    }
  }
}

function isPointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// ── 3D Projection ──
function latLngTo3D(
  lat: number,
  lng: number,
  radius: number,
  rotationY: number
): { x: number; y: number; z: number } {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + rotationY) * Math.PI) / 180;

  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

// ── Status Colors ──
const STATUS_COLORS = {
  critical: { r: 239, g: 68, b: 68 },   // red
  warning: { r: 245, g: 158, b: 11 },    // amber
  stable: { r: 16, g: 185, b: 129 },     // emerald
};

// ── Component ──
interface GlobeViewProps {
  fullScreen?: boolean;
}

export default function GlobeView({ fullScreen = false }: GlobeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const [hoveredSpot, setHoveredSpot] = useState<Hotspot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const size = fullScreen ? 560 : 360;
  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    rotationRef.current += 0.15;
    const rot = rotationRef.current;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Globe background glow
    const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.4);
    glowGrad.addColorStop(0, "rgba(56, 120, 255, 0.06)");
    glowGrad.addColorStop(1, "rgba(56, 120, 255, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, size, size);

    // Globe sphere background
    const sphereGrad = ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      0,
      centerX,
      centerY,
      radius
    );
    sphereGrad.addColorStop(0, "rgba(20, 25, 50, 0.9)");
    sphereGrad.addColorStop(0.7, "rgba(8, 10, 30, 0.95)");
    sphereGrad.addColorStop(1, "rgba(5, 5, 20, 1)");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Subtle sphere edge glow
    const edgeGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.95, centerX, centerY, radius * 1.02);
    edgeGrad.addColorStop(0, "rgba(60, 130, 255, 0)");
    edgeGrad.addColorStop(0.5, "rgba(60, 130, 255, 0.15)");
    edgeGrad.addColorStop(1, "rgba(60, 130, 255, 0)");
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = edgeGrad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Draw grid lines (latitude/longitude) ──
    ctx.strokeStyle = "rgba(60, 130, 255, 0.06)";
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (let lng = 0; lng <= 360; lng += 3) {
        const p = latLngTo3D(lat, lng, radius, rot);
        if (p.z > 0) {
          const sx = centerX + p.x;
          const sy = centerY - p.y;
          if (lng === 0 || latLngTo3D(lat, lng - 3, radius, rot).z <= 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = latLngTo3D(lat, lng, radius, rot);
        if (p.z > 0) {
          const sx = centerX + p.x;
          const sy = centerY - p.y;
          if (lat === -90 || latLngTo3D(lat - 3, lng, radius, rot).z <= 0) {
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
      }
      ctx.stroke();
    }

    // ── Draw continent dots ──
    for (const [lat, lng] of CONTINENTS) {
      const p = latLngTo3D(lat, lng, radius, rot);
      if (p.z > 0) {
        const sx = centerX + p.x;
        const sy = centerY - p.y;
        const depth = p.z / radius; // 0-1, brighter when facing camera
        const dotSize = 0.8 + depth * 0.6;
        const alpha = 0.15 + depth * 0.45;

        ctx.beginPath();
        ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 160, 255, ${alpha})`;
        ctx.fill();
      }
    }

    // ── Draw arcs between hotspots ──
    for (const [fromIdx, toIdx] of ARCS) {
      const from = HOTSPOTS[fromIdx];
      const to = HOTSPOTS[toIdx];

      const pFrom = latLngTo3D(from.lat, from.lng, radius, rot);
      const pTo = latLngTo3D(to.lat, to.lng, radius, rot);

      // Only draw if both points are visible
      if (pFrom.z > 0 && pTo.z > 0) {
        const x1 = centerX + pFrom.x;
        const y1 = centerY - pFrom.y;
        const x2 = centerX + pTo.x;
        const y2 = centerY - pTo.y;

        // Calculate arc height based on distance
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const arcHeight = dist * 0.35;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - arcHeight;

        const depthAvg = (pFrom.z + pTo.z) / (2 * radius);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 + depthAvg * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Animated dot traveling along the arc
        const t = ((rot * 2) % 360) / 360;
        const travelX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
        const travelY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;

        ctx.beginPath();
        ctx.arc(travelX, travelY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.6 + depthAvg * 0.4})`;
        ctx.fill();
      }
    }

    // ── Draw hotspot dots ──
    for (const spot of HOTSPOTS) {
      const p = latLngTo3D(spot.lat, spot.lng, radius, rot);
      if (p.z > 0) {
        const sx = centerX + p.x;
        const sy = centerY - p.y;
        const depth = p.z / radius;
        const col = STATUS_COLORS[spot.status];

        // Outer pulse ring
        const pulseSize = 6 + Math.sin(rot * 0.05 + HOTSPOTS.indexOf(spot)) * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${0.08 * depth})`;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${0.3 * depth})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${0.7 + depth * 0.3})`;
        ctx.fill();
      }
    }

    // ── Orbital ring ──
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 1.15, radius * 0.18, -0.3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 130, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Second orbital ring
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 1.25, radius * 0.12, 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 130, 255, 0.06)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(draw);
  }, [size, radius, centerX, centerY]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Mouse interaction
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const rot = rotationRef.current;

    let closest: Hotspot | null = null;
    let closestDist = Infinity;

    for (const spot of HOTSPOTS) {
      const p = latLngTo3D(spot.lat, spot.lng, radius, rot);
      if (p.z > 0) {
        const sx = centerX + p.x;
        const sy = centerY - p.y;
        const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
        if (dist < 20 && dist < closestDist) {
          closest = spot;
          closestDist = dist;
          setTooltipPos({ x: sx, y: sy });
        }
      }
    }

    setHoveredSpot(closest);
  }

  return (
    <div
      className={`relative flex items-center justify-center ${
        fullScreen ? "min-h-[620px]" : "h-[400px]"
      }`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, cursor: hoveredSpot ? "pointer" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSpot(null)}
      />

      {/* Tooltip */}
      {hoveredSpot && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 60,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className={`bg-black/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-center shadow-lg ${
              hoveredSpot.status === "critical"
                ? "border-red-500/30"
                : hoveredSpot.status === "warning"
                ? "border-amber-500/30"
                : "border-emerald-500/30"
            }`}
          >
            <div className="text-[9px] text-white/40 uppercase tracking-wider">
              {hoveredSpot.domain}
            </div>
            <div className="text-xs font-semibold text-white">{hoveredSpot.label}</div>
            <div
              className={`text-sm font-bold ${
                hoveredSpot.status === "critical"
                  ? "text-red-400"
                  : hoveredSpot.status === "warning"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {Math.round(hoveredSpot.score * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
        {(["critical", "warning", "stable"] as const).map((status) => {
          const col = STATUS_COLORS[status];
          return (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: `rgb(${col.r}, ${col.g}, ${col.b})` }}
              />
              <span className="text-[10px] text-white/40 capitalize">{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
