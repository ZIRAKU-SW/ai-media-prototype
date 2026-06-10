import type { NextConfig } from "next";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@oceanos/dev-console"],
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
