// ---------------------------------------------------------------------------
// DATOS DE LA EMPRESA + CONFIGURACIÓN DE MEDICIÓN.
//
// Los IDs de Google YA NO se editan aquí: vienen de variables de entorno
// (ver .env.example y GOOGLE-ADS-SETUP.md). Así se administran desde Vercel
// sin tocar código. Todas son NEXT_PUBLIC_* porque se ejecutan en el navegador
// y no son secretos (viajan en el HTML de cualquier forma).
//
// El contenido de la página (hero, productos, servicios, marcas, FAQ)
// vive en  data/content.json
// ---------------------------------------------------------------------------

/** Lee una env pública y normaliza vacíos/espacios a "". */
const env = (v: string | undefined) => (v ?? "").trim();

// Next.js reemplaza `process.env.NEXT_PUBLIC_*` en build time, por lo que hay
// que escribir el nombre completo y literal de cada variable (no indexar).
const GTM_ID = env(process.env.NEXT_PUBLIC_GTM_ID);
const GA4_ID = env(process.env.NEXT_PUBLIC_GA4_ID);
const ADS_ID = env(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);

export const site = {
  name: "VSI Suministros Industriales",
  legalName: "Suministros Industriales VSI",
  ruc: "20609295539",
  url: "https://vsiperu.com.pe",
  locale: "es_PE",

  // Número en formato internacional SIN "+" ni espacios (para wa.me)
  whatsapp: "51946685886",
  whatsappDisplay: "+51 946 685 886",
  phone: "+51946685886",
  phoneDisplay: "+51 946 685 886",

  email: "ventas@vsiperu.com.pe",
  emailLogistica: "logistica@vsiperu.com.pe",

  address: {
    street: "Av. Guillermo Dansey 1369",
    district: "Cercado de Lima",
    city: "Lima",
    region: "Lima",
    postalCode: "15001",
    country: "PE",
  },
  mapQuery: "Av. Guillermo Dansey 1369, Cercado de Lima, Lima, Perú",

  social: {
    facebook: "https://www.facebook.com/profile.php?id=61552539471982",
    linkedin:
      "https://pe.linkedin.com/in/vsi-per%C3%BA-20a117190?utm_source=share&utm_medium=member_mweb&utm_campaign=share_via&utm_content=profile",
  },

  hours: "Lun–Vie 8:00–18:00 · Sáb 9:00–13:00",
  foundingYear: 2016,

  // --- Medición (todo desde .env / Vercel) ---------------------------------
  gtmId: GTM_ID, // NEXT_PUBLIC_GTM_ID          → GTM-XXXXXXX
  ga4Id: GA4_ID, // NEXT_PUBLIC_GA4_ID          → G-XXXXXXXXXX
  adsId: ADS_ID, // NEXT_PUBLIC_GOOGLE_ADS_ID   → AW-XXXXXXXXX

  /**
   * Etiquetas de conversión de Google Ads en formato `AW-XXXXXXXXX/AbCdEfGhIjKl`.
   * SOLO se usan en modo fallback (sin GTM). Con GTM configurado, la conversión
   * la dispara el contenedor y estas variables se ignoran por completo.
   */
  adsConversionLabels: {
    whatsapp: env(process.env.NEXT_PUBLIC_ADS_CONVERSION_WHATSAPP),
    llamada: env(process.env.NEXT_PUBLIC_ADS_CONVERSION_LLAMADA),
    formulario: env(process.env.NEXT_PUBLIC_ADS_CONVERSION_FORMULARIO),
  },

  // Código de verificación de Google Search Console (meta tag)
  googleSiteVerification: env(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
};

/**
 * Modo de etiquetado ACTIVO. Es una sola fuente de verdad, evaluada igual en
 * servidor y cliente, para que `layout.tsx` (qué scripts cargar) y
 * `analytics.ts` (cómo registrar la conversión) nunca se contradigan.
 *
 *  - "gtm"  → GTM es el único sistema de etiquetado. Todo va al dataLayer.
 *             NO se carga gtag.js ni se llama a gtag() para conversiones.
 *  - "gtag" → No hay GTM. Se carga gtag.js con GA4 y/o Ads y las conversiones
 *             se envían directo con las etiquetas de `adsConversionLabels`.
 *  - "off"  → Sin IDs configurados (desarrollo). Los eventos se siguen
 *             empujando al dataLayer para poder depurarlos, sin red.
 *
 * Nunca puede ser "gtm" y "gtag" a la vez: ahí es donde nacen las conversiones
 * duplicadas.
 */
export type AnalyticsMode = "gtm" | "gtag" | "off";
export const analyticsMode: AnalyticsMode = site.gtmId
  ? "gtm"
  : site.ga4Id || site.adsId
    ? "gtag"
    : "off";

export function waLink(mensaje: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Mensaje estándar de los botones de cotización.
 * Los campos que no se conocen van vacíos para que el cliente los complete.
 */
export function msgCotizar(
  datos: { producto?: string; medida?: string; cantidad?: number | string } = {},
) {
  return [
    "Hola, deseo solicitar una cotización a VSIPERU.",
    "RUC: ",
    "RAZON SOCIAL: ",
    `Producto: ${datos.producto ?? ""}`,
    `Medida: ${datos.medida ?? ""}`,
    `Cantidad: ${datos.cantidad ?? ""}`,
    "Ciudad: ",
  ].join("\n");
}
