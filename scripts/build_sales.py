"""월별 국산차 내수 판매(2009.1~) → 월별 판매 지수(그 해 월평균 = 1.0).

입력:  data/raw/domestic_sales_monthly_*.csv  (기간, 내수판매(국산차), 수출량, 수출금액(천달러))
출력:  data/processed/domestic_sales_monthly.csv
"""
from __future__ import annotations

import glob
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(sorted(glob.glob(str(ROOT / "data/raw/domestic_sales_monthly_*.csv")))[-1])
    s = pd.read_csv(src, encoding="utf-8-sig")
    s.columns = ["ym", "domestic", "export", "export_kusd"]
    s["year"] = s["ym"].str[:4].astype(int)
    s["month"] = s["ym"].str[5:7].astype(int)
    s["idx"] = (s["domestic"] / s.groupby("year")["domestic"].transform("mean")).round(4)
    s.to_csv(ROOT / "data/processed/domestic_sales_monthly.csv", index=False, encoding="utf-8")
    print(f"{src.name}: {s['ym'].iloc[0]}~{s['ym'].iloc[-1]}, {len(s)}개월")


if __name__ == "__main__":
    main()
