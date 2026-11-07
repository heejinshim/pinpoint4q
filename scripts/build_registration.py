"""KOSIS '자동차등록대수현황 시도별'(DT_MLTM_5498) 엑셀 → 시군구별 차종·용도 등록대수(누적 보유).

입력:  data/raw/registration_stock_*.xlsx  (KOSIS에서 시도명·시군구 × 차종(승용/승합/화물/특수/총계) × 용도(관용/자가용/영업용/계) 로 내려받은 표)
출력:  data/processed/registration_stock_sgg.csv  (long: sido, sgg, month, type, use, n)

사용:  python scripts/build_registration.py [입력 xlsx 경로]
"""
from __future__ import annotations

import glob
import sys
import warnings
from pathlib import Path

import openpyxl
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
TARGET = {"대전", "세종", "충남"}
warnings.filterwarnings("ignore", category=UserWarning)


def parse(path: Path) -> pd.DataFrame:
    ws = openpyxl.load_workbook(path, data_only=True)["데이터"]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    # 머리글 3줄: 기간 / 차종 / 용도 (병합 셀은 앞 값으로 채움)
    period, types, uses = rows[0], rows[1], rows[2]

    def ffill(xs):
        out, last = [], None
        for x in xs:
            last = x if x not in (None, "") else last
            out.append(last)
        return out

    period, types = ffill(period), ffill(types)
    recs, sido = [], None
    for r in rows[3:]:
        if r[0] not in (None, ""):
            sido = str(r[0]).strip()
        sgg = str(r[1]).strip() if r[1] not in (None, "") else "계"
        for j in range(2, len(r)):
            if r[j] is None:
                continue
            recs.append({"sido": sido, "sgg": sgg, "month": str(period[j]), "type": types[j], "use": uses[j], "n": int(r[j])})
    return pd.DataFrame(recs)


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(sorted(glob.glob(str(ROOT / "data/raw/registration_stock_*.xlsx")))[-1])
    df = parse(src)
    df.to_csv(ROOT / "data/processed/registration_stock_sgg.csv", index=False, encoding="utf-8")
    have = sorted(set(df["sido"]))
    miss = sorted(TARGET - set(have))
    print(f"{src.name}: {len(df):,}행, 시도 {have}")
    if miss:
        print(f"주의: 분석 대상 {miss} 행이 파일에 없습니다. KOSIS에서 해당 시도·시군구를 모두 선택해 다시 내려받아 주세요.")


if __name__ == "__main__":
    main()
