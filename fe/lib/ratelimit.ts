import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis holds rate-limit counters ONLY — no question data ever lands here.
export const redis = Redis.fromEnv();

// POST /api/ask, per client IP: 3 asks per hour.
export const askIpLimit = new Ratelimit({
  redis,
  prefix: "ask:ip",
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});

// GET /api/messages/[id], per question id: 60 polls per minute.
export const pollIdLimit = new Ratelimit({
  redis,
  prefix: "poll:id",
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

const GLOBAL_DAILY_CAP = 100;
const DAY_SECONDS = 24 * 60 * 60;

export interface GlobalCapResult {
  ok: boolean;
  count: number;
}

// Global daily cap across everyone: at most 30 asks per UTC day. Uses a plain
// INCR with a 24h expiry set on the first increment of the day.
export async function globalCap(today: string): Promise<GlobalCapResult> {
  const key = `global:${today}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, DAY_SECONDS);
  }
  return { ok: count <= GLOBAL_DAILY_CAP, count };
}
