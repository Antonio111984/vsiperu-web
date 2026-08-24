# VSI Suministros Industriales — Landing (Next.js 15 + React 19 + Tailwind CSS)

Una sola página, sin CMS, lista para producción y para Google Ads.
Es el mismo diseño que ves en `VSI Landing.dc.html`, portado a Next.js con Tailwind.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3.4** — todo el estilo son utilidades; `globals.css` solo tiene los resets base
- `next/font` para Manrope (títulos) y Plus Jakarta Sans (cuerpo), autoalojadas

## Qué editar

| Archivo | Qué contiene |
|---|---|
| **`lib/site.ts`** | Teléfono, WhatsApp, email, dirección y mapa. Los IDs de Google **ya no van aquí**: son variables de entorno. |
| **`.env.local`** | IDs de Google (GTM, GA4, Ads). Copia `.env.example`. En producción se administran desde Vercel. |
| **`data/content.json`** | El contenido: slides del hero, tiles de líneas, catálogo por categoría, servicios, marcas y FAQ. |
| `tailwind.config.ts` | Paleta, tipografías, sombras y breakpoints. |
| `app/page.tsx` | La página completa. |
| `app/globals.css` | Resets base y el offset de anclas. |
| `app/layout.tsx` | SEO, metadata, JSON-LD y carga de GTM/GA4/Ads. |
| `lib/analytics.ts` | Eventos de conversión, atribución (gclid/UTM) y modo campaña `?focus=`. |

### La paleta vive en `tailwind.config.ts`

```
azul #083B7A · azul-osc #052B59 · azul-cl #0A4788
naranja #E47A24 · naranja-osc #CF6A18
wa #25D366 (solo WhatsApp)
gris #F5F7FA · linea #E3E8EF · texto #12233B · texto-2 #55637A
```

Úsalas como `bg-azul`, `text-naranja`, `border-linea`. No metas hex sueltos.

### Breakpoints

Son **max-width**, replicando exactamente los cortes del diseño original:

| Clase | Ancho | Qué cambia |
|---|---|---|
| `w1180:` | ≤1180 | franja de tipos 6 → 3 |
| `w1024:` | ≤1024 | hero/cotiza/faq/footer a 1 columna, se oculta nav y topbar, catálogo 4 → 3 |
| `w900:` | ≤900 | catálogo 3 → 2 |
| `w760:` | ≤760 | buscador a su propia línea, servicios 2 → 1 |
| `w640:` | ≤640 | bento a 1 columna, franja 2 columnas, formulario 1 columna |
| `w520:` | ≤520 | footer 1 columna, logo más chico |
| `w380:` | ≤380 | catálogo 1 columna |

Los tamaños de texto y los paddings usan `clamp()`, así que escalan de forma continua entre cortes.

### `data/content.json` en detalle

- **`hero[]`** — carrusel: `titulo`, `descripcion`, `imagen`, `imagenAlt`, `ctaTexto`, `ctaProducto`, más `catId` (categoría que etiqueta la conversión, `""` si no aplica) y `focus` (qué valor de `?focus=` abre ese slide, `""` si ninguno). **El primer slide es el que lleva el `<h1>`**; los demás usan `<h2>`.
- **`bento[]`** — tiles de "Líneas de producto"; `catId` apunta por **id** a la categoría que abre al hacer clic.
- **`privacidad`** — texto del modal de política de privacidad: `titulo`, `actualizado` y `bloques[]` (pares `[titulo, texto]`).
- **`categorias[]`** — el catálogo. Cada una con `label`, `skuPrefijo` (genera el SKU), `medidas[]` (el selector del modal) y `productos[]` (`nombre`, `desc`, `imagen`).
- **`servicios[]`** — 6 tarjetas; `alto` puede ser `"corto"` o `"alto"` (las dos últimas son verticales).
- **`marcas[]`** — carrusel de logos.
- **`faqs[]`** — pares `[pregunta, respuesta]`. El schema `FAQPage` de `app/layout.tsx` los lee de aquí, así que basta con editarlos en un sitio.

## Imágenes

Deja el archivo en `public/` y pon la ruta (`"/graseras-recta.jpg"`) en el campo `imagen` correspondiente. Mientras esté vacío se ve un placeholder gris con el nombre.

Recomendado: **fotos de producto cuadradas 1:1 con fondo blanco**, ~800×800 px, JPG/WebP ≤200 KB. Para hero y servicios, horizontales de ~1600 px.

Faltan y son obligatorios:
- `public/og-vsi.jpg` (1200×630) — la miniatura al compartir en WhatsApp/Facebook/LinkedIn
- `public/favicon.ico` y `public/apple-touch-icon.png`

## SEO ya resuelto

- `metadata` completo: title, description, keywords, canonical, Open Graph, Twitter, robots
- El `canonical` apunta siempre a `https://vsiperu.com.pe`, así que `?focus=graseras` no genera contenido duplicado
- `app/sitemap.ts` → `/sitemap.xml`, `app/robots.ts` → `/robots.txt`
- JSON-LD: Organization, LocalBusiness (dirección, horarios, mapa), WebSite, ItemList de productos y **FAQPage**
- `lang="es-PE"`, un solo `<h1>`, headings jerárquicos

## Funcionalidad

- Hero carrusel con auto-avance (7 s), flechas y puntos
- Buscador con **debounce 350 ms**, sin tildes, sobre nombre + descripción + categoría
- Menú "Todas las categorías" y tiles del bento → abren el catálogo en la pestaña correspondiente
- Modal de producto con medida, cantidad y mensaje de WhatsApp prearmado (incluye SKU)
- Formulario de cotización → arma el mensaje y abre WhatsApp, con `gclid`/UTM adjuntos
- Modal de política de privacidad, accesible desde el checkbox del formulario y desde el footer
- Eventos de conversión (`conv_whatsapp`, `conv_llamada`, `conv_formulario`) listos para GTM/Ads

## Medición

**Google Tag Manager es la fuente principal.** La web empuja los eventos al
`dataLayer` y el contenedor decide qué mandar a GA4 y a Google Ads. Con GTM
configurado, `gtag.js` **no** se carga: los dos modos son mutuamente
excluyentes por código (`analyticsMode` en `lib/site.ts`), que es como se evita
que una misma conversión se cuente dos veces.

Configúralo con estas variables de entorno (todas opcionales; copia
`.env.example` a `.env.local` para desarrollo y créalas en Vercel para
producción):

```env
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_ADS_CONVERSION_WHATSAPP=
NEXT_PUBLIC_ADS_CONVERSION_FORMULARIO=
NEXT_PUBLIC_ADS_CONVERSION_LLAMADA=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

Con GTM basta `NEXT_PUBLIC_GTM_ID`; las de GA4/Ads son el fallback para operar
sin contenedor. Next.js inyecta estos valores en **build time**: tras cambiarlos
en Vercel hay que hacer **Redeploy**.

**La guía completa (activadores, variables de capa de datos, conversiones de
Ads y cómo no duplicar) está en [`GOOGLE-ADS-SETUP.md`](GOOGLE-ADS-SETUP.md).**

### Modo campaña: `?focus=graseras`

`https://vsiperu.com.pe/?focus=graseras` abre la landing con el hero y la
categoría de Graseras ya seleccionados, y añade `focus=graseras` a todos los
eventos de esa sesión. Es la misma página `/`: no hay ruta aparte.

## Deploy

Vercel es lo más simple: importa el repo, apunta `vsiperu.com.pe` y listo. Después del deploy: verifica el dominio en Search Console y envía `https://vsiperu.com.pe/sitemap.xml`.
