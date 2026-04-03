import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_SPRITES_HOSTNAME ??
          "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
};

export default nextConfig;

// Enables Cloudflare bindings (KV, R2, D1, etc.) during `next dev`.
// This is a no-op in production — the check is internal to the function.
// Must be placed after `export default` per the OpenNext Cloudflare docs.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
