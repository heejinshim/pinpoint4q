"""data/processed/*.csv → docs/data.js (대시보드가 읽는 하나의 데이터 묶음).

사용:  python scripts/build_site.py
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "data/processed"


def records(df: pd.DataFrame) -> list[dict]:
    return json.loads(df.to_json(orient="records", force_ascii=False))


def top_dongs(dong: pd.DataFrame) -> dict:
    """동 단위 Pin Point 후보: 인구 5,000명 이상 읍면동 중 각 지표 상위 15곳."""
    d = dong[dong["pop"] >= 5000].copy()
    d["n0_9"] = (d["age0_9"] * d["pop"]).round()
    d["n20_29"] = (d["age20_29"] * d["pop"]).round()
    d["n60p"] = (d["age60p"] * d["pop"]).round()
    cols = ["sido", "sgg", "gu", "dong", "pop", "age0_9", "age20_29", "age30_44", "age60p", "family_idx"]
    return {
        "family": records(d.sort_values("family_idx", ascending=False).head(15)[cols + ["n0_9"]]),
        "young": records(d.sort_values("age20_29", ascending=False).head(15)[cols + ["n20_29"]]),
        # 60세+ 비중 35% 이상인 고령 읍면동 중 60세+ 인원이 많은 순 (농촌·원도심 순회 판촉 후보)
        "senior": records(d[d["age60p"] >= 0.35].sort_values("n60p", ascending=False).head(15)[cols + ["n60p"]]),
    }


def main() -> None:
    dong = pd.read_csv(P / "population_dong.csv").fillna({"gu": ""})
    sgg = pd.read_csv(P / "population_sgg.csv")
    veh = pd.read_csv(P / "newreg2025_sgg.csv")
    sgg = sgg.merge(veh, on=["sido", "sgg"], how="left")
    data = {
        "built": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "popAsOf": str(dong["as_of"].iloc[0]),
        "sgg": records(sgg),
        "dong": records(dong.drop(columns=["as_of"])),
        "pin": top_dongs(dong),
        "area": records(pd.read_csv(P / "area_profile_2025.csv")),
        "h2h": records(pd.read_csv(P / "head_to_head_2025.csv")),
        "ev": records(pd.read_csv(P / "ev_trend.csv")),
        "top10": records(pd.read_csv(P / "model_top10_2025.csv")),
        "focus": records(pd.read_csv(P / "promo_focus.csv")),
        "insight": records(pd.read_csv(P / "promo_insight.csv")),
        "issues": records(pd.read_csv(P / "local_issues.csv").fillna("")),
        "repl": records(pd.read_csv(P / "replacement_region.csv")),
        "myear": records(pd.read_csv(P / "model_year_national.csv")),
        "finMonthly": records(pd.read_csv(P / "finance_monthly_2611.csv")),
        "finSaving": records(pd.read_csv(P / "finance_saving_2611.csv")),
        "sales": records(pd.read_csv(P / "domestic_sales_monthly.csv")[["ym", "year", "month", "domestic", "idx"]]),
    }
    (ROOT / "docs/data.js").write_text("window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"docs/data.js: 시군구 {len(data['sgg'])}, 읍면동 {len(data['dong'])}")


if __name__ == "__main__":
    main()
