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

## Publicar

Netlify, deploy de la carpeta (drag & drop o git). Subí **todos** los HTML, los JS (`nav.js`, `products.js`, `welcome.js`) y las imágenes. No hay `package.json` ni paso de build.
