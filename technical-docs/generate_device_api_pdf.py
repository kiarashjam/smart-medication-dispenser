"""
Generate HTML + PDF from DEVICE_API_FIRMWARE_GUIDE.md (device JSON reference for firmware).
Uses the same styling approach as generate_pdf.py (Edge/Chrome headless).
"""

import os
import sys
import subprocess


def main():
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "markdown", "--quiet"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    import markdown

    script_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(script_dir, "DEVICE_API_FIRMWARE_GUIDE.md")
    if not os.path.exists(md_path):
        print(f"Missing: {md_path}")
        sys.exit(1)

    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    md_converter = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "nl2br", "sane_lists"],
        output_format="html5",
    )
    html_body = md_converter.convert(md_content)

    css = """
    @page {
        size: A4;
        margin: 2cm 2.2cm;
        @bottom-center {
            content: counter(page);
            font-size: 9pt;
            color: #666;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
    }

    body {
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.55;
        color: #1a1a1a;
    }

    h1 {
        font-size: 20pt;
        color: #1b4332;
        border-bottom: 3px solid #1b4332;
        padding-bottom: 8px;
        margin-top: 0;
        page-break-after: avoid;
    }

    h2 {
        font-size: 14pt;
        color: #2d6a4f;
        border-bottom: 1px solid #40916c;
        margin-top: 22px;
        page-break-after: avoid;
    }

    h3 {
        font-size: 11.5pt;
        color: #344e41;
        margin-top: 16px;
        page-break-after: avoid;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 8.5pt;
        page-break-inside: auto;
    }

    thead { display: table-header-group; }

    th {
        background-color: #1b4332;
        color: white;
        padding: 6px 7px;
        text-align: left;
        border: 1px solid #1b4332;
    }

    td {
        padding: 5px 7px;
        border: 1px solid #ddd;
        vertical-align: top;
    }

    tr:nth-child(even) td { background-color: #f0f7f4; }

    pre {
        background-color: #1e1e1e;
        border-radius: 5px;
        padding: 12px;
        font-family: Consolas, 'Courier New', monospace;
        font-size: 7.5pt;
        line-height: 1.4;
        color: #e8e8e8;
        page-break-inside: avoid;
        white-space: pre-wrap;
        word-break: break-word;
    }

    code {
        font-family: Consolas, 'Courier New', monospace;
        font-size: 8.5pt;
        background: #f0f4f0;
        padding: 1px 4px;
        border-radius: 2px;
    }

    pre code {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: 7.5pt;
    }

    hr { border: none; border-top: 1px solid #ccc; margin: 18px 0; }

    ul, ol { padding-left: 22px; }

    .cover-page {
        text-align: center;
        padding-top: 100px;
        page-break-after: always;
    }

    .cover-page h1 {
        font-size: 26pt;
        border: none;
    }

    .cover-page .subtitle { font-size: 14pt; color: #555; margin: 16px 0 32px; }

    .cover-page .badge {
        display: inline-block;
        background: #1b4332;
        color: #fff;
        padding: 6px 18px;
        border-radius: 4px;
        font-size: 10pt;
    }

    .cover-page .details { font-size: 10.5pt; color: #666; line-height: 1.9; margin-top: 40px; }

    /* Summary tables (Method / Path / Auth) — first column emphasis */
    .main table tr td:first-child {
        font-weight: 600;
        color: #2d4a3e;
        white-space: nowrap;
        width: 28%;
    }

    .main h2 { page-break-after: avoid; }
    .main h3 { page-break-after: avoid; }
    """

    cover = """
    <div class="cover-page">
        <h1>Device API &amp; JSON Reference</h1>
        <div class="subtitle">Smart Medication Dispenser — Firmware / Electronics</div>
        <div class="badge">ENGINEERING HANDOFF</div>
        <div class="details">
            <strong>Document:</strong> DEVICE_API_FIRMWARE_GUIDE.md<br>
            <strong>Content:</strong> Per-endpoint <em>what it does</em>, <em>why</em>, <em>when to call</em>; JSON examples; field tables<br>
            <strong>Regenerate:</strong> <code>python generate_device_api_pdf.py</code> (updates this HTML + PDF)
        </div>
    </div>
    """

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Device API & JSON Reference</title>
    <style>{css}</style>
</head>
<body>
    {cover}
    <section class="main">{html_body}</section>
</body>
</html>"""

    html_path = os.path.join(script_dir, "DEVICE_API_FIRMWARE_GUIDE.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML: {html_path}")

    pdf_path = os.path.join(script_dir, "DEVICE_API_FIRMWARE_GUIDE.pdf")
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]

    browser_path = None
    for p in edge_paths + chrome_paths:
        if os.path.exists(p):
            browser_path = p
            break

    if browser_path:
        html_url = "file:///" + html_path.replace("\\", "/")
        cmd = [
            browser_path,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--print-to-pdf={pdf_path}",
            "--print-to-pdf-no-header",
            html_url,
        ]
        try:
            subprocess.run(cmd, capture_output=True, timeout=120, check=False)
            if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
                print(f"PDF:  {pdf_path} ({os.path.getsize(pdf_path) / 1024:.0f} KB)")
                return
        except Exception as e:
            print(f"Browser PDF failed: {e}")

    print("Open the HTML in a browser and use Print → Save as PDF if PDF was not created.")


if __name__ == "__main__":
    main()
