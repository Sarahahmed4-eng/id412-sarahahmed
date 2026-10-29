import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { networkInterfaces } from "node:os";

// Phones on the same Wi-Fi open the dev server via the laptop's LAN IP.
const lanHosts = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  devIndicators: false,
  allowedDevOrigins: [...lanHosts, "*.local", "192.168.*.*", "10.**", "172.*.*.*"],
  turbopack: { root: __dirname },
  experimental: { agentUpgrade: "security" },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
