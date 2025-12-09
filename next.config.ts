// next.config.ts
import type { NextConfig } from 'next';

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

  experimental: {
    // Correcte locatie in Next.js 16+
    serverComponentsExternalPackages: [
      'genkit',
      '@genkit-ai/google-genai',
      '@genkit-ai/next',
    ],
  },

  webpack: (config, { isServer }) => {
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

export default nextConfig;
