import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
<<<<<<< HEAD
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
=======
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
};

export default nextConfig;
