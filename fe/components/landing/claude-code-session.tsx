"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

const AST = ["✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳"];

const TASK = "I would like to deploy agent. Shall I use Vercel or Cloudflare?";
const QUESTION = "Vercel or Cloudflare for the deploy?";
const ANSWER = "Vercel is much better.";

type Row =
  | { kind: "spacer" }
  | { kind: "user"; text: string }
  | { kind: "asst"; text: string; check?: boolean }
  | { kind: "tool"; fn: string; args: string }
  | { kind: "ret"; text: string }
  | { kind: "wait"; status: "pending" | "responded"; answer: string };

type InputState =
  | { kind: "placeholder" }
  | { kind: "typing"; text: string }
  | { kind: "cursor" };

type Status = { frame: string; label: string; esc: string } | null;

function Mascot() {
  return (
    <svg
      width="34"
      height="31"
      viewBox="0 0 9 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="mt-1 flex-none"
    >
      <g fill="var(--coral)">
        <rect x="1" y="0" width="1" height="1" />
        <rect x="6" y="0" width="1" height="1" />
        <rect x="0" y="1" width="8" height="5" />
        <rect x="1" y="6" width="1" height="1" />
        <rect x="4" y="6" width="1" height="1" />
        <rect x="6" y="6" width="1" height="1" />
      </g>
      <rect x="2" y="2" width="1" height="1" fill="#0a0d0c" />
      <rect x="5" y="2" width="1" height="1" fill="#0a0d0c" />
    </svg>
  );
}

function Cursor() {
  return (
    <span className="ml-[2px] inline-block h-4 w-2 animate-blink bg-mint align-[-3px] motion-reduce:animate-none" />
  );
}

function TranscriptRow({ row }: { row: Row }) {
  const base = "whitespace-pre-wrap break-words";
  switch (row.kind) {
    case "spacer":
      return <div className="h-2.5" />;
    case "user":
      return (
        <div className={`${base} text-muted`}>
          ❯ <span className="text-ink-dim">{row.text}</span>
        </div>
      );
    case "asst":
      return (
        <div className={base}>
          <span className="mr-[9px] text-ink">●</span>
          <span className="text-ink">{row.text}</span>
          {row.check && <span className="text-mint"> ✓</span>}
        </div>
      );
    case "tool":
      return (
        <div className={base}>
          <span className="mr-[9px] text-mint">●</span>
          <span className="font-semibold text-ink">{row.fn}</span>
          <span className="text-ink-dim">({row.args})</span>
        </div>
      );
    case "ret":
      return (
        <div className={`${base} pl-[21px] text-muted`}>
          <span className="mr-2">⎿</span>
          {row.text}
        </div>
      );
    case "wait":
      return (
        <div className={`${base} pl-[21px] text-muted`}>
          <span className="mr-2">⎿</span>
          {row.status === "pending" ? (
            <Badge variant="pending">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-current motion-reduce:animate-none" />
              pending
            </Badge>
          ) : (
            <>
              <Badge variant="responded">
                <span className="size-1.5 rounded-full bg-current" />
                responded
              </Badge>{" "}
              <span className="text-mint-hi">{row.answer}</span>
            </>
          )}
        </div>
      );
  }
}

export function ClaudeCodeSession() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [input, setInput] = useState<InputState>({ kind: "placeholder" });

  useEffect(() => {
    let alive = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    const push = (row: Row) => setRows((prev) => [...prev, row]);
    const replaceLast = (row: Row) => setRows((prev) => [...prev.slice(0, -1), row]);

    async function typeText(
      text: string,
      speed: number,
      update: (partial: string) => void,
    ): Promise<void> {
      if (reduce) {
        update(text);
        return;
      }
      for (let i = 1; i <= text.length; i++) {
        if (!alive) return;
        update(text.slice(0, i));
        await sleep(speed + Math.random() * 26);
      }
    }

    async function run(): Promise<void> {
      while (alive) {
        setRows([]);
        setStatus(null);

        // idle placeholder, then the user types a task
        setInput({ kind: "placeholder" });
        await sleep(reduce ? 60 : 1100);
        if (!alive) return;
        setInput({ kind: "typing", text: "" });
        await typeText(TASK, 30, (t) => setInput({ kind: "typing", text: t }));
        await sleep(430);
        if (!alive) return;

        // submit -> dim user row in transcript, input clears
        push({ kind: "user", text: TASK });
        setInput({ kind: "cursor" });

        // thinking shimmer
        const frames = reduce ? 1 : 8;
        for (let a = 0; a < frames; a++) {
          if (!alive) return;
          setStatus({ frame: AST[a % AST.length], label: "Deliberating…", esc: "(esc to interrupt)" });
          await sleep(130);
        }
        setStatus(null);

        push({ kind: "spacer" });
        push({ kind: "asst", text: "That's a judgment call, not a coin flip — paging a human." });
        await sleep(700);
        if (!alive) return;

        // tool: rentoleh ask
        push({ kind: "spacer" });
        push({ kind: "tool", fn: "Bash", args: "" });
        await typeText(`rentoleh ask "${QUESTION}"`, 17, (t) =>
          replaceLast({ kind: "tool", fn: "Bash", args: t }),
        );
        await sleep(320);
        if (!alive) return;
        push({ kind: "ret", text: "msg_1234 · queued for Oleh" });
        await sleep(620);
        if (!alive) return;

        // tool: rentoleh wait — long-poll with live status line
        push({ kind: "spacer" });
        push({ kind: "tool", fn: "Bash", args: "rentoleh messages wait msg_1234" });
        push({ kind: "wait", status: "pending", answer: "" });
        const ticks = reduce ? 2 : 20;
        for (let k = 0; k < ticks; k++) {
          if (!alive) return;
          setStatus({
            frame: AST[k % AST.length],
            label: "Waiting for Oleh…",
            esc: `(esc to interrupt · ${((k + 1) * 0.12).toFixed(1)}s)`,
          });
          await sleep(120);
        }
        setStatus(null);
        await typeText(`"${ANSWER}"`, 22, (t) =>
          replaceLast({ kind: "wait", status: "responded", answer: t }),
        );
        await sleep(560);
        if (!alive) return;

        // agent continues with the human's call
        push({ kind: "spacer" });
        push({ kind: "asst", text: "Oleh answered in 2.4s — going with his call.", check: true });

        await sleep(reduce ? 4500 : 6400);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, []);

  let field: ReactNode;
  if (input.kind === "placeholder") {
    field = <span className="text-muted">Try &quot;edit &lt;filepath&gt; to…&quot;</span>;
  } else if (input.kind === "typing") {
    field = (
      <>
        {input.text}
        <Cursor />
      </>
    );
  } else {
    field = <Cursor />;
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line-2 bg-gradient-to-b from-[#0c100f] to-[#090c0b] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(116,242,192,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.015] px-3.5 py-[11px]">
        <span className="flex flex-none gap-[7px]">
          <i className="block size-[11px] rounded-full bg-[#ff5f57]" />
          <i className="block size-[11px] rounded-full bg-[#febc2e]" />
          <i className="block size-[11px] rounded-full bg-[#28c840]" />
        </span>
        <span className="flex-1 text-center font-mono text-xs text-muted">
          <span className="text-coral">✳</span> <span className="font-semibold text-ink-dim">Claude Code</span> —
          ~/hacks/rentoleh/fe
        </span>
        <span className="invisible flex flex-none gap-[7px]" aria-hidden="true">
          <i className="block size-[11px] rounded-full" />
          <i className="block size-[11px] rounded-full" />
          <i className="block size-[11px] rounded-full" />
        </span>
      </div>

      {/* body */}
      <div className="flex min-h-[532px] flex-col px-[18px] py-4 font-mono text-[13px] leading-[1.72]">
        {/* header */}
        <div className="flex items-start gap-3.5">
          <Mascot />
          <div>
            <div className="font-bold text-ink">
              Claude Code <span className="font-normal text-muted">v2.1.170</span>
            </div>
            <div className="text-ink-dim">
              Opus 4.8 (1M context) · <span className="text-muted">Claude Max</span>
            </div>
            <div className="text-muted">~/hacks/rentoleh/fe</div>
          </div>
        </div>

        {/* tip */}
        <div className="mt-3.5 border-l-2 border-coral py-px pl-3 text-ink-dim">
          <span className="font-medium text-coral">rentoleh</span> skill loaded — this agent can
          page a human.
          <br />
          <span className="text-muted">
            Questions land on Oleh&#39;s dashboard · answers come back in-session.
          </span>
        </div>

        {/* transcript */}
        <div className="mt-3.5 flex-1">
          {rows.map((row, i) => (
            <TranscriptRow key={i} row={row} />
          ))}
        </div>

        {/* status line */}
        <div className="mt-3 min-h-[23px] flex-none text-coral">
          {status ? (
            <>
              {status.frame} {status.label} <span className="text-muted">{status.esc}</span>
            </>
          ) : (
            " "
          )}
        </div>

        {/* input box */}
        <div className="mt-2 flex flex-none items-baseline gap-2.5 rounded-[9px] border border-line-2 bg-white/[0.02] px-[13px] py-2.5">
          <span className="font-semibold text-ink-dim">❯</span>
          <span className="min-w-0 flex-1 text-ink">{field}</span>
        </div>

        {/* hint row */}
        <div className="mt-[9px] flex flex-none justify-between gap-4 text-[11px] text-muted">
          <span>? for shortcuts</span>
          <span>
            ⏵⏵ accept edits on <span className="opacity-[0.65]">(shift+tab to cycle)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
