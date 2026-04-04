"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from "d3-force";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  domain: string;
  score: number;
  confidence: number;
}

interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  multiplier: number;
}

interface HeatmapData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const DOMAIN_COLOR: Record<string, string> = {
  economic: "#22c55e",
  tech: "#f97316",
  political: "#8b5cf6",
};

function domainColor(domain: string): string {
  return DOMAIN_COLOR[domain] ?? "#94a3b8";
}

function nodeRadius(confidence: number): number {
  return 15 + confidence * 15;
}

function edgeWidth(multiplier: number): number {
  return Math.max(1, Math.min(3, Math.abs(multiplier) * 2));
}

function edgeColor(multiplier: number): string {
  return multiplier >= 0 ? "#22c55e" : "#ef4444";
}

export default function ContagionGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/heatmap")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HeatmapData>;
      })
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load graph");
      });
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = svgRef.current;
    const width = svg.clientWidth || 800;
    const height = 600;

    // Clear previous render
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const nodes: GraphNode[] = data.nodes.map((n) => ({ ...n }));
    const edges: GraphEdge[] = data.edges.map((e) => ({ ...e }));

    const simulation = forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", forceManyBody<GraphNode>().strength(-200))
      .force("center", forceCenter<GraphNode>(width / 2, height / 2))
      .force("collide", forceCollide<GraphNode>(30));

    // Edge lines
    const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const lines = edges.map((edge) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", edgeColor(edge.multiplier));
      line.setAttribute("stroke-width", String(edgeWidth(edge.multiplier)));
      line.setAttribute("stroke-opacity", "0.6");
      lineGroup.appendChild(line);
      return line;
    });
    svg.appendChild(lineGroup);

    // Node groups
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const nodeElements = nodes.map((node) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.style.cursor = "pointer";

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const r = nodeRadius(node.confidence);
      circle.setAttribute("r", String(r));
      circle.setAttribute("fill", domainColor(node.domain));
      circle.setAttribute("fill-opacity", "0.85");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "1.5");

      const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      labelText.setAttribute("text-anchor", "middle");
      labelText.setAttribute("dy", String(r + 14));
      labelText.setAttribute("fill", "#e2e8f0");
      labelText.setAttribute("font-size", "11");
      labelText.setAttribute("font-family", "sans-serif");
      labelText.textContent = node.label;

      const scoreText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      scoreText.setAttribute("text-anchor", "middle");
      scoreText.setAttribute("dy", "4");
      scoreText.setAttribute("fill", "#ffffff");
      scoreText.setAttribute("font-size", "10");
      scoreText.setAttribute("font-weight", "600");
      scoreText.setAttribute("font-family", "sans-serif");
      scoreText.textContent = `${Math.round(node.score * 100)}%`;

      g.appendChild(circle);
      g.appendChild(scoreText);
      g.appendChild(labelText);

      g.addEventListener("click", () => {
        router.push(`/fork/${node.id}`);
      });

      nodeGroup.appendChild(g);
      return g;
    });
    svg.appendChild(nodeGroup);

    simulation.on("tick", () => {
      edges.forEach((edge, i) => {
        const src = edge.source as GraphNode;
        const tgt = edge.target as GraphNode;
        const line = lines[i];
        if (src.x !== undefined && src.y !== undefined && tgt.x !== undefined && tgt.y !== undefined) {
          line.setAttribute("x1", String(src.x));
          line.setAttribute("y1", String(src.y));
          line.setAttribute("x2", String(tgt.x));
          line.setAttribute("y2", String(tgt.y));
        }
      });

      nodes.forEach((node, i) => {
        if (node.x !== undefined && node.y !== undefined) {
          nodeElements[i].setAttribute("transform", `translate(${node.x},${node.y})`);
        }
      });
    });

    return () => {
      simulation.stop();
    };
  }, [data, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-[var(--text-secondary)]">
        <p>Failed to load graph: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[600px] text-[var(--text-secondary)]">
        <p>Loading prediction network...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden">
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "600px", display: "block" }}
        aria-label="Prediction contagion network graph"
      />
    </div>
  );
}
