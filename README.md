# Parkour

Sitio de Parkour: remeras de diseño propio, tiradas chicas, hechas en Uruguay.

HTML estático, sin build ni carrito. Quien quiere una remera elige diseño y talle, y coordina por Instagram o WhatsApp.

En el aire: [arteroto.netlify.app](https://arteroto.netlify.app)

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Home |
| `disenos.html` | Catálogo. Filtra por categoría con `?cat=` |
| `producto.html` | Ficha. Abre con `?id=` |
| `contacto.html` | Cómo pedir |
| `envios.html` | Montevideo e interior |
| `nav.js` | Submenú de **Diseños** y hamburguesa móvil |
| `products.js` | Datos de todos los productos (única fuente de verdad) |
| `pedido.js` | Favoritos (❤️) y bolsa de pedido (🛍️) |
| `welcome.js` | Banner de bienvenida, sticker y easter egg |

Categorías del submenú: Todos, Big lebowski, Frases, LOTR, Pelis random, Seinfeld, Succession.

## Cómo verlo en local

No hace falta instalar nada. Desde esta carpeta:

```bash
python3 -m http.server 8000
```

Abrí [http://127.0.0.1:8000](http://127.0.0.1:8000).

Abrir los HTML con `file://` suele romper rutas y el JS. Mejor el servidor.

## Cómo agregar un diseño

Ahora hay **un solo lugar**: el archivo `products.js`.

**1. Imagen** en la raíz del repo (el nombre puede tener espacios).

**2. Agregar al array `PRODUCTS`** en `products.js`:

```js
{
  id: 'nuevo-id',           // usado en la URL: producto.html?id=nuevo-id
  name: 'Nombre del diseño',
  price: '$890',
  categorySlug: 'frases',   // debe coincidir con el del submenú
  categoryLabel: 'Frases',  // versión para mostrar
  image: 'nombre_archivo.png',
  desc: 'Descripción corta para la ficha.',
  featured: true            // true para que aparezca en "Lo último" del home
}
```

Categorías disponibles: `frases`, `pelis-random`, `big-lebowski`, `lotr`, `seinfeld`, `succession`.

Eso es todo. El catálogo (`disenos.html`), el home (`index.html`) y la ficha de producto (`producto.html`) leen de `products.js` automáticamente.

Si la categoría todavía no tiene productos, `disenos.html?cat=...` muestra el vacío.

## Favoritos y Pedido

Parkour tiene un sistema de favoritos y bolsa de pedido que funciona con localStorage (sin backend).

### Favoritos (❤️)
- Click en el corazón de cualquier producto para agregarlo a favoritos
- Los favoritos se guardan en el navegador
- Click en el ícono de corazón en la navegación para ver tus favoritos

### Bolsa de pedido (🛍️)
- En la página de producto, elegí talle y hacé click en "Agregar al pedido"
- Click en el ícono de bolsa en la navegación para ver tu pedido
- "Pedir por WhatsApp" arma un mensaje con todos los diseños y talles
- Si WhatsApp no está configurado, te lleva a Contacto con el mensaje armado

### Íconos de navegación
En desktop aparecen en la barra de navegación. En mobile aparecen fijos en la parte inferior de la pantalla.

## Pedidos (Instagram / WhatsApp)

En `contacto.html`:

```js
const INSTAGRAM_URL = 'https://www.instagram.com/';
const WHATSAPP_URL = 'https://wa.me/'; // ej: https://wa.me/59899123456
```

Hasta que no estén los datos reales, Instagram apunta al home de IG y WhatsApp no tiene número.

## Tests de regresión

El sitio se sigue sirviendo como HTML estático, sin build. Para correr la suite:

```bash
npm install
npm test
```

Cubre catálogo, ficha (imagen única, sin galería, talle M por defecto, `?id=` vacío o con params extra, hash/`cat` al lado del id, id solo en el hash, trailing slash, letras percent-encoded en `id`/`cat`, `?size=` ignorado en la ficha, cambio de radio sin agregar a la bolsa, hyphen encoded, espacio/`+` en lugar del hyphen, id en mayúscula, trailing space, XXL/XXXL/S/L, primer `id`/`cat` si se repite, `?ID=`/`?CAT=` no cargan, 404 no muta bolsa, CTA ficha → `contacto.html` incluso sin `pedido.js` y sin `target=_blank`, radios S–XXXL, OG title/desc/image de todos los productos, alt de ficha, `encodeImageSrc` en catálogo/home/ficha, `is-added` en el primer click, `data-category` de las cards, apostrofe de lick en el catálogo), contacto (`%` y `&` en el mensaje, `%` malformado, HTML de `?msg=`/`product` como texto, WhatsApp placeholder sin `?text=`, lead vs draft, product+size sin msg, primer `msg`/`product`/`size` si se repite, `+` como espacio, keys en mayúscula, hash después de `msg`, hash-only `#msg=`/`#product=` ignorado, IG hrefs con `target=_blank` + `rel` después de reescribir), favoritos/bolsa (unicidad id+talle case-sensitive, hidratación, snapshot de 5 campos first-write-wins, JSON vacío/`false`, `#` en thumbs, API sin nav, handoff en envíos, `id` no primero en el card, corazones sincronizados, quitar último renglón, bolsa → contacto, nota WA a `contacto.html`, foco al cerrar el panel, `bag-changed` no dispara en el duplicado, badges `aria-live`), nav móvil y desktop (hover, Escape, overlay cerrado no abre, click-outside after Escape, drawer sin submenu, resize a mobile no abre, resize móvil no cierra, focusin con submenu dismissed, hamburger cierra inert, hamburger `type=button` + `aria-controls`, Diseños `aria-haspopup`/`aria-controls`), integridad del catálogo (archivos de imagen, ids URL-safe y sin padding, `categoryLabel` por slug, slugs case-sensitive, submenu y categorías vacías en todas las páginas, desc/precio, `pelis%2Drandom`, `#` múltiples en encodeImageSrc), el sticker por pathname (incluye `/` y fichas con `?id=` distinto, copy allowlist), persistencia banner vs sonido (click de play, rewind, src del mp3, autoplay bloqueado), el footer GIF decorativo y el mp3, logo a `index.html`, Nosotr@s → `#about`, `lang=es`, Instagram `noopener`, y los arreglos de a11y de los íconos y el botón de sonido.

## Publicar

Netlify, deploy de la carpeta (drag & drop o git). Subí **todos** los HTML, los JS (`nav.js`, `products.js`, `pedido.js`, `welcome.js`) y las imágenes. El `package.json` es solo para tests; no hace falta para publicar.
