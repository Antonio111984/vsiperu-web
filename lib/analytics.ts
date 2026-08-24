"use client";

import { site, analyticsMode } from "./site";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

/* ==========================================================================
   ARQUITECTURA DE MEDICIÓN — decisión explícita
   --------------------------------------------------------------------------
   FUENTE PRINCIPAL: Google Tag Manager.
   Web → dataLayer → GTM → (GA4 + Google Ads)

   Con NEXT_PUBLIC_GTM_ID definido (`analyticsMode === "gtm"`):
     · TODO evento se empuja al dataLayer y nada más.
     · NO se carga gtag.js y NO se llama a window.gtag() para conversiones.
       El contenedor es el único que dispara la etiqueta de Google Ads.
     · Resultado: una acción del usuario = un push = una conversión.

   Sin GTM pero con GA4/Ads (`analyticsMode === "gtag"`):
     · Fallback: se carga gtag.js desde layout.tsx y la conversión se envía
       directo con las etiquetas de site.adsConversionLabels.
     · Se conserva porque permite medir sin contenedor, pero NO es el camino
       recomendado y jamás convive con GTM.

   Sin IDs (`analyticsMode === "off"`, desarrollo):
     · Solo se empuja al dataLayer para poder inspeccionarlo en consola.

   ⚠️ Regla operativa que acompaña a este código (ver GOOGLE-ADS-SETUP.md):
      si estas conversiones ya se miden con GTM → Google Ads, NO importarlas
      además desde GA4 como conversiones Primary de Ads. Ese es el otro origen
      clásico de doble conteo, y vive en la configuración, no en el código.
   ========================================================================== */

/** Los tres eventos son el contrato estable con GTM. No renombrar. */
export type ConvTipo = "whatsapp" | "llamada" | "formulario";

/** Parámetros de negocio que acompañan a una conversión. Todos opcionales. */
export type ConvMeta = {
  /** Dónde hizo clic: hero_1, header, catalogo_card, modal_producto, … */
  origen?: string;
  producto?: string;
  categoria?: string;
  sku?: string;
  medida?: string;
  cantidad?: number | string;
  /** Cualquier extra puntual y NO personal. */
  [k: string]: unknown;
};

/** Claves de atribución capturadas de la URL de entrada. */
const KEYS = [
  "gclid", "gbraid", "wbraid",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
];

/**
 * Parámetros de negocio que GTM puede leer como variables de Data Layer.
 * Se limpian antes de cada push para que un evento no herede los valores del
 * anterior (el dataLayer es persistente: sin este reset, un clic en el footer
 * arrastraría el `producto` del último modal abierto).
 */
const RESET_KEYS = [
  "origen", "producto", "categoria", "sku", "medida", "cantidad", "focus",
];

const STORE_ATTR = "vsi_attr";
const STORE_ATTR_FIRST = "vsi_attr_first";
const STORE_FOCUS = "vsi_focus";

/** Quita undefined, null y strings vacíos: al dataLayer no entra basura. */
function limpiar(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
}

/** Evento genérico al dataLayer (lo lee GTM → GA4 y Google Ads). */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];

  // 1) Reset: anula los parámetros de negocio del evento anterior.
  const reset: Record<string, unknown> = {};
  RESET_KEYS.forEach((k) => (reset[k] = undefined));
  window.dataLayer.push(reset);

  // 2) Push real. La atribución va primero para que un parámetro explícito
  //    del llamador siempre pueda sobrescribirla. `captured_at` se excluye:
  //    es control interno del almacenamiento, no parte del contrato con GTM.
  const { captured_at: _omit, ...attr } = getAttribution();
  window.dataLayer.push({
    event,
    ...limpiar(attr),
    ...limpiar({ focus: getFocus(), landing_page: getLandingPage() }),
    ...limpiar(params),
  });
}

/**
 * Conversión directa de Google Ads. SOLO en modo fallback (sin GTM).
 *
 * `value` es opcional a propósito: antes se enviaba `value: 1, currency: PEN`
 * en todas las conversiones, lo que inventa un valor comercial de S/1 por lead
 * y contamina cualquier estrategia futura de ROAS. Si no hay un valor real,
 * no se envía ninguno.
 */
export function adsConversion(
  label: string,
  value?: number,
  currency = "PEN",
) {
  if (analyticsMode !== "gtag") return; // con GTM, la conversión es del contenedor
  if (typeof window === "undefined" || !window.gtag || !label) return;

  const payload: Record<string, unknown> = { send_to: label };
  if (typeof value === "number" && Number.isFinite(value)) {
    payload.value = value;
    payload.currency = currency;
  }
  window.gtag("event", "conversion", payload);
}

/**
 * Registra una conversión: `conv_whatsapp` | `conv_llamada` | `conv_formulario`.
 *
 * Un solo llamado por acción del usuario. En particular, el envío del
 * formulario dispara ÚNICAMENTE `conv_formulario`, nunca también
 * `conv_whatsapp`, aunque el flujo termine abriendo WhatsApp.
 */
export function convert(tipo: ConvTipo, meta: ConvMeta = {}) {
  track(`conv_${tipo}`, meta);
  // No-op cuando GTM está activo (ver adsConversion).
  adsConversion(site.adsConversionLabels[tipo], meta.value as number | undefined);
}

/* -------------------------------------------------------------------------
   ATRIBUCIÓN (gclid / UTM) y MODO CAMPAÑA (?focus=)
------------------------------------------------------------------------- */

/** Guarda gclid/UTM en la primera visita para adjuntarlos a cada lead. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  KEYS.forEach((k) => {
    const v = p.get(k);
    if (v) found[k] = v;
  });
  if (Object.keys(found).length) {
    found["landing_page"] = window.location.pathname;
    found["captured_at"] = new Date().toISOString();
    try {
      sessionStorage.setItem(STORE_ATTR, JSON.stringify(found));
      if (!localStorage.getItem(STORE_ATTR_FIRST)) {
        localStorage.setItem(STORE_ATTR_FIRST, JSON.stringify(found));
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

export function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      sessionStorage.getItem(STORE_ATTR) ||
        localStorage.getItem(STORE_ATTR_FIRST) ||
        "{}",
    );
  } catch {
    return {};
  }
}

export function attributionText(): string {
  const a = getAttribution();
  const parts = KEYS.filter((k) => a[k]).map((k) => `${k}=${a[k]}`);
  return parts.join(" | ");
}

/** Valores admitidos en `?focus=`. Hoy la campaña activa es solo graseras. */
const FOCUS_VALIDOS = ["graseras"] as const;
export type Focus = (typeof FOCUS_VALIDOS)[number];

/**
 * Lee `?focus=graseras` de la URL y lo persiste en la sesión, para que el
 * parámetro siga acompañando a los eventos aunque el usuario navegue por
 * anclas y el query se pierda.
 */
export function captureFocus(): Focus | "" {
  if (typeof window === "undefined") return "";
  const v = (new URLSearchParams(window.location.search).get("focus") || "")
    .trim()
    .toLowerCase();
  const valido = (FOCUS_VALIDOS as readonly string[]).includes(v)
    ? (v as Focus)
    : "";
  if (valido) {
    try {
      sessionStorage.setItem(STORE_FOCUS, valido);
    } catch {
      /* almacenamiento no disponible */
    }
  }
  return valido;
}

export function getFocus(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(STORE_FOCUS) || "";
  } catch {
    return "";
  }
}

/** Página de aterrizaje real; cae a la guardada en la atribución si existe. */
function getLandingPage(): string {
  if (typeof window === "undefined") return "";
  return getAttribution().landing_page || window.location.pathname;
}
