import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@ask-dorian/core'],
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET;

    return [
      { source: '/favicon.ico', destination: '/icon' },
      // Local dev proxy: /api/:path* → API_PROXY_TARGET/api/:path*
      ...(apiTarget
        ? [{ source: '/api/:path*', destination: `${apiTarget}/api/:path*` }]
        : []),
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
