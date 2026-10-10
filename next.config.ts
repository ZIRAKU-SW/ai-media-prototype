import type { NextConfig } from "next";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
// Vercel の vercel.app URL を公開窓口にし、配信は自宅鯖（media.wheeebo.com）へ
// プロキシするための origin。NEXT_PUBLIC_PROXY_ORIGIN が無ければ rewrite なし。
const proxyOrigin = (process.env.NEXT_PUBLIC_PROXY_ORIGIN ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@oceanos/dev-console"],
  ...(basePath ? { basePath } : {}),
  ...(proxyOrigin
    ? {
        async rewrites() {
          return {
            beforeFiles: [
              { source: "/:path*", destination: `${proxyOrigin}/:path*` },
            ],
          };
        },
      }
    : {}),
};

export default nextConfig;
