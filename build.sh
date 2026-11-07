#!/usr/bin/env bash
# 원본 → 집계 CSV → docs/data.js
set -euo pipefail
cd "$(dirname "$0")"
python3 scripts/build_population.py
python3 scripts/build_registration.py
python3 scripts/build_site.py
