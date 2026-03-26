/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/api/fuel-prices": [
        "./node_modules/tesseract.js/**/*",
        "./node_modules/tesseract.js-core/**/*"
      ]
    }
  }
};

export default nextConfig;
