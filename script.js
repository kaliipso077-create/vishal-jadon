/* Vishal Jadon — a camera-led, framework-free portfolio. */
(() => {
  'use strict';
  const THREE = window.THREE;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Motion = window.Motion;
  const root = document.documentElement;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, n) => { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { reduced: media.matches, mobile: innerWidth <= 768, phase: 'opening', photo: 0, intro: 0, ready: false, y: scrollY, pointerX: 0, pointerY: 0 };
  const sections = ['home', 'work', 'proofs', 'contact'].map(id => document.getElementById(id));
  const layers = ['opening', 'hero', 'work', 'proof', 'gallery', 'contact'];
  const photos = [
    { key: 'work-josh-wide', title: 'IN SESSION', sub: 'STRATEGY AT WORK', alt: 'Vishal in a working session with a creator' },
    { key: 'work-josh-close', title: 'A SHARED MOMENT', sub: 'BEHIND THE SCENES', alt: 'Vishal and a creator, close view during a session' },
    { key: 'work-meeting', title: 'WITH CREATORS', sub: 'BEYOND THE SCREEN', alt: 'Vishal with a creator in a professional office environment' }
  ];
  const channels = [
    { key: 'channel-acharya', lines: ['ACHARYA', 'PRASHANT'], color: '#e0a92e' },
    { key: 'channel-josh', lines: ['JOSH TALKS', 'HINDI'], color: '#2aa4dd' },
    { key: 'channel-zee', lines: ['ZEE', 'SWITCH'], color: '#8a4bd6' },
    { key: 'channel-unknown', lines: ['UNKNOWN', 'FACTS HINDI'], color: '#e0342b' }
  ];
  let lenis, renderer, scene, camera, material, objects, viewHeight = 8, viewWidth = 12;
  let frameId = 0, lastTime = 0, elapsed = 0, hidden = false, bounds = [], displayedPhoto = -1;
  const dialog = $('.image-dialog');

  function measure() {
    state.mobile = innerWidth <= 768;
    bounds = sections.map(el => ({ top: el.offsetTop, height: el.offsetHeight }));
    if (!renderer) return;
    camera.aspect = innerWidth / innerHeight;
    camera.fov = 38;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, state.mobile ? 1.5 : 1.7));
    viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 11;
    viewWidth = viewHeight * camera.aspect;
    if (ScrollTrigger) ScrollTrigger.refresh();
  }

  function jumpTo(id, fraction = 0, immediate = false) {
    const index = ['home', 'work', 'proofs', 'contact'].indexOf(id);
    if (index < 0) return;
    const target = bounds[index].top + bounds[index].height * fraction;
    if (lenis && !state.reduced) lenis.scrollTo(target, { immediate, duration: 1.6 });
    else window.scrollTo({ top: target, behavior: 'instant' });
    history.replaceState(null, '', '#' + id);
    closeMenu();
  }

  function showLayer(name, visible) {
    const layer = document.getElementById(name + '-layer');
    if (layer.classList.contains('is-visible') === visible) return;
    layer.classList.toggle('is-visible', visible);
    layer.inert = !visible;
    layer.setAttribute('aria-hidden', String(!visible));
    if (!visible || state.reduced) return;
    const lines = layer.querySelectorAll('.hero-title .line > span');
    if (lines.length && gsap) gsap.fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: .9, stagger: .09, ease: 'power3.out', overwrite: true, onComplete: () => gsap.set(lines, { clearProps: 'transform' }) });
    const eyebrow = layer.querySelector('.eyebrow');
    if (eyebrow && Motion) Motion.animate(eyebrow, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: .65 });
  }

  function updateInterface(phase, p, total) {
    layers.forEach(name => showLayer(name, name === phase));
    if (phase !== state.phase) {
      state.phase = phase;
      document.body.dataset.scene = phase;
      root.classList.toggle('after-opening', phase !== 'opening');
      root.classList.toggle('contact-active', phase === 'contact');
      const label = { opening: '01 <span>/</span> A NEW PERSPECTIVE', hero: '01 <span>/</span> THE GROWTH MINDSET', work: '02 <span>/</span> THE CREATOR ECOSYSTEM', proof: '03 <span>/</span> THE CREDENTIAL', gallery: '03 <span>/</span> BEHIND THE WORK', contact: '04 <span>/</span> YOUR NEXT CHAPTER' };
      $('#chapter-label').innerHTML = label[phase];
      const activeNav = phase === 'hero' || phase === 'opening' ? 'home' : phase === 'proof' || phase === 'gallery' ? 'proofs' : phase;
      $$('[data-nav]').forEach(a => { if (a.dataset.nav === activeNav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    }
    $('.progress-track i').style.transform = `scaleX(${total})`;
    if (phase === 'gallery') {
      const photo = clamp(Math.floor((p - .51) / .16), 0, 2);
      state.photo = photo;
      if (displayedPhoto !== photo) {
        $('#photo-number').textContent = '0' + (photo + 1) + ' / 03';
        $('#photo-caption').replaceChildren(document.createTextNode(photos[photo].title), Object.assign(document.createElement('span'), { textContent: photos[photo].sub }));
        displayedPhoto = photo;
      }
      $('[data-testid="previous-photo"]').disabled = photo === 0;
      $('[data-testid="next-photo"]').disabled = photo === 2;
      $$('.gallery-fallback img').forEach((img, i) => img.classList.toggle('active', i === photo));
    }
  }

  function closeMenu() {
    root.classList.remove('menu-open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
    $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
    $('#mobile-nav').inert = true;
    if (lenis && !dialog.open) lenis.start();
  }

  function setReduced(value) {
    state.reduced = value;
    root.classList.toggle('reduced-motion', value);
    $('.motion-toggle').setAttribute('aria-pressed', String(value));
    $('.motion-toggle').setAttribute('aria-label', value ? 'Enable full animation' : 'Reduce animation');
    $('.motion-text').textContent = value ? 'MOTION REDUCED' : 'MOTION ON';
    $('.motion-symbol').textContent = value ? '▷' : 'Ⅱ';
    if (lenis) { lenis.destroy(); lenis = undefined; }
    if (!value && window.Lenis) lenis = new window.Lenis({ lerp: .1, smoothWheel: true, syncTouch: false, autoResize: true });
    if (value) {
      state.intro = 1;
      if (gsap) { gsap.killTweensOf(state); gsap.killTweensOf('.hero-title .line > span'); gsap.set('.hero-title .line > span', { clearProps: 'transform' }); }
    }
  }

  function openImage(key, caption, alt) {
    $('#dialog-image').src = 'assets/images/' + key + '.webp';
    $('#dialog-image').alt = alt;
    $('#dialog-caption').textContent = caption;
    dialog.showModal();
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function setupInteractions() {
    $('#year').textContent = new Date().getFullYear();
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const fractions = { home: 0, work: .23, proofs: .27, contact: .24 };
      jumpTo(id, fractions[id]);
    }));
    $('[data-testid="enter-experience"]').addEventListener('click', () => jumpTo('home', .37));
    $('.menu-toggle').addEventListener('click', () => {
      const open = !root.classList.contains('menu-open');
      root.classList.toggle('menu-open', open);
      $('.menu-toggle').setAttribute('aria-expanded', String(open));
      $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      $('#mobile-nav').inert = !open;
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
      if (e.key !== 'Tab' || !root.classList.contains('menu-open')) return;
      const focusables = [$('.menu-toggle'), ...$$('#mobile-nav a')];
      const index = focusables.indexOf(document.activeElement);
      if (e.shiftKey && index <= 0) { e.preventDefault(); focusables.at(-1).focus(); }
      if (!e.shiftKey && index === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
    });
    $('.motion-toggle').addEventListener('click', () => setReduced(!state.reduced));
    media.addEventListener('change', e => setReduced(e.matches));
    $('[data-image="id-card"]').addEventListener('click', () => openImage('id-card', 'Original press credential · Zee Switch / Zee Media', 'Original Vishal Jadon press credential, designation Consultant, Zee Switch'));
    $('[data-testid="open-photo"]').addEventListener('click', () => openImage(photos[state.photo].key, photos[state.photo].title + ' · ' + photos[state.photo].sub, photos[state.photo].alt));
    $('[data-testid="close-image"]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; if (lenis) lenis.start(); });
    $('[data-testid="previous-photo"]').addEventListener('click', () => jumpTo('proofs', .57 + Math.max(0, state.photo - 1) * .16));
    $('[data-testid="next-photo"]').addEventListener('click', () => jumpTo('proofs', .57 + Math.min(2, state.photo + 1) * .16));
    window.addEventListener('pointermove', e => { state.pointerX = (e.clientX / innerWidth - .5) * 2; state.pointerY = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
    $$('a.primary-link, .icon-button, .instagram-link').forEach(el => {
      el.addEventListener('pointerenter', () => { if (Motion && !state.reduced) Motion.animate(el, { y: -2 }, { type: 'spring', stiffness: 300, damping: 20 }); });
      el.addEventListener('pointerleave', () => { if (Motion && !state.reduced) Motion.animate(el, { y: 0 }, { type: 'spring', stiffness: 300, damping: 20 }); });
    });
    $$('.channel-label').forEach((el, i) => {
      el.addEventListener('pointerenter', () => { if (objects) objects.channels[i].userData.hover = 1; });
      el.addEventListener('pointerleave', () => { if (objects) objects.channels[i].userData.hover = 0; });
    });
  }

  /* Geometry lives in a shared world: no image zoom masquerading as a 3D logo. */
  function roundedGeometry(w, h, depth, radius = .18) {
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2, r = Math.min(radius, w / 3, h / 3);
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: Math.min(.075, depth / 3), bevelThickness: Math.min(.08, depth / 3), bevelSegments: 5, curveSegments: 20, steps: 1 });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }

  function box(w, h, d, mat, x = 0, y = 0, z = 0, round = false) {
    const horizontal = round && h < .3 && d > .4;
    const geometry = round ? (horizontal ? roundedGeometry(w, d, h, .16) : roundedGeometry(w, h, d, .16)) : new THREE.BoxGeometry(w, h, d);
    if (horizontal) geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }

  function makePlay(size = 1) {
    const group = new THREE.Group();
    const shell = new THREE.Mesh(roundedGeometry(4.7, 2.86, .6, .65), material.red);
    shell.castShadow = true; shell.receiveShadow = true;
    const trim = new THREE.Mesh(roundedGeometry(4.62, 2.79, .1, .63), material.redEdge);
    trim.position.z = -.31;
    const face = new THREE.Shape();
    face.moveTo(-.53, .73); face.quadraticCurveTo(-.62, .75, -.62, .61); face.lineTo(-.62, -.61); face.quadraticCurveTo(-.61, -.76, -.48, -.68); face.lineTo(.78, -.04); face.quadraticCurveTo(.90, .03, .77, .10); face.lineTo(-.53, .73);
    const arrow = new THREE.Mesh(new THREE.ExtrudeGeometry(face, { depth: .055, bevelEnabled: true, bevelSize: .026, bevelThickness: .025, bevelSegments: 3, curveSegments: 12 }), material.porcelain);
    arrow.position.set(.10, 0, .372); arrow.castShadow = true;
    group.add(shell, trim, arrow); group.scale.setScalar(size);
    return group;
  }

  function textureFromCanvas(w, h, draw) {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    draw(canvas.getContext('2d'), w, h);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  async function loadTexture(key) {
    const source = window.PORTFOLIO_ASSETS && window.PORTFOLIO_ASSETS[key];
    if (!source) throw new Error('Missing portfolio image: ' + key);
    const texture = await new THREE.TextureLoader().loadAsync(source);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function studioEnvironment() {
    const studio = new THREE.Scene(); studio.background = new THREE.Color('#868686');
    const panelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    [[-5, 7, 4, 9, 5], [7, 3, 2, 3, 8], [0, 8, -5, 10, 3]].forEach(([x, y, z, w, h]) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), panelMat); panel.position.set(x, y, z); panel.lookAt(0, 0, 0); studio.add(panel);
    });
    const generator = new THREE.PMREMGenerator(renderer);
    const environment = generator.fromScene(studio, .04).texture;
    generator.dispose(); studio.traverse(o => { if (o.geometry) o.geometry.dispose(); }); panelMat.dispose();
    return environment;
  }

  function makeShadow(width, height, opacity = .22) {
    const texture = textureFromCanvas(128, 128, (ctx, w, h) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, 'rgba(25,0,0,.8)'); gradient.addColorStop(.35, 'rgba(25,0,0,.28)'); gradient.addColorStop(1, 'rgba(25,0,0,0)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; return mesh;
  }

  function makePortal() {
    const group = new THREE.Group();
    const frame = material.silver;
    group.add(box(8.1, .12, .17, frame, 0, 2.39, 0, true), box(8.1, .12, .17, frame, 0, -2.39, 0, true), box(.12, 4.75, .17, frame, -4.04), box(.12, 4.75, .17, frame, 4.04));
    const back = box(7.98, 4.7, .12, material.charcoal, 0, 0, -3.8, true);
    group.add(back);
    const sill = box(8.05, .10, 2.4, material.white, 0, -2.4, -1.2); group.add(sill);
    for (let i = 0; i < 3; i++) group.add(box(.055, .055, .03, i === 0 ? material.red : material.charcoal, -3.8 + i * .12, -2.39, .11));
    return group;
  }

  function makeGrowth() {
    const group = new THREE.Group();
    const bars = new THREE.Group();
    [ .3, .48, .76, 1.1 ].forEach((h, i) => bars.add(box(.19, h, .20, material.red, i * .32, h / 2, 0, true)));
    bars.rotation.set(-.12, -.30, 0);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.2, .1, 0), new THREE.Vector3(.3, .36, 0), new THREE.Vector3(.65, .29, .08), new THREE.Vector3(1.1, .89, .05), new THREE.Vector3(1.4, 1.1, 0)]);
    const graph = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, .027, 8, false), material.red);
    const head = new THREE.Mesh(new THREE.ConeGeometry(.095, .26, 3), material.red); head.position.set(1.44, 1.13, 0); head.rotation.z = -.72;
    graph.add(head); group.add(bars, graph);
    group.userData.bars = bars; group.userData.graph = graph;
    return group;
  }

  async function makeHero() {
    const group = new THREE.Group();
    const play = makePlay(); play.position.y = -1.28;
    const texture = await loadTexture('vishal-cutout');
    const portrait = new THREE.Mesh(new THREE.PlaneGeometry(3.55 * 565 / 1029, 3.55), new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .035, depthWrite: true, side: THREE.DoubleSide, toneMapped: false }));
    portrait.position.set(.33, 1.91, .13);
    const contact = makeShadow(1.6, .62, .47); contact.position.set(.23, .245, .1);
    const growth = makeGrowth();
    const smallA = makePlay(.16), smallB = makePlay(.105);
    group.add(play, portrait, contact, growth, smallA, smallB);
    return { group, play, portrait, contact, growth, smallA, smallB };
  }

  async function makeChannel(channel, index) {
    const tex = await loadTexture(channel.key);
    const front = textureFromCanvas(512, 640, (ctx, w, h) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.beginPath(); ctx.arc(w / 2, 240, 176, 0, Math.PI * 2); ctx.fillStyle = channel.color; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(w / 2, 240, 162, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(tex.image, 92, 78, 328, 328); ctx.restore();
      ctx.fillStyle = '#191919'; ctx.textAlign = 'center'; ctx.font = '800 38px Manrope';
      channel.lines.forEach((line, i) => ctx.fillText(line, w / 2, 478 + i * 48));
      ctx.fillStyle = channel.color; ctx.fillRect(w / 2 - 41, 576, 82, 5);
      ctx.fillStyle = channel.color; ctx.font = '700 16px Manrope'; ctx.textAlign = 'left'; ctx.fillText('0' + (index + 1), 28, 36);
    });
    const group = new THREE.Group();
    const body = new THREE.Mesh(roundedGeometry(1.64, 2.05, .13, .16), material.silver); body.castShadow = true;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.57, 1.96), new THREE.MeshBasicMaterial({ map: front, toneMapped: false })); face.position.z = .125;
    group.add(body, face); group.userData.hover = 0; group.userData.hoverCurrent = 0;
    tex.dispose(); return group;
  }

  async function makeCredential() {
    const texture = await loadTexture('id-card');
    const group = new THREE.Group();
    // premium red backing rim (the border of the credential)
    const rim = new THREE.Mesh(roundedGeometry(4.74, 3.34, .13, .26), material.red);
    rim.castShadow = true; rim.receiveShadow = true; rim.position.z = -.07;
    // thick white card body with soft bevels
    const body = new THREE.Mesh(roundedGeometry(4.54, 3.14, .22, .22), material.cardWhite);
    body.castShadow = true; body.receiveShadow = true; body.position.z = 0;
    // red PRESS header strip with a small white play mark
    const headTex = textureFromCanvas(1024, 190, (ctx, w, h) => {
      ctx.fillStyle = '#e60000'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
      ctx.font = '800 68px Manrope'; ctx.fillText('PRESS CREDENTIAL', 42, 120);
      ctx.beginPath(); ctx.arc(w - 96, h / 2, 50, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.fillStyle = '#e60000'; ctx.beginPath(); ctx.moveTo(w - 112, h / 2 - 24); ctx.lineTo(w - 112, h / 2 + 24); ctx.lineTo(w - 70, h / 2); ctx.closePath(); ctx.fill();
    });
    const header = new THREE.Mesh(new THREE.PlaneGeometry(4.18, .58), new THREE.MeshBasicMaterial({ map: headTex, toneMapped: false }));
    header.position.set(0, 1.11, .3);
    // the real credential photo — preserves every original detail
    const faceW = 4.06, faceH = faceW / 1.506;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(faceW, faceH), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    face.position.set(0, -.37, .3);
    // glossy clear laminate for cinematic reflections
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.05), new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .1, roughness: .1, transparent: true, opacity: .05, clearcoat: 1, clearcoatRoughness: .05, reflectivity: .7, depthWrite: false }));
    cover.position.z = .32;
    // lanyard clip + strap rising out of frame
    const clip = new THREE.Mesh(roundedGeometry(.52, .22, .14, .06), material.softSilver); clip.position.set(0, 1.74, .05); clip.castShadow = true;
    const strap = new THREE.Mesh(new THREE.PlaneGeometry(.46, 2.4), new THREE.MeshStandardMaterial({ color: '#b00000', roughness: .72, side: THREE.DoubleSide })); strap.position.set(0, 2.95, -.05);
    group.add(strap, clip, rim, body, header, face, cover);
    return group;
  }

  async function makePhoto(photo) {
    const texture = await loadTexture(photo.key);
    const ratio = texture.image.width / texture.image.height;
    const width = ratio < 1 ? 3.15 : 4.9, height = width / ratio;
    const group = new THREE.Group();
    const frame = new THREE.Mesh(roundedGeometry(width + .14, height + .14, .08, .035), material.white); frame.castShadow = true;
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })); image.position.z = .083;
    group.add(frame, image); group.userData.height = height;
    return group;
  }

  function makeWorkspace() {
    const group = new THREE.Group();
    const desk = box(6.8, .19, 3.4, material.white, 0, -1.1, .15, true); group.add(desk);
    group.add(box(6.74, .025, 3.36, material.red, 0, -1.205, .15));
    group.add(box(.15, 1.8, .18, material.silver, -2.9, -2.1, .7), box(.15, 1.8, .18, material.silver, 2.9, -2.1, .7));
    const laptop = new THREE.Group();
    const base = box(3.05, .11, 1.96, material.silver, 0, -.91, .3, true); laptop.add(base);
    const lid = new THREE.Group(); lid.position.set(0, -.84, -.58); lid.rotation.x = -.15;
    lid.add(box(3.08, 1.99, .09, material.charcoal, 0, 1, 0, true));
    const screenTex = textureFromCanvas(1024, 640, (ctx, w, h) => {
      ctx.fillStyle = '#f00'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(467, 210); ctx.lineTo(467, 343); ctx.lineTo(589, 277); ctx.closePath(); ctx.fill();
      ctx.textAlign = 'center'; ctx.font = '800 52px Manrope'; ctx.fillText('YOUR NEXT CHAPTER.', w / 2, 448);
      ctx.font = '400 18px Manrope'; ctx.fillText('VISHAL JADON / YOUTUBE GROWTH', w / 2, 501);
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.76), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })); screen.position.set(0, 1, .096); lid.add(screen); laptop.add(lid);
    const keyboard = new THREE.InstancedMesh(new THREE.BoxGeometry(.162, .022, .115), material.charcoal, 60);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 60; i++) { dummy.position.set(-1.09 + (i % 12) * .198, -.803, -.20 + Math.floor(i / 12) * .153); dummy.updateMatrix(); keyboard.setMatrixAt(i, dummy.matrix); }
    laptop.add(keyboard, box(.8, .007, .43, material.softSilver, 0, -.809, .83, true));
    laptop.rotation.y = -.22; laptop.position.x = -.10; group.add(laptop);
    const mug = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.28, .25, .65, 40, 1, true), material.porcelain); cup.castShadow = true;
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(.249, 40), material.charcoal); coffee.rotation.x = -Math.PI / 2; coffee.position.y = .285;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.269, .025, 8, 40), material.porcelain); rim.rotation.x = Math.PI / 2; rim.position.y = .325;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.19, .048, 10, 24), material.porcelain); handle.position.x = .32; handle.rotation.y = .15;
    const cupPlay = makePlay(.075); cupPlay.position.set(0, -.025, .26);
    mug.add(cup, coffee, rim, handle, cupPlay); mug.position.set(2.17, -.68, .65); group.add(mug);
    const notebook = box(.95, .07, 1.28, material.red, -2.3, -.94, .42, true); notebook.rotation.y = .18; group.add(notebook);
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(.023, .023, .92, 10), material.silver); pen.rotation.set(Math.PI / 2, 0, -.2); pen.position.set(-2.05, -.88, .45); group.add(pen);
    return group;
  }

  async function createWorld() {
    if (!THREE) throw new Error('3D library unavailable');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping; renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor('#f7f7f7', 0);
    $('#world').appendChild(renderer.domElement);
    renderer.domElement.setAttribute('data-testid', 'portfolio-canvas');
    renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); activateFallback(); });
    scene = new THREE.Scene(); scene.fog = new THREE.Fog('#f7f7f7', 21, 46);
    camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 90); camera.position.set(0, .2, 11);
    scene.environment = studioEnvironment();
    material = {
      red: new THREE.MeshPhysicalMaterial({ color: '#e60000', metalness: .15, roughness: .19, clearcoat: 1, clearcoatRoughness: .13, envMapIntensity: .85 }),
      redEdge: new THREE.MeshPhysicalMaterial({ color: '#b70000', metalness: .35, roughness: .24, clearcoat: 1 }),
      porcelain: new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: .23, metalness: .08, clearcoat: 1 }),
      white: new THREE.MeshStandardMaterial({ color: '#fff', roughness: .65 }),
      cardWhite: new THREE.MeshPhysicalMaterial({ color: '#fafafa', metalness: .04, roughness: .34, clearcoat: .85, clearcoatRoughness: .17, envMapIntensity: .55 }),
      silver: new THREE.MeshPhysicalMaterial({ color: '#d9d9d9', metalness: .65, roughness: .26, clearcoat: .5 }),
      softSilver: new THREE.MeshStandardMaterial({ color: '#a8a8a8', metalness: .3, roughness: .4 }),
      charcoal: new THREE.MeshStandardMaterial({ color: '#151515', roughness: .4, metalness: .15 })
    };
    scene.add(new THREE.HemisphereLight('#ffffff', '#c4c4c4', 2.0));
    const key = new THREE.DirectionalLight('#ffffff', 3.9); key.position.set(-4, 8, 7); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8; key.shadow.bias = -.001; key.shadow.normalBias = .025; key.shadow.radius = 4;
    const fill = new THREE.DirectionalLight('#ffffff', 1.7); fill.position.set(6, 3, -3);
    const rim = new THREE.DirectionalLight('#ffffff', 2.5); rim.position.set(-2, 4, -9);
    scene.add(key, fill, rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.ShadowMaterial({ opacity: .13 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -3.2; floor.receiveShadow = true; scene.add(floor);
    const hero = await makeHero();
    const portal = makePortal();
    const channelObjects = await Promise.all(channels.map(makeChannel));
    const credential = await makeCredential();
    const photoObjects = await Promise.all(photos.map(makePhoto));
    const workspace = makeWorkspace();
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.4, .008, 6, 120), material.red); orbit.rotation.x = Math.PI / 2; orbit.position.y = -2.65;
    const travelingPlay = makePlay(.23);
    const groundShadow = makeShadow(8, 4, .15); groundShadow.position.y = -3.15;
    scene.add(hero.group, portal, credential, workspace, orbit, travelingPlay, groundShadow, ...channelObjects, ...photoObjects);
    objects = { hero, portal, channels: channelObjects, credential, photos: photoObjects, workspace, orbit, travelingPlay, groundShadow };
    measure();
  }

  function setPose(object, x, y, z, rx, ry, rz, scale = 1) {
    object.position.set(x, y, z); object.rotation.set(rx, ry, rz); object.scale.setScalar(scale);
  }

  function pointLabel(element, object, yOffset) {
    const point = new THREE.Vector3(0, yOffset, .05); object.localToWorld(point); point.project(camera);
    const x = clamp((point.x * .5 + .5) * innerWidth, 72, innerWidth - 72);
    const y = clamp((-point.y * .5 + .5) * innerHeight, innerHeight * .32, innerHeight - (state.mobile ? 115 : 175));
    element.style.left = x.toFixed(1) + 'px'; element.style.top = y.toFixed(1) + 'px';
  }

  function openingAndHero(p, time) {
    const { hero, portal } = objects;
    const reveal = state.reduced ? (p > .08 ? 1 : 0) : smooth(.085, .31, p);
    const depart = smooth(.80, 1.04, p);
    const mobile = state.mobile;
    const idle = state.reduced ? 0 : Math.sin(time * .62) * .024;
    const intro = state.intro;
    const artScale = mobile ? Math.min(.44, viewWidth / 6.3) : Math.min(.98, viewWidth / 11.8);
    const openingScale = mobile ? viewWidth / 7.1 : Math.min(1.1, viewWidth / 9.5);
    hero.group.visible = p < 1.08;
    hero.group.scale.setScalar(mix(openingScale, artScale, reveal));
    hero.group.position.set(mix(0, mobile ? -.04 : viewWidth * .235, reveal) - depart * 3, mix(1.28, mobile ? viewHeight * .165 : -.5, reveal) - depart * 1.1, mix(mix(-3.0, mobile ? 3.5 : 4.0, intro), 0, reveal) - depart * 9);
    hero.group.rotation.set(mix(.09, 0, reveal), mix(mix(-.55, -.26, intro), -.04, reveal) - depart * .45, mix(-.10, 0, reveal));
    hero.play.rotation.set(mix(-.1, -.075, reveal), mix(-.12, -.14, reveal), mix(-.06, -.085, reveal));
    hero.play.position.y = -1.28 + idle;
    const personReveal = smooth(.30, .97, reveal);
    hero.portrait.visible = personReveal > .001;
    hero.portrait.position.y = mix(-1.1, 1.91, personReveal) + idle;
    hero.portrait.material.opacity = clamp(personReveal * 1.65);
    hero.contact.visible = personReveal > .85;
    hero.growth.visible = reveal > .8;
    hero.growth.userData.bars.position.set(2.0, .90 + idle, -.35);
    hero.growth.userData.graph.position.set(-2.85, 1.25 - idle, -.25);
    hero.smallA.visible = hero.smallB.visible = reveal > .8;
    setPose(hero.smallA, -2.6, -.05 + idle * 2, .4, .13, .3, -.15, .14);
    setPose(hero.smallB, 2.5, -2.5 - idle * 2, .4, -.1, -.35, .17, .10);
    portal.visible = reveal < .98;
    const frameScale = mobile ? viewWidth / 8.9 : openingScale;
    setPose(portal, -reveal * 6, .02 - reveal, -reveal * 9, 0, reveal * .55, 0, frameScale);
    camera.position.set(mix(.2 * intro, .12, reveal) + depart * .65, mix(.4, .08, reveal), mix(11, 11.2, depart));
    camera.lookAt(0, .05, 0);
  }

  function channelEcosystem(p, time) {
    const mobile = state.mobile;
    const exit = smooth(.9, 1.06, p);
    const spin = state.reduced ? .1 : clamp((p - .26) / (.92 - .26));
    const ringRot = -spin * Math.PI * 2;
    const R = mobile ? 2.1 : 3.05;
    const cx = mobile ? 0 : viewWidth * .145;
    const cy = mobile ? .3 : -.12;
    const cz = -.35;
    camera.position.set(state.reduced ? 0 : Math.sin(time * .16) * .12, .26, 11);
    camera.lookAt(cx * .35, 0, 0);
    objects.channels.forEach((channel, i) => {
      channel.visible = p > -.12 && p < 1.14;
      const hover = channel.userData.hoverCurrent = mix(channel.userData.hoverCurrent, channel.userData.hover, .08);
      const theta = i * (Math.PI / 2) + ringRot;
      const front = Math.cos(theta), frontN = (front + 1) / 2;
      const rIn = state.reduced ? 1 : smooth(i * .05, .13 + i * .05, p);
      const x = cx + Math.sin(theta) * R;
      const z = cz + front * R;
      const y = cy + (state.reduced ? 0 : Math.sin(time * .4 + i) * .03) + (1 - rIn) * 2.6;
      const scaleBase = mobile ? .72 : .96;
      const scale = scaleBase * (.6 + .55 * frontN) * (1 + hover * .05) * rIn;
      channel.rotation.set(0, theta, state.reduced ? 0 : Math.sin(time * .3 + i) * .012);
      channel.position.set(x, y - exit * 1.4, z - exit * 11);
      channel.scale.setScalar(Math.max(.0001, scale));
      channel.updateMatrixWorld(true);
      const el = document.getElementById('channel-' + i);
      if (frontN > .58 && rIn > .55 && exit < .2) { el.style.opacity = ''; el.style.pointerEvents = 'auto'; pointLabel(el, channel, -1.42); }
      else { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    });
    objects.orbit.visible = !mobile && exit < .95;
    objects.orbit.position.set(cx, cy - 2.35, cz - exit * 7); objects.orbit.scale.set(R / 3.4 * 1.15, .62, R / 3.4 * 1.15);
    objects.travelingPlay.visible = p > -.04 && p < 1.06;
    setPose(objects.travelingPlay, mobile ? 0 : -viewWidth * .40, mobile ? -2.4 : -1.7, -1.6 - exit * 8, .1, -.3 + spin * .5, -.05, mobile ? .09 : .14);
  }

  function credentialAndPhotos(p, time) {
    const mobile = state.mobile;
    camera.position.set(state.reduced ? 0 : Math.sin(p * 3) * .15, .08, 11); camera.lookAt(0, 0, 0);
    const approach = state.reduced ? 1 : smooth(.025, .235, p);
    const retreat = state.reduced ? (p > .45 ? 1 : 0) : smooth(.39, .52, p);
    const card = objects.credential;
    const credentialScale = mobile ? viewWidth / 5.35 : Math.min(1.06, viewWidth / 11.7);
    card.visible = p < .56;
    setPose(card, mix(mobile ? .5 : viewWidth * .15, mobile ? 0 : viewWidth * .245, approach) - retreat * 8, mix(1.3, mobile ? -.25 : .0, approach) + retreat * 2.4, mix(-19, .45, approach) - retreat * 22, mix(.28, 0, approach) + retreat * .2, mix(-2.8, -.045, approach) + retreat * 1.65, mix(-.28, -.018, approach) + retreat * .32, credentialScale);
    objects.photos.forEach((photo, i) => {
      const center = .58 + i * .16;
      const distance = (p - center) / .16;
      const active = p >= .50;
      photo.visible = active && Math.abs(distance) < 1.75;
      let z = -Math.abs(distance) * 8.5;
      let x = mobile ? 0 : viewWidth * .20;
      let y = mobile ? -.20 : -.08;
      let ry = distance * .28, rz = (i === 1 ? .024 : -.024) + distance * .08;
      if (state.reduced) {
        photo.visible = active && state.photo === i; z = 0; ry = 0; rz = 0;
      } else {
        x += distance * (mobile ? .75 : 3.4);
        y += Math.abs(distance) * .5 + Math.sin(time * .4 + i) * .012;
      }
      const maxWidth = mobile ? viewWidth * .84 : viewWidth * .44;
      const actualWidth = i === 2 ? 3.15 : 4.9;
      const heightLimit = mobile ? viewHeight * .335 : viewHeight * .63;
      const scale = Math.min(maxWidth / actualWidth, heightLimit / photo.userData.height);
      setPose(photo, x, y, z, distance * -.07, ry, rz, scale);
    });
    objects.travelingPlay.visible = p > .91;
    if (p > .91) setPose(objects.travelingPlay, -viewWidth * .36 + (p - .91) * 20, -1.8, -6 + (p - .91) * 35, .2, p * 3, .05, .18);
  }

  function contactScene(p, time) {
    const mobile = state.mobile;
    const reveal = state.reduced ? 1 : smooth(-.13, .16, p);
    const desk = objects.workspace; desk.visible = true;
    const scale = mobile ? Math.min(viewWidth / 8.1, .60) : Math.min(.94, viewWidth / 14.3);
    setPose(desk, mobile ? .2 : viewWidth * .235, mobile ? -viewHeight * .265 : -.55, mix(-7, 0, reveal), mobile ? .17 : .12, mix(.50, -.23, reveal) + (state.reduced ? 0 : Math.sin(time * .2) * .013), 0, scale);
    objects.travelingPlay.visible = true;
    const px = mobile ? -viewWidth * .28 : viewWidth * .36;
    setPose(objects.travelingPlay, px, mobile ? -viewHeight * .245 : 1.7, -1.1, -.12, -.32, -.04, mobile ? .12 : .28);
    camera.position.set(.12, .28, 11); camera.lookAt(0, 0, 0);
  }

  function drawWorld(sectionIndex, p, time) {
    if (!objects) return;
    objects.hero.group.visible = false; objects.portal.visible = false;
    objects.channels.forEach(o => { o.visible = false; }); objects.photos.forEach(o => { o.visible = false; });
    objects.credential.visible = false; objects.workspace.visible = false; objects.orbit.visible = false; objects.travelingPlay.visible = false;
    if (sectionIndex === 0) {
      openingAndHero(p, time);
      if (p > .93) channelEcosystem((p - 1) * 1.4, time);
    } else if (sectionIndex === 1) {
      channelEcosystem(p, time);
      if (p > .91) { objects.credential.visible = true; setPose(objects.credential, viewWidth * .2, 1, -24 + (p - .91) * 50, .3, -2.8, -.3, 1); }
    } else if (sectionIndex === 2) {
      credentialAndPhotos(p, time);
      if (p > .95) contactScene((p - 1) * 1.5, time);
    } else contactScene(p, time);
    if (!state.reduced) {
      camera.position.x += Math.sin(time * .3) * .03 + (state.mobile ? 0 : state.pointerX * .038);
      camera.position.y += Math.cos(time * .23) * .022 - (state.mobile ? 0 : state.pointerY * .025);
    }
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    const personVisible = objects.hero.group.visible && objects.hero.portrait.visible;
    renderer.domElement.dataset.portraitVisible = String(personVisible);
    renderer.domElement.dataset.scene = state.phase;
    renderer.domElement.dataset.scrollProgress = p.toFixed(3);
  }

  function frame(time) {
    frameId = requestAnimationFrame(frame);
    if (hidden) return;
    if (lenis) lenis.raf(time);
    const delta = Math.min((time - lastTime) / 1000, .05); lastTime = time;
    if (!state.reduced) elapsed += delta;
    state.y = scrollY;
    let sectionIndex = bounds.findIndex((b, i) => state.y >= b.top && (i === bounds.length - 1 || state.y < bounds[i + 1].top));
    sectionIndex = Math.max(0, sectionIndex);
    const b = bounds[sectionIndex];
    const p = clamp((state.y - b.top) / b.height);
    const phase = sectionIndex === 0 ? (p < (state.reduced ? .08 : .25) ? 'opening' : 'hero') : sectionIndex === 1 ? 'work' : sectionIndex === 2 ? (p < .51 ? 'proof' : 'gallery') : 'contact';
    const total = state.y / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    updateInterface(phase, p, total);
    if (state.ready) drawWorld(sectionIndex, p, elapsed);
  }

  function activateFallback() {
    state.ready = false; root.classList.add('no-webgl', 'ready'); root.classList.remove('loading');
    if (renderer) renderer.domElement.style.display = 'none';
  }

  async function init() {
    measure(); setupInteractions(); setReduced(state.reduced);
    if (gsap) gsap.ticker.lagSmoothing(0);
    if (gsap && ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }
    layers.forEach(name => { if (name !== 'opening') showLayer(name, false); });
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; lastTime = performance.now(); });
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 120); });
    frameId = requestAnimationFrame(frame);
    try {
      await document.fonts.ready;
      await createWorld();
      state.ready = true; root.classList.add('ready'); root.classList.remove('loading');
      state.intro = 1;
    } catch (error) {
      console.warn('Using accessible static portfolio presentation:', error.message);
      activateFallback();
    }
    const id = location.hash.slice(1);
    if (id && ['home', 'work', 'proofs', 'contact'].includes(id)) {
      const positions = { home: 0, work: .23, proofs: .27, contact: .24 };
      jumpTo(id, positions[id], true);
    }
    window.addEventListener('pagehide', () => { cancelAnimationFrame(frameId); }, { once: true });
    window.addEventListener('pageshow', event => { if (event.persisted) frameId = requestAnimationFrame(frame); });
  }
  init();
})();