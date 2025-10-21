import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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

let configWithPlugins = baseConfig;

// Conditionally enable Sentry configuration
// if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
//   configWithPlugins = withSentryConfig(configWithPlugins, {
//     org: process.env.NEXT_PUBLIC_SENTRY_ORG,
//     project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
//     silent: !process.env.CI,
//     widenClientFileUpload: true,
//     reactComponentAnnotation: {
//       enabled: true
//     },
//     tunnelRoute: '/monitoring',
//     disableLogger: true,
//     telemetry: false
//   });
// }

const nextConfig = configWithPlugins;
export default nextConfig;
