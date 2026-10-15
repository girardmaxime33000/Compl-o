/** @type {import('next').NextConfig} */

// pdfkit charge ses polices standard (Helvetica...) par require dynamique : le traçage de fichiers de Vercel ne les
// voit pas et la fonction plante en production (« Cannot find module .../standard-fonts/Helvetica.cjs »).
const PDFKIT_FILES = ["./node_modules/pdfkit/js/**/*"];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    outputFileTracingIncludes: {
      "/api/invoices/[id]/pdf": PDFKIT_FILES,
      "/api/invoices/[id]/send": PDFKIT_FILES,
      "/api/simulation/pdf": PDFKIT_FILES,
    },
  },
};

export default nextConfig;
