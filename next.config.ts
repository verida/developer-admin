import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Enable the check again. This is now to disable next.js checking node_modules type errors on building the app
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.node = {
      __dirname: true,
    }

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "5021",
      },
    ],
  },
}

export default nextConfig
