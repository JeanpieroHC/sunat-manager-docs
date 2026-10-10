/* Calculadora interactiva de la documentación (versión de demostración de SaleCalculator). */
(function () {
  const root = document.getElementById('playground');
  if (!root) return;

  const r2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
  const fmt = (v) => v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ---- monto en letras
  const U = ['CERO', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE', 'TRECE',
    'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS',
    'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const D = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const C = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  const h = (n) => {
    if (n === 100) return 'CIEN';
    const p = [];
    const c = Math.floor(n / 100); const r = n % 100;
    if (c) p.push(C[c]);
    if (r) p.push(r < 30 ? U[r] : (r % 10 ? `${D[Math.floor(r / 10)]} Y ${U[r % 10]}` : D[r / 10]));
    return p.join(' ');
  };
  const apo = (w) => w.replace(/VEINTIUNO$/, 'VEINTIÚN').replace(/UNO$/, 'UN');
  const th = (n) => {
    const m = Math.floor(n / 1000); const r = n % 1000; const p = [];
    if (m === 1) p.push('MIL'); else if (m > 1) p.push(`${apo(h(m))} MIL`);
    if (r) p.push(h(r));
    return p.join(' ');
  };
  const words = (n) => {
    if (n === 0) return 'CERO';
    const mill = Math.floor(n / 1e6); const r = n % 1e6; const p = [];
    if (mill === 1) p.push('UN MILLÓN'); else if (mill > 1) p.push(`${apo(th(mill))} MILLONES`);
    if (r) p.push(th(r));
    return p.join(' ');
  };
  const MONEDA = { PEN: 'SOLES', USD: 'DÓLARES AMERICANOS', EUR: 'EUROS' };
  const letras = (v, cur) => {
    const cents = Math.round(v * 100);
    return `SON ${words(Math.floor(cents / 100))} CON ${String(cents % 100).padStart(2, '0')}/100 ${MONEDA[cur] || cur}`;
  };

  // ---- cálculo
  const GRAT = new Set(['11', '12', '13', '14', '15', '16', '21', '31', '32', '33', '34', '35', '36', '37']);
  const AFE = [
    ['10', 'Gravado (IGV 18%)'], ['20', 'Exonerado'], ['30', 'Inafecto'], ['40', 'Exportación'], ['17', 'IVAP (4%)'],
    ['13', 'Gratuito gravado (bonificación)'], ['21', 'Gratuito exonerado'],
  ];

  function calc(items, opts) {
    const s = { grav: 0, exo: 0, ina: 0, exp: 0, ivapBase: 0, ivap: 0, grat: 0, igvGrat: 0, igv: 0, icbper: 0 };
    const lines = items.map((it) => {
      const q = Number(it.cantidad) || 0;
      const pct = it.afe === '17' ? opts.ivap : (it.afe === '10' || ['11', '12', '13', '14', '15', '16'].includes(it.afe) ? opts.igv : 0);
      let vu = Number(it.precio) || 0;
      if (GRAT.has(it.afe)) {
        const vv = r2(q * vu);
        const igv = pct ? r2(vv * pct / 100) : 0;
        s.grat += vv; s.igvGrat += igv;
        return { ...it, vu: 0, vv, igv, icb: 0, total: 0, gratis: true };
      }
      const icbFactor = it.bolsa ? opts.icbper : 0;
      if (opts.conIgv) vu = Math.max(0, (vu - icbFactor) / (1 + ((it.afe === '10' || it.afe === '17') ? pct / 100 : 0)));
      const vv = r2(q * vu);
      const igv = (it.afe === '10' || it.afe === '17') ? r2(vv * pct / 100) : 0;
      const icb = it.bolsa ? r2(q * icbFactor) : 0;
      s.icbper += icb;
      if (it.afe === '10') { s.grav += vv; s.igv += igv; }
      if (it.afe === '17') { s.ivapBase += vv; s.ivap += igv; }
      if (it.afe === '20') s.exo += vv;
      if (it.afe === '30') s.ina += vv;
      if (it.afe === '40') s.exp += vv;
      return { ...it, vu, vv, igv, icb, total: r2(vv + igv + icb) };
    });
    const valorVenta = r2(s.grav + s.exo + s.ina + s.exp + s.ivapBase);
    const impuestos = r2(r2(s.igv) + r2(s.ivap) + r2(s.icbper));
    const total = r2(valorVenta + impuestos);
    return { lines, s, valorVenta, impuestos, total };
  }

  // ---- interfaz
  let items = [
    { desc: 'MOUSE INALÁMBRICO', cantidad: 2, precio: 59, afe: '10', bolsa: false },
    { desc: 'LIBRO', cantidad: 1, precio: 45, afe: '30', bolsa: false },
    { desc: 'BOLSA PLÁSTICA', cantidad: 1, precio: 0.62, afe: '10', bolsa: true },
  ];
  const opts = { igv: 18, ivap: 4, icbper: 0.5, conIgv: true, moneda: 'PEN' };

  root.innerHTML = `
    <div class="pg-head">
      <div style="min-width:200px"><label for="pg-mode">Los precios ingresados</label><select id="pg-mode"><option value="1">incluyen IGV (precio)</option><option value="0">no incluyen IGV (valor)</option></select></div>
      <div style="width:110px"><label for="pg-cur">Moneda</label><select id="pg-cur"><option>PEN</option><option>USD</option><option>EUR</option></select></div>
    </div>
    <div class="pg-body">
      <div class="pg-row head"><span>Descripción</span><span>Cantidad</span><span>Precio</span><span>Afectación</span><span></span></div>
      <div id="pg-items"></div>
      <button class="icon-btn" id="pg-add"><i data-lucide="plus"></i>Agregar ítem</button>
    </div>
    <div class="pg-out">
      <div class="table-wrap"><table id="pg-lines"></table></div>
      <div><div class="table-wrap"><table id="pg-totals"></table></div><div class="legend-box" id="pg-legend"></div></div>
    </div>
    <div class="pg-json"><h4>JSON equivalente para <code>DocumentMapper</code></h4><pre><code id="pg-json"></code></pre></div>`;

  const $ = (id) => root.querySelector(id);
  const render = () => {
    $('#pg-items').innerHTML = items.map((it, i) => `
      <div class="pg-row" data-i="${i}">
        <input data-k="desc" value="${it.desc.replace(/"/g, '&quot;')}">
        <input data-k="cantidad" type="number" min="0" step="any" value="${it.cantidad}">
        <input data-k="precio" type="number" min="0" step="any" value="${it.precio}">
        <select data-k="afe">${AFE.map(([c, t]) => `<option value="${c}" ${c === it.afe ? 'selected' : ''}>${c} · ${t}</option>`).join('')}</select>
        <button class="icon-btn" data-del title="Quitar ítem" aria-label="Quitar ítem"><i data-lucide="trash-2"></i></button>
        <label class="check"><input type="checkbox" data-k="bolsa" ${it.bolsa ? 'checked' : ''}> Bolsa plástica (ICBPER S/ 0.50 por unidad; si el precio incluye IGV, también incluye el ICBPER)</label>
      </div>`).join('');
    update();
    if (window.docsIcons) window.docsIcons();
  };
  const update = () => {
    const res = calc(items, opts);
    const cur = opts.moneda === 'PEN' ? 'S/' : opts.moneda === 'USD' ? '$' : '€';
    $('#pg-lines').innerHTML = '<thead><tr><th>Ítem</th><th class="num">Valor venta</th><th class="num">IGV</th><th class="num">Total</th></tr></thead><tbody>'
      + res.lines.map((l) => `<tr><td>${l.desc}</td><td class="num">${fmt(l.vv)}</td><td class="num">${fmt(l.igv)}</td><td class="num">${l.gratis ? '<span class="badge info">Gratuito</span>' : fmt(l.total)}</td></tr>`).join('') + '</tbody>';
    const row = (k, v) => (v ? `<tr><td>${k}</td><td class="num">${cur} ${fmt(v)}</td></tr>` : '');
    const s = res.s;
    $('#pg-totals').innerHTML = '<tbody>' + row('Op. gravadas', r2(s.grav)) + row('Op. exoneradas', r2(s.exo)) + row('Op. inafectas', r2(s.ina))
      + row('Op. exportación', r2(s.exp)) + row('Base IVAP', r2(s.ivapBase)) + row('Op. gratuitas', r2(s.grat))
      + (s.grav ? `<tr><td>IGV 18%</td><td class="num">${cur} ${fmt(r2(s.igv))}</td></tr>` : '') + row('IVAP', r2(s.ivap)) + row('ICBPER', r2(s.icbper))
      + `<tr class="pg-total"><td>Total</td><td class="num">${cur} ${fmt(res.total)}</td></tr></tbody>`;
    $('#pg-legend').textContent = letras(res.total, opts.moneda);
    const json = {
      moneda: opts.moneda,
      detalles: items.map((it) => {
        const d = { descripcion: it.desc, cantidad: Number(it.cantidad) };
        if (GRAT.has(it.afe)) d.mto_valor_gratuito = Number(it.precio);
        else d[opts.conIgv ? 'mto_precio_unitario' : 'mto_valor_unitario'] = Number(it.precio);
        if (it.afe !== '10') d.tip_afe_igv = it.afe;
        if (it.bolsa) d.icbper = true;
        return d;
      }),
    };
    $('#pg-json').textContent = JSON.stringify(json, null, 2);
  };

  root.addEventListener('input', (e) => {
    const row = e.target.closest('.pg-row[data-i]');
    if (row) {
      const it = items[Number(row.dataset.i)];
      const k = e.target.dataset.k;
      it[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      update();
    }
    if (e.target.id === 'pg-mode') { opts.conIgv = e.target.value === '1'; update(); }
    if (e.target.id === 'pg-cur') { opts.moneda = e.target.value; update(); }
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('#pg-add')) { items.push({ desc: 'NUEVO ÍTEM', cantidad: 1, precio: 10, afe: '10', bolsa: false }); render(); }
    if (e.target.closest('[data-del]')) {
      items = items.filter((_, i) => i !== Number(e.target.closest('.pg-row').dataset.i));
      render();
    }
  });
  render();

  // ---- conversor de monto en letras
  const ml = document.getElementById('monto-letras');
  if (ml) {
    const inp = ml.querySelector('input');
    const sel = ml.querySelector('select');
    const out = ml.querySelector('.legend-box');
    const go = () => { const v = Number(inp.value); out.textContent = Number.isFinite(v) && v >= 0 && v < 1e12 ? letras(v, sel.value) : 'Monto inválido'; };
    inp.addEventListener('input', go);
    sel.addEventListener('change', go);
    go();
  }
})();
