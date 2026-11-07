"""국토교통부 월간 자동차등록현황 엑셀 → 대전·세종·충남 대차 지표.

입력:  data/raw/molit_registration_YYYYMM.xlsx  (국토교통 통계누리 '자동차 등록 통계' 월별 파일)
출력:  data/processed/replacement_region.csv   지역별 차주 연령·폐차·연료 지표
       data/processed/model_year_national.csv  승용 모델년도별 등록(전국, 시도별 표 없음)
"""
from __future__ import annotations

import glob
import sys
import warnings
from pathlib import Path

import openpyxl
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
AREAS = ["대전", "세종", "충남"]
warnings.filterwarnings("ignore")


def rows(wb, name):
    return list(wb[name].iter_rows(values_only=True))


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(sorted(glob.glob(str(ROOT / "data/raw/molit_registration_*.xlsx")))[-1])
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    month = str(rows(wb, "01.통계표")[1][1] or src.stem[-6:])

    # 04 차주 성별·연령 (개인)
    r04 = rows(wb, "04.성별_연령별")
    hdr = r04[2]
    col = {k: i for i, k in enumerate(hdr) if k}
    ages = {}
    for r in r04[3:]:
        if r[1] in (None, "계") or r[0] in ("기타", "합계"):
            continue
        for a in AREAS + ["총계"]:
            ages[(a, r[1])] = ages.get((a, r[1]), 0) + (r[col[a]] or 0)
    corp = {a: next(r for r in r04 if r[0] == "기타")[col[a]] for a in AREAS + ["총계"]}

    # 10 연료별 (승용 계)
    r10 = rows(wb, "10.연료별_등록현황")
    c10 = {k: i for i, k in enumerate(r10[2]) if k}
    fuel, fu = {}, None
    for r in r10[4:]:
        if r[0] and str(r[0]).strip():
            fu = str(r[0]).strip()
        if r[1] == "승용" and r[2] == "계":
            for a in AREAS + ["계"]:
                fuel[(a, fu)] = r[c10[a]] or 0

    # 21 신규 누계 (승용), 27 말소 누계 (승용 폐차·수출)
    r21 = rows(wb, "21.신규 등록현황(누계)")
    new = {r[0]: (r[5], r[3]) for r in r21[4:] if r[0] in AREAS + ["총계"]}  # (승용 계, 승용 수입)
    r27 = rows(wb, "27.말소 등록현황(누계)")
    h27 = r27[3]
    i_scrap, i_export = h27.index("폐차"), h27.index("수출")
    scrap, cur = {}, None
    for r in r27[4:]:
        if r[0]:
            cur = r[0]
        if cur in AREAS + ["총계"] and r[1] == "승용":
            scrap[cur] = (r[i_scrap] or 0, r[i_export] or 0)

    out = []
    for a in AREAS + ["전국"]:
        k = "총계" if a == "전국" else a
        fk = "계" if a == "전국" else a
        indiv = sum(v for (aa, _), v in ages.items() if aa == k)
        band = lambda *names: sum(ages.get((k, n), 0) for n in names)
        stock = fuel[(fk, "총계")]
        hev = sum(v for (aa, f), v in fuel.items() if aa == fk and f.startswith("하이브리드"))
        m = int(month.split(".")[1]) if "." in month else 9
        out.append({
            "area": a, "month": month, "owners_indiv": indiv, "owners_corp": corp[k],
            "own_20s": band("10대이하", "20대") / indiv, "own_30s": band("30대") / indiv, "own_40s": band("40대") / indiv,
            "own_50s": band("50대") / indiv, "own_60s": band("60대") / indiv, "own_70p": band("70대", "80대", "90대이상") / indiv,
            "n_40_60s": band("40대", "50대", "60대"), "n_50_60s": band("50대", "60대"),
            "car_stock": stock, "diesel": fuel[(fk, "경유")], "diesel_share": fuel[(fk, "경유")] / stock,
            "hev_share": hev / stock, "ev_share": (fuel[(fk, "전기")] + fuel[(fk, "수소")] + fuel[(fk, "수소전기")]) / stock,
            "new_ytd": new[k][0], "import_ytd": new[k][1], "scrap_ytd": scrap[k][0], "export_ytd": scrap[k][1],
            "scrap_per1000_yr": scrap[k][0] / stock * 1000 * 12 / m, "scrap_to_new": scrap[k][0] / new[k][0],
        })
    df = pd.DataFrame(out).round(4)
    df.to_csv(ROOT / "data/processed/replacement_region.csv", index=False, encoding="utf-8")

    # 15 차령별 (전국, 승용 계)
    r15 = rows(wb, "15.차령별_차종별_용도별 등록현황")
    my = [{"model_year": int(r[0]), "cars": r[4]} for r in r15[4:] if isinstance(r[0], int)]
    pd.DataFrame(my).to_csv(ROOT / "data/processed/model_year_national.csv", index=False, encoding="utf-8")
    print(f"{src.name} ({month}):")
    print(df[["area", "own_50s", "own_60s", "n_50_60s", "diesel_share", "hev_share", "scrap_ytd", "scrap_per1000_yr", "scrap_to_new"]].to_string(index=False))


if __name__ == "__main__":
    main()
