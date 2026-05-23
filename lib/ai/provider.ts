import OpenAI from "openai";
import { ProxyAgent, fetch as undiciFetch } from "undici";

export type AiProvider = "dashscope" | "openai";

export type AiConfig = {
  apiKey: string;
  baseURL?: string;
  enableWebSearch: boolean;
  model: string;
  provider: AiProvider;
};

const DASHSCOPE_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

function getBooleanEnv(...names: string[]) {
  return names.some((name) => process.env[name] === "true");
}

function getFirstEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function getAiConfig(defaultOpenAIModel: string): AiConfig | null {
  const dashscopeApiKey = getFirstEnv("DASHSCOPE_API_KEY");

  if (dashscopeApiKey) {
    return {
      apiKey: dashscopeApiKey,
      baseURL:
        getFirstEnv("DASHSCOPE_BASE_URL", "OPENAI_BASE_URL") ??
        DASHSCOPE_BASE_URL,
      enableWebSearch: getBooleanEnv(
        "QWEN_ENABLE_SEARCH",
        "OPENAI_ENABLE_WEB_SEARCH",
      ),
      model: getFirstEnv("QWEN_MODEL", "OPENAI_MODEL") ?? "qwen-plus",
      provider: "dashscope",
    };
  }

  const openAIKey = getFirstEnv("OPENAI_API_KEY");

  if (!openAIKey) {
    return null;
  }

  return {
    apiKey: openAIKey,
    baseURL: getFirstEnv("OPENAI_BASE_URL"),
    enableWebSearch: getBooleanEnv("OPENAI_ENABLE_WEB_SEARCH"),
    model: getFirstEnv("OPENAI_MODEL") ?? defaultOpenAIModel,
    provider: "openai",
  };
}

export function createAiClient(config: AiConfig, timeoutMs: number) {
  const proxyUrl =
    process.env.OPENAI_PROXY_URL ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  const baseOptions = {
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: timeoutMs,
    maxRetries: 0,
  };

  if (!proxyUrl) {
    return new OpenAI(baseOptions);
  }

  const dispatcher = new ProxyAgent(proxyUrl);
  const proxiedFetch: typeof fetch = (async (url, init) => {
    const response = await undiciFetch(
      url as Parameters<typeof undiciFetch>[0],
      {
        ...init,
        dispatcher,
      } as Parameters<typeof undiciFetch>[1],
    );

    return response as unknown as Response;
  }) as typeof fetch;

  return new OpenAI({
    ...baseOptions,
    fetch: proxiedFetch,
  });
}

export function getAiConfigMissingMessage() {
  return "DASHSCOPE_API_KEY or OPENAI_API_KEY is not configured.";
}
