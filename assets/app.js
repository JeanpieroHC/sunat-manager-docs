/* Documentación @jeanpierohc/sunat-manager: navegación, índice, código, pestañas y animaciones. */
(function () {
  const NAV = [
    { group: 'Empezar' },
    { href: 'index.html', ico: '🏠', text: 'Inicio' },
    { href: 'conceptos.html', ico: '📚', text: 'Conceptos SUNAT' },
    { href: 'instalacion.html', ico: '📦', text: 'Instalación' },
    { href: 'tutorial.html', ico: '🚀', text: 'Tutorial: primera factura' },
    { group: 'Guías' },
    { href: 'json.html', ico: '🧾', text: 'Comprobantes desde JSON' },
    { href: 'calculos.html', ico: '🧮', text: 'Cálculo de impuestos' },
    { href: 'documentos.html', ico: '🗂️', text: 'Todos los documentos' },
    { href: 'guias-remision.html', ico: '🚚', text: 'Guías de remisión' },
    { href: 'impresion.html', ico: '🖨️', text: 'PDF y tickets' },
    { href: 'consultas.html', ico: '🔎', text: 'Consultas y CDR' },
    { href: 'validacion.html', ico: '✅', text: 'Validar y leer XML' },
    { href: 'certificados.html', ico: '🔐', text: 'Certificado digital' },
    { group: 'Referencia' },
    { href: 'api.html', ico: '🧩', text: 'Referencia de la API' },
    { href: 'errores.html', ico: '🩺', text: 'Errores y FAQ' },
    { href: 'arquitectura.html', ico: '🏗️', text: 'Arquitectura' },
  ];
  const pages = NAV.filter((n) => n.href);
  const current = (location.pathname.split('/').pop() || 'index.html');

  // ---- tema
  const savedTheme = (() => { try { return localStorage.getItem('docs-theme'); } catch { return null; } })();
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  // ---- favicon
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = 'assets/favicon.svg';
  document.head.append(icon);

  // ---- estructura
  const main = document.querySelector('main');
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <button class="icon-btn menu-btn" aria-label="Menú">☰</button>
    <a class="brand" href="index.html"><span class="logo-mark">S</span>sunat-manager</a>
    <span class="tag">Node.js · SUNAT Perú</span>
    <span class="spacer"></span>
    <button class="icon-btn theme-btn" title="Cambiar tema">🌓</button>`;
  document.body.prepend(topbar);

  const layout = document.createElement('div');
  layout.className = 'layout';
  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = '<input type="search" placeholder="Buscar en el menú…" aria-label="Buscar">' + NAV.map((n) => (n.group
    ? `<div class="group">${n.group}</div>`
    : `<a href="${n.href}" class="${n.href === current ? 'active' : ''}"><span class="ico">${n.ico}</span>${n.text}</a>`)).join('');
  const toc = document.createElement('aside');
  toc.className = 'toc';
  main.parentNode.insertBefore(layout, main);
  layout.append(sidebar, main, toc);

  // ---- pie y paginador
  const idx = pages.findIndex((p) => p.href === current);
  if (idx !== -1) {
    const prev = pages[idx - 1];
    const next = pages[idx + 1];
    const pager = document.createElement('div');
    pager.className = 'pager';
    pager.innerHTML = (prev ? `<a href="${prev.href}"><span class="lbl">← Anterior</span>${prev.ico} ${prev.text}</a>` : '<span></span>')
      + (next ? `<a class="next" href="${next.href}"><span class="lbl">Siguiente →</span>${next.ico} ${next.text}</a>` : '');
    main.append(pager);
  }
  const footer = document.createElement('footer');
  footer.className = 'site';
  footer.innerHTML = '@jeanpierohc/sunat-manager — facturación electrónica SUNAT para Node.js · basado en <a href="https://github.com/thegreenter/greenter">Greenter</a> (MIT)';
  document.body.append(footer);

  // ---- interacciones globales
  topbar.querySelector('.menu-btn').onclick = () => document.body.classList.toggle('nav-open');
  main.addEventListener('click', () => document.body.classList.remove('nav-open'));
  topbar.querySelector('.theme-btn').onclick = () => {
    const dark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() !== '#ffffff';
    const theme = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('docs-theme', theme); } catch { /* sin almacenamiento */ }
  };
  sidebar.querySelector('input').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    sidebar.querySelectorAll('a').forEach((a) => {
      const t = a.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      a.style.display = t.includes(q) ? '' : 'none';
    });
  });

  // ---- índice de la página
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const heads = [...main.querySelectorAll('h2, h3')];
  if (heads.length) {
    toc.innerHTML = '<div class="title">En esta página</div>' + heads.map((h) => {
      if (!h.id) h.id = slug(h.textContent);
      return `<a href="#${h.id}" class="${h.tagName.toLowerCase()}">${h.textContent}</a>`;
    }).join('');
    const links = [...toc.querySelectorAll('a')];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${en.target.id}`));
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    heads.forEach((h) => spy.observe(h));
  }

  // ---- resaltado de código (JS, JSON, bash) y botón copiar
  const KEYWORDS = /\b(import|from|export|const|let|var|new|await|async|return|if|else|for|of|in|function|class|extends|true|false|null|undefined|try|catch|throw|default)\b/g;
  const highlight = (code) => {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens = [];
    const keep = (cls) => (m) => { tokens.push(`<span class="${cls}">${esc(m)}</span>`); return `\u0000q${tokens.length - 1}q\u0000`; };
    // comentarios y cadenas en una sola pasada (para no confundir "https://" con un comentario)
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
    btn.textContent = 'Copiar';
    btn.onclick = async () => {
      try { await navigator.clipboard.writeText(raw); btn.textContent = '¡Copiado!'; } catch { btn.textContent = 'Error'; }
      setTimeout(() => { btn.textContent = 'Copiar'; }, 1400);
    };
    el.parentNode.append(btn);
  });

  // ---- pestañas: <div class="tabs"><div class="tab-panel" data-tab="Nombre">…</div>…</div>
  main.querySelectorAll('.tabs').forEach((tabs) => {
    const panels = [...tabs.querySelectorAll(':scope > .tab-panel')];
    const bar = document.createElement('div');
    bar.className = 'tab-bar';
    panels.forEach((p, i) => {
      const b = document.createElement('button');
      b.textContent = p.dataset.tab;
      b.onclick = () => {
        panels.forEach((x, j) => x.classList.toggle('active', i === j));
        [...bar.children].forEach((x, j) => x.classList.toggle('active', i === j));
      };
      bar.append(b);
    });
    tabs.prepend(bar);
    bar.children[0].click();
  });

  // ---- galería con zoom
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  lb.onclick = () => lb.classList.remove('open');
  document.body.append(lb);
  main.querySelectorAll('.gallery img').forEach((img) => {
    img.onclick = () => { lb.querySelector('img').src = img.src; lb.classList.add('open'); };
  });

  // ---- animaciones por pasos: <div class="diagram" data-seq> con elementos .seq-step[data-step="n"]
  main.querySelectorAll('[data-seq]').forEach((box) => {
    const steps = [...box.querySelectorAll('.seq-step')];
    const max = Math.max(...steps.map((s) => Number(s.dataset.step)));
    const label = box.querySelector('.seq-label');
    const texts = (box.dataset.seq || '').split('|');
    let n = 0;
    let timer = null;
    const show = (k) => {
      n = k;
      steps.forEach((s) => s.classList.toggle('on', Number(s.dataset.step) <= n));
      if (label) label.textContent = texts[n] || '';
    };
    const play = () => {
      clearInterval(timer);
      show(0);
      timer = setInterval(() => { if (n >= max) { clearInterval(timer); return; } show(n + 1); }, 1600);
    };
    const controls = box.querySelector('.controls');
    if (controls) {
      controls.innerHTML = '<button class="icon-btn" data-a="prev">◀ Anterior</button><button class="icon-btn" data-a="play">▶ Reproducir</button><button class="icon-btn" data-a="next">Siguiente ▶</button>';
      controls.onclick = (e) => {
        const a = e.target.dataset.a;
        if (!a) return;
        clearInterval(timer);
        if (a === 'play') play();
        if (a === 'next') show(Math.min(max, n + 1));
        if (a === 'prev') show(Math.max(0, n - 1));
      };
    }
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(box);
    show(0);
  });

  main.classList.add('fade-in');
})();
