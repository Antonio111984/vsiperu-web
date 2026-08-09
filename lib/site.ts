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
