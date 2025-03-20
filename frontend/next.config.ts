import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
      NEXT_PUBLIC_API_URL: 'http://fastapi-nextjs-connection-875703309.ap-southeast-1.elb.amazonaws.com/get_init',
  },
};

export default nextConfig;
