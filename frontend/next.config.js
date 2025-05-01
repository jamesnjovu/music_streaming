/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['localhost'],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/uploads/**',
        },
        {
          protocol: 'https',
          hostname: 'api.musicstreaming.com',
          pathname: '/uploads/**',
        },
      ],
    },
    async redirects() {
      return [
        {
          source: '/',
          destination: '/admin/dashboard',
          permanent: true,
        },
      ];
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
  };
  
  module.exports = nextConfig;