# VSI Suministros Industriales — Landing (Next.js 15 + React 19 + Tailwind CSS)

Una sola página, sin CMS, lista para producción y para Google Ads.
Es el mismo diseño que ves en `VSI Landing.dc.html`, portado a Next.js con Tailwind.

## Arrancar

```bash
cd nextjs
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
| **`lib/site.ts`** | Teléfono, WhatsApp, email, dirección, mapa, IDs de Google. Todo lo marcado `// TODO`. |
| **`data/content.json`** | El contenido: slides del hero, tiles de líneas, catálogo por categoría, servicios, marcas y FAQ. |
| `tailwind.config.ts` | Paleta, tipografías, sombras y breakpoints. |
| `app/page.tsx` | La página completa. |
| `app/globals.css` | Resets base y el offset de anclas. |
| `app/layout.tsx` | SEO, metadata, JSON-LD y carga de GA4/GTM/Ads. |

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

- **`hero[]`** — carrusel: `titulo`, `descripcion`, `notaTitulo`, `notaTexto`, `imagen`, `ctaTexto`, `ctaMensaje`.
- **`bento[]`** — tiles de "Líneas de producto"; `catIndex` apunta a la categoría que abre al hacer clic.
- **`categorias[]`** — el catálogo. Cada una con `label`, `skuPrefijo` (genera el SKU), `medidas[]` (el selector del modal) y `productos[]` (`nombre`, `desc`, `imagen`).
- **`servicios[]`** — 6 tarjetas; `alto` puede ser `"corto"` o `"alto"` (las dos últimas son verticales).
- **`marcas[]`** — carrusel de logos.
- **`faqs[]`** — pares `[pregunta, respuesta]`. Si agregas o quitas, actualiza también el bloque `FAQPage` en `app/layout.tsx` para que el schema coincida.

## Imágenes

Deja el archivo en `public/` y pon la ruta (`"/graseras-recta.jpg"`) en el campo `imagen` correspondiente. Mientras esté vacío se ve un placeholder gris con el nombre.

Recomendado: **fotos de producto cuadradas 1:1 con fondo blanco**, ~800×800 px, JPG/WebP ≤200 KB. Para hero y servicios, horizontales de ~1600 px.

Faltan y son obligatorios:
- `public/og-vsi.jpg` (1200×630) — la miniatura al compartir en WhatsApp/Facebook/LinkedIn
- `public/favicon.ico` y `public/apple-touch-icon.png`

## SEO ya resuelto

- `metadata` completo: title, description, keywords, canonical, Open Graph, Twitter, robots
- `app/sitemap.ts` → `/sitemap.xml`, `app/robots.ts` → `/robots.txt`
- JSON-LD: Organization, LocalBusiness (dirección, horarios, mapa), WebSite, ItemList de productos y **FAQPage**
- `lang="es-PE"`, un solo `<h1>`, headings jerárquicos

## Funcionalidad

- Hero carrusel con auto-avance (7 s), flechas y puntos
- Buscador con **debounce 350 ms**, sin tildes, sobre nombre + descripción + categoría
- Menú "Todas las categorías" y tiles del bento → abren el catálogo en la pestaña correspondiente
- Modal de producto con medida, cantidad y mensaje de WhatsApp prearmado (incluye SKU)
- Formulario de cotización → arma el mensaje y abre WhatsApp, con `gclid`/UTM adjuntos
- Eventos de conversión (`conv_whatsapp`, `conv_llamada`, `conv_formulario`) listos para GTM/Ads

## Deploy

Vercel es lo más simple: importa el repo, apunta `vsiperu.com.pe` y listo. Después del deploy: verifica el dominio en Search Console y envía `https://vsiperu.com.pe/sitemap.xml`.
