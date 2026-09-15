'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom } = require('./helpers');

function loadUtils() {
  var dom = createDom({
    html: '<!DOCTYPE html><html><body></body></html>',
    scripts: ['products.js']
  });
  return { dom: dom, utils: dom.window.PARKOUR_UTILS, products: dom.window.PARKOUR_PRODUCTS };
}

describe('products.js catalog utils', function () {
  it('looks up products by id and returns null for missing ids', function () {
    var ctx = loadUtils();
    var crush = ctx.utils.getProductById('crush');
    assert.ok(crush);
    assert.equal(crush.name, 'I have a crush on you');
    assert.equal(ctx.utils.getProductById('no-existe'), null);
    assert.equal(ctx.utils.getProductById(null), null);
    ctx.dom.window.close();
  });

  it('filters by category and treats todos as the full catalog', function () {
    var ctx = loadUtils();
    var all = ctx.utils.getProductsByCategory('todos');
    var frases = ctx.utils.getProductsByCategory('frases');
    var lotr = ctx.utils.getProductsByCategory('lotr');

    assert.equal(all.length, ctx.products.length);
    assert.ok(frases.length > 0);
    frases.forEach(function (p) {
      assert.equal(p.categorySlug, 'frases');
    });
    assert.equal(lotr.length, 0);
    ctx.dom.window.close();
  });

  it('falls back to Lo último for unknown category labels', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.getCategoryLabel('frases'), 'Frases');
    assert.equal(ctx.utils.getCategoryLabel('todos'), 'Lo último');
    assert.equal(ctx.utils.getCategoryLabel('categoria-inventada'), 'Lo último');
    ctx.dom.window.close();
  });

  it('encodes image filenames with spaces and hashes', function () {
    var ctx = loadUtils();
    assert.equal(
      ctx.utils.encodeImageSrc('soy bonito no Perfecto.png'),
      'soy%20bonito%20no%20Perfecto.png'
    );
    assert.equal(ctx.utils.encodeImageSrc('file#hash.png'), 'file%23hash.png');
    ctx.dom.window.close();
  });

  it('exposes featured products used on the home grid', function () {
    var ctx = loadUtils();
    var featured = ctx.utils.getFeaturedProducts();
    assert.ok(featured.length > 0);
    featured.forEach(function (p) {
      assert.equal(p.featured, true);
    });
    ctx.dom.window.close();
  });

  it('keeps extra gallery images optional and listed only when present', function () {
    var ctx = loadUtils();
    var crush = ctx.utils.getProductById('crush');
    var alexa = ctx.utils.getProductById('alexa');
    assert.ok(!crush.gallery || crush.gallery.length === 0);
    assert.ok(Array.isArray(alexa.gallery));
    assert.ok(alexa.gallery.length > 0);
    assert.equal(
      ctx.utils.encodeImageSrc(alexa.gallery[0]),
      'mockups/alexa-flat.png'
    );
    ctx.dom.window.close();
  });
});
