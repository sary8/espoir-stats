const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface AttemptEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

interface HeaderReader {
  get(name: string): string | null;
}

const attempts = new Map<string, AttemptEntry>();

function getRetryAfterSec(resetAt: number, now: number): number {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}

function pruneExpired(now: number): void {
  for (const [key, entry] of attempts.entries()) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export function getClientKey(headers: HeaderReader): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export function getLoginRateLimitStatus(clientKey: string, now = Date.now()): RateLimitResult {
  pruneExpired(now);
  const entry = attempts.get(clientKey);
  if (!entry) {
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: getRetryAfterSec(entry.resetAt, now),
    };
  }

  return { allowed: true, retryAfterSec: 0 };
}

export function recordLoginFailure(clientKey: string, now = Date.now()): RateLimitResult {
  pruneExpired(now);
  const entry = attempts.get(clientKey);

  if (!entry) {
    attempts.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  attempts.set(clientKey, entry);

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: getRetryAfterSec(entry.resetAt, now),
    };
  }

  return { allowed: true, retryAfterSec: 0 };
}

export function clearLoginFailures(clientKey: string): void {
  attempts.delete(clientKey);
}

export function resetLoginRateLimitForTests(): void {
  attempts.clear();
}

