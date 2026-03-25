"""
Generate a single PDF from all technical documentation markdown files.
"""

import os
import sys
import subprocess


def main():
    # Install markdown library
    print("Installing dependencies...")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "markdown", "--quiet"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    import markdown

    # Directory containing the markdown files
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Ordered list of markdown files to include
    md_files = [
        "01_DEVICE_HARDWARE.md",
        "02_API_INTEGRATION.md",
        "03_DATA_FORMATS.md",
        "04_SECURITY.md",
        "05_TESTING.md",
        "06_BUILD_GUIDE.md",
        "07_COMPONENT_SELECTION_GUIDE.md",
        "08_FIRMWARE_GUIDE.md",
    ]

    # Read and concatenate all markdown content
    print("Reading markdown files...")
    all_md = []
    for fname in md_files:
        fpath = os.path.join(script_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            all_md.append(content)
            print(f"  [OK] {fname}")
        else:
            print(f"  [SKIP] {fname} (not found)")

    # Convert markdown to HTML
    print("Converting markdown to HTML...")
    md_converter = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "nl2br", "sane_lists"],
        output_format="html5",
    )

    # Build individual HTML sections with page breaks
    html_sections = []
    for i, md_content in enumerate(all_md):
        md_converter.reset()
        html_body = md_converter.convert(md_content)
        if i > 0:
            html_sections.append('<div class="page-break"></div>')
        html_sections.append(f'<section class="document-section">{html_body}</section>')

    html_body_combined = "\n".join(html_sections)

    # CSS for professional technical documentation PDF
    css = """
    @page {
        size: A4;
        margin: 2cm 2.5cm;
        @bottom-center {
            content: counter(page);
            font-size: 9pt;
            color: #666;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
    }

    body {
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-size: 10.5pt;
        line-height: 1.6;
        color: #1a1a1a;
        max-width: 100%;
    }

    .page-break {
        page-break-before: always;
    }

    .document-section {
        page-break-inside: auto;
    }

    h1 {
        font-size: 22pt;
        color: #1b4332;
        border-bottom: 3px solid #1b4332;
        padding-bottom: 8px;
        margin-top: 0;
        margin-bottom: 16px;
        page-break-after: avoid;
    }

    h2 {
        font-size: 16pt;
        color: #2d6a4f;
        border-bottom: 1.5px solid #40916c;
        padding-bottom: 5px;
        margin-top: 24px;
        margin-bottom: 12px;
        page-break-after: avoid;
    }

    h3 {
        font-size: 13pt;
        color: #344e41;
        margin-top: 18px;
        margin-bottom: 8px;
        page-break-after: avoid;
    }

    h4 {
        font-size: 11pt;
        color: #3a5a40;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
    }

    h5 {
        font-size: 10.5pt;
        color: #52796f;
        margin-top: 12px;
        margin-bottom: 4px;
        page-break-after: avoid;
    }

    p {
        margin-bottom: 8px;
    }

    strong {
        color: #1b4332;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
        font-size: 9pt;
        page-break-inside: auto;
    }

    thead {
        display: table-header-group;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }

    th {
        background-color: #1b4332;
        color: white;
        font-weight: 600;
        padding: 7px 8px;
        text-align: left;
        border: 1px solid #1b4332;
        font-size: 8.5pt;
    }

    td {
        padding: 5px 8px;
        border: 1px solid #ddd;
        vertical-align: top;
        font-size: 8.5pt;
    }

    tr:nth-child(even) td {
        background-color: #f0f7f4;
    }

    code {
        background-color: #f0f4f0;
        padding: 2px 5px;
        border-radius: 3px;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 8.5pt;
        color: #1b4332;
    }

    pre {
        background-color: #1e1e1e;
        border: 1px solid #333;
        border-radius: 5px;
        padding: 14px;
        overflow-x: auto;
        font-size: 8pt;
        line-height: 1.45;
        page-break-inside: avoid;
        color: #d4d4d4;
    }

    pre code {
        background-color: transparent;
        padding: 0;
        color: #d4d4d4;
        font-size: 8pt;
    }

    blockquote {
        border-left: 4px solid #40916c;
        margin: 12px 0;
        padding: 8px 16px;
        background-color: #f0f7f4;
        color: #344e41;
    }

    hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 20px 0;
    }

    ul, ol {
        margin-bottom: 10px;
        padding-left: 24px;
    }

    li {
        margin-bottom: 3px;
    }

    a {
        color: #2d6a4f;
        text-decoration: none;
    }

    /* Cover page */
    .cover-page {
        text-align: center;
        padding-top: 120px;
        page-break-after: always;
    }

    .cover-page h1 {
        font-size: 30pt;
        color: #1b4332;
        border: none;
        margin-bottom: 12px;
    }

    .cover-page .subtitle {
        font-size: 16pt;
        color: #555;
        margin-bottom: 30px;
    }

    .cover-page .badge {
        display: inline-block;
        background-color: #1b4332;
        color: white;
        padding: 6px 20px;
        border-radius: 4px;
        font-size: 11pt;
        margin-bottom: 40px;
    }

    .cover-page .details {
        font-size: 11pt;
        color: #666;
        line-height: 2;
    }

    /* Table of contents */
    .toc {
        page-break-after: always;
    }

    .toc h2 {
        font-size: 20pt;
        text-align: center;
        border: none;
    }

    .toc ul {
        list-style: none;
        padding: 0;
        font-size: 11pt;
    }

    .toc li {
        padding: 10px 0;
        border-bottom: 1px dotted #ccc;
    }

    .toc li strong {
        color: #1b4332;
    }

    .toc .doc-desc {
        display: block;
        font-size: 9pt;
        color: #777;
        margin-top: 3px;
    }
    """

    # Table of contents
    toc_items = [
        ("01", "Device Hardware Specifications", "Complete electronics engineering guide, block diagrams, MCU, power, sensors"),
        ("02", "API Integration Guide", "Complete API reference -- Device protocol & User/App API (40+ endpoints)"),
        ("03", "Data Formats Reference", "JSON schemas for all events, DTOs, domain model, enums"),
        ("04", "Security & Compliance", "Encryption, JWT auth, X-API-Key, GDPR/CE MDR compliance"),
        ("05", "Testing Plan", "Complete test plan -- Hardware, API, mobile, web, E2E, CI"),
        ("06", "Build Guide", "Step-by-step hardware assembly instructions"),
        ("07", "Component Selection Guide", "Component recommendations, alternatives & suppliers"),
        ("08", "Firmware Guide", "ESP32 firmware development with API client code"),
    ]

    toc_html = '<div class="toc"><h2>Table of Contents</h2><ul>'
    for num, title, desc in toc_items:
        toc_html += f'<li><strong>{num}.</strong> {title}<span class="doc-desc">{desc}</span></li>'
    toc_html += "</ul></div>"

    # Cover page
    cover_html = """
    <div class="cover-page">
        <h1>Smart Medication Dispenser</h1>
        <div class="subtitle">Complete Technical Documentation</div>
        <div class="badge">ENGINEERING REFERENCE</div>
        <br><br>
        <div class="details">
            <strong>Designed and Engineered in Lausanne, Switzerland</strong><br>
            <strong>Version:</strong> 4.0<br>
            <strong>Date:</strong> February 2026<br>
            <strong>Classification:</strong> Confidential - Engineering Team<br>
        </div>
        <br><br>
        <div style="font-size: 9pt; color: #999; margin-top: 60px;">
            Covers: Hardware, Firmware, API, Data Formats, Security, Testing, Assembly, Components
        </div>
    </div>
    """

    # Complete HTML
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smart Medication Dispenser - Technical Documentation</title>
    <style>{css}</style>
</head>
<body>
    {cover_html}
    {toc_html}
    {html_body_combined}
</body>
</html>"""

    # Save HTML
    html_path = os.path.join(script_dir, "Technical_Documentation_Complete.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML saved: {html_path}")

    # Convert to PDF using Microsoft Edge headless
    pdf_path = os.path.join(script_dir, "Technical_Documentation_Complete.pdf")

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
        print(f"Generating PDF with browser: {os.path.basename(browser_path)}...")
        html_url = "file:///" + html_path.replace("\\", "/")
        cmd = [
            browser_path,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            f"--print-to-pdf={pdf_path}",
            "--print-to-pdf-no-header",
            html_url,
        ]
        try:
            subprocess.run(cmd, capture_output=True, timeout=120)
            if os.path.exists(pdf_path):
                size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
                print(f"\n[SUCCESS] PDF generated: {pdf_path}")
                print(f"          Size: {size_mb:.1f} MB")
                return
        except Exception as e:
            print(f"Browser PDF generation failed: {e}")

    # Fallback
    print("\n[WARNING] Could not auto-generate PDF.")
    print(f"HTML file has been saved at: {html_path}")
    print("You can open it in any browser and use Print -> Save as PDF.")


if __name__ == "__main__":
    main()
