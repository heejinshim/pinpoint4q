/* 2026 4Q Pin Point 판촉방안 대시보드 — data.js(window.DATA)만 읽는 정적 페이지 */
(function () {
  const D = window.DATA;
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = (v) => Math.round(v).toLocaleString('ko-KR');
  const pct = (v, d = 1) => (v == null ? '—' : (v * 100).toFixed(d) + '%');
  const SIDO_ORDER = ['대전', '세종', '충남'];
  const AGE = [['age0_9', '0–9세'], ['age10_19', '10–19세'], ['age20_29', '20–29세'], ['age30_44', '30–44세'], ['age45_59', '45–59세'], ['age60p', '60세 이상']];
  const AGE_OP = [1, 0.78, 0.6, 0.44, 0.3, 0.16];
  const bench = D.area.find((a) => a.area === '벤치마크');

  function h(tag, attrs = {}, kids = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v != null) e.setAttribute(k, v);
    }
    [].concat(kids).forEach((c) => c != null && e.append(c));
    return e;
  }
  function s(tag, attrs = {}, kids = []) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v != null) e.setAttribute(k, v);
    }
    [].concat(kids).forEach((c) => c != null && e.append(c));
    return e;
  }
  const tipEl = $('#tip');
  function tip(node, lines) {
    node.addEventListener('mousemove', (ev) => {
      tipEl.replaceChildren(...lines().map((l) => h('div', { text: l })));
      tipEl.hidden = false;
      const w = tipEl.offsetWidth;
      tipEl.style.left = Math.min(ev.clientX + 14, window.innerWidth - w - 8) + 'px';
      tipEl.style.top = ev.clientY + 14 + 'px';
    });
    node.addEventListener('mouseleave', () => { tipEl.hidden = true; });
  }
  function tabs(el, items, cur, onPick) {
    el.replaceChildren(...items.map(([k, label]) => h('button', { type: 'button', 'aria-pressed': String(k === cur), text: label, onclick: () => onPick(k) })));
  }
  function ageBar(r) {
    const rest = Math.max(0, 1 - AGE.reduce((x, [k]) => x + (k === 'age10_19' ? 0 : r[k] || 0), 0));
    const vals = AGE.map(([k]) => (r[k] != null ? r[k] : rest));
    const bar = h('div', { class: 'bar' }, vals.map((v, i) => h('span', { style: `width:${(v * 100).toFixed(2)}%;opacity:${AGE_OP[i]}` })));
    tip(bar, () => [`${r.dong || r.sgg} · 인구 ${fmt(r.pop)}명`, ...AGE.map(([, n], i) => `${n} ${pct(vals[i])}`)]);
    return bar;
  }

  /* ---------- 머리말 ---------- */
  const page = document.body.dataset.page;
  document.querySelectorAll('.chapnav a').forEach((a) => a.dataset.key === page && a.setAttribute('aria-current', 'page'));
  (function kpis() {
    if (!$('#kpis')) return;
    const pop = D.sgg.reduce((x, r) => x + r.pop, 0);
    const reg = D.area.filter((a) => a.area !== '벤치마크').reduce((x, a) => x + (a.reg_sido_total || 0), 0);
    const ev = (y, m) => D.ev.filter((r) => r.area === '대전충남 소속' && r.year === y && (!m || r.maker === m)).reduce((x, r) => x + r.n, 0);
    const ms = (y) => ev(y, '현대') / ev(y);
    const t = (label, big, sub, cls) => h('div', { class: 'tile' }, [h('span', { text: label }), h('b', { class: 'big ' + (cls || ''), text: big }), h('span', { text: sub })]);
    $('#kpis').replaceChildren(
      t('3개 시도 인구', `${(pop / 10000).toFixed(1)}만 명`, `시군구 ${D.sgg.length}곳 · 읍면동 ${D.dong.length}곳`),
      t('2025년 신규 등록', `${fmt(reg)}대`, '대전+세종+충남 전체'),
      t('전기차 등록 2026 누적', `${fmt(ev('2026 누적'))}대`, `2025년 연간 대비 +${((ev('2026 누적') / ev('2025') - 1) * 100).toFixed(0)}%`),
      t('현대 전기차 점유율 2026', pct(ms('2026 누적')), `2024년 ${pct(ms('2024'))}에서 하락`, 'bad'),
    );
  })();

  /* ---------- 지역 드릴다운 ---------- */
  const st = { sido: null, sgg: null, dong: null };
  if ($('#drill')) $('#age-legend').replaceChildren(h('span', { text: '연령 구성:' }), ...AGE.map(([, n], i) => h('span', {}, [h('i', { style: `opacity:${AGE_OP[i]}` }), n])));

  function drill(next) {
    Object.assign(st, next);
    const sgr = st.sgg ? D.sgg.find((r) => r.sgg === st.sgg) : null;
    // 빵부스러기
    const crumbs = [h('button', { type: 'button', text: '전체', onclick: () => drill({ sido: null, sgg: null, dong: null }) })];
    if (st.sido) crumbs.push('›', h('button', { type: 'button', text: st.sido, onclick: () => drill({ sgg: null, dong: null }) }));
    if (st.sgg) crumbs.push('›', h('b', { text: st.sgg }));
    if (st.dong) crumbs.push('›', h('b', { text: st.dong }));
    $('#crumbs').replaceChildren(...crumbs);
    // 시도 카드
    $('#sido-cards').replaceChildren(...[null, ...SIDO_ORDER].map((sd) => {
      const rs = D.sgg.filter((r) => !sd || r.sido === sd);
      const p = rs.reduce((x, r) => x + r.pop, 0);
      return h('button', { type: 'button', 'aria-pressed': String(st.sido === sd && !st.sgg), onclick: () => drill({ sido: sd, sgg: null, dong: null }) }, [
        h('b', { text: sd || '전체' }), h('small', { text: `인구 ${(p / 10000).toFixed(1)}만 명` }), h('small', { text: `시군구 ${rs.length}곳 · 차량 상세 ${rs.filter((r) => r.reg != null).length}곳` }),
      ]);
    }));
    // 상세 패널
    const det = $('#drill-detail');
    det.replaceChildren();
    if (sgr) {
      const dg = st.dong ? D.dong.find((r) => r.sgg === st.sgg && r.dong === st.dong) : null;
      const r = dg || sgr;
      det.append(h('div', { class: 'detail' }, [
        h('h3', { text: `${r.sido} ${r.sgg}${dg ? ' ' + (dg.gu ? dg.gu.replace('천안시 ', '') + ' ' : '') + dg.dong : ''} · 인구 ${fmt(r.pop)}명` }),
        h('p', { text: `0–9세 ${pct(r.age0_9)} · 20–29세 ${pct(r.age20_29)} · 30–44세 ${pct(r.age30_44)} · 45–59세 ${pct(r.age45_59)} · 60세 이상 ${pct(r.age60p)} · 영패밀리 지수 ${pct(r.family_idx)}` }),
        dg ? h('p', { text: `소속 ${sgr.sgg} 평균 대비: 0–9세 ${pct(sgr.age0_9)}, 30–44세 ${pct(sgr.age30_44)}, 60세 이상 ${pct(sgr.age60p)}` })
          : h('p', { text: sgr.reg != null ? `2025년 신규 등록 ${fmt(sgr.reg)}대(천명당 ${sgr.per1000}대) · 현대 ${pct(sgr.hyundai)} · HEV ${pct(sgr.hev)} · EV·수소 ${pct(sgr.ev)} · 수입 ${pct(sgr.imports)} · 소형상용 ${pct(sgr.truck)}` : '차량 상세 자료 없음 — 인구 구조로 추정한 타겟입니다' }),
        h('p', { class: 'target', text: `타겟 · 추천 차종: ${sgr.target || '—'}` }),
      ]));
    }
    // 목록
    const list = $('#drill-list');
    if (st.sgg) {
      const rows = D.dong.filter((r) => r.sgg === st.sgg).sort((a, b) => b.pop - a.pop);
      const hi = (v, ref) => (v != null && v > ref ? 'num hi' : 'num');
      list.replaceChildren(
        h('div', { class: 'row head' }, ['읍면동', '연령 구성', '인구', '0–9세', '30–44세', '60세+', '영패밀리'].map((t, i) => h('div', { class: i > 1 ? 'num' : '', text: t }))),
        ...rows.map((r) => h('div', { class: 'row click' + (r.dong === st.dong ? ' on' : ''), onclick: () => drill({ dong: r.dong === st.dong ? null : r.dong }) }, [
          h('div', {}, [r.dong, r.gu ? h('span', { class: 'sub', text: r.gu.replace('천안시 ', '') }) : null]), ageBar(r),
          h('div', { class: 'num', text: fmt(r.pop) }), h('div', { class: hi(r.age0_9, sgr.age0_9), text: pct(r.age0_9) }),
          h('div', { class: hi(r.age30_44, sgr.age30_44), text: pct(r.age30_44) }), h('div', { class: hi(r.age60p, sgr.age60p), text: pct(r.age60p) }),
          h('div', { class: hi(r.family_idx, sgr.family_idx), text: pct(r.family_idx) }),
        ])),
        h('div', { class: 'row bench' }, [h('div', { text: `${st.sgg} 평균` }), h('div'), h('div', { class: 'num', text: fmt(sgr.pop) }), h('div', { class: 'num', text: pct(sgr.age0_9) }), h('div', { class: 'num', text: pct(sgr.age30_44) }), h('div', { class: 'num', text: pct(sgr.age60p) }), h('div', { class: 'num', text: pct(sgr.family_idx) })]),
      );
    } else {
      const rows = D.sgg.filter((r) => !st.sido || r.sido === st.sido).sort((a, b) => b.pop - a.pop);
      const hi = (v, ref) => (v != null && v > ref ? 'num hi' : 'num');
      list.replaceChildren(
        h('div', { class: 'row head' }, ['시군구', '연령 구성', '인구', 'HEV', 'EV·수소', '수입차', '천명당 등록'].map((t, i) => h('div', { class: i > 1 ? 'num' : '', text: t }))),
        ...rows.map((r) => h('div', { class: 'row click', onclick: () => drill({ sido: r.sido, sgg: r.sgg, dong: null }) }, [
          h('div', {}, [r.sgg, st.sido ? null : h('span', { class: 'sub', text: r.sido })]), ageBar(r), h('div', { class: 'num', text: fmt(r.pop) }),
          h('div', { class: hi(r.hev, bench.hev), text: pct(r.hev) }), h('div', { class: hi(r.ev, bench.ev), text: pct(r.ev) }),
          h('div', { class: hi(r.imports, bench.imports), text: pct(r.imports) }), h('div', { class: 'num', text: r.per1000 == null ? '—' : r.per1000.toFixed(1) }),
        ])),
        h('div', { class: 'row bench' }, [h('div', { text: '전국 벤치마크' }), h('div'), h('div'), h('div', { class: 'num', text: pct(bench.hev) }), h('div', { class: 'num', text: pct(bench.ev) }), h('div', { class: 'num', text: pct(bench.imports) }), h('div')]),
      );
    }
  }
  if ($('#drill')) {
    let start = {};
    try { start = JSON.parse(sessionStorage.getItem('pp-drill') || '{}'); sessionStorage.removeItem('pp-drill'); } catch (e) { start = {}; }
    drill(start);
    if (start.sgg) $('#drill').scrollIntoView();
  }

  /* ---------- 동 단위 Pin Point ---------- */
  const PIN = {
    family: { label: '영패밀리(0–9세 + 30–44세)', note: 'SUV·MPV·HEV 가족차 판촉 후보. 지수 = 0–9세 비중 + 30–44세 비중.', val: (r) => r.family_idx, txt: (r) => `${pct(r.family_idx)} (0–9세 ${pct(r.age0_9)})` },
    young: { label: '2030(20–29세 비중)', note: '첫차·소형SUV 판촉 후보. 대학가가 많이 포함되므로 직장인 밀집 지역(둔산·불당 등)과 함께 보세요.', val: (r) => r.age20_29, txt: (r) => pct(r.age20_29) },
    senior: { label: '60세 이상 밀집', note: '60세+ 비중 35% 이상인 읍면동 중 60세+ 인원이 많은 순. 포터·캐스퍼·그랜저 순회 판촉 후보.', val: (r) => r.n60p, txt: (r) => `${fmt(r.n60p)}명 (${pct(r.age60p)})` },
  };
  let pinKey = 'family';
  function pin() {
    tabs($('#pin-tabs'), Object.entries(PIN).map(([k, v]) => [k, v.label]), pinKey, (k) => { pinKey = k; pin(); });
    const P = PIN[pinKey], rows = D.pin[pinKey];
    $('#pin-note').textContent = P.note;
    const W = 760, rh = 26, L = 190, R = 170, H = rows.length * rh + 8, max = Math.max(...rows.map(P.val));
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': P.label });
    rows.forEach((r, i) => {
      const y = i * rh, w = (P.val(r) / max) * (W - L - R);
      const g = s('g', { class: 'click', onclick: () => showDongPlan(r, pinKey) }, [
        s('rect', { class: 'hit', x: 0, y, width: W, height: rh - 2, fill: 'transparent' }),
        s('text', { x: 0, y: y + 17, text: `${r.sgg} ${r.dong}` }),
        s('text', { x: 120, y: y + 17, class: 'muted', text: r.sido }),
        s('rect', { x: L, y: y + 5, width: Math.max(1, w), height: rh - 12, rx: 2, fill: i < 3 ? 'var(--accent)' : 'var(--grey)' }),
        s('text', { x: L + w + 6, y: y + 17, text: P.txt(r) }),
      ]);
      tip(g, () => [`${r.sido} ${r.sgg} ${r.dong} · 인구 ${fmt(r.pop)}명`, `0–9세 ${pct(r.age0_9)} · 20–29세 ${pct(r.age20_29)} · 30–44세 ${pct(r.age30_44)} · 60세+ ${pct(r.age60p)}`]);
      svg.append(g);
    });
    $('#pin-chart').replaceChildren(svg);
  }
  if ($('#pin')) pin();

  /* ---------- 차급 맞대결 ---------- */
  let h2hArea = '세종', h2hSeg = null;
  function h2h() {
    const areas = [...new Set(D.h2h.map((r) => r.area))], segs = [...new Set(D.h2h.map((r) => r.segment))];
    tabs($('#h2h-tabs'), areas.map((a) => [a, a]), h2hArea, (a) => { h2hArea = a; h2hSeg = null; h2h(); });
    const inA = (a, sg) => D.h2h.filter((r) => r.area === a && r.segment === sg).sort((p, q) => p.order - q.order);
    const hs = (a, sg) => { const rs = inA(a, sg), t = rs.reduce((x, r) => x + r.n, 0); return rs[0].n / t; };
    const W = 760, rh = 40, L = 100, R = 80, bw = W - L - R, H = segs.length * rh + 6;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '차급별 현대 vs 경쟁 모델 비중' });
    segs.forEach((sg, i) => {
      const rs = inA(h2hArea, sg), t = rs.reduce((x, r) => x + r.n, 0), y = i * rh + 6, b = hs('벤치마크', sg), gap = hs(h2hArea, sg) - b;
      const g = s('g', { class: 'click', onclick: () => { h2hSeg = h2hSeg === sg ? null : sg; h2h(); } }, [
        s('rect', { class: 'hit', x: 0, y: y - 4, width: W, height: rh - 2, fill: sg === h2hSeg ? 'var(--accent-soft)' : 'transparent' }),
        s('text', { x: 0, y: y + 18, text: sg }),
      ]);
      let acc = 0;
      rs.forEach((r) => {
        const x = L + (acc / t) * bw, w = (r.n / t) * bw; acc += r.n;
        const rect = s('rect', { x, y: y + 2, width: Math.max(0, w - 1), height: rh - 14, rx: 2, fill: r.order === 0 ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': r.order === 0 ? 1 : r.order === 1 ? 0.75 : 0.4 });
        tip(rect, () => [`${h2hArea} ${sg}`, `${r.brand} ${fmt(r.n)}대 (${pct(r.n / t, 0)})`]);
        g.append(rect);
        if (w > 82) g.append(s('text', { x: x + 6, y: y + 18, fill: r.order === 0 ? '#fff' : null, style: 'pointer-events:none', text: `${r.brand.split(' ').pop()} ${pct(r.n / t, 0)}` }));
      });
      if (h2hArea !== '벤치마크') {
        const bx = L + b * bw;
        g.append(s('path', { d: `M${bx - 5},${y - 5} L${bx + 5},${y - 5} L${bx},${y + 1} Z`, fill: 'var(--fg)' }));
        g.append(s('text', { x: W, y: y + 18, 'text-anchor': 'end', fill: gap < -0.005 ? 'var(--bad)' : 'var(--good)', text: `${gap >= 0 ? '+' : '−'}${Math.abs(gap * 100).toFixed(1)}%p` }));
      }
      svg.append(g);
    });
    $('#h2h-chart').replaceChildren(svg);
    const det = $('#h2h-detail');
    det.replaceChildren();
    if (h2hSeg) {
      const rs = inA(h2hArea, h2hSeg), t = rs.reduce((x, r) => x + r.n, 0);
      det.append(h('div', { class: 'detail' }, [h('h3', { text: `${h2hArea} · ${h2hSeg} · 합계 ${fmt(t)}대` }), h('p', { text: rs.map((r) => `${r.brand} ${fmt(r.n)}대(${pct(r.n / t, 0)})`).join('  ·  ') })]));
    }
  }
  if ($('#h2h')) h2h();

  /* ---------- 전기차 추이 ---------- */
  let evArea = '대전충남 소속', evYear = null;
  function ev() {
    const areas = ['대전충남 소속', '전국'], years = [...new Set(D.ev.map((r) => r.year))], makers = [...new Set(D.ev.map((r) => r.maker))];
    tabs($('#ev-tabs'), areas.map((a) => [a, a]), evArea, (a) => { evArea = a; evYear = null; ev(); });
    const rows = D.ev.filter((r) => r.area === evArea), tot = (y) => rows.filter((r) => r.year === y).reduce((x, r) => x + r.n, 0);
    const max = Math.max(...years.map(tot)), W = 760, H = 320, base = 280, ph = 220, slot = W / years.length, bw = 110;
    const op = [1, 0.85, 0.55, 0.35, 0.2];
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '전기차 등록 추이와 현대 점유율' }, [s('line', { x1: 0, x2: W, y1: base, y2: base, stroke: 'var(--line)' })]);
    years.forEach((y, i) => {
      const cx = slot * i + (slot - bw) / 2 - 30, t = tot(y);
      const g = s('g', { class: 'click', onclick: () => { evYear = evYear === y ? null : y; ev(); } }, [s('rect', { class: 'hit', x: cx - 10, y: 0, width: bw + 120, height: H, fill: y === evYear ? 'var(--accent-soft)' : 'transparent' })]);
      let acc = 0;
      makers.forEach((m, k) => {
        const r = rows.find((q) => q.year === y && q.maker === m), hgt = (r.n / max) * ph;
        const rect = s('rect', { x: cx, y: base - ((acc + r.n) / max) * ph, width: bw, height: Math.max(0, hgt), fill: k === 0 ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': op[k] });
        tip(rect, () => [`${evArea} ${y}`, `${m} ${fmt(r.n)}대 (${pct(r.n / t)})`]);
        g.append(rect); acc += r.n;
      });
      const hy = rows.find((q) => q.year === y && q.maker === makers[0]).n;
      g.append(s('text', { x: cx + bw / 2, y: base - (t / max) * ph - 8, 'text-anchor': 'middle', text: `${fmt(t)}대` }));
      g.append(s('text', { x: cx + bw + 8, y: base - ((hy / max) * ph) / 2 + 4, fill: 'var(--accent)', 'font-weight': 600, text: `현대 ${pct(hy / t)}` }));
      g.append(s('text', { x: cx + bw / 2, y: base + 20, 'text-anchor': 'middle', class: 'muted', text: y }));
      svg.append(g);
    });
    const lg = s('g');
    makers.forEach((m, k) => { lg.append(s('rect', { x: W - 340 + k * 70, y: 0, width: 10, height: 10, fill: k === 0 ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': op[k] })); lg.append(s('text', { x: W - 326 + k * 70, y: 9, class: 'muted', text: m })); });
    svg.append(lg);
    $('#ev-chart').replaceChildren(svg);
    const det = $('#ev-detail');
    det.replaceChildren();
    if (evYear) {
      const rs = rows.filter((r) => r.year === evYear), t = tot(evYear);
      det.append(h('div', { class: 'detail' }, [h('h3', { text: `${evArea} · ${evYear} · 합계 ${fmt(t)}대` }), h('p', { text: rs.map((r) => `${r.maker} ${fmt(r.n)}대(${pct(r.n / t)})`).join('  ·  ') })]));
    }
  }
  if ($('#ev')) ev();


  /* ---------- 차체 유형 아이콘 (브랜드 디자인이 아닌 일반 실루엣) ---------- */
  const CAR = {
    sedan: 'M8 40 L16 30 Q22 22 40 21 L58 14 Q66 11 80 12 L92 14 Q100 16 106 24 L114 30 Q118 32 118 38 L118 44 L8 44 Z',
    suv: 'M8 42 L10 26 Q12 18 24 17 L40 10 Q46 8 56 8 L96 8 Q104 8 108 16 L114 28 Q118 30 118 36 L118 44 L8 44 Z',
    suv_s: 'M10 42 L12 28 Q14 20 26 19 L42 12 Q48 10 58 10 L90 10 Q98 10 102 18 L110 28 Q114 30 114 36 L114 44 L10 44 Z',
    mpv: 'M8 42 L8 22 Q8 12 20 10 L30 6 Q36 4 46 4 L104 4 Q114 4 116 14 L118 36 L118 44 L8 44 Z',
    truck: 'M6 42 L6 18 Q6 10 14 10 L36 10 Q42 10 42 18 L42 26 L118 26 L118 44 L6 44 Z',
    mini: 'M16 42 L18 22 Q20 10 34 8 L78 8 Q92 8 96 20 L102 32 Q106 34 106 38 L106 44 L16 44 Z',
  };
  function carIcon(body, accent) {
    const col = accent ? 'var(--accent)' : 'var(--grey)';
    const wheelsX = body === 'mini' ? [34, 88] : body === 'truck' ? [24, 98] : [30, 96];
    return s('svg', { viewBox: '0 0 126 56', class: 'car-ico', 'aria-hidden': 'true' }, [
      s('path', { d: CAR[body] || CAR.sedan, fill: col, 'fill-opacity': accent ? 1 : 0.7 }),
      ...wheelsX.map((x) => s('circle', { cx: x, cy: 45, r: 8, fill: 'var(--fg)' })),
      ...wheelsX.map((x) => s('circle', { cx: x, cy: 45, r: 3, fill: 'var(--panel)' })),
    ]);
  }


  /* ---------- 표지: 지역 클릭 시 인사이트 팝업 (정장 차림 남성 일러스트) ---------- */
  const josa = (w) => { const c = w.trim().slice(-1).charCodeAt(0); if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 ? '을' : '를'; return '를'; };
  function advisorSvg() {
    const sv = s('svg', { viewBox: '0 0 140 210', class: 'advisor-man', 'aria-hidden': 'true' }, [
      s('ellipse', { cx: 70, cy: 204, rx: 38, ry: 5, fill: 'rgba(0,0,0,.12)' }),
      s('rect', { x: 50, y: 150, width: 17, height: 48, rx: 4, fill: '#0b1f3f' }), s('rect', { x: 73, y: 150, width: 17, height: 48, rx: 4, fill: '#0b1f3f' }),
      s('path', { d: 'M46 198 h24 v6 h-26 z M72 198 h24 v6 h-26 z', fill: '#1b1b1b' }),
      s('path', { d: 'M40 100 Q42 88 56 86 L84 86 Q98 88 100 100 L102 156 L38 156 Z', fill: '#002c5f' }),
      s('path', { d: 'M38 104 Q30 128 34 150 Q36 156 42 154 L46 112 Z', fill: '#002c5f' }),
      s('circle', { cx: 39, cy: 154, r: 6, fill: '#f2c9a5' }),
      s('path', { d: 'M98 98 Q112 84 118 64 L127 68 Q122 92 104 110 Z', fill: '#002c5f', class: 'advisor-arm' }),
      s('circle', { cx: 123, cy: 60, r: 7, fill: '#f2c9a5', class: 'advisor-arm' }),
      s('path', { d: 'M58 86 L70 112 L82 86 Z', fill: '#ffffff' }),
      s('path', { d: 'M67 92 L73 92 L75 98 L72 120 L70 124 L68 120 L65 98 Z', fill: '#c8893a' }),
      s('path', { d: 'M56 86 L66 112 L60 96 Z M84 86 L74 112 L80 96 Z', fill: '#001a3d' }),
      s('rect', { x: 63, y: 74, width: 14, height: 14, rx: 4, fill: '#eab894' }),
      s('circle', { cx: 70, cy: 58, r: 22, fill: '#f2c9a5' }),
      s('path', { d: 'M48 56 Q47 34 70 33 Q92 33 92 54 Q86 44 74 44 Q60 45 52 50 Z', fill: '#2a1d16' }),
      s('circle', { cx: 62, cy: 59, r: 2.4, fill: '#2a1d16' }), s('circle', { cx: 78, cy: 59, r: 2.4, fill: '#2a1d16' }),
      s('path', { d: 'M62 67 Q70 74 78 67', fill: 'none', stroke: '#8a4b33', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
      s('circle', { cx: 57, cy: 66, r: 3, fill: '#f0a58a', opacity: 0.5 }), s('circle', { cx: 83, cy: 66, r: 3, fill: '#f0a58a', opacity: 0.5 }),
    ]);
    [[18, 30], [124, 22], [12, 92]].forEach(([x, y], i) => sv.append(s('path', { d: `M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`, fill: '#e2b66f', class: `spark sp${i}` })));
    return sv;
  }
  function showAdvisor(sgg) {
    const box = $('#mapsum'); if (!box) return;
    const ins = (D.insight || []).find((r) => r.sgg === sgg); if (!ins) return;
    const sd = (D.sgg.find((r) => r.sgg === sgg) || {}).sido, pr = (D.focus.find((f) => f.sgg === sgg) || {}).priority || '지키기';
    const old = box.querySelector('.advisor'); if (old) old.remove();
    const close = () => { const el = box.querySelector('.advisor'); if (el) el.remove(); };
    const pop = h('div', { class: 'advisor', role: 'dialog', 'aria-label': `${sgg} 판촉 인사이트` }, [
      advisorSvg(),
      h('div', { class: 'advisor-bubble' }, [
        h('button', { type: 'button', class: 'advisor-x', 'aria-label': '닫기', text: '×', onclick: close }),
        h('p', { class: 'chap-no', text: `${sd} ${sgg} · ${pr}` }),
        h('p', { class: 'advisor-say' }, [h('b', { text: ins.car }), `${josa(ins.car)} `, h('b', { text: ins.customer }), ' 대상으로 판촉하는 데 집중해 보면 어떨까요?']),
        h('ul', {}, [
          h('li', {}, [h('span', { text: '근거' }), ins.fact]),
          h('li', {}, [h('span', { text: '추천 현장' }), ins.place]),
          h('li', {}, [h('span', { text: '금융' }), ins.finance]),
        ]),
        h('p', { class: 'links' }, [h('a', { href: 'ch3-pinpoint.html', text: '동 단위 판촉방안 →' }), ' ', h('a', { href: 'ch2-region.html', text: '동별 인구 보기 →', onclick: () => { try { sessionStorage.setItem('pp-drill', JSON.stringify({ sido: sd, sgg })); } catch (e) { /* 저장소 없음 */ } } })]),
      ]),
    ]);
    box.append(pop);
    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
  }


  /* ---------- 3장: 동을 누르면 그 동의 판촉방안 팝업 ---------- */
  const DONG_PLAY = {
    family: { car: '싼타페 HEV·스타리아 HEV', customer: '영유아 자녀를 둔 3040 가구', fin: '싼타페 HEV 60개월 무이자(이자 약 580만원 절감) · 서울에서 이주한 다자녀 가구 금리 1.9% · 스타리아 전용카드 50만원', how: ['아파트 단지 주말 순회 전시와 키즈존', '어린이집·초등학교 하원 시간대 생활권 홍보', '카시트·유모차 적재 시연, 쏘렌토·카니발 비교 시승'] },
    young: { car: '아반떼·코나 HEV', customer: '첫 차를 고르는 2030 직장인·사회초년생', fin: '아반떼 퍼스트 무브 월 14만원~(12.31 출고분까지) · 코나 EV 부담 Down 월 16만원', how: ['퇴근 시간 팝업 시승(업무지구·대학가 인근)', 'SNS·지역 커뮤니티 타깃 광고와 QR 사전예약', '월 납입금 현장 계산으로 첫차 부담 낮추기'] },
    seniorCity: { car: '그랜저 HEV·쏘나타', customer: '그랜저·쏘나타를 오래 탄 60대 재구매 고객', fin: '쏘나타 전용카드 50만원 · 택시는 EV 택시 동반자 2.7~2.9% · 소상공인은 포터 EV 월 10만원', how: ['장기 보유 고객 대차 DM·전화', '전통시장·경로당 생활권 상담 부스', '트레이드인 감정으로 기존 차 처분 부담 덜기'] },
    seniorRural: { car: '포터 EV·캐스퍼', customer: '60대 이상 농업·자영업 생업 운전자', fin: '포터 EV 부담 Down 농업인 월 15만원·소상공인 월 10만원 · 노후차 교체 상담', how: ['5일장·농협 하나로마트 연계 순회 전시·시승', '읍·면사무소, 농협 금융과 연계한 할부 상담', '노후 1톤 트럭 교체·폐차 절차 안내'] },
  };
  function showDongPlan(r, key) {
    const old = document.querySelector('.dong-modal'); if (old) old.remove();
    const rural = /[읍면]$/.test(r.dong);
    const playKey = key === 'senior' ? (rural ? 'seniorRural' : 'seniorCity') : key;
    const ins = (D.insight || []).find((q) => q.sgg === r.sgg);
    const P = Object.assign({}, DONG_PLAY[playKey]);
    if (ins && ins.type === key) { P.car = ins.car; P.customer = ins.customer; P.fin = ins.finance; }
    const sg = D.sgg.find((q) => q.sgg === r.sgg) || {};
    const full = D.dong.find((q) => q.sgg === r.sgg && q.dong === r.dong) || r;
    const ratio = (a, b) => (b ? `${(a / b).toFixed(1)}배` : '');
    const facts = key === 'family'
      ? `0–9세 ${pct(full.age0_9)} (${r.sgg} 평균의 ${ratio(full.age0_9, sg.age0_9)}) · 30–44세 ${pct(full.age30_44)} · 영패밀리 지수 ${pct(full.family_idx)}`
      : key === 'young' ? `20–29세 ${pct(full.age20_29)} (${r.sgg} 평균의 ${ratio(full.age20_29, sg.age20_29)}) · 30–44세 ${pct(full.age30_44)}`
        : `60세 이상 ${pct(full.age60p)} · 약 ${fmt(full.age60p * full.pop)}명 (${r.sgg} 평균 ${pct(sg.age60p)})`;
    const label = { family: '영패밀리 동', young: '2030 동', senior: '60세 이상 밀집 동' }[key];
    const close = () => { modal.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const modal = h('div', { class: 'dong-modal', onclick: (e) => { if (e.target === modal) close(); } }, [
      h('div', { class: 'advisor in-modal', role: 'dialog', 'aria-label': `${r.dong} 판촉방안` }, [
        advisorSvg(),
        h('div', { class: 'advisor-bubble' }, [
          h('button', { type: 'button', class: 'advisor-x', 'aria-label': '닫기', text: '×', onclick: close }),
          h('p', { class: 'chap-no', text: `${r.sido} ${r.sgg} ${r.dong} · ${label} · 인구 ${fmt(full.pop)}명` }),
          h('p', { class: 'advisor-say' }, [h('b', { text: r.dong }), '에서는 ', h('b', { text: P.car }), `${josa(P.car)} `, h('b', { text: P.customer }), ' 대상으로 판촉해 보면 어떨까요?']),
          h('ul', {}, [
            h('li', {}, [h('span', { text: '근거' }), facts]),
            h('li', {}, [h('span', { text: '금융' }), P.fin]),
            h('li', {}, [h('span', { text: '현장 판촉' }), P.how.join(' · ')]),
          ]),
          h('p', { class: 'links' }, [
            h('a', { href: 'ch2-region.html', text: '이 동 인구 구성 보기 →', onclick: () => { try { sessionStorage.setItem('pp-drill', JSON.stringify({ sido: r.sido, sgg: r.sgg, dong: r.dong })); } catch (e) { /* 저장소 없음 */ } } }), ' ',
            h('a', { href: 'ch6-plan.html#finmatch', text: '금융 매칭표 →' }),
          ]),
        ]),
      ]),
    ]);
    document.body.append(modal);
    document.addEventListener('keydown', onKey);
    const btn = modal.querySelector('.advisor-x'); if (btn) btn.focus();
  }

  /* ---------- 표지: 개략 지도 + 차종 Top 3 ---------- */
  const TILE = [ // [시군구, 열, 행] — 실제 경계가 아닌 위치 개략
    ['태안군', 0, 0], ['서산시', 1, 0], ['당진시', 2, 0], ['아산시', 3, 0], ['천안시', 4, 0],
    ['홍성군', 1, 1], ['예산군', 2, 1], ['공주시', 3, 1], ['세종시', 4, 1],
    ['보령시', 1, 2], ['청양군', 2, 2], ['부여군', 3, 2], ['유성구', 5, 2], ['대덕구', 6, 2],
    ['서천군', 2, 3], ['논산시', 3, 3], ['계룡시', 4, 3], ['서구', 5, 3], ['동구', 6, 3],
    ['중구', 5, 4], ['금산군', 6, 4],
  ];
  const PRI = { '1순위': 1, '2순위': 0.6, '3순위': 0.35, '지키기': 0 };
  let mapSel = '세종시';
  const finOf = (name) => (/싼타페|팰리세이드/.test(name) ? '60개월 무이자' : /아반떼/.test(name) ? '퍼스트 무브 월 14만~' : /스타리아|쏘나타/.test(name) ? '전용카드 50만원' : /포터 EV/.test(name) ? '월 10만원(소상공인)' : /코나 EV/.test(name) ? 'EV 부담 Down 월 16만' : /아이오닉/.test(name) ? 'EV 부담 Down 월 20만' : /그랜저/.test(name) ? '트레이드인·대차 상담' : /포터/.test(name) ? '포터 EV 전환 상담' : null);
  function mapsum() {
    const W = 520, cw = 70, ch = 64, x0 = 14, y0 = 30, H = y0 + 5 * ch + 50;
    const pri = (sgg) => (D.focus.find((f) => f.sgg === sgg) || {}).priority || '지키기';
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '대전·세종·충남 시군구 개략 지도' });
    const sidoOf = (sgg) => (D.sgg.find((r) => r.sgg === sgg) || {}).sido;
    TILE.forEach(([sgg, c, r]) => {
      const x = x0 + c * cw, y = y0 + r * ch, p = pri(sgg), on = sgg === mapSel, sd = sidoOf(sgg);
      const g = s('g', { class: 'click tile-g', onclick: () => { mapSel = sgg; mapsum(); showAdvisor(sgg); } }, [
        s('rect', { x: x + 2, y: y + 2, width: cw - 4, height: ch - 4, rx: 8, fill: PRI[p] ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': PRI[p] ? PRI[p] : 0.25, stroke: on ? 'var(--fg)' : sd === '충남' ? 'transparent' : 'var(--accent)', 'stroke-width': on ? 3 : 1.5, 'stroke-dasharray': sd === '충남' || on ? null : '4 3' }),
        s('text', { x: x + cw / 2, y: y + ch / 2 + 1, 'text-anchor': 'middle', fill: PRI[p] >= 0.6 ? '#fff' : null, 'font-weight': on ? 700 : 400, style: 'pointer-events:none', text: sgg.replace(/(시|군)$/, (m) => (sgg.length > 2 ? '' : m)) }),
        s('text', { x: x + cw / 2, y: y + ch / 2 + 16, 'text-anchor': 'middle', 'font-size': 10, fill: PRI[p] >= 0.6 ? '#fff' : 'var(--muted)', style: 'pointer-events:none', text: p }),
      ]);
      tip(g, () => [`${sd} ${sgg} · ${p}`, `인구 ${fmt((D.sgg.find((q) => q.sgg === sgg) || {}).pop || 0)}명`]);
      svg.append(g);
    });
    svg.append(s('text', { x: x0 + 0.2 * cw, y: y0 - 10, class: 'muted', text: '충남' }));
    svg.append(s('text', { x: x0 + 5 * cw + 6, y: y0 + ch + 36, class: 'muted', text: '← 세종' }));
    svg.append(s('text', { x: x0 + 7 * cw - 2, y: y0 + 2 * ch - 8, 'text-anchor': 'end', class: 'muted', text: '대전 ↓' }));
    const lg = s('g', {}, ['1순위', '2순위', '3순위', '지키기'].map((p, i) => s('g', {}, [
      s('rect', { x: x0 + i * 92, y: H - 22, width: 12, height: 12, rx: 3, fill: PRI[p] ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': PRI[p] || 0.25 }),
      s('text', { x: x0 + 18 + i * 92, y: H - 12, class: 'muted', text: p === '지키기' ? '지키기(대차)' : p + ' 집중' }),
    ])));
    svg.append(lg);
    $('#map').replaceChildren(svg);

    // 오른쪽 패널
    const sd = sidoOf(mapSel), area = D.sgg.find((r) => r.sgg === mapSel);
    const top = D.top10.filter((r) => r.area === sd).sort((a, b) => a.rank - b.rank);
    const foc = D.focus.filter((f) => f.sgg === mapSel);
    const focusNames = foc.map((f) => f.focus);
    const card = (r) => h('div', { class: 'mcard' + (r.maker === '현대' ? ' hy' : '') }, [
      h('span', { class: 'rank', text: r.rank }), carIcon(r.body, r.maker === '현대'),
      h('b', { text: `${r.maker} ${r.model}` }), h('span', { class: 'share', text: `${pct(r.share)} · ${fmt(r.n)}대` }),
      h('span', { class: 'tag ' + (r.maker === '현대' ? 'tag-hy' : 'tag-cp'), text: r.maker === '현대' ? '현대' : '경쟁' }),
    ]);
    const hyBest = top.find((r) => r.maker === '현대');
    $('#map-panel').replaceChildren(...[
      h('p', { class: 'chap-no', text: `${sd} ${mapSel} · ${foc[0] ? foc[0].priority : '지키기'}` }),
      h('h3', { text: area && area.target ? area.target : mapSel }),
      h('p', { class: 'sub-h', text: `많이 팔린 차 Top 3 — ${sd}${sd === '충남' ? '(계룡·공주·금산)' : ''} 2025년 신규 등록 비중` }),
      h('div', { class: 'mcards' }, top.slice(0, 3).map(card)),
      hyBest && hyBest.rank > 3 ? h('p', { class: 'note', text: `현대 최상위는 ${hyBest.rank}위 ${hyBest.model}(${pct(hyBest.share)})입니다. Top 3가 모두 경쟁 모델입니다.` }) : null,
      h('p', { class: 'sub-h', text: '우리가 판촉해야 할 차' }),
      h('div', { class: 'mcards focus' }, foc.map((f) => h('div', { class: 'mcard push' }, [
        h('span', { class: 'badge', text: '판촉 집중' }), carIcon(f.body, true), h('b', { text: `현대 ${f.focus}` }), h('span', { class: 'share', text: `vs ${f.vs}` }),
        finOf(f.focus) ? h('a', { class: 'fin-tag', href: 'ch6-plan.html#finance', text: finOf(f.focus) }) : null,
      ]))),
      h('p', { class: 'links' }, [
        h('a', { href: 'ch3-pinpoint.html', text: '동 단위 판촉방안 →' }), ' ',
        h('a', { href: 'ch2-region.html', text: '이 지역 인구 구성 →', onclick: () => { try { sessionStorage.setItem('pp-drill', JSON.stringify({ sido: sd, sgg: mapSel })); } catch (e) { /* 저장소 없음 */ } } }),
      ]),
    ].filter(Boolean));
  }
  if ($('#mapsum')) mapsum();

  /* ---------- 1장: 연말 판매 패턴 ---------- */
  const TAX_EVENTS = [ // 개별소비세 인하 종료(예정) 직전 달
    { ym: '2015-12', label: '개소세 인하 종료 예정 직전' },
    { ym: '2016-06', label: '연장된 인하 종료 직전' },
    { ym: '2020-06', label: '70% 인하 종료 직전' },
  ];
  function season() {
    const S = D.sales.filter((r) => r.year >= 2015);
    const byM = Array.from({ length: 12 }, (_, i) => { const rs = S.filter((r) => r.month === i + 1); return rs.reduce((x, r) => x + r.idx, 0) / rs.length; });
    const nd = (byM[10] + byM[11]) / 2;
    const yr = (y) => D.sales.filter((r) => r.year === y).reduce((x, r) => x + r.domestic, 0);
    const years = [...new Set(D.sales.map((r) => r.year))];
    const peakY = years.reduce((a, b) => (yr(b) > yr(a) ? b : a));
    const lastY = years[years.length - 1];
    const ev = TAX_EVENTS.map((e) => D.sales.find((r) => r.ym === e.ym));
    const maxEv = ev.reduce((a, b) => (b.idx > a.idx ? b : a));
    const t = (label, big, sub, cls) => h('div', { class: 'tile' }, [h('span', { text: label }), h('b', { class: 'big ' + (cls || ''), text: big }), h('span', { text: sub })]);
    $('#season-tiles').replaceChildren(
      t('11~12월 판매 (2015–25 평균)', `+${((nd - 1) * 100).toFixed(1)}%`, '그해 월평균 대비'),
      t('1월 판매', `${((byM[0] - 1) * 100).toFixed(1)}%`, '연초는 가장 적은 달', 'bad'),
      t('세제 종료 직전 최대', `+${((maxEv.idx - 1) * 100).toFixed(0)}%`, `${maxEv.ym.replace('-', '.')} ${fmt(maxEv.domestic)}대`),
      t(`${lastY}년 연간 내수`, `${(yr(lastY) / 10000).toFixed(1)}만 대`, `${peakY}년 정점(${(yr(peakY) / 10000).toFixed(1)}만 대) 대비 ${((yr(lastY) / yr(peakY) - 1) * 100).toFixed(1)}%`),
    );
    // 월별 지수 막대
    { const W = 760, H = 230, base = 190, ph = 150, bw = 40, gap = (W - 40) / 12;
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '월별 판매 지수' });
      const y = (v) => base - (v / 1.2) * ph;
      svg.append(s('line', { x1: 20, x2: W, y1: y(1), y2: y(1), stroke: 'var(--muted)', 'stroke-dasharray': '4 3' }));
      svg.append(s('text', { x: W, y: y(1) - 6, 'text-anchor': 'end', class: 'muted', text: '월평균 100' }));
      byM.forEach((v, i) => {
        const x = 30 + i * gap, hl = i >= 10;
        const r = s('rect', { x, y: y(v), width: bw, height: base - y(v), rx: 3, fill: hl ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': hl ? 1 : 0.6 });
        tip(r, () => [`${i + 1}월`, `판매 지수 ${(v * 100).toFixed(1)} (2015–2025 평균)`]);
        svg.append(r, s('text', { x: x + bw / 2, y: y(v) - 6, 'text-anchor': 'middle', 'font-weight': hl ? 700 : 400, text: (v * 100).toFixed(0) }), s('text', { x: x + bw / 2, y: base + 18, 'text-anchor': 'middle', class: 'muted', text: `${i + 1}월` }));
      });
      svg.append(s('line', { x1: 20, x2: W, y1: base, y2: base, stroke: 'var(--line)' }));
      $('#season-month').replaceChildren(svg);
    }
    // 월별 판매 선
    { const W = 760, H = 280, x0 = 50, base = 240, top = 30;
      const max = Math.max(...S.map((r) => r.domestic)), min = 60000;
      const x = (i) => x0 + (i / (S.length - 1)) * (W - x0 - 10), y = (v) => base - ((v - min) / (max - min)) * (base - top);
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '월별 내수 판매 추이' });
      [80000, 120000, 160000].forEach((v) => svg.append(s('line', { x1: x0, x2: W - 10, y1: y(v), y2: y(v), stroke: 'var(--line)' }), s('text', { x: x0 - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'muted', text: `${v / 10000}만` })));
      svg.append(s('path', { d: S.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.domestic).toFixed(1)}`).join(' '), fill: 'none', stroke: 'var(--grey)', 'stroke-width': 1.6 }));
      S.forEach((r, i) => { if (r.month === 1) svg.append(s('text', { x: x(i), y: base + 20, 'text-anchor': 'middle', class: 'muted', text: r.year })); if (r.month === 12) { const c = s('circle', { cx: x(i), cy: y(r.domestic), r: 3, fill: 'var(--accent)', 'fill-opacity': 0.6 }); tip(c, () => [`${r.ym}`, `${fmt(r.domestic)}대`]); svg.append(c); } });
      TAX_EVENTS.forEach((e, k) => {
        const i = S.findIndex((r) => r.ym === e.ym), r = S[i];
        const c = s('circle', { cx: x(i), cy: y(r.domestic), r: 6, fill: 'var(--accent)' });
        tip(c, () => [`${r.ym} · ${e.label}`, `${fmt(r.domestic)}대 (그해 월평균의 ${(r.idx * 100).toFixed(0)}%)`]);
        const lx = x(i) + (k === 1 ? 10 : -10), ly = y(r.domestic) - 10 - (k === 1 ? 14 : 0);
        svg.append(c, s('text', { x: lx, y: ly, 'text-anchor': k === 1 ? 'start' : 'end', 'font-weight': 600, fill: 'var(--accent)', text: `${e.ym.replace('-', '.')} ${e.label}` }));
      });
      svg.append(s('text', { x: W - 10, y: H - 4, 'text-anchor': 'end', class: 'muted', text: '작은 점 = 매년 12월' }));
      $('#season-line').replaceChildren(svg);
    }
  }
  if ($('#season')) season();

  /* ---------- 표지: 데이터 흐름도 ---------- */
  const FLOW = {
    nodes: [
      { id: 'pop', col: 0, label: '주민등록 인구', sub: '읍면동·1세 단위', href: 'ch2-region.html' },
      { id: 'reg', col: 0, label: '2025 신규 등록', sub: '시군구·차종·연료', href: 'ch2-region.html' },
      { id: 'evd', col: 0, label: '전기차 등록 추이', sub: '2024–2026', href: 'ch4-market.html' },
      { id: 'sal', col: 0, label: '월별 내수 판매', sub: '2009–2025', href: 'ch1-background.html' },
      { id: 'old', col: 0, label: '노후차·대차 수요', sub: 'KAMA·조사 보도', href: 'ch5-replacement.html' },
      { id: 'tax', col: 0, label: '세제 혜택 일정', sub: 'HEV·EV 12월 출고분', href: 'ch1-background.html' },
      { id: 'a1', col: 1, label: '동 단위 고객 구조', sub: '영패밀리·2030·60세+', href: 'ch3-pinpoint.html' },
      { id: 'a2', col: 1, label: '차급 경쟁력', sub: '현대 vs 경쟁 비중', href: 'ch4-market.html' },
      { id: 'a3', col: 1, label: '연말·대차 수요', sub: '언제, 누가 바꾸나', href: 'ch5-replacement.html' },
      { id: 'd1', col: 2, label: '동 단위 판촉방안', sub: '어느 동·누구에게·무엇을', href: 'ch3-pinpoint.html' },
      { id: 'd2', col: 2, label: '세종 기획안', sub: '패밀리 HEV 위크엔드', href: 'ch7-sejong.html' },
      { id: 'd3', col: 2, label: '금융·실행 일정', sub: '11.30 / 12.31 출고 마감', href: 'ch6-plan.html' },
    ],
    edges: [['pop', 'a1'], ['reg', 'a1'], ['reg', 'a2'], ['evd', 'a2'], ['sal', 'a3'], ['old', 'a3'], ['tax', 'a3'], ['a1', 'd1'], ['a2', 'd1'], ['a3', 'd1'], ['d1', 'd2'], ['d2', 'd3']],
  };
  let flowView = 'diagram';
  function flow() {
    tabs($('#flow-tabs'), [['diagram', '흐름도'], ['table', '표로 보기']], flowView, (k) => { flowView = k; flow(); });
    const box = $('#flow');
    if (flowView === 'table') {
      const name = (id) => FLOW.nodes.find((n) => n.id === id).label;
      box.replaceChildren(h('table', { class: 'plain' }, [h('thead', {}, h('tr', {}, ['데이터', '분석', '결정'].map((x) => h('th', { text: x })))),
        h('tbody', {}, FLOW.nodes.filter((n) => n.col === 0).map((n) => { const a = FLOW.edges.filter((e) => e[0] === n.id).map((e) => e[1]); const d = [...new Set(FLOW.edges.filter((e) => a.includes(e[0])).map((e) => e[1]))]; return h('tr', {}, [h('td', {}, h('a', { href: n.href, text: n.label })), h('td', { text: a.map(name).join(', ') }), h('td', { text: d.map(name).join(', ') })]); }))]));
      return;
    }
    const W = 760, bw = 190, bh = 46, colX = [10, 285, 560];
    const per = (c) => FLOW.nodes.filter((n) => n.col === c);
    const H = per(0).length * 58 + 10;
    const pos = {};
    [0, 1, 2].forEach((c) => { const ns = per(c), step = (H - 10) / ns.length; ns.forEach((n, i) => { pos[n.id] = { x: colX[c], y: 5 + step * i + (step - bh) / 2 }; }); });
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '데이터에서 결정까지의 흐름도' });
    const edgeEls = FLOW.edges.map(([a, b]) => { const p = pos[a], q = pos[b], x1 = p.x + bw, y1 = p.y + bh / 2, x2 = q.x, y2 = q.y + bh / 2, mx = (x1 + x2) / 2;
      const e = s('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: 'var(--grey)', 'stroke-width': 1.5, class: 'edge' }); e.dataset.a = a; e.dataset.b = b; svg.append(e); return e; });
    const linked = (id) => { const set = new Set([id]); let grow = true; while (grow) { grow = false; FLOW.edges.forEach(([a, b]) => { if (set.has(a) && !set.has(b) && FLOW.nodes.find((n) => n.id === a).col >= FLOW.nodes.find((n) => n.id === id).col) { set.add(b); grow = true; } if (set.has(b) && !set.has(a) && FLOW.nodes.find((n) => n.id === b).col <= FLOW.nodes.find((n) => n.id === id).col) { set.add(a); grow = true; } }); } return set; };
    FLOW.nodes.forEach((n) => {
      const p = pos[n.id], col = n.col === 2;
      const g = s('g', { class: 'click flow-n', onclick: () => { location.href = n.href; } }, [
        s('rect', { x: p.x, y: p.y, width: bw, height: bh, rx: 8, fill: col ? 'var(--accent)' : 'var(--panel)', stroke: n.col === 1 ? 'var(--accent)' : 'var(--line)', 'stroke-width': 1.5 }),
        s('text', { x: p.x + 12, y: p.y + 20, 'font-weight': 700, fill: col ? '#fff' : null, text: n.label }),
        s('text', { x: p.x + 12, y: p.y + 36, 'font-size': 11, fill: col ? '#e6efff' : 'var(--muted)', text: n.sub }),
      ]);
      g.addEventListener('mouseenter', () => { const L = linked(n.id); edgeEls.forEach((e) => { const on = L.has(e.dataset.a) && L.has(e.dataset.b); e.setAttribute('stroke', on ? 'var(--accent)' : 'var(--line)'); e.setAttribute('stroke-width', on ? 2.5 : 1); }); svg.querySelectorAll('.flow-n').forEach((x) => { x.style.opacity = 1; }); });
      g.addEventListener('mouseleave', () => edgeEls.forEach((e) => { e.setAttribute('stroke', 'var(--grey)'); e.setAttribute('stroke-width', 1.5); }));
      svg.append(g);
    });
    box.replaceChildren(h('div', { class: 'flow-cols' }, ['데이터 6종', '분석', '결정'].map((x) => h('span', { text: x }))), svg);
  }
  if ($('#flow')) flow();

  /* ---------- 시뮬레이터 ---------- */
  function sim() {
    const areas = D.sgg.filter((r) => r.reg != null).sort((a, b) => b.reg - a.reg);
    const sel = $('#sim-area');
    sel.replaceChildren(...areas.map((r) => h('option', { value: r.sgg, text: `${r.sido} ${r.sgg} (2025년 ${fmt(r.reg)}대)` })));
    sel.value = '세종시';
    const DEF = { leads: 1200, drive: 25, quote: 50, close: 40, deliv: 75 };
    const ids = ['drive', 'quote', 'close', 'deliv'];
    const read = () => ({ leads: Math.max(0, Number($('#sim-leads').value) || 0), ...Object.fromEntries(ids.map((k) => [k, Number($('#sim-' + k).value)])) });
    function calc() {
      const v = read(), a = areas.find((r) => r.sgg === sel.value);
      ids.forEach((k) => { $('#v-' + k).textContent = v[k] + '%'; });
      const st = [['방문·리드', v.leads], ['시승', v.leads * v.drive / 100]];
      st.push(['견적 상담', st[1][1] * v.quote / 100]); st.push(['계약', st[2][1] * v.close / 100]); st.push(['연내 출고', st[3][1] * v.deliv / 100]);
      const month = a.reg / 12, hyMonth = month * a.hyundai, con = st[3][1], del = st[4][1];
      const t = (label, big, sub, cls) => h('div', { class: 'tile' }, [h('span', { text: label }), h('b', { class: 'big ' + (cls || ''), text: big }), h('span', { text: sub })]);
      $('#sim-tiles').replaceChildren(
        t('예상 계약', `${fmt(con)}대`, `리드 대비 ${(con / Math.max(1, v.leads) * 100).toFixed(1)}%`),
        t('연내 출고', `${fmt(del)}대`, '세제 혜택 적용 대상'),
        t('지역 월 신규 등록 대비', `${(con / month * 100).toFixed(1)}%`, `${a.sgg} 월평균 ${fmt(month)}대(2025)`),
        t('현대 월 등록 대비 추가', `+${(con / hyMonth * 100).toFixed(0)}%`, `현대 점유율 ${pct(a.hyundai)} 기준 월 ${fmt(hyMonth)}대`),
      );
      const W = 760, H = 120, mx = st[0][1] || 1;
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '전환 퍼널' });
      st.forEach(([name, n], i) => { const w = Math.max(2, (n / mx) * 600); const y = i * 23; svg.append(s('rect', { x: 140, y, width: w, height: 18, rx: 3, fill: 'var(--accent)', 'fill-opacity': 0.25 + i * 0.18 }), s('text', { x: 0, y: y + 14, text: name }), s('text', { x: 146 + w, y: y + 14, 'font-weight': 600, text: `${fmt(n)}${i ? '대' : '명'}` })); });
      $('#sim-funnel').replaceChildren(svg);
      $('#sim-note').textContent = `월 신규 등록 대비 비율은 행사 계약을 한 달 실적으로 가정한 값입니다. 행사 계약 중 기존 현대 고객의 재구매는 점유율을 늘리지 않으니, 정복(경쟁차 대차) 비중을 따로 보세요.`;
    }
    $('#sim-form').addEventListener('input', calc);
    $('#sim-reset').addEventListener('click', () => { sel.value = '세종시'; $('#sim-leads').value = DEF.leads; ids.forEach((k) => { $('#sim-' + k).value = DEF[k]; }); calc(); });
    calc();
  }
  if ($('#sim')) sim();

  /* ---------- 5장: 우리 지역 대차 지표 ---------- */
  function replocal() {
    const R = D.repl, nat = R.find((r) => r.area === '전국'), loc = R.filter((r) => r.area !== '전국');
    const by = (a) => R.find((r) => r.area === a);
    const t = (label, big, sub, cls) => h('div', { class: 'tile' }, [h('span', { text: label }), h('b', { class: 'big ' + (cls || ''), text: big }), h('span', { text: sub })]);
    const cn = by('충남'), my = D.myear, tot = my.reduce((x, r) => x + r.cars, 0);
    const y16 = my.find((r) => r.model_year === 2016), next3 = my.filter((r) => r.model_year >= 2017 && r.model_year <= 2019).reduce((x, r) => x + r.cars, 0);
    $('#rl-tiles').replaceChildren(
      t('충남 승용 폐차율', `${cn.scrap_per1000_yr.toFixed(1)}대`, `등록 1,000대당 연간 · 전국 ${nat.scrap_per1000_yr.toFixed(1)}대보다 ${((cn.scrap_per1000_yr / nat.scrap_per1000_yr - 1) * 100).toFixed(0)}% 높음`),
      t('50·60대 개인 차주', `${(loc.reduce((x, r) => x + r.n_50_60s, 0) / 10000).toFixed(1)}만 명`, loc.map((r) => `${r.area} ${(r.n_50_60s / 10000).toFixed(1)}만`).join(' · ')),
      t('충남 경유 승용차', `${(cn.diesel / 10000).toFixed(1)}만 대`, `비중 ${pct(cn.diesel_share)} · 전국 ${pct(nat.diesel_share)}`),
      t('올해 10년 차 2016년식', `${(y16.cars / 10000).toFixed(1)}만 대`, `전국 승용 · 다음 3년(2017–19년식) ${(next3 / 10000).toFixed(0)}만 대 대기`),
    );
    // 폐차율 막대
    { const W = 380, rh = 44, L = 60, H = R.length * rh + 30, max = Math.max(...R.map((r) => r.scrap_per1000_yr)) * 1.15, x = (v) => L + (v / max) * (W - L - 70);
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '지역별 승용차 폐차율' });
      R.forEach((r, i) => { const y = i * rh + 6, isN = r.area === '전국', hi = r.area === '충남';
        const b = s('rect', { x: L, y, width: x(r.scrap_per1000_yr) - L, height: rh - 18, rx: 3, fill: isN ? 'var(--grey)' : 'var(--accent)', 'fill-opacity': hi ? 1 : isN ? 0.7 : 0.45 });
        tip(b, () => [`${r.area} · 1~9월 승용 폐차 ${fmt(r.scrap_ytd)}대`, `등록 ${fmt(r.car_stock)}대 · 신규 ${fmt(r.new_ytd)}대`, `폐차 ÷ 신규 ${r.scrap_to_new.toFixed(2)}`]);
        svg.append(s('text', { x: 0, y: y + 18, 'font-weight': hi ? 700 : 400, text: r.area }), b, s('text', { x: x(r.scrap_per1000_yr) + 6, y: y + 18, 'font-weight': hi ? 700 : 400, text: `${r.scrap_per1000_yr.toFixed(1)}대` })); });
      const nx = x(nat.scrap_per1000_yr); svg.append(s('line', { x1: nx, x2: nx, y1: 0, y2: H - 22, stroke: 'var(--fg)', 'stroke-dasharray': '4 3' }), s('text', { x: nx, y: H - 6, 'text-anchor': 'middle', class: 'muted', text: '전국 수준' }));
      $('#rl-scrap').replaceChildren(svg); }
    // 차주 연령 100% 막대
    { const keys = [['own_20s', '~20대'], ['own_30s', '30대'], ['own_40s', '40대'], ['own_50s', '50대'], ['own_60s', '60대'], ['own_70p', '70대+']];
      const op = [0.15, 0.3, 0.6, 1, 0.8, 0.25], W = 380, rh = 44, L = 60, bw = W - L - 6, H = R.length * rh + 40;
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '지역별 개인 차주 연령 구성' });
      R.forEach((r, i) => { const y = i * rh + 6; let acc = 0; svg.append(s('text', { x: 0, y: y + 18, text: r.area }));
        keys.forEach(([k, n], j) => { const w = r[k] * bw; const b = s('rect', { x: L + acc, y, width: Math.max(0, w - 1), height: rh - 18, fill: 'var(--accent)', 'fill-opacity': op[j] });
          tip(b, () => [`${r.area} 개인 차주`, `${n} ${pct(r[k])}`]); svg.append(b);
          if (j === 3 || j === 4) svg.append(s('text', { x: L + acc + w / 2, y: y + 18, 'text-anchor': 'middle', fill: j === 3 ? '#fff' : null, 'font-size': 11, style: 'pointer-events:none', text: pct(r[k], 0) }));
          acc += w; }); });
      keys.forEach(([, n], j) => svg.append(s('rect', { x: j * 63, y: H - 16, width: 10, height: 10, fill: 'var(--accent)', 'fill-opacity': op[j] }), s('text', { x: 13 + j * 63, y: H - 7, 'font-size': 11, class: 'muted', text: n })));
      $('#rl-owner').replaceChildren(svg); }
    // 모델년도 막대
    { const W = 760, H = 250, base = 200, ph = 160, n = my.length, gap = (W - 40) / n, bw = gap - 6, max = Math.max(...my.map((r) => r.cars)), y = (v) => base - (v / max) * ph;
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '전국 승용차 모델년도별 등록' });
      my.forEach((r, i) => { const x0 = 30 + i * gap, old = r.model_year <= 2016, is16 = r.model_year === 2016, soon = r.model_year >= 2017 && r.model_year <= 2019;
        const b = s('rect', { x: x0, y: y(r.cars), width: bw, height: base - y(r.cars), rx: 2, fill: old ? 'var(--accent)' : soon ? 'var(--accent)' : 'var(--grey)', 'fill-opacity': is16 ? 1 : old ? 0.6 : soon ? 0.25 : 0.5 });
        tip(b, () => [`${r.model_year === 2006 ? '2006년 이전' : r.model_year + '년식'}`, `승용 ${fmt(r.cars)}대`]);
        svg.append(b, s('text', { x: x0 + bw / 2, y: base + 14, 'text-anchor': 'middle', 'font-size': 10, class: 'muted', text: String(r.model_year).slice(2) }));
        if (is16) svg.append(s('text', { x: x0 + bw / 2, y: y(r.cars) - 6, 'text-anchor': 'middle', 'font-weight': 700, text: `${(r.cars / 10000).toFixed(0)}만` })); });
      const i16 = my.findIndex((r) => r.model_year === 2016), old = my.filter((r) => r.model_year <= 2016).reduce((x, r) => x + r.cars, 0);
      svg.append(s('text', { x: 30, y: 18, 'font-weight': 700, fill: 'var(--accent)', text: `10년 이상(2016년식 이전) ${pct(old / tot)} · ${(old / 10000).toFixed(0)}만 대` }));
      const a = 30 + (i16 + 1) * gap, b2 = 30 + (i16 + 4) * gap - 6;
      svg.append(s('path', { d: `M${a},${base + 24} L${a},${base + 30} L${b2},${base + 30} L${b2},${base + 24}`, fill: 'none', stroke: 'var(--muted)' }), s('text', { x: (a + b2) / 2, y: base + 44, 'text-anchor': 'middle', class: 'muted', text: `1~3년 안에 10년 차 · ${(next3 / 10000).toFixed(0)}만 대` }));
      svg.append(s('text', { x: W - 10, y: 18, 'text-anchor': 'end', class: 'muted', text: '연도 표기는 모델년도 끝 두 자리' }));
      $('#rl-myear').replaceChildren(svg); }
    // 표
    const IMP = { 대전: '50·60대 차주 32만 명 → 그랜저 HEV·쏘나타 대차, 전용카드 50만원', 세종: '차주가 젊고 HEV가 이미 많음 → 싼타페 HEV·아이오닉 업그레이드, 60개월 무이자', 충남: '폐차율·경유 비중 최고, HEV 비중 최저 → 포터·투싼 HEV·싼타페 HEV 대차, 유예형 할부' };
    $('#rl-table').replaceChildren(h('table', { class: 'plain' }, [
      h('thead', {}, h('tr', {}, ['지역', '승용 등록', '경유', 'HEV', 'EV·수소', '1~9월 신규', '1~9월 폐차', '폐차÷신규', '판촉 시사점'].map((x) => h('th', { text: x })))),
      h('tbody', {}, R.map((r) => h('tr', {}, [r.area, fmt(r.car_stock), pct(r.diesel_share), pct(r.hev_share), pct(r.ev_share), fmt(r.new_ytd), fmt(r.scrap_ytd), r.scrap_to_new.toFixed(2), IMP[r.area] || '—'].map((v) => h('td', { text: v }))))),
    ]));
  }
  if ($('#replocal')) replocal();

  /* ---------- 6장: 11월 금융 × 데이터 매칭 ---------- */
  function finmatch() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dd = (iso) => Math.round((new Date(iso + 'T00:00:00') - today) / 86400000);
    const tag = (n) => (n > 0 ? `D-${n}` : n === 0 ? 'D-DAY' : '마감');
    const d0 = dd('2026-11-15'), d1 = dd('2026-11-30'), d2 = dd('2026-12-31');
    $('#fin-dday').replaceChildren(
      h('div', { class: 'dd hot' }, [h('b', { text: tag(d0) }), h('span', { text: '11.15 K-세일페스타 쿠폰 응모 마감 — 상담 고객 전원 응모 안내' })]),
      h('div', { class: 'dd hot' }, [h('b', { text: tag(d1) }), h('span', { text: '11.30 출고 마감 — 무이자·전용카드·EV 부담 Down·포터 EV·다자녀 등 11월 금융' })]),
      h('div', { class: 'dd' }, [h('b', { text: tag(d2) }), h('span', { text: '12.31 출고 마감 — 아반떼 퍼스트 무브, HEV·EV 세제 감면' })]),
      h('div', { class: 'dd muted-dd' }, [h('b', { text: '중복 불가' }), h('span', { text: '금융 프로모션끼리는 하나만 — 고객별 최대 혜택 하나를 고르세요' })]),
    );
    // 월 납입금 막대
    { const R = D.finMonthly.slice().sort((a, b) => a.monthly - b.monthly), W = 380, rh = 30, L = 118, H = R.length * rh + 26, max = 22, x = (v) => (v / max) * (W - L - 50);
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '차종별 월 납입금 예시' });
      R.forEach((r, i) => { const y = i * rh + 4, low = r.monthly <= 10;
        const b = s('rect', { x: L, y, width: x(r.monthly), height: rh - 10, rx: 3, fill: low ? '#c8893a' : 'var(--accent)', 'fill-opacity': low ? 1 : 0.35 + 0.05 * (8 - i) });
        tip(b, () => [`${r.car} · ${r.plan}`, `월 약 ${r.monthly}만원`, r.basis]);
        svg.append(s('text', { x: 0, y: y + 15, text: r.car }), b, s('text', { x: L + x(r.monthly) + 6, y: y + 15, 'font-weight': 700, text: `월 ${r.monthly}만` })); });
      const x10 = L + x(10); svg.append(s('line', { x1: x10, x2: x10, y1: 0, y2: H - 20, stroke: 'var(--fg)', 'stroke-dasharray': '3 3' }), s('text', { x: x10, y: H - 6, 'text-anchor': 'middle', class: 'muted', 'font-size': 11, text: '월 10만원' }));
      $('#fin-monthly').replaceChildren(svg); }
    // 이자 절감 묶음 막대
    { const cars = [...new Set(D.finSaving.map((r) => r.car))], months = [36, 48, 60], W = 380, gh = 70, L = 150, H = cars.length * gh + 30, max = 900, x = (v) => (v / max) * (W - L - 50);
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '할부 개월별 이자 절감액' });
      cars.forEach((c, i) => { const y0 = i * gh + 6; const plan = D.finSaving.find((r) => r.car === c).plan;
        svg.append(s('text', { x: 0, y: y0 + 26, 'font-weight': 700, text: c }), s('text', { x: 0, y: y0 + 42, class: 'muted', 'font-size': 11, text: plan.replace(' 플랜', '') }));
        months.forEach((m, k) => { const r = D.finSaving.find((q) => q.car === c && q.months === m), y = y0 + k * 20;
          const b = s('rect', { x: L, y, width: x(r.saving), height: 15, rx: 2, fill: c.includes('택시') ? 'var(--grey)' : 'var(--accent)', 'fill-opacity': 0.4 + k * 0.3 });
          tip(b, () => [`${c} ${m}개월`, `이자 약 ${r.saving}만원 절감`]);
          svg.append(b, s('text', { x: L + x(r.saving) + 5, y: y + 12, 'font-size': 11, 'font-weight': m === 60 ? 700 : 400, text: `${m}개월 ${r.saving}만` })); }); });
      svg.append(s('text', { x: 0, y: H - 6, class: 'muted', 'font-size': 11, text: '무이자: 선수율 20%·캘리그래피 HEV 기준 · 택시: 선수율 1% 기준' }));
      $('#fin-saving').replaceChildren(svg); }
  }
  if ($('#finmatch')) finmatch();

  /* ---------- 금융 포스터 시안 전환 ---------- */
  document.querySelectorAll('#poster-tabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#poster-tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#poster-img').src = b.dataset.src;
  }));
})();
