"""충남 신규 등록(차종·모델) 엑셀 시트 → 보고서용 집계 (충남 행만 교체).

2025년 원본의 충남 시트는 15개 시군 중 4곳만 들어 있어(전체계 68,273대 중 8,929대),
충남은 15개 시군이 모두 있는 2026년 누계 시트로 계산한다. 대전·세종 행은 기존(2025년) 값을 유지한다.

사용:  python scripts/build_newreg_chungnam.py <2026 신규등록 xlsx> [시트명=충남 26] [개월수=9]
출력:  data/processed/newreg2025_sgg.csv, area_profile_2025.csv, head_to_head_2025.csv, model_top10_2025.csv 의 충남 행
       (원본 xlsx는 저장소에 넣지 않음)
"""
from __future__ import annotations

import re
import sys
import warnings
from pathlib import Path

import openpyxl
import pandas as pd

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "data" / "processed"
DOMESTIC = {"현대", "기아", "르노삼성", "한국GM", "쌍용", "기타"}
EV_PAT = r"EV|일렉트릭|Electric|아이오닉|넥쏘|e-tron|EQ|iX|\bi[3-7]\b|모델|polestar|ID\.|Taycan|EX\d0|GV60|ST1|사이버트럭|BYD|Atto|Seal|Dolphin|Aceman|Cooper SE|Lyriq|e:"
BODY = {"경승용": "mini", "준중형": "sedan", "중형": "sedan", "대형": "sedan", "스포츠": "sedan", "경SUV": "suv_s",
        "소형SUV": "suv_s", "준중형SUV": "suv_s", "중형SUV": "suv", "대형SUV": "suv", "소형MPV": "mpv", "중대형MPV": "mpv",
        "소형트럭": "truck", "소형버스": "mpv"}
MAKER = {"르노삼성": "르노", "한국GM": "GM", "쌍용": "KGM", "TESLA": "테슬라"}
H2H = {  # segment: [(표시명, 모델 접두어)]  — HEV·EV 파생 포함 모델 계열
    "전기 SUV": [("현대 아이오닉5", "아이오닉5"), ("테슬라 모델Y", "테슬라모델Y"), ("기아 EV3", "EV3")],
    "패밀리 MPV": [("현대 스타리아", "스타리아"), ("기아 카니발", "카니발")],
    "중형SUV": [("현대 싼타페", "싼타페"), ("기아 쏘렌토", "쏘렌토"), ("르노 그랑콜레오스", "그랑콜레오스")],
    "소형SUV": [("현대 코나", "코나"), ("기아 셀토스", "셀토스"), ("GM 트랙스", "트랙스")],
    "준중형SUV": [("현대 투싼", "투싼"), ("기아 스포티지", "스포티지")],
    "중형 세단": [("현대 쏘나타", "쏘나타"), ("기아 K5", "K5")],
    "준대형 세단": [("현대 그랜저", "그랜저"), ("기아 K8", "K8")],
}


def parse(path: str, sheet: str) -> pd.DataFrame:
    ws = openpyxl.load_workbook(path, read_only=True)[sheet]
    reg = typ = seg = mk = None
    out = []
    for r in ws.iter_rows(values_only=True):
        if r[0] in ("지역", "전체계"):
            continue
        if r[0]:
            reg, typ, seg, mk = r[0], None, None, None
        if r[1]:
            typ, seg, mk = r[1], None, None
        if r[2]:
            seg, mk = r[2], None
        if r[3]:
            mk = r[3]
        if "소" in str(mk or "") and "계" in str(mk or "") or str(seg or "").replace(" ", "") == "소계":
            continue
        if r[4] in (None, "") or not isinstance(r[5], (int, float)):
            continue
        out.append((reg, typ, seg, mk, str(r[4]).strip(), int(r[5])))
    return pd.DataFrame(out, columns=["sgg", "type", "seg", "maker", "model", "n"])


def shares(x: pd.DataFrame) -> dict:
    T = x.n.sum()
    hev = x.model.str.contains("HEV|하이브리드", case=False)
    ev = (x.model.str.contains(EV_PAT, case=False, regex=True) | x.maker.isin(["TESLA", "폴스타", "BYD"])) & ~hev
    return dict(reg=int(T), hyundai=x[x.maker == "현대"].n.sum() / T, kia=x[x.maker == "기아"].n.sum() / T,
                ev=x[ev].n.sum() / T, hev=x[hev].n.sum() / T, imports=x[~x.maker.isin(DOMESTIC)].n.sum() / T,
                truck=x[x.type == "소형상용"].n.sum() / T, rv=x[x.type == "RV"].n.sum() / T)


def main(path: str, sheet: str = "충남 26", months: int = 9) -> None:
    d = parse(path, sheet)
    ann = 12 / months
    pop = pd.read_csv(P / "population_sgg.csv")
    cn = pop[pop.sido == "충남"]
    popc = dict(zip(cn["sgg"], cn["pop"]))
    # 1) 시군구 프로필
    nr = pd.read_csv(P / "newreg2025_sgg.csv")
    for sgg, x in d.groupby("sgg"):
        s = shares(x)
        m = (nr.sido == "충남") & (nr.sgg == sgg)
        vals = dict(reg=s["reg"], per1000=round(s["reg"] * ann / popc[sgg] * 1000, 1), hyundai=round(s["hyundai"], 4), ev=round(s["ev"], 4),
                    hev=round(s["hev"], 4), imports=round(s["imports"], 4), truck=round(s["truck"], 4), mpv_suv=round(s["rv"], 4))
        if m.any():
            for k, v in vals.items():
                nr.loc[m, k] = v
        else:
            nr = pd.concat([nr, pd.DataFrame([dict(sido="충남", sgg=sgg, target="", **vals)])], ignore_index=True)
    nr.to_csv(P / "newreg2025_sgg.csv", index=False)
    # 2) 시도 프로필
    ap = pd.read_csv(P / "area_profile_2025.csv")
    s = shares(d)
    cpop = int(pop[pop.sido == "충남"]["pop"].sum())
    row = dict(area="충남", reg=s["reg"], reg_sido_total=s["reg"], pop=cpop, per1000=round(s["reg"] * ann / cpop * 1000, 1),
               hyundai=round(s["hyundai"], 4), kia=round(s["kia"], 4), other=round(1 - s["hyundai"] - s["kia"], 4),
               hev=round(s["hev"], 4), ev=round(s["ev"], 4), imports=round(s["imports"], 4), suv=round(s["rv"], 4))
    ap = ap[ap.area != "충남"]
    ap = pd.concat([ap.iloc[:2], pd.DataFrame([row]), ap.iloc[2:]], ignore_index=True)
    ap.to_csv(P / "area_profile_2025.csv", index=False)
    # 3) 차급 맞대결
    g = d.groupby("model").n.sum()
    fam = lambda pre: int(sum(v for k, v in g.items() if k.replace(" ", "").startswith(pre) and not (pre.startswith("아이오닉") and k.endswith("N"))))
    hh = pd.read_csv(P / "head_to_head_2025.csv")
    new = [dict(segment=sg, area="충남", brand=b, order=i, n=fam(pre)) for sg, L in H2H.items() for i, (b, pre) in enumerate(L)]
    hh = hh[hh.area != "충남"]
    seg_order = {k: i for i, k in enumerate(hh.segment.drop_duplicates())}
    area_order = {k: i for i, k in enumerate(pd.read_csv(P / "head_to_head_2025.csv").area.drop_duplicates())}
    hh = pd.concat([hh, pd.DataFrame(new)], ignore_index=True)
    hh["_s"], hh["_a"] = hh.segment.map(seg_order), hh.area.map(area_order)
    hh = hh.sort_values(["_s", "_a", "order"]).drop(columns=["_s", "_a"])
    hh.to_csv(P / "head_to_head_2025.csv", index=False)
    # 4) 모델 Top 10
    tt = d.groupby(["maker", "model", "seg"]).n.sum().reset_index().sort_values("n", ascending=False).head(10)
    T = d.n.sum()
    top = [dict(area="충남", rank=i + 1, maker=MAKER.get(r.maker, r.maker), model=r.model.replace("테슬라 ", ""), n=int(r.n), share=round(r.n / T, 4), body=BODY.get(r.seg, "sedan")) for i, r in enumerate(tt.itertuples())]
    mt = pd.read_csv(P / "model_top10_2025.csv")
    mt = pd.concat([mt[mt.area != "충남"], pd.DataFrame(top)], ignore_index=True)
    mt.to_csv(P / "model_top10_2025.csv", index=False)
    print(f"충남 {len(d.sgg.unique())}개 시군, {T:,}대 반영")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], a[1] if len(a) > 1 else "충남 26", int(a[2]) if len(a) > 2 else 9)
