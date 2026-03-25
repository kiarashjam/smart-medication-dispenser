"""Search raw HTML for TODO on page 3."""
import re, pathlib

src = pathlib.Path("Business_Documentation_Complete.html").read_text(encoding="utf-8")
pages = re.split(r'(?=<div class="(?:page[ "]|cover-page))', src)
pages = [p for p in pages if p.strip()]

p = pages[3]
idx = p.find('TODO')
if idx >= 0:
    print(f"Found at position {idx}:")
    print(p[max(0,idx-100):idx+100].encode('ascii','replace').decode())
else:
    idx2 = p.upper().find('TODO')
    if idx2 >= 0:
        print(f"Found case-insensitive at position {idx2}:")
        print(p[max(0,idx2-100):idx2+100].encode('ascii','replace').decode())
    else:
        print("No TODO found in page 3 HTML at all")
