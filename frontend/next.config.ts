import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "tap");
    // Fix for @metamask/sdk trying to import react-native-async-storage
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
};

export default nextConfig;
