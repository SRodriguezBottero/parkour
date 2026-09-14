(function() {
  'use strict';

  var CATEGORIES = {
    todos: { slug: 'todos', label: 'Lo último' },
    'big-lebowski': { slug: 'big-lebowski', label: 'Big lebowski' },
    frases: { slug: 'frases', label: 'Frases' },
    lotr: { slug: 'lotr', label: 'LOTR' },
    'pelis-random': { slug: 'pelis-random', label: 'Pelis random' },
    seinfeld: { slug: 'seinfeld', label: 'Seinfeld' },
    succession: { slug: 'succession', label: 'Succession' }
  };

  var PRODUCTS = [
    {
      id: 'crush',
      name: 'I have a crush on you',
      price: '$890',
      categorySlug: 'frases',
      categoryLabel: 'Frases',
      image: 'i_have_a_crush_on_you.png',
      desc: 'Dos autos, un choque y cero sutileza. Diseño propio, print en remera, tirada chica.',
      featured: true
    },
    {
      id: 'soy-bonito',
      name: 'Soy bonito no perfecto',
      price: '$890',
      categorySlug: 'pelis-random',
      categoryLabel: 'Pelis random',
      image: 'soy bonito no Perfecto.png',
      desc: 'Autoestima con humor. Para quienes saben que bonito no es lo mismo que perfecto.',
      featured: true
    },
    {
      id: 'agencia',
      name: 'Agencia Espacial Uruguaya',
      price: '$890',
      categorySlug: 'frases',
      categoryLabel: 'Frases',
      image: 'Agencia espacial uruguaya.png',
      desc: 'El termo como cohete oficial. Parodia local, diseño original, cero licencia trucha.',
      featured: true
    },
    {
      id: 'lick',
      name: "It's not gonna lick itself",
      price: '$890',
      categorySlug: 'frases',
      categoryLabel: 'Frases',
      image: 'IT_S NOT GONNA LICK ITSELF.png',
      desc: 'Frase que se entiende sola. Remera para quienes no se andan con vueltas.',
      featured: true
    },
    {
      id: 'alexa',
      name: 'Alexa...',
      price: '$890',
      categorySlug: 'frases',
      categoryLabel: 'Frases',
      image: 'alexa.png',
      gallery: ['mockups/alexa-flat.png'],
      desc: 'Cuando la conversación se pone interesante. Diseño propio, tirada limitada.',
      featured: true
    }
  ];

  var productsById = {};
  for (var i = 0; i < PRODUCTS.length; i++) {
    productsById[PRODUCTS[i].id] = PRODUCTS[i];
  }

  window.PARKOUR_PRODUCTS = PRODUCTS;
  window.PARKOUR_PRODUCTS_BY_ID = productsById;
  window.PARKOUR_CATEGORIES = CATEGORIES;

  window.PARKOUR_UTILS = {
    getProductById: function(id) {
      return productsById[id] || null;
    },
    getFeaturedProducts: function() {
      return PRODUCTS.filter(function(p) { return p.featured; });
    },
    getProductsByCategory: function(slug) {
      if (slug === 'todos') return PRODUCTS;
      return PRODUCTS.filter(function(p) { return p.categorySlug === slug; });
    },
    getCategoryLabel: function(slug) {
      return CATEGORIES[slug] ? CATEGORIES[slug].label : 'Lo último';
    },
    encodeImageSrc: function(filename) {
      return encodeURI(filename).replace(/#/g, '%23');
    }
  };
})();
