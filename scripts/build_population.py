"""주민등록 인구(행정안전부, 읍면동·1세 단위 CSV) → 대전·세종·충남 읍면동/시군구 연령 구성.

입력:  data/raw/population_*.csv   (cp949, 행정안전부 '주민등록 인구 및 세대현황' 연령별 다운로드)
출력:  data/processed/population_dong.csv, data/processed/population_sgg.csv

사용:  python scripts/build_population.py [입력 CSV 경로]
"""
from __future__ import annotations

import glob
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SIDO = {"대전광역시": "대전", "세종특별자치시": "세종", "충청남도": "충남"}
BANDS = {  # 연령대: (시작, 끝) 포함
    "age0_9": (0, 9),
    "age10_19": (10, 19),
    "age20_29": (20, 29),
    "age30_44": (30, 44),
    "age45_59": (45, 59),
    "age60p": (60, 110),
}


def age_col(age: int, sex: str) -> str:
    return f"{age}세이상 {sex}" if age == 110 else f"{age}세{sex}"


def load(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="cp949")
    df = df[df["시도명"].isin(SIDO)].copy()
    df["sido"] = df["시도명"].map(SIDO)
    # 세종은 시군구명이 비어 있음, 천안은 동남구·서북구를 천안시로 묶음
    sgg = df["시군구명"].fillna("").astype(str).str.strip()
    df["gu"] = sgg.where(sgg.str.startswith("천안시"), "")
    df["sgg"] = sgg.str.replace(r"^천안시.*$", "천안시", regex=True)
    df.loc[df["sido"] == "세종", "sgg"] = "세종시"
    df["dong"] = df["읍면동명"].astype(str).str.strip()
    return df


def bands(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=df.index)
    for key, (a, b) in BANDS.items():
        cols = [age_col(x, s) for x in range(a, b + 1) for s in ("남자", "여자")]
        out[key] = df[cols].sum(axis=1)
    out["male25_44"] = df[[age_col(x, "남자") for x in range(25, 45)]].sum(axis=1)
    return out


def shares(g: pd.DataFrame) -> pd.DataFrame:
    g = g.copy()
    for key in [*BANDS, "male25_44"]:
        g[key] = (g[key] / g["pop"]).round(4)
    # 영패밀리 지수: 0–9세 + 30–44세 비중 (타겟 단지 선별용)
    g["family_idx"] = (g["age0_9"] + g["age30_44"]).round(4)
    return g


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(sorted(glob.glob(str(ROOT / "data/raw/population_*.csv")))[-1])
    df = load(src)
    b = bands(df)
    base = pd.concat([df[["sido", "sgg", "gu", "dong", "기준연월"]], df[["계", "남자", "여자"]].rename(columns={"계": "pop", "남자": "male", "여자": "female"}), b], axis=1)
    num = ["pop", "male", "female", *BANDS, "male25_44"]

    dong = shares(base[base["pop"] > 0])
    dong = dong.sort_values(["sido", "sgg", "pop"], ascending=[True, True, False])
    dong.rename(columns={"기준연월": "as_of"}).to_csv(ROOT / "data/processed/population_dong.csv", index=False, encoding="utf-8")

    sgg = base.groupby(["sido", "sgg"], as_index=False)[num].sum()
    sgg["dongs"] = base.groupby(["sido", "sgg"]).size().values
    shares(sgg).sort_values("pop", ascending=False).to_csv(ROOT / "data/processed/population_sgg.csv", index=False, encoding="utf-8")

    print(f"{src.name}: 읍면동 {len(dong)}곳, 시군구 {len(sgg)}곳, 인구 {int(base['pop'].sum()):,}명")


if __name__ == "__main__":
    main()
