import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolveServerConfig, type DevConsoleServerConfig } from "../config";
import { jobPaths } from "./job";
import { proxyDevRequest, shouldProxyToBackend } from "./proxy";

function authorized(request: Request): boolean {
  const required = process.env.DEV_CONSOLE_PASSWORD;
  if (!required) return true;
  return (request.headers.get("x-dev-token") ?? "") === required;
}

export function createDevUploadHandlers(overrides?: Partial<DevConsoleServerConfig>) {
  if (shouldProxyToBackend()) {
    return {
      GET: (request: Request) => proxyDevRequest(request, "upload"),
      POST: (request: Request) => proxyDevRequest(request, "upload"),
    };
  }

  const cfg = () => resolveServerConfig(overrides);

  async function POST(request: Request) {
    if (!authorized(request)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { projectRoot } = cfg();
    const UPLOAD_DIR = jobPaths(projectRoot).uploadDir;

    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file が必要です" }, { status: 400 });
      }
      const mime = file.type || "image/png";
      if (!mime.startsWith("image/")) {
        return NextResponse.json({ error: "画像ファイルのみ対応しています" }, { status: 400 });
      }

      const ext = mime.includes("jpeg") || mime.includes("jpg")
        ? ".jpg"
        : mime.includes("webp")
          ? ".webp"
          : ".png";
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const name = `paste_${Date.now()}${ext}`;
      const absPath = path.join(UPLOAD_DIR, name);
      fs.writeFileSync(absPath, Buffer.from(await file.arrayBuffer()));

      const uploadUrl = new URL(request.url);
      uploadUrl.search = `?name=${encodeURIComponent(name)}`;

      return NextResponse.json({
        ok: true,
        path: absPath,
        preview_url: uploadUrl.toString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "upload error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  async function GET(request: Request) {
    const { projectRoot } = cfg();
    const UPLOAD_DIR = jobPaths(projectRoot).uploadDir;
    const name = new URL(request.url).searchParams.get("name");
    if (!name || name.includes("..") || name.includes("/")) {
      return NextResponse.json({ error: "invalid name" }, { status: 400 });
    }
    const filePath = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(name).toLowerCase();
    const type =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "image/png";
    return new NextResponse(buf, {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
    });
  }

  return { GET, POST };
}
