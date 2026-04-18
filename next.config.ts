import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Docker 경량 빌드
};

export default nextConfig;
