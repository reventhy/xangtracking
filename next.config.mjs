/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/": [
        "./node_modules/tesseract.js/src/worker-script/node/**/*",
        "./node_modules/tesseract.js-core/**/*",
        "./node_modules/wasm-feature-detect/**/*"
      ],
      "/api/fuel-prices": [
        "./node_modules/tesseract.js/src/worker-script/node/**/*",
        "./node_modules/tesseract.js-core/**/*",
        "./node_modules/wasm-feature-detect/**/*"
      ]
    }
  }
};

export default nextConfig;
