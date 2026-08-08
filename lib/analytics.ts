"use client";

import { site } from "./site";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Evento genérico al dataLayer (lo lee GTM → GA4 y Google Ads). */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params, ...getAttribution() });
}

/** Conversión directa de Google Ads (por si no usas GTM). */
export function adsConversion(label: string, value?: number) {
  if (typeof window === "undefined" || !window.gtag || !label) return;
  window.gtag("event", "conversion", {
    send_to: label,
    value: value ?? 1,
    currency: "PEN",
  });
}

/** Conversión + evento GA4 en un solo llamado. */
export function convert(
  tipo: "whatsapp" | "llamada" | "formulario",
  params: Record<string, unknown> = {},
) {
  track(`conv_${tipo}`, params);
  adsConversion(site.adsConversionLabels[tipo]);
}

const KEYS = [
  "gclid", "gbraid", "wbraid",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
];

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
      sessionStorage.setItem("vsi_attr", JSON.stringify(found));
      if (!localStorage.getItem("vsi_attr_first")) {
        localStorage.setItem("vsi_attr_first", JSON.stringify(found));
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
      sessionStorage.getItem("vsi_attr") ||
        localStorage.getItem("vsi_attr_first") ||
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
