/* 판촉 전단 만들기 — 지역·대상·차종·구분 → 전단(SVG)·문자 문구·체크리스트 자동 생성 */
(function () {
  const D = window.DATA;
  const $ = (q) => document.querySelector(q);
  const NS = 'http://www.w3.org/2000/svg';
  function h(tag, attrs = {}, kids = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v); }
    [].concat(kids).forEach((c) => c != null && c !== false && e.append(c));
    return e;
  }
  function s(tag, attrs = {}, kids = []) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === 'text') e.textContent = v; else if (v != null) e.setAttribute(k, v); }
    [].concat(kids).forEach((c) => c != null && e.append(c));
    return e;
  }
  const fmt = (n) => Math.round(n).toLocaleString('ko-KR');
  const josaR = (w) => { const c = w.trim().slice(-1).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '을' : '를'; };
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const md = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function nextWeekend() {
    const d = new Date(TODAY); const add = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + (d.getDay() === 6 ? 0 : add));
    const e = new Date(d); e.setDate(d.getDate() + 1); return [d, e];
  }
  const KSF_OPEN = TODAY <= new Date('2026-11-15T00:00:00');

  /* ---------- 선택지 ---------- */
  const TARGETS = {
    family: { label: '아이 키우는 3040 가족', who: '아이 키우는 가족', metric: (r) => r.family_idx, mlabel: '영패밀리', car: 'santafe_hev',
      hooks: ['아이와 함께, 더 넓고 편하게', '우리 가족 주말이 달라집니다', '카시트 두 개도 여유롭게', '가족의 첫 패밀리 SUV'] },
    young: { label: '2030 첫차', who: '첫 차를 고르는 2030', metric: (r) => r.age20_29, mlabel: '20–29세', car: 'avante',
      hooks: ['첫 차, 부담은 가볍게', '월 10만원대로 시작하는 내 차', '사회초년생 첫 차 응원', '출퇴근이 즐거워지는 첫 차'] },
    senior: { label: '50·60대 대차 고객', who: '오래 탄 차를 바꾸실 분', metric: (r) => r.age60p * r.pop, mlabel: '60세 이상', car: 'grandeur_hev',
      hooks: ['오래 탄 차, 이제 바꾸실 때', '조용하고 편안한 하이브리드', '10년 넘은 차, 연말에 새 차로', '부모님께 드리는 편안함'] },
    biz: { label: '소상공인·농업인', who: '일하는 차가 필요한 사장님', metric: (r) => r.age60p * r.pop, mlabel: '60세 이상', car: 'porter',
      hooks: ['일하는 차, 새 차로 바꾸세요', '노후 트럭, 이번 달에 바꾸면 쿠폰까지', '사장님의 든든한 일꾼', '장사 잘되는 새 트럭'] },
    staff: { label: '공무원·그룹사 임직원', who: '임직원 여러분', metric: (r) => r.age30_44, mlabel: '30–44세', car: 'palisade_hev',
      hooks: ['임직원만을 위한 특별 상담회', '바쁜 직장인을 위한 맞춤 조건', '점심시간 30분, 시승해 보세요'] },
    newhome: { label: '새 아파트 입주 가구', who: '새 집으로 이사하시는 가족', metric: null, mlabel: '입주 단지', car: 'santafe_hev',
      hooks: ['새 집에 새 차로', '입주를 축하드립니다', '새 출발, 새 차와 함께', '이사하는 날 새 차로 출발'] },
    ev: { label: 'EV 관심 고객 → HEV', who: '전기차를 알아보시던 분', metric: (r) => r.age30_44, mlabel: '30–44세', car: 'tucson_hev',
      hooks: ['전기차 보조금 끝, 이제 하이브리드', '충전 걱정 없는 하이브리드', '연비도 세제 혜택도 하이브리드'] },
  };
  const CARS = {
    santafe_hev: { name: '싼타페 하이브리드', body: 'suv', big: '최대 60개월 무이자', bullets: ['60개월 이자 약 580만원 절감(선수율 20%)', '차종별 선착순 2,000대', 'HEV 세제 감면 12.31 출고까지'], ksf: true, cond: '무이자: 개인·개인사업자, 선수율 20% 이상, 11.30 출고' },
    palisade_hev: { name: '팰리세이드 하이브리드', body: 'suv', big: '최대 60개월 무이자', bullets: ['60개월 이자 약 740만원 절감(선수율 20%)', '그룹사 임직원 특화 할부', 'HEV 세제 감면 12.31 출고까지'], ksf: true, cond: '무이자: 개인·개인사업자, 선수율 20% 이상, 11.30 출고' },
    grandeur_hev: { name: '그랜저 하이브리드', body: 'sedan', big: '하이브리드 세제 감면', bullets: ['12.31 출고분까지 세제 혜택', '타던 차 대차 보상 상담', '조용하고 편안한 승차감'], ksf: true, cond: '세제 감면은 출고일 기준' },
    avante: { name: '디 올 뉴 아반떼', body: 'sedan', big: '월 10만원대부터', bullets: ['퍼스트 무브 36개월 금리 2.8%', '만기 때 차를 반납하면 끝', '12.31 출고분까지(하이브리드 포함)'], ksf: true, cond: '퍼스트 무브: 유예형 할부, 현대캐피탈 심사' },
    avante_hev: { name: '아반떼 하이브리드', body: 'sedan', big: '월 10만원대부터', bullets: ['퍼스트 무브 36개월 금리 2.8%', '하이브리드 세제 감면', '12.31 출고분까지'], ksf: true, cond: '퍼스트 무브: 유예형 할부, 현대캐피탈 심사' },
    tucson_hev: { name: '투싼 하이브리드', body: 'suv_s', big: '하이브리드 세제 감면', bullets: ['충전 걱정 없는 하이브리드', '12.31 출고분까지 세제 혜택', '유예형 할부로 월 부담 낮추기'], ksf: false, cond: '투싼은 코리아세일페스타 쿠폰 제외' },
    kona_hev: { name: '코나 하이브리드', body: 'suv_s', big: '하이브리드 세제 감면', bullets: ['도심 출퇴근에 딱 맞는 크기', '12.31 출고분까지 세제 혜택', '충전 걱정 없는 하이브리드'], ksf: true, cond: '세제 감면은 출고일 기준' },
    sonata: { name: '쏘나타 디 엣지', body: 'sedan', big: '전용카드 총 50만원', bullets: ['차량가 25만원 할인 + 25만원 캐시백', '하이브리드 포함', '현대캐피탈 할부와 함께 가능'], ksf: true, cond: '전용카드 1,000만원 이상 결제, 11.30 출고' },
    staria: { name: '더 뉴 스타리아', body: 'mpv', big: '전용카드 총 50만원', bullets: ['차량가 25만원 할인 + 25만원 캐시백', '넉넉한 공간, 다인승', '현대캐피탈 할부와 함께 가능'], ksf: true, cond: '전용카드 1,000만원 이상 결제, 영업용 제외, 11.30 출고' },
    porter: { name: '포터 LPG', body: 'truck', big: '노후 트럭 대차 상담', bullets: ['오래된 디젤 트럭 바꿀 때', '타던 차 매각까지 도와드려요', '하루 단위 비용으로 쉽게 상담'], ksf: true, cond: '쿠폰은 당첨 고객, 11.30 출고까지' },
    casper: { name: '캐스퍼', body: 'mini', big: '작고 편한 생활차', bullets: ['좁은 골목·주차도 편하게', '타던 차 대차 상담', '연내 출고 상담'], ksf: false, cond: '캐스퍼는 코리아세일페스타 쿠폰 제외' },
  };
  const TYPES = {
    drive: { label: '시승 행사', badge: '시승 이벤트', cta: '현장에서 바로 시승하고 상담 받으세요' },
    leaflet: { label: '판촉 전단', badge: '11월 특별 혜택', cta: '가까운 현대자동차 지점에서 상담하세요' },
    festival: { label: '행사 판촉(축제 부스)', badge: '현장 부스 이벤트', cta: '부스에 들러 쿠폰 응모하고 상담 받으세요' },
    movein: { label: '입주 박람회', badge: '입주 축하 이벤트', cta: '입주 전에 미리 상담하고 이사 날 맞춰 출고' },
    group: { label: '단체 특판', badge: '임직원 특별 상담회', cta: '임직원 전용 조건, 상담회에서 확인하세요' },
  };
  const THEMES = {
    black: { label: '블랙' },
    navy: { label: '남색', bg: '#002c5f', bg2: '#0b3a75', fg: '#ffffff', sub: '#cfe0f5', acc: '#e2b66f', accFg: '#1d1406', card: 'rgba(255,255,255,.1)', car: '#ffffff' },
    autumn: { label: '가을', bg: '#fbf3e6', bg2: '#f3dfc0', fg: '#2b1d10', sub: '#6b4e2e', acc: '#c8602f', accFg: '#ffffff', card: 'rgba(200,96,47,.1)', car: '#002c5f' },
    black: { label: '블랙', bg: '#121212', bg2: '#262626', fg: '#ffffff', sub: '#c9c9c9', acc: '#e2b66f', accFg: '#1d1406', card: 'rgba(255,255,255,.08)', car: '#e2b66f' },
  };
  const CAR_PATH = {
    sedan: 'M8 40 L16 30 Q22 22 40 21 L58 14 Q66 11 80 12 L92 14 Q100 16 106 24 L114 30 Q118 32 118 38 L118 44 L8 44 Z',
    suv: 'M8 42 L10 26 Q12 18 24 17 L40 10 Q46 8 56 8 L96 8 Q104 8 108 16 L114 28 Q118 30 118 36 L118 44 L8 44 Z',
    suv_s: 'M10 42 L12 28 Q14 20 26 19 L42 12 Q48 10 58 10 L90 10 Q98 10 102 18 L110 28 Q114 30 114 36 L114 44 L10 44 Z',
    mpv: 'M8 42 L8 22 Q8 12 20 10 L30 6 Q36 4 46 4 L104 4 Q114 4 116 14 L118 36 L118 44 L8 44 Z',
    truck: 'M6 42 L6 18 Q6 10 14 10 L36 10 Q42 10 42 18 L42 26 L118 26 L118 44 L6 44 Z',
    mini: 'M16 42 L18 22 Q20 10 34 8 L78 8 Q92 8 96 20 L102 32 Q106 34 106 38 L106 44 L16 44 Z',
  };
  const WIN = { sedan: 'M44 22 L60 15 Q66 13 78 14 L90 16 Q96 18 100 24 Z', suv: 'M30 18 L42 12 Q47 10 56 10 L94 10 Q100 10 103 17 L106 22 L30 22 Z', suv_s: 'M32 20 L44 14 Q49 12 58 12 L88 12 Q94 12 97 19 L100 23 L32 23 Z', mpv: 'M22 14 L32 8 Q38 6 46 6 L104 6 Q110 6 112 14 L113 20 L22 20 Z', truck: 'M10 14 Q10 12 14 12 L34 12 Q38 12 38 16 L38 22 L10 22 Z', mini: 'M26 14 Q28 10 36 10 L76 10 Q86 10 90 18 L93 22 L26 22 Z' };

  /* ---------- 상태 ---------- */
  const st = { sgg: '세종시', dong: null, target: 'family', car: 'santafe_hev', type: 'drive', theme: 'black', seed: 0, dseed: 0, manual: { when: false, place: false } };

  function issuesOf(sgg, kind) { return (D.issues || []).filter((q) => q.sgg === sgg && q.kind === kind && q.size !== '0세대'); }
  function rankDongs() {
    const T = TARGETS[st.target];
    let ds = D.dong.filter((r) => r.sgg === st.sgg && r.pop >= 3000);
    if (st.target === 'newhome') {
      const hit = issuesOf(st.sgg, '입주').flatMap((q) => String(q.dong).split('·')).filter(Boolean);
      const norm = (x) => x.replace(/\d+(?=[가-힣]*동$)/, '');
      ds = ds.slice().sort((a, b) => (hit.includes(norm(b.dong)) - hit.includes(norm(a.dong))) || (b.family_idx - a.family_idx));
      return ds.map((r) => ({ r, tag: hit.includes(norm(r.dong)) ? '입주 단지' : `영패밀리 ${(r.family_idx * 100).toFixed(0)}%` }));
    }
    ds = ds.slice().sort((a, b) => T.metric(b) - T.metric(a));
    return ds.map((r) => ({ r, tag: T.mlabel === '60세 이상' ? `60세+ ${fmt(r.age60p * r.pop)}명` : `${T.mlabel} ${((st.target === 'family' ? r.family_idx : st.target === 'young' ? r.age20_29 : r.age30_44) * 100).toFixed(0)}%` }));
  }

  /* ---------- 입력 ---------- */
  function chips(el, entries, cur, onPick) {
    el.replaceChildren(...entries.map(([k, lab]) => h('button', { type: 'button', 'aria-pressed': String(k === cur), 'data-k': k, text: lab, onclick: () => onPick(k) })));
  }
  function drawInputs() {
    chips($('#y-target'), Object.entries(TARGETS).map(([k, v]) => [k, v.label]), st.target, (k) => { st.target = k; st.car = TARGETS[k].car; st.dong = null; if (k === 'newhome') st.type = 'movein'; if (k === 'staff') st.type = 'group'; resetAuto(); drawInputs(); render(); });
    chips($('#y-car'), Object.entries(CARS).map(([k, v]) => [k, v.name]), st.car, (k) => { st.car = k; drawInputs(); render(); });
    chips($('#y-type'), Object.entries(TYPES).map(([k, v]) => [k, v.label]), st.type, (k) => { st.type = k; resetAuto(); drawInputs(); render(); });
    chips($('#y-theme'), Object.entries(THEMES).map(([k, v]) => [k, v.label]), st.theme, (k) => { st.theme = k; drawInputs(); render(); });
    const ranked = rankDongs();
    if (!st.dong || !ranked.some((x) => x.r.dong === st.dong)) st.dong = ranked[0] ? ranked[0].r.dong : null;
    $('#y-dong').replaceChildren(...ranked.map(({ r, tag }, i) => h('option', { value: r.dong, text: `${i < 3 ? '★ ' : ''}${r.dong} — ${tag} · 인구 ${fmt(r.pop)}명` })));
    if (st.dong) $('#y-dong').value = st.dong;
    $('#y-org-wrap').hidden = st.type !== 'group';
  }
  function resetAuto() { st.manual.when = false; st.manual.place = false; }
  function autoFill() {
    const [sa, su] = nextWeekend();
    let when = `${md(sa)}(${DOW[sa.getDay()]})–${md(su)}(${DOW[su.getDay()]}) 오전 10시–오후 5시`, place = `${st.sgg} ${st.dong || ''} 생활권`;
    let src = null;
    if (st.type === 'festival') {
      const ev = issuesOf(st.sgg, '행사')[0];
      if (ev) { when = String(ev.when).replace(/^2026\./, ''); place = `${ev.title} · ${ev.size}`; src = ev; } else { place = `${st.sgg} 지역 행사장`; }
    } else if (st.type === 'movein') {
      const mv = issuesOf(st.sgg, '입주')[0];
      if (mv) { when = `입주 ${mv.when} — 사전 상담 ${md(sa)}–${md(su)}`; place = `${mv.title} 단지 앞 상담 부스`; src = mv; }
    } else if (st.type === 'group') {
      when = '평일 점심시간 11:30–13:30'; place = `${$('#y-org').value || '기관·회사'} 앞 상담 부스`;
    } else if (st.type === 'leaflet') {
      when = '11.30 출고 계약까지'; place = '가까운 현대자동차 지점·대리점';
    }
    if (!st.manual.when) $('#y-when').value = when;
    if (!st.manual.place) $('#y-place').value = place;
    return src;
  }

  /* ---------- 문구 ---------- */
  function copy() {
    const T = TARGETS[st.target], C = CARS[st.car], Y = TYPES[st.type];
    const pick = (arr, k = 0) => arr[(st.seed + k) % arr.length];
    let head = pick(T.hooks);
    if (st.type === 'movein') head = pick(['새 집에 새 차로', '입주를 축하드립니다', '새 출발, 새 차와 함께']);
    if (st.type === 'group') head = `${$('#y-org').value || '임직원'} 여러분을 위한 특별 상담회`;
    const sub = pick([`${C.name}${josaR(C.name)} ${T.who}께 추천합니다`, `${st.sgg} ${T.who}${josaR(T.who)} 위한 ${C.name}`, `${C.name}, 지금이 가장 좋은 조건입니다`], 1);
    const bullets = C.bullets.slice();
    if (st.target === 'ev' || (st.target !== 'biz' && /tucson|kona|grandeur/.test(st.car) && st.seed % 2)) bullets[0] = '전기차 보조금 마감 — 하이브리드는 세제 감면 그대로';
    const late = st.type === 'festival' && /^2026\.12|^12\./.test($('#y-when').value.replace(/^2026\./, '2026.'));
    const ksf = C.ksf && !late ? (KSF_OPEN ? '코리아세일페스타 쿠폰 최대 100만원 · 응모 11.15까지' : '코리아세일페스타 쿠폰 당첨 고객 11.30 출고까지') : null;
    return { head, sub, big: C.big, bullets, ksf, badge: Y.badge, cta: late ? '부스에 들러 연내 출고 상담 받으세요' : Y.cta, cond: C.cond };
  }
  function wrap(text, max) {
    const out = []; let line = '';
    text.split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); });
    if (line) out.push(line);
    return out;
  }

  /* ---------- 전단 (캔버스 1200 × 1697, A4 비율) ---------- */
  const POSTER = {
    santafe_hev: { photo: 'santafe', num: '60', top: '최대', u1: '개월', u2: '무이자', side: ['차종별 선착순', '각 2,000대 한정'], cols: [['이자 절감(60개월)', '약 580만원'], ['최소 선수율', '20% 이상'], ['HEV 세제 감면', '12.31 출고까지']] },
    palisade_hev: { photo: 'palisade', num: '60', top: '최대', u1: '개월', u2: '무이자', side: ['차종별 선착순', '각 2,000대 한정'], cols: [['이자 절감(60개월)', '약 740만원'], ['최소 선수율', '20% 이상'], ['그룹사 임직원', '특화 할부']] },
    grandeur_hev: { photo: 'grandeur', num: '12.31', top: '하이브리드 세제 감면', u1: '출고분', u2: '까지', side: ['타던 차', '대차 보상 상담'], cols: [['세제 감면', '출고일 기준'], ['쿠폰(당첨 시)', '최대 100만원'], ['승차감', '조용하고 편안하게']] },
    avante: { photo: 'avante', num: '10', top: '월 납입금', u1: '만원대', u2: '부터', side: ['퍼스트 무브 플랜', '12.31 출고까지'], cols: [['36개월 금리', '2.8%'], ['만기 때', '반납하면 끝'], ['하이브리드', '포함']] },
    avante_hev: { photo: 'avante', num: '10', top: '월 납입금', u1: '만원대', u2: '부터', side: ['퍼스트 무브 플랜', '12.31 출고까지'], cols: [['36개월 금리', '2.8%'], ['만기 때', '반납하면 끝'], ['HEV 세제 감면', '12.31 출고까지']] },
    tucson_hev: { num: '12.31', top: '하이브리드 세제 감면', u1: '출고분', u2: '까지', side: ['전기차 보조금 마감', '하이브리드가 답'], cols: [['충전', '걱정 없이'], ['유예형 할부', '월 부담 낮게'], ['타던 차', '대차 상담']] },
    kona_hev: { num: '12.31', top: '하이브리드 세제 감면', u1: '출고분', u2: '까지', side: ['도심 출퇴근', '딱 맞는 크기'], cols: [['충전', '걱정 없이'], ['쿠폰(당첨 시)', '최대 100만원'], ['타던 차', '대차 상담']] },
    sonata: { num: '50', top: '전용카드 총 혜택', u1: '만원', u2: '혜택', side: ['하이브리드', '포함'], cols: [['차량가 할인', '25만원'], ['캐시백', '25만원'], ['현대캐피탈 할부', '함께 가능']] },
    staria: { num: '50', top: '전용카드 총 혜택', u1: '만원', u2: '혜택', side: ['넉넉한 공간', '다인승'], cols: [['차량가 할인', '25만원'], ['캐시백', '25만원'], ['현대캐피탈 할부', '함께 가능']] },
    porter: { num: '100', top: '쿠폰 최대(당첨 시)', u1: '만원', u2: '쿠폰', side: ['노후 디젤 트럭', '대차 상담'], cols: [['타던 트럭', '매각 지원'], ['출고', '11.30까지'], ['상담', '하루 단위 비용']] },
    casper: { num: '', text: '생활차 대차 상담', side: ['좁은 골목·주차', '편하게'], cols: [['타던 차', '대차 상담'], ['출고', '연내 상담'], ['크기', '작고 편하게']] },
  };
  const PT = {
    black: { bg: '#141414', bg2: '#2a2622', fg: '#ffffff', sub: '#bdb6ad', acc: '#e2b66f', acc2: '#8a5a1c', card: '#f7f4ee', ink: '#1a1a1a', muted: '#7d746a', foot: '#0b0b0b', label: 'black' },
    autumn: { bg: '#2b1a10', bg2: '#5a3520', fg: '#ffffff', sub: '#e7cdb2', acc: '#f0a24a', acc2: '#9a4a12', card: '#fbf3e6', ink: '#2b1d10', muted: '#8a6a4a', foot: '#24150c', label: 'autumn' },
    navy: { bg: '#04214a', bg2: '#0d3a73', fg: '#ffffff', sub: '#c6d6ee', acc: '#e2b66f', acc2: '#7a5a1c', card: '#f5f7fb', ink: '#0b1f3f', muted: '#5f6f86', foot: '#021431', label: 'navy' },
  };
  const FONT = '"Noto Sans KR","Noto Sans CJK KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
  const IMG = {};
  function img(src) {
    if (IMG[src]) return IMG[src];
    IMG[src] = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    return IMG[src];
  }
  function split2(t) {
    if (t.includes(', ')) { const [a, ...b] = t.split(', '); return [a + ',', b.join(', ')]; }
    const w = t.split(' '); if (w.length < 3) return [t, ''];
    let best = 1, diff = 1e9;
    for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (d < diff) { diff = d; best = i; } }
    return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
  }
  const DESIGN = { layout: ['classic', 'photoTop', 'center'], hs: [1, 0.86, 1.1], ss: [1, 1.18, 0.9], label: ['spaced', 'pill', 'line'], num: ['grad', 'outline', 'boxed'], deco: ['none', 'stripe', 'ring'] };
  const design = (n) => ({ layout: DESIGN.layout[n % 3], hs: DESIGN.hs[Math.floor(n / 3) % 3], ss: DESIGN.ss[Math.floor(n / 2) % 3], label: DESIGN.label[Math.floor(n / 4) % 3], num: DESIGN.num[Math.floor(n / 5) % 3], deco: DESIGN.deco[Math.floor(n / 3) % 3] });
  async function drawFlyer(cv, cp) {
    const W = 1200, H = 1697;
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    const th = PT[st.theme] || PT.black, C = CARS[st.car], P = POSTER[st.car];
    const dz = design(st.dseed), center = dz.layout === 'center', top = dz.layout === 'photoTop';
    try { await Promise.all([document.fonts.load(`900 80px ${FONT}`), document.fonts.load(`400 40px ${FONT}`), document.fonts.load(`700 40px ${FONT}`)]); } catch (e) { /* 기본 글꼴 */ }
    const [photo, logo] = await Promise.all([P.photo ? img(`img/cars/${P.photo}.jpg`) : null, img('img/hyundai-logo-white.png')]);
    const T = (txt, px, py, size, opt = {}) => {
      x.save(); x.font = `${opt.w || 700} ${size}px ${FONT}`; x.fillStyle = opt.c || th.fg; x.textAlign = opt.a || 'left'; x.textBaseline = 'alphabetic';
      if (opt.ls) x.letterSpacing = `${opt.ls}px`;
      x.fillText(txt, px, py); const m = x.measureText(txt).width; x.restore(); return m;
    };
    const fit = (txt, size, maxW, w = 700) => { x.save(); x.font = `${w} ${size}px ${FONT}`; let s2 = size; while (x.measureText(txt).width > maxW && s2 > 12) { s2 -= 2; x.font = `${w} ${s2}px ${FONT}`; } x.restore(); return s2; };
    // 배경
    let g = x.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, th.bg); g.addColorStop(1, th.bg2);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (dz.deco === 'stripe') { x.save(); x.globalAlpha = 0.16; x.fillStyle = th.acc; x.beginPath(); x.moveTo(760, 0); x.lineTo(1200, 0); x.lineTo(1200, 300); x.lineTo(560, 470); x.closePath(); x.fill(); x.globalAlpha = 0.5; x.fillRect(0, 462, W, 8); x.restore(); }
    if (dz.deco === 'ring') { x.save(); x.strokeStyle = th.acc; x.globalAlpha = 0.25; x.lineWidth = 3; [220, 300, 380].forEach((r) => { x.beginPath(); x.arc(1080, 120, r, 0, 7); x.stroke(); }); x.restore(); }
    // 사진 영역
    const PY = top ? 0 : 470, PH = top ? 790 : 330;
    if (photo) {
      const r = Math.max(W / photo.width, PH / photo.height) * 1.0;
      const dw = photo.width * r, dh = photo.height * r;
      x.save(); x.beginPath(); x.rect(0, PY, W, PH); x.clip();
      x.drawImage(photo, (W - dw) / 2, PY + (PH - dh) * (top ? 0.5 : 0.62), dw, dh); x.restore();
      let f = x.createLinearGradient(0, PY, 0, PY + (top ? 220 : 150)); f.addColorStop(0, top ? 'rgba(0,0,0,.75)' : th.bg2); f.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = f; x.fillRect(0, PY, W, top ? 220 : 150);
      if (top) { f = x.createLinearGradient(0, 430, 0, PH); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(0.55, th.bg + 'cc'); f.addColorStop(1, th.bg); x.fillStyle = f; x.fillRect(0, 430, W, PH - 430); }
      f = x.createLinearGradient(0, PY + PH - 90, 0, PY + PH); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = f; x.fillRect(0, PY + PH - 90, W, 90);
    } else {
      x.save(); x.globalAlpha = 0.08; x.font = `900 ${fit(C.name.replace(/ .*/, ''), 300, 1150, 900)}px ${FONT}`; x.fillStyle = th.fg; x.textAlign = 'center'; x.fillText(C.name.replace(/ .*/, ''), W / 2, (top ? 150 : PY) + 270); x.restore();
      const body = { sedan: 'M8 40 L16 30 Q22 22 40 21 L58 14 Q66 11 80 12 L92 14 Q100 16 106 24 L114 30 Q118 32 118 38 L118 44 L8 44 Z', suv: 'M8 42 L10 26 Q12 18 24 17 L40 10 Q46 8 56 8 L96 8 Q104 8 108 16 L114 28 Q118 30 118 36 L118 44 L8 44 Z', suv_s: 'M10 42 L12 28 Q14 20 26 19 L42 12 Q48 10 58 10 L90 10 Q98 10 102 18 L110 28 Q114 30 114 36 L114 44 L10 44 Z', mpv: 'M8 42 L8 22 Q8 12 20 10 L30 6 Q36 4 46 4 L104 4 Q114 4 116 14 L118 36 L118 44 L8 44 Z', truck: 'M6 42 L6 18 Q6 10 14 10 L36 10 Q42 10 42 18 L42 26 L118 26 L118 44 L6 44 Z', mini: 'M16 42 L18 22 Q20 10 34 8 L78 8 Q92 8 96 20 L102 32 Q106 34 106 38 L106 44 L16 44 Z' }[C.body];
      x.save(); x.translate(W / 2 - 126 * 3.0 / 2, (top ? 150 : PY) + 80); x.scale(3.0, 3.0);
      const cg = x.createLinearGradient(0, 0, 0, 46); cg.addColorStop(0, th.acc); cg.addColorStop(1, th.acc2);
      x.fillStyle = cg; x.fill(new Path2D(body));
      (C.body === 'mini' ? [34, 88] : C.body === 'truck' ? [24, 98] : [30, 96]).forEach((wx) => { x.beginPath(); x.arc(wx, 45, 8, 0, 7); x.fillStyle = '#111'; x.fill(); x.beginPath(); x.arc(wx, 45, 3.4, 0, 7); x.fillStyle = '#bbb'; x.fill(); });
      x.restore();
      x.save(); x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(W / 2, (top ? 150 : PY) + 228, 240, 14, 0, 0, 7); x.fill(); x.restore();
    }
    // 상단 브랜드
    if (logo) x.drawImage(logo, 64, 58, 210, 210 * logo.height / logo.width);
    x.fillStyle = th.acc; x.fillRect(296, 54, 3, 40);
    const br = $('#y-branch').value || '대전충남지역본부';
    T(br, 318, 87, fit(br, 34, 470, 800), { w: 800 });
    T('NOVEMBER 2026', W - 64, 84, 20, { a: 'right', c: th.sub, ls: 5, w: 600 });
    // 라벨 + 헤드라인
    const hx = center ? W / 2 : 64, al = center ? 'center' : 'left';
    const [l1, l2] = split2(cp.head);
    const po = dz.label === 'pill' ? 14 : 0;
    const yL = top ? 470 : 172, y1 = (top ? 560 : 270) + po, y2h = (top ? 668 : 378) + po;
    const lab = `${st.sgg}${st.dong ? ' ' + st.dong : ''}  ·  ${cp.badge}`, ls = Math.round(26 * dz.ss);
    if (dz.label === 'pill') {
      x.save(); x.font = `800 ${ls}px ${FONT}`; x.letterSpacing = '2px'; const lw = x.measureText(lab).width + 44; x.restore();
      const lx = center ? W / 2 - lw / 2 : 64;
      x.fillStyle = th.acc; x.beginPath(); x.roundRect(lx, yL - ls - 20, lw, ls + 22, (ls + 22) / 2); x.fill();
      T(lab, lx + 22, yL - 9, ls, { c: '#1a1206', ls: 2, w: 800 });
    } else {
      if (dz.label === 'line') { x.fillStyle = th.acc; if (center) { x.fillRect(W / 2 - 30, yL - ls - 22, 60, 4); } else x.fillRect(64, yL - ls - 22, 60, 4); }
      T(lab, hx, yL, ls, { c: th.acc, ls: 6, w: 700, a: al });
    }
    T(l1, hx, y1, fit(l1, Math.round(92 * dz.hs), 1072, 400), { w: 400, a: al });
    if (l2) T(l2, hx, y2h, fit(l2, Math.round(100 * dz.hs), 1072, 900), { w: 900, c: th.acc, a: al });
    T(cp.sub, hx, (l2 ? y2h : y1) + 62, fit(cp.sub, Math.round(30 * dz.ss), 1072, 500), { w: 500, c: th.sub, a: al });
    // 혜택 카드
    const CY = 800;
    x.fillStyle = th.card; x.fillRect(0, CY, W, 545);
    T(`01   ${TYPES[st.type].label}`, center ? W / 2 : 64, CY + 66, Math.round(24 * dz.ss), { c: th.acc2, ls: 4, w: 700, a: center ? 'center' : 'left' });
    x.fillStyle = th.acc2; x.fillRect(64 + 34 + x.measureText('').width, CY + 0, 0, 0);
    const nm = C.name; const nmS = fit(nm, 54, 700, 900);
    if (center) {
      T(nm, W / 2, CY + 140, nmS, { w: 900, c: th.ink, a: 'center' });
    } else {
      T(nm, 64, CY + 140, nmS, { w: 900, c: th.ink });
      if (P.side) { T(P.side[0], W - 64, CY + 74, Math.round(24 * dz.ss), { a: 'right', c: th.muted, ls: 3, w: 500 }); T(P.side[1], W - 64, CY + 130, fit(P.side[1], 44, 380, 800), { a: 'right', c: th.ink, w: 800 }); }
    }
    // 큰 숫자
    if (P.num) {
      const ns = P.num.length > 3 ? 190 : 250;
      x.save(); x.font = `900 ${ns}px ${FONT}`; const nw = x.measureText(P.num).width;
      x.font = `900 72px ${FONT}`; const uw = Math.max(x.measureText(P.u1).width, x.measureText(P.u2).width); x.font = `500 34px ${FONT}`; const tw = Math.min(x.measureText(P.top).width, 420);
      const gx = center ? Math.max(40, (W - (nw + 26 + Math.max(uw, tw))) / 2) : 56;
      x.font = `900 ${ns}px ${FONT}`;
      const ng = x.createLinearGradient(0, CY + 170, 0, CY + 400); ng.addColorStop(0, th.acc); ng.addColorStop(1, th.acc2);
      if (dz.num === 'outline') { x.lineWidth = 7; x.strokeStyle = th.acc2; x.strokeText(P.num, gx, CY + 380); }
      else if (dz.num === 'boxed') { x.fillStyle = th.ink; x.beginPath(); x.roundRect(gx - 14, CY + 186, nw + 28, ns * 0.86, 22); x.fill(); x.fillStyle = th.acc; x.fillText(P.num, gx, CY + 380 - ns * 0.02); }
      else { x.fillStyle = ng; x.fillText(P.num, gx, CY + 380); }
      x.restore();
      const ux = gx + nw + 26;
      T(P.top, ux, CY + 232, fit(P.top, Math.round(34 * dz.ss), W - ux - 40, 500), { c: th.muted, w: 500 });
      T(P.u1, ux, CY + 308, 72, { w: 900, c: th.ink });
      T(P.u2, ux, CY + 384, 72, { w: 900, c: th.acc2 });
    } else {
      T(P.text, center ? W / 2 : 64, CY + 330, fit(P.text, 110, 1072, 900), { w: 900, c: th.acc2, a: center ? 'center' : 'left' });
    }
    // 3단 조건
    x.fillStyle = th.ink; x.fillRect(64, CY + 420, W - 128, 3);
    const cw = (W - 128) / 3;
    P.cols.forEach(([lab, val], i) => {
      const cx = 64 + i * cw + (i ? 28 : 0);
      if (i) { x.fillStyle = 'rgba(0,0,0,.15)'; x.fillRect(64 + i * cw, CY + 446, 2, 84); }
      T(lab, cx, CY + 470, Math.round(22 * dz.ss), { c: th.muted, w: 500 });
      T(val, cx, CY + 518, fit(val, 34, cw - 40, 800), { w: 800, c: th.ink });
    });
    // 일시·장소·문의
    const IY = CY + 545;
    x.fillStyle = th.bg; x.fillRect(0, IY, W, 186);
    [['일시', $('#y-when').value], ['장소', $('#y-place').value], ['문의', $('#y-phone').value || '가까운 현대자동차 지점·대리점']].forEach(([k, v], i) => {
      T(k, 64, IY + 58 + i * 50, 26, { c: th.acc, w: 800, ls: 2 });
      T(String(v || ''), 160, IY + 58 + i * 50, fit(String(v || ''), 30, W - 224, 700), { w: 700 });
    });
    // 쿠폰 띠
    let y2 = IY + 186;
    if (cp.ksf) {
      x.fillStyle = '#c8342e'; x.fillRect(0, y2, W, 60);
      T(cp.ksf, W / 2, y2 + 41, fit(cp.ksf, 28, W - 120, 800), { a: 'center', w: 800, c: '#fff' });
      y2 += 60;
    }
    // 하단
    x.fillStyle = th.foot; x.fillRect(0, y2, W, H - y2);
    const cta = cp.cta;
    T(cta, W / 2, y2 + 54, fit(cta, 38, W - 120, 800), { a: 'center', w: 800, c: th.acc });
    const fine = `※ ${cp.cond} · 세부 조건은 지점 문의 · 금융은 현대캐피탈 심사 기준`;
    T(fine, W / 2, y2 + 92, fit(fine, 18, W - 120, 400), { a: 'center', c: th.sub, w: 400 });
    if (H - y2 > 130) T('HYUNDAI   대전충남지역본부', W / 2, H - 22, 18, { a: 'center', c: th.sub, ls: 3, w: 600 });
  }

  /* ---------- 문자·체크리스트 ---------- */
  function smsBlock(cp) {
    const C = CARS[st.car];
    const branch = $('#y-branch').value || '현대자동차';
    const phone = $('#y-phone').value || '지점 번호';
    const shortT = `[${branch}] ${C.name} ${cp.big}! ${$('#y-when').value} ${$('#y-place').value}. 문의 ${phone}`;
    const longT = `[${branch}]\n${cp.head}\n\n${C.name} — ${cp.big}\n· ${cp.bullets.join('\n· ')}\n${cp.ksf ? `· ${cp.ksf}\n` : ''}\n일시: ${$('#y-when').value}\n장소: ${$('#y-place').value}\n문의: ${phone}\n\n※ ${cp.cond}. 세부 조건은 지점에 문의하세요.`;
    const box = (title, txt) => {
      const pre = h('pre', { class: 'memo', text: txt });
      const btn = h('button', { type: 'button', class: 'copy-btn', text: '복사', onclick: async (e) => { const b = e.currentTarget; try { await navigator.clipboard.writeText(txt); b.textContent = '복사했어요'; } catch (err) { b.textContent = '직접 선택해 복사하세요'; } setTimeout(() => { b.textContent = '복사'; }, 2000); } });
      return h('div', { class: 'sms-item' }, [h('div', { class: 'sms-top' }, [h('b', { text: title }), btn]), pre]);
    };
    $('#y-sms').replaceChildren(box(`짧은 문자 (${shortT.length}자)`, shortT), box('카카오톡·긴 문자', longT));
  }
  const CHECK = {
    drive: ['시승차 2~3대 확보 — 중점 차종 즉시 출고 재고 포함', '시승 보험·운전면허 확인 절차 준비', 'QR 사전예약 링크 만들어 문자·단지 게시판에 안내', '상담 테이블에서 월 납입금 바로 계산(금융상품 추천기)', '시승 고객 3일 안에 다시 연락'],
    leaflet: ['배포 장소: 추천 동 아파트 게시판·상가·주차장', '배포 시간: 평일 출퇴근(7–9시, 18–20시)·주말 오전', '전단 문구의 금융 조건·마감일 최종 확인', '문의 전화·담당자 이름 확인', '배포 후 문의 건수 기록'],
    festival: ['주최 측에 부스 신청·위치 확인', '전시차 1~2대, 차량 이동 허가 확인', '코리아세일페스타 응모 안내 QR 준비', '사은품·상담 명단(개인정보 동의서) 준비', '방문객 3일 안에 다시 연락'],
    movein: ['입주예정자협의회·관리사무소에 박람회 부스 문의', '입주일 맞춤 출고 일정표 준비', '단지 게시판 전단·엘리베이터 광고 협의', '타던 차 매각(트레이드인) 상담 준비', '입주 축하 사은품 준비'],
    group: ['기관·회사 담당자와 일정·장소 협의', '재직 확인 서류 안내(재직증명서)', '임직원·그룹사 특화 할부 조건표 준비', '점심시간 시승 동선(주차장) 확보', '상담 명단 3일 안에 다시 연락'],
  };
  function checkBlock(src) {
    const ranked = rankDongs().slice(0, 3);
    const r = D.dong.find((x) => x.sgg === st.sgg && x.dong === st.dong);
    const hh = r ? Math.round(r.pop / 2.3) : 0;
    const items = CHECK[st.type].slice();
    if (st.type === 'leaflet' && hh) items.splice(1, 0, `수량: ${st.dong} 약 ${fmt(hh)}세대 → 10% 배포 시 약 ${fmt(Math.round(hh / 10 / 50) * 50)}장`);
    $('#y-check').replaceChildren(
      h('ul', { class: 'check' }, items.map((c) => h('li', { text: c }))),
      h('p', { class: 'note' }, [h('b', { text: '추천 동 Top 3 ' }), ranked.map((x) => `${x.r.dong}(${x.tag})`).join(' · ')]),
      src ? h('p', { class: 'muted small' }, ['일정 출처: ', h('a', { href: src.url, target: '_blank', rel: 'noopener', text: `${src.src} (${src.date})` })]) : null,
    );
  }

  /* ---------- 저장 ---------- */
  function savePng() {
    const cv = $('#y-canvas'); if (!cv) return;
    try {
      const a = document.createElement('a'); a.download = `flyer_${st.car}_${Date.now()}.png`; a.href = cv.toDataURL('image/png'); a.click();
    } catch (e) { alert('이 환경에서는 저장이 막혀 있어요. 전단 위에서 오른쪽 버튼 → 이미지 저장을 이용해 주세요.'); }
  }

  function render() {
    const src = autoFill();
    const cp = copy();
    let cv = $('#y-canvas'); if (!cv) { cv = h('canvas', { id: 'y-canvas', role: 'img', 'aria-label': '판촉 전단 미리보기' }); $('#y-flyer').replaceChildren(cv); }
    drawFlyer(cv, cp);
    smsBlock(cp); checkBlock(src);
    const C = CARS[st.car];
    $('#y-note').textContent = `${C.ksf ? '' : `${C.name}는 코리아세일페스타 쿠폰 대상이 아니라 쿠폰 문구를 넣지 않았어요. `}금융 조건은 11월 프로모션 기준이며, 배포 전 지점에서 한 번 더 확인하세요.`;
  }
  function init() {
    const sel = $('#y-sgg');
    ['대전', '세종', '충남'].forEach((sd) => {
      const g = h('optgroup', { label: sd });
      D.sgg.filter((r) => r.sido === sd).sort((a, b) => b.pop - a.pop).forEach((r) => g.append(h('option', { value: r.sgg, text: `${sd} ${r.sgg}` })));
      sel.append(g);
    });
    sel.value = st.sgg;
    sel.addEventListener('change', () => { st.sgg = sel.value; st.dong = null; resetAuto(); drawInputs(); render(); });
    $('#y-dong').addEventListener('change', (e) => { st.dong = e.target.value; if (!st.manual.place) resetAuto(); render(); });
    $('#y-when').addEventListener('input', () => { st.manual.when = true; render(); });
    $('#y-place').addEventListener('input', () => { st.manual.place = true; render(); });
    ['#y-branch', '#y-phone', '#y-org'].forEach((q) => $(q).addEventListener('input', () => render()));
    $('#y-reroll').addEventListener('click', () => { st.seed += 1; render(); });
    $('#y-redesign').addEventListener('click', () => { st.dseed += 1; render(); });
    $('#y-png').addEventListener('click', savePng);
    $('#y-print').addEventListener('click', () => window.print());
    drawInputs(); render();
  }
  window.FLY = { st, render, CARS, TARGETS };
  init();
})();
