'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom } = require('./helpers');

function loadCatalog(search, extra) {
  var opts = extra || {};
  return createDom({
    file: 'disenos.html',
    search: search,
    scripts: opts.scripts || ['products.js'],
    runInline: true
  });
}

function loadProduct(search) {
  return createDom({
    file: 'producto.html',
    search: search,
    scripts: ['products.js', 'pedido.js'],
    runInline: true
  });
}

function loadHome(extra) {
  var opts = extra || {};
  return createDom({
    file: 'index.html',
    scripts: opts.scripts || ['products.js'],
    runInline: true
  });
}

describe('disenos.html category filter', function () {
  it('shows the full catalog for unknown or missing ?cat=', function () {
    var missing = loadCatalog('');
    var bogus = loadCatalog('?cat=no-existe');
    var expected = missing.window.PARKOUR_PRODUCTS.length;
    assert.equal(missing.window.document.querySelectorAll('#grid .card').length, expected);
    assert.equal(bogus.window.document.querySelectorAll('#grid .card').length, expected);
    assert.equal(missing.window.document.getElementById('page-title').textContent, 'Lo último');
    assert.equal(bogus.window.document.getElementById('page-title').textContent, 'Lo último');
    assert.equal(missing.window.document.getElementById('empty').classList.contains('visible'), false);
    assert.equal(missing.window.document.getElementById('secret-stock').style.display, 'none');
    missing.window.close();
    bogus.window.close();
  });

  it('filters a known category and marks the submenu current page', function () {
    var dom = loadCatalog('?cat=frases');
    var cards = dom.window.document.querySelectorAll('#grid .card');
    assert.ok(cards.length > 0);
    cards.forEach(function (card) {
      assert.equal(card.getAttribute('data-category'), 'frases');
    });
    var current = dom.window.document.querySelector('#submenu-disenos a[aria-current="page"]');
    assert.ok(current);
    assert.equal(current.getAttribute('data-cat'), 'frases');
    assert.equal(dom.window.document.getElementById('page-title').textContent, 'Frases');
    assert.equal(dom.window.document.title, 'Frases — Parkour');
    dom.window.close();
  });

  it('shows the empty state and secret stock button only for empty non-todos categories', function () {
    var emptyCat = loadCatalog('?cat=lotr');
    var empty = emptyCat.window.document.getElementById('empty');
    var secret = emptyCat.window.document.getElementById('secret-stock');
    var grid = emptyCat.window.document.getElementById('grid');
    assert.equal(grid.querySelectorAll('.card').length, 0);
    assert.ok(empty.classList.contains('visible'));
    assert.ok(grid.classList.contains('is-empty'));
    assert.equal(secret.style.display, 'inline-block');
    assert.match(secret.getAttribute('href'), /youtube\.com\/watch\?v=dQw4w9WgXcQ/);
    emptyCat.window.close();

    var all = loadCatalog('');
    assert.equal(all.window.document.getElementById('secret-stock').style.display, 'none');
    all.window.close();
  });

  it('encodes catalog image src for filenames with spaces', function () {
    var dom = loadCatalog('');
    var img = Array.prototype.find.call(
      dom.window.document.querySelectorAll('#grid img'),
      function (node) {
        return node.getAttribute('src').indexOf('soy') !== -1;
      }
    );
    assert.ok(img);
    assert.equal(img.getAttribute('src'), 'soy%20bonito%20no%20Perfecto.png');
    dom.window.close();
  });

  it('mounts favorite buttons on catalog cards after pedido.js inits', function () {
    var dom = loadCatalog('', { scripts: ['products.js', 'pedido.js'] });
    var cards = dom.window.document.querySelectorAll('#grid .card');
    assert.ok(cards.length > 0);
    var btn = cards[0].querySelector('.parkour-fav-btn');
    assert.ok(btn);
    assert.equal(btn.getAttribute('data-product-id'), cards[0].getAttribute('href').split('id=')[1]);
    var productId = btn.getAttribute('data-product-id');
    btn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.isFavorite(productId), true);
    assert.equal(dom.window.PARKOUR_PEDIDO.getBag().length, 0);
    dom.window.close();
  });
});

describe('index.html featured strip', function () {
  it('renders featured products with encoded image filenames', function () {
    var dom = loadHome();
    var cards = dom.window.document.querySelectorAll('#featured-strip .card');
    assert.equal(cards.length, dom.window.PARKOUR_UTILS.getFeaturedProducts().length);
    var img = Array.prototype.find.call(
      dom.window.document.querySelectorAll('#featured-strip img'),
      function (node) {
        return String(node.getAttribute('src')).indexOf('soy') !== -1;
      }
    );
    assert.ok(img);
    assert.equal(img.getAttribute('src'), 'soy%20bonito%20no%20Perfecto.png');
    dom.window.close();
  });

  it('mounts favorite buttons on the hero tee-card and featured strip', function () {
    var dom = loadHome({ scripts: ['products.js', 'pedido.js'] });
    var tee = dom.window.document.querySelector('.tee-card[href*="producto.html?id="]');
    assert.ok(tee);
    var teeBtn = tee.querySelector('.parkour-fav-btn');
    assert.ok(teeBtn);
    assert.equal(teeBtn.getAttribute('data-product-id'), 'crush');

    var stripCard = dom.window.document.querySelector('#featured-strip .card');
    assert.ok(stripCard);
    assert.ok(stripCard.querySelector('.parkour-fav-btn'));

    teeBtn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.isFavorite('crush'), true);
    assert.equal(stripCard.querySelector('.parkour-fav-btn').getAttribute('aria-pressed'), 'true');
    dom.window.close();
  });
});

describe('producto.html ficha', function () {
  it('renders a known product and wires the Instagram CTA with size', function () {
    var dom = loadProduct('?id=crush');
    var doc = dom.window.document;
    assert.equal(doc.getElementById('product').classList.contains('hidden'), false);
    assert.equal(doc.getElementById('missing').classList.contains('visible'), false);
    assert.equal(doc.getElementById('p-name').textContent, 'I have a crush on you');
    assert.equal(doc.title, 'I have a crush on you — Parkour');

    var cta = doc.getElementById('p-cta');
    var href = new dom.window.URL(cta.href, 'http://127.0.0.1/');
    assert.equal(href.searchParams.get('product'), 'I have a crush on you');
    assert.equal(href.searchParams.get('size'), 'M');
    assert.match(href.searchParams.get('msg'), /talle M/);

    doc.querySelector('input[name="size"][value="XL"]').checked = true;
    doc.querySelector('input[name="size"][value="XL"]').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    href = new dom.window.URL(cta.href, 'http://127.0.0.1/');
    assert.equal(href.searchParams.get('size'), 'XL');
    assert.match(href.searchParams.get('msg'), /talle XL/);
    dom.window.close();
  });

  it('shows the missing state for an unknown or empty id', function () {
    var unknown = loadProduct('?id=no-existe');
    assert.ok(unknown.window.document.getElementById('product').classList.contains('hidden'));
    assert.ok(unknown.window.document.getElementById('missing').classList.contains('visible'));
    assert.equal(unknown.window.document.title, 'No encontrado — Parkour');
    unknown.window.close();

    var empty = loadProduct('');
    assert.ok(empty.window.document.getElementById('missing').classList.contains('visible'));
    empty.window.close();
  });

  it('shows a single design image and no gallery thumbnails', function () {
    var crush = loadProduct('?id=crush');
    var crushImg = crush.window.document.getElementById('p-img');
    assert.equal(crush.window.document.getElementById('gallery-thumbs'), null);
    assert.equal(crush.window.document.querySelectorAll('.gallery-thumb').length, 0);
    assert.equal(crush.window.document.querySelectorAll('.product-gallery').length, 0);
    assert.equal(crushImg.getAttribute('src'), 'i_have_a_crush_on_you.png');
    assert.equal(crushImg.getAttribute('alt'), 'I have a crush on you — diseño de remera');
    crush.window.close();

    var spaced = loadProduct('?id=soy-bonito');
    var spacedImg = spaced.window.document.getElementById('p-img');
    assert.equal(spacedImg.getAttribute('src'), 'soy%20bonito%20no%20Perfecto.png');
    assert.equal(spaced.window.document.getElementById('gallery-thumbs'), null);
    spaced.window.close();

    var alexa = loadProduct('?id=alexa');
    assert.equal(alexa.window.document.getElementById('p-img').getAttribute('src'), 'alexa.png');
    assert.equal(alexa.window.document.querySelectorAll('.gallery-thumb').length, 0);
    alexa.window.close();
  });

  it('encodes the Open Graph image URL when the filename has spaces', function () {
    var dom = loadProduct('?id=soy-bonito');
    var ogImage = dom.window.document.querySelector('meta[property="og:image"]');
    assert.equal(
      ogImage.getAttribute('content'),
      'https://arteroto.netlify.app/soy%20bonito%20no%20Perfecto.png'
    );
    var ogUrl = dom.window.document.querySelector('meta[property="og:url"]');
    assert.equal(ogUrl.getAttribute('content'), 'https://arteroto.netlify.app/producto.html?id=soy-bonito');
    dom.window.close();
  });

  it('adds the selected size to the bag and does not duplicate the same line', function () {
    var dom = loadProduct('?id=agencia');
    var doc = dom.window.document;
    doc.querySelector('input[name="size"][value="L"]').checked = true;
    doc.querySelector('input[name="size"][value="L"]').dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    var btn = doc.getElementById('add-to-bag-btn');
    btn.click();
    var bag = dom.window.PARKOUR_PEDIDO.getBag();
    assert.equal(bag.length, 1);
    assert.equal(bag[0].id, 'agencia');
    assert.equal(bag[0].size, 'L');
    assert.equal(btn.textContent, '¡Agregado!');

    btn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.getBag().length, 1);
    assert.equal(btn.textContent, 'Ya está en tu pedido');
    dom.window.close();
  });

  it('toggles the on-ficha favorite button without adding a bag line', function () {
    var dom = loadProduct('?id=alexa');
    var btn = dom.window.document.getElementById('product-fav-btn');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    btn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.isFavorite('alexa'), true);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    assert.equal(btn.getAttribute('aria-label'), 'Quitar de favoritos');
    assert.equal(dom.window.PARKOUR_PEDIDO.getBag().length, 0);
    btn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.isFavorite('alexa'), false);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    dom.window.close();
  });
});
