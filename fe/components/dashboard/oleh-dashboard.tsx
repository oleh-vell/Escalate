"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BackdropFx, BrandMark, Wrap } from "@/components/landing/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POLL_MS = 5000;

interface ApiMessage {
  id: string;
  question: string;
  status: "pending" | "responded";
  response: string | null;
  created_at: string;
  responded_at: string | null;
}

interface Msg {
  id: string;
  q: string;
  status: "pending" | "responded";
  answer: string | null;
  received: number;
  answeredAt: number | null;
}

interface Toast {
  text: string;
  error?: boolean;
}

function normalize(m: ApiMessage): Msg {
  return {
    id: m.id,
    q: m.question,
    status: m.status,
    answer: m.response,
    received: Date.parse(m.created_at),
    answeredAt: m.responded_at ? Date.parse(m.responded_at) : null,
  };
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function OlehDashboard() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const knownIds = useRef<Set<string> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, error = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, error });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiMessage[];
      const next = data.map(normalize);

      const known = knownIds.current;
      if (known) {
        const fresh = next.filter((m) => m.status === "pending" && !known.has(m.id));
        if (fresh.length > 0) {
          showToast(`new question · ${fresh[0].id}`);
        }
      }
      knownIds.current = new Set(next.map((m) => m.id));

      setMsgs(next);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoaded(true);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMsg = openId ? (msgs.find((m) => m.id === openId) ?? null) : null;
  const pendingCount = msgs.filter((m) => m.status === "pending").length;

  const q = query.trim().toLowerCase();
  const visible = q
    ? msgs.filter((m) => m.q.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    : msgs;

  function openDrawer(id: string) {
    setOpenId(id);
    setReply("");
  }

  async function sendReply() {
    if (!openMsg || sending) return;
    const answer = reply.trim();
    if (!answer) {
      showToast("write a reply first", true);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${openMsg.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: answer }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const updated = normalize((await res.json()) as ApiMessage);
      setMsgs((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setOpenId(null);
      setReply("");
      showToast(`reply sent · ${updated.id} unblocked`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "send failed", true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="landing min-h-screen overflow-x-hidden bg-bg font-sans text-ink antialiased">
      <BackdropFx />

      <header className="border-b border-line">
        <Wrap className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3.5">
            <BrandMark />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              / oleh&apos;s inbox
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[13px]">
            <span className="flex items-center gap-2 text-ink-dim">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  offline
                    ? "bg-coral shadow-[0_0_10px_var(--coral)]"
                    : "animate-pulse-dot-slow bg-mint shadow-[0_0_10px_var(--mint)]",
                )}
              />
              {offline ? "backend unreachable" : "live"}
            </span>
            <Badge variant={pendingCount > 0 ? "pending" : "outline"}>
              {pendingCount} pending
            </Badge>
          </div>
        </Wrap>
      </header>

      <main>
        <Wrap className="py-9">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Questions</h1>
              <p className="mt-1 text-[14px] text-muted">
                Agents are blocked until you answer.
              </p>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search questions…"
              className="w-[260px] rounded-[10px] border border-line-2 bg-white/[0.02] px-3.5 py-2 font-mono text-[13px] text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-[rgba(116,242,192,0.45)]"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="grid grid-cols-[120px_1fr_110px_92px] gap-3 border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted max-[640px]:grid-cols-[100px_1fr_84px]">
              <span>Status</span>
              <span>Question</span>
              <span>Received</span>
              <span className="max-[640px]:hidden" />
            </div>

            {visible.length === 0 ? (
              <div id="empty" className="px-5 py-14 text-center">
                <p className="font-mono text-[14px] text-ink-dim">
                  {!loaded
                    ? "loading…"
                    : offline && msgs.length === 0
                      ? "can't reach the backend — is the server running?"
                      : q
                        ? "nothing matches that search."
                        : "no questions yet. agents will page you here."}
                </p>
              </div>
            ) : (
              <ul>
                {visible.map((m) => (
                  <li key={m.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => openDrawer(m.id)}
                      className="grid w-full cursor-pointer grid-cols-[120px_1fr_110px_92px] items-center gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-white/[0.03] max-[640px]:grid-cols-[100px_1fr_84px]"
                    >
                      <span>
                        <Badge variant={m.status === "pending" ? "pending" : "responded"}>
                          <span
                            className={cn(
                              "size-[5px] rounded-full",
                              m.status === "pending"
                                ? "animate-pulse-dot bg-amber"
                                : "bg-mint",
                            )}
                          />
                          {m.status}
                        </Badge>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] text-ink">{m.q}</span>
                        {m.status === "responded" && m.answer && (
                          <span className="mt-0.5 block truncate font-mono text-[12.5px] text-muted">
                            ↳ {m.answer}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[12.5px] text-ink-dim">
                        {timeAgo(m.received)}
                      </span>
                      <span className="text-right font-mono text-[12.5px] text-mint max-[640px]:hidden">
                        {m.status === "pending" ? "respond →" : "view →"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-4 font-mono text-[12px] text-muted">
            auto-refreshes every 5s · replies unblock the waiting agent immediately
          </p>
        </Wrap>
      </main>

      {/* drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200",
          openMsg ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpenId(null)}
      />
      <aside
        id="drawer"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col border-l border-line-2 bg-panel transition-transform duration-200 ease-out",
          openMsg ? "translate-x-0" : "translate-x-full",
        )}
      >
        {openMsg && (
          <>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-3">
                <Badge variant={openMsg.status === "pending" ? "pending" : "responded"}>
                  {openMsg.status}
                </Badge>
                <span className="font-mono text-[12px] text-muted">{openMsg.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="cursor-pointer font-mono text-[13px] text-muted transition-colors duration-150 hover:text-ink"
              >
                esc ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                question · {timeAgo(openMsg.received)}
              </p>
              <p className="mt-2 text-[16.5px] leading-relaxed text-ink">{openMsg.q}</p>

              {openMsg.status === "responded" && (
                <div className="mt-6 rounded-xl border border-[rgba(116,242,192,0.25)] bg-[rgba(116,242,192,0.05)] px-4 py-3.5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
                    your answer
                    {openMsg.answeredAt ? ` · ${timeAgo(openMsg.answeredAt)}` : ""}
                  </p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">
                    {openMsg.answer}
                  </p>
                </div>
              )}
            </div>

            {openMsg.status === "pending" && (
              <div className="border-t border-line px-6 py-5">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  autoFocus
                  rows={4}
                  placeholder="type your answer…"
                  className="w-full resize-none rounded-[10px] border border-line-2 bg-white/[0.02] px-3.5 py-3 text-[14.5px] leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-[rgba(116,242,192,0.45)]"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[12px] text-muted">⌘↵ to send</span>
                  <Button size="sm" onClick={sendReply} disabled={sending}>
                    {sending ? "sending…" : "Send reply"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-xl border border-line-2 bg-panel px-4 py-3 font-mono text-[13px] text-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] transition-all duration-200",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            toast?.error
              ? "bg-coral shadow-[0_0_10px_var(--coral)]"
              : "bg-mint shadow-[0_0_10px_var(--mint)]",
          )}
        />
        {toast?.text}
      </div>
    </div>
  );
}
