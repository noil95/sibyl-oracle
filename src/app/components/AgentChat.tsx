"use client";

import { useState, useEffect, useRef } from "react";
import { getUserId } from "@/lib/user-id";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentEmoji: string;
}

export default function AgentChat({ agentId, agentName, agentEmoji }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const storageKey = `sibyl-chat-${agentId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": getUserId(),
        },
        body: JSON.stringify({ agentId, message: trimmed }),
      });

      const data = (await res.json()) as { response?: string; error?: string };
      const agentMsg: Message = {
        role: "agent",
        content: data.response ?? data.error ?? "Something went wrong.",
      };
      const updated = [...next, agentMsg];
      setMessages(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      const errMsg: Message = {
        role: "agent",
        content: "Network error. Please try again.",
      };
      const updated = [...next, errMsg];
      setMessages(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Ask {agentName} anything about the markets…
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "agent" && (
              <span className="mr-2 text-xl self-end mb-1">{agentEmoji}</span>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600/20 text-[var(--text-primary)] rounded-2xl rounded-br-md"
                  : "bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="mr-2 text-xl self-end mb-1">{agentEmoji}</span>
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 border-t border-[var(--border-primary)]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${agentName}…`}
          disabled={loading}
          className="flex-1 px-3 py-2 text-[13px] bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-purple)] disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-[13px] font-medium text-white rounded-lg transition-opacity disabled:opacity-40"
          style={{ background: "var(--gradient-purple)" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
