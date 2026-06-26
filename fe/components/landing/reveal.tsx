"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger order within a group; delay = (index % 4) * 70ms, matching the prototype. */
  index?: number;
}

export function Reveal({ children, className, index = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);

    // Reveal above-the-fold content immediately, and a safety net so nothing
    // ever stays hidden if the observer doesn't fire (matches the prototype).
    const raf = requestAnimationFrame(() => {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.92) setShown(true);
    });
    const safety = setTimeout(() => setShown(true), 2200);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-[18px] opacity-0",
        className,
      )}
      style={{ transitionDelay: `${Math.min(index % 4, 3) * 70}ms` }}
    >
      {children}
    </div>
  );
}
