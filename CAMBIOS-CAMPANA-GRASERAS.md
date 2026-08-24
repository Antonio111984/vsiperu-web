# Preparación de la landing para la campaña de Graseras — informe de cambios

**Fecha:** 23 de agosto de 2026
**Alcance:** medición profesional (GTM · GA4 · Google Ads), modo campaña
`?focus=graseras`, relevancia de Graseras, privacidad y correcciones de SEO
técnico.

No se rediseñó la página, no se crearon rutas nuevas, no se convirtió en
ecommerce. Todo sigue ocurriendo dentro de `/`.

---

## 1. Archivos modificados

| Archivo | Qué cambió |
|---|---|
| `lib/site.ts` | Los IDs de Google salen de variables de entorno. Nueva constante `analyticsMode` (`"gtm" \| "gtag" \| "off"`) como fuente única de verdad del sistema de etiquetado. |
| `lib/analytics.ts` | Reescrito. GTM como fuente principal, `gtag` solo como fallback excluyente, metadata tipada en las conversiones, limpieza de valores vacíos, reset del dataLayer entre eventos, soporte de `?focus=`, `value` de conversión ahora opcional. |
| `app/layout.tsx` | Carga de scripts gobernada por `analyticsMode`. `dataLayer` inicializado antes que cualquier script. Metadata y JSON-LD actualizados. El schema `FAQPage` ahora lee de `data/content.json`. |
| `app/page.tsx` | Un solo `<h1>`. Soporte de `?focus=graseras`. Metadata de negocio en los 11 CTAs de WhatsApp. Conversión del formulario con `origen`/`categoría`. Modal de política de privacidad. Tiles del bento apuntan por `catId`. |
| `data/content.json` | Copy del hero de Graseras, ortografía de los otros slides, 6 productos de graseras diferenciados, FAQ de graseras, bloque `privacidad`, campos `focus`/`catId` en el hero y `catId` en el bento. |
| `README.md` | Sección de medición, variables de entorno, modo campaña y notas de contenido actualizadas. |
| `public/servicios/Arenado, granallado y galvanizado.png` | Renombrado sin la coma: el archivo devolvía 404 (ver §6). |

### Archivos nuevos

| Archivo | Para qué |
|---|---|
| `GOOGLE-ADS-SETUP.md` | Guía paso a paso de GTM, GA4 y Google Ads, con la política anti-duplicados. |
| `.env.example` | Plantilla de las variables de entorno, comentada. |
| `CAMBIOS-CAMPANA-GRASERAS.md` | Este documento. |

---

## 2. Variables `.env` que debes crear en Vercel

`Vercel → Project → Settings → Environment Variables` (Production **y** Preview):

```env
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_ADS_CONVERSION_WHATSAPP=
NEXT_PUBLIC_ADS_CONVERSION_FORMULARIO=
NEXT_PUBLIC_ADS_CONVERSION_LLAMADA=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

**Con GTM (recomendado) basta con `NEXT_PUBLIC_GTM_ID`.** Las de GA4/Ads y las
tres etiquetas de conversión son el fallback para operar sin contenedor, y el
código las ignora por completo cuando GTM está activo.

Todas son opcionales: vacías, la web funciona igual y no envía nada a Google
(útil en desarrollo). Next.js las inyecta en **tiempo de build**: después de
cambiarlas en Vercel hay que hacer **Redeploy**.

---

## 3. Decisión de arquitectura: por qué no habrá conversiones duplicadas

El problema de la implementación anterior era que la decisión estaba implícita:
`layout.tsx` cargaba GTM si existía `gtmId`, mientras `adsConversion()`
dependía de `window.gtag`, que en ese escenario nunca existía. Funcionaba por
casualidad, y cualquier cambio en la carga de scripts habría empezado a contar
doble en silencio.

Ahora hay una sola constante, `analyticsMode`, evaluada igual en servidor y
cliente, que gobierna las dos cosas:

| `analyticsMode` | Scripts que carga `layout.tsx` | Qué hace `convert()` |
|---|---|---|
| `"gtm"` (hay `NEXT_PUBLIC_GTM_ID`) | Solo GTM | Solo `dataLayer.push` |
| `"gtag"` (hay GA4/Ads, no GTM) | Solo `gtag.js` | `dataLayer.push` + `gtag('event','conversion')` |
| `"off"` (sin IDs) | Ninguno | Solo `dataLayer.push` |

Es **imposible** por construcción que GTM y `gtag` estén activos a la vez.
`adsConversion()` empieza con `if (analyticsMode !== "gtag") return;`.

Se conservó el envío directo por `gtag` porque permite medir sin contenedor,
pero **no es el camino recomendado**: con GTM se ignora.

Las otras dos fuentes de doble conteo:

- **El formulario dispara solo `conv_formulario`**, nunca además
  `conv_whatsapp`, aunque el flujo termine abriendo WhatsApp. Es un lead.
- **No importar estas conversiones desde GA4 a Google Ads** si ya se miden con
  GTM → Ads. Esto vive en la configuración, no en el código: está documentado
  en `GOOGLE-ADS-SETUP.md` §7 y repetido en el checklist.

---

## 4. Acciones manuales que tienes que hacer

La guía detallada, con cada campo, está en **`GOOGLE-ADS-SETUP.md`**. Resumen:

### 4.1 Vercel
1. Crear `NEXT_PUBLIC_GTM_ID` con tu contenedor `GTM-XXXXXXX`.
2. (Opcional) `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` para Search Console.
3. **Redeploy.**
4. Verificar en el HTML publicado: aparece `gtm.js?id=GTM-XXXXXXX` y **no**
   aparece `gtag/js?id=`.

### 4.2 Google Tag Manager
1. Crear **13 variables de capa de datos** (Versión 2): `origen`, `producto`,
   `categoria`, `sku`, `medida`, `cantidad`, `focus`, `gclid`, `utm_source`,
   `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
2. **Google Tag / GA4 base** (`G-XXXXXXXXXX`) con activador
   `Initialization - All Pages`.
3. **Conversion Linker** con activador `Initialization - All Pages`.
   *Imprescindible*: sin él el `gclid` no se guarda en cookie y Ads no atribuye.
4. **3 activadores de evento personalizado**: `conv_formulario`,
   `conv_whatsapp`, `conv_llamada`.
5. **3 etiquetas de conversión de Google Ads**, una por activador, con el ID y
   la etiqueta que te da Ads. **Dejar el campo de valor VACÍO.**
6. **3 etiquetas de evento de GA4**, una por activador, con los parámetros
   `origen`, `producto`, `categoria`, `sku`, `medida`, `cantidad`, `focus`.
7. Probar en **Preview** con `https://vsiperu.com.pe/?focus=graseras` y
   **Publicar**.

### 4.3 Google Analytics 4
1. Marcar **`conv_formulario`** como **evento clave**.
2. Crear **dimensiones personalizadas** de ámbito Evento para `origen`,
   `producto`, `categoria`, `sku`, `medida`, `cantidad`, `focus`. Sin esto los
   parámetros llegan pero no se pueden usar en informes.

### 4.4 Google Ads
1. Crear **3 acciones de conversión manuales** (*no* importadas de GA4):

   | Acción | Categoría | Recuento | Tipo |
   |---|---|---|---|
   | Formulario de cotización | Enviar formulario de contacto | Una | **Primary** |
   | Clic WhatsApp | Contacto | Una | Secondary |
   | Clic Llamada | Llamada telefónica | Una | Secondary |

   En las tres: **Valor → No usar un valor**. **Recuento = "Una"**, no "Todas".
2. Copiar el ID (`AW-XXXXXXXXX`) y la etiqueta de cada una a las etiquetas de GTM.
3. Confirmar que el **etiquetado automático (auto-tagging)** está activo.
4. **URL final de la campaña:** `https://vsiperu.com.pe/?focus=graseras`
5. **Verificar que NO existan conversiones importadas desde GA4** con estos
   mismos nombres marcadas como Primary.

---

## 5. Eventos y parámetros que verás en GTM

Tres eventos personalizados, contrato estable:

| Evento | Se dispara cuando | En Ads |
|---|---|---|
| `conv_formulario` | El formulario pasa la validación y el usuario envía | **PRIMARY** |
| `conv_whatsapp` | Clic en cualquier CTA de WhatsApp | SECONDARY |
| `conv_llamada` | Clic en un enlace `tel:` | SECONDARY |

Parámetros. **Nunca se envían `undefined`, `null` ni strings vacíos**, y antes
de cada evento se empuja un objeto de reset para que ninguno herede los
parámetros del anterior:

| Parámetro | Ejemplo | Cuándo aparece |
|---|---|---|
| `origen` | `catalogo_card` | siempre |
| `producto` | `Grasera NPT recta` | si el CTA conoce el producto |
| `categoria` | `graseras` | si el CTA conoce la categoría |
| `sku` | `VSI-GRA-01` | catálogo y modal |
| `medida` | `1/4" NPT` | modal, si se eligió |
| `cantidad` | `3` | modal |
| `focus` | `graseras` | si entró por `?focus=graseras` |
| `landing_page` | `/` | siempre |
| `gclid` · `gbraid` · `wbraid` | `Cj0ABC123…` | si vino de Google Ads |
| `utm_source` · `utm_medium` · `utm_campaign` · `utm_term` · `utm_content` | `google`, `cpc`… | si la URL traía UTMs |
| `ciudad` | `Lima` | solo `conv_formulario` |

Ejemplo real capturado en la validación:

```json
{
  "event": "conv_whatsapp",
  "gclid": "Cj0TEST999",
  "utm_source": "google", "utm_medium": "cpc",
  "utm_campaign": "graseras_peru", "utm_term": "graseras inoxidables",
  "landing_page": "/", "focus": "graseras",
  "origen": "modal_producto", "producto": "Grasera NPT 90°",
  "categoria": "graseras", "sku": "VSI-GRA-03",
  "medida": "1/4\" NPT", "cantidad": 3
}
```

**Valores de `origen` disponibles:** `topbar` · `header` · `hero_1`…`hero_7` ·
`catalogo_card` · `catalogo_otros_tipos` · `modal_producto` ·
`servicio_<nombre>` · `servicios_cta` · `cotiza_bloque` ·
`formulario_cotizacion` · `cta_band` · `footer` · `boton_flotante`

---

## 6. Qué se cambió, punto por punto

### Medición
- **Metadata en todos los CTAs de WhatsApp.** `convert("whatsapp", { origen })`
  pasó a aceptar un objeto tipado (`ConvMeta`). Los 11 CTAs (hero, header,
  catálogo, tarjeta de producto, "otros tipos", modal, servicios, botón
  flotante, formulario, CTA final, footer) envían ahora lo que saben:
  `producto`, `categoria`, `sku`, `medida`, `cantidad`. **Ningún enlace de
  WhatsApp cambió de destino.**
- **Reset del dataLayer entre eventos.** El dataLayer es persistente: sin
  reset, un clic en el footer arrastraba el `producto` del último modal
  abierto. Ahora cada evento empieza limpio.
- **`value: 1, currency: "PEN"` eliminado.** Asignaba un valor comercial
  ficticio de S/ 1 a cada lead y habría contaminado cualquier estrategia futura
  de ROAS. `value` quedó como parámetro opcional de `convert()`, para cuando
  exista un valor real.
- **`captured_at` ya no se empuja** al dataLayer: es control interno del
  almacenamiento, no parte del contrato con GTM.
- **Atribución conservada** tal cual estaba: `sessionStorage` para la sesión y
  `localStorage` para el *first touch*, de modo que un usuario que vuelve días
  después sin `gclid` sigue acreditando el clic original del anuncio.

### Modo campaña `?focus=graseras`
- Abre la landing con el **hero de Graseras** y la **categoría Graseras**
  seleccionada. El resto de la landing queda idéntico.
- El valor se persiste en `sessionStorage` y acompaña a todos los eventos de
  esa sesión, aunque el usuario navegue por anclas y el query se pierda.
- Se resuelve dentro de un `useEffect`, no en el estado inicial: leer
  `window.location` durante el render habría provocado un error de hidratación.
- El valor se valida contra una lista blanca (`["graseras"]`), así que un
  `?focus=` arbitrario no inyecta nada al dataLayer.

### Formulario
- `conv_formulario` se dispara **solo tras pasar la validación** del navegador
  (si falta un campo `required`, el `submit` ni siquiera se ejecuta) y **solo
  una vez** — no dispara además `conv_whatsapp`.
- Envía `origen: "formulario_cotizacion"` y `categoria: "graseras"` cuando el
  usuario llegó por `?focus=graseras`.
- **No se envía ningún dato personal a analítica**: nombre, apellido, celular,
  DNI/RUC y el texto del requerimiento viajan únicamente en el mensaje de
  WhatsApp que el propio usuario envía al asesor. Solo `ciudad` acompaña al
  evento, y es un dato geográfico que no identifica a la persona.

### Relevancia de Graseras
- **Hero corregido.** Antes: *"SELECCIÓN DE GRASERAS EN ACERO INOXIDABLE,
  SOLUCIONES DE ACUERDO A TUS NECESIDADES"* con *"entrega rapida … todo el
  pais"* sin tildes. Ahora:

  > **GRASERAS DE ACERO INOXIDABLE PARA APLICACIONES INDUSTRIALES**
  > Graseras rectas, de 45° y de 90°, en roscas NPT y UNF. Importadores
  > directos, con stock en Lima y despacho a todo el Perú. Atendemos por unidad
  > y en volúmenes mayoristas.

  Cubre de forma natural *graseras inoxidables*, *graseras industriales*,
  *graseras de acero inoxidable*, *grasera recta / 45° / 90°*, *graseras NPT* y
  *graseras UNF*, sin repetición forzada. Los argumentos (*importadores
  directos · stock en Lima · despacho a todo el Perú*) son los que el sitio ya
  declaraba.
- **Ortografía corregida** en los otros seis slides (*TUBERIAS*, *corrosion*,
  *util*, *optimo*, *empaquetduras*, *MANOMETROS*, *IDELAES*, *presion*,
  *PERFILERIA*, *inafraestructura solida*).
- **Los 6 productos genéricos se diferenciaron** según la imagen que ya tenía
  cada uno:

  | Antes | Ahora |
  |---|---|
  | Graseras NPT ×3 | Grasera NPT recta · Grasera NPT 45° · Grasera NPT 90° |
  | Graseras UNF ×3 | Grasera UNF recta · Grasera UNF 45° · Grasera UNF 90° |

  Con descripciones útiles para B2B (cuándo usar cada geometría) y **sin
  inventar medidas, materiales, certificaciones ni stock**. Las medidas del
  selector no se tocaron.
- Las descripciones alimentan el buscador, así que buscar *"grasera 90"* ahora
  devuelve exactamente las dos de 90°.

### H1 y SEO técnico
- **De 7 `<h1>` a 1.** Cada slide del carrusel emitía su propio `<h1>` aunque
  estuviera oculto. Ahora el slide de Graseras — el contenido principal de esta
  landing — lleva el `<h1>` y los otros seis usan `<h2>`, con la **misma clase
  de estilo**: el carrusel no cambió visualmente ni un píxel.
- Metadata actualizada para destacar Graseras **sin volverla exclusiva de
  Graseras**: el título y la descripción siguen cubriendo válvulas,
  empaquetaduras y HDPE, porque VSI comercializa más líneas.
- `ItemList` del schema ampliado a las 5 líneas reales (antes omitía
  Empaquetaduras).
- El schema `FAQPage` ahora se genera desde `data/content.json` en vez de tener
  el texto duplicado en `layout.tsx`: no se pueden volver a desincronizar, que
  es lo que Google exige para el rich result.
- `canonical` sigue apuntando a `https://vsiperu.com.pe`, así que
  `?focus=graseras` no genera contenido duplicado. `robots` y `sitemap` sin
  cambios: la web sigue indexable.

### Privacidad
- Modal de **Política de privacidad** accesible desde el checkbox del
  formulario y desde el footer. Sin páginas nuevas.
- Declara responsable (*Suministros Industriales VSI*, RUC, domicilio),
  finalidad (*atender solicitudes de cotización/contacto*), qué datos se
  recogen, que no se comparten y cómo solicitar acceso o eliminación. Texto
  editable en `data/content.json` → `privacidad`. **Sin cláusulas legales
  inventadas.**
- El checkbox pasó de *"Acepto términos y condiciones"* a *"Acepto los términos
  y la **política de privacidad**"*, con el enlace al modal.

### Corrección de un bug encontrado durante la auditoría
Los tiles de "Líneas de producto" apuntaban a la categoría por índice numérico
(`catIndex`), y tres de los cinco habían quedado desfasados al insertarse
"Empaquetaduras" en el arreglo de categorías:

| Tile | Abría antes | Abre ahora |
|---|---|---|
| TUBOS HDPE Y ACCESORIOS | Empaquetaduras ❌ | Tubos HDPE ✅ |
| PLANCHAS Y PERFILES | Tubos HDPE ❌ | Planchas ✅ |
| CONEXIONES INOX, ACERO, OTROS | Planchas ❌ | Accesorios ✅ |

Ahora apuntan por `catId`, que no se puede desincronizar al reordenar
categorías.

### Segundo bug encontrado: una imagen de Servicios devolvía 404

La tarjeta **"Arenado, granallado y galvanizado"** mostraba el placeholder gris
en vez de su foto. La causa: la **coma** en el nombre del archivo. El navegador
la envía literal en la URL y Next.js no la resuelve así (solo funciona
percent-codificada como `%2C`, que ningún navegador genera por su cuenta).

Se renombró el archivo quitando la coma y se actualizó la ruta en
`data/content.json`. Se comprobaron **las 36 imágenes** que referencia el sitio:
ahora todas devuelven `200`. También es un problema previo, no introducido por
estos cambios, pero la sección de Servicios es parte de la landing a la que
llegará el tráfico de la campaña.

---

## 7. Validación

### `npm install` — ✅ correcto

```
up to date, audited 107 packages in 1s
3 high severity vulnerabilities
```

Las 3 vulnerabilidades son **previas y ajenas a estos cambios**: vienen de
`sharp <0.35.0` (dependencia opcional de Next.js para optimización de imágenes)
y sus CVE heredadas de `libvips`. `npm audit fix --force` las resuelve
instalando **Next.js 16**, que es un cambio de versión mayor con roturas: queda
fuera del alcance de este trabajo y conviene planificarlo aparte. No afectan al
build ni a la campaña.

### `npm run build` — ✅ correcto

```
▲ Next.js 15.5.23

✓ Compiled successfully in 2.2s
  Linting and checking validity of types ...
✓ Generating static pages (6/6)

Route (app)                                 Size  First Load JS
┌ ○ /                                    17.8 kB         120 kB
├ ○ /_not-found                            996 B         104 kB
├ ○ /robots.txt                            124 B         103 kB
└ ○ /sitemap.xml                           124 B         103 kB
+ First Load JS shared by all             103 kB

○  (Static)  prerendered as static content
```

Sin errores de TypeScript, sin warnings. La página sigue siendo estática
(`○ Static`), como antes.

### Pruebas en navegador real (Chrome headless)

Se ejecutó la landing compilada y se verificó interactivamente:

| Comprobación | Resultado |
|---|---|
| Exactamente un `<h1>`, y es el de Graseras | ✅ |
| `?focus=graseras` abre el hero y la categoría de Graseras | ✅ |
| `focus` persiste y acompaña a todos los eventos | ✅ |
| 6 graseras diferenciadas en el catálogo | ✅ |
| `conv_whatsapp` desde el catálogo lleva `origen`/`producto`/`categoria`/`sku` | ✅ |
| Modal: medida y cantidad llegan al evento (`1/4" NPT`, `3`) | ✅ |
| Ningún evento hereda parámetros del anterior | ✅ |
| Buscador: *"grasera 90"* → las dos de 90° | ✅ |
| Los 5 tiles del bento abren la categoría correcta | ✅ |
| **Enviar el formulario dispara UN solo evento y es `conv_formulario`** | ✅ |
| El formulario sigue abriendo WhatsApp con el mensaje completo | ✅ |
| El evento NO contiene nombre, celular, RUC ni el requerimiento | ✅ |
| Formulario incompleto → ninguna conversión | ✅ |
| Modal de privacidad abre, cierra y no marca el checkbox | ✅ |
| El scroll del `body` se restaura al cerrar los modales | ✅ |
| Carrusel, categorías, llamada desde el footer | ✅ |
| Sesión limpia sin `?focus=`: ni `focus` ni `gclid` inventados | ✅ |
| Visita posterior sin `gclid` conserva el del primer clic (*first touch*) | ✅ |
| Ningún parámetro `undefined`, `null` ni vacío en el dataLayer | ✅ |
| Sin errores de hidratación ni de consola | ✅ |
| Sin recursos 404 (las 36 imágenes referenciadas devuelven `200`) | ✅ |
| Móvil 390×844: sin scroll horizontal, modal cabe en pantalla | ✅ |

### Modos de etiquetado, verificados en el HTML publicado

| Configuración | GTM cargado | `gtag.js` cargado |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID=GTM-TEST123` (+ GA4 y Ads definidos) | ✅ sí | ✅ **no** |
| Solo `NEXT_PUBLIC_GA4_ID` + `NEXT_PUBLIC_GOOGLE_ADS_ID` | ✅ no | ✅ sí, con ambos `config` |
| Sin variables | ✅ no | ✅ no |

Nota del primer caso: aun teniendo GA4 y Ads definidos, con GTM presente
`gtag.js` **no** se carga. Ahí es donde se corta la posibilidad de doble conteo.

### Revisión específica pedida

- **Eventos duplicados:** ninguno. Un clic = un push.
- **Errores de hidratación:** ninguno. `?focus=` se resuelve en `useEffect`.
- **`window` durante SSR:** todos los accesos están dentro de `useEffect` o de
  manejadores de eventos, y las funciones de `analytics.ts` guardan con
  `typeof window === "undefined"`.
- **Timers sin limpiar:** el `setInterval` del carrusel y el `setTimeout` del
  buscador se limpian en el cleanup del `useEffect`, igual que antes. No se
  añadieron timers nuevos.
- **Parámetros `undefined` en el dataLayer:** filtrados por `limpiar()`.
- **Cambios visuales accidentales:** ninguno. El `<h1>`/`<h2>` del hero comparte
  la constante de estilo `HERO_TITULO`. Lo único nuevo que se ve es el enlace
  a la política de privacidad (checkbox y footer) y su modal.

---

## 8. Pendiente, fuera de este alcance

**`public/og-vsi.jpg` no existe** (devuelve 404). Es un problema previo, no
introducido por estos cambios, pero conviene resolverlo antes de la campaña:
está referenciado en el Open Graph, en Twitter Card y en `LocalBusiness.image`
del schema. Sin ese archivo, compartir el enlace en WhatsApp, Facebook o
LinkedIn muestra una vista previa rota — justamente el canal por el que se
cierran los leads.

Basta con dejar una imagen de **1200×630** en `public/og-vsi.jpg`. No requiere
tocar código.
