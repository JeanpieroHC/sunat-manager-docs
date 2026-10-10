/* Documentación @jeanpierohc/sunat-manager: navegación, índice, código, pestañas y animaciones. */
(function () {
  const VERSION = 'v1.1';
  const NAV = [
    { group: 'Empezar' },
    { href: 'index.html', icon: 'house', text: 'Inicio' },
    { href: 'conceptos.html', icon: 'book-open', text: 'Conceptos SUNAT' },
    { href: 'instalacion.html', icon: 'package', text: 'Instalación' },
    { href: 'tutorial.html', icon: 'graduation-cap', text: 'Tutorial' },
    { group: 'Guías' },
    { href: 'json.html', icon: 'braces', text: 'Crear desde JSON' },
    { href: 'calculos.html', icon: 'calculator', text: 'Cálculo de impuestos' },
    { href: 'documentos.html', icon: 'files', text: 'Tipos de documento' },
    { href: 'guias-remision.html', icon: 'truck', text: 'Guías de remisión' },
    { href: 'impresion.html', icon: 'printer', text: 'PDF y tickets' },
    { href: 'consultas.html', icon: 'search-check', text: 'Consultas y CDR' },
    { href: 'validacion.html', icon: 'list-checks', text: 'Validar y leer XML' },
    { href: 'certificados.html', icon: 'key-round', text: 'Certificado digital' },
    { group: 'Referencia' },
    { href: 'api.html', icon: 'code-xml', text: 'API' },
    { href: 'errores.html', icon: 'life-buoy', text: 'Errores y FAQ' },
    { href: 'arquitectura.html', icon: 'layers', text: 'Arquitectura' },
  ];
  const pages = NAV.filter((n) => n.href);
  const current = location.pathname.split('/').pop() || 'index.html';
  const ic = (name) => `<i data-lucide="${name}"></i>`;

  // ---- tema guardado
  try { const t = localStorage.getItem('docs-theme'); if (t) document.documentElement.dataset.theme = t; } catch { /* sin almacenamiento */ }

  // ---- favicon
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = 'assets/favicon.svg';
  document.head.append(icon);

  // ---- barra superior
  const main = document.querySelector('main');
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <button class="icon-btn menu-btn" aria-label="Abrir menú">${ic('menu')}</button>
    <a class="brand" href="index.html"><span class="mark">${ic('receipt-text')}</span>sunat-manager<span class="ver">${VERSION}</span></a>
    <span class="spacer"></span>
    <a class="nav-link" href="tutorial.html">${ic('graduation-cap')}<span>Tutorial</span></a>
    <a class="nav-link" href="api.html">${ic('code-xml')}<span>API</span></a>
    <button class="icon-btn theme-btn" aria-label="Cambiar tema" title="Cambiar tema">${ic('sun-moon')}</button>`;
  document.body.prepend(topbar);

  // ---- columnas
  const layout = document.createElement('div');
  layout.className = 'layout';
  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('aria-label', 'Secciones');
  sidebar.innerHTML = `<div class="search">${ic('search')}<input type="search" placeholder="Buscar sección" aria-label="Buscar sección"></div>`
    + NAV.map((n) => (n.group
      ? `<div class="group">${n.group}</div>`
      : `<a href="${n.href}" class="${n.href === current ? 'active' : ''}">${ic(n.icon)}${n.text}</a>`)).join('');
  const toc = document.createElement('aside');
  toc.className = 'toc';
  main.parentNode.insertBefore(layout, main);
  layout.append(sidebar, main, toc);

  // ---- paginador y pie
  const idx = pages.findIndex((p) => p.href === current);
  if (idx !== -1) {
    const prev = pages[idx - 1];
    const next = pages[idx + 1];
    const pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Páginas');
    pager.innerHTML = (prev ? `<a href="${prev.href}"><span class="lbl">${ic('arrow-left')}Anterior</span>${prev.text}</a>` : '')
      + (next ? `<a class="next" href="${next.href}"><span class="lbl">Siguiente${ic('arrow-right')}</span>${next.text}</a>` : '');
    main.append(pager);
  }
  const footer = document.createElement('footer');
  footer.className = 'site';
  footer.innerHTML = '@jeanpierohc/sunat-manager · Facturación electrónica SUNAT para Node.js · Basado en <a href="https://github.com/thegreenter/greenter">Greenter</a> (MIT)';
  document.body.append(footer);

  // ---- interacciones
  topbar.querySelector('.menu-btn').onclick = (e) => { e.stopPropagation(); document.body.classList.toggle('nav-open'); };
  document.addEventListener('click', (e) => { if (!sidebar.contains(e.target)) document.body.classList.remove('nav-open'); });
  topbar.querySelector('.theme-btn').onclick = () => {
    const dark = getComputedStyle(document.documentElement).colorScheme.includes('dark');
    const theme = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('docs-theme', theme); } catch { /* sin almacenamiento */ }
  };
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  sidebar.querySelector('input').addEventListener('input', (e) => {
    const q = norm(e.target.value);
    sidebar.querySelectorAll('a').forEach((a) => { a.style.display = norm(a.textContent).includes(q) ? '' : 'none'; });
    sidebar.querySelectorAll('.group').forEach((g) => { g.style.display = q ? 'none' : ''; });
  });

  // ---- títulos con ancla e índice
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const heads = [...main.querySelectorAll('h2, h3')];
  heads.forEach((h) => {
    if (!h.id) h.id = slug(h.textContent);
    const a = document.createElement('a');
    a.className = 'anchor';
    a.href = `#${h.id}`;
    a.setAttribute('aria-label', 'Enlace a esta sección');
    a.innerHTML = ic('link');
    h.prepend(a);
  });
  if (heads.length) {
    toc.innerHTML = `<div class="title">${ic('text')}En esta página</div>`
      + heads.map((h) => `<a href="#${h.id}" class="${h.tagName.toLowerCase()}">${h.textContent.trim()}</a>`).join('');
    const links = [...toc.querySelectorAll('a')];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    heads.forEach((h) => spy.observe(h));
  }

  // los ids se crean aquí: ir al ancla de la URL una vez generados
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }

  // ---- tablas con desplazamiento horizontal
  main.querySelectorAll('table').forEach((t) => {
    if (t.parentElement.classList.contains('table-wrap')) return;
    const w = document.createElement('div');
    w.className = 'table-wrap';
    t.replaceWith(w);
    w.append(t);
  });

  // ---- desplegables
  main.querySelectorAll('details > summary').forEach((s) => s.insertAdjacentHTML('afterbegin', ic('chevron-right')));

  // ---- galería: contenedor de recorte
  main.querySelectorAll('.gallery img').forEach((img) => {
    const shot = document.createElement('div');
    shot.className = 'shot';
    img.replaceWith(shot);
    shot.append(img);
  });

  // ---- resaltado de código y botón copiar
  const KEYWORDS = /\b(import|from|export|const|let|var|new|await|async|return|if|else|for|of|in|while|do|function|class|extends|true|false|null|undefined|try|catch|throw|default)\b/g;
  const highlight = (code) => {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens = [];
    const keep = (cls) => (m) => { tokens.push(`<span class="${cls}">${esc(m)}</span>`); return `\u0000q${tokens.length - 1}q\u0000`; };
    let s = code.replace(
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|(?:^|(?<=\s))#[^\n]*)|((['"`])(?:\\.|(?!\3)[^\\\n])*\3)/gm,
      (m, comment) => keep(comment ? 'tok-c' : 'tok-s')(m),
    );
    s = esc(s)
      .replace(KEYWORDS, '<span class="tok-k">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-n">$1</span>')
      .replace(/\.([a-zA-Z_]\w*)(?=\()/g, '.<span class="tok-f">$1</span>');
    return s.replace(/\u0000q(\d+)q\u0000/g, (_, i) => tokens[i]);
  };
  main.querySelectorAll('pre > code').forEach((el) => {
    const raw = el.textContent.replace(/^\n/, '');
    if (!el.classList.contains('no-hl')) el.innerHTML = highlight(raw);
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.title = 'Copiar';
    btn.setAttribute('aria-label', 'Copiar código');
    btn.innerHTML = ic('copy');
    btn.onclick = async () => {
      try { await navigator.clipboard.writeText(raw); btn.innerHTML = ic('check'); } catch { btn.innerHTML = ic('x'); }
      window.lucide && window.lucide.createIcons({ nameAttr: 'data-lucide' });
      setTimeout(() => { btn.innerHTML = ic('copy'); window.lucide && window.lucide.createIcons(); }, 1400);
    };
    el.parentNode.append(btn);
  });

  // ---- pestañas
  main.querySelectorAll('.tabs').forEach((tabs) => {
    const panels = [...tabs.querySelectorAll(':scope > .tab-panel')];
    const bar = document.createElement('div');
    bar.className = 'tab-bar';
    bar.setAttribute('role', 'tablist');
    panels.forEach((p, i) => {
      const b = document.createElement('button');
      b.textContent = p.dataset.tab;
      b.setAttribute('role', 'tab');
      b.onclick = () => {
        panels.forEach((x, j) => x.classList.toggle('active', i === j));
        [...bar.children].forEach((x, j) => x.classList.toggle('active', i === j));
      };
      bar.append(b);
    });
    tabs.prepend(bar);
    bar.children[0].click();
  });

  // ---- visor de imágenes
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  lb.onclick = () => lb.classList.remove('open');
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('open'); });
  document.body.append(lb);
  main.querySelectorAll('.gallery img').forEach((img) => {
    img.parentElement.onclick = () => { lb.querySelector('img').src = img.src; lb.querySelector('img').alt = img.alt; lb.classList.add('open'); };
  });

  // ---- animaciones por pasos
  main.querySelectorAll('[data-seq]').forEach((box) => {
    const steps = [...box.querySelectorAll('.seq-step')];
    const max = Math.max(...steps.map((s) => Number(s.dataset.step)));
    const label = box.querySelector('.seq-label');
    const texts = (box.dataset.seq || '').split('|');
    const controls = box.querySelector('.controls');
    let n = 0;
    let timer = null;
    const show = (k) => {
      n = k;
      steps.forEach((s) => s.classList.toggle('on', Number(s.dataset.step) <= n));
      if (label) label.textContent = texts[n] || '';
      if (controls) {
        controls.querySelector('[data-a="prev"]').disabled = n === 0;
        controls.querySelector('[data-a="next"]').disabled = n === max;
      }
    };
    const play = () => {
      clearInterval(timer);
      show(0);
      timer = setInterval(() => { if (n >= max) { clearInterval(timer); return; } show(n + 1); }, 1700);
    };
    if (controls) {
      controls.innerHTML = `<button class="icon-btn" data-a="prev" aria-label="Paso anterior">${ic('chevron-left')}</button>`
        + `<button class="icon-btn" data-a="play">${ic('rotate-ccw')}Repetir</button>`
        + `<button class="icon-btn" data-a="next" aria-label="Paso siguiente">${ic('chevron-right')}</button>`;
      controls.onclick = (e) => {
        const a = e.target.closest('button')?.dataset.a;
        if (!a) return;
        clearInterval(timer);
        if (a === 'play') play();
        if (a === 'next') show(Math.min(max, n + 1));
        if (a === 'prev') show(Math.max(0, n - 1));
      };
    }
    show(0);
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(box);
  });

  // ---- iconos
  const draw = () => window.lucide && window.lucide.createIcons();
  if (window.lucide) draw(); else window.addEventListener('load', draw);
  window.docsIcons = draw;
})();
