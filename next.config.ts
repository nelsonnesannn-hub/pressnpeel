import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Permanent redirect: www.pressnpeel.sg → https://pressnpeel.sg (apex).
        // The www domain stays attached to the Vercel project; this only
        // canonicalises the hostname.
        source: "/:path*",
        has: [{ type: "host", value: "www.pressnpeel.sg" }],
        destination: "https://pressnpeel.sg/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
