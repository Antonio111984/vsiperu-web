import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site";
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
  "Graseras, Válvulas y Suministros Industriales en Perú | VSI";
const DESC =
  "Importadores directos de graseras (rectas, 45° y 90°) y válvulas cuchilla uni y bidireccionales. Stock inmediato en Lima, despacho a todo el Perú. Cotiza por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: TITLE, template: "%s | VSI Suministros Industriales" },
  description: DESC,
  keywords: [
    "graseras", "graseras rectas", "graseras 45 grados", "graseras 90 grados",
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
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
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
      logo: `${site.url}/logo-vsi.svg`,
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
        { "@type": "ListItem", position: 1, name: "Graseras rectas, 45° y 90°", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 2, name: "Válvulas cuchilla uni y bidireccionales", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 3, name: "Tubería HDPE corrugada y accesorios", url: `${site.url}/#catalogo` },
        { "@type": "ListItem", position: 4, name: "Planchas de acero", url: `${site.url}/#catalogo` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${site.url}/#faq`,
      mainEntity: [
        ["¿Qué tipos de graseras manejan?", "Manejamos graseras rectas, de 45° y de 90°, en todas las medidas y grados. Somos importadores directos, por lo que atendemos tanto pedidos por unidad como volúmenes mayoristas."],
        ["¿Cuál es la diferencia entre una válvula cuchilla unidireccional y una bidireccional?", "La unidireccional sella en un solo sentido del flujo y es la opción más económica para líneas de descarga. La bidireccional garantiza estanqueidad en ambos sentidos y se usa cuando la presión puede invertirse."],
        ["¿Despachan a provincias?", "Sí. Despachamos a todo el Perú y coordinamos el envío a mina, planta u obra a través del operador logístico que prefieras."],
        ["¿Venden a empresas con factura?", `Sí. Somos ${site.legalName}, RUC ${site.ruc}, y emitimos factura electrónica en todas nuestras ventas.`],
        ["¿En cuánto tiempo responden una cotización?", "Dentro de las 24 horas hábiles. Por WhatsApp la respuesta suele ser el mismo día, en horario de oficina."],
      ].map(([q, a]) => ({
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
        {site.gtmId ? (
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

        {!site.gtmId && (site.ga4Id || site.adsId) ? (
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
