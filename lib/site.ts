// ---------------------------------------------------------------------------
// ÚNICO ARCHIVO QUE DEBES EDITAR PARA PONER LOS DATOS REALES.
// Reemplaza los valores marcados con  // TODO
// El contenido de la página (hero, productos, servicios, marcas, FAQ)
// vive en  data/content.json
// ---------------------------------------------------------------------------

export const site = {
  name: "VSI Suministros Industriales",
  legalName: "Suministros Industriales VSI",
  ruc: "20609295539",
  url: "https://vsiperu.com.pe",
  locale: "es_PE",

  // TODO: número real en formato internacional SIN "+" ni espacios (para wa.me)
  whatsapp: "51900000000",
  // TODO: cómo se muestra en pantalla
  whatsappDisplay: "+51 900 000 000",
  // TODO: teléfono fijo
  phone: "+5110000000",
  phoneDisplay: "(01) 000 0000",

  email: "ventas@vsiperu.com.pe",

  // TODO: dirección real (mejora mucho el SEO local y Google Business Profile)
  address: {
    street: "Av. Néstor Gambetta 1234",
    district: "Callao",
    city: "Lima",
    region: "Callao",
    postalCode: "07001",
    country: "PE",
  },
  // TODO: la misma dirección, tal cual la buscarías en Google Maps
  mapQuery: "Av. Néstor Gambetta 1234, Callao, Lima, Perú",

  hours: "Lun–Vie 8:00–18:00 · Sáb 9:00–13:00",
  foundingYear: 2016,

  // TODO: IDs de Google (ver GOOGLE-SETUP.md). Deja "" para desactivar.
  gtmId: "", // GTM-XXXXXXX
  ga4Id: "", // G-XXXXXXXXXX
  adsId: "", // AW-XXXXXXXXX
  adsConversionLabels: {
    whatsapp: "", // AW-XXXXXXXXX/AbCdEfGhIjKl
    llamada: "",
    formulario: "",
  },
  // TODO: código de verificación de Google Search Console (meta tag)
  googleSiteVerification: "",
};

export function waLink(mensaje: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
