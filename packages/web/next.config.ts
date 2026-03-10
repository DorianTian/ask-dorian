import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@ask-dorian/core"],
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icon" },
    ]
  },
}

export default withNextIntl(nextConfig)
