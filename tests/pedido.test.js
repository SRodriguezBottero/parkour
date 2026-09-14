'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, fromWindow } = require('./helpers');

var NAV_HTML = [
  '<!DOCTYPE html><html><body>',
  '<nav aria-label="Principal"><ul>',
  '<li class="has-submenu"><a href="disenos.html">Diseños</a>',
  '<ul class="submenu" hidden></ul></li>',
  '</ul></nav>',
  '<main></main><footer></footer>',
  '</body></html>'
].join('');

function loadPedido(options) {
  var opts = options || {};
  var html = opts.html || NAV_HTML;
  var cards = opts.cards || '';
  if (cards) {
    html = html.replace('</main>', cards + '</main>');
  }
  var dom = createDom({
    html: html,
    file: opts.file || 'index.html',
    scripts: ['products.js', 'pedido.js'],
    mobile: !!opts.mobile
  });
  return { dom: dom, win: dom.window, pedido: dom.window.PARKOUR_PEDIDO };
}

describe('pedido.js favorites and bag', function () {
  it('toggles favorites and persists ids in localStorage', function () {
    var ctx = loadPedido();
    assert.equal(ctx.pedido.isFavorite('crush'), false);
    assert.equal(ctx.pedido.toggleFavorite('crush'), true);
    assert.equal(ctx.pedido.isFavorite('crush'), true);
    assert.deepEqual(fromWindow(ctx.pedido.getFavorites()), ['crush']);
    assert.equal(ctx.win.localStorage.getItem('parkour_favoritos'), '["crush"]');
    assert.equal(ctx.pedido.toggleFavorite('crush'), false);
    assert.deepEqual(fromWindow(ctx.pedido.getFavorites()), []);
    ctx.dom.window.close();
  });

  it('recovers from corrupt favorites and bag JSON instead of throwing', function () {
    var ctx = loadPedido();
    ctx.win.localStorage.setItem('parkour_favoritos', '{not-json');
    ctx.win.localStorage.setItem('parkour_bolsa', '{not-json');
    assert.deepEqual(fromWindow(ctx.pedido.getFavorites()), []);
    assert.deepEqual(fromWindow(ctx.pedido.getBag()), []);
    assert.doesNotThrow(function () {
      ctx.pedido.toggleFavorite('alexa');
    });
    assert.deepEqual(fromWindow(ctx.pedido.getFavorites()), ['alexa']);
    ctx.dom.window.close();
  });

  it('treats null stored JSON as an empty list', function () {
    var ctx = loadPedido();
    ctx.win.localStorage.setItem('parkour_favoritos', 'null');
    ctx.win.localStorage.setItem('parkour_bolsa', 'null');
    assert.deepEqual(fromWindow(ctx.pedido.getFavorites()), []);
    assert.deepEqual(fromWindow(ctx.pedido.getBag()), []);
    ctx.dom.window.close();
  });

  it('adds bag items once per product id + size', function () {
    var ctx = loadPedido();
    var item = {
      id: 'crush',
      name: 'I have a crush on you',
      size: 'M',
      price: '$890',
      image: 'i_have_a_crush_on_you.png'
    };
    assert.equal(ctx.pedido.addToBag(item), true);
    assert.equal(ctx.pedido.addToBag(item), false);
    assert.equal(ctx.pedido.getBag().length, 1);

    assert.equal(ctx.pedido.addToBag(Object.assign({}, item, { size: 'L' })), true);
    assert.equal(ctx.pedido.getBag().length, 2);

    ctx.pedido.removeFromBag('crush', 'M');
    var remaining = ctx.pedido.getBag();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].size, 'L');

    ctx.pedido.clearBag();
    assert.equal(ctx.pedido.getBag().length, 0);
    ctx.dom.window.close();
  });

  it('builds a WhatsApp-ready order message listing each design and size', function () {
    var ctx = loadPedido();
    assert.equal(
      ctx.pedido.buildOrderMessage(),
      'Hola! Quiero hacer un pedido de remeras Parkour.'
    );

    ctx.pedido.addToBag({
      id: 'crush',
      name: 'I have a crush on you',
      size: 'M',
      price: '$890',
      image: 'i_have_a_crush_on_you.png'
    });
    ctx.pedido.addToBag({
      id: 'alexa',
      name: 'Alexa...',
      size: 'XL',
      price: '$890',
      image: 'alexa.png'
    });

    var msg = ctx.pedido.buildOrderMessage();
    assert.match(msg, /^Hola! Quiero pedir:/);
    assert.match(msg, /- I have a crush on you \(talle M\)/);
    assert.match(msg, /- Alexa\.\.\. \(talle XL\)/);
    assert.match(msg, /¿Cómo seguimos\?/);
    ctx.dom.window.close();
  });

  it('treats the placeholder WhatsApp URL as unconfigured', function () {
    var ctx = loadPedido();
    assert.equal(ctx.pedido.isWhatsAppConfigured(), false);
    ctx.dom.window.close();
  });

  it('updates nav counts and hides badges when lists are empty', function () {
    var ctx = loadPedido();
    var favCount = ctx.win.document.querySelector('[aria-label="Favoritos"] .count');
    var bagCount = ctx.win.document.querySelector('[aria-label="Mi pedido"] .count');
    assert.ok(favCount);
    assert.ok(bagCount);
    assert.ok(favCount.classList.contains('hidden'));
    assert.ok(bagCount.classList.contains('hidden'));

    ctx.pedido.toggleFavorite('crush');
    ctx.pedido.addToBag({
      id: 'crush',
      name: 'I have a crush on you',
      size: 'S',
      price: '$890',
      image: 'i_have_a_crush_on_you.png'
    });

    assert.equal(favCount.textContent, '1');
    assert.equal(bagCount.textContent, '1');
    assert.equal(favCount.classList.contains('hidden'), false);
    assert.equal(bagCount.classList.contains('hidden'), false);
    ctx.dom.window.close();
  });

  it('hands an unconfigured WhatsApp bag off to contacto with the order message', function () {
    var ctx = loadPedido();
    ctx.pedido.addToBag({
      id: 'lick',
      name: "It's not gonna lick itself",
      size: 'L',
      price: '$890',
      image: 'IT_S NOT GONNA LICK ITSELF.png'
    });
    ctx.pedido.openPanel('bag');

    var link = ctx.win.document.querySelector('#bag-panel-footer a.parkour-panel-btn');
    assert.ok(link);
    assert.match(link.getAttribute('href'), /^contacto\.html\?msg=/);
    var href = new ctx.win.URL(link.href, 'http://127.0.0.1/');
    var msg = href.searchParams.get('msg');
    assert.match(msg, /It's not gonna lick itself \(talle L\)/);
    assert.equal(ctx.win.document.getElementById('wa-order-btn'), null);
    ctx.dom.window.close();
  });

  it('mounts favorite buttons on catalog cards without following the card link', function () {
    var cards = '<a class="card" href="producto.html?id=crush"><div class="name">Crush</div></a>';
    var ctx = loadPedido({ cards: cards });
    var btn = ctx.win.document.querySelector('.card .parkour-fav-btn');
    assert.ok(btn);
    assert.equal(btn.getAttribute('data-product-id'), 'crush');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');

    btn.click();
    assert.equal(ctx.pedido.isFavorite('crush'), true);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    ctx.dom.window.close();
  });
});
