'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, productCtaSearch } = require('./helpers');

function loadContact(search) {
  return createDom({
    file: 'contacto.html',
    search: search,
    runInline: true
  });
}

describe('contacto.html order prefill', function () {
  it('keeps the default draft when there are no query params', function () {
    var dom = loadContact('');
    var draft = dom.window.document.getElementById('draft-text').textContent;
    assert.equal(draft, 'Hola! Quiero una remera Parkour.');
    assert.equal(dom.window.document.getElementById('wa-btn').getAttribute('href'), 'https://wa.me/');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    ['#ig-btn', '#nav-ig', '#ft-ig'].forEach(function (sel) {
      assert.equal(
        dom.window.document.querySelector(sel).getAttribute('href'),
        'https://www.instagram.com/'
      );
    });
    dom.window.close();
  });

  it('uses URLSearchParams.get without a second decode (names with %)', function () {
    var name = '100% algodón';
    var search = productCtaSearch(name, 'M');
    var dom = loadContact(search);
    var draft = dom.window.document.getElementById('draft-text').textContent;
    assert.equal(draft, 'Hola! Quiero la remera "100% algodón" talle M');
    assert.match(
      dom.window.document.querySelector('.lead').textContent,
      /100% algodón/
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle M/);
    dom.window.close();
  });

  it('still prefills existing catalog names including apostrophes', function () {
    var name = "It's not gonna lick itself";
    var search = productCtaSearch(name, 'XL');
    var dom = loadContact(search);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero la remera "It\'s not gonna lick itself" talle XL'
    );
    dom.window.close();
  });

  it('prefills a multi-line bag handoff message including % names', function () {
    var msg = [
      'Hola! Quiero pedir:',
      '- 100% algodón (talle M)',
      '- Alexa... (talle XL)',
      '',
      '¿Cómo seguimos?'
    ].join('\n');
    var search = '?msg=' + encodeURIComponent(msg);
    var dom = loadContact(search);
    assert.equal(dom.window.document.getElementById('draft-text').textContent, msg);
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('does not rewrite the lead unless both product and size are present', function () {
    var productOnly = loadContact('?product=' + encodeURIComponent('Alexa...'));
    assert.match(productOnly.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    assert.equal(
      productOnly.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    productOnly.window.close();

    var sizeOnly = loadContact('?size=XL');
    assert.match(sizeOnly.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    assert.equal(
      sizeOnly.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    sizeOnly.window.close();
  });

  it('would throw if the old double-decode ran on a percent in the product name', function () {
    var params = new URLSearchParams(productCtaSearch('50% off', 'S'));
    var msg = params.get('msg');
    assert.equal(msg, 'Hola! Quiero la remera "50% off" talle S');
    assert.throws(function () {
      decodeURIComponent(msg);
    }, URIError);
  });

  it('treats an empty msg query as the default draft', function () {
    var dom = loadContact('?msg=');
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('does not attach ?text= to the placeholder WhatsApp link even when a draft is present', function () {
    var search = productCtaSearch('Alexa...', 'L');
    var dom = loadContact(search);
    var wa = dom.window.document.getElementById('wa-btn');
    assert.equal(wa.getAttribute('href'), 'https://wa.me/');
    assert.equal(wa.getAttribute('href').indexOf('?text='), -1);
    dom.window.close();
  });

  it('rewrites the lead from product+size without replacing a custom msg draft', function () {
    var search = '?msg=' + encodeURIComponent('Ya armé el pedido') +
      '&product=' + encodeURIComponent('Alexa...') +
      '&size=L';
    var dom = loadContact(search);
    assert.equal(dom.window.document.getElementById('draft-text').textContent, 'Ya armé el pedido');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Alexa\.\.\./);
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle L/);
    dom.window.close();
  });

  it('does not rewrite the lead when product is empty even if size is present', function () {
    var dom = loadContact('?product=&size=M');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    dom.window.close();
  });

  it('does not rewrite the lead when size is empty even if product is present', function () {
    var dom = loadContact('?product=' + encodeURIComponent('Alexa...') + '&size=');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    dom.window.close();
  });

  it('uses the default draft when msg is empty but still rewrites the lead from product and size', function () {
    var dom = loadContact('?msg=&product=' + encodeURIComponent('Alexa...') + '&size=S');
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /Alexa\.\.\./);
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle S/);
    dom.window.close();
  });

  it('rewrites the lead from product+size alone and keeps the default draft', function () {
    var dom = loadContact('?product=' + encodeURIComponent('Alexa...') + '&size=L');
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /Alexa\.\.\./);
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle L/);
    dom.window.close();
  });

  it('uses the first msg when the query string repeats the param', function () {
    var dom = loadContact(
      '?msg=' + encodeURIComponent('Primero') + '&msg=' + encodeURIComponent('Segundo')
    );
    assert.equal(dom.window.document.getElementById('draft-text').textContent, 'Primero');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('prefills a product name that contains an ampersand without splitting the query', function () {
    var name = 'Parkour & Co';
    var search = productCtaSearch(name, 'M');
    var dom = loadContact(search);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero la remera "Parkour & Co" talle M'
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /Parkour & Co/);
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle M/);
    dom.window.close();
  });

  it('keeps the WhatsApp button opening in a new tab after the href is rewritten', function () {
    var dom = loadContact(productCtaSearch('Alexa...', 'M'));
    var wa = dom.window.document.getElementById('wa-btn');
    assert.equal(wa.getAttribute('href'), 'https://wa.me/');
    assert.equal(wa.getAttribute('target'), '_blank');
    assert.equal(wa.getAttribute('rel'), 'noopener noreferrer');
    dom.window.close();
  });

  it('uses the first product and size when those params are repeated', function () {
    var dom = loadContact(
      '?product=' + encodeURIComponent('Alexa...') +
      '&product=' + encodeURIComponent('Crush') +
      '&size=M&size=XL'
    );
    var lead = dom.window.document.querySelector('.lead').textContent;
    assert.match(lead, /Alexa\.\.\./);
    assert.match(lead, /talle M/);
    assert.equal(lead.indexOf('Crush'), -1);
    assert.equal(lead.indexOf('XL'), -1);
    dom.window.close();
  });

  it('ignores uppercase MSG/PRODUCT/SIZE keys and keeps the default copy', function () {
    var dom = loadContact(
      '?MSG=' + encodeURIComponent('Pedido especial') +
      '&PRODUCT=' + encodeURIComponent('Alexa...') +
      '&SIZE=L'
    );
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('treats plus signs in msg as spaces the same way URLSearchParams does', function () {
    var dom = loadContact('?msg=Hola+Parkour');
    assert.equal(dom.window.document.getElementById('draft-text').textContent, 'Hola Parkour');
    dom.window.close();
  });

  it('does not treat a hash fragment after msg as part of the draft', function () {
    var dom = loadContact('?msg=' + encodeURIComponent('Hola Parkour') + '#wa');
    assert.equal(dom.window.document.getElementById('draft-text').textContent, 'Hola Parkour');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('does not throw when msg is a bare or malformed percent sequence', function () {
    ['?msg=%', '?msg=%ZZ'].forEach(function (search) {
      var dom = loadContact(search);
      assert.doesNotThrow(function () {
        dom.window.document.getElementById('draft-text').textContent;
      });
      var draft = dom.window.document.getElementById('draft-text').textContent;
      assert.ok(draft.length > 0, search);
      assert.equal(draft.indexOf('Hola! Quiero una remera Parkour.'), -1, search);
      assert.equal(dom.window.document.getElementById('wa-btn').getAttribute('href'), 'https://wa.me/');
      dom.window.close();
    });
  });

  it('rewrites the lead with the product name as text, including curly quotes', function () {
    var dom = loadContact(productCtaSearch('Alexa...', 'M'));
    var lead = dom.window.document.querySelector('.lead').textContent;
    assert.match(lead, /Vas por “Alexa\.\.\.” talle M/);
    assert.equal(dom.window.document.querySelector('.lead').innerHTML.indexOf('&lt;'), -1);
    dom.window.close();
  });

  it('keeps Instagram hrefs on the CTA buttons when a draft and lead are both present', function () {
    var search = productCtaSearch("It's not gonna lick itself", 'XL');
    var dom = loadContact(search);
    ['#ig-btn', '#nav-ig', '#ft-ig'].forEach(function (sel) {
      assert.equal(
        dom.window.document.querySelector(sel).getAttribute('href'),
        'https://www.instagram.com/'
      );
    });
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle XL/);
    dom.window.close();
  });

  it('keeps HTML in msg as text so a crafted query cannot inject markup', function () {
    var payload = '<img src="x" onerror="alert(1)"><b>hack</b>';
    var dom = loadContact('?msg=' + encodeURIComponent(payload));
    var draft = dom.window.document.getElementById('draft-text');
    assert.equal(draft.textContent, payload);
    assert.equal(draft.children.length, 0);
    assert.equal(dom.window.document.querySelectorAll('img[src="x"]').length, 0);
    assert.equal(dom.window.document.querySelectorAll('#draft-text b').length, 0);
    dom.window.close();
  });

  it('keeps HTML in the product lead as text rather than markup', function () {
    var name = '<img src="x">Alexa';
    var dom = loadContact(productCtaSearch(name, 'M'));
    var lead = dom.window.document.querySelector('.lead');
    assert.match(lead.textContent, /Alexa/);
    assert.match(lead.textContent, /Vas por/);
    assert.equal(lead.querySelectorAll('img').length, 0);
    assert.equal(dom.window.document.querySelectorAll('main img[src="x"]').length, 0);
    dom.window.close();
  });
});
