// next.config.js

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/lrigu76hy/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

// ✅ merge analyzer + config
module.exports = withBundleAnalyzer(nextConfig);


