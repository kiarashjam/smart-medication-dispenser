"""Find exact TODO/PLACEHOLDER on pages 3 and 32."""
import re, pathlib

src = pathlib.Path("Business_Documentation_Complete.html").read_text(encoding="utf-8")
pages = re.split(r'(?=<div class="(?:page[ "]|cover-page))', src)
pages = [p for p in pages if p.strip()]

for target in [3, 32]:
    p = pages[target]
    text = re.sub(r'<[^>]+>', ' ', p)
    text = re.sub(r'\s+', ' ', text).strip()
    for word in ['TODO', 'PLACEHOLDER', 'FIXME']:
        idx = text.find(word)
        if idx >= 0:
            start = max(0, idx - 80)
            end = min(len(text), idx + 120)
            snippet = text[start:end].encode('ascii', 'replace').decode()
            print(f"Page {target}: Found '{word}' at pos {idx}:")
            print(f"  ...{snippet}...")
            print()
