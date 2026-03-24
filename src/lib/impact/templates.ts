import impactData from "./data/impact-map.json";

export type Sector =
  | "tech"
  | "healthcare"
  | "finance"
  | "manufacturing"
  | "energy"
  | "education"
  | "retail"
  | "government"
  | "agriculture"
  | "other";

export const SECTORS: { value: Sector; label: string }[] = [
  { value: "tech", label: "Tech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy", label: "Energy" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "government", label: "Government" },
  { value: "agriculture", label: "Agriculture" },
  { value: "other", label: "Other" },
];

interface ImpactResult {
  statement: string;
  severity: string;
  direction: string;
}

export function getImpactStatement(
  candidateName: string,
  sector: Sector,
  winProbability: number
): ImpactResult | null {
  const candidateData = (impactData as Record<string, Record<string, { template: string; severity: string; direction: string }>>)[candidateName];
  if (!candidateData) return null;

  const sectorData = candidateData[sector];
  if (!sectorData) return null;

  const score = Math.round(winProbability * 100);
  const statement = sectorData.template.replace(/\{score\}/g, String(score));

  return {
    statement,
    severity: sectorData.severity,
    direction: sectorData.direction,
  };
}
