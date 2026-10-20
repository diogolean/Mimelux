type Bucket = { count: number; resetAt: number };

const failures = new Map<string, Bucket>();

function limit() {
  return Number(process.env.AUTH_EMAIL_FAIL_LIMIT ?? 5);
}

function ttl() {
  return Number(process.env.AUTH_RATE_TTL_MS ?? 60_000);
}

function bucket(email: string): Bucket {
  const now = Date.now();
  const current = failures.get(email);
  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + ttl() };
    failures.set(email, next);
    return next;
  }
  return current;
}

export function emailLoginBlocked(email: string) {
  return bucket(email).count >= limit();
}

export function recordEmailLoginFailure(email: string) {
  const current = bucket(email);
  current.count += 1;
}

export function clearEmailLoginFailures(email: string) {
  failures.delete(email);
}
