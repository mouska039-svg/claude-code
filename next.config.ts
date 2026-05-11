import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://us-assets.i.posthog.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https://*.supabase.co",
            "font-src 'self'",
            "connect-src 'self' https://*.supabase.co https://api.openai.com https://us.i.posthog.com https://js.stripe.com",
            "frame-src https://js.stripe.com",
          ].join("; "),
        },
      ],
    },
  ],
}

export default nextConfig
