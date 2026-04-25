import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Ensure markdown legal docs are bundled into serverless functions
  // (legal pages do readFileSync on docs/LEGAL/*.md at request time)
  outputFileTracingIncludes: {
    "/legal/terms": ["./docs/LEGAL/terms.md"],
    "/legal/privacy": ["./docs/LEGAL/privacy.md"],
    "/legal/disclaimer": ["./docs/LEGAL/disclaimer.md"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
