// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // jouw keuze
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },

  serverExternalPackages: [
    'genkit',
    '@genkit-ai/google-genai',
    '@genkit-ai/next',
  ],

  webpack: (config: any, { isServer }: any) => {
    if (isServer) {
      const externals = config.externals || [];

      // voeg alles in één keer toe
      const genkitExternals = [
        'express',
        'import-in-the-middle',
        'require-in-the-middle',
        'genkit',
        '@genkit-ai/google-genai',
        '@genkit-ai/next',
        /^@genkit-ai\//,
      ];

      config.externals = [...externals, ...genkitExternals];
    }

    return config;
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/, // Cache Supabase API calls
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
    {
      urlPattern: /\/api\/.*quiz.*/, // Cache quiz API responses for offline access
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'quiz-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
      },
    },
    {
      urlPattern: /\/materials\/.*/, // Cache materials for offline viewing
      handler: 'CacheFirst',
      options: {
        cacheName: 'materials-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
  ...(nextConfig as any),
});
