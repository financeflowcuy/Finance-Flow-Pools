import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  // Aktifkan React Strict Mode untuk development yang lebih baik
  reactStrictMode: true,
  eslint: {
    // Build dengan ESLint untuk kualitas kode yang lebih baik
    ignoreDuringBuilds: false,
  },
  // Optimasi untuk Tailwind CSS
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  }
};

export default nextConfig;
