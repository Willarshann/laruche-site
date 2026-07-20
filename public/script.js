/* LaRuche — interactions & animations (sobres, artisanales) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header : compaction au scroll + swap logo ---- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Logo header : blanc sur le hero foncé, couleur quand compacté sur fond clair ---- */
  var logoOnDark = document.querySelector('.brand__logo--on-dark');
  var logoOnLight = document.querySelector('.brand__logo--on-light');
  function swapLogo() {
    var compact = header.classList.contains('scrolled');
    if (logoOnDark && logoOnLight) {
      logoOnDark.hidden = compact;
      logoOnLight.hidden = !compact;
    }
  }
  window.addEventListener('scroll', swapLogo, { passive: true });
  swapLogo();

  /* ---- Menu mobile ---- */
  var toggle = document.getElementById('navToggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Reveal au scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // Filet de sécurité : rien ne doit rester invisible (images comprises)
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('is-in');
      });
    }, 1400);
  }

  /* ---- Parallaxe légère du fond du hero ---- */
  var heroBg = document.querySelector('.hero__bg');
  if (heroBg && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    }, { passive: true });
  }

  /* ---- Particules de pollen dans le hero (canvas) ---- */
  var canvas = document.getElementById('particles');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var hero = document.querySelector('.hero');
    var dots = [];
    var raf;

    function size() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      var count = Math.min(46, Math.round(canvas.width / 30));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.2 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -(Math.random() * 0.35 + 0.12),
          a: Math.random() * 0.5 + 0.2
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.y < -10) { d.y = canvas.height + 10; d.x = Math.random() * canvas.width; }
        if (d.x < -10) d.x = canvas.width + 10;
        if (d.x > canvas.width + 10) d.x = -10;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 177, 80, ' + d.a + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    size();
    tick();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(size, 200);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { tick(); }
    });
  }
})();
