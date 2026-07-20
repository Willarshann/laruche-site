/* Hydratation du contenu éditable depuis /api/content.
   Progressif : si l'API est absente/vide, on garde le HTML par défaut (content-defaults.js). */
(function () {
  'use strict';

  var DEF = window.LARUCHE_DEFAULTS || {};

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function applyTexts(texts) {
    if (!texts) return;
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      var val = getPath(texts, el.getAttribute('data-edit'));
      if (typeof val === 'string' && val.trim() !== '') el.textContent = val;
    });
  }

  function applyImages(images) {
    if (!images) return;
    document.querySelectorAll('[data-edit-img]').forEach(function (el) {
      var val = images[el.getAttribute('data-edit-img')];
      if (typeof val === 'string' && val.trim() !== '') {
        el.setAttribute('src', val);
        el.removeAttribute('loading');
      }
    });
  }

  function productCard(p) {
    return '' +
      '<article class="produit reveal is-in">' +
        '<div class="produit__media">' + (p.image ? '<img src="' + esc(p.image) + '" alt="Bee Happy ' + esc(p.volume) + '" loading="lazy" />' : '') + '</div>' +
        '<div class="produit__badge">100 % Naturel</div>' +
        '<h3>' + esc(p.name || 'Bee Happy') + '</h3>' +
        '<p class="produit__vol">' + esc(p.volume) + '</p>' +
        '<p class="produit__desc">' + esc(p.desc) + '</p>' +
      '</article>';
  }

  function applyProducts(products) {
    if (!Array.isArray(products) || !products.length) return;
    var grid = document.getElementById('produitsGrid');
    if (grid) grid.innerHTML = products.map(productCard).join('');
  }

  function mockFigure(m, i) {
    return '' +
      '<figure class="mock reveal is-in">' +
        (m.image ? '<img src="' + esc(m.image) + '" alt="' + esc(m.title) + '" loading="lazy" />' : '') +
        '<figcaption>' + esc(m.title) + '</figcaption>' +
      '</figure>';
  }
  function applyMockups(mockups) {
    if (!Array.isArray(mockups) || !mockups.length) return;
    var grid = document.getElementById('marqueGrid');
    if (grid) grid.innerHTML = mockups.map(mockFigure).join('');
  }

  /* Construit les liens WhatsApp & e-mail à partir des coordonnées affichées */
  function wireContactLinks(texts) {
    var contact = (texts && texts.contact) || (DEF.texts && DEF.texts.contact) || {};
    var slogan = (DEF.texts && DEF.texts.brand && DEF.texts.brand.slogan) || 'LaRuche';

    var wa = document.getElementById('waLink');
    if (wa && contact.phone) {
      var digits = (contact.phone.match(/\d+/g) || []).join('');
      // premier numéro complet trouvé, préfixé 509 si absent
      var num = digits;
      if (num.indexOf('509') !== 0) num = '509' + num.slice(0, 8);
      else num = num.slice(0, 11);
      var msg = encodeURIComponent('Bonjour LaRuche ! Je vous contacte depuis votre site.');
      wa.setAttribute('href', 'https://wa.me/' + num + '?text=' + msg);
    }
    var mail = document.getElementById('mailLink');
    if (mail && contact.email) {
      var subject = encodeURIComponent('Contact depuis le site LaRuche');
      var body = encodeURIComponent('Bonjour LaRuche,\n\n');
      mail.setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=' + contact.email + '&su=' + subject + '&body=' + body);
    }
  }

  function hydrate(data) {
    applyTexts(data.texts);
    applyImages(data.images);
    applyProducts(data.products);
    applyMockups(data.mockups);
    wireContactLinks(data.texts);
  }

  /* Applique d'abord les défauts (liens contact), puis tente l'API */
  wireContactLinks(DEF.texts);

  fetch('/api/content', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data !== 'object' || !Object.keys(data).length) return;
      hydrate(data);
    })
    .catch(function () { /* silencieux : contenu par défaut conservé */ });
})();
