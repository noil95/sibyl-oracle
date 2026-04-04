"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/user-id";

interface WatchedSource {
  id: string;
  source_url: string;
  source_type: string;
  last_checked: string | null;
  fail_count: number;
}

interface WatchSourcesProps {
  predictionSlug: string;
}

export default function WatchSources({ predictionSlug }: WatchSourcesProps) {
  const [sources, setSources] = useState<WatchedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUrl, setAddUrl] = useState("");
  const [addType, setAddType] = useState<"rss" | "webpage">("rss");
  const [adding, setAdding] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function getUserHeaders(): HeadersInit {
    return { "X-User-Id": getUserId(), "Content-Type": "application/json" };
  }

  async function fetchSources() {
    try {
      const res = await fetch("/api/sources", { headers: getUserHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setSources(
        (data.sources as WatchedSource[]).filter(
          (s) => (s as unknown as { prediction_slug: string }).prediction_slug === predictionSlug
        )
      );
    } catch {
      // silently ignore fetch errors on load
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSources();
  }, [predictionSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addUrl.trim()) return;
    setAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: getUserHeaders(),
        body: JSON.stringify({
          predictionSlug,
          sourceUrl: addUrl.trim(),
          sourceType: addType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to add source");
        return;
      }

      setAddUrl("");
      setSuccessMsg("Source added successfully");
      await fetchSources();
    } catch {
      setErrorMsg("Network error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setRemoveId(id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/sources", {
        method: "DELETE",
        headers: getUserHeaders(),
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? "Failed to remove source");
        return;
      }

      setSuccessMsg("Source removed");
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setErrorMsg("Network error");
    } finally {
      setRemoveId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">
          Watched Sources
        </h3>
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {sources.length}/5 slots used
        </span>
      </div>

      {/* Existing sources */}
      {loading ? (
        <div className="h-[60px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shimmer" />
      ) : sources.length === 0 ? (
        <p className="text-[12px] text-[var(--text-tertiary)]">No watched sources yet</p>
      ) : (
        <div className="space-y-2">
          {sources.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-3 py-2.5"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-[12px] text-[var(--text-primary)] truncate">{s.source_url}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded">
                    {s.source_type}
                  </span>
                  {s.last_checked && (
                    <span className="text-[9px] text-[var(--text-tertiary)]">
                      checked {new Date(s.last_checked).toLocaleDateString()}
                    </span>
                  )}
                  {s.fail_count > 0 && (
                    <span className="text-[9px] text-red-400">
                      {s.fail_count} fail{s.fail_count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(s.id)}
                disabled={removeId === s.id}
                className="shrink-0 text-[11px] text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
              >
                {removeId === s.id ? "..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {sources.length < 5 && (
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              placeholder="https://example.com/feed.rss"
              required
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-violet-500"
            />
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value as "rss" | "webpage")}
              className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg px-2 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
            >
              <option value="rss">RSS</option>
              <option value="webpage">Webpage</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {adding ? "Adding..." : "Add Source"}
          </button>
        </form>
      )}

      {successMsg && (
        <p className="text-[12px] text-emerald-400">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="text-[12px] text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
