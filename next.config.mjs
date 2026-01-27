/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['imapflow', 'pino', 'thread-stream', 'pino-pretty'],
}

export default nextConfig
