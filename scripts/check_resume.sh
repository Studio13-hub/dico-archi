#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "== Dico-archi resume check =="
echo "Repo: $ROOT_DIR"
echo

echo "[1/4] Git status"
git status -sb
echo

echo "[2/4] Last commits"
git log --oneline -5
echo

echo "[3/4] Required docs/files"
required_files=(
  "index.html"
  "dictionnaire.html"
  "vercel.json"
  "config.example.js"
  "docs/NEXT_STEPS.md"
  "docs/SETUP.md"
  "docs/RESUME_NOW.md"
  "supabase/core/schema.sql"
  "supabase/migrations/001_core_schema_base.sql"
  "supabase/seeds/seed_categories_suisse_romande.sql"
  "supabase/seeds/seed_terms_core_01.sql"
  "supabaseClient.js"
  "package.json"
)

for path in "${required_files[@]}"; do
  if [[ -f "$path" ]]; then
    echo "OK  $path"
  else
    echo "MISSING  $path"
    exit 1
  fi
done
echo

echo "[4/4] Quality and syntax checks"
for f in *.js; do
  node --check "$f"
done
for f in scripts/*.js; do
  [[ -f "$f" ]] || continue
  node --check "$f"
done
echo "OK  javascript syntax"

echo
echo "Resume check complete."
