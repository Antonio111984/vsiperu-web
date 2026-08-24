import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { site, analyticsMode } from "@/lib/site";
import content from "@/data/content.json";
import "./globals.css";

const head = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-head",
  display: "swap",
});
const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const TITLE =
  "Graseras de Acero Inoxidable y Suministros Industriales | VSI Perú";
const DESC =
  "Importadores directos de graseras de acero inoxidable: rectas, 45° y 90°, en roscas NPT y UNF. También válvulas, empaquetaduras y tubería HDPE. Stock en Lima y despacho a todo el Perú.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: TITLE, template: "%s | VSI Suministros Industriales" },
  description: DESC,
  keywords: [
    "graseras", "graseras de acero inoxidable", "graseras inoxidables",
    "graseras industriales", "grasera recta", "grasera 45 grados", "grasera 90 grados",
    "graseras NPT", "graseras UNF",
    "venta de graseras Lima", "graseras al por mayor Perú",
    "válvulas cuchilla", "válvula cuchilla unidireccional", "válvula cuchilla bidireccional",
    "tubería HDPE corrugada", "accesorios HDPE", "planchas de acero",
    "suministros industriales Perú", "proveedor industrial Lima", "VSI Perú",
  ],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.legalName,
  alternates: { canonical: site.url },
  category: "Suministros industriales",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: site.url,
    siteName: site.name,
    title: TITLE,
    description: DESC,
    images: [
      { url: "/og-vsi.jpg", width: 1200, height: 630, alt: site.name },
    ],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-vsi.jpg"] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Iconos servidos desde public/. El .ico y el .png se generan a partir de
  // public/vsiperu-favicon.svg, que es la fuente de verdad.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/vsiperu-favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  verification: site.googleSiteVerification
    ? { google: site.googleSiteVerification }
    : undefined,
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#083B7A",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo: `${site.url}/vsiperu-logo.svg`,
      foundingDate: String(site.foundingYear),
      taxID: site.ruc,
      areaServed: { "@type": "Country", name: "Perú" },
      sameAs: [site.social.facebook, site.social.linkedin],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: site.phone,
          contactType: "sales",
          areaServed: "PE",
          availableLanguage: ["Spanish"],
        },
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}/#business`,
      name: site.name,
      image: `${site.url}/og-vsi.jpg`,
      url: site.url,
      telephone: site.phone,
      email: site.email,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.district,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "13:00" },
      ],
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "es-PE",
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "ItemList",
      name: "Líneas de producto",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Graseras de acero inoxidable rectas, 45° y 90° (roscas NPT y UNF)", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 2, name: "Válvulas industriales", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 3, name: "Empaquetaduras y sellado industrial", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 4, name: "Tubería HDPE y accesorios", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 5, name: "Planchas y perfiles", url: `${site.url}/#catalogo` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${site.url}/#faq`,
      // Fuente única: data/content.json. Así el schema nunca se desincroniza
      // del acordeón visible, que es lo que Google exige para el rich result.
      mainEntity: content.faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${head.variable} ${body.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* ------------------------------------------------------------------
           MEDICIÓN — un solo sistema activo a la vez (ver lib/analytics.ts).

           analyticsMode === "gtm"  → solo el contenedor de GTM. Es el modo
             recomendado y el que documenta GOOGLE-ADS-SETUP.md. gtag.js NO se
             carga: si conviviera con GTM, la misma conversión podría contarse
             dos veces (una por el contenedor y otra por la etiqueta directa).

           analyticsMode === "gtag" → fallback sin contenedor.
           analyticsMode === "off"  → desarrollo: sin scripts de Google.
        ------------------------------------------------------------------ */}

        {/* El dataLayer existe antes que cualquier script para que ningún
            evento temprano se pierda. */}
        <Script id="dl-init" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];`}
        </Script>

        {analyticsMode === "gtm" ? (
          <>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${site.gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        ) : null}

        {analyticsMode === "gtag" ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${site.ga4Id || site.adsId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${site.ga4Id ? `gtag('config','${site.ga4Id}');` : ""}${site.adsId ? `gtag('config','${site.adsId}');` : ""}`}
            </Script>
          </>
        ) : null}

        {children}
      </body>
    </html>
  );
}
