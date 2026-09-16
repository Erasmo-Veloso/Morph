import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import os from "os";
import path from "path";

const repositoryRoot = path.resolve(process.cwd(), "..");
loadEnvConfig(repositoryRoot);

function getHostIps(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal && iface.address) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", ...getHostIps()],
  experimental: {
    useTypeScriptCli: false,
  },
  turbopack: {
    // The canonical Capsule contract lives beside web/ in the repository.
    root: repositoryRoot,
  },
};

export default nextConfig;
