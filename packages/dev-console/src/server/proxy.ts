import { NextResponse } from "next/server";

const FORWARD_HEADERS = ["x-dev-token", "content-type", "accept"];

/** Vercel 等サーバーレス → GCP VM バックエンドへ転送するモード */
export function shouldProxyToBackend(): boolean {
  return Boolean(process.env.DEV_CONSOLE_BACKEND_URL?.trim());
}

function backendBase(): string {
  const base = process.env.DEV_CONSOLE_BACKEND_URL?.trim();
  if (!base) {
    throw new Error("DEV_CONSOLE_BACKEND_URL が未設定です");
  }
  return base.replace(/\/$/, "");
}

function rewritePreviewUrl(previewUrl: string, request: Request): string {
  const preview = new URL(previewUrl);
  const proxyBase = new URL(request.url);
  preview.protocol = proxyBase.protocol;
  preview.host = proxyBase.host;
  return preview.toString();
}

/** /api/dev/{endpoint} をバックエンドへそのまま転送 */
export async function proxyDevRequest(
  request: Request,
  endpoint: "chat" | "upload" | "deploy" | "health",
): Promise<Response> {
  const incoming = new URL(request.url);
  const target = `${backendBase()}/api/dev/${endpoint}${incoming.search}`;
  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let body: BodyInit | undefined;
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
      headers.delete("content-type");
    } else {
      body = await request.text();
    }
  }

  let response: Response;
  try {
    response = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "バックエンドへの接続に失敗しました";
    return NextResponse.json(
      {
        error: message,
        hint: "GCP VM の Next.js (PM2) とファイアウォール tcp:3000 を確認してください",
      },
      { status: 502 },
    );
  }

  if (endpoint === "upload" && method === "POST" && response.ok) {
    try {
      const json = (await response.json()) as { preview_url?: string };
      if (json.preview_url) {
        json.preview_url = rewritePreviewUrl(json.preview_url, request);
        return NextResponse.json(json, { status: response.status });
      }
    } catch {
      /* fall through */
    }
  }

  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-encoding");
  return new Response(response.body, {
    status: response.status,
    headers: outHeaders,
  });
}
