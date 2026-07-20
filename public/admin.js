/* Administration LaRuche — édition des textes et images, stockage KV via /api/content. */
(function () {
  'use strict';

  var DEF = window.LARUCHE_DEFAULTS || { texts: {}, images: {}, products: [], mockups: [] };
  var content = null; // état courant, chargé au login

  // ---- Schéma des textes (groupés par carte) ----
  var TEXT_SCHEMA = [
    { title: 'Marque & slogan', hint: 'Nom et signature de la marque.', fields: [
      { path: 'brand.name', label: 'Nom' },
      { path: 'brand.slogan', label: 'Slogan' }
    ]},
    { title: 'Accueil', hint: 'Le grand bloc en haut du site.', fields: [
      { path: 'hero.eyebrow', label: 'Sur-titre' },
      { path: 'hero.title', label: 'Titre principal' },
      { path: 'hero.sub', label: 'Sous-titre', big: true },
      { path: 'hero.cta', label: 'Bouton principal' },
      { path: 'hero.cta2', label: 'Bouton secondaire' }
    ]},
    { title: 'Notre histoire', hint: 'Présentation de l’entreprise et vision.', fields: [
      { path: 'histoire.eyebrow', label: 'Sur-titre' },
      { path: 'histoire.title', label: 'Titre' },
      { path: 'histoire.intro', label: 'Texte de présentation', big: true },
      { path: 'histoire.visionLabel', label: 'Étiquette « vision »' },
      { path: 'histoire.vision', label: 'Notre vision', big: true }
    ]},
    { title: 'Nos missions', hint: 'Les trois engagements.', fields: [
      { path: 'missions.eyebrow', label: 'Sur-titre' },
      { path: 'missions.title', label: 'Titre' },
      { path: 'missions.m1', label: 'Mission 1', big: true },
      { path: 'missions.m2', label: 'Mission 2', big: true },
      { path: 'missions.m3', label: 'Mission 3', big: true }
    ]},
    { title: 'Nos valeurs', hint: 'Authenticité, Bien-être, Croissance.', fields: [
      { path: 'valeurs.eyebrow', label: 'Sur-titre' },
      { path: 'valeurs.title', label: 'Titre' },
      { path: 'valeurs.v1Title', label: 'Valeur 1 — titre' },
      { path: 'valeurs.v1Desc', label: 'Valeur 1 — description', big: true },
      { path: 'valeurs.v2Title', label: 'Valeur 2 — titre' },
      { path: 'valeurs.v2Desc', label: 'Valeur 2 — description', big: true },
      { path: 'valeurs.v3Title', label: 'Valeur 3 — titre' },
      { path: 'valeurs.v3Desc', label: 'Valeur 3 — description', big: true }
    ]},
    { title: 'Nos produits — textes', hint: 'Le titre de la section produits (les pots se gèrent plus bas).', fields: [
      { path: 'produits.eyebrow', label: 'Sur-titre' },
      { path: 'produits.title', label: 'Titre' },
      { path: 'produits.sub', label: 'Sous-titre', big: true }
    ]},
    { title: 'La marque en situation — textes', hint: 'Le titre de la galerie (les visuels se gèrent plus bas).', fields: [
      { path: 'marque.eyebrow', label: 'Sur-titre' },
      { path: 'marque.title', label: 'Titre' },
      { path: 'marque.sub', label: 'Sous-titre', big: true }
    ]},
    { title: 'Contact', hint: 'Coordonnées affichées. Le lien WhatsApp utilise le 1er numéro.', fields: [
      { path: 'contact.eyebrow', label: 'Sur-titre' },
      { path: 'contact.title', label: 'Titre' },
      { path: 'contact.sub', label: 'Sous-titre', big: true },
      { path: 'contact.address', label: 'Adresse' },
      { path: 'contact.addressNote', label: 'Complément d’adresse' },
      { path: 'contact.phone', label: 'Téléphone(s)' },
      { path: 'contact.email', label: 'E-mail' },
      { path: 'contact.site', label: 'Site web' }
    ]},
    { title: 'Pied de page', hint: '', fields: [
      { path: 'footer.tagline', label: 'Signature' },
      { path: 'footer.rights', label: 'Mentions' }
    ]}
  ];

  var IMAGE_SCHEMA = [
    { key: 'heroLogo', label: 'Logo de l’accueil', hint: 'Affiché en grand sur le fond foncé.' },
    { key: 'heroBg', label: 'Motif de fond (accueil)', hint: 'Texture discrète derrière le titre.' },
    { key: 'histoire', label: 'Image « Notre histoire »', hint: 'Visuel encadré à côté du texte.' }
  ];

  // ---------- helpers ----------
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function setPath(obj, path, val) {
    var ks = path.split('.'), o = obj;
    for (var i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
    o[ks[ks.length - 1]] = val;
  }
  function deepMerge(base, over) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!over || typeof over !== 'object') return out;
    if (Array.isArray(over)) return over.slice();
    Object.keys(over).forEach(function (k) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], over[k]);
      } else { out[k] = over[k]; }
    });
    return out;
  }

  // ---------- upload ----------
  function uploadFile(file, statusEl, done) {
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { statusEl.textContent = 'Image trop lourde (max 6 Mo).'; statusEl.style.color = 'var(--err)'; return; }
    statusEl.textContent = 'Envoi en cours…'; statusEl.style.color = 'var(--honey)';
    var fd = new FormData(); fd.append('file', file);
    fetch('/api/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok && res.j.url) { statusEl.textContent = 'Image mise à jour ✓'; statusEl.style.color = 'var(--ok)'; done(res.j.url); }
        else if (res.j && res.j.error && /autoris/i.test(res.j.error)) { statusEl.textContent = 'Session expirée — reconnectez-vous.'; statusEl.style.color = 'var(--err)'; setTimeout(showLogin, 1200); }
        else { statusEl.textContent = (res.j && res.j.error) || 'Échec de l’envoi.'; statusEl.style.color = 'var(--err)'; }
      })
      .catch(function () { statusEl.textContent = 'Erreur réseau.'; statusEl.style.color = 'var(--err)'; });
  }

  // Composant champ image ; onChange(url) met à jour le state
  function imageField(currentUrl, onChange) {
    var wrap = el('div', { class: 'imgfield' });
    var prev = el('div', { class: 'imgfield__preview' });
    var img = el('img'); if (currentUrl) img.src = currentUrl; prev.appendChild(img);
    var body = el('div', { class: 'imgfield__body' });
    var input = el('input', { type: 'file', accept: 'image/*' });
    var label = el('label', { class: 'btn btn--ghost upbtn', style: 'cursor:pointer;display:inline-flex' }, 'Choisir une image');
    input.style.display = 'none'; label.appendChild(input);
    var status = el('div', { class: 'uploading' });
    input.addEventListener('change', function () {
      uploadFile(input.files[0], status, function (url) { img.src = url; onChange(url); });
    });
    body.appendChild(label); body.appendChild(status);
    wrap.appendChild(prev); wrap.appendChild(body);
    return wrap;
  }

  // ---------- rendu des formulaires ----------
  function textField(f) {
    var field = el('div', { class: 'field' + (f.big ? ' full' : '') });
    field.appendChild(el('label', {}, f.label));
    var val = getPath(content.texts, f.path);
    if (val == null) val = '';
    var input;
    if (f.big) { input = el('textarea', { rows: '3' }); input.value = val; }
    else { input = el('input', { type: 'text' }); input.value = val; }
    input.addEventListener('input', function () { setPath(content.texts, f.path, input.value); markDirty(); });
    field.appendChild(input);
    return field;
  }

  function renderTextCard(group) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, group.title));
    if (group.hint) card.appendChild(el('p', { class: 'card__hint' }, group.hint));
    var grid = el('div', { class: 'grid2' });
    group.fields.forEach(function (f) { grid.appendChild(textField(f)); });
    card.appendChild(grid);
    return card;
  }

  function renderImagesCard() {
    var card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Images générales'));
    card.appendChild(el('p', { class: 'card__hint' }, 'JPG, PNG ou WebP, jusqu’à 6 Mo.'));
    IMAGE_SCHEMA.forEach(function (im) {
      var field = el('div', { class: 'field full' });
      field.appendChild(el('label', {}, im.label + (im.hint ? ' <small>— ' + im.hint + '</small>' : '')));
      field.appendChild(imageField(content.images[im.key], function (url) { content.images[im.key] = url; markDirty(); }));
      card.appendChild(field);
    });
    return card;
  }

  function renderProductsCard() {
    var card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Produits (pots Bee Happy)'));
    card.appendChild(el('p', { class: 'card__hint' }, 'Ajoutez, modifiez ou supprimez un format. L’image remplace le visuel du pot.'));
    var list = el('div');
    card.appendChild(list);
    function draw() {
      list.innerHTML = '';
      content.products.forEach(function (p, i) {
        var item = el('div', { class: 'item' });
        var head = el('div', { class: 'item__head' });
        head.appendChild(el('h3', {}, 'Produit ' + (i + 1)));
        var del = el('button', { class: 'del', type: 'button' }, 'Supprimer');
        del.addEventListener('click', function () { content.products.splice(i, 1); draw(); markDirty(); });
        head.appendChild(del); item.appendChild(head);
        var grid = el('div', { class: 'grid2' });
        [['name', 'Nom', false], ['volume', 'Format (ex. 350 ml)', false], ['desc', 'Description', true]].forEach(function (spec) {
          var field = el('div', { class: 'field' + (spec[2] ? ' full' : '') });
          field.appendChild(el('label', {}, spec[1]));
          var input = spec[2] ? el('textarea', { rows: '2' }) : el('input', { type: 'text' });
          input.value = p[spec[0]] || '';
          input.addEventListener('input', function () { p[spec[0]] = input.value; markDirty(); });
          field.appendChild(input); grid.appendChild(field);
        });
        var imgWrap = el('div', { class: 'field full' });
        imgWrap.appendChild(el('label', {}, 'Image du pot'));
        imgWrap.appendChild(imageField(p.image, function (url) { p.image = url; markDirty(); }));
        grid.appendChild(imgWrap);
        item.appendChild(grid); list.appendChild(item);
      });
    }
    draw();
    var add = el('button', { class: 'btn btn--ghost addbtn', type: 'button' }, '+ Ajouter un produit');
    add.addEventListener('click', function () { content.products.push({ name: 'Bee Happy', volume: '', image: '', desc: '' }); draw(); markDirty(); });
    card.appendChild(add);
    return card;
  }

  function renderMockupsCard() {
    var card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'La marque en situation (visuels)'));
    card.appendChild(el('p', { class: 'card__hint' }, 'Carte de visite, casquette, t-shirt… Titre + image de chaque mockup.'));
    var list = el('div'); card.appendChild(list);
    function draw() {
      list.innerHTML = '';
      content.mockups.forEach(function (m, i) {
        var item = el('div', { class: 'item' });
        var head = el('div', { class: 'item__head' });
        head.appendChild(el('h3', {}, 'Visuel ' + (i + 1)));
        var del = el('button', { class: 'del', type: 'button' }, 'Supprimer');
        del.addEventListener('click', function () { content.mockups.splice(i, 1); draw(); markDirty(); });
        head.appendChild(del); item.appendChild(head);
        var grid = el('div', { class: 'grid2' });
        var field = el('div', { class: 'field' });
        field.appendChild(el('label', {}, 'Titre'));
        var input = el('input', { type: 'text' }); input.value = m.title || '';
        input.addEventListener('input', function () { m.title = input.value; markDirty(); });
        field.appendChild(input); grid.appendChild(field);
        var imgWrap = el('div', { class: 'field' });
        imgWrap.appendChild(el('label', {}, 'Image'));
        imgWrap.appendChild(imageField(m.image, function (url) { m.image = url; markDirty(); }));
        grid.appendChild(imgWrap);
        item.appendChild(grid); list.appendChild(item);
      });
    }
    draw();
    var add = el('button', { class: 'btn btn--ghost addbtn', type: 'button' }, '+ Ajouter un visuel');
    add.addEventListener('click', function () { content.mockups.push({ title: '', image: '' }); draw(); markDirty(); });
    card.appendChild(add);
    return card;
  }

  function renderForms() {
    var root = document.getElementById('forms');
    root.innerHTML = '';
    TEXT_SCHEMA.forEach(function (g) { root.appendChild(renderTextCard(g)); });
    root.appendChild(renderImagesCard());
    root.appendChild(renderProductsCard());
    root.appendChild(renderMockupsCard());
  }

  // ---------- état "modifié" ----------
  var dirty = false;
  function markDirty() {
    dirty = true;
    var s = document.getElementById('saveStatus');
    s.textContent = 'Modifications non enregistrées';
    s.className = 'status';
  }

  // ---------- save ----------
  function save() {
    var s = document.getElementById('saveStatus');
    s.textContent = 'Enregistrement…'; s.className = 'status';
    fetch('/api/content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok) { dirty = false; s.textContent = 'Enregistré ✓'; s.className = 'status ok'; }
        else if (res.j && res.j.error && /autoris/i.test(res.j.error)) { s.textContent = 'Session expirée — reconnectez-vous.'; s.className = 'status err'; setTimeout(showLogin, 1200); }
        else { s.textContent = (res.j && res.j.error) || 'Échec de l’enregistrement.'; s.className = 'status err'; }
      })
      .catch(function () { s.textContent = 'Erreur réseau.'; s.className = 'status err'; });
  }

  // ---------- vues ----------
  function showLogin() {
    document.getElementById('appView').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
  }
  function showApp() {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('appView').classList.remove('hidden');
  }

  function loadContentThenApp() {
    fetch('/api/content', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (data) {
        var base = { texts: DEF.texts, images: DEF.images, products: DEF.products, mockups: DEF.mockups };
        content = {
          texts: deepMerge(DEF.texts, (data && data.texts) || {}),
          images: deepMerge(DEF.images, (data && data.images) || {}),
          products: (data && Array.isArray(data.products) && data.products.length) ? data.products : DEF.products.slice(),
          mockups: (data && Array.isArray(data.mockups) && data.mockups.length) ? data.mockups : DEF.mockups.slice()
        };
        // clones pour ne pas muter les défauts
        content.products = content.products.map(function (p) { return Object.assign({}, p); });
        content.mockups = content.mockups.map(function (m) { return Object.assign({}, m); });
        renderForms();
        showApp();
      })
      .catch(function () {
        // repli : ne pas rester bloqué si le serveur ne répond pas — afficher l'app avec les défauts
        content = {
          texts: deepMerge(DEF.texts, {}),
          images: deepMerge(DEF.images, {}),
          products: DEF.products.map(function (p) { return Object.assign({}, p); }),
          mockups: DEF.mockups.map(function (m) { return Object.assign({}, m); })
        };
        renderForms();
        showApp();
        var s = document.getElementById('saveStatus');
        if (s) { s.textContent = 'Serveur injoignable — contenu par défaut affiché.'; s.className = 'status err'; }
      });
  }

  // ---------- init ----------
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('loginMsg');
    msg.textContent = 'Connexion…'; msg.className = 'msg';
    fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: document.getElementById('password').value })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok) { msg.textContent = ''; loadContentThenApp(); }
        else { msg.textContent = (res.j && res.j.error) || 'Échec.'; msg.className = 'msg err'; }
      })
      .catch(function () { msg.textContent = 'Erreur réseau.'; msg.className = 'msg err'; });
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    fetch('/api/logout', { method: 'POST' }).then(function () { location.reload(); });
  });
  document.getElementById('saveBtn').addEventListener('click', save);
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // Session déjà ouverte ?
  fetch('/api/session', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (s) { if (s && s.authed) loadContentThenApp(); else showLogin(); })
    .catch(showLogin);
})();
