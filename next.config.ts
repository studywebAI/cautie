import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        http2: false,
        dns: false,
        async_hooks: false,
        dgram: false,
        child_process: false,
        buffer: false, // Add buffer
        events: false, // Add events
        https: false, // Add https
        perf_hooks: false, // Add perf_hooks
        worker_threads: false, // Add worker_threads
        'stream/web': false, // Add stream/web
      };
    }

    // Handle 'node:' prefixed imports
    config.plugins.push(
      new (require('webpack').NormalModuleReplacementPlugin)(
        /^node:/,
        (resource: any) => {
          resource.request = resource.request.replace(/^node:/, '');
        }
      )
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'app'),
    };
    return config;
  },
};

export default nextConfig;
