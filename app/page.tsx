"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { site, waLink, msgCotizar } from "@/lib/site";
import {
  captureAttribution,
  captureFocus,
  convert,
  attributionText,
  type ConvMeta,
} from "@/lib/analytics";
import content from "@/data/content.json";

/* ==========================================================================
   Clases repetidas (equivalentes 1:1 a las clases CSS de la v1)
   ========================================================================== */
const CONTAINER = "mx-auto max-w-page px-6";
const SECTION = "py-[clamp(46px,6.6vw,88px)]";
const EYEBROW = "text-[13.5px] font-bold uppercase tracking-[.14em] text-naranja";
const H2 = "mt-3 text-[clamp(24px,3.4vw,40px)] leading-[1.12]";
const HEAD_ROW = "mb-[38px] flex flex-wrap items-end justify-between gap-6";
const BTN_CTA =
  "inline-flex items-center gap-2.5 rounded-md bg-naranja font-bold text-white hover:bg-naranja-osc hover:text-white";
const TILE =
  "relative block overflow-hidden rounded-[14px] border-none bg-azul-tile p-0 text-left";
const TILE_GRAD =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,43,89,.08)_0%,rgba(5,43,89,.52)_44%,rgba(5,43,89,.94)_100%)]";
const TILE_GRAD_TALL =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,43,89,.1)_0%,rgba(5,43,89,.55)_46%,rgba(5,43,89,.94)_100%)]";
const TILE_SHADOW = "[text-shadow:0_2px_14px_rgba(0,0,0,.4)]";
const TILE_PILL =
  "mt-3 inline-flex items-center gap-2 rounded-full bg-naranja px-[18px] py-2.5 text-[13.5px] font-bold text-white";
const FIELD = "grid gap-2 text-[15px] font-bold text-texto";
const INPUT =
  "rounded-lg border-none bg-[#E7E9EC] px-[15px] py-3.5 font-normal outline-none focus:bg-[#DDE1E6]";
const RADIO_ROW = "mt-3 flex flex-wrap gap-[26px]";
const RADIO_LABEL = "flex cursor-pointer items-center gap-[9px] text-[15px] font-normal text-texto";
const FOOTER_H4 = "text-[13px] font-extrabold tracking-[.1em] text-white";
const FOOTER_COL = "mt-4 grid gap-[11px] text-[14.5px]";
const FOOTER_LINK = "text-[14.5px] text-[#9FB8D4] hover:text-naranja";
/** Servicios: fila 1 = dos horizontales · fila 2 = una horizontal grande · fila 3 = tres verticales */
const FILAS_SERVICIOS = [
  {
    n: 1,
    grid: "grid grid-cols-2 gap-5 w760:grid-cols-1",
    alto: "h-[300px] w760:h-[270px]",
    grad:
      "bg-[linear-gradient(180deg,rgba(5,43,89,.08)_0%,rgba(5,43,89,.5)_42%,rgba(5,43,89,.95)_100%)]",
  },
  {
    n: 2,
    grid: "grid grid-cols-1 gap-5",
    alto: "h-[430px] w1024:h-[400px] w760:h-[320px]",
    grad:
      "bg-[linear-gradient(180deg,rgba(5,43,89,.06)_0%,rgba(5,43,89,.38)_25%,rgba(5,43,89,.95)_100%)]",
  },
  {
    n: 3,
    grid: "grid grid-cols-3 gap-5 w760:grid-cols-1",
    alto: "h-[530px] w1024:h-[480px] w760:h-[400px]",
    grad:
      "bg-[linear-gradient(180deg,rgba(5,43,89,.05)_0%,rgba(5,43,89,.26)_22%,rgba(5,43,89,.95)_100%)]",
  },
] as const;

/** Título del hero. Mismo estilo para el H1 y para los H2 de los otros slides. */
const HERO_TITULO = "mt-[22px] text-[clamp(27px,4.9vw,52px)] leading-[1.08] text-white";

const SOCIAL_A =
  "flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/[.12]";

/* --------------------------------------------------------------------------
   Imagen con placeholder. Pon el archivo en /public y la ruta en content.json.
-------------------------------------------------------------------------- */
function Ph({ src, alt, dark }: { src?: string; alt: string; dark?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${dark ? "bg-azul-tile" : "bg-[#EEF2F7]"}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span
          className={`absolute inset-0 flex items-center justify-center p-3 text-center text-[13px] font-semibold ${
            dark ? "text-[#7FA0C6]" : "text-[#93A4BB]"
          }`}
        >
          {alt}
        </span>
      )}
    </div>
  );
}

/* ---------------------------------- iconos --------------------------------- */
const Wa = ({ s = 22, c = "#fff" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm5.6 14.2c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.2.3-.1.5.1.2.6 1.1 1.4 1.8 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.3z" />
  </svg>
);
const WaLine = ({ s = 22 }: { s?: number }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.7"
    className="stroke-texto transition-colors group-hover:stroke-white"
    aria-hidden="true"
  >
    <path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.6-1.2A9 9 0 1012 3z" />
    <path d="M8.6 8.4c-.2.2-.6.7-.6 1.6s.7 1.8.8 1.9c.1.2 1.4 2.2 3.4 3 1.7.7 2 .6 2.4.5.4 0 1.2-.5 1.4-1s.2-.9.1-1l-1.9-.9c-.2-.1-.4 0-.5.1l-.6.8-1.6-1-1-1.5.5-.6c.1-.1.1-.3.1-.4l-.8-1.7c-.1-.2-.3-.2-.5-.2h-.6c-.2 0-.4.1-.6.4z" />
  </svg>
);
const Tel = ({ s = 20, c = "#fff", w = "2.3" }: { s?: number; c?: string; w?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} aria-hidden="true">
    <path d="M4 5h4l2 5-2.5 1.5a12 12 0 005 5L14 14l5 2v4a1 1 0 01-1 1A16 16 0 013 6a1 1 0 011-1" />
  </svg>
);
const Mail = ({ s = 20, c = "#fff" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
const Arrow = ({ s = 16, c = "#fff" }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);
const Chevron = ({
  dir = "right",
  s = 18,
  c = "#fff",
  className,
}: {
  dir?: "left" | "right";
  s?: number;
  c?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke={c}
    strokeWidth="2.6"
    aria-hidden="true"
  >
    <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
  </svg>
);

/* Iconos de categoría (48x48) */
/* =========================================================
   ICONOS DE CATEGORÍAS
   Estilo industrial lineal - 48x48
========================================================= */

const CAT_ICONS: Record<string, React.ReactNode> = {
  /* -------------------------
     GRASERA / ZERK FITTING
  ------------------------- */
  graseras: (
    <>
      {/* Cabeza */}
      <path
        d="
          M19.5 9
          C19.5 5.7 21.5 3.5 24 3.5
          C26.5 3.5 28.5 5.7 28.5 9
          V11
          C28.5 13 27 14.5 25 14.5
          H23
          C21 14.5 19.5 13 19.5 11
          V9Z
        "
      />

      {/* Cuello */}
      <path d="M21.5 14.5V18H26.5V14.5" />

      {/* Hexágono */}
      <path
        d="
          M18.5 18
          H29.5
          L33 23
          L29.5 28
          H18.5
          L15 23
          L18.5 18Z
        "
      />

      {/* Cuerpo roscado */}
      <path d="M19.5 28V43M28.5 28V43" />

      {/* Rosca */}
      <path d="M19.5 32H28.5M19.5 35.5H28.5M19.5 39H28.5M19.5 42.5H28.5" />
    </>
  ),

  /* -------------------------
     VÁLVULA INDUSTRIAL
     Tipo compuerta / gate valve
  ------------------------- */
  valvulas: (
    <>
      {/* Volante */}
      <circle cx="24" cy="8" r="5.5" />
      <circle cx="24" cy="8" r="1.5" />

      {/* Vástago */}
      <path d="M24 13.5V19" />

      {/* Bonete */}
      <path d="M19 19H29L31 23H17L19 19Z" />

      {/* Cuerpo válvula */}
      <path
        d="
          M16 23
          H32
          L35 28
          L32 33
          H16
          L13 28
          L16 23Z
        "
      />

      {/* Bridas */}
      <path d="M8 23V33M13 24V32" />
      <path d="M35 24V32M40 23V33" />

      {/* Conexión horizontal */}
      <path d="M8 28H13M35 28H40" />

      {/* Pernos */}
      <path d="M8 25H5M8 31H5M40 25H43M40 31H43" />
    </>
  ),

  /* -------------------------
     TUBERÍA HDPE
  ------------------------- */
  tubos: (
    <>
      {/* Tubería superior */}
      <ellipse cx="17" cy="15" rx="7" ry="7" />
      <ellipse cx="17" cy="15" rx="4" ry="4" />
      <path d="M17 8H33" />
      <path d="M17 22H33" />
      <path d="M33 8C36.8 8 40 11.1 40 15C40 18.9 36.8 22 33 22" />

      {/* Tubería inferior */}
      <ellipse cx="14" cy="34" rx="7" ry="7" />
      <ellipse cx="14" cy="34" rx="4" ry="4" />
      <path d="M14 27H30" />
      <path d="M14 41H30" />
      <path d="M30 27C33.8 27 37 30.1 37 34C37 37.9 33.8 41 30 41" />
    </>
  ),

  /* -------------------------
     PLANCHAS METÁLICAS
  ------------------------- */
  planchas: (
    <>
      {/* Plancha superior */}
      <path
        d="
          M9 15
          L31 9
          L40 14
          L18 21
          L9 15Z
        "
      />

      {/* Espesor superior */}
      <path d="M9 15V19L18 25L40 18V14" />

      {/* Segunda plancha */}
      <path d="M9 24L18 30L40 23" />
      <path d="M9 24V28L18 34L40 27V23" />

      {/* Tercera plancha */}
      <path d="M9 33L18 39L40 32" />
      <path d="M9 33V37L18 43L40 36V32" />
    </>
  ),

  /* -------------------------
     ACCESORIOS / CODO INDUSTRIAL
  ------------------------- */
  accesorios: (
    <>
      {/* Boca superior */}
      <rect x="27" y="5" width="12" height="7" rx="1" />
      <path d="M30 12V17" />
      <path d="M36 12V17" />

      {/* Codo */}
      <path
        d="
          M33 17
          C33 17 33 17 33 17
          C23 17 17 23 17 33
        "
      />

      <path
        d="
          M28 17
          C19.5 19
          14 24.5
          12 33
        "
      />

      {/* Boca inferior */}
      <rect x="7" y="33" width="12" height="8" rx="1" />

      {/* Detalles de brida */}
      <path d="M10 33V30M16 33V30" />
      <path d="M30 8H36" />

      {/* Unión */}
      <circle cx="17" cy="28" r="1.8" />
    </>
  ),

  /* -------------------------
     EMPAQUETADURA / GASKET
  ------------------------- */
  empaquetaduras: (
    <>
      {/* Anillo exterior */}
      <circle cx="24" cy="24" r="18" />
      {/* Anillo interior */}
      <circle cx="24" cy="24" r="9" />

      {/* Pernos */}
      <circle cx="24" cy="6.5" r="1.6" />
      <circle cx="24" cy="41.5" r="1.6" />
      <circle cx="6.5" cy="24" r="1.6" />
      <circle cx="41.5" cy="24" r="1.6" />
      <circle cx="11.7" cy="11.7" r="1.6" />
      <circle cx="36.3" cy="36.3" r="1.6" />
      <circle cx="11.7" cy="36.3" r="1.6" />
      <circle cx="36.3" cy="11.7" r="1.6" />
    </>
  ),
};


/* =========================================================
   COMPONENTE
========================================================= */

const CatIcon = ({
  id,
  s = 52,
  c = "#fff",
  w = "2",
  className,
}: {
  id: string;
  s?: number;
  c?: string;
  w?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width={s}
    height={s}
    viewBox="0 0 48 48"
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {CAT_ICONS[id]}
  </svg>
);

/* ------------------------------- datos derivados ---------------------------- */
const CATS = content.categorias;
const POR_PAGINA = 6;
/** id de categoría → posición en CATS. Evita índices numéricos a mano. */
const CAT_INDEX: Record<string, number> = Object.fromEntries(
  CATS.map((c, i) => [c.id, i]),
);
/** Índice del slide del hero que corresponde a un `?focus=`. */
const HERO_POR_FOCUS: Record<string, number> = Object.fromEntries(
  content.hero.flatMap((h, i) => (h.focus ? [[h.focus, i] as const] : [])),
);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

type Prod = {
  nombre: string;
  desc: string;
  imagen: string;
  catIndex: number;
  catId: string;
  categoria: string;
  medidas: string[];
  sku: string;
  busca: string;
};

const TODOS: Prod[] = CATS.flatMap((c, ci) =>
  c.productos.map((p, pi) => ({
    ...p,
    catIndex: ci,
    catId: c.id,
    categoria: c.label,
    medidas: c.medidas,
    sku: `VSI-${c.skuPrefijo}-${String(pi + 1).padStart(2, "0")}`,
    busca: norm(`${p.nombre} ${p.desc} ${c.label}`),
  })),
);

/**
 * Tarjeta "Otros tipos..." del catálogo: una entrada sintética por categoría.
 * Título, subtítulo, descripción e imagen se editan en content.json, dentro de
 * cada categoría, en el bloque `otros`. No forma parte de TODOS (no se lista ni
 * se busca), pero usa el mismo tipo para abrir el mismo modal que un producto.
 */
const OTROS: (Prod & { subtitulo: string })[] = CATS.map((c, ci) => ({
  nombre: c.otros.titulo,
  subtitulo: c.otros.subtitulo,
  desc: c.otros.desc,
  imagen: c.otros.imagen,
  catIndex: ci,
  catId: c.id,
  categoria: c.label,
  medidas: c.medidas,
  sku: `VSI-${c.skuPrefijo}-OTROS`,
  busca: "",
}));

export default function Home() {
  const [hero, setHero] = useState(0);
  const [cat, setCat] = useState(0);
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [modalSku, setModalSku] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [medida, setMedida] = useState("");
  /** `?focus=graseras` de Google Ads. "" en tráfico orgánico. */
  const [focus, setFocus] = useState("");
  const [privacidad, setPrivacidad] = useState(false);

  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const marcasRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captureAttribution();

    // Modo campaña: ?focus=graseras abre la landing con el hero y la categoría
    // de Graseras ya seleccionados. Se resuelve aquí (no en el estado inicial)
    // para que el HTML del servidor y el del cliente coincidan: leer
    // window.location durante el render provocaría un error de hidratación.
    const f = captureFocus();
    if (f) {
      setFocus(f);
      const h = HERO_POR_FOCUS[f];
      if (h !== undefined) setHero(h);
      const c = CAT_INDEX[f];
      if (c !== undefined) setCat(c);
    }

    // El auto-avance NO arranca en modo campaña: quien llega desde el anuncio
    // debe quedarse en el hero de Graseras, no ver otro producto a los 7 s.
    // Las flechas y los puntos siguen permitiendo navegar a mano (goHero).
    if (!f) {
      heroTimer.current = setInterval(() => setHero((h) => (h + 1) % content.hero.length), 7000);
    }
    // Solo cierra si el clic ocurrió fuera del menú: en el App Router React
    // delega los eventos en `document`, así que este listener corre siempre
    // después del onClick del botón (stopPropagation no lo evita).
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("click", close);
    return () => {
      if (heroTimer.current) clearInterval(heroTimer.current);
      if (debounce.current) clearTimeout(debounce.current);
      document.removeEventListener("click", close);
    };
  }, []);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    document.body.style.overflow = modalSku || privacidad ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalSku, privacidad]);

  function goHero(i: number) {
    if (heroTimer.current) clearInterval(heroTimer.current);
    setHero(i);
  }

  function scrollToCatalogo() {
    const el = document.getElementById("catalogo");
    if (!el) return;
    const head = document.querySelector("header");
    const off = (head ? head.offsetHeight : 146) + 14;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - off, behavior: "smooth" });
  }

  function irACategoria(i: number) {
    setCat(i);
    setPage(0);
    setQuery("");
    setMenu(false);
    if (searchRef.current) searchRef.current.value = "";
    setTimeout(scrollToCatalogo, 60);
  }

  const buscando = query.trim().length > 0;
  const lista = useMemo(() => {
    if (!buscando) return TODOS.filter((p) => p.catIndex === cat);
    const terms = norm(query.trim()).split(/\s+/);
    return TODOS.filter((p) => terms.every((t) => p.busca.includes(t)));
  }, [buscando, query, cat]);

  /* Sin paginación: cada categoría muestra como máximo 6 productos (3 x 2) y el
     resto queda cubierto por la tarjeta "Otros tipos...". La búsqueda sí lista
     todos sus resultados. */
  const items = buscando ? lista : lista.slice(0, POR_PAGINA);
  const otros = OTROS[cat];
  const prod = modalSku ? [...TODOS, ...OTROS].find((p) => p.sku === modalSku) ?? null : null;

  /**
   * Props de un enlace a WhatsApp + su conversión.
   * `meta` viaja tal cual al dataLayer (origen, producto, categoria, sku,
   * medida, cantidad). `focus`, `landing_page`, `gclid` y las UTM los agrega
   * `track()` automáticamente, así que no hay que repetirlos en cada CTA.
   */
  const wa = (mensaje: string, meta: ConvMeta) => ({
    href: waLink(mensaje),
    target: "_blank",
    rel: "noopener",
    onClick: () => convert("whatsapp", meta),
  });

  function onSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setQuery(v);
      setPage(0);
      if (v.trim()) scrollToCatalogo();
    }, 350);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => (f.get(k) || "").toString().trim();
    const attr = attributionText();
    const msg = [
      `Solicitud de cotización — ${site.url.replace("https://", "")}`,
      `Nombre: ${g("nombre")} ${g("apellido")}`.trim(),
      `Celular: ${g("telefono")}`,
      g("ciudad") && `Ciudad: ${g("ciudad")}`,
      g("doc") && `${g("doc")}: ${g("numeroDoc")}`,
      g("tipoCliente") && `Tipo: ${g("tipoCliente")}`,
      g("mensaje") && `Requerimiento: ${g("mensaje")}`,
      attr && `Origen: ${attr}`,
    ]
      .filter(Boolean)
      .join("\n");
    // Conversión PRINCIPAL. Se dispara solo aquí, después de que el navegador
    // validó los campos required (si faltara alguno, `submit` ni se ejecuta).
    // A propósito NO se dispara además `conv_whatsapp`: el flujo termina
    // abriendo WhatsApp, pero es un único lead y contarlo dos veces inflaría
    // las conversiones de Google Ads.
    //
    // Solo van parámetros de campaña y de negocio: nombre, apellido, celular,
    // DNI/RUC y el texto del requerimiento NO se envían a analítica.
    convert("formulario", {
      origen: "formulario_cotizacion",
      categoria: focus === "graseras" ? "graseras" : CATS[cat].id,
      ciudad: g("ciudad"), // dato geográfico, no identifica a la persona
    });
    window.open(waLink(msg), "_blank", "noopener");
  }

  const modalMsg = prod
    ? msgCotizar({ producto: `${prod.nombre} (SKU ${prod.sku})`, medida, cantidad: qty })
    : "";

  return (
    <>
      {/* ------------------------------- topbar ------------------------------ */}
      <div className="bg-azul-osc text-[13px] text-[#B9CBE2] w1024:hidden">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-x-[26px] gap-y-2 py-[9px]`}>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
            <a
              href={`tel:${site.phone}`}
              onClick={() => convert("llamada", { origen: "topbar" })}
              className="text-[#B9CBE2] hover:text-white"
            >
              <span className="flex items-center gap-[7px]">
                <Tel s={13} c="#E47A24" w="2.4" />
                {site.phoneDisplay}
              </span>
            </a>
            <a href={`mailto:${site.email}`} className="text-[#B9CBE2] hover:text-white">
              <span className="flex items-center gap-[7px]">
                <Mail s={13} c="#E47A24" />
                {site.email}
              </span>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2">
            <span>RUC {site.ruc}</span>
            <span className="text-[#7E99BA]">{site.hours}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------- header ------------------------------ */}
      <header className="sticky top-0 z-[70] bg-white shadow-header">
        <div className="border-b border-linea-2">
          <div
            className={`${CONTAINER} flex h-[92px] items-center gap-[26px] w760:h-auto w760:flex-wrap w760:gap-3 w760:py-3.5 w520:px-[18px]`}
          >
            <a href="#top" aria-label={site.name} className="flex shrink-0 items-center">
              <img src="/vsiperu-logo.svg" alt={site.name} width={430} height={56} className="h-14 w-auto w520:h-11" />
            </a>

            <div className="relative flex-1 max-w-[520px] w1024:max-w-none w760:order-3 w760:w-full w760:basis-full">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8494AB"
                strokeWidth="2.3"
                aria-hidden="true"
                className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                ref={searchRef}
                onChange={onSearch}
                aria-label="Buscar producto"
                placeholder={'Buscar producto: grasera 90°, válvula cuchilla 6"…'}
                className="w-full rounded-full border border-[#D8E0EA] bg-gris-3 py-[13px] pl-[44px] pr-[18px] text-[14.5px] outline-none focus:border-naranja focus:bg-white"
              />
            </div>

            <a
              className="flex shrink-0 items-center gap-[9px] rounded-full bg-naranja px-5 py-3 text-[14.5px] font-bold text-white shadow-cta-sm hover:bg-naranja-osc hover:text-white w640:hidden"
              {...wa(msgCotizar(), { origen: "header" })}
            >
              <Wa s={17} /> Cotizar
            </a>
          </div>
        </div>

        <div className="border-b border-linea-2 bg-gris-3">
          <div className={`${CONTAINER} flex items-stretch gap-[26px] w520:gap-3`}>
            <div className="relative shrink-0" ref={menuRef}>
              <button
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
                className="flex h-[52px] items-center gap-3 border-none bg-azul px-[22px] text-[14.5px] font-bold text-white hover:bg-azul-osc w520:px-4 w520:text-[13.5px]"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                Todas las categorías
                <Chevron
                  dir="right"
                  s={15}
                  className={`transition-transform duration-200 ${menu ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`absolute left-0 top-full z-[80] min-w-[290px] overflow-hidden border border-t-0 border-linea bg-white shadow-menu transition-opacity duration-[180ms] ${
                  menu ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
                }`}
              >
                {CATS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => irACategoria(i)}
                    className="flex w-full items-center gap-3.5 border-0 border-b border-linea-2 bg-transparent px-5 py-3.5 text-left text-[15px] font-semibold text-texto last:border-b-0 hover:bg-gris-3 hover:text-naranja"
                  >
                    <CatIcon id={c.id} s={22} c="#083B7A" w="2.4" />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex items-center gap-7 text-[14.5px] font-semibold w1024:hidden">
              <a href="#catalogo" className="text-texto hover:text-naranja">
                Catálogo
              </a>
              <a href="#servicios" className="text-texto hover:text-naranja">
                Servicios
              </a>
              <a href="#contacto" className="text-texto hover:text-naranja">
                Cotiza en 1 minuto
              </a>
            </nav>

            <div className="ml-auto flex items-center gap-[9px] text-[14px] font-bold text-azul w760:hidden">
              <Tel s={16} c="#E47A24" w="2.4" />
              {site.phoneDisplay}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* -------------------------------- hero ----------------------------- */}
        <section
          id="top"
          className="relative overflow-hidden bg-[linear-gradient(105deg,#052B59_0%,#083B7A_62%,#0A4788_100%)]"
        >
          <div className="pointer-events-none absolute -right-[120px] -top-[140px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(228,122,36,.2),transparent_62%)]" />

          <div className="relative min-h-[590px] w1024:min-h-[430px]">
            {content.hero.map((s, i) => (
              <div
                key={i}
                aria-hidden={i !== hero}
                className={`transition-opacity duration-[550ms] ${
                  i === hero ? "relative z-[2] opacity-100" : "pointer-events-none absolute inset-0 z-[1] opacity-0"
                }`}
              >
                {/* Imagen de fondo a sangre completa: la diseñas tú y la pones en content.json */}
                <div className="absolute inset-0 z-0">
                  <Ph src={s.imagen} alt={s.imagenAlt} dark />
                </div>
                <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(5,43,89,.94)_0%,rgba(5,43,89,.74)_34%,rgba(5,43,89,.20)_55%,rgba(5,43,89,.06)_72%,rgba(5,43,89,0)_100%)]" />
               
                <div className="pointer-events-none relative z-[2] mx-auto grid max-w-page grid-cols-[minmax(0,680px)] items-center px-6 pb-[clamp(72px,7.5vw,104px)] pt-[clamp(56px,7vw,96px)]">
                  <div>
                    <div className="inline-flex items-center gap-[9px] rounded-full border border-[rgba(228,122,36,.42)] bg-[rgba(228,122,36,.14)] px-3.5 py-[7px] text-[13px] font-bold text-[#FFB672]">
                      <span className="block h-[7px] w-[7px] rounded-full bg-naranja" />
                      IMPORTADORES DIRECTOS · STOCK EN LIMA
                    </div>
                    {/* Un solo H1 en toda la página: el del slide de Graseras,
                        que es el contenido principal de esta landing. Los demás
                        slides usan H2 — antes cada uno emitía su propio H1 y la
                        página quedaba con siete. El estilo es idéntico, así que
                        el carrusel no cambia visualmente. */}
                    {i === 0 ? (
                      <h1 className={HERO_TITULO}>{s.titulo}</h1>
                    ) : (
                      <h2 className={HERO_TITULO}>{s.titulo}</h2>
                    )}
                    <p className="mt-5 max-w-[560px] text-[18px] leading-[1.62] text-[#C4D6EA]">{s.descripcion}</p>
                    <div className="mt-8 flex flex-wrap gap-3.5">
                      <a
                        className={`${BTN_CTA} pointer-events-auto px-7 py-4 text-[16px] shadow-cta-lg`}
                        {...wa(msgCotizar({ producto: s.ctaProducto }), {
                          origen: `hero_${i + 1}`,
                          producto: s.ctaProducto,
                          categoria: s.catId,
                        })}
                      >
                        {s.ctaTexto} <Arrow s={18} />
                      </a>
                      <a
                        href="#catalogo"
                        className="pointer-events-auto inline-flex items-center gap-2.5 rounded-md border-[1.5px] border-white/[.34] px-[26px] py-4 text-[16px] font-semibold text-white hover:border-white hover:bg-white/[.07] hover:text-white"
                      >
                        Ver catálogo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            aria-label="Anterior"
            onClick={() => goHero((hero - 1 + content.hero.length) % content.hero.length)}
            className="absolute left-4 top-1/2 z-[5] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/[.08] hover:border-naranja hover:bg-naranja w640:hidden"
          >
            <Chevron dir="left" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => goHero((hero + 1) % content.hero.length)}
            className="absolute right-4 top-1/2 z-[5] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/[.08] hover:border-naranja hover:bg-naranja w640:hidden"
          >
            <Chevron dir="right" />
          </button>
          <div className="absolute inset-x-0 bottom-5 z-[5] flex justify-center gap-[9px]">
            {content.hero.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => goHero(i)}
                className={`h-2.5 rounded-full border-none p-0 transition-all duration-300 ${
                  i === hero ? "w-[30px] bg-naranja" : "w-2.5 bg-white/[.42]"
                }`}
              />
            ))}
          </div>
        </section>

        {/* --------------------------- franja de tipos ----------------------- */}
        <section className="bg-azul py-[clamp(26px,3vw,34px)]">
          <div className={`${CONTAINER} grid grid-cols-6 gap-[18px] w1180:grid-cols-3 w640:grid-cols-2 w640:gap-2.5`}>
            {CATS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => irACategoria(i)}
                className="flex flex-col items-center gap-3.5 rounded-lg border-none bg-transparent px-2 py-3.5 text-white hover:bg-white/[.08] hover:text-white"
              >
                <CatIcon id={c.id} className="w640:h-[42px] w640:w-[42px]" />
                <span className="text-[13px] font-extrabold tracking-[.08em]">{c.label.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ------------------------- líneas de producto ---------------------- */}
        <section id="lineas" className={`${SECTION} bg-gris`}>
          <div className={CONTAINER}>
            <div className={HEAD_ROW}>
              <div className="max-w-[640px]">
                <div className={EYEBROW}>Líneas de producto</div>
                <h2 className={`${H2} text-azul-osc`}>Todo lo que tu operación necesita, de un solo proveedor</h2>
              </div>
              <p className="max-w-[400px] text-[16px] leading-[1.6] text-texto-2">
                Elige una línea y te llevamos directo al catálogo con esa categoría abierta.
              </p>
            </div>

            <div className="grid grid-cols-3 grid-rows-[290px_290px] gap-5 w1024:grid-cols-2 w1024:grid-rows-[300px_300px_300px] w640:grid-cols-1 w640:grid-rows-none">
              {content.bento.map((b) => (
                <button
                  key={b.titulo}
                  onClick={() => irACategoria(CAT_INDEX[b.catId] ?? 0)}
                  className={`${TILE} w640:min-h-[260px] ${b.destacado ? "row-span-2 w640:row-auto" : ""}`}
                >
                  <Ph src={b.imagen} alt={b.imagenAlt} dark />
                  <div className={b.destacado ? TILE_GRAD_TALL : TILE_GRAD} />
                  {b.nota ? (
                    <span className="pointer-events-none absolute left-[18px] top-[18px] z-[2] rounded-[3px] bg-naranja px-[11px] py-1.5 text-[11.5px] font-extrabold tracking-[.06em] text-white">
                      {b.nota}
                    </span>
                  ) : null}
                  <div
                    className={`pointer-events-none absolute ${
                      b.destacado ? "bottom-[26px] left-[26px] right-[26px]" : "bottom-[22px] left-6 right-6"
                    }`}
                  >
                    <h3
                      className={`leading-none text-white ${TILE_SHADOW} ${
                        b.destacado ? "text-[clamp(30px,3.4vw,40px)]" : "text-[clamp(24px,2.6vw,30px)]"
                      }`}
                    >
                      {b.titulo}
                    </h3>
                    <span
                      className={
                        b.destacado
                          ? "mt-4 inline-flex items-center gap-[9px] rounded-full bg-naranja px-[22px] py-3 text-[14.5px] font-bold text-white"
                          : TILE_PILL
                      }
                    >
                      Ver productos {b.destacado ? <Arrow s={15} /> : null}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ catálogo --------------------------- */}
        <section id="catalogo" className={`${SECTION} bg-white`}>
          <div className={CONTAINER}>
            <div className="mx-auto max-w-[680px] text-center">
              <div className={EYEBROW}>Catálogo</div>
              <h2 className={`${H2} text-azul-osc`}>Nuestros productos, medida por medida</h2>
              <p className="mt-4 text-[16.5px] leading-[1.62] text-texto-2">
                Elige una línea o busca por nombre. Cada producto se cotiza en el momento por WhatsApp.
              </p>
            </div>

            <div className="mt-[34px] flex flex-wrap justify-center gap-2.5">
              {CATS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => irACategoria(i)}
                  className={`rounded-full border px-[22px] py-[11px] text-[14.5px] font-bold transition-all duration-[180ms] ${
                    i === cat && !buscando
                      ? "border-azul bg-azul text-white"
                      : "border-[#D8E0EA] bg-white text-texto hover:border-naranja hover:text-naranja"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {buscando ? (
              <div className="mt-[22px] flex flex-wrap items-center justify-center gap-3.5 text-[15px] text-texto-2">
                <span>
                  {lista.length} {lista.length === 1 ? "resultado" : "resultados"} para “{query.trim()}”
                </span>
                <button
                  onClick={() => {
                    if (searchRef.current) searchRef.current.value = "";
                    setQuery("");
                    setPage(0);
                  }}
                  className="rounded-full border border-[#D8E0EA] bg-white px-4 py-2 text-[13.5px] font-bold text-azul hover:border-naranja hover:text-naranja"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : null}

            {/* Productos (3 columnas) + columna especial "Otros tipos..." */}
            <div className="mt-9 grid grid-cols-4 gap-x-[26px] gap-y-[30px] w900:grid-cols-3 w640:grid-cols-2 w640:gap-x-4 w640:gap-y-[26px] w380:grid-cols-1">
              {/* Columnas 1-3: solo productos reales (máx. 3 por fila) */}
              <div className="col-span-3 grid grid-cols-3 gap-x-[26px] gap-y-[30px] w640:col-span-2 w640:grid-cols-2 w640:gap-x-4 w640:gap-y-[26px] w380:col-span-1 w380:grid-cols-1">
                {items.map((p) => (
                  <article className="flex flex-col" key={p.sku}>
                    <div className="relative aspect-square overflow-hidden rounded-[10px] bg-white">
                      <Ph src={p.imagen} alt={p.nombre} />
                      <a
                        aria-label={`Cotizar ${p.nombre} por WhatsApp`}
                        {...wa(msgCotizar({ producto: p.nombre }), {
                          origen: "catalogo_card",
                          producto: p.nombre,
                          categoria: p.catId,
                          sku: p.sku,
                        })}
                        className="group absolute left-3 top-3 z-[3] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white shadow-icon hover:bg-wa"
                      >
                        <WaLine />
                      </a>
                      <button
                        aria-label={`Ver detalle de ${p.nombre}`}
                        onClick={() => {
                          setModalSku(p.sku);
                          setQty(1);
                          setMedida("");
                        }}
                        className="group absolute right-3 top-3 z-[3] flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-white shadow-icon hover:bg-naranja"
                      >
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                          aria-hidden="true"
                          className="stroke-texto transition-colors group-hover:stroke-white"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-4-4" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="mt-4 text-[16.5px] font-bold leading-[1.35] text-texto w520:text-[15px]">{p.nombre}</h3>
                    <div className="mt-[5px] text-[14px] text-texto-3">{p.categoria}</div>
                  </article>
                ))}
              </div>

              {/* Columna 4: NO es un producto. Siempre 1 sola tarjeta centrada vertical. */}
              <div className="flex items-center w900:col-span-3 w900:justify-center w640:col-span-2 w380:col-span-1">
                <article className="flex w-full flex-col w900:max-w-[340px]">
                  <div className="relative aspect-square overflow-hidden rounded-[10px] bg-white">
                    <Ph src={otros.imagen} alt={otros.nombre} />
                    <a
                      aria-label={`${otros.nombre} de ${otros.categoria.toLowerCase()} por WhatsApp`}
                      {...wa(msgCotizar({ producto: `Otros tipos de ${otros.categoria}` }), {
                        origen: "catalogo_otros_tipos",
                        producto: `Otros tipos de ${otros.categoria}`,
                        categoria: otros.catId,
                        sku: otros.sku,
                      })}
                      className="group absolute left-3 top-3 z-[3] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white shadow-icon hover:bg-wa"
                    >
                      <WaLine />
                    </a>
                    <button
                      aria-label={`Ver detalle de ${otros.nombre} (${otros.categoria.toLowerCase()})`}
                      onClick={() => {
                        setModalSku(otros.sku);
                        setQty(1);
                        setMedida("");
                      }}
                      className="group absolute right-3 top-3 z-[3] flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-white shadow-icon hover:bg-naranja"
                    >
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        aria-hidden="true"
                        className="stroke-texto transition-colors group-hover:stroke-white"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-4-4" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="mt-4 text-[16.5px] font-bold leading-[1.35] text-texto w520:text-[15px]">
                    {otros.nombre}
                  </h3>
                  <div className="mt-[5px] text-[14px] text-texto-3">{otros.subtitulo}</div>
                </article>
              </div>
            </div>

            {/* ------------------------------------------------------------------
               Paginado desactivado: cada categoría muestra hasta 6 productos
               (3 x 2) más la tarjeta "Otros tipos...", así que ya no hay páginas.
               Se conserva comentado por si se vuelve a necesitar.
            ---------------------------------------------------------------------
            <div className="mt-11 flex flex-wrap items-center justify-center gap-2">
              <button
                aria-label="Página anterior"
                disabled={pageSafe === 0}
                onClick={() => setPage(Math.max(0, pageSafe - 1))}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-[#D8E0EA] bg-white text-[14.5px] font-bold text-azul transition-all duration-[180ms] disabled:cursor-default disabled:text-[#C3CDDA]"
              >
                <Chevron dir="left" s={16} c="currentColor" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border text-[14.5px] font-bold transition-all duration-[180ms] ${
                    i === pageSafe ? "border-naranja bg-naranja text-white" : "border-[#D8E0EA] bg-white text-texto"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                aria-label="Página siguiente"
                disabled={pageSafe >= totalPages - 1}
                onClick={() => setPage(Math.min(totalPages - 1, pageSafe + 1))}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-[#D8E0EA] bg-white text-[14.5px] font-bold text-azul transition-all duration-[180ms] disabled:cursor-default disabled:text-[#C3CDDA]"
              >
                <Chevron dir="right" s={16} c="currentColor" />
              </button>
            </div>
            ------------------------------------------------------------------ */}
          </div>
        </section>

        {/* ------------------------------ servicios -------------------------- */}
        <section id="servicios" className={`${SECTION} bg-gris`}>
          <div className={CONTAINER}>
            <div className={HEAD_ROW}>
              <div className="max-w-[640px]">
                <div className={EYEBROW}>Servicios</div>
                <h2 className={`${H2} text-azul-osc`}>No solo vendemos: resolvemos el abastecimiento</h2>
              </div>
              <p className="max-w-[400px] text-[16px] leading-[1.6] text-texto-2">
                Seis servicios que acompañan cada pedido, del requerimiento a la entrega en planta.
              </p>
            </div>

            <div className="grid gap-5">
              {FILAS_SERVICIOS.map((fila) => (
                <div className={fila.grid} key={fila.n}>
                  {content.servicios
                    .filter((s) => s.fila === fila.n)
                    .map((s) => (
                      <a
                        key={s.titulo}
                        {...wa(s.mensaje, {
                          origen: `servicio_${s.titulo.toLowerCase().replace(/\s+/g, "_")}`,
                          producto: s.titulo,
                          categoria: "servicios",
                        })}
                        className={`relative block overflow-hidden rounded-[14px] bg-azul-tile text-white hover:text-white ${fila.alto}`}
                      >
                        <Ph src={s.imagen} alt={s.imagenAlt} dark />
                        <div className={`pointer-events-none absolute inset-0 ${fila.grad}`} />
                        <div className="pointer-events-none absolute bottom-[26px] left-7 right-7">
                          <h3 className="text-[clamp(21px,2.4vw,27px)] leading-[1.08] text-white [text-shadow:0_2px_14px_rgba(0,0,0,.45)] uppercase">
                            {s.titulo}
                          </h3>
                          <span className="mt-4 inline-flex items-center gap-[9px] rounded-full bg-naranja px-5 py-[11px] text-[14px] font-bold text-white">
                            Consultar servicio <Arrow s={15} />
                          </span>
                        </div>
                      </a>
                    ))}
                </div>
              ))}
            </div>

            <div className="mt-11 flex flex-wrap items-center justify-between gap-[22px] border-t border-linea pt-9">
              <div className="max-w-[720px]">
                <h3 className="text-[25px] leading-[1.2] text-azul-osc">
                  ¿Tu requerimiento no entra en ninguna de estas casillas?
                </h3>
                <p className="mt-2.5 text-[16px] leading-[1.6] text-texto-2">
                  Cuéntanos qué necesitas abastecer y armamos la solución: importación, plazos y logística incluidos.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2.5 rounded-full bg-wa px-[30px] py-4 text-[16px] font-extrabold text-white shadow-wa-btn hover:bg-wa-osc hover:text-white"
                {...wa("Hola VSI, quiero conversar sobre un servicio", {
                  origen: "servicios_cta",
                  categoria: "servicios",
                })}
              >
                <Wa s={21} /> Hablar con un asesor
              </a>
            </div>
          </div>
        </section>

        {/* -------------------------------- marcas --------------------------- */}
        <section className="bg-white py-[70px]">
          <div className={CONTAINER}>
            <p className="text-center font-head text-[19px] font-extrabold uppercase tracking-[.06em] text-azul">
              Marcas con las que trabajamos
            </p>
            <div className="mt-8 flex items-center gap-3.5">
              <button
                aria-label="Anterior"
                onClick={() => marcasRef.current?.scrollBy({ left: -460, behavior: "smooth" })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-linea bg-white hover:border-naranja"
              >
                <Chevron dir="left" c="#083B7A" />
              </button>
              <div ref={marcasRef} className="no-scrollbar flex flex-1 gap-[26px] overflow-x-auto scroll-smooth px-0.5 py-1">
                {content.marcas.map((m) => (
                  <div
                    key={m.nombre}
                    className="h-[70px] shrink-0 basis-[200px] overflow-hidden w640:h-20 w640:basis-[160px] w380:basis-[140px]"
                  >
                    <Ph src={m.imagen} alt={m.nombre} />
                  </div>
                ))}
              </div>
              <button
                aria-label="Siguiente"
                onClick={() => marcasRef.current?.scrollBy({ left: 460, behavior: "smooth" })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-linea bg-white hover:border-naranja"
              >
                <Chevron dir="right" c="#083B7A" />
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------ cotiza en 1 minuto ----------------------- */}
        <section
          id="contacto"
          className="relative overflow-hidden bg-[#052B59] bg-[url('/extras/cotizar.png')] bg-cover bg-center bg-no-repeat"
        >
          <div className="pointer-events-none absolute -right-[140px] -top-[140px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(228,122,36,.18),transparent_62%)]" />
          <div className="relative mx-auto grid max-w-page grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-12 px-6 py-[clamp(48px,6vw,70px)] w1024:grid-cols-1 w1024:gap-[34px]">
            <div>
              <h2 className="text-[clamp(34px,5.4vw,52px)] uppercase leading-[1.02] text-white">
                ¡Cotiza en
                <br />
                1 minuto!
              </h2>
              <p className="mt-[22px] font-head text-[22px] font-extrabold leading-[1.3] text-white">
                Te atendemos con
                <br />
                <span className="border-b-[3px] border-naranja pb-0.5 text-naranja">la rapidez de siempre</span>
              </p>
              <div className="mt-[34px] h-[clamp(190px,24vw,280px)] w-[clamp(190px,24vw,280px)] overflow-hidden rounded-full border-[5px] border-white shadow-avatar">
                <Ph src="/extras/persona1.png" alt="Foto del asesor" />
              </div>
              <div className="mt-[30px] flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2.5 rounded-full bg-wa px-[22px] py-[13px] text-[15px] font-bold text-white hover:bg-wa-osc hover:text-white"
                  {...wa(msgCotizar(), { origen: "cotiza_bloque" })}
                >
                  <Wa s={19} /> WhatsApp directo
                </a>
                <a
                  href={`tel:${site.phone}`}
                  onClick={() => convert("llamada", { origen: "cotiza_bloque" })}
                  className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-white/40 px-[22px] py-[13px] text-[15px] font-bold text-white hover:border-white hover:bg-white/[.08] hover:text-white"
                >
                  <Tel s={17} /> {site.phoneDisplay}
                </a>
              </div>
            </div>

            <form onSubmit={onSubmit} className="rounded-[26px] bg-white p-[clamp(24px,3.2vw,44px)] shadow-form">
              <h3 className="text-center text-[clamp(22px,2.6vw,30px)] leading-[1.2] text-texto">
                Llena el formulario y un asesor te contactará
              </h3>

              <div className="mt-7">
                <div className="text-[15px] font-bold text-texto">
                  Es usted: <span className="text-naranja">*</span>
                </div>
                <div className={RADIO_ROW}>
                  <label className={RADIO_LABEL}>
                    <input type="radio" name="tipoCliente" value="Cliente frecuente" className="h-[18px] w-[18px] accent-naranja" />
                    Cliente frecuente
                  </label>
                  <label className={RADIO_LABEL}>
                    <input type="radio" name="tipoCliente" value="Nuevo" className="h-[18px] w-[18px] accent-naranja" />
                    Nuevo
                  </label>
                </div>
              </div>

              <div className="mt-[22px] grid grid-cols-2 gap-4 w640:grid-cols-1">
                <label className={FIELD}>
                  Nombre:
                  <input name="nombre" required className={INPUT} />
                </label>
                <label className={FIELD}>
                  Apellido:
                  <input name="apellido" className={INPUT} />
                </label>
                <label className={FIELD}>
                  Celular:
                  <input name="telefono" inputMode="tel" required className={INPUT} />
                </label>
                <label className={FIELD}>
                  Ciudad:
                  <select name="ciudad" defaultValue="" className={`${INPUT} text-texto-2`}>
                    <option value="">Selecciona tu ciudad</option>
                    <option>Lima</option>
                    <option>Callao</option>
                    <option>Arequipa</option>
                    <option>Trujillo</option>
                    <option>Chiclayo</option>
                    <option>Piura</option>
                    <option>Cusco</option>
                    <option>Ica</option>
                    <option>Otra</option>
                  </select>
                </label>
              </div>

              <div className="mt-[22px]">
                <div className="text-[15px] font-bold text-texto">
                  Seleccione: <span className="text-naranja">*</span>
                </div>
                <div className={RADIO_ROW}>
                  <label className={RADIO_LABEL}>
                    <input type="radio" name="doc" value="DNI" className="h-[18px] w-[18px] accent-naranja" />
                    DNI
                  </label>
                  <label className={RADIO_LABEL}>
                    <input type="radio" name="doc" value="RUC" className="h-[18px] w-[18px] accent-naranja" />
                    RUC
                  </label>
                </div>
              </div>

              <label className={`${FIELD} mt-5`}>
                Número de DNI o RUC:
                <input name="numeroDoc" inputMode="numeric" className={INPUT} />
              </label>

              <label className={`${FIELD} mt-5`}>
                ¿Qué necesita cotizar?:
                <textarea name="mensaje" rows={4} className={`${INPUT} resize-y`} />
              </label>

              {/* El botón de la política queda FUERA del <label>: un <button>
                  anidado en un <label> es contenido interactivo inválido y
                  además dispararía el checkbox al hacer clic. Con htmlFor el
                  texto sigue marcando la casilla. */}
              <div className="mt-[22px] flex items-center gap-[11px] text-[15px] font-bold text-texto">
                <input
                  id="terminos"
                  type="checkbox"
                  name="terminos"
                  required
                  className="h-5 w-5 shrink-0 accent-naranja"
                />
                <span>
                  <label htmlFor="terminos" className="cursor-pointer">
                    Acepto los términos y la
                  </label>{" "}
                  <button
                    type="button"
                    onClick={() => setPrivacidad(true)}
                    className="border-none bg-transparent p-0 text-[15px] font-bold text-naranja underline underline-offset-2"
                  >
                    política de privacidad
                  </button>
                </span>
              </div>

              <button
                type="submit"
                className="mt-[22px] rounded-lg border-none bg-naranja px-11 py-[15px] text-[16px] font-extrabold text-white shadow-form-btn hover:bg-naranja-osc"
              >
                Enviar
              </button>
            </form>
          </div>
        </section>

        {/* ---------------------------- FAQ + mapa --------------------------- */}
        <section id="faq" className={`${SECTION} bg-white`}>
          <div
            className={`${CONTAINER} grid grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] items-start gap-12 w1024:grid-cols-1 w1024:gap-[34px]`}
          >
            <div>
              <div className={EYEBROW}>Preguntas frecuentes</div>
              <h2 className="mt-3 text-[clamp(24px,3vw,36px)] leading-[1.14] text-azul-osc">Antes de cotizar</h2>
              <div className="mt-[30px] grid gap-3">
                {content.faqs.map(([q, a]) => (
                  <details key={q} className="rounded-[9px] border border-linea bg-gris-2">
                    <summary className="cursor-pointer list-none px-[22px] py-5 font-head text-[16.5px] font-bold text-azul-osc [&::-webkit-details-marker]:hidden">
                      {q}
                    </summary>
                    <p className="px-[22px] pb-5 text-[15px] leading-[1.65] text-texto-2">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-linea bg-white shadow-card">
              <iframe
                title={`Ubicación de ${site.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="block h-[430px] w-full border-0"
              />
              <div className="border-t border-linea-2 px-[26px] py-6">
                <h3 className="text-[19px] text-azul-osc">Visítanos en {site.address.district}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-texto-2">
                  {site.address.street}, {site.address.district}, {site.address.city}
                  <br />
                  {site.hours}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-3.5 inline-flex items-center gap-[9px] text-[14.5px] font-bold text-naranja"
                >
                  Cómo llegar <Arrow s={15} c="currentColor" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ----------------------------- barra CTA ----------------------------- */}
      <div className="bg-azul">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-5 py-[30px]`}>
          <div className="max-w-[720px] font-head text-[clamp(17px,2vw,21px)] font-extrabold text-white">
            ¿Necesitas cotizar hoy? Escríbenos y te respondemos el mismo día hábil.
          </div>
          <a
            {...wa(msgCotizar(), { origen: "cta_band" })}
            className="inline-flex items-center gap-2.5 rounded-full border-2 border-white px-[34px] py-[13px] text-[15.5px] font-bold text-white hover:border-naranja hover:bg-naranja hover:text-white"
          >
            Cotizar ahora
          </a>
        </div>
      </div>

      {/* ------------------------------- footer ------------------------------ */}
      <footer className="bg-azul-osc">
        <div className="mx-auto grid max-w-page grid-cols-[1.25fr_0.85fr_0.85fr_1fr] gap-11 px-6 pb-[46px] pt-[60px] w1024:grid-cols-2 w1024:gap-[34px] w520:grid-cols-1">
          <div>
            <img src="/vsiperu-logo.svg" alt={site.name} className="h-16 w-auto brightness-0 invert" />
            <p className="mt-[18px] max-w-[340px] text-[14.5px] leading-[1.65] text-[#9FB8D4]">
              Tu aliado estratégico. Brindamos soluciones integrales con productos de alta calidad para los sectores más
              exigentes de la industria.
            </p>
            <div className="mt-[26px]">
              <h4 className={FOOTER_H4}>SEDE PRINCIPAL</h4>
              <p className="mt-[9px] text-[14.5px] leading-[1.7] text-[#9FB8D4]">
                <b className="font-bold text-white">Dirección:</b> {site.address.street}, {site.address.district}
                <br />
                <b className="font-bold text-white">Teléfono:</b> {site.phoneDisplay}
                <br />
                <b className="font-bold text-white">Email:</b>{" "}
                <a href={`mailto:${site.emailLogistica}`} className="text-white">
                  {site.emailLogistica}
                </a>
              </p>
            </div>
            <div className="mt-[22px]">
              <h4 className={FOOTER_H4}>HORARIOS DE ATENCIÓN</h4>
              <p className="mt-[9px] text-[14.5px] leading-[1.7] text-[#9FB8D4]">
                <b className="font-bold text-white">Lunes a Viernes:</b> 8:00 am – 6:00 pm
                <br />
                <b className="font-bold text-white">Sábado:</b> 9:00 am – 1:00 pm
              </p>
            </div>
          </div>

          <div>
            <h4 className={FOOTER_H4}>PRODUCTOS</h4>
            <div className={FOOTER_COL}>
              <a href="#catalogo" className={FOOTER_LINK}>
                Graseras rectas, 45° y 90°
              </a>
              <a href="#catalogo" className={FOOTER_LINK}>
                Válvulas cuchilla
              </a>
              <a href="#catalogo" className={FOOTER_LINK}>
                Tubería HDPE corrugada
              </a>
              <a href="#catalogo" className={FOOTER_LINK}>
                Accesorios HDPE
              </a>
              <a href="#catalogo" className={FOOTER_LINK}>
                Planchas de acero
              </a>
              <a href="#contacto" className={FOOTER_LINK}>
                Importación bajo pedido
              </a>
            </div>
          </div>

          <div>
            <h4 className={FOOTER_H4}>SERVICIOS</h4>
            <div className={FOOTER_COL}>
              {content.servicios.map((s) => (
                <a key={s.titulo} href="#servicios" className={FOOTER_LINK}>
                  {s.titulo.charAt(0) + s.titulo.slice(1).toLowerCase()}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={FOOTER_H4}>CHATEA CON NOSOTROS</h4>
            <div className="mt-4 flex gap-3">
              <a aria-label="WhatsApp" {...wa(msgCotizar(), { origen: "footer" })} className={`${SOCIAL_A} bg-wa`}>
                <Wa />
              </a>
              <a
                aria-label="Llamar"
                href={`tel:${site.phone}`}
                onClick={() => convert("llamada", { origen: "footer" })}
                className={`${SOCIAL_A} bg-naranja`}
              >
                <Tel s={19} />
              </a>
              <a aria-label="Correo" href={`mailto:${site.emailLogistica}`} className={SOCIAL_A}>
                <Mail s={19} />
              </a>
            </div>

            <h4 className={`${FOOTER_H4} mt-[30px]`}>SÍGUENOS EN</h4>
            <div className="mt-4 flex gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className={SOCIAL_A}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <path d="M14 9h3V5.5h-3c-2.2 0-4 1.8-4 4V12H7.5v3.5H10V22h3.5v-6.5H16L16.5 12H13.5V9.5c0-.3.2-.5.5-.5z" />
                </svg>
              </a>
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className={SOCIAL_A}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <path d="M5 4a2 2 0 100 4 2 2 0 000-4zM3.5 9.5h3V21h-3zM9 9.5h2.9v1.6c.5-.9 1.6-1.8 3.3-1.8 3 0 3.8 1.9 3.8 4.6V21h-3v-6.2c0-1.5-.5-2.4-1.8-2.4-1.1 0-1.8.8-2.1 1.5-.1.3-.1.7-.1 1V21H9z" />
                </svg>
              </a>
            </div>

            <div className="mt-[30px] rounded-lg border border-white/[.16] px-[18px] py-4">
              <div className="font-head text-[14px] font-extrabold text-white">{site.legalName}</div>
              <div className="mt-[5px] text-[13.5px] text-[#9FB8D4]">
                RUC {site.ruc} · {site.address.city}, Perú
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[.12]">
          <div className="mx-auto flex max-w-page flex-wrap justify-between gap-3 px-6 py-5 text-[13px] text-[#6F8CAF]">
            <span>
              © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                onClick={() => setPrivacidad(true)}
                className="border-none bg-transparent p-0 text-[13px] text-[#9FB8D4] hover:text-naranja"
              >
                Política de privacidad
              </button>
              <span>{site.url.replace("https://", "")}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --------------------------- modal producto -------------------------- */}
      {prod ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalSku(null)}
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-auto bg-[rgba(9,20,35,.62)] p-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative m-auto w-full max-w-[1000px] rounded-xl bg-white shadow-modal">
            <button
              aria-label="Cerrar"
              onClick={() => setModalSku(null)}
              className="absolute right-4 top-4 z-[3] flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent hover:bg-[#F1F4F8]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12233B" strokeWidth="2.2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="grid grid-cols-2 w1024:grid-cols-1">
              <div className="relative aspect-square overflow-hidden rounded-[12px_0_0_12px] bg-gris-3 w1024:aspect-auto w1024:h-[clamp(220px,42vw,320px)] w1024:rounded-[12px_12px_0_0]">
                <Ph src={prod.imagen} alt={prod.nombre} />
              </div>
              <div className="px-[clamp(24px,3vw,44px)] pb-[clamp(28px,3vw,40px)] pt-[clamp(30px,3.4vw,52px)]">
                <h3 className="text-[clamp(23px,2.6vw,30px)] leading-[1.18] text-texto">{prod.nombre}</h3>
                <p className="mt-4 text-[16px] leading-[1.65] text-texto-2">{prod.desc}</p>

                <div className="mt-[26px] flex flex-wrap items-center gap-4">
                  <span className="text-[15px] font-bold text-texto">Medidas:</span>
                  <select
                    value={medida}
                    onChange={(e) => setMedida(e.target.value)}
                    className="flex-1 basis-[200px] rounded-md border border-[#D8E0EA] bg-white px-3.5 py-[13px] text-texto outline-none focus:border-naranja"
                  >
                    <option value="">Elige una opción</option>
                    {prod.medidas.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 flex flex-wrap items-stretch gap-3.5">
                  <div className="flex items-center overflow-hidden rounded-md border border-[#D8E0EA]">
                    <button
                      aria-label="Menos"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-[52px] w-11 border-none bg-white text-[20px] text-texto hover:bg-[#F1F4F8]"
                    >
                      −
                    </button>
                    <span className="min-w-12 text-center text-[16px] font-bold">{qty}</span>
                    <button
                      aria-label="Más"
                      onClick={() => setQty((q) => q + 1)}
                      className="h-[52px] w-11 border-none bg-white text-[20px] text-texto hover:bg-[#F1F4F8]"
                    >
                      +
                    </button>
                  </div>
                  <a
                    {...wa(modalMsg, {
                      origen: "modal_producto",
                      producto: prod.nombre,
                      categoria: prod.catId,
                      sku: prod.sku,
                      medida,
                      cantidad: qty,
                    })}
                    className="flex flex-1 basis-[260px] items-center justify-center gap-3 rounded-md bg-wa px-[22px] py-4 text-[16px] font-extrabold tracking-[.02em] text-white shadow-wa-modal hover:bg-wa-osc hover:text-white"
                  >
                    <Wa /> COTIZAR POR WHATSAPP
                  </a>
                </div>

                <div className="mt-[30px] grid gap-[9px] border-t border-linea-2 pt-[22px] text-[15px] text-texto-2">
                  <div>
                    <b className="font-bold text-texto">SKU:</b> {prod.sku}
                  </div>
                  <div>
                    <b className="font-bold text-texto">Categoría:</b> {prod.categoria}
                  </div>
                  <div>
                    <b className="font-bold text-texto">Disponibilidad:</b> Stock en Lima · despacho a todo el Perú
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ------------------------ política de privacidad --------------------- */}
      {privacidad ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={content.privacidad.titulo}
          onClick={() => setPrivacidad(false)}
          className="fixed inset-0 z-[130] flex items-start justify-center overflow-auto bg-[rgba(9,20,35,.62)] p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative m-auto w-full max-w-[720px] rounded-xl bg-white p-[clamp(26px,3.4vw,44px)] shadow-modal"
          >
            <button
              aria-label="Cerrar"
              onClick={() => setPrivacidad(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent hover:bg-[#F1F4F8]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12233B" strokeWidth="2.2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <h3 className="pr-10 text-[clamp(22px,2.6vw,28px)] leading-[1.2] text-azul-osc">
              {content.privacidad.titulo}
            </h3>
            <p className="mt-2 text-[13.5px] text-texto-3">
              Última actualización: {content.privacidad.actualizado}
            </p>

            <div className="mt-7 grid gap-5">
              {content.privacidad.bloques.map(([titulo, texto]) => (
                <div key={titulo}>
                  <h4 className="text-[16px] text-texto">{titulo}</h4>
                  <p className="mt-1.5 text-[15px] leading-[1.65] text-texto-2">{texto}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPrivacidad(false)}
              className="mt-8 rounded-lg border-none bg-azul px-8 py-[13px] text-[15px] font-bold text-white hover:bg-azul-osc"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}

      <a
        aria-label="Escríbenos por WhatsApp"
        {...wa(msgCotizar(), { origen: "boton_flotante" })}
        className="fixed bottom-6 right-6 z-[80] flex h-[58px] w-[58px] animate-wa-pulse items-center justify-center rounded-full bg-wa shadow-wa-float"
      >
        <Wa s={30} />
      </a>
    </>
  );
}
