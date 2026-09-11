/* VISHAL JADON — cinematic scroll engine (GSAP + ScrollTrigger, vanilla) */
(function () {
  'use strict';

  if (document.documentElement.classList.contains('reduced')) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  document.documentElement.classList.add('gs');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- build the 3D play button extrusion ---------- */
  var pb = document.getElementById('pb');
  var front = pb.querySelector('.pb-front');
  var LAYERS = window.innerWidth < 821 ? 11 : 17;
  for (var i = LAYERS; i >= 1; i--) {
    var l = document.createElement('div');
    l.className = 'pb-layer';
    var t = i / LAYERS;
    var r = Math.round(164 - 132 * t), g = 0, b = Math.round(16 - 11 * t);
    l.style.transform = 'translateZ(' + (-i * 4.5) + 'px)';
    l.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
    pb.insertBefore(l, front);
  }
  var tri = document.getElementById('pbTri');
  var triFront = tri.querySelector('.tri-front');
  for (var j = 4; j >= 1; j--) {
    var tl2 = document.createElement('div');
    tl2.className = 'tri-layer';
    var sh = Math.round(232 - 90 * (j / 4));
    tl2.style.transform = 'translateZ(' + (j * 3) + 'px)';
    tl2.style.background = 'rgb(' + sh + ',' + sh + ',' + sh + ')';
    tri.insertBefore(tl2, triFront);
  }

  /* ---------- chrome: menu, cursor, progress, nav state ---------- */
  var burger = document.querySelector('.nav-burger');
  var overlay = document.querySelector('.menu-overlay');
  function closeMenu() {
    burger.classList.remove('open');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
  }
  burger.addEventListener('click', function () {
    var open = !overlay.classList.contains('open');
    burger.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('aria-hidden', String(!open));
  });
  overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  if (window.matchMedia('(pointer: fine)').matches) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      rx(e.clientX); ry(e.clientY);
    });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('big'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('big'); });
    });
  }

  gsap.to('.progress span', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
  });

  [['#work', 'work'], ['#proof', 'proof'], ['#gallery', 'proof'], ['#contact', 'contact']].forEach(function (pair) {
    ScrollTrigger.create({
      trigger: pair[0], start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) {
        document.querySelectorAll('[data-nav="' + pair[1] + '"]').forEach(function (a) {
          a.classList.toggle('active', self.isActive);
        });
      }
    });
  });

  /* ---------- graph chip dash setup ---------- */
  var gp = document.querySelector('.chip-graph path');
  var gl = gp.getTotalLength();
  gsap.set(gp, { strokeDasharray: gl, strokeDashoffset: gl });

  /* ---------- responsive scroll choreography ---------- */
  var mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 821px)', mob: '(max-width: 820px)' }, function (ctx) {
    var D = ctx.conditions.desk;
    var v = function (n) { return (D ? n : n * 0.55) + 'vw'; };
    var vh = function (n) { return (D ? n : n * 0.62) + 'vh'; };

    /* ============ SCENE 1 — WORLD (opening + hero, one continuous move) ============ */
    gsap.set('.pb-wrap', { x: v(9), z: 540, scale: D ? 2.45 : 1.85, rotationX: 16, rotationY: -26 });
    gsap.set('.screen-frame', { scale: 1.18, autoAlpha: 0.55 });
    gsap.set('.pb-shadow', { scale: 1.5, autoAlpha: 0.5 });
    gsap.set('.hero-vishal', { yPercent: 112, clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set('.pb-lip', { scaleX: 0, rotation: -6, transformOrigin: 'left center' });
    gsap.set('.hero-tag, .hero-sub', { autoAlpha: 0, y: 22 });
    gsap.set('.hero-title .line > span', { yPercent: 115 });
    gsap.set('.chip-graph', { autoAlpha: 0, x: 60, y: -40, rotation: 8 });
    gsap.set('.chip-subs', { autoAlpha: 0, x: -70, y: -30, rotation: -8 });
    gsap.set('.chip-ret', { autoAlpha: 0, x: -50, y: 50, rotation: 6 });
    gsap.set('.chip-strat', { autoAlpha: 0, x: 60 });
    gsap.set('.chip-plays', { autoAlpha: 0, y: -60, rotation: -10 });

    var world = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#hero', start: 'top top',
        end: D ? '+=430%' : '+=360%',
        scrub: 1, pin: true, anticipatePin: 1
      }
    });
    world
      // phase 1 — the play button bursts out of the screen, then settles
      .to('.pb-wrap', { x: 0, z: 0, scale: 1, rotationX: 6, rotationY: -12, duration: 0.18, ease: 'power2.inOut' }, 0)
      .to('.screen-frame', { scale: 1.02, autoAlpha: 0.16, duration: 0.18 }, 0)
      .to('.pb-shadow', { scale: 1, autoAlpha: 0.85, duration: 0.18 }, 0)
      .to('.open-word', { scale: 1.06, autoAlpha: 0.5, duration: 0.2 }, 0)
      .to('.open-hint', { autoAlpha: 0, y: -18, duration: 0.06 }, 0.08)
      // phase 2 — camera pushes in; the button becomes the platform stage
      .to('.pb-wrap', { x: v(-23), y: D ? vh(5) : '15vh', z: -280, scale: 0.85, rotationX: 9, rotationY: -21, duration: 0.2, ease: 'power2.inOut' }, 0.18)
      .to('.pb-shadow', { x: v(-23), scale: 0.75, duration: 0.2 }, 0.18)
      .to('.open-word', { x: v(14), duration: 0.25 }, 0.18)
      // phase 3 — Vishal rises into the composition, button edge occludes him
      .to('.hero-vishal', { yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.22, ease: 'power3.out' }, 0.22)
      .to('.pb-lip', { scaleX: 1, duration: 0.14, ease: 'power3.out' }, 0.32)
      // phase 4 — editorial type + growth fragments
      .to('.hero-tag', { autoAlpha: 1, y: 0, duration: 0.08 }, 0.38)
      .to('.hero-title .line > span', { yPercent: 0, duration: 0.14, stagger: 0.05, ease: 'power3.out' }, 0.42)
      .to('.hero-sub', { autoAlpha: 1, y: 0, duration: 0.1 }, 0.52)
      .to('.chip-graph', { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.12, ease: 'back.out(1.5)' }, 0.5)
      .to('.chip-subs', { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.12, ease: 'back.out(1.5)' }, 0.54)
      .to('.chip-ret', { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.12, ease: 'back.out(1.5)' }, 0.58)
      .to('.chip-strat', { autoAlpha: 1, x: 0, duration: 0.12 }, 0.6)
      .to('.chip-plays', { autoAlpha: 1, y: 0, rotation: 0, duration: 0.12, ease: 'back.out(1.5)' }, 0.62)
      .to(gp, { strokeDashoffset: 0, duration: 0.16, ease: 'power2.out' }, 0.54)
      // phase 5 — drift, then the paper wipe hands off to WORK
      .to('.pb-wrap', { x: v(-25), rotationY: -27, duration: 0.15 }, 0.68)
      .to('.chip', { y: '-=16', duration: 0.15, stagger: 0.02 }, 0.68)
      .to('.hero-copy', { x: v(-3), duration: 0.16 }, 0.84)
      .to('.open-word', { autoAlpha: 0, duration: 0.1 }, 0.8)
      .to('.wipe', { xPercent: 118, duration: 0.16, ease: 'power3.inOut' }, 0.84);

    // idle float + mouse parallax (independent of scrub)
    gsap.to('.pb-float', { y: -16, rotationZ: 1.2, duration: 3.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    if (window.matchMedia('(pointer: fine)').matches && D) {
      var pbx = gsap.quickTo('.pb-float', 'rotationY', { duration: 0.9, ease: 'power2.out' });
      var pby = gsap.quickTo('.pb-float', 'rotationX', { duration: 0.9, ease: 'power2.out' });
      document.getElementById('hero').addEventListener('mousemove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        pbx(nx * 5); pby(-ny * 4);
      });
    }

    /* ============ SCENE 2 — WORKED WITH (3D channel ecosystem) ============ */
    gsap.set('.work-head .line > span', { yPercent: 115 });
    gsap.set('.work-head .sec-tag, .work-head .sec-sub', { autoAlpha: 0, y: 20 });
    gsap.set('.m1 .monolith', { x: v(-72), z: -850, rotationY: 52, autoAlpha: 0 });
    gsap.set('.m2 .monolith', { x: v(64), y: vh(46), z: -650, rotationY: -46, rotationZ: 6, autoAlpha: 0 });
    gsap.set('.m3 .monolith', { x: v(-8), y: vh(82), z: -500, rotationX: -58, autoAlpha: 0 });
    gsap.set('.m4 .monolith', { z: -1700, scale: 0.5, autoAlpha: 0 });
    gsap.set('.work-index li', { autoAlpha: 0, y: 26 });

    var work = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#work', start: 'top top',
        end: D ? '+=540%' : '+=430%',
        scrub: 1, pin: true, anticipatePin: 1
      }
    });
    work
      .to('.work-head .line > span', { yPercent: 0, duration: 0.07, stagger: 0.04, ease: 'power3.out' }, 0)
      .to('.work-head .sec-tag, .work-head .sec-sub', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.02)
      // M1 — enters from the left, rotates to camera, recedes into depth
      .to('.m1 .monolith', { x: 0, z: 0, rotationY: 0, autoAlpha: 1, duration: 0.18, ease: 'power2.out' }, 0.04)
      .to('.m1 .monolith', { x: v(16), z: -1300, rotationY: -32, autoAlpha: 0, duration: 0.13, ease: 'power2.in' }, 0.28)
      // M2 — sweeps in low from the right, crosses as M1 leaves
      .to('.m2 .monolith', { x: 0, y: 0, z: 0, rotationY: 0, rotationZ: 0, autoAlpha: 1, duration: 0.18, ease: 'power2.out' }, 0.22)
      .to('.m2 .monolith', { x: v(-18), y: vh(-32), z: -1150, rotationY: 26, autoAlpha: 0, duration: 0.13, ease: 'power2.in' }, 0.44)
      // M3 — rises from below with a forward roll
      .to('.m3 .monolith', { x: 0, y: 0, z: 0, rotationX: 0, autoAlpha: 1, duration: 0.18, ease: 'power2.out' }, 0.38)
      .to('.m3 .monolith', { x: v(70), z: -650, rotationY: -56, autoAlpha: 0, duration: 0.12, ease: 'power2.in' }, 0.58)
      // M4 — travels from deep space to the foreground
      .to('.m4 .monolith', { z: 70, scale: 1, autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0.54)
      .to('.m4 .monolith', { y: vh(-58), z: -900, rotationX: 40, autoAlpha: 0, duration: 0.13, ease: 'power2.in' }, 0.78)
      // ambient drift
      .to('.b1', { x: v(30), y: vh(20), rotation: 90, duration: 0.9 }, 0)
      .to('.b2', { x: v(-24), y: vh(30), duration: 0.9 }, 0)
      .to('.b3', { x: v(-36), y: vh(-18), duration: 0.9 }, 0)
      .to('.b4', { x: v(20), y: vh(-26), rotation: 180, duration: 0.9 }, 0)
      .to('.b5', { x: v(18), y: vh(34), duration: 0.9 }, 0)
      .to('.b6', { x: v(34), y: vh(-14), duration: 0.9 }, 0)
      // final resting index — all four channels, clickable
      .to('.work-head', { y: vh(-4), autoAlpha: 0.25, duration: 0.1 }, 0.78)
      .to('.work-index li', { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.03, ease: 'power2.out' }, 0.84);

    /* ============ SCENE 3 — PROOF : the ID card approaches ============ */
    gsap.set('.proof-head .line > span', { yPercent: 115 });
    gsap.set('.proof-head .sec-tag', { autoAlpha: 0, y: 20 });
    gsap.set('.idcard-float', { x: v(32), y: vh(-12), z: -1500, rotationY: 78, rotationZ: -16, autoAlpha: 0 });
    gsap.set('.rings', { autoAlpha: 0, scale: 0.7 });
    gsap.set('.idcard-cap', { autoAlpha: 0, y: 20 });
    gsap.set('.sheen', { xPercent: -60 });

    var proof = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#proof', start: 'top top',
        end: D ? '+=400%' : '+=320%',
        scrub: 1, pin: true, anticipatePin: 1
      }
    });
    proof
      .to('.proof-head .line > span', { yPercent: 0, duration: 0.07, stagger: 0.04, ease: 'power3.out' }, 0)
      .to('.proof-head .sec-tag', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.02)
      .to('.rings', { autoAlpha: 1, scale: 1, duration: 0.14 }, 0.04)
      .to('.idcard-float', { autoAlpha: 1, duration: 0.05 }, 0.03)
      // far away → revolving toward camera
      .to('.idcard-float', { x: 0, y: 0, z: -280, rotationY: 26, rotationZ: -6, duration: 0.26, ease: 'power2.inOut' }, 0.05)
      // large + readable, hold
      .to('.idcard-float', { z: 140, rotationY: -7, rotationZ: 1.5, scale: 1.05, duration: 0.2, ease: 'power2.inOut' }, 0.33)
      .to('.sheen', { xPercent: 60, duration: 0.22 }, 0.34)
      .to('.idcard-cap', { autoAlpha: 1, y: 0, duration: 0.08 }, 0.42)
      // physical exit: sideways + backward into depth
      .to('.idcard-float', { x: v(-120), z: -520, rotationY: 64, rotationZ: 12, autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, 0.64)
      .to('.idcard-cap', { autoAlpha: 0, duration: 0.06 }, 0.7)
      .to('.rings', { autoAlpha: 0, scale: 1.15, duration: 0.16 }, 0.78)
      .to('.proof-head', { autoAlpha: 0, y: vh(-6), duration: 0.12 }, 0.78);

    /* ============ SCENE 4 — real work photographs in space ============ */
    gsap.set('.gal-head .line > span', { yPercent: 115 });
    gsap.set('.gal-head .sec-tag', { autoAlpha: 0, y: 20 });
    gsap.set('.s1', { x: v(-70), y: vh(6), z: -520, rotationY: 42, rotationZ: -16, autoAlpha: 0 });
    gsap.set('.s2', { x: v(66), z: -780, rotationY: -38, rotationZ: 14, autoAlpha: 0 });
    gsap.set('.s3', { y: vh(72), z: -380, rotationX: -32, rotationZ: 10, autoAlpha: 0 });
    gsap.set('.shot figcaption', { autoAlpha: 0 });

    var gallery = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#gallery', start: 'top top',
        end: D ? '+=340%' : '+=300%',
        scrub: 1, pin: true, anticipatePin: 1
      }
    });
    gallery
      .to('.gal-head .line > span', { yPercent: 0, duration: 0.07, stagger: 0.04, ease: 'power3.out' }, 0)
      .to('.gal-head .sec-tag', { autoAlpha: 1, y: 0, duration: 0.06 }, 0.02)
      .to('.s1', { x: 0, y: 0, z: 0, rotationY: 0, rotationZ: -5, autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0.04)
      .to('.s2', { x: 0, z: 0, rotationY: 0, rotationZ: 4, autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0.16)
      .to('.s3', { y: 0, z: 0, rotationX: 0, rotationZ: 2, autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0.3)
      .to('.shot figcaption', { autoAlpha: 1, duration: 0.08, stagger: 0.05 }, 0.46)
      .to('.s1', { x: v(-2.5), rotationZ: -6, duration: 0.3 }, 0.55)
      .to('.s2', { y: vh(-3), rotationZ: 5, duration: 0.3 }, 0.55)
      .to('.s3', { z: 90, scale: 1.05, rotationZ: 1, duration: 0.3 }, 0.55)
      .to('.gal-head', { autoAlpha: 0.25, duration: 0.1 }, 0.85);

    /* ============ SCENE 5 — CONTACT reveal (unpinned) ============ */
    gsap.set('.contact-title .line > span', { yPercent: 115 });
    gsap.set('.contact-links li', { autoAlpha: 0, y: 44 });
    gsap.set('.contact-foot', { autoAlpha: 0 });
    var contact = gsap.timeline({
      scrollTrigger: { trigger: '#contact', start: 'top 78%' }
    });
    contact
      .to('.contact-title .line > span', { yPercent: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0)
      .to('.contact-links li', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.3)
      .to('.contact-foot', { autoAlpha: 1, duration: 0.6 }, 0.8);
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
