/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@paper-design/shaders-react", "@paper-design/shaders"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
