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
| `nav.js` | Submenú de **Diseños** (hover, teclado, Escape) |

Categorías del submenú: Todos, Big lebowski, Frases, LOTR, Pelis random, Seinfeld, Succession.

## Cómo verlo en local

No hace falta instalar nada. Desde esta carpeta:

```bash
python3 -m http.server 8000
```

Abrí [http://127.0.0.1:8000](http://127.0.0.1:8000).

Abrir los HTML con `file://` suele romper rutas y el JS. Mejor el servidor.

## Cómo agregar un diseño

Hay que tocarlo en **tres** lugares, con el mismo `id` (ej. `crush`).

**1. Imagen** en la raíz del repo (el nombre del archivo puede tener espacios).

**2. Card** en `disenos.html` (y, si va en “Lo último”, también en `index.html`):

```html
<a class="card" data-category="frases" href="producto.html?id=crush">
  <div class="art">
    <img src="i_have_a_crush_on_you.png" alt="">
  </div>
  <div class="name">I have a crush on you</div>
  <div class="price">$890</div>
</a>
```

`data-category` tiene que coincidir con el del submenú: `frases`, `pelis-random`, `big-lebowski`, `lotr`, `seinfeld`, `succession`.

**3. Datos** en el objeto `PRODUCTS` de `producto.html`:

```js
crush: {
  name: 'I have a crush on you',
  price: '$890',
  category: 'Frases',
  image: 'i_have_a_crush_on_you.png',
  desc: 'Dos autos, un choque y cero sutileza.'
}
```

Si la categoría todavía no tiene productos, `disenos.html?cat=...` muestra el vacío.

## Pedidos (Instagram / WhatsApp)

En `contacto.html`:

```js
const INSTAGRAM_URL = 'https://www.instagram.com/';
const WHATSAPP_URL = 'https://wa.me/'; // ej: https://wa.me/59899123456
```

Hasta que no estén los datos reales, Instagram apunta al home de IG y WhatsApp no tiene número.

## Publicar

Netlify, deploy de la carpeta (drag & drop o git). Subí **todos** los HTML, `nav.js` y las imágenes. No hay `package.json` ni paso de build.
