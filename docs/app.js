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
  $('#meta').textContent = `인구 기준 ${D.popAsOf} · 신규 등록 2025년 · 데이터 갱신 ${D.built}`;
  (function kpis() {
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
  $('#age-legend').replaceChildren(h('span', { text: '연령 구성:' }), ...AGE.map(([, n], i) => h('span', {}, [h('i', { style: `opacity:${AGE_OP[i]}` }), n])));

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
  drill({});

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
      const g = s('g', { class: 'click', onclick: () => { drill({ sido: r.sido, sgg: r.sgg, dong: r.dong }); $('#drill').scrollIntoView({ behavior: 'smooth' }); } }, [
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
  pin();

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
  h2h();

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
  ev();
})();
