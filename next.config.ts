import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Placeholder photography is served from Unsplash while the product is
     * pre-launch. Real listing and job photos will come from our own storage
     * later, at which point this pattern should be replaced rather than
     * extended — a permanent dependency on a third-party image host is not
     * something to carry into production.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
