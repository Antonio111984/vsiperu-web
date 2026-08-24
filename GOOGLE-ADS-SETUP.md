# Configuración de medición — GTM · GA4 · Google Ads

Guía operativa para la campaña de **Graseras de acero inoxidable**.
Todo lo que está en este documento se hace **fuera del código**, en las
interfaces de Google. El sitio ya empuja los eventos; falta conectarlos.

> Los IDs que aparecen aquí son **placeholders**. Reemplázalos por los reales
> de tu cuenta: `GTM-XXXXXXX`, `G-XXXXXXXXXX`, `AW-XXXXXXXXX`.

---

## 0. Arquitectura elegida y por qué

```
Web (Next.js)
   └── window.dataLayer.push({ event: "conv_formulario", ... })
          └── Google Tag Manager        ← ÚNICO sistema de etiquetado
                 ├── GA4  (evento)
                 └── Google Ads (conversión)
```

**Google Tag Manager es la fuente principal.** Cuando `NEXT_PUBLIC_GTM_ID`
está definida:

- todos los eventos van al `dataLayer` y a ningún otro lado;
- **no se carga `gtag.js`** y **no se llama a `window.gtag()`** para registrar
  conversiones — el contenedor es el único que dispara la etiqueta de Ads;
- resultado: **una acción del usuario = un push = una conversión**.

El envío directo por `gtag` se conservó **solo como fallback** para el caso de
no tener contenedor (variables `NEXT_PUBLIC_GA4_ID` /
`NEXT_PUBLIC_GOOGLE_ADS_ID` sin `NEXT_PUBLIC_GTM_ID`). Los dos modos son
**mutuamente excluyentes por código** (`analyticsMode` en `lib/site.ts`): no
existe ninguna configuración en la que ambos estén activos a la vez, que es
justamente donde se originan las conversiones duplicadas.

---

## 1. Variables de entorno (Vercel)

`Vercel → Project → Settings → Environment Variables` (Production + Preview):

| Variable | Ejemplo | ¿Obligatoria? |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | **Sí** — es el modo recomendado |
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | No — solo modo fallback sin GTM |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-XXXXXXXXX` | No — solo modo fallback sin GTM |
| `NEXT_PUBLIC_ADS_CONVERSION_WHATSAPP` | `AW-XXXXXXXXX/AbCdEfGhIjKl` | No — solo modo fallback |
| `NEXT_PUBLIC_ADS_CONVERSION_FORMULARIO` | `AW-XXXXXXXXX/AbCdEfGhIjKl` | No — solo modo fallback |
| `NEXT_PUBLIC_ADS_CONVERSION_LLAMADA` | `AW-XXXXXXXXX/AbCdEfGhIjKl` | No — solo modo fallback |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `abc123...` | No — verificación de Search Console |

**Si usas GTM (recomendado): define solo `NEXT_PUBLIC_GTM_ID`.** Con GA4 y Ads
configurados dentro del contenedor, las otras variables no hacen falta.

> Next.js inyecta estas variables en **tiempo de build**. Después de cambiarlas
> en Vercel hay que hacer **Redeploy**.

---

## 2. Eventos que emite la web

Contrato estable. Estos tres nombres no cambian:

| Evento | Cuándo se dispara | En Google Ads |
|---|---|---|
| `conv_formulario` | Envío del formulario de cotización, **después** de pasar la validación | **PRIMARY** |
| `conv_whatsapp` | Clic en cualquier botón/enlace de WhatsApp | SECONDARY |
| `conv_llamada` | Clic en un enlace `tel:` | SECONDARY |

**`conv_formulario` es el lead más calificado**: el usuario dejó nombre,
celular y su requerimiento antes de que se abriera WhatsApp.

⚠️ El envío del formulario dispara **únicamente** `conv_formulario`. Aunque el
flujo termine abriendo WhatsApp, **no** se dispara además `conv_whatsapp`: es
un solo lead y contarlo dos veces inflaría las conversiones.

### Parámetros que acompañan a cada evento

Solo se envían los que existen en ese momento — **nunca `undefined`, `null` ni
strings vacíos**. Antes de cada evento se empuja un objeto de reset, así que un
evento nunca hereda los parámetros del anterior.

| Parámetro | Ejemplo | Presente en |
|---|---|---|
| `origen` | `catalogo_card`, `hero_1`, `modal_producto`, `footer` | todos |
| `producto` | `Grasera NPT recta` | cuando el CTA conoce el producto |
| `categoria` | `graseras` | cuando el CTA conoce la categoría |
| `sku` | `VSI-GRA-01` | catálogo y modal |
| `medida` | `1/4" NPT` | modal, si el usuario eligió una |
| `cantidad` | `3` | modal |
| `focus` | `graseras` | si entró por `?focus=graseras` |
| `landing_page` | `/` | todos |
| `gclid` / `gbraid` / `wbraid` | `Cj0ABC123…` | si vino de Google Ads |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content` | `google` / `cpc` / … | si la URL traía UTMs |
| `ciudad` | `Lima` | solo en `conv_formulario` |

**Privacidad:** nombre, apellido, celular, DNI/RUC y el texto del requerimiento
**no se envían nunca** a analítica. Solo viajan en el mensaje de WhatsApp que
el propio usuario envía. `ciudad` es un dato geográfico y no identifica a la
persona.

### Valores de `origen` disponibles

`topbar` · `header` · `hero_1` … `hero_7` · `catalogo_card` ·
`catalogo_otros_tipos` · `modal_producto` · `servicio_<nombre>` ·
`servicios_cta` · `cotiza_bloque` · `formulario_cotizacion` · `cta_band` ·
`footer` · `boton_flotante`

---

## 3. Google Tag Manager — paso a paso

### 3.1 Variables de capa de datos

`Variables → Nueva → Variable de capa de datos`. Crea **una por cada nombre**,
usando exactamente el mismo nombre en el campo *Nombre de la variable de capa
de datos*. Se recomienda nombrarlas `dlv - <nombre>`:

| Nombre de la variable en GTM | Nombre de la variable de capa de datos |
|---|---|
| `dlv - origen` | `origen` |
| `dlv - producto` | `producto` |
| `dlv - categoria` | `categoria` |
| `dlv - sku` | `sku` |
| `dlv - medida` | `medida` |
| `dlv - cantidad` | `cantidad` |
| `dlv - focus` | `focus` |
| `dlv - gclid` | `gclid` |
| `dlv - utm_source` | `utm_source` |
| `dlv - utm_medium` | `utm_medium` |
| `dlv - utm_campaign` | `utm_campaign` |
| `dlv - utm_term` | `utm_term` |
| `dlv - utm_content` | `utm_content` |

En todas: *Versión de la variable de capa de datos* = **Versión 2**.
Deja *Valor predeterminado* vacío (los parámetros ausentes simplemente no se
envían).

### 3.2 Etiqueta base de GA4

`Etiquetas → Nueva → Google Tag`

- **ID de etiqueta:** `G-XXXXXXXXXX`
- **Activador:** `Initialization - All Pages`

### 3.3 Conversion Linker

`Etiquetas → Nueva → Conversion Linker`

- **Habilitar la vinculación en todos los dominios:** sin marcar
- **Activador:** `Initialization - All Pages`

Es **imprescindible**: sin él el `gclid` no se guarda en cookie y Google Ads no
puede atribuir la conversión al clic del anuncio.

### 3.4 Activadores (Custom Event)

`Activadores → Nuevo → Evento personalizado`. Crea **tres**, y en cada uno
escribe el nombre del evento **exactamente igual**, con *Se activa en: Todos
los eventos personalizados*:

| Nombre del activador | Nombre del evento |
|---|---|
| `CE - conv_formulario` | `conv_formulario` |
| `CE - conv_whatsapp` | `conv_whatsapp` |
| `CE - conv_llamada` | `conv_llamada` |

### 3.5 Etiquetas de conversión de Google Ads

`Etiquetas → Nueva → Seguimiento de conversiones de Google Ads`. Una por cada
activador. El **ID** y la **etiqueta** los da Google Ads en el paso 5.

| Etiqueta | ID de conversión | Etiqueta de conversión | Activador |
|---|---|---|---|
| `Ads - Conv Formulario` | `AW-XXXXXXXXX` | `AbCdEfGhIjKl` | `CE - conv_formulario` |
| `Ads - Conv WhatsApp` | `AW-XXXXXXXXX` | `MnOpQrStUvWx` | `CE - conv_whatsapp` |
| `Ads - Conv Llamada` | `AW-XXXXXXXXX` | `YzAbCdEfGhIj` | `CE - conv_llamada` |

**Deja el campo `Valor de conversión` VACÍO** en las tres. La web no envía un
valor monetario a propósito (ver sección 6).

### 3.6 Etiquetas de evento de GA4

`Etiquetas → Nueva → Evento de Google Analytics`. Una por cada activador, con
la etiqueta de configuración de GA4:

| Etiqueta | Nombre del evento | Activador |
|---|---|---|
| `GA4 - conv_formulario` | `conv_formulario` | `CE - conv_formulario` |
| `GA4 - conv_whatsapp` | `conv_whatsapp` | `CE - conv_whatsapp` |
| `GA4 - conv_llamada` | `conv_llamada` | `CE - conv_llamada` |

En *Parámetros del evento* de cada una, añade los que quieras analizar:

| Nombre del parámetro | Valor |
|---|---|
| `origen` | `{{dlv - origen}}` |
| `producto` | `{{dlv - producto}}` |
| `categoria` | `{{dlv - categoria}}` |
| `sku` | `{{dlv - sku}}` |
| `medida` | `{{dlv - medida}}` |
| `cantidad` | `{{dlv - cantidad}}` |
| `focus` | `{{dlv - focus}}` |

### 3.7 Probar y publicar

1. **Vista previa (Preview)** con la URL `https://vsiperu.com.pe/?focus=graseras`.
2. Haz clic en un botón de WhatsApp del catálogo → debe aparecer
   `conv_whatsapp` con `origen=catalogo_card`, `producto`, `categoria=graseras`,
   `sku` y `focus=graseras`.
3. Envía el formulario → debe aparecer **solo** `conv_formulario`,
   **nunca también** `conv_whatsapp`.
4. **Enviar → Publicar.**

---

## 4. Google Analytics 4

1. `Administrar → Flujos de datos` → confirma que la propiedad `G-XXXXXXXXXX`
   recibe datos.
2. `Administrar → Eventos` → tras registrar tráfico real aparecerán
   `conv_formulario`, `conv_whatsapp` y `conv_llamada`.
3. `Administrar → Eventos clave` → marca **`conv_formulario`** como evento
   clave. (`conv_whatsapp` y `conv_llamada` son opcionales.)
4. `Administrar → Definiciones personalizadas → Crear dimensión personalizada`.
   Ámbito **Evento**, una por cada parámetro que quieras segmentar:
   `origen`, `producto`, `categoria`, `sku`, `medida`, `cantidad`, `focus`.
   Sin esto los parámetros llegan pero no se pueden usar en informes.

---

## 5. Google Ads

### 5.1 Crear las conversiones

`Objetivos → Conversiones → Nueva acción de conversión → Sitio web →
Añadir manualmente` (**no** uses "Importar desde GA4", ver sección 7).

| Acción de conversión | Categoría | Recuento | Acción principal/secundaria |
|---|---|---|---|
| `Formulario de cotización` | Enviar formulario de contacto | **Una** | **Principal (Primary)** |
| `Clic WhatsApp` | Contacto | **Una** | **Secundaria (Secondary)** |
| `Clic Llamada` | Llamada telefónica | **Una** | **Secundaria (Secondary)** |

En las tres: **Valor → No usar un valor** (ver sección 6).
**Recuento = "Una"**, no "Todas": un mismo usuario que hace cinco clics en
WhatsApp es un lead, no cinco.

Al terminar, Google Ads muestra el **ID de conversión** (`AW-XXXXXXXXX`) y la
**etiqueta** de cada acción. Cópialos a las etiquetas de GTM del paso 3.5.

### 5.2 Campaña de Graseras

- **URL final:** `https://vsiperu.com.pe/?focus=graseras`
- Deja activado el **etiquetado automático** (auto-tagging) en
  `Configuración de la cuenta` — es lo que genera el `gclid`.
- Añade UTMs en el *sufijo de URL final* si además quieres verlas en GA4:
  `utm_source=google&utm_medium=cpc&utm_campaign=graseras&utm_term={keyword}`

Con `?focus=graseras` la landing abre directamente con el hero y la categoría
de Graseras, y todas las conversiones de esa sesión llevan `focus=graseras`.

---

## 6. Valor de conversión

La web **no envía** ningún valor monetario. Antes se enviaba `value: 1,
currency: "PEN"` en todas las conversiones, lo que asigna un valor comercial
ficticio de S/ 1 a cada lead y contamina cualquier estrategia futura de ROAS o
"Maximizar valor de conversión".

Si más adelante conoces el valor real de un lead (por ejemplo, el ticket
promedio de una cotización cerrada), la función `convert()` ya acepta `value`
como parámetro opcional, y en GTM basta con rellenar el campo *Valor de
conversión*. Mientras tanto: **sin valor** es mejor que **con valor inventado**.

---

## 7. Cómo evitar el doble conteo

Tres reglas. Las tres importan.

**1. Un solo sistema de etiquetado.**
Con `NEXT_PUBLIC_GTM_ID` definida, la web no carga `gtag.js` ni llama a
`gtag()`. Está garantizado por código.

**2. NO importar estas conversiones desde GA4 a Google Ads.**
Si las conversiones ya se miden con **GTM → Google Ads**, **no** las importes
además desde GA4 (`Objetivos → Importar → Google Analytics 4`) como
conversiones **Primary**. El mismo lead se contaría dos veces: una por la
etiqueta de Ads y otra por el evento importado.

Elige **uno** de los dos caminos:

| Camino | Cómo | Estado |
|---|---|---|
| **A — GTM → Ads** | Etiquetas de conversión de Ads en GTM (sección 3.5) | ✅ **El que documenta esta guía** |
| **B — GA4 → Ads** | Importar los eventos clave de GA4 en Ads | ❌ No usar junto con A |

Si alguna vez importas eventos de GA4 con fines de análisis, déjalos como
**Secondary** y **fuera** de la columna "Conversiones" (`Incluir en
"Conversiones" = No`), para que no alimenten la puja.

**3. El formulario no dispara `conv_whatsapp`.**
Garantizado por código en `app/page.tsx`.

### Configuración final esperada en Google Ads

| Acción | Origen | Tipo | En "Conversiones" |
|---|---|---|---|
| Formulario de cotización | GTM (etiqueta de Ads) | **Primary** | Sí |
| Clic WhatsApp | GTM (etiqueta de Ads) | Secondary | No |
| Clic Llamada | GTM (etiqueta de Ads) | Secondary | No |

Así la puja optimiza hacia el lead calificado (`conv_formulario`), y los clics
de WhatsApp y llamada quedan disponibles como señal de observación sin
distorsionar el CPA.

---

## 8. Checklist de validación

- [ ] `NEXT_PUBLIC_GTM_ID` en Vercel + **Redeploy**.
- [ ] En el HTML publicado aparece `gtm.js?id=GTM-XXXXXXX` y **no** aparece
      `gtag/js?id=`.
- [ ] Conversion Linker publicado.
- [ ] En Preview de GTM, `conv_whatsapp` desde el catálogo trae `origen`,
      `producto`, `categoria` y `sku`.
- [ ] En Preview, enviar el formulario dispara **solo** `conv_formulario`.
- [ ] Entrando por `?focus=graseras`, todos los eventos traen `focus=graseras`.
- [ ] Entrando por una URL con `gclid`, los eventos traen `gclid`.
- [ ] En Google Ads, `Formulario de cotización` = Primary; WhatsApp y Llamada
      = Secondary.
- [ ] En Google Ads **no** existen conversiones importadas desde GA4 con los
      mismos nombres marcadas como Primary.
