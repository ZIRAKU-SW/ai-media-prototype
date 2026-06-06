const GATEWAY_STATUSES = new Set([502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bodyLooksLikeHtml(res: Response): Promise<boolean> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return false;
  const text = await res.clone().text();
  return text.trimStart().startsWith("<");
}

/**
 * Next 再起動や Nginx 502 時に HTML が返るため、dev コンソール用に短いリトライを行う。
 */
export async function fetchJsonWithRetry(
  url: string,
  init?: RequestInit,
  options?: { retries?: number; delayMs?: number },
): Promise<Response> {
  const retries = options?.retries ?? 30;
  const delayMs = options?.delayMs ?? 2000;
  let last: Response | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, init);
      last = res;
      const gateway = GATEWAY_STATUSES.has(res.status);
      const html = !res.ok && (await bodyLooksLikeHtml(res));
      if (gateway || html) {
        if (attempt < retries - 1) {
          await sleep(delayMs);
          continue;
        }
      }
      return res;
    } catch (err) {
      if (attempt >= retries - 1) throw err;
      await sleep(delayMs);
    }
  }
  if (last) return last;
  throw new Error("fetch failed");
}

export async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    if (text.trimStart().startsWith("<")) {
      const hint =
        res.status >= 502 && res.status <= 504
          ? "サーバーが一時停止中です（ビルド・再起動の可能性）"
          : "サーバーが HTML を返しました";
      throw new Error(`${hint}（HTTP ${res.status}）。しばらく待ってから再送してください。`);
    }
    throw new Error(text.slice(0, 300) || `HTTP ${res.status}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}
