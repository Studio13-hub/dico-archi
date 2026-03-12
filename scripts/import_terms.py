import csv
import json
import os
import sys
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CSV_URL = os.environ.get("CSV_URL")
CSV_PATH = os.environ.get("CSV_PATH")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

if not CSV_URL and not CSV_PATH:
    print("Provide CSV_URL (shared sheet) or CSV_PATH (local file)")
    sys.exit(1)

if CSV_URL:
    with urllib.request.urlopen(CSV_URL) as response:
        content = response.read().decode("utf-8")
        lines = content.splitlines()
else:
    with open(CSV_PATH, "r", encoding="utf-8") as file:
        lines = file.read().splitlines()

reader = csv.DictReader(lines)
rows = []

for row in reader:
    term = (row.get("term") or "").strip()
    if not term:
        continue

    related_raw = row.get("related") or ""
    related = [item.strip() for item in related_raw.split("|") if item.strip()]

    rows.append({
        "term": term,
        "category": (row.get("category") or "Non classe").strip(),
        "definition": (row.get("definition") or "").strip(),
        "example": (row.get("example") or "").strip(),
        "related": related,
        "image_url": (row.get("image_url") or "").strip() or None,
    })

if not rows:
    print("No rows to import")
    sys.exit(0)

endpoint = f"{SUPABASE_URL}/rest/v1/terms?on_conflict=term"
headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation",
}

data = json.dumps(rows).encode("utf-8")
request = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")

with urllib.request.urlopen(request) as response:
    body = response.read().decode("utf-8")
    print("Imported", len(rows), "rows")
    if body:
        print(body)
