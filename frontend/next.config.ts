import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ||  'http://54.151.219.161:8000'
  },
};

export default nextConfig;
