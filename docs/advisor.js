/* 대전충남 11월 금융상품 추천기 — 2026년 11월 금융 프로모션 자료 기준 계산 (추정치) */
(function () {
  const D = window.DATA;
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const won = (v) => `${Math.round(v).toLocaleString('ko-KR')}만원`;
  const won1 = (v) => `${(Math.round(v * 10) / 10).toLocaleString('ko-KR')}만원`;
  const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
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

  /* ---------- 차종 (가격은 11월 자료의 산출 예시 가격) ---------- */
  const CARS = [
    { id: 'avante', name: '디 올 뉴 아반떼', ref: 2559, range: [2398, 2987], type: 'young', persona: '첫 차를 고르는 2030 직장인·사회초년생' },
    { id: 'avante_hev', name: '디 올 뉴 아반떼 하이브리드', ref: 3183, range: [3042, 3577], type: 'young', persona: '연비를 따지는 2030~40 출퇴근 고객' },
    { id: 'sonata', name: '쏘나타 디 엣지 (HEV 포함)', ref: 2933, type: 'senior', persona: '실속 중형 세단을 찾는 40~60대 재구매 고객' },
    { id: 'grandeur', name: '그랜저', ref: 4245, type: 'senior', persona: '그랜저·쏘나타를 오래 탄 50~60대 대차 고객' },
    { id: 'grandeur_hev', name: '그랜저 하이브리드', ref: 4833, type: 'senior', persona: '연비와 정숙성을 원하는 50~60대 대차 고객' },
    { id: 'kona', name: '코나 (HEV 포함)', ref: null, type: 'young', persona: '첫 SUV를 찾는 2030' },
    { id: 'tucson', name: '디 올 뉴 투싼', ref: 3140, type: 'family', persona: '실속 SUV를 찾는 3040 신혼·영유아 가구' },
    { id: 'santafe', name: '싼타페', ref: 4547, range: [3657, 4547], type: 'family', persona: '영유아·초등 자녀를 둔 3040 가구' },
    { id: 'santafe_hev', name: '싼타페 하이브리드', ref: 4977, type: 'family', persona: '연비까지 챙기는 3040 패밀리 가구' },
    { id: 'palisade', name: '팰리세이드', ref: 5586, range: [4383, 5586], type: 'family', persona: '대가족·다자녀 3040~50 고소득 가구' },
    { id: 'palisade_hev', name: '팰리세이드 하이브리드', ref: 6186, range: [4982, 6186], type: 'family', persona: '대가족·다자녀 3040~50 고소득 가구' },
    { id: 'staria', name: '더 뉴 스타리아 (HEV 포함)', ref: null, type: 'family', persona: '다자녀·조부모 동반 가구, 소상공인' },
    { id: 'casper', name: '캐스퍼', ref: null, type: 'senior', persona: '60대 이상 근거리 생활차·세컨드카 고객' },
    { id: 'ioniq5', name: '아이오닉 5', ref: 4735, ev: true, subsidy: 860, type: 'family', persona: '충전 여건이 있는 3040 맞벌이 가구' },
    { id: 'ioniq6', name: '아이오닉 6', ref: 4856, ev: true, subsidy: 996, type: 'young', persona: '주행거리를 중시하는 2030~40 출퇴근 고객' },
    { id: 'ioniq9', name: '아이오닉 9', ref: 6759, ev: true, subsidy: 487, type: 'family', persona: '다자녀·캠핑을 즐기는 3040 대가족' },
    { id: 'kona_ev', name: '코나 일렉트릭', ref: 4152, ev: true, subsidy: 778, type: 'young', persona: '출퇴근 거리가 짧은 2030~40' },
    { id: 'nexo', name: '디 올 뉴 넥쏘', ref: 8045, ev: true, subsidy: 3335, type: 'eco', persona: '수소충전소 인근 친환경 관심 고객' },
    { id: 'porter_ev', name: '포터 일렉트릭', ref: 4350, ev: true, subsidy: 1483, type: 'biz', persona: '소상공인·농업인 생업 운전자' },
    { id: 'porter', name: '포터 (LPG)', ref: null, type: 'biz', persona: '노후 1톤 트럭을 바꿀 생업 운전자' },
    { id: 'avante_n', name: '아반떼 N', ref: 3356, type: 'young', persona: '고성능에 관심 많은 2030' },
    { id: 'ioniq5n', name: '아이오닉 5 N', ref: 7879, ev: true, subsidy: 0, type: 'young', persona: '고성능 EV에 관심 많은 2030~40' },
    { id: 'ioniq6n', name: '아이오닉 6 N', ref: 7999, ev: true, subsidy: 444, type: 'young', persona: '고성능 EV에 관심 많은 2030~40' },
    { id: 'g80', name: '제네시스 G80', ref: 6063, genesis: true, type: 'premium', persona: '수입차를 타던 고소득 전문직·임원' },
    { id: 'gv70', name: '제네시스 GV70', ref: 5473, genesis: true, type: 'premium', persona: '수입 SUV를 고려하는 고소득 3040~50' },
    { id: 'gv80', name: '제네시스 GV80', ref: 6886, genesis: true, type: 'premium', persona: '대형 프리미엄 SUV를 찾는 40~50대' },
    { id: 'gv80_hev', name: '제네시스 GV80 하이브리드', ref: 7680, genesis: true, type: 'premium', persona: '대형 프리미엄 SUV를 찾는 40~50대' },
    { id: 'g90', name: '제네시스 G90', ref: 9748, genesis: true, type: 'premium', persona: '법인 임원·최고급 세단 고객' },
  ];
  const WHO = [
    ['indiv', '개인'], ['biz', '개인사업자'], ['corp', '법인'], ['small', '소상공인'], ['farm', '농업인'],
    ['multi', '다자녀 이주 가구'], ['staff', '임직원·그룹사'], ['taxi', '택시'], ['owner', '수입차·제네시스·현대EV 보유'], ['evre', '현대 EV 재구매'],
  ];
  const STD = { 36: 5.4, 48: 5.5, 60: 5.6 }; // 모빌리티 표준 할부 금리 (11월 자료 무이자 비교 금리)
  const LEASE = { // 60개월·연 2만km 월 납입금 (만원) [자료 As-is, To-be 일반리스, To-be 이용자명의리스]
    ioniq9: [103, 93, 88], ioniq5: [69, 53, 48], ioniq6: [70, 54, 50], kona_ev: [61, 50, 47],
  };
  const GLEASE = { // 제네시스 파이낸스 리스 60개월·2만km [기본, THE BETTER CHOICE, 생산월 조건]
    g90: [165, 157, 157], g80: [98, 93, 88], gv80: [106, 100, 100], gv80_hev: [115, 108, 108], gv70: [84, 79, 77],
  };
  const EVREF = { ioniq5: [25, 20], ioniq6: [23, 17], kona_ev: [21, 16] }; // 자료 예시 월 납입금 [선수 1%, 5%]

  function pay(F, B, rate, n) { const r = rate / 100 / 12; if (r === 0) return (F - B) / n; return (F - B / (1 + r) ** n) * r / (1 - (1 + r) ** -n); }
  function loan({ price, net, down, balloon, rate, n }) {
    const dn = price * down; const F = Math.max(0, net - dn); const B = Math.min(price * balloon, F);
    const m = pay(F, B, rate, n); const interest = m * n + B - F;
    return { dn, F, B, m, interest, rate, n };
  }

  /* ---------- 11월 금융상품 규칙 ---------- */
  function evaluate(ctx) {
    const { car, price, who, down, months } = ctx;
    const personal = who.indiv || who.biz || who.small || who.farm;
    const out = [];
    const add = (o) => out.push(Object.assign({ ok: true, why: [], extra: [], lost: 0, discount: 0, subsidy: 0 }, o));
    const id = car.id;
    let subsidy = car.ev ? car.subsidy || 0 : 0;
    if (id === 'porter_ev') subsidy += who.small ? 290 : who.farm ? 97 : 0;
    const cp = ctx.coupon && ksfOk(ctx)[0] ? ctx.coupon : 0;
    const net0 = price - subsidy - cp;

    // 1. 싼타페·팰리세이드 무이자
    if (/^(santafe|palisade)/.test(id)) {
      const ok = personal && !who.taxi;
      const d = Math.max(down, 0.2), L = loan({ price, net: net0, down: d, balloon: 0, rate: 0, n: months });
      const S = loan({ price, net: net0, down: d, balloon: 0, rate: STD[months], n: months });
      const lost = /^santafe/.test(id) ? 100 : 200;
      add({ id: 'zero', name: '싼타페·팰리세이드 최대 60개월 무이자', kind: '할부', deadline: '11.30 출고', ok, why: ok ? [] : ['개인·개인사업자만 대상'],
        loan: L, std: S, saved: S.interest - L.interest, lost, value: S.interest - L.interest - lost, downUsed: d,
        terms: `${months}개월 무이자(표준 ${STD[months]}%) · 선수율 20% 이상 · 모빌리티 할부 · 차종별 선착순 2,000대`,
        lostNote: /^santafe/.test(id) ? '싼타페 K-세일페스타 기본혜택 100만원 차감' : '팰리세이드 런칭 모델 생산월 조건 200만원 차감' });
    }
    // 2. 다자녀 이주 가구 싼타페 1.9%
    if (/^santafe/.test(id)) {
      const ok = who.multi && (who.indiv || who.biz) && !who.corp;
      const L = loan({ price, net: net0 - 100, down, balloon: 0, rate: 1.9, n: months }), S = loan({ price, net: net0 - 100, down, balloon: 0, rate: STD[months], n: months });
      add({ id: 'multi', name: '지방 이주 다자녀 가구 싼타페 1.9%', kind: '할부', deadline: '11.30 출고', ok, why: ok ? [] : ['2025년 이후 서울→지방 이주 + 미성년 자녀 2명 이상 가구(개인)만'],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, discount: 100, downUsed: down,
        terms: `전 구간 금리 1.9% · 리스·렌트는 10% 혜택 + 안전용품 키트 · K-세일페스타 100만원 혜택과 중복 여부는 영업점 확인` });
    }
    // 3. 쏘나타·스타리아 전용카드
    if (id === 'sonata' || id === 'staria') {
      const ok = personal && !who.taxi && !who.corp;
      const L = loan({ price, net: net0 - 25, down, balloon: 0, rate: STD[months], n: months });
      add({ id: 'card', name: '쏘나타·스타리아 전용카드 50만원', kind: '전용카드', deadline: '11.30 출고', ok, why: ok ? [] : ['개인·개인사업자만, 영업용·EV 제외'],
        loan: L, std: L, saved: 0, discount: 25, cashback: 25, value: 50, downUsed: down,
        terms: '차량가 25만원 할인 + 25만원 캐시백 · 현대·제네시스 전용카드로 1,000만원 이상 결제 및 세이브오토 · 현대캐피탈 할부와 중복 가능' });
    }
    // 4. 아반떼 퍼스트 무브
    if (id === 'avante' || id === 'avante_hev') {
      const ok = !who.staff;
      const d = Math.max(down, 0.01), L = loan({ price, net: net0, down: d, balloon: 0.7, rate: 2.8, n: 36 }), S = loan({ price, net: net0, down: d, balloon: 0.7, rate: 6.3, n: 36 });
      add({ id: 'firstmove', name: '디 올 뉴 아반떼 퍼스트 무브 플랜', kind: '유예형 할부', deadline: '12.31 출고', ok, why: ok ? [] : ['당사 임직원·대리점 등록인원 불가'],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, downUsed: d,
        terms: `36개월 금리 6.3% → 2.8% · 유예율 최대 70% · 만기 시 차량 반납으로 유예금 상환(신차 재구매 조건 없음)${who.corp ? ' · 법인은 잔가 보장 불가' : ''}` });
    }
    // 5. N-FINANCE
    if (/^(avante_n|ioniq5n|ioniq6n)$/.test(id)) {
      const ok = !who.staff; const rate = id === 'avante_n' ? 6.3 : 5.8; const d = Math.max(down, 0.1);
      const L = loan({ price, net: net0 - (id === 'avante_n' ? 0 : 100), down: d, balloon: 0.9, rate, n: 36 });
      add({ id: 'nfin', name: 'N-FINANCE 할부', kind: '유예형 할부', deadline: '11.30 출고', ok, why: ok ? [] : ['당사 임직원·대리점 등록인원 불가'],
        loan: L, std: L, saved: 0, value: 30, downUsed: d, discount: id === 'avante_n' ? 0 : 100,
        terms: `36개월 ${rate}% · 유예율 최대 90% · 중도상환 수수료 전 기간 면제 · 전용 사은품 4종${id === 'avante_n' ? '' : ' · 아이오닉 N은 현대·제네시스 재구매 필수'}` });
    }
    // 6. 현대 EV 부담 Down
    if (/^(ioniq5|ioniq6|kona_ev)$/.test(id)) {
      const ok = !who.staff && !who.taxi; const rate = who.evre ? 2.3 : 2.8; const d = Math.max(down, 0.01);
      const L = loan({ price, net: net0, down: d, balloon: 0.6, rate, n: 36 }), S = loan({ price, net: net0, down: d, balloon: 0.6, rate: 5.8, n: 36 });
      add({ id: 'evdown', name: '현대 EV 부담 Down', kind: '유예형 할부', deadline: '11.30 출고', ok, why: ok ? [] : [who.taxi ? '택시는 EV 택시 동반자 플랜 대상' : '당사 임직원·대리점 등록인원 불가'],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, subsidy, downUsed: d, ref: EVREF[id],
        terms: `36개월 금리 5.8% → ${rate}%${who.evre ? '(재구매 −0.5%p)' : ''} · 유예율 최대 60%(EV 재구매) 또는 55%(현대·제네시스 전 차종 재구매) · 스트레스 프리 패키지` });
    }
    // 7. EV 렌트·리스
    if (LEASE[id]) {
      const [asis, gen, own] = LEASE[id]; const ok = !who.staff && !who.taxi;
      add({ id: 'evlease', name: '현대 EV 렌트·리스 프로모션', kind: '렌트·리스', deadline: '11.30 출고', ok, why: ok ? [] : ['영업용 불가'],
        lease: { gen, own, asis }, value: (asis - gen) * 60 * 0.5, saved: 0, subsidy,
        terms: `60개월·연 2만km 월 ${gen}만원(일반리스)·${own}만원(이용자명의리스, 개인) — 기존 ${asis}만원 · 지자체 보조금이 소진돼도 리스 추가 보조금` });
    }
    // 8. 넥쏘 부담 Down
    if (id === 'nexo') {
      const d = Math.max(down, 0.05); const L = loan({ price, net: net0 - 200, down: d, balloon: 0.45, rate: 1.8, n: 39 }), S = loan({ price, net: net0 - 200, down: d, balloon: 0.45, rate: 5.9, n: 39 });
      add({ id: 'nexo', name: '넥쏘 부담 Down', kind: '유예형 할부', deadline: '11.30 출고', ok: !who.staff, why: who.staff ? ['당사 임직원 불가'] : [],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, subsidy, discount: 200, downUsed: d,
        terms: '39개월 금리 5.9% → 1.8% · 유예율 45% · 자료 예시 월 약 8만원(선수 5%, 트레이드인 200만 기준) · EV·FCEV 재구입 시 잔가 보장' });
    }
    // 9. 포터 EV 부담 Down
    if (id === 'porter_ev') {
      const d = Math.max(down, 0.01); const L = loan({ price, net: net0 - 200, down: d, balloon: 0.5, rate: 2.8, n: 36 }), S = loan({ price, net: net0 - 200, down: d, balloon: 0.5, rate: 5.4, n: 36 });
      add({ id: 'porterev', name: '포터 EV 부담 Down', kind: '유예형 할부', deadline: '11.30 출고', ok: !who.staff, why: who.staff ? ['당사 임직원 불가'] : [],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, subsidy, discount: 200, downUsed: d,
        terms: `36개월 금리 5.4% → 2.8% · 유예율 50% · 자료 예시 소상공인 월 10만원·농업인 15만원·일반 18만원 · 유예금은 반납 상환 불가(만기 후 2년 분납 가능)` });
    }
    // 10. EV 택시 동반자
    if (/^(ioniq5|ioniq6|kona_ev)$/.test(id)) {
      const R = { 36: 2.7, 48: 2.8, 60: 2.9 }, SR = { 36: 4.9, 48: 5.0, 60: 5.1 };
      const L = loan({ price, net: net0, down, balloon: 0, rate: R[months], n: months }), S = loan({ price, net: net0, down, balloon: 0, rate: SR[months], n: months });
      add({ id: 'taxi', name: 'EV 택시 동반자 플랜', kind: '할부', deadline: '11.30 출고', ok: !!who.taxi, why: who.taxi ? [] : ['개인·법인 택시만'],
        loan: L, std: S, saved: S.interest - L.interest, value: S.interest - L.interest, subsidy, downUsed: down,
        terms: `${months}개월 ${R[months]}%(표준 ${SR[months]}%) · 영업용·자가용 트림 모두` });
    }
    // 11. 임직원·그룹사 특화 할부
    if (/^(grandeur|palisade)/.test(id) || id === 'ioniq9' || /^(g80|gv80|gv70)$/.test(id)) {
      const isG = /^grandeur/.test(id); const rate = isG ? 5.8 : id === 'ioniq9' || /^g/.test(id) ? 5.8 : 6.3; const bal = id === 'ioniq9' ? 0.7 : 0.65;
      const L = loan({ price, net: net0, down: Math.max(down, 0.01), balloon: bal, rate, n: 36 }), S = loan({ price, net: net0, down: Math.max(down, 0.01), balloon: 0, rate, n: 36 });
      add({ id: 'staff', name: '임직원·그룹사 특화 할부', kind: '유예형 할부', deadline: '11.30 출고', ok: !!who.staff, why: who.staff ? [] : ['당사·계열사·관계사 재직자, 지정 블루핸즈 대표·임직원만'],
        loan: L, std: S, saved: 0, value: who.staff ? 300 : 0, subsidy, downUsed: Math.max(down, 0.01), monthlyCut: S.m - L.m,
        terms: `36개월 ${rate}% · 유예율 ${Math.round(bal * 100)}%로 상향 · 직원 할인 적용 시 월 납입금이 더 낮아짐(자료 예시: 할인 20% 기준 그랜저 HEV 월 35만·팰리세이드 HEV 월 39만·아이오닉 9 월 23만)` });
    }
    // 12. 제네시스 파이낸스
    if (car.genesis) {
      const g = GLEASE[id];
      add({ id: 'gfin', name: '제네시스 파이낸스 리스·렌트', kind: '렌트·리스', deadline: '11.30 출고', ok: true,
        lease: g ? { gen: who.owner ? g[1] : g[0], own: g[2], asis: g[0] } : null, value: who.owner ? 200 : 60, saved: 0,
        terms: `${g ? `60개월·2만km 리스 월 ${g[0]}만원` : '시장 내 최저 수준 월 납입금'}${who.owner ? ` → THE BETTER CHOICE 4% 적용 월 ${g ? g[1] : ''}만원` : ''} · DOUBLE-PICK(12·24개월) 4% 추가 · 중도상환 수수료 면제 프로그램` });
    }
    // 13. 표준 할부 (비교용)
    const ksfBase = /^santafe/.test(id) ? 100 : 0;
    const Ls = loan({ price, net: net0 - ksfBase, down, balloon: 0, rate: STD[months], n: months });
    add({ id: 'std', name: ksfBase ? '표준 할부 + 싼타페 K-세일페스타 100만원' : '표준 할부 (11월 전용 금융 없음)', kind: '할부', deadline: '—', ok: true,
      loan: Ls, std: Ls, saved: 0, value: ksfBase, discount: ksfBase, subsidy, downUsed: down,
      terms: `${months}개월 ${STD[months]}%(모빌리티 표준 할부 가정)${ksfBase ? ' · 싼타페 K-세일페스타 기본혜택 100만원' : ''}` });

    // 선택지 점수: 가능한 것 중 고객 혜택(이자 절감 + 할인 − 포기 혜택)이 가장 큰 것을 추천
    const usable = out.filter((p) => p.ok);
    usable.forEach((p) => { p.score = p.value + (p.discount || 0) + (p.cashback || 0) - (p.lost || 0); });
    const best = usable.filter((p) => p.id !== 'std').sort((a, b) => b.score - a.score)[0] || usable.find((p) => p.id === 'std');
    best.best = true;
    out.forEach((p) => { p.coupon = cp; });
    return { list: out, best, subsidy, coupon: cp };
  }
  function ksfOk(ctx) {
    const { car, who } = ctx;
    if (['casper', 'tucson', 'gv80_hev'].includes(car.id)) return [false, '캐스퍼·캐스퍼 일렉트릭·디 올 뉴 투싼·GV80 하이브리드는 쿠폰 제외'];
    if (who.taxi) return [false, '택시는 쿠폰 제외'];
    if (who.corp && !(who.indiv || who.biz)) return [false, '개인·개인사업자만 사용 가능'];
    if (who.staff) return [false, '현대자동차·유관사 직원은 사용 불가'];
    return [true, ''];
  }

  /* ---------- 정장 차림 상담원 일러스트 ---------- */
  function man() {
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
      s('ellipse', { cx: 70, cy: 68, rx: 6, ry: 4.5, fill: '#8a4b33', class: 'mouth' }),
      s('circle', { cx: 57, cy: 66, r: 3, fill: '#f0a58a', opacity: 0.5 }), s('circle', { cx: 83, cy: 66, r: 3, fill: '#f0a58a', opacity: 0.5 }),
    ]);
    [[18, 30], [124, 22], [12, 92]].forEach(([x, y], i) => sv.append(s('path', { d: `M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`, fill: '#e2b66f', class: `spark sp${i}` })));
    return sv;
  }
  /* ---------- 일러스트 아이콘 (자체 제작 SVG) ---------- */
  const N = '#002c5f', G = '#c8893a', BG = '#e8eef7';
  const ICONS = {
    form: `<rect x="14" y="11" width="20" height="27" rx="3" fill="#fff" stroke="${N}" stroke-width="2.5"/><rect x="19" y="8" width="10" height="6" rx="2" fill="${N}"/><path d="M18 21h12M18 27h8" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/><path d="M27 31l3 3 6-7" stroke="${G}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    target: `<circle cx="24" cy="24" r="13" fill="#fff" stroke="${N}" stroke-width="2.5"/><circle cx="24" cy="24" r="8" fill="none" stroke="${N}" stroke-width="2.5"/><circle cx="24" cy="24" r="3.2" fill="${G}"/><path d="M24 24l12-12M32 11l4 1 1 4" stroke="${G}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    money: `<rect x="7" y="14" width="25" height="17" rx="3" fill="${N}"/><rect x="7" y="18" width="25" height="3.5" fill="${G}"/><rect x="11" y="25" width="7" height="2.5" rx="1" fill="#9fb3cc"/><circle cx="33" cy="31" r="8.5" fill="${G}" stroke="#fff" stroke-width="2"/><text x="33" y="35.5" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">₩</text>`,
    calc: `<rect x="14" y="8" width="20" height="32" rx="3.5" fill="${N}"/><rect x="17.5" y="11.5" width="13" height="7" rx="1.5" fill="#cfe8d6"/><g fill="#fff">${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${19.5 + c * 4.5}" cy="${24 + r * 5}" r="1.6"${r === 2 && c === 2 ? ` fill="${G}"` : ''}/>`).join('')).join('')}</g>`,
    chat: `<path d="M8 12h22a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H17l-6 5v-5H8a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill="${N}"/><path d="M12 19h14M12 23h9" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M40 22H28a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7l5 4v-4a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3z" fill="${G}"/><circle cx="30" cy="28.5" r="1.4" fill="#fff"/><circle cx="34" cy="28.5" r="1.4" fill="#fff"/><circle cx="38" cy="28.5" r="1.4" fill="#fff"/>`,
    hello: `<circle cx="22" cy="25" r="11" fill="#f2c9a5"/><path d="M11 23q1-11 11-11 10 0 11 10-5-5-11-5-6 0-11 6z" fill="#2a1d16"/><circle cx="18" cy="25" r="1.4" fill="#2a1d16"/><circle cx="26" cy="25" r="1.4" fill="#2a1d16"/><path d="M18 30q4 3 8 0" stroke="#8a4b33" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M36 12q4 4 0 8M39 9q7 7 0 14" stroke="${G}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    ask: `<path d="M10 10h28a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-7 6v-6h-5a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="${N}"/><text x="24" y="28.5" text-anchor="middle" font-size="18" font-weight="800" fill="${G}">?</text>`,
    car: `<path d="M8 30v-5l5-1 5-7h13l6 7 4 1v5z" fill="${N}"/><path d="M19.5 18.5h5v5.5h-9zM26.5 18.5h4l4.5 5.5h-8.5z" fill="#cfe0f5"/><circle cx="15" cy="31" r="4.2" fill="#1b1b1b" stroke="#fff" stroke-width="2"/><circle cx="34" cy="31" r="4.2" fill="#1b1b1b" stroke="#fff" stroke-width="2"/><rect x="38" y="26" width="3" height="2" rx="1" fill="${G}"/>`,
    won: `<circle cx="24" cy="25" r="13" fill="${G}"/><circle cx="24" cy="25" r="10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><text x="24" y="30.5" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">₩</text><path d="M37 11l2 4 4 1-4 2-2 4-1-4-4-2 4-1z" fill="${N}"/>`,
    gift: `<rect x="11" y="20" width="26" height="18" rx="2" fill="${G}"/><rect x="9" y="15" width="30" height="7" rx="2" fill="#e2b66f"/><rect x="22" y="15" width="4" height="23" fill="${N}"/><path d="M24 15q-9-9-11-2-1 4 11 2zM24 15q9-9 11-2 1 4-11 2z" fill="${N}"/><text x="31" y="33" text-anchor="middle" font-size="7" font-weight="800" fill="#fff">K</text>`,
    care: `<rect x="15" y="7" width="18" height="33" rx="3.5" fill="${N}"/><rect x="17.5" y="11" width="13" height="23" rx="1.5" fill="#fff"/><path d="M24 29s-5-3-5-6.5a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1C29 26 24 29 24 29z" fill="${G}"/><circle cx="24" cy="37" r="1.3" fill="#fff"/>`,
    cal: `<rect x="11" y="13" width="26" height="24" rx="3" fill="#fff" stroke="${N}" stroke-width="2.5"/><rect x="11" y="13" width="26" height="7" rx="3" fill="${N}"/><path d="M17 10v6M31 10v6" stroke="${N}" stroke-width="2.5" stroke-linecap="round"/><g fill="${G}"><circle cx="18" cy="26" r="1.8"/><circle cx="24" cy="26" r="1.8"/><circle cx="30" cy="26" r="1.8"/><circle cx="18" cy="32" r="1.8"/><circle cx="24" cy="32" r="1.8"/></g>`,
    defer: `<rect x="9" y="13" width="22" height="22" rx="3" fill="#fff" stroke="${N}" stroke-width="2.5"/><rect x="9" y="13" width="22" height="6" rx="3" fill="${N}"/><path d="M14 27h10" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/><path d="M30 33q8 0 8-8M34 22l4 3 3-4" stroke="${G}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    key: `<circle cx="17" cy="24" r="7.5" fill="none" stroke="${N}" stroke-width="3.2"/><circle cx="17" cy="24" r="2" fill="${G}"/><path d="M24.5 24H39M34 24v5M38.5 24v4" stroke="${N}" stroke-width="3.2" stroke-linecap="round"/>`,
    card: `<rect x="8" y="13" width="32" height="22" rx="3.5" fill="${N}"/><rect x="8" y="18" width="32" height="4" fill="${G}"/><rect x="12" y="27" width="6" height="4" rx="1" fill="#e2b66f"/><path d="M27 29h9" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/>`,
    check: `<rect x="12" y="10" width="24" height="29" rx="3" fill="#fff" stroke="${N}" stroke-width="2.5"/><path d="M17 19l2 2 4-4M17 28l2 2 4-4" stroke="${G}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 19h5M26 28h5" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/>`,
    docs: `<path d="M15 9h13l7 7v22a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z" fill="#fff" stroke="${N}" stroke-width="2.5"/><path d="M28 9v7h7" fill="none" stroke="${N}" stroke-width="2.5"/><path d="M18 23h12M18 28h12M18 33h7" stroke="#9fb3cc" stroke-width="2" stroke-linecap="round"/><circle cx="33" cy="35" r="5" fill="${G}"/><path d="M31 35l1.5 1.5 2.5-3" stroke="#fff" stroke-width="1.8" fill="none"/>`,
    qa: `<circle cx="18" cy="21" r="10" fill="${N}"/><text x="18" y="25.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">Q</text><circle cx="31" cy="30" r="10" fill="${G}"/><text x="31" y="34.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">A</text>`,
    shield: `<path d="M24 8l13 5v10c0 9-6 14-13 17-7-3-13-8-13-17V13z" fill="${N}"/><path d="M18 24l4 4 8-8" stroke="${G}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    warn: `<path d="M24 9l16 28H8z" fill="${G}" stroke="${G}" stroke-width="2" stroke-linejoin="round"/><path d="M24 19v8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="32" r="1.8" fill="#fff"/>`,
  };
  function ico(name, cls = 'ico') {
    const w = h('span', { class: cls, 'aria-hidden': 'true' });
    w.innerHTML = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${BG}"/>${ICONS[name] || ''}</svg>`;
    return w;
  }
  const ih = (tag, name, text, cls) => h(tag, { class: `ico-h ${cls || ''}` }, [ico(name), h('span', { text })]);
  const KIND_ICON = { '할부': 'cal', '유예형 할부': 'defer', '렌트·리스': 'key', '전용카드': 'card' };

  /* ---------- 고객 일러스트 (차종 고객군별) ---------- */
  const CUST = {
    family: { hair: '#3b2a20', top: '#e9897e', long: true, kid: true, reply: '아이들 태우기 딱 좋겠네요! 월 납입금 다시 보여 주세요.' },
    young: { hair: '#1f1a17', top: '#4a90c2', reply: '월 그 정도면 저도 해 볼 만하겠는데요?' },
    senior: { hair: '#b9b9b9', top: '#b89a6a', glasses: true, reply: '오래 탔으니 이번엔 바꿔 볼까 싶네요.' },
    biz: { hair: '#2a1d16', top: '#e0893a', cap: '#3d5a2f', reply: '장사하는 데 기름값 줄면 좋지요.' },
    eco: { hair: '#2a1d16', top: '#3f9a6b', reply: '충전소만 가까우면 바로 하고 싶어요.' },
    premium: { hair: '#2a1d16', top: '#3b3b45', long: true, earring: true, reply: '갈아타는 조건, 한번 자세히 볼게요.' },
  };
  function customer(type) {
    const c = CUST[type] || CUST.family;
    const kids = c.kid ? [
      s('rect', { x: 104, y: 160, width: 9, height: 32, rx: 3, fill: '#4a5d7a' }), s('rect', { x: 115, y: 160, width: 9, height: 32, rx: 3, fill: '#4a5d7a' }),
      s('path', { d: 'M100 134 Q102 126 114 126 Q126 126 128 134 L128 164 L100 164 Z', fill: '#f2c14e' }),
      s('circle', { cx: 114, cy: 112, r: 14, fill: '#f2c9a5' }),
      s('path', { d: 'M100 110 Q101 96 114 96 Q127 96 128 110 Q120 103 114 104 Q106 104 100 110 Z', fill: c.hair }),
      s('circle', { cx: 109, cy: 113, r: 1.8, fill: '#2a1d16' }), s('circle', { cx: 119, cy: 113, r: 1.8, fill: '#2a1d16' }),
      s('path', { d: 'M109 119 Q114 123 119 119', stroke: '#8a4b33', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }),
    ] : [];
    const sv = s('svg', { viewBox: c.kid ? '0 0 140 210' : '10 0 120 210', class: 'cust', 'aria-hidden': 'true' }, [
      s('ellipse', { cx: 62, cy: 204, rx: c.kid ? 64 : 36, ry: 5, fill: 'rgba(0,0,0,.12)' }),
      s('rect', { x: 45, y: 150, width: 15, height: 48, rx: 4, fill: '#33415c' }), s('rect', { x: 64, y: 150, width: 15, height: 48, rx: 4, fill: '#33415c' }),
      s('path', { d: 'M42 198 h20 v6 h-22 z M64 198 h20 v6 h-22 z', fill: '#4a3a30' }),
      s('path', { d: 'M34 100 Q36 88 50 86 L74 86 Q88 88 90 100 L92 156 L32 156 Z', fill: c.top }),
      s('path', { d: 'M34 104 Q26 126 30 148 L38 148 L40 112 Z', fill: c.top }), s('circle', { cx: 34, cy: 150, r: 5.5, fill: '#f2c9a5' }),
      s('path', { d: 'M90 104 Q98 126 94 148 L86 148 L84 112 Z', fill: c.top }), s('circle', { cx: 90, cy: 150, r: 5.5, fill: '#f2c9a5' }),
      c.top === '#3b3b45' ? s('path', { d: 'M52 86 L62 104 L72 86 Z', fill: '#f4f1ea' }) : s('path', { d: 'M52 86 Q62 96 72 86', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 3, fill: 'none' }),
      s('rect', { x: 56, y: 74, width: 12, height: 14, rx: 4, fill: '#eab894' }),
      c.long ? s('path', { d: 'M40 58 Q38 32 62 31 Q86 32 84 58 L86 84 Q78 88 76 70 L48 70 Q46 88 38 84 Z', fill: c.hair }) : null,
      s('circle', { cx: 62, cy: 56, r: 21, fill: '#f2c9a5' }),
      c.long ? s('path', { d: 'M41 54 Q42 34 62 34 Q82 34 83 54 Q74 42 60 44 Q48 46 41 54 Z', fill: c.hair })
        : c.cap ? s('path', { d: 'M40 50 Q42 30 62 30 Q82 30 84 50 L96 52 Q94 56 84 55 L40 55 Z', fill: c.cap })
          : s('path', { d: 'M41 54 Q40 33 62 33 Q84 33 83 52 Q76 42 64 43 Q50 44 41 54 Z', fill: c.hair }),
      s('circle', { cx: 55, cy: 58, r: 2.3, fill: '#2a1d16' }), s('circle', { cx: 69, cy: 58, r: 2.3, fill: '#2a1d16' }),
      c.glasses ? s('g', { stroke: '#555', 'stroke-width': 1.6, fill: 'none' }, [s('circle', { cx: 55, cy: 58, r: 5.5 }), s('circle', { cx: 69, cy: 58, r: 5.5 }), s('path', { d: 'M60.5 58 h3' })]) : null,
      s('path', { d: 'M55 66 Q62 71 69 66', stroke: '#8a4b33', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }),
      s('circle', { cx: 50, cy: 64, r: 3, fill: '#f0a58a', opacity: 0.5 }), s('circle', { cx: 74, cy: 64, r: 3, fill: '#f0a58a', opacity: 0.5 }),
      c.earring ? s('circle', { cx: 41.5, cy: 64, r: 2, fill: G }) : null,
      ...kids,
    ].filter(Boolean));
    return sv;
  }
  function scene(car, lines) {
    const c = CUST[car.type] || CUST.family;
    const m = man(); m.classList.add('talk');
    return h('div', { class: 'scene' }, [
      h('div', { class: 'scene-fig' }, [m, h('span', { class: 'scene-name', text: '카마스터' })]),
      h('div', { class: 'scene-mid' }, [
        h('div', { class: 'say-box' }, [h('span', { text: '핵심 한 마디' }), ...lines.map((l) => h('p', { text: `“${l}”` }))]),
        h('div', { class: 'reply' }, [h('span', { text: '고객님' }), h('p', { text: `“${c.reply}”` })]),
      ]),
      h('div', { class: 'scene-fig cust-fig' }, [customer(car.type), h('span', { class: 'scene-name', text: car.persona.split(' ').slice(-2).join(' ') })]),
    ]);
  }
  const josa = (w) => { const c = w.trim().slice(-1).charCodeAt(0); if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 ? '은' : '는'; return '는'; };
  const josaR = (w) => { const c = w.trim().slice(-1).charCodeAt(0); if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 ? '을' : '를'; return '를'; };

  /* ---------- 입력 ---------- */
  const st = { area: '세종시', car: 'santafe_hev', band: null, price: 4977, who: { indiv: true }, down: 0.2, months: 60, pick: null, coupon: 0 };
  const sidoOf = (sgg) => (D.sgg.find((r) => r.sgg === sgg) || {}).sido;
  const areaLabel = () => (st.area ? `${sidoOf(st.area)} ${st.area}` : '대전충남 전체(지역 선택 안 함)');
  function initForm() {
    const area = $('#f-area');
    area.append(h('option', { value: '', text: '선택 안 함 (대전·세종·충남 전체)' }));
    ['대전', '세종', '충남'].forEach((sd) => {
      const g = h('optgroup', { label: sd });
      D.sgg.filter((r) => r.sido === sd).sort((a, b) => b.pop - a.pop).forEach((r) => g.append(h('option', { value: r.sgg, text: `${sd} ${r.sgg}` })));
      area.append(g);
    });
    area.value = st.area;
    const car = $('#f-car');
    [['현대 승용', (c) => !c.ev && !c.genesis && !/porter/.test(c.id)], ['전기·수소', (c) => c.ev && !/porter/.test(c.id)], ['소형 상용', (c) => /porter/.test(c.id)], ['제네시스', (c) => c.genesis]].forEach(([lab, f]) => {
      const g = h('optgroup', { label: lab }); CARS.filter(f).forEach((c) => g.append(h('option', { value: c.id, text: c.name }))); car.append(g);
    });
    car.value = st.car;
    $('#f-who').replaceChildren(...WHO.map(([k, lab]) => h('button', { type: 'button', 'aria-pressed': String(!!st.who[k]), 'data-k': k, text: lab, onclick: (e) => { st.who[k] = !st.who[k]; if (!Object.values(st.who).some(Boolean)) st.who.indiv = true; st.pick = null; e.currentTarget.setAttribute('aria-pressed', String(!!st.who[k])); render(); } })));
    area.addEventListener('change', () => { st.area = area.value; st.pick = null; render(); });
    car.addEventListener('change', () => { st.car = car.value; const c = CARS.find((x) => x.id === st.car); st.price = c.ref || (st.band ? st.band * 1000 + 500 : 3500); st.band = null; st.pick = null; st.down = /^(santafe|palisade)/.test(c.id) ? 0.2 : c.id === 'nexo' ? 0.05 : c.ev ? 0.01 : 0.1; syncPrice(); render(); });
    $('#f-price').addEventListener('input', (e) => { const v = Number(e.target.value); if (v > 0) { st.price = v; st.band = null; drawBands(); render(); } });
    $('#f-down').addEventListener('input', (e) => { st.down = Number(e.target.value) / 100; st.pick = null; render(); });
    $('#f-months').addEventListener('change', (e) => { st.months = Number(e.target.value); st.pick = null; render(); });
    const drawCoupon = () => $('#f-coupon').replaceChildren(...[[0, '미응모·미당첨'], [50, '50만원 당첨'], [100, '100만원 당첨']].map(([v, lab]) => h('button', { type: 'button', 'aria-pressed': String(st.coupon === v), text: lab, onclick: () => { st.coupon = v; drawCoupon(); render(); } })));
    drawCoupon();
    syncPrice();
  }
  function drawBands() {
    const cur = Math.floor(st.price / 1000);
    $('#f-band').replaceChildren(...[2, 3, 4, 5, 6, 7, 8, 9].map((b) => h('button', { type: 'button', 'aria-pressed': String(cur === b), text: `${b}000만원대`, onclick: () => {
      const c = CARS.find((x) => x.id === st.car); st.band = b;
      st.price = c.ref && Math.floor(c.ref / 1000) === b ? c.ref : b * 1000 + 500; syncPrice(); st.pick = null; render();
    } })));
  }
  function syncPrice() {
    const c = CARS.find((x) => x.id === st.car);
    $('#f-price').value = st.price; $('#f-down').value = Math.round(st.down * 100); $('#f-months').value = st.months;
    $('#f-ref').textContent = c.ref ? `자료 산출 예시 가격 ${c.ref.toLocaleString('ko-KR')}만원${c.range ? ` (예시 범위 ${c.range[0].toLocaleString('ko-KR')}~${c.range[1].toLocaleString('ko-KR')})` : ''}` : '자료에 예시 가격 없음 — 견적 가격을 입력하세요';
    drawBands();
  }

  /* ---------- 출력 ---------- */
  function dday() {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const d = (iso) => Math.round((new Date(iso + 'T00:00:00') - t) / 86400000);
    const tag = (n) => (n > 0 ? `D-${n}` : n === 0 ? 'D-DAY' : '마감');
    $('#adv-dday').replaceChildren(
      h('div', { class: 'dd hot' }, [h('b', { text: tag(d('2026-11-15')) }), h('span', { text: '11.15 코리아세일페스타 쿠폰 응모 마감' })]),
      h('div', { class: 'dd hot' }, [h('b', { text: tag(d('2026-11-30')) }), h('span', { text: '11.30 출고 마감 — 11월 금융 프로모션·쿠폰' })]),
      h('div', { class: 'dd' }, [h('b', { text: tag(d('2026-12-31')) }), h('span', { text: '12.31 출고 마감 — 아반떼 퍼스트 무브, HEV·EV 세제 감면' })]),
    );
  }
  const METRIC = { family: ['family_idx', '영패밀리 지수'], young: ['age20_29', '20–29세'], senior: ['age60p', '60세 이상'], biz: ['age60p', '60세 이상'], eco: ['age30_44', '30–44세'], premium: ['age45_59', '45–59세'] };
  const carKey = (car) => car.name.replace(/디 올 뉴 |더 뉴 | \(.*\)|하이브리드| HEV|제네시스 /g, '').trim().split(' ')[0];
  function areaInfo(car) {
    const metric = METRIC[car.type]; const cnt = car.type === 'senior' || car.type === 'biz';
    const dl = (d) => `${d.dong}${st.area ? '' : `(${d.sgg})`} ${metric[1]} ${cnt ? `${pct(d.age60p, 0)}·${Math.round(d.age60p * d.pop).toLocaleString('ko-KR')}명` : pct(d[metric[0]])}`;
    const sortD = (a, b) => (cnt ? b.age60p * b.pop - a.age60p * a.pop : b[metric[0]] - a[metric[0]]);
    const key = carKey(car);
    if (st.area) {
      const ins = (D.insight || []).find((q) => q.sgg === st.area) || {};
      const sg = D.sgg.find((r) => r.sgg === st.area) || {};
      const focus = (D.focus || []).filter((f) => f.sgg === st.area);
      const fits = focus.some((f) => f.focus.includes(key));
      return { ins, sg, fits, focusTxt: focus.map((f) => f.focus).join('·'),
        dongs: D.dong.filter((r) => r.sgg === st.area && r.pop >= 3000).sort(sortD).slice(0, 3).map(dl) };
    }
    const fitSgg = (D.focus || []).filter((f) => f.focus.includes(key)).map((f) => `${f.sido} ${f.sgg}`);
    const topSgg = D.sgg.filter((r) => r.pop >= 30000).sort((a, b) => (cnt ? b.age60p * b.pop - a.age60p * a.pop : b[metric[0]] - a[metric[0]])).slice(0, 3).map((r) => `${r.sido} ${r.sgg}`);
    const pop = D.sgg.reduce((a, r) => a + (r.pop || 0), 0);
    return { all: true, pop, fitSgg, topSgg, dongs: D.dong.filter((r) => r.pop >= 5000).sort(sortD).slice(0, 3).map(dl) };
  }
  function targetBlock(car, res, chosen) {
    const A = areaInfo(car);
    const ks = ksfOk({ car, who: st.who });
    const p = chosen;
    const where = st.area ? st.area : '대전충남';
    const say = [h('b', { text: where }), `에서 `, h('b', { text: car.name }), `${josa(car.name)} `, h('b', { text: car.persona }), '에게 맞습니다. ',
      p && p.id !== 'std' ? [h('b', { text: p.name }), `${josaR(p.name)} 먼저 제안해 보세요.`] : '11월 전용 금융은 없으니 쿠폰·트레이드인으로 부담을 낮춰 보세요.',
      ks[0] ? ' 코리아세일페스타 쿠폰 응모도 잊지 마세요!' : ''];
    const items = A.all ? [
      ['찾아갈 곳', A.fitSgg.length ? `${A.fitSgg.join(' · ')} (이 차종을 판촉 집중 차종으로 정한 지역)` : `${A.topSgg.join(' · ')} (${METRIC[car.type][1]} 비중·인원 상위)`],
      ['추천 동', A.dongs.join(' · ') || '—'],
      ['권역 인구', `대전·세종·충남 ${A.pop.toLocaleString('ko-KR')}명 — 지역을 고르면 그 시군구 맞춤으로 바뀝니다`],
    ] : [
      ['지역 고객', `${A.ins.customer || A.sg.target || '—'} · 인구 ${(A.sg.pop || 0).toLocaleString('ko-KR')}명`],
      ['추천 동', A.dongs.join(' · ') || '—'],
      ['지역 적합도', A.fits ? '이 지역 판촉 집중 차종입니다.' : `이 지역 집중 차종은 ${A.focusTxt || '—'}입니다. 함께 비교 제안하세요.`],
    ];
    items.push(['코리아세일페스타', ks[0] ? `쿠폰 대상 차종 — 오늘 응모 안내(당첨 시 50·100만원, 11.15 응모·11.30 출고)${st.coupon ? ` · ${st.coupon}만원 당첨 반영` : ''}` : `쿠폰 제외 — ${ks[1]}`]);
    const box = $('#o-target');
    box.replaceChildren(
      ih('h2', 'target', '2. 타겟 고객 추천'),
      h('div', { class: 'adv-talk' }, [man(), h('div', { class: 'advisor-bubble adv-bubble' }, [
        h('p', { class: 'chap-no', text: `${areaLabel()} · ${car.name}` }),
        h('p', { class: 'advisor-say' }, say.flat()),
        h('ul', {}, items.map(([a, b]) => h('li', {}, [h('span', { text: a }), b]))),
      ])]),
    );
    const sv = box.querySelector('.advisor-man'); if (sv) { sv.classList.remove('talk'); void sv.getBoundingClientRect(); sv.classList.add('talk'); }
  }
  function productsBlock(res) {
    const box = $('#o-products');
    const items = res.list.slice().sort((a, b) => (b.ok - a.ok) || ((b.score || 0) - (a.score || 0)));
    box.replaceChildren(
      ih('h2', 'money', '3. 지금 쓸 수 있는 11월 금융상품'),
      h('p', { class: 'muted small', text: '금융 프로모션끼리는 중복 적용되지 않습니다. 고객에게 가장 큰 혜택 하나를 고르세요. 카드를 누르면 아래 가격 계산이 그 상품으로 바뀝니다.' }),
      h('div', { class: 'prod-list' }, items.map((p) => h('button', { type: 'button', class: `prod ${p.ok ? 'ok' : 'no'} ${p.best ? 'best' : ''} ${st.pick === p.id || (!st.pick && p.best) ? 'on' : ''}`, disabled: !p.ok, onclick: () => { st.pick = p.id; render(); } }, [
        h('span', { class: 'prod-top' }, [ico(p.id === 'zero' ? 'won' : p.id === 'card' ? 'card' : KIND_ICON[p.kind] || 'cal', 'ico sm'), h('span', { class: 'prod-badge', text: !p.ok ? '대상 아님' : p.best ? '추천' : p.kind })]),
        h('b', { text: p.name }),
        h('span', { class: 'prod-terms', text: p.terms }),
        p.ok ? h('span', { class: 'prod-val', text: p.lease ? `월 ${p.lease.gen}만원~ (렌트·리스)` : p.saved > 0 ? `이자 약 ${won(p.saved)} 절감${p.lost ? ` · ${p.lostNote}` : ''}` : p.cashback ? '할인 25만 + 캐시백 25만' : p.id === 'staff' ? `월 납입금 약 ${won1(p.monthlyCut)} 낮아짐(유예형)` : p.discount ? `할인 ${won(p.discount)}` : '' }) : h('span', { class: 'prod-why', text: p.why.join(' · ') }),
        h('span', { class: 'prod-dl', text: p.deadline !== '—' ? `${p.deadline}까지` : '' }),
      ]))),
    );
  }
  function priceBlock(res, p) {
    const box = $('#o-price'); const car = CARS.find((c) => c.id === st.car);
    const rows = [['차량 가격', won(st.price)]];
    if (p.discount) rows.push([p.id === 'std' && p.discount === 100 ? '싼타페 K-세일페스타 기본혜택' : p.id === 'card' ? '전용카드 차량가 할인' : '할인(자료 예시 조건)', `−${won(p.discount)}`]);
    if (p.subsidy) rows.push(['보조금(국고+지자체 평균)', `−${won(p.subsidy)}`]);
    if (p.coupon) rows.push(['코리아세일페스타 쿠폰 (중복 여부 계약 전 확인)', `−${won(p.coupon)}`]);
    else if (st.coupon) rows.push(['코리아세일페스타 쿠폰', `적용 불가 — ${ksfOk({ car, who: st.who })[1]}`]);
    const net = st.price - (p.discount || 0) - (p.subsidy || 0) - (p.coupon || 0);
    rows.push(['실구매가', won(net), 'strong']);
    let body;
    if (p.lease) {
      body = [h('table', { class: 'plain price-t' }, h('tbody', {}, [...rows, ['월 납입금(60개월·연 2만km)', `${p.lease.gen}만원 (일반리스)`, 'strong'], p.lease.own ? ['이용자명의리스(개인)', `${p.lease.own}만원`] : null, ['기존 조건 대비', `월 ${p.lease.asis - p.lease.gen}만원 인하`]].filter(Boolean).map(([a, b, c]) => h('tr', { class: c || '' }, [h('th', { text: a }), h('td', { text: b })]))))];
    } else {
      const L = p.loan;
      const r2 = [...rows,
        [`선수금 (${Math.round(p.downUsed * 100)}%)`, won(L.dn)],
        ['할부 원금', won(L.F)],
        L.B > 0 ? ['만기 유예금', `${won(L.B)}${p.id === 'porterev' ? ' (반납 상환 불가·2년 분납 가능)' : ' (반납 시 상환)'}`] : null,
        [`월 납입금 (${L.n}개월, ${L.rate}%)`, `약 ${won1(L.m)}`, 'big'],
        ['총 이자', won(L.interest)],
        p.saved > 0 ? ['표준 할부 대비 이자 절감', `약 ${won(p.saved)}`, 'good'] : null,
        p.cashback ? ['전용카드 캐시백 (출고 후 환급)', `+${won(p.cashback)}`, 'good'] : null,
        p.lost ? ['포기하는 혜택', `−${won(p.lost)} (${p.lostNote})`, 'warn'] : null,
      ].filter(Boolean);
      body = [h('table', { class: 'plain price-t' }, h('tbody', {}, r2.map(([a, b, c]) => h('tr', { class: c || '' }, [h('th', { text: a }), h('td', { text: b })])))),
        p.ref ? h('p', { class: 'note', text: `자료 예시: ${car.name} 선수 1% 시 월 ${p.ref[0]}만원, 선수 5% 시 월 ${p.ref[1]}만원(트레이드인·생산월 200만 기준). 위 계산은 유예금 산정 기준 차이로 2~4만원 높게 나올 수 있습니다.` }) : null,
        p.downUsed > st.down ? h('p', { class: 'note', text: `이 상품은 선수율 최소 ${Math.round(p.downUsed * 100)}%가 필요해 그 기준으로 계산했습니다.` }) : null];
    }
    box.replaceChildren(ih('h2', 'calc', '4. 예상 최종 가격'), h('p', { class: 'chap-no', text: `${p.name}${p.best ? ' · 추천' : ''}` }), ...body.filter(Boolean),
      h('p', { class: 'muted small', text: '추정치입니다. 트림·옵션·선수금·할인·지자체 보조금(대전·세종·충남 실제 공고, ev.or.kr)과 현대캐피탈 심사에 따라 달라집니다.' }));
  }
  /* ---------- 상담 가이드 ---------- */
  const NEEDS = {
    family: ['자녀가 몇 명이고 몇 살인가요? (카시트 개수, 3열 필요 여부)', '주말에 장거리·캠핑·본가 방문을 자주 가시나요?', '지금 타는 차는 몇 년식이고 연 몇 km 타시나요?', '배우자분도 운전하시나요? 주차 공간은 어떤가요?', '월 납입금은 어느 정도가 편하신가요?'],
    young: ['첫 차이신가요, 바꾸시는 건가요?', '출퇴근 거리와 주차 환경(회사·집)은 어떤가요?', '월 납입금 예산은 어느 정도로 생각하세요?', '3년 안에 결혼·이직·이사 계획이 있으신가요? (만기 반납형 판단)', '연비·디자인·안전 중 무엇이 가장 중요하세요?'],
    senior: ['지금 차는 몇 년 타셨고, 어디가 불편하세요?', '연 주행거리와 주로 다니는 길(시내·고속도로)은요?', '주로 누구와 함께 타세요? (부부·손주·부모님)', '운전 보조 기능(차로 유지·후측방 경보)에 관심 있으세요?', '일시불과 할부 중 어떤 쪽이 편하세요?'],
    biz: ['업종과 주로 싣는 짐은 무엇인가요?', '하루 주행거리와 충전·주유 동선은 어떤가요?', '소상공인 확인서나 농업경영체 등록이 되어 있으신가요?', '지금 트럭은 몇 년식이고 수리비가 얼마나 나오나요?', '사업자 비용 처리를 하시나요?'],
    eco: ['집·직장 근처 수소충전소 이용이 가능하신가요?', '하루 주행거리는 어느 정도인가요?', '친환경차 보조금·세제 혜택을 알고 계신가요?', '만기 후 다른 친환경차로 바꿀 생각이 있으세요?'],
    premium: ['지금 타시는 차(수입차·제네시스)는 무엇이고 언제 바꾸시나요?', '개인 명의인가요, 법인·사업자 비용 처리인가요?', '리스·렌트와 할부 중 어떤 방식이 익숙하세요?', '교체 주기는 보통 몇 년이세요? (12·24개월 DOUBLE-PICK 판단)'],
  };
  const GUIDE = {
    zero: { say: (p, car) => `선착순 2,000대 한정 ${st.months}개월 무이자입니다. ${car.name} 기준 이자만 약 ${won(p.saved)} 아끼실 수 있어요.`,
      pitch: (p) => `표준 할부라면 이자가 약 ${won(p.std.interest)}인데, 무이자면 0원입니다. 대신 K-세일페스타 기본혜택(또는 생산월 조건)이 빠지니 두 경우를 나란히 보여 드릴게요.`,
      check: ['선수율 20% 이상, 현대캐피탈 모빌리티 할부만', '11.30 이전 출고 — 즉시 출고 재고·색상 먼저 확인', '개인·개인사업자만(법인·택시 불가)', '싼타페는 K-세일페스타 100만원, 팰리세이드는 생산월 200만원이 차감됨을 미리 안내', '차종별 선착순 2,000대 — 계약 당일 잔여 확인'],
      docs: ['신분증·운전면허증', '소득 증빙(재직증명서·사업자등록증) — 현대캐피탈 심사용'],
      qa: [['선수금 20%가 부담돼요', '서울에서 이주한 다자녀 가구면 1.9%(선수 1%~)가 있고, 아니면 표준 할부와 월 납입금을 나란히 비교해 드립니다.'], ['쏘렌토가 더 싸던데요', '무이자로 이자를 아끼면 총 부담이 더 낮을 수 있어요. 공간·연비 비교표와 총 부담액을 함께 보여 드릴게요.'], ['일시불로 사면 뭐가 좋아요?', '일시불이면 무이자 대신 K-세일페스타 기본혜택 100만원(싼타페)을 받으시는 게 유리합니다.'], ['12월에 출고하면 안 되나요?', '무이자는 11.30 출고분까지라 12월 출고면 혜택이 사라집니다. 지금 재고가 있는 색상부터 확인해 드릴게요.']] },
    multi: { say: () => '서울에서 이사 오신 두 자녀 가정이면 싼타페 할부 금리가 전 구간 1.9%입니다.',
      pitch: (p) => `표준 금리보다 이자가 약 ${won(p.saved)} 적고, 선수금 부담도 낮습니다.`,
      check: ['선택형 주민등록등본(과거 주소 변동·세대원 포함) 수령', '2025년 이후 서울→서울 외 이주, 2007년 이후 출생 미성년 자녀 2명 이상', '개인 고객만(법인 불가)', '리스·렌트는 10% 혜택 + 안전용품 키트', '11.30 출고분까지'],
      docs: ['선택형 주민등록등본(주소 변동 이력·세대원 포함)', '신분증·운전면허증', '소득 증빙'],
      qa: [['서류가 번거로워요', '등본 한 장이면 됩니다. 정부24에서 바로 뗄 수 있어요.'], ['무이자랑 뭐가 나아요?', '선수금을 20% 넣을 수 있으면 무이자, 선수금을 적게 하고 싶으면 1.9%가 유리합니다. 두 경우를 계산해 드릴게요.'], ['세종에 온 지 오래됐는데요', '2025년 이후 서울에서 이주한 가구가 대상이라 등본으로 확인해 드릴게요.']] },
    card: { say: () => '현대·제네시스 전용카드로 1,000만원 이상 결제하시면 25만원 할인에 25만원 캐시백, 총 50만원 혜택입니다.',
      pitch: () => '현대캐피탈 할부와 함께 쓸 수 있어, 할부를 하셔도 50만원 혜택은 그대로 받으십니다.',
      check: ['현대·제네시스 전용카드(모빌리티·EV)로 1,000만원 이상 + 세이브오토', '출고 전 대상 입력 필수(출고 후 불가)', '블루멤버스 전용카드·3-BODY 카드 불가', '영업용·EV 제외, 현대캐피탈 할부와 중복 가능', '11.30 출고분까지'],
      docs: ['전용카드(신규 발급 가능)', '신분증·운전면허증'],
      qa: [['카드가 없어요', '신규 발급도 대상입니다. 발급 후 결제하시면 됩니다.'], ['캐시백은 언제 들어와요?', '출고 후 카드사 기준에 따라 환급됩니다. 정확한 일정은 카드사 안내를 함께 드릴게요.'], ['그랜저도 돼요?', '이 혜택은 쏘나타·스타리아 전용입니다. 그랜저는 연내 출고 HEV 세제 감면과 트레이드인으로 제안드려요.']] },
    firstmove: { say: (p) => `월 ${won1(p.loan.m)}으로 시작하고, 3년 뒤엔 차를 반납하면 유예금이 정리됩니다. 신차 재구매 조건도 없어요.`,
      pitch: (p) => `36개월 금리가 6.3%에서 2.8%로 내려가 이자가 약 ${won(p.saved)} 줄고, 유예금 ${won(p.loan.B)}은 만기 때 반납·상환·재할부 중 고르시면 됩니다.`,
      check: ['12.31 출고분까지(계약일 무관)', '유예율 30% 이상', '당사 임직원·대리점 등록인원 불가', '법인은 유예 가능하나 잔가 보장 불가', '만기 반납 시 차량 상태·주행거리 기준 안내'],
      docs: ['신분증·운전면허증', '소득 증빙(재직증명서·건강보험 자격득실 등)'],
      qa: [['3년 뒤에 목돈이 들지 않나요?', '반납하면 유예금이 상환되고, 계속 타고 싶으면 일시 상환하거나 재할부를 안내합니다.'], ['쿠폰도 같이 되나요?', '코리아세일페스타 쿠폰은 11.30 출고 조건이라 시기를 맞춰야 하고, 중복 여부는 계약 전 확인합니다.'], ['사회초년생인데 심사 통과될까요?', '재직 기간·소득에 따라 다르니 가심사로 먼저 확인해 드릴게요.'], ['하이브리드도 되나요?', '아반떼 하이브리드도 대상이고, 연내 출고면 HEV 세제 감면도 받습니다.']] },
    nfin: { say: () => '유예율 최대 90%로 고성능 N을 낮은 월 납입금으로 타실 수 있고, 중도상환 수수료도 없습니다.',
      pitch: (p) => `선수 ${Math.round(p.downUsed * 100)}% 기준 월 ${won1(p.loan.m)}, 중도상환 수수료가 없어 언제든 정리할 수 있습니다.`,
      check: ['선수율 10% 이상, 최소 할부금 10만원', '아이오닉 5 N·6 N은 현대·제네시스 재구매 필수', '출고 후 사은품 신청 문자 발송', '11.30 출고분까지'],
      docs: ['신분증·운전면허증', '소득 증빙', '재구매 증빙(아이오닉 N)'],
      qa: [['보험료가 비싸지 않나요?', '보험사 견적을 미리 받아 월 총 유지비로 보여 드릴게요.'], ['유예금 90%면 나중에 부담 아닌가요?', '중도상환 수수료가 없어 여유가 생길 때마다 갚으실 수 있습니다.']] },
    evdown: { say: (p) => `보조금 받고 월 ${won1(p.loan.m)} 수준, 만기에는 반납하고 새 EV로 바꾸시면 됩니다.`,
      pitch: (p) => `36개월 금리 5.8% → ${p.loan.rate}%로 이자가 약 ${won(p.saved)} 줄어듭니다. 자료 예시로는 선수 1~5%에 월 ${p.ref ? `${p.ref[1]}~${p.ref[0]}만원` : '20만원 안팎'}입니다.`,
      check: ['지자체 보조금 잔여 확인(ev.or.kr) — 소진 시 렌트·리스로 전환', '유예율 60%면 EV·FCEV 재구매, 55% 이하면 현대·제네시스 전 차종 재구매', '현대 EV 재구매 고객 금리 −0.5%p(증빙: 상환 스케줄표·계약서)', '영업용·N 불가', '집·직장 충전 여건 확인'],
      docs: ['신분증·운전면허증', '보조금 신청 서류(주민등록등본 등, 지자체 공고 기준)', '재구매 증빙(해당 시)'],
      qa: [['보조금이 다 떨어졌다던데요', '렌트·리스로 출고하면 리스 추가 보조금으로 월 납입금을 맞출 수 있어요.'], ['충전이 걱정돼요', '집·직장 충전 여건부터 같이 확인하고, 가까운 급속충전소 위치도 알려 드릴게요.'], ['테슬라 모델Y랑 비교하면요?', '부담 Down으로 월 납입금을 낮추고, 국내 서비스망·V2L 활용을 함께 비교해 드릴게요.'], ['배터리 수명은요?', '배터리 보증 기간과 만기 반납 시 잔가 보장을 같이 안내드립니다.']] },
    evlease: { say: () => '지자체 보조금이 소진돼도 리스 추가 보조금으로 출고할 수 있어요. 월 납입금도 기존보다 낮아졌습니다.',
      pitch: (p) => `60개월·연 2만km 기준 월 ${p.lease.gen}만원(일반리스)${p.lease.own ? `, 개인 명의 이용자명의리스면 월 ${p.lease.own}만원` : ''}입니다. 기존보다 월 ${p.lease.asis - p.lease.gen}만원 낮아요.`,
      check: ['출고 전 대상 입력 필수', '이용자명의리스는 개인만 지자체 보조금 지급', '보조금 받은 개인이 사업자 비용 처리 시 보조금 환수 안내', '현대캐피탈 이용 수수료 2.0%', '11.30 출고분까지'],
      docs: ['신분증·운전면허증', '소득 증빙', '사업자등록증(사업자 리스)'],
      qa: [['리스랑 할부 뭐가 나아요?', '비용 처리가 필요하면 리스, 내 차로 오래 타실 거면 할부가 유리합니다. 두 가지를 나란히 계산해 드릴게요.'], ['주행거리를 넘기면요?', '약정 거리 초과분은 만기 때 정산됩니다. 연 주행거리에 맞춰 약정을 정하시면 됩니다.']] },
    nexo: { say: () => '넥쏘는 1.8% 초저금리로 자료 예시 기준 월 8만원대부터 가능합니다.',
      pitch: (p) => `39개월 1.8%로 이자가 약 ${won(p.saved)} 줄고, 보조금 ${won(p.subsidy)}이 반영됩니다.`,
      check: ['39개월, 유예율 45%', '수소충전소 접근성 확인(대전·세종·충남 충전소 위치 안내)', 'EV·FCEV 재구입 시 잔가 보장', '지자체 수소차 보조금 잔여 확인'],
      docs: ['신분증·운전면허증', '보조금 신청 서류'],
      qa: [['충전소가 적지 않나요?', '고객 동선 기준 가장 가까운 충전소와 운영 시간을 먼저 확인해 드릴게요.']] },
    porterev: { say: (p) => `${st.who.small ? '소상공인' : st.who.farm ? '농업인' : '사업자'}이시면 포터 EV를 월 ${won1(p.loan.m)} 수준으로 쓰실 수 있습니다.`,
      pitch: (p) => `보조금 ${won(p.subsidy)}에 할인 200만원, 36개월 2.8%로 하루 약 ${Math.round(p.loan.m * 10000 / 30).toLocaleString('ko-KR')}원입니다. 유류비까지 줄어듭니다.`,
      check: ['소상공인 확인서·농업경영체 등록확인서로 추가 보조금 증빙', '유예금은 차량 반납으로 상환 불가 — 만기 후 2년 분납 가능(4.9%)', '지자체 보조금 잔여 확인', '하루 주행거리·충전 동선 확인', '11.30 출고분까지'],
      docs: ['소상공인 확인서 또는 농업경영체 등록확인서', '사업자등록증', '신분증·운전면허증'],
      qa: [['3년 뒤 유예금은요?', '일시 상환이 어려우면 2년 동안 나눠 내실 수 있어요.'], ['겨울에 주행거리가 줄지 않나요?', '하루 주행 동선을 같이 보고, 충전 계획을 짜 드릴게요.'], ['지금 디젤 트럭은 어떻게 해요?', '트레이드인으로 매각 견적을 받아 선수금으로 넣으실 수 있어요.']] },
    taxi: { say: (p, car) => `택시를 ${car.name}로 바꾸시면 ${st.months}개월 ${p.loan.rate}%로 이자만 약 ${won(p.saved)} 아끼실 수 있어요.`,
      pitch: (p) => `${st.months}개월 ${p.loan.rate}%(표준 대비 −2.2%p), 월 약 ${won1(p.loan.m)}입니다. 연료비 절감까지 더하면 부담이 더 줄어요.`,
      check: ['개인택시·법인택시', '36·48·60개월 표준형 저금리', '지자체 보조금 액수에 따라 월 납입금 달라짐', '코리아세일페스타 쿠폰은 택시 제외'],
      docs: ['택시 운송사업 면허 증빙', '신분증·운전면허증', '보조금 신청 서류'],
      qa: [['충전 시간 때문에 영업 손해 아닌가요?', '근무 동선의 급속충전소를 같이 찾아 드리고, 연료비 절감액과 비교해 드릴게요.']] },
    staff: { say: () => '임직원·그룹사 전용 특화 할부로 유예율을 높여 월 납입금을 크게 낮출 수 있습니다.',
      pitch: (p) => `유예형으로 월 납입금이 약 ${won1(p.monthlyCut)} 낮아집니다. 직원 할인까지 적용하면 더 내려갑니다.`,
      check: ['재직 확인, 직원 차량 할인 규정(명의·할인·재구입 연한) 적용', '만기 시 차량 반납으로 유예금 상환 가능', '그랜저·팰리세이드는 가솔린 2.5/2.5터보·HEV', '코리아세일페스타 쿠폰은 직원 사용 불가'],
      docs: ['재직증명서', '신분증·운전면허증'],
      qa: [['직원 할인이랑 같이 돼요?', '네, 직원 할인 적용 후 금액으로 특화 할부를 계산합니다.']] },
    gfin: { say: () => (st.who.owner ? '수입차나 제네시스를 타셨다면 THE BETTER CHOICE로 4% 추가 혜택을 받고 갈아타실 수 있어요.' : '제네시스 파이낸스 리스·렌트로 시장 최저 수준 월 납입금을 제안해 드릴게요.'),
      pitch: (p) => (p.lease ? `60개월·2만km 리스 월 ${p.lease.gen}만원${st.who.owner ? `(기본 ${p.lease.asis}만원)` : ''}, 생산월 조건이면 월 ${p.lease.own}만원입니다.` : '시장 최저 수준 월 납입금으로 견적을 내 드립니다.'),
      check: ['계약·출고 시 판매유형·대상 입력', '보유 증빙: 자동차 등록원부(계약일 전월 마감일 기준)', 'DOUBLE-PICK 12·24개월 4% 추가', '출고 고객 GS칼텍스 고급휘발유 월 최대 2만원 할인'],
      docs: ['자동차 등록원부(수입차·제네시스 보유 증빙)', '사업자등록증·법인 서류(법인·사업자)', '신분증·운전면허증'],
      qa: [['지금 수입차는 어떻게 처리해요?', '트레이드인 매각 견적을 받아 선수금이나 보증금으로 넣을 수 있어요.'], ['법인 비용 처리 되나요?', '리스·렌트는 비용 처리가 가능하고, 세부 한도는 세무 담당과 확인을 권합니다.']] },
    std: { say: () => '11월 전용 금융은 없지만 쿠폰과 트레이드인, 표준 할부로 부담을 낮춰 드릴게요.',
      pitch: (p) => `표준 할부 ${p.loan.n}개월 ${p.loan.rate}% 기준 월 약 ${won1(p.loan.m)}입니다. 트레이드인으로 선수금을 늘리면 월 납입금이 더 내려갑니다.`,
      check: ['코리아세일페스타 쿠폰 대상 여부 확인', '트레이드인(보유 차 매각) 상담', '연내 출고 시 HEV·EV 세제 감면 확인', '비슷한 차급의 11월 금융 대상 차종도 비교 제안'],
      docs: ['신분증·운전면허증', '소득 증빙'],
      qa: [['다른 차는 혜택이 있던데요', '비슷한 차급에서 11월 금융 대상 차종을 같이 비교해 드릴게요.']] },
  };
  const COMMON_QA = [
    ['코리아세일페스타 쿠폰이랑 같이 되나요?', '쿠폰은 1개만 쓸 수 있고, 금융 프로모션·다른 쿠폰과 중복 여부는 계약 전에 확인해 고객별 최대 조합 하나를 드립니다.'],
    ['지금 타는 차는 어떻게 해요?', '트레이드인으로 매각 견적을 받아 선수금으로 넣으면 월 납입금이 내려갑니다.'],
    ['조건이 다음 달에도 있나요?', '11월 조건은 11.30 출고분까지입니다. 12월 조건은 아직 확정되지 않아 지금 조건으로 안내드려요.'],
  ];
  const OBJ = [
    ['“좀 더 생각해 볼게요”', '물론이죠. 다만 무이자·쿠폰은 11.30 출고분까지라, 원하시는 색상 재고만 오늘 잡아 두고 내일까지 답 주셔도 됩니다.'],
    ['“다른 데가 더 싸요”', '견적서를 같이 보면서 할인·이자·쿠폰·유지비까지 합친 총 부담으로 비교해 드릴게요.'],
    ['“내년에 살래요”', 'HEV·EV 세제 감면과 11월 금융 조건은 연내 출고분까지라, 내년에는 같은 차가 더 비싸질 수 있어요.'],
    ['“월 납입금이 부담돼요”', '유예형 할부나 선수금 조정, 트레이드인으로 월 납입금을 낮춘 안을 바로 계산해 드릴게요.'],
  ];
  const DONT = ['금리·보조금·월 납입금을 확정된 금액처럼 말하지 않기 — “예상”, “심사에 따라”를 붙이기', '쿠폰과 금융 혜택을 무조건 같이 받는다고 약속하지 않기', '선착순 잔여 대수를 과장하지 않기 — 당일 잔여를 확인한 숫자만 말하기', '고객의 소득·가족 정보는 상담 목적 외에 적거나 공유하지 않기'];
  function guideBlock(res, p) {
    const car = CARS.find((c) => c.id === st.car); const g = GUIDE[p.id] || GUIDE.std;
    const ks = ksfOk({ car, who: st.who });
    const A = areaInfo(car);
    const lines = [g.say(p, car)];
    if (ks[0]) lines.push(st.coupon ? `코리아세일페스타 ${st.coupon}만원 쿠폰까지 반영하면 실구매가가 더 내려갑니다(11.30 출고까지).` : '오늘 코리아세일페스타에 응모하시면 최대 100만원 쿠폰이 나옵니다(11.15 마감, 11.30 출고까지).');
    const where = st.area ? `${st.area}${A.ins && A.ins.place ? `(${A.ins.place} 등)` : ''}` : '대전충남';
    const custTxt = st.area ? (A.ins.customer || A.sg.target || car.persona) : car.persona;
    const monthly = p.loan ? `월 약 ${won1(p.loan.m)}` : p.lease ? `월 ${p.lease.gen}만원` : '';
    const STEPS = [
      ['첫인사·관심 열기', `“${where}에 사시는 ${custTxt}분들이 요즘 ${car.name}${josaR(car.name)} 많이 보세요. 11월에는 금융 혜택이 특히 좋아서 먼저 말씀드리고 싶었어요.”`, '현장 판촉이면 무릎담요(전시장 QR 경품)·쿠폰 응모로 대화를 엽니다.'],
      ['니즈 확인 질문', null, '3~4개만 묻고, 답을 메모해 차종·금융 선택 근거로 씁니다.', NEEDS[car.type] || NEEDS.family],
      ['차량 제안', `“${car.persona}에게 ${car.name}${josa(car.name)} 공간·연비·안전에서 가장 균형이 좋아요.”`, st.area ? (A.fits ? '이 지역 판촉 집중 차종이므로 시승을 바로 권합니다.' : `이 지역 집중 차종(${A.focusTxt || '—'})도 함께 비교해 보여 줍니다.`) : '지역을 고르면 그 지역 집중 차종과 비교 포인트가 나옵니다.'],
      ['금융·가격 제시', `“${g.pitch ? g.pitch(p) : lines[0]}”`, `가격표(4번)를 화면으로 보여 주며 차량가 → 혜택 → 실구매가 → ${monthly || '월 납입금'} 순서로 설명합니다. 표준 할부와 나란히 비교하면 설득력이 커집니다.`],
      ['코리아세일페스타·마감으로 클로징', ks[0] ? '“지금 같이 응모해 보실까요? 당첨되면 최대 100만원이고, 11월 30일 출고까지 쓰실 수 있어요.”' : `“이 조건은 ${p.deadline !== '—' ? p.deadline : '11.30 출고'}까지라 이번 달에 결정하시면 가장 유리합니다.”`, '즉시 출고 가능한 재고·색상을 확인하고, 계약 일정을 구체적인 날짜로 잡습니다.'],
      ['계약 후 관리', '“출고 일정과 서류는 제가 문자로 정리해 드릴게요. 출고 날 차량 기능도 직접 알려 드리겠습니다.”', '출고 D-3 서류 확인, 출고 당일 기능 안내, 출고 후 1주일 해피콜, 지인 소개 요청.'],
    ];
    const memo = () => [
      `[대전충남 11월 금융 상담 메모] ${new Date().toLocaleDateString('ko-KR')}`,
      `지역: ${areaLabel()} / 차종: ${car.name} / 가격: ${st.price.toLocaleString('ko-KR')}만원`,
      `고객 유형: ${WHO.filter(([k]) => st.who[k]).map(([, l]) => l).join(', ')}`,
      `추천 금융: ${p.name} — ${p.terms}`,
      p.loan ? `예상: 선수금 ${won(p.loan.dn)}, 월 약 ${won1(p.loan.m)} × ${p.loan.n}개월${p.loan.B ? `, 만기 유예금 ${won(p.loan.B)}` : ''}${p.saved > 0 ? `, 이자 절감 약 ${won(p.saved)}` : ''}` : p.lease ? `예상: 월 ${p.lease.gen}만원(60개월 리스)` : '',
      `코리아세일페스타: ${ks[0] ? (p.coupon ? `${p.coupon}만원 쿠폰 반영(중복 여부 확인)` : '쿠폰 대상 — 응모 안내') : `제외(${ks[1]})`}`,
      `상담 한 마디: ${lines.join(' ')}`,
      `체크: ${g.check.join(' / ')}`,
      `서류: ${g.docs.join(' / ')}`,
      '※ 추정치 — 트림·옵션·보조금·심사에 따라 달라짐',
    ].filter(Boolean).join('\n');
    const pre = h('pre', { class: 'memo', hidden: true, text: memo() });
    const btn = h('button', { type: 'button', class: 'copy-btn', text: '상담 메모 복사', onclick: async (e) => {
      const b = e.currentTarget; try { await navigator.clipboard.writeText(memo()); b.textContent = '복사했어요'; } catch (err) { b.textContent = '복사가 막혀 있어요 — 아래 메모를 직접 선택하세요'; pre.hidden = false; }
      setTimeout(() => { b.textContent = '상담 메모 복사'; }, 2000);
    } });
    $('#o-guide').replaceChildren(
      ih('h2', 'chat', '5. 상담 가이드'),
      h('p', { class: 'muted small', text: `${areaLabel()} · ${car.name} · ${p.name} 기준으로 만든 상담 흐름입니다. 조건을 바꾸면 멘트와 숫자가 함께 바뀝니다.` }),
      scene(car, lines),
      ih('h3', 'care', '상담 흐름 6단계', 'g-h'),
      h('ol', { class: 'steps' }, STEPS.map(([t, line, tip, qs], i) => h('li', {}, [
        h('div', { class: 'step-head' }, [ico(['hello', 'ask', 'car', 'won', 'gift', 'care'][i], 'ico md'), h('b', { text: t })]),
        line ? h('p', { class: 'step-say', text: line }) : null,
        qs ? h('ul', { class: 'step-q' }, qs.map((q) => h('li', { text: q }))) : null,
        h('p', { class: 'step-tip', text: tip }),
      ]))),
      h('div', { class: 'guide-cols' }, [
        h('div', {}, [ih('h3', 'check', '체크리스트'), h('ul', { class: 'check' }, g.check.map((c) => h('li', { text: c })))]),
        h('div', {}, [ih('h3', 'docs', '준비 서류'), h('ul', { class: 'check docs' }, g.docs.map((c) => h('li', { text: c })))]),
      ]),
      ih('h3', 'qa', '예상 질문과 답변', 'g-h'),
      h('dl', { class: 'qa' }, [...g.qa, ...COMMON_QA].flatMap(([q, a]) => [h('dt', { text: `Q. ${q}` }), h('dd', { text: `A. ${a}` })])),
      h('div', { class: 'guide-cols' }, [
        h('div', {}, [ih('h3', 'shield', '거절할 때 이렇게'), h('dl', { class: 'qa obj' }, OBJ.flatMap(([q, a]) => [h('dt', { text: q }), h('dd', { text: a })]))]),
        h('div', {}, [ih('h3', 'warn', '이건 조심하세요'), h('ul', { class: 'check dont' }, DONT.map((c) => h('li', { text: c })))]),
      ]),
      h('div', { class: 'copy-row' }, [btn]), pre,
    );
  }
  function render() {
    const car = CARS.find((c) => c.id === st.car);
    $('#v-down').textContent = `${Math.round(st.down * 100)}%`;
    const res = evaluate({ car, price: st.price, who: st.who, down: st.down, months: st.months, coupon: st.coupon });
    const chosen = res.list.find((p) => p.id === st.pick && p.ok) || res.best;
    targetBlock(car, res, chosen); productsBlock(res); priceBlock(res, chosen); guideBlock(res, chosen);
  }
  window.ADV = { evaluate, CARS, loan }; // 검산용
  const fh = document.querySelector('#adv-form h2'); if (fh) fh.replaceWith(ih('h2', 'form', '1. 조건 고르기'));
  dday(); initForm(); render();
})();
