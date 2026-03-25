"""
Generate a richly styled PDF from all software documentation markdown files.

Each document category gets a unique color theme, intro page, and visual treatment.
"""

import os
import sys
import subprocess


CATEGORIES = {
    "core": {
        "color": "#0c2461",
        "light": "#e8edf5",
        "gradient": "linear-gradient(135deg, #0c2461 0%, #1e3799 100%)",
        "label": "CORE PLATFORM",
        "emoji": "&#9881;",
    },
    "infra": {
        "color": "#0a6640",
        "light": "#e6f4ed",
        "gradient": "linear-gradient(135deg, #0a6640 0%, #15803d 100%)",
        "label": "INFRASTRUCTURE",
        "emoji": "&#9729;",
    },
    "client": {
        "color": "#5b21b6",
        "light": "#ede9fe",
        "gradient": "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
        "label": "CLIENT APPLICATIONS",
        "emoji": "&#9898;",
    },
    "security": {
        "color": "#9a3412",
        "light": "#fef0e6",
        "gradient": "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
        "label": "SECURITY &amp; COMPLIANCE",
        "emoji": "&#128274;",
    },
    "integration": {
        "color": "#92400e",
        "light": "#fef7e6",
        "gradient": "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
        "label": "INTEGRATION &amp; PROTOCOLS",
        "emoji": "&#128279;",
    },
    "quality": {
        "color": "#065f46",
        "light": "#e6faf4",
        "gradient": "linear-gradient(135deg, #065f46 0%, #047857 100%)",
        "label": "QUALITY &amp; PROCESS",
        "emoji": "&#10004;",
    },
}

DOCS = [
    {
        "file": "01_SOFTWARE_ARCHITECTURE.md",
        "num": "01",
        "title": "Software Architecture",
        "category": "core",
        "audience": "All Engineers",
        "desc": "The architectural foundation of the entire platform. Covers Clean Architecture with CQRS pattern, MediatR command/query dispatching, project layer separation, caching strategies, domain events, and background job orchestration.",
        "topics": ["Clean Architecture", "CQRS + MediatR", "Caching Strategy", "Domain Events", "Background Jobs"],
    },
    {
        "file": "02_BACKEND_API.md",
        "num": "02",
        "title": "Backend API Reference",
        "category": "core",
        "audience": "Backend Engineers, QA, Integrators",
        "desc": "Complete reference for the ASP.NET Core 8 REST API. Documents all 40+ endpoints across 11 controllers, including OTA firmware workflows, device provisioning, travel mode, and caregiver management. Includes request/response schemas and error handling.",
        "topics": ["40+ REST Endpoints", "OTA Workflow", "Device Provisioning", "Travel Mode", "Caregiver Mgmt"],
    },
    {
        "file": "03_DATABASE.md",
        "num": "03",
        "title": "Database Documentation",
        "category": "core",
        "audience": "Backend Engineers, DBAs",
        "desc": "Entity Framework Core data layer documentation covering the full relational schema (10 tables), indexing strategy for query performance, migration workflow, backup and recovery procedures, data retention policies, and monitoring approaches.",
        "topics": ["EF Core Schema", "Indexing Strategy", "Migration Workflow", "Backup & Recovery", "Data Retention"],
    },
    {
        "file": "04_CLOUD_DEPLOYMENT.md",
        "num": "04",
        "title": "Cloud & Deployment",
        "category": "infra",
        "audience": "DevOps Engineers, Backend Engineers",
        "desc": "Infrastructure and deployment operations guide. Covers Docker containerization, CI/CD pipeline configuration, secrets management with Azure Key Vault, auto-scaling policies, environment configuration, and disaster recovery procedures.",
        "topics": ["Docker & Compose", "CI/CD Pipeline", "Secrets Management", "Auto-Scaling", "Disaster Recovery"],
    },
    {
        "file": "05_WEB_PORTAL.md",
        "num": "05",
        "title": "Web Portal",
        "category": "client",
        "audience": "Frontend Engineers",
        "desc": "React + TypeScript + Vite caregiver portal documentation. Covers state management patterns with React Query, component architecture using shadcn/ui, routing with React Router, internationalization setup, accessibility compliance, and testing approach.",
        "topics": ["React + Vite", "State Management", "Component Architecture", "Accessibility", "Testing"],
    },
    {
        "file": "06_MOBILE_APP.md",
        "num": "06",
        "title": "Mobile Application",
        "category": "client",
        "audience": "Mobile Engineers",
        "desc": "React Native / Expo patient application documentation. Covers file-based routing with Expo Router, deep linking configuration, push notification handling, offline data strategy, biometric authentication, and the planned feature roadmap.",
        "topics": ["React Native + Expo", "Deep Linking", "Push Notifications", "Offline Mode", "Biometric Auth"],
    },
    {
        "file": "07_AUTHENTICATION.md",
        "num": "07",
        "title": "Authentication & Authorization",
        "category": "security",
        "audience": "All Engineers",
        "desc": "Security architecture covering JWT token lifecycle (HS256), multi-factor authentication flows, password reset procedures, device API key authentication, session management, and a detailed RBAC permission matrix across all three user roles.",
        "topics": ["JWT Lifecycle", "Multi-Factor Auth", "Device Auth", "Session Management", "RBAC Matrix"],
    },
    {
        "file": "08_INTEGRATIONS_WEBHOOKS.md",
        "num": "08",
        "title": "Integrations & Webhooks",
        "category": "integration",
        "audience": "All Engineers",
        "desc": "External system integration layer. Documents the outgoing webhook system with automatic retry and circuit breaker, FHIR R4 healthcare interoperability, pharmacy and insurer data exchange patterns, and integration monitoring dashboards.",
        "topics": ["Webhook Retry Engine", "FHIR R4", "Pharmacy Integration", "Insurer Exchange", "Monitoring"],
    },
    {
        "file": "09_MONITORING_OBSERVABILITY.md",
        "num": "09",
        "title": "Monitoring & Observability",
        "category": "infra",
        "audience": "DevOps, SRE, All Engineers",
        "desc": "Comprehensive observability stack documentation. Covers application performance monitoring, device fleet health dashboards, alerting rule configuration with escalation policies, structured logging strategy, and SLA/SLO tracking methodology.",
        "topics": ["APM Dashboards", "Fleet Monitoring", "Alert Escalation", "Structured Logging", "SLA Tracking"],
    },
    {
        "file": "10_NOTIFICATION_SYSTEM.md",
        "num": "10",
        "title": "Notification System",
        "category": "infra",
        "audience": "All Engineers",
        "desc": "Multi-channel notification orchestration system. Covers push notification delivery (FCM/APNs), email templates and transactional messaging, SMS integration, caregiver escalation chains, and device-level hardware alert handling.",
        "topics": ["Push (FCM/APNs)", "Email Templates", "SMS Integration", "Escalation Chains", "Device Alerts"],
    },
    {
        "file": "11_INTERNATIONALIZATION.md",
        "num": "11",
        "title": "Internationalization",
        "category": "integration",
        "audience": "All Engineers",
        "desc": "Full multi-language support for all four Swiss national languages plus English. Documents i18n implementation across the web portal (react-i18next), mobile app (Expo Localization), backend API (resource files), and device firmware (voice prompts).",
        "topics": ["FR/DE/IT/EN Support", "react-i18next", "Expo Localization", "Backend Resources", "Voice Prompts"],
    },
    {
        "file": "12_COMPLIANCE_DATA_GOVERNANCE.md",
        "num": "12",
        "title": "Compliance & Data Governance",
        "category": "security",
        "audience": "All Engineers, Compliance, Auditors",
        "desc": "Regulatory compliance and data governance framework. Covers GDPR data subject rights implementation, Swiss nDSG compliance, CE MDR Class IIa software requirements (IEC 62304), security testing program, audit trail architecture, and subscription billing compliance.",
        "topics": ["GDPR / nDSG", "CE MDR Class IIa", "IEC 62304", "Audit Trail", "Security Testing"],
    },
    {
        "file": "13_ERROR_CODES_REFERENCE.md",
        "num": "13",
        "title": "Error Codes Reference",
        "category": "integration",
        "audience": "All Engineers",
        "desc": "Complete catalog of all 47 system error codes organized by domain. Covers network connectivity errors, hardware sensor failures, power management faults, storage subsystem issues, and software application errors with recommended handling for each code.",
        "topics": ["47 Error Codes", "Network Errors", "Hardware Faults", "Power Issues", "Software Errors"],
    },
    {
        "file": "14_DEVICE_CLOUD_PROTOCOL.md",
        "num": "14",
        "title": "Device-Cloud Protocol",
        "category": "integration",
        "audience": "Firmware & Backend Engineers",
        "desc": "Low-level firmware-to-cloud communication protocol specification. Documents the MQTT/HTTPS transport layer, OTA firmware update workflow, offline event buffering and sync, heartbeat and keepalive commands, and telemetry event schemas.",
        "topics": ["MQTT/HTTPS Transport", "OTA Updates", "Offline Buffering", "Heartbeat Protocol", "Telemetry Events"],
    },
    {
        "file": "15_TESTING_STRATEGY.md",
        "num": "15",
        "title": "Testing Strategy",
        "category": "quality",
        "audience": "QA Engineers, All Engineers",
        "desc": "Comprehensive testing strategy with 130+ individually tracked test cases. Covers unit, integration, and system test levels, load and performance testing methodology, security penetration testing plan, accessibility (WCAG 2.1) testing, and CI/CD quality gate configuration.",
        "topics": ["130+ Test IDs", "Load Testing", "Security Testing", "Accessibility", "CI/CD Gates"],
    },
    {
        "file": "16_DOCUMENTATION_STRATEGY.md",
        "num": "16",
        "title": "Documentation Strategy & Gap Analysis",
        "category": "quality",
        "audience": "All Teams, Auditors",
        "desc": "Meta-documentation analyzing the completeness of the entire documentation set. Provides an information architecture framework (Di\u00e1taxis + ISO 15289), gap analysis with mapping table, prioritized action plan with timelines, drop-in templates, and tooling/governance recommendations.",
        "topics": ["Gap Analysis", "Action Plan", "Templates", "Tooling (MkDocs, Vale)", "Governance"],
    },
]


def main():
    print("Installing dependencies...")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "markdown", "--quiet"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    import markdown

    script_dir = os.path.dirname(os.path.abspath(__file__))

    print("Reading markdown files...")
    all_md = []
    for doc in DOCS:
        fpath = os.path.join(script_dir, doc["file"])
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            all_md.append((doc, content))
            print(f"  [OK] {doc['file']}")
        else:
            print(f"  [SKIP] {doc['file']} (not found)")

    print("Converting markdown to HTML...")
    md_converter = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "nl2br", "sane_lists"],
        output_format="html5",
    )

    html_sections = []
    for i, (doc, md_content) in enumerate(all_md):
        cat = CATEGORIES[doc["category"]]
        md_converter.reset()
        html_body = md_converter.convert(md_content)

        topics_html = "".join(
            f'<span class="topic-pill" style="background-color:{cat["light"]};'
            f'color:{cat["color"]};border:1px solid {cat["color"]}22;">'
            f"{t}</span>"
            for t in doc["topics"]
        )

        intro = f"""
        <div class="section-intro" style="page-break-before:always;">
            <div class="intro-accent" style="background:{cat['gradient']};"></div>
            <div class="intro-badge" style="background-color:{cat['color']};">{cat['label']}</div>
            <div class="intro-number" style="color:{cat['color']};">{doc['num']}</div>
            <h2 class="intro-title" style="color:{cat['color']};">{doc['title']}</h2>
            <div class="intro-audience"><strong>Audience:</strong> {doc['audience']}</div>
            <p class="intro-desc">{doc['desc']}</p>
            <div class="intro-topics">{topics_html}</div>
        </div>
        """

        section_html = (
            f'<section class="document-section" '
            f'data-category="{doc["category"]}">'
            f"{html_body}</section>"
        )

        html_sections.append(intro)
        html_sections.append(section_html)

    html_body_combined = "\n".join(html_sections)

    css = _build_css()
    toc_html = _build_toc()
    cover_html = _build_cover()

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smart Medication Dispenser &mdash; Software Documentation</title>
    <style>{css}</style>
</head>
<body>
    {cover_html}
    {toc_html}
    {html_body_combined}
</body>
</html>"""

    html_path = os.path.join(script_dir, "Software_Documentation_Complete.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML saved: {html_path}")

    _generate_pdf(script_dir, html_path)


def _build_cover():
    return """
    <div class="cover-page">
        <div class="cover-accent"></div>
        <div class="cover-icon">&#60;/&#62;</div>
        <h1>Smart Medication<br>Dispenser</h1>
        <div class="subtitle">Complete Software Documentation</div>
        <div class="version-tag">v2.2 &mdash; 16 Documents &mdash; ~19,600 Lines</div>
        <div class="cover-divider"></div>
        <div class="cover-stack">
            <span class="stack-pill core">ASP.NET Core 8</span>
            <span class="stack-pill client">React + TypeScript</span>
            <span class="stack-pill client">React Native</span>
            <span class="stack-pill infra">PostgreSQL</span>
            <span class="stack-pill infra">Docker</span>
            <span class="stack-pill security">JWT + MFA</span>
        </div>
        <div class="cover-details">
            <strong>Designed and Engineered in Lausanne, Switzerland</strong><br>
            February 2026 &nbsp;&bull;&nbsp; Confidential &mdash; Engineering Team
        </div>
        <div class="cover-categories">
            <span class="cat-dot" style="background:#0c2461;"></span> Core Platform &nbsp;&nbsp;
            <span class="cat-dot" style="background:#0a6640;"></span> Infrastructure &nbsp;&nbsp;
            <span class="cat-dot" style="background:#5b21b6;"></span> Client Apps &nbsp;&nbsp;
            <span class="cat-dot" style="background:#9a3412;"></span> Security &nbsp;&nbsp;
            <span class="cat-dot" style="background:#92400e;"></span> Integration &nbsp;&nbsp;
            <span class="cat-dot" style="background:#065f46;"></span> Quality
        </div>
    </div>
    """


def _build_toc():
    toc_groups = [
        ("Core Platform", "core", [d for d in DOCS if d["category"] == "core"]),
        ("Infrastructure", "infra", [d for d in DOCS if d["category"] == "infra"]),
        ("Client Applications", "client", [d for d in DOCS if d["category"] == "client"]),
        ("Security & Compliance", "security", [d for d in DOCS if d["category"] == "security"]),
        ("Integration & Protocols", "integration", [d for d in DOCS if d["category"] == "integration"]),
        ("Quality & Process", "quality", [d for d in DOCS if d["category"] == "quality"]),
    ]

    html = '<div class="toc"><h2>Table of Contents</h2>'
    for group_name, cat_key, docs in toc_groups:
        cat = CATEGORIES[cat_key]
        html += (
            f'<div class="toc-group">'
            f'<div class="toc-group-header" style="color:{cat["color"]};">'
            f'<span class="toc-group-dot" style="background:{cat["color"]};"></span>'
            f"{group_name}</div><ul>"
        )
        for doc in docs:
            html += (
                f'<li><span class="toc-number" style="background-color:{cat["color"]};">'
                f'{doc["num"]}</span>'
                f'<span><strong>{doc["title"]}</strong><br>'
                f'<em>{doc["audience"]}</em></span></li>'
            )
        html += "</ul></div>"
    html += "</div>"
    return html


def _build_css():
    return """
    @page {
        size: A4;
        margin: 2cm 2.5cm 2.5cm 2.5cm;
        @bottom-center {
            content: counter(page);
            font-size: 8.5pt;
            color: #888;
        }
    }

    @page :first {
        @bottom-center { content: none; }
    }

    body {
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
        font-size: 10.5pt;
        line-height: 1.65;
        color: #1a1a2e;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    /* ── COVER PAGE ────────────────────────────────── */
    .cover-page {
        text-align: center;
        padding-top: 110px;
        page-break-after: always;
        position: relative;
    }

    .cover-accent {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 8px;
        background: linear-gradient(90deg, #0c2461, #5b21b6, #0a6640, #9a3412);
    }

    .cover-icon {
        font-size: 36pt;
        color: #0c2461;
        margin-bottom: 10px;
        font-family: 'Cascadia Code', 'Consolas', monospace;
        letter-spacing: -2pt;
    }

    .cover-page h1 {
        font-size: 36pt;
        color: #0c2461;
        background: none;
        border: none;
        margin: 0 0 8px 0;
        padding: 0;
        letter-spacing: 1pt;
        line-height: 1.2;
    }

    .cover-page .subtitle {
        font-size: 17pt;
        color: #1e3799;
        font-weight: 300;
        letter-spacing: 0.5pt;
        margin-bottom: 10px;
    }

    .cover-page .version-tag {
        display: inline-block;
        font-size: 10pt;
        color: #0c2461;
        background: #eef2f7;
        border: 1.5px solid #4a69bd;
        border-radius: 20px;
        padding: 4px 22px;
        margin: 12px 0 10px 0;
        letter-spacing: 0.3pt;
    }

    .cover-divider {
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, #0c2461, #4a69bd);
        margin: 18px auto;
    }

    .cover-stack {
        margin: 18px auto;
        max-width: 480px;
    }

    .stack-pill {
        display: inline-block;
        font-size: 8.5pt;
        padding: 3px 12px;
        border-radius: 12px;
        margin: 3px 2px;
        font-weight: 600;
        letter-spacing: 0.2pt;
    }
    .stack-pill.core { background: #e8edf5; color: #0c2461; }
    .stack-pill.infra { background: #e6f4ed; color: #0a6640; }
    .stack-pill.client { background: #ede9fe; color: #5b21b6; }
    .stack-pill.security { background: #fef0e6; color: #9a3412; }

    .cover-details {
        font-size: 11pt;
        color: #555;
        line-height: 2;
        margin-top: 20px;
    }
    .cover-details strong { color: #0c2461; }

    .cover-categories {
        font-size: 8.5pt;
        color: #888;
        margin-top: 50px;
        padding-top: 16px;
        border-top: 1px solid #ddd;
    }
    .cat-dot {
        display: inline-block;
        width: 8px; height: 8px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 3px;
    }

    /* ── TABLE OF CONTENTS ─────────────────────────── */
    .toc {
        page-break-after: always;
    }

    .toc h2 {
        font-size: 22pt;
        text-align: center;
        border: none;
        background: none;
        color: #0c2461;
        margin-bottom: 24px;
        letter-spacing: 1pt;
        padding: 0;
    }

    .toc-group {
        margin-bottom: 16px;
    }

    .toc-group-header {
        font-size: 10pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2pt;
        padding: 6px 0 4px 0;
        border-bottom: 2px solid currentColor;
        margin-bottom: 4px;
    }
    .toc-group-dot {
        display: inline-block;
        width: 10px; height: 10px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 6px;
    }

    .toc ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .toc li {
        padding: 7px 0;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: baseline;
        font-size: 10.5pt;
    }
    .toc li:last-child { border-bottom: none; }
    .toc li strong { color: #1a1a2e; font-size: 10.5pt; }
    .toc li em { color: #888; font-size: 8.5pt; font-style: normal; }

    .toc-number {
        display: inline-block;
        width: 28px; height: 28px;
        line-height: 28px;
        text-align: center;
        color: white;
        border-radius: 50%;
        font-size: 8pt;
        font-weight: 700;
        margin-right: 10px;
        flex-shrink: 0;
    }

    /* ── SECTION INTRO PAGES ───────────────────────── */
    .section-intro {
        text-align: center;
        padding-top: 140px;
        padding-bottom: 60px;
        position: relative;
    }

    .intro-accent {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
    }

    .intro-badge {
        display: inline-block;
        color: white;
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 1.5pt;
        padding: 3px 16px;
        border-radius: 12px;
        margin-bottom: 14px;
    }

    .intro-number {
        font-size: 52pt;
        font-weight: 800;
        line-height: 1;
        margin-bottom: 2px;
        opacity: 0.15;
    }

    .intro-title {
        font-size: 26pt;
        font-weight: 700;
        margin: -20px 0 14px 0;
        border: none;
        padding: 0;
        background: none;
        letter-spacing: 0.5pt;
    }

    .intro-audience {
        font-size: 10pt;
        color: #666;
        margin-bottom: 20px;
    }
    .intro-audience strong { color: #444; }

    .intro-desc {
        font-size: 11pt;
        color: #333;
        max-width: 480px;
        margin: 0 auto 22px auto;
        line-height: 1.7;
        text-align: center;
    }

    .intro-topics {
        max-width: 480px;
        margin: 0 auto;
    }

    .topic-pill {
        display: inline-block;
        font-size: 8pt;
        font-weight: 600;
        padding: 3px 12px;
        border-radius: 12px;
        margin: 3px 2px;
        letter-spacing: 0.2pt;
    }

    /* ── DOCUMENT CONTENT ──────────────────────────── */
    .document-section {
        page-break-inside: auto;
    }

    h1 {
        font-size: 22pt;
        border-bottom: none;
        padding: 14px 18px 12px 18px;
        margin: 0 0 20px 0;
        background: linear-gradient(135deg, #0c2461 0%, #1e3799 100%);
        color: white;
        border-radius: 4px;
        letter-spacing: 0.3pt;
        page-break-after: avoid;
    }

    /* Category-specific h1 overrides */
    [data-category="core"] h1 { background: linear-gradient(135deg, #0c2461, #1e3799); }
    [data-category="infra"] h1 { background: linear-gradient(135deg, #0a6640, #15803d); }
    [data-category="client"] h1 { background: linear-gradient(135deg, #5b21b6, #7c3aed); }
    [data-category="security"] h1 { background: linear-gradient(135deg, #9a3412, #c2410c); }
    [data-category="integration"] h1 { background: linear-gradient(135deg, #92400e, #b45309); }
    [data-category="quality"] h1 { background: linear-gradient(135deg, #065f46, #047857); }

    /* Category-specific h2 border colors */
    [data-category="core"] h2 { color: #0c2461; border-bottom-color: #4a69bd; }
    [data-category="infra"] h2 { color: #0a6640; border-bottom-color: #15803d; }
    [data-category="client"] h2 { color: #5b21b6; border-bottom-color: #7c3aed; }
    [data-category="security"] h2 { color: #9a3412; border-bottom-color: #c2410c; }
    [data-category="integration"] h2 { color: #92400e; border-bottom-color: #b45309; }
    [data-category="quality"] h2 { color: #065f46; border-bottom-color: #047857; }

    /* Category-specific h3 left border */
    [data-category="core"] h3 { border-left-color: #4a69bd; color: #1e3a5f; }
    [data-category="infra"] h3 { border-left-color: #15803d; color: #064e36; }
    [data-category="client"] h3 { border-left-color: #7c3aed; color: #4c1d95; }
    [data-category="security"] h3 { border-left-color: #c2410c; color: #7c2d12; }
    [data-category="integration"] h3 { border-left-color: #b45309; color: #78350f; }
    [data-category="quality"] h3 { border-left-color: #047857; color: #064e36; }

    /* Category-specific table header */
    [data-category="core"] th { background-color: #0c2461; border-color: #0c2461; }
    [data-category="infra"] th { background-color: #0a6640; border-color: #0a6640; }
    [data-category="client"] th { background-color: #5b21b6; border-color: #5b21b6; }
    [data-category="security"] th { background-color: #9a3412; border-color: #9a3412; }
    [data-category="integration"] th { background-color: #92400e; border-color: #92400e; }
    [data-category="quality"] th { background-color: #065f46; border-color: #065f46; }

    /* Category-specific blockquote */
    [data-category="core"] blockquote { border-left-color: #4a69bd; }
    [data-category="infra"] blockquote { border-left-color: #15803d; }
    [data-category="client"] blockquote { border-left-color: #7c3aed; }
    [data-category="security"] blockquote { border-left-color: #c2410c; }
    [data-category="integration"] blockquote { border-left-color: #b45309; }
    [data-category="quality"] blockquote { border-left-color: #047857; }

    h2 {
        font-size: 15pt;
        color: #0c2461;
        border-bottom: 2px solid #4a69bd;
        padding-bottom: 6px;
        margin-top: 28px;
        margin-bottom: 14px;
        letter-spacing: 0.2pt;
        page-break-after: avoid;
        background: none;
    }

    h3 {
        font-size: 12.5pt;
        color: #1e3a5f;
        margin-top: 20px;
        margin-bottom: 8px;
        border-left: 4px solid #4a69bd;
        padding-left: 10px;
        page-break-after: avoid;
    }

    h4 {
        font-size: 11pt;
        color: #2c3e50;
        margin-top: 16px;
        margin-bottom: 6px;
        font-weight: 600;
        page-break-after: avoid;
    }

    h5 {
        font-size: 10pt;
        color: #34495e;
        margin-top: 12px;
        margin-bottom: 4px;
        font-weight: 600;
    }

    p {
        margin-bottom: 8px;
        text-align: justify;
        orphans: 3;
        widows: 3;
    }

    strong { color: #0c2461; }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0;
        font-size: 9pt;
        page-break-inside: auto;
        border: 1px solid #d5dbe3;
    }

    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }

    th {
        background-color: #0c2461;
        color: white;
        font-weight: 600;
        padding: 9px 10px;
        text-align: left;
        border: 1px solid #0c2461;
        font-size: 8.5pt;
        letter-spacing: 0.2pt;
    }

    td {
        padding: 7px 10px;
        border: 1px solid #e0e4ea;
        vertical-align: top;
        line-height: 1.45;
    }

    tr:nth-child(even) td { background-color: #f5f7fa; }
    tr:nth-child(odd) td { background-color: #fff; }

    code {
        background-color: #f0f3f8;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
        font-size: 8.5pt;
        color: #0c2461;
        border: 1px solid #d5dbe3;
    }

    pre {
        background-color: #1e1e2e;
        border: 1px solid #2d2d44;
        border-left: 4px solid #4a69bd;
        border-radius: 0 6px 6px 0;
        padding: 16px 18px;
        overflow-x: auto;
        font-size: 7.5pt;
        line-height: 1.5;
        page-break-inside: avoid;
        margin: 14px 0;
        color: #d4d4d4;
    }

    pre code {
        background: transparent;
        padding: 0;
        border: none;
        color: #d4d4d4;
        font-size: 7.5pt;
    }

    blockquote {
        border-left: 4px solid #4a69bd;
        margin: 16px 0;
        padding: 12px 18px;
        background-color: #eef2f7;
        color: #1e3a5f;
        border-radius: 0 6px 6px 0;
        font-style: italic;
    }
    blockquote strong { color: #0c2461; font-style: normal; }
    blockquote p { margin-bottom: 4px; }

    hr {
        border: none;
        border-top: 1.5px solid #d5dbe3;
        margin: 24px 0;
    }

    ul, ol { margin-bottom: 10px; padding-left: 22px; }
    li { margin-bottom: 5px; line-height: 1.55; }
    li > ul, li > ol { margin-top: 4px; margin-bottom: 4px; }

    a { color: #1e3799; text-decoration: none; }
    em { font-style: italic; color: #444; }

    @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cover-page { page-break-after: always; }
        .toc { page-break-after: always; }
        .section-intro { page-break-before: always; }
    }
    """


def _generate_pdf(script_dir, html_path):
    pdf_path = os.path.join(script_dir, "Software_Documentation_Complete.pdf")

    browser_candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]

    browser_path = None
    for p in browser_candidates:
        if os.path.exists(p):
            browser_path = p
            break

    if browser_path:
        print(f"Generating PDF with: {os.path.basename(browser_path)}...")
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

    print("\n[WARNING] Could not auto-generate PDF.")
    print(f"HTML saved at: {html_path}")
    print("Open in browser and use Print > Save as PDF.")


if __name__ == "__main__":
    main()
