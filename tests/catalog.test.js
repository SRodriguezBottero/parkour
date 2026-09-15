'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom } = require('./helpers');

function loadCatalog(search) {
  return createDom({
    file: 'disenos.html',
    search: search,
    scripts: ['products.js'],
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

  it('adds the selected size to the bag and does not duplicate the same line', function () {
    var dom = loadProduct('?id=agencia');
    var btn = dom.window.document.getElementById('add-to-bag-btn');
    btn.click();
    var bag = dom.window.PARKOUR_PEDIDO.getBag();
    assert.equal(bag.length, 1);
    assert.equal(bag[0].id, 'agencia');
    assert.equal(bag[0].size, 'M');
    assert.equal(btn.textContent, '¡Agregado!');

    btn.click();
    assert.equal(dom.window.PARKOUR_PEDIDO.getBag().length, 1);
    assert.equal(btn.textContent, 'Ya está en tu pedido');
    dom.window.close();
  });

  it('hides thumbnail navigation when the product has a single image', function () {
    var dom = loadProduct('?id=crush');
    var thumbs = dom.window.document.getElementById('gallery-thumbs');
    var mainImg = dom.window.document.getElementById('p-img');
    assert.ok(thumbs.classList.contains('single'));
    assert.equal(thumbs.querySelectorAll('.gallery-thumb').length, 1);
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /i_have_a_crush_on_you\.png/);
    assert.match(mainImg.getAttribute('alt'), /Diseño/);
    dom.window.close();
  });

  it('builds mockup thumbs and switches the main image from click and keyboard', function () {
    var dom = loadProduct('?id=alexa');
    var win = dom.window;
    var thumbs = win.document.getElementById('gallery-thumbs');
    var mainImg = win.document.getElementById('p-img');
    var buttons = thumbs.querySelectorAll('.gallery-thumb');

    assert.equal(thumbs.classList.contains('single'), false);
    assert.equal(buttons.length, 2);
    assert.equal(buttons[0].getAttribute('aria-selected'), 'true');
    assert.equal(buttons[1].getAttribute('aria-selected'), 'false');
    assert.equal(buttons[0].getAttribute('tabindex'), '0');
    assert.equal(buttons[1].getAttribute('tabindex'), '-1');
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /alexa\.png/);
    assert.equal(mainImg.getAttribute('alt'), 'Alexa... — Diseño');

    buttons[1].click();
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /mockups\/alexa-flat\.png/);
    assert.equal(mainImg.getAttribute('alt'), 'Alexa... — Mockup 1');
    assert.equal(buttons[0].getAttribute('aria-selected'), 'false');
    assert.equal(buttons[1].getAttribute('aria-selected'), 'true');
    assert.equal(buttons[1].getAttribute('tabindex'), '0');

    thumbs.dispatchEvent(new win.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true
    }));
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /alexa\.png/);
    assert.equal(buttons[0].getAttribute('aria-selected'), 'true');

    thumbs.dispatchEvent(new win.KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
      cancelable: true
    }));
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /mockups\/alexa-flat\.png/);

    thumbs.dispatchEvent(new win.KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
      cancelable: true
    }));
    assert.match(String(mainImg.getAttribute('src') || mainImg.src), /alexa\.png/);
    assert.equal(buttons[0].getAttribute('tabindex'), '0');
    assert.equal(buttons[1].getAttribute('tabindex'), '-1');
    dom.window.close();
  });
});
