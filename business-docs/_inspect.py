"""Inspect specific pages for TODO/PLACEHOLDER and overflow content."""
import re, pathlib

src = pathlib.Path("Business_Documentation_Complete.html").read_text(encoding="utf-8")
pages = re.split(r'(?=<div class="(?:page[ "]|cover-page))', src)
pages = [p for p in pages if p.strip()]

def strip_tags(h):
    return re.sub(r'<[^>]+>', ' ', h).strip()

for target in [3, 32]:
    print(f"\n{'='*70}")
    print(f"PAGE {target} - CONTENT")
    print('='*70)
    if target < len(pages):
        text = strip_tags(pages[target])
        text = re.sub(r'\s+', ' ', text)
        idx = text.lower().find('todo')
        if idx == -1:
            idx = text.lower().find('placeholder')
        if idx >= 0:
            start = max(0, idx - 100)
            end = min(len(text), idx + 200)
            snippet = text[start:end].encode('ascii','replace').decode()
            print(f"  Found at char {idx}:")
            print(f"  ...{snippet}...")
        else:
            print("  (Could not locate TODO/PLACEHOLDER)")
        hdgs = re.findall(r'<h[2345][^>]*>(.*?)</h[2345]>', pages[target])
        hdg_str = str(hdgs[:4]).encode('ascii','replace').decode()
        print(f"  Headings: {hdg_str}")

# Also dump the heaviest pages (weight > 5000) content summary
MAX_W = 2600
for target in [3, 59, 136, 152, 154, 155, 156, 161]:
    if target >= len(pages):
        continue
    p = pages[target]
    text = strip_tags(p)
    text = re.sub(r'\s+', ' ', text).strip()
    tbl = len(re.findall(r'<tr', p))
    print(f"\n{'='*70}")
    print(f"PAGE {target} - WEIGHT ANALYSIS (chars={len(text)}, tbl_rows={tbl})")
    print('='*70)
    hdgs = re.findall(r'<h[2345][^>]*>(.*?)</h[2345]>', p)
    hdg_str = str(hdgs[:6]).encode('ascii','replace').decode()
    print(f"  Headings: {hdg_str}")
    print(f"  First 300 chars: {text[:300].encode('ascii','replace').decode()}")
    print(f"  Last 200 chars: {text[-200:].encode('ascii','replace').decode()}")
