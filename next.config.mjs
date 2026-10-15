/** @type {import('next').NextConfig} */

// pdfkit charge ses polices standard (Helvetica...) par require dynamique : le traçage de fichiers de Vercel ne les
// voit pas et la fonction plante en production (« Cannot find module .../standard-fonts/Helvetica.cjs »).
const PDFKIT_FILES = ["./node_modules/pdfkit/js/**/*"];

// En-têtes de sécurité sans risque de régression (pas de CSP : elle demande un inventaire complet des sources : Stripe,
// Supabase, images.unsplash.com ; voir docs/audit-ux-visuels-unsplash.md).
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
