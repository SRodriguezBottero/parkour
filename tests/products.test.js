'use strict';

const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, ROOT } = require('./helpers');

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
    assert.equal(ctx.utils.getProductById(undefined), null);
    assert.equal(ctx.utils.getProductById(''), null);
    ctx.dom.window.close();
  });

  it('filters by category and treats todos as the full catalog', function () {
    var ctx = loadUtils();
    var all = ctx.utils.getProductsByCategory('todos');
    var frases = ctx.utils.getProductsByCategory('frases');
    var literatura = ctx.utils.getProductsByCategory('literatura');

    assert.equal(all.length, ctx.products.length);
    assert.ok(frases.length > 0);
    frases.forEach(function (p) {
      assert.equal(p.categorySlug, 'frases');
    });
    assert.equal(literatura.length, 0);
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
    assert.equal(ctx.utils.encodeImageSrc('alexa.png'), 'alexa.png');
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

  it('excludes products that are not marked featured from the home strip', function () {
    var ctx = loadUtils();
    var first = ctx.products[0];
    var original = first.featured;
    first.featured = false;
    var featured = ctx.utils.getFeaturedProducts();
    assert.equal(featured.some(function (p) { return p.id === first.id; }), false);
    assert.ok(featured.length < ctx.products.length);
    featured.forEach(function (p) {
      assert.equal(p.featured, true);
    });
    first.featured = original;
    ctx.dom.window.close();
  });

  it('does not attach gallery or mockup fields after the single-image ficha', function () {
    var ctx = loadUtils();
    ctx.products.forEach(function (product) {
      assert.equal(product.gallery, undefined);
      assert.equal(String(product.image).indexOf('mockups/'), -1);
    });
    ctx.dom.window.close();
  });

  it('keeps product ids unique and category slugs in the known map', function () {
    var ctx = loadUtils();
    var ids = {};
    ctx.products.forEach(function (product) {
      assert.equal(ids[product.id], undefined, product.id + ' is duplicated');
      ids[product.id] = true;
      assert.ok(ctx.dom.window.PARKOUR_CATEGORIES[product.categorySlug], product.id + ' has unknown category');
    });
    assert.equal(ctx.utils.getProductsByCategory('categoria-inventada').length, 0);
    ctx.dom.window.close();
  });

  it('looks up product ids case-sensitively', function () {
    var ctx = loadUtils();
    assert.ok(ctx.utils.getProductById('crush'));
    assert.equal(ctx.utils.getProductById('Crush'), null);
    assert.equal(ctx.utils.getProductById('CRUSH'), null);
    ctx.dom.window.close();
  });

  it('indexes every catalog product on PARKOUR_PRODUCTS_BY_ID', function () {
    var ctx = loadUtils();
    var byId = ctx.dom.window.PARKOUR_PRODUCTS_BY_ID;
    assert.equal(Object.keys(byId).length, ctx.products.length);
    ctx.products.forEach(function (product) {
      assert.equal(byId[product.id], product);
    });
    ctx.dom.window.close();
  });

  it('returns an empty list for a missing category slug instead of the full catalog', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.getProductsByCategory(undefined).length, 0);
    assert.equal(ctx.utils.getProductsByCategory(null).length, 0);
    assert.notEqual(ctx.utils.getProductsByCategory(undefined).length, ctx.products.length);
    ctx.dom.window.close();
  });

  it('points every product image at a file that exists in the repo', function () {
    var ctx = loadUtils();
    ctx.products.forEach(function (product) {
      assert.ok(
        fs.existsSync(path.join(ROOT, product.image)),
        product.id + ' image is missing: ' + product.image
      );
    });
    ctx.dom.window.close();
  });

  it('keeps ids and interpolated catalog fields free of HTML-breaking characters', function () {
    var ctx = loadUtils();
    ctx.products.forEach(function (product) {
      assert.match(product.id, /^[a-z0-9-]+$/, product.id + ' is not a safe URL id');
      assert.equal(/[<>"]/.test(product.name), false, product.id + ' name can break catalog HTML');
      assert.equal(/[<>"]/.test(product.price), false, product.id + ' price can break catalog HTML');
      assert.equal(/[<>"]/.test(product.categorySlug), false, product.id + ' category can break catalog HTML');
    });
    ctx.dom.window.close();
  });

  it('returns an empty list for an empty category slug instead of the full catalog', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.getProductsByCategory('').length, 0);
    assert.notEqual(ctx.utils.getProductsByCategory('').length, ctx.products.length);
    ctx.dom.window.close();
  });

  it('falls back to Lo último when the category slug is empty or missing', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.getCategoryLabel(''), 'Lo último');
    assert.equal(ctx.utils.getCategoryLabel(undefined), 'Lo último');
    assert.equal(ctx.utils.getCategoryLabel(null), 'Lo último');
    ctx.dom.window.close();
  });

  it('keeps each product categoryLabel aligned with PARKOUR_CATEGORIES', function () {
    var ctx = loadUtils();
    var cats = ctx.dom.window.PARKOUR_CATEGORIES;
    ctx.products.forEach(function (product) {
      assert.equal(
        product.categoryLabel,
        cats[product.categorySlug].label,
        product.id + ' categoryLabel drifted from PARKOUR_CATEGORIES'
      );
    });
    ctx.dom.window.close();
  });

  it('keeps image filenames free of query and fragment characters that encodeURI leaves intact', function () {
    var ctx = loadUtils();
    ctx.products.forEach(function (product) {
      assert.equal(/[?#&]/.test(product.image), false, product.id + ' image can break src URLs');
    });
    ctx.dom.window.close();
  });

  it('returns featured products in catalog order', function () {
    var ctx = loadUtils();
    var featuredIds = ctx.utils.getFeaturedProducts().map(function (p) { return p.id; });
    var expectedIds = ctx.products.filter(function (p) { return p.featured; }).map(function (p) { return p.id; });
    assert.deepEqual(featuredIds, expectedIds);
    ctx.dom.window.close();
  });

  it('leaves query and ampersand characters intact so encodeURI cannot hide a bad filename', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.encodeImageSrc('file?x=1.png'), 'file?x=1.png');
    assert.equal(ctx.utils.encodeImageSrc('a&b.png'), 'a&b.png');
    ctx.dom.window.close();
  });

  it('returns a label for every slug in PARKOUR_CATEGORIES', function () {
    var ctx = loadUtils();
    var cats = ctx.dom.window.PARKOUR_CATEGORIES;
    Object.keys(cats).forEach(function (slug) {
      assert.equal(ctx.utils.getCategoryLabel(slug), cats[slug].label, slug);
    });
    ctx.dom.window.close();
  });

  it('encodes Agencia filenames that have several spaces', function () {
    var ctx = loadUtils();
    assert.equal(
      ctx.utils.encodeImageSrc('Agencia espacial uruguaya.png'),
      'Agencia%20espacial%20uruguaya.png'
    );
    ctx.dom.window.close();
  });

  it('keeps every product description and price usable on the ficha and order copy', function () {
    var ctx = loadUtils();
    ctx.products.forEach(function (product) {
      assert.ok(String(product.desc || '').trim(), product.id + ' is missing desc');
      assert.match(product.price, /^\$\d+$/, product.id + ' price is not a dollar amount');
      assert.ok(String(product.name || '').trim(), product.id + ' is missing name');
    });
    ctx.dom.window.close();
  });

  it('does not treat uppercase or differently cased slugs as known categories', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.getProductsByCategory('TODOS').length, 0);
    assert.equal(ctx.utils.getProductsByCategory('Frases').length, 0);
    assert.equal(ctx.utils.getProductsByCategory('PELIS-RANDOM').length, 0);
    assert.notEqual(ctx.utils.getProductsByCategory('TODOS').length, ctx.products.length);
    assert.equal(ctx.utils.getCategoryLabel('TODOS'), 'Lo último');
    assert.equal(ctx.utils.getCategoryLabel('Frases'), 'Lo último');
    ctx.dom.window.close();
  });

  it('encodes every hash in an image filename', function () {
    var ctx = loadUtils();
    assert.equal(ctx.utils.encodeImageSrc('a#b#c.png'), 'a%23b%23c.png');
    ctx.dom.window.close();
  });

  it('does not treat whitespace-padded ids as catalog matches', function () {
    var ctx = loadUtils();
    assert.ok(ctx.utils.getProductById('crush'));
    assert.equal(ctx.utils.getProductById(' crush'), null);
    assert.equal(ctx.utils.getProductById('crush '), null);
    assert.equal(ctx.utils.getProductById('soy bonito'), null);
    ctx.dom.window.close();
  });

  it('does not treat a percent-encoded id string as a catalog match', function () {
    var ctx = loadUtils();
    assert.ok(ctx.utils.getProductById('crush'));
    assert.equal(ctx.utils.getProductById('%63rush'), null);
    assert.equal(ctx.utils.getProductById('%2563rush'), null);
    assert.equal(ctx.utils.getProductById('crush%2F'), null);
    ctx.dom.window.close();
  });

  it('does not treat a trailing-space slug as a known category', function () {
    var ctx = loadUtils();
    assert.ok(ctx.utils.getProductsByCategory('frases').length > 0);
    assert.equal(ctx.utils.getProductsByCategory('frases ').length, 0);
    assert.equal(ctx.utils.getProductsByCategory(' frases').length, 0);
    assert.equal(ctx.utils.getCategoryLabel('frases '), 'Lo último');
    ctx.dom.window.close();
  });

  it('encodes spaces in the lick filename', function () {
    var ctx = loadUtils();
    assert.equal(
      ctx.utils.encodeImageSrc('IT_S NOT GONNA LICK ITSELF.png'),
      'IT_S%20NOT%20GONNA%20LICK%20ITSELF.png'
    );
    ctx.dom.window.close();
  });

  it('keeps PARKOUR_CATEGORIES keys aligned with each slug field', function () {
    var ctx = loadUtils();
    var cats = ctx.dom.window.PARKOUR_CATEGORIES;
    Object.keys(cats).forEach(function (slug) {
      assert.equal(cats[slug].slug, slug, slug);
    });
    ctx.dom.window.close();
  });

  it('does not look up products by display name or category slug', function () {
    var ctx = loadUtils();
    assert.ok(ctx.utils.getProductById('crush'));
    assert.equal(ctx.utils.getProductById('I have a crush on you'), null);
    assert.equal(ctx.utils.getProductById('frases'), null);
    ctx.dom.window.close();
  });
});
