// Charts for "I checked whether my laptop is wasting RAM".
// Plain SVG, no libraries. Data comes from the mlxsh server logs.
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  var daily = [
    ['2026-08-01', 0, 0, 1146], ['2026-08-02', 0, 0, 94752], ['2026-08-03', 0, 0, 129],
    ['2026-08-15', 0, 0, 178281], ['2026-08-16', 0, 0, 4810], ['2026-08-20', 0, 0, 11542],
    ['2026-08-21', 0, 0, 48], ['2026-08-23', 0, 0, 8536], ['2026-08-24', 0, 0, 18359],
    ['2026-08-25', 0, 0, 8543], ['2026-08-26', 294893, 0, 53802], ['2026-09-05', 1560, 0, 0],
    ['2026-09-08', 29396, 0, 0], ['2026-09-11', 43068, 0, 0], ['2026-09-17', 203165, 0, 0],
    ['2026-09-18', 279742, 0, 169], ['2026-09-23', 150442, 0, 0], ['2026-09-27', 159854, 0, 0],
    ['2026-09-28', 16998, 0, 0], ['2026-10-03', 28994, 0, 0], ['2026-10-04', 27528, 0, 0],
    ['2026-10-05', 8624, 0, 0], ['2026-10-06', 4600, 0, 0], ['2026-10-08', 149444, 0, 0],
    ['2026-10-09', 109935, 44141, 0], ['2026-10-10', 0, 729790, 0],
    ['2026-10-11', 2624631, 173309, 0], ['2026-10-12', 3911622, 0, 0],
    ['2026-10-14', 509554, 0, 0], ['2026-10-15', 546643, 0, 0], ['2026-10-16', 11661, 0, 0],
    ['2026-10-17', 437662, 0, 0], ['2026-10-18', 221, 0, 0], ['2026-10-23', 117502, 0, 0]
  ];
  var models = [
    { name: 'Qwen3.8 27B', color: 'var(--series-1)' },
    { name: 'Qwen3.5 9B', color: 'var(--series-2)' },
    { name: 'Gemma 4 and others', color: 'var(--series-3)' }
  ];

  var cost = [
    { label: 'October pace', tokens: '113M', hosted: 53, local: 1.23 },
    { label: '10x', tokens: '1.1B', hosted: 533, local: 12 },
    { label: 'Laptop busy 24/7', tokens: '6.3B', hosted: 2970, local: 68 }
  ];
  var costSeries = [
    { name: 'OpenRouter', key: 'hosted', color: 'var(--series-1)' },
    { name: 'My cost', key: 'local', color: 'var(--series-2)' }
  ];

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function text(parent, x, y, str, cls, anchor) {
    var t = el('text', { x: x, y: y, 'class': cls || 'tick', 'text-anchor': anchor || 'start' }, parent);
    t.textContent = str;
    return t;
  }
  // A bar with only its data end rounded.
  function barPath(x, y, w, h, r, horizontal) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    if (horizontal) {
      return 'M' + x + ',' + y + 'h' + (w - r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r +
        'v' + (h - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + -r + ',' + r + 'h' + -(w - r) + 'z';
    }
    return 'M' + x + ',' + (y + h) + 'v' + -(h - r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + -r +
      'h' + (w - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r + 'v' + (h - r) + 'z';
  }
  function fmtTokens(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'k';
    return String(n);
  }
  function fmtMoney(n) {
    return '$' + (n >= 100 ? Math.round(n).toLocaleString('en-US') : n < 1 ? n.toFixed(2) : n.toFixed(n < 10 ? 2 : 0));
  }
  function fmtDate(iso, long) {
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', long ? { month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' });
  }
  function legend(fig, series) {
    var box = fig.querySelector('.chart-legend');
    box.innerHTML = '';
    series.forEach(function (s) {
      var item = document.createElement('span');
      var sw = document.createElement('i');
      sw.style.background = s.color;
      item.appendChild(sw);
      item.appendChild(document.createTextNode(s.name));
      box.appendChild(item);
    });
  }
  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'status');
  document.body.appendChild(tip);
  function showTip(evt, html) {
    tip.innerHTML = html;
    tip.style.display = 'block';
    var pad = 12, w = tip.offsetWidth, h = tip.offsetHeight;
    var x = evt.clientX + pad, y = evt.clientY - h - pad;
    if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
    if (y < 8) y = evt.clientY + pad;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hideTip() { tip.style.display = 'none'; }
  function tipRow(color, name, value) {
    return '<div class="tip-row"><i style="background:' + color + '"></i><span>' + name + '</span><b>' + value + '</b></div>';
  }

  function drawDaily(fig) {
    var plot = fig.querySelector('.chart-plot');
    plot.innerHTML = '';
    var W = plot.clientWidth, H = 240;
    var m = { top: 8, right: 4, bottom: 24, left: 40 };
    var iw = W - m.left - m.right, ih = H - m.top - m.bottom;

    var byDay = {};
    daily.forEach(function (d) { byDay[d[0]] = d; });
    var days = [];
    for (var t = new Date('2026-08-01T12:00:00'); t <= new Date('2026-10-23T12:00:00'); t.setDate(t.getDate() + 1)) {
      var iso = t.toISOString().slice(0, 10);
      days.push(byDay[iso] || [iso, 0, 0, 0]);
    }
    var max = 4e6;
    var step = iw / days.length;
    var gap = step > 5 ? 2 : 1;
    var bw = Math.max(1, step - gap);
    var y = function (v) { return m.top + ih - (v / max) * ih; };

    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, plot);
    el('title', {}, svg).textContent = 'Tokens per day by model. October 11 and 12 account for more than half of the total.';

    [0, 1e6, 2e6, 3e6, 4e6].forEach(function (v) {
      el('line', { x1: m.left, x2: W - m.right, y1: y(v), y2: y(v), 'class': v ? 'grid' : 'axis' }, svg);
      text(svg, m.left - 6, y(v) + 4, v ? v / 1e6 + 'M' : '0', 'tick', 'end');
    });
    ['2026-08-01', '2026-09-01', '2026-10-01'].forEach(function (iso) {
      var i = days.findIndex(function (d) { return d[0] === iso; });
      text(svg, m.left + i * step, H - 6, fmtDate(iso), 'tick', 'start');
    });

    days.forEach(function (d, i) {
      var x = m.left + i * step + gap / 2;
      var base = 0;
      var top = -1;
      for (var s = 0; s < 3; s++) if (d[s + 1] > 0) top = s;
      for (s = 0; s < 3; s++) {
        var v = d[s + 1];
        if (!v) continue;
        var y0 = y(base), y1 = y(base + v);
        var h = Math.max(y0 - y1 - (base > 0 ? 1 : 0), v > 0 ? 1 : 0);
        el('path', {
          d: barPath(x, y0 - (base > 0 ? 1 : 0) - h, bw, h, s === top ? Math.min(3, bw / 2) : 0, false),
          fill: models[s].color
        }, svg);
        base += v;
      }
      var hit = el('rect', { x: m.left + i * step, y: m.top, width: step, height: ih, 'class': 'hit' }, svg);
      hit.addEventListener('mousemove', function (evt) {
        var total = d[1] + d[2] + d[3];
        var html = '<div class="tip-head">' + fmtDate(d[0], true) + '</div>';
        if (!total) html += '<div class="tip-row"><span>Nothing ran</span></div>';
        models.forEach(function (mm, k) { if (d[k + 1]) html += tipRow(mm.color, mm.name, fmtTokens(d[k + 1])); });
        if (total && (d[1] ? 1 : 0) + (d[2] ? 1 : 0) + (d[3] ? 1 : 0) > 1) html += '<div class="tip-row tip-total"><span>Total</span><b>' + fmtTokens(total) + '</b></div>';
        showTip(evt, html);
      });
      hit.addEventListener('mouseleave', hideTip);
    });

    // Label the spike so the eye lands on it.
    var i11 = days.findIndex(function (d) { return d[0] === '2026-10-12'; });
    text(svg, m.left + i11 * step - 6, y(3.911622e6 + 0) + 4, 'Oct 11 and 12', 'note', 'end');
  }

  function drawCost(fig) {
    var plot = fig.querySelector('.chart-plot');
    plot.innerHTML = '';
    var W = plot.clientWidth;
    var narrow = W < 460;
    var labelW = narrow ? 0 : 128;
    var rowH = narrow ? 64 : 48, barH = 14, inner = 2;
    var m = { top: 4, right: 64, bottom: 24, left: labelW };
    var H = m.top + cost.length * rowH + m.bottom;
    var iw = W - m.left - m.right;
    var max = 3000;
    var x = function (v) { return m.left + (v / max) * iw; };

    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, plot);
    el('title', {}, svg).textContent = 'Yearly cost: OpenRouter is about 40 times my cost at every usage level.';

    [0, 1000, 2000, 3000].forEach(function (v) {
      el('line', { x1: x(v), x2: x(v), y1: m.top, y2: H - m.bottom, 'class': v ? 'grid' : 'axis' }, svg);
      text(svg, x(v), H - 6, v ? '$' + v / 1000 + 'k' : '$0', 'tick', v ? 'middle' : 'start');
    });

    cost.forEach(function (row, i) {
      var top = m.top + i * rowH + (narrow ? 22 : (rowH - 2 * barH - inner) / 2);
      if (narrow) text(svg, 0, m.top + i * rowH + 15, row.label + ' (' + row.tokens + ' tokens)', 'label', 'start');
      else {
        text(svg, labelW - 12, top + barH, row.label, 'label', 'end');
        text(svg, labelW - 12, top + barH + 15, row.tokens + ' tokens', 'tick', 'end');
      }
      costSeries.forEach(function (s, k) {
        var v = row[s.key];
        var by = top + k * (barH + inner);
        var w = Math.max(2, x(v) - x(0));
        el('path', { d: barPath(x(0), by, w, barH, 4, true), fill: s.color }, svg);
        text(svg, x(0) + w + 6, by + barH - 3, fmtMoney(v), 'value', 'start');
      });
      var hit = el('rect', { x: 0, y: m.top + i * rowH, width: W, height: rowH, 'class': 'hit' }, svg);
      hit.addEventListener('mousemove', function (evt) {
        showTip(evt, '<div class="tip-head">' + row.label + ', ' + row.tokens + ' tokens a year</div>' +
          costSeries.map(function (s) { return tipRow(s.color, s.name, fmtMoney(row[s.key])); }).join('') +
          '<div class="tip-row tip-total"><span>Difference</span><b>' + fmtMoney(row.hosted - row.local) + '</b></div>');
      });
      hit.addEventListener('mouseleave', hideTip);
    });
  }

  function render() {
    var a = document.getElementById('chart-daily');
    var b = document.getElementById('chart-cost');
    if (a) drawDaily(a);
    if (b) drawCost(b);
  }

  var a = document.getElementById('chart-daily');
  if (a) {
    legend(a, models);
  }
  var b = document.getElementById('chart-cost');
  if (b) {
    legend(b, costSeries);
  }
  render();
  var timer;
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(render, 100); });
})();
