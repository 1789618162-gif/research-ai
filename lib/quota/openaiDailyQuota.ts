const DEFAULT_DAILY_QUOTA = 20;
const REDIS_COMMAND_TIMEOUT_MS = 5_000;

type RedisCommandResult<T> = {
  result?: T;
  error?: string;
};

export type DailyQuotaResult =
  | {
      allowed: true;
      mode: "enabled";
      limit: number;
      used: number;
      remaining: number;
      resetAt: string;
    }
  | {
      allowed: true;
      mode: "disabled";
    }
  | {
      allowed: false;
      mode: "enabled";
      limit: number;
      used: number;
      remaining: 0;
      resetAt: string;
      reason: "quota_exceeded";
    };

function getDailyQuotaLimit() {
  const value = Number.parseInt(process.env.OPENAI_DAILY_QUOTA ?? "", 10);

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_DAILY_QUOTA;
  }

  return value;
}

function getQuotaWindow() {
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const reset = new Date(now);

  reset.setUTCHours(24, 0, 0, 0);

  return {
    key: `quota:openai:analyze:${dateKey}`,
    resetAt: reset.toISOString(),
    ttlSeconds: Math.max(60, Math.ceil((reset.getTime() - now.getTime()) / 1000)),
  };
}

async function runRedisCommand<T>(
  command: string,
  signal: AbortSignal,
): Promise<T> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error("UPSTASH_REDIS_CONFIG_MISSING");
  }

  const response = await fetch(`${redisUrl.replace(/\/$/, "")}/${command}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`UPSTASH_REDIS_REQUEST_FAILED_${response.status}`);
  }

  const payload = (await response.json()) as RedisCommandResult<T>;

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result as T;
}

export async function consumeOpenAIDailyQuota(): Promise<DailyQuotaResult> {
  const limit = getDailyQuotaLimit();
  const { key, resetAt, ttlSeconds } = getQuotaWindow();

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return { allowed: true, mode: "disabled" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, REDIS_COMMAND_TIMEOUT_MS);

  try {
    const used = await runRedisCommand<number>(
      `incr/${encodeURIComponent(key)}`,
      controller.signal,
    );

    if (used === 1) {
      await runRedisCommand<number>(
        `expire/${encodeURIComponent(key)}/${ttlSeconds}`,
        controller.signal,
      );
    }

    if (used > limit) {
      return {
        allowed: false,
        mode: "enabled",
        limit,
        used,
        remaining: 0,
        resetAt,
        reason: "quota_exceeded",
      };
    }

    return {
      allowed: true,
      mode: "enabled",
      limit,
      used,
      remaining: Math.max(0, limit - used),
      resetAt,
    };
  } catch {
    return { allowed: true, mode: "disabled" };
  } finally {
    clearTimeout(timeout);
  }
}
