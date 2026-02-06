import type { NextConfig } from 'next';
// import { withSentryConfig } from '@sentry/nextjs';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  // Skip errors chỉ khi có biến môi trường
  typescript: {
    ignoreBuildErrors: !!process.env.SKIP_TYPE_CHECK
  },
  eslint: {
    ignoreDuringBuilds: !!process.env.SKIP_LINT
  }
};

const nextConfig = baseConfig;
export default nextConfig;
