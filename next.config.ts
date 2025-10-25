import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alagaqnzjwolalrvdbou.supabase.co",
        // allow any file under the public storage path
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;