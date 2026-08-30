const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 20 }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.timestamp > options.windowMs) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: options.maxRequests - 1 };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now - entry.timestamp > 300000) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}
