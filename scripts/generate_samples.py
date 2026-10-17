import os
import shutil
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

OUT_DIR = "test_samples"
PUB_DIR = "public/samples"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(PUB_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Business Invoice (PDF)
# -------------------------------------------------------------
def make_business_invoice():
    pdf_path = os.path.join(OUT_DIR, "01_business_invoice.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#0f172a'))
    normal_style = ParagraphStyle('NormalStyle', parent=styles['Normal'], fontSize=9, leading=13, textColor=colors.HexColor('#334155'))
    bold_style = ParagraphStyle('BoldStyle', parent=styles['Normal'], fontSize=9, leading=13, fontName="Helvetica-Bold", textColor=colors.HexColor('#0f172a'))
    right_style = ParagraphStyle('RightStyle', parent=styles['Normal'], fontSize=9, leading=13, alignment=2, textColor=colors.HexColor('#334155'))

    story = []
    
    # Header Table
    header_data = [
        [Paragraph("<b>VERTEX SOLUTIONS INC.</b><br/>100 Enterprise Boulevard, Suite 400<br/>San Francisco, CA 94105<br/>support@vertexsolutions.io", normal_style),
         Paragraph("<b>INVOICE</b><br/>Invoice #: <b>INV-2026-8841</b><br/>Date: <b>October 15, 2026</b><br/>Due Date: <b>November 14, 2026</b><br/>PO Number: <b>PO-99201</b>", right_style)]
    ]
    t_header = Table(header_data, colWidths=[300, 240])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    # Bill To Table
    bill_data = [
        [Paragraph("<b>BILL TO:</b><br/>Acme Dynamics Technologies Ltd.<br/>Attn: Accounts Payable<br/>742 Innovation Way, Floor 12<br/>Seattle, WA 98101", normal_style),
         Paragraph("<b>PAYMENT TERMS:</b><br/>Net 30 Days<br/>Currency: USD ($)<br/>Payment Method: ACH / Wire Transfer", normal_style)]
    ]
    t_bill = Table(bill_data, colWidths=[300, 240])
    t_bill.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(t_bill)
    story.append(Spacer(1, 10))

    # Line Items Table
    items_data = [
        ["Item #", "Description", "Qty", "Unit Price", "Total Amount"],
        ["01", "Enterprise Cloud Infrastructure License (Annual)", "1", "$4,800.00", "$4,800.00"],
        ["02", "Custom OCR & Document Pipeline Integration", "40 hrs", "$150.00", "$6,000.00"],
        ["03", "Dedicated Priority Support & SLA (Tier 1)", "12 mos", "$250.00", "$3,000.00"],
        ["04", "Security Audit & Compliance Certification Package", "1", "$2,450.00", "$2,450.00"],
        ["05", "Automated High-Throughput Batch Processing API Addon", "1", "$1,200.00", "$1,200.00"]
    ]
    t_items = Table(items_data, colWidths=[45, 275, 55, 80, 85])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (2,1), (-1,-1), 'RIGHT'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('FONTSIZE', (0,1), (-1,-1), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_items)
    story.append(Spacer(1, 15))

    # Summary Totals
    totals_data = [
        ["", "", "", "Subtotal:", "$17,450.00"],
        ["", "", "", "Sales Tax (8.25%):", "$1,439.63"],
        ["", "", "", "Applied Discount (Promo):", "-$500.00"],
        ["", "", "", "TOTAL DUE:", "$18,389.63"]
    ]
    t_totals = Table(totals_data, colWidths=[45, 220, 55, 135, 85])
    t_totals.setStyle(TableStyle([
        ('ALIGN', (3,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (3,3), (-1,3), 'Helvetica-Bold'),
        ('FONTSIZE', (3,3), (-1,3), 11),
        ('TEXTCOLOR', (3,3), (-1,3), colors.HexColor('#0f172a')),
        ('LINEABOVE', (3,3), (4,3), 1, colors.HexColor('#0f172a')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_totals)
    story.append(Spacer(1, 30))

    # Footer note
    note_p = Paragraph("<b>Wire Instructions:</b> Chase Bank NA | Routing: 121000358 | Account: 9876543210<br/>Thank you for your business. Please direct questions to billing@vertexsolutions.io.", normal_style)
    story.append(note_p)

    doc.build(story)
    shutil.copy(pdf_path, os.path.join(PUB_DIR, "01_business_invoice.pdf"))
    print(f"Created: {pdf_path}")

# -------------------------------------------------------------
# 2. Academic & Math Paper (PDF - Multi-Page with Formulas)
# -------------------------------------------------------------
def make_academic_math_paper():
    pdf_path = os.path.join(OUT_DIR, "02_academic_research_paper.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=45, bottomMargin=45)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=16, leading=20, alignment=1, textColor=colors.HexColor('#111827'))
    author_style = ParagraphStyle('Authors', parent=styles['Normal'], fontSize=9.5, leading=13, alignment=1, textColor=colors.HexColor('#4b5563'))
    abs_title_style = ParagraphStyle('AbsTitle', parent=styles['Heading2'], fontSize=11, leading=14, alignment=1, textColor=colors.HexColor('#111827'), fontName="Helvetica-Bold")
    abs_text_style = ParagraphStyle('AbsText', parent=styles['Normal'], fontSize=8.5, leading=12, alignment=4, leftIndent=30, rightIndent=30, textColor=colors.HexColor('#374151'))
    sec_style = ParagraphStyle('SectionH', parent=styles['Heading2'], fontSize=12, leading=16, textColor=colors.HexColor('#111827'), fontName="Helvetica-Bold")
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9, leading=13.5, alignment=4, textColor=colors.HexColor('#1f2937'))
    eq_style = ParagraphStyle('Equation', parent=styles['Normal'], fontSize=10, leading=14, alignment=1, fontName="Courier-Bold", textColor=colors.HexColor('#1e293b'))

    story = []

    # Title & Authors
    story.append(Paragraph("<b>Fast Layout Parsing and OCR with Compact Transformer Architectures</b>", title_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>A. R. Mitchell</b><sup>1</sup>, <b>Elena Rostova</b><sup>2</sup>, <b>David K. Chen</b><sup>1</sup><br/><sup>1</sup>Department of Computer Science, Stanford University<br/><sup>2</sup>Datalab Research Institute, Zurich", author_style))
    story.append(Spacer(1, 15))

    # Abstract
    story.append(Paragraph("<b>Abstract</b>", abs_title_style))
    story.append(Spacer(1, 4))
    abstract_text = (
        "Modern document intelligence requires processing unstructured visual pages containing complex hierarchies, "
        "tables, and mathematical typography. Traditional multi-gigabyte foundation models achieve high accuracy "
        "but incur prohibitive latency on edge CPU hardware. In this paper, we demonstrate a sub-1M parameter "
        "recurrent convolutional vision-transformer pipeline optimized for lightweight ONNX execution. "
        "Experimental evaluations demonstrate state-of-the-art token error rate (TER < 1.4%) while running at over "
        "45 pages per second on standard commodity four-core CPU nodes."
    )
    story.append(Paragraph(abstract_text, abs_text_style))
    story.append(Spacer(1, 15))

    # Section 1: Introduction
    story.append(Paragraph("1. Mathematical Formulation and Loss Functions", sec_style))
    story.append(Spacer(1, 6))
    intro_p1 = (
        "Let the input document image be denoted as I in R^(H x W x C). The visual encoder maps patches to sequence vectors "
        "Z_0 = [x_class; x_1 E; x_2 E; ...; x_N E] + E_pos, where E is the projection matrix. "
        "The autoregressive decoding objective minimizes the token cross-entropy loss over vocabulary V:"
    )
    story.append(Paragraph(intro_p1, body_style))
    story.append(Spacer(1, 8))

    # Formula 1
    story.append(Paragraph("L_seq(theta) = - SUM_{t=1}^T log P(y_t | y_&lt;t, I; theta) + lambda * ||W||_2^2", eq_style))
    story.append(Spacer(1, 8))

    intro_p2 = (
        "For mathematical expressions and formula detection, the bounding line probability distribution follows a "
        "Gaussian spatial kernel parameterized by center coordinates (mu_x, mu_y) and covariance matrix Sigma:"
    )
    story.append(Paragraph(intro_p2, body_style))
    story.append(Spacer(1, 8))

    # Formula 2
    story.append(Paragraph("G(x, y; mu, Sigma) = (1 / (2*pi * |Sigma|^0.5)) * exp( -0.5 * (x - mu)^T * Sigma^(-1) * (x - mu) )", eq_style))
    story.append(Spacer(1, 12))

    # Performance Benchmarks Table
    bench_data = [
        ["Model Variant", "Params", "Weights Size", "CPU Latency (ms)", "CER (%)", "Math Acc (%)"],
        ["ResNet-OCR Baseline", "24.5M", "98.2 MB", "342 ms", "3.8%", "72.4%"],
        ["Marker Large ViT", "128.0M", "512.0 MB", "890 ms", "1.6%", "91.8%"],
        ["Indra OCR (1M)", "1.05M", "18.4 MB", "42 ms", "1.4%", "89.6%"],
        ["Indra OCR + Math Mode", "1.42M", "24.1 MB", "68 ms", "1.2%", "94.2%"]
    ]
    t_bench = Table(bench_data, colWidths=[130, 65, 75, 95, 65, 75])
    t_bench.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f1f5f9')]),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_bench)
    story.append(Spacer(1, 25))

    # Page Break for multi-page test!
    story.append(PageBreak())

    # Page 2
    story.append(Paragraph("2. Asymptotic Complexity and Convergence Analysis", sec_style))
    story.append(Spacer(1, 6))
    p2_text = (
        "By enforcing block-sparse attention masks over linearized reading order indices pi = (pi_1, pi_2, ..., pi_k), "
        "the attention operational complexity drops from O(N^2) to O(N * log N). "
        "The gradient step for parameter tensor theta at epoch k with momentum beta_1 and beta_2 satisfies the following recurrence:"
    )
    story.append(Paragraph(p2_text, body_style))
    story.append(Spacer(1, 8))

    # Formula 3 & 4
    story.append(Paragraph("m_k = beta_1 * m_{k-1} + (1 - beta_1) * nabla L(theta_{k-1})", eq_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("theta_k = theta_{k-1} - (eta / (sqrt(v_k) + epsilon)) * m_k", eq_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("3. Conclusion & Edge Deployment", sec_style))
    story.append(Spacer(1, 6))
    concl = (
        "We have presented Indra OCR, demonstrating that high-precision document extraction, tabular understanding, "
        "and LaTeX formula transcription can be effectively executed on low-power devices without cloud connectivity. "
        "Future directions include zero-shot multilingual extension and continuous streaming audio-visual synchronization."
    )
    story.append(Paragraph(concl, body_style))
    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>References:</b><br/>"
                           "[1] Vaswani et al., 'Attention Is All You Need', NeurIPS 2017.<br/>"
                           "[2] Datalab Team, 'Marker: High-accuracy PDF to Markdown conversion', 2024.<br/>"
                           "[3] Mitchell & Chen, 'Ultra-Compact ONNX Document Processing', JMLR 2025.", author_style))

    doc.build(story)
    shutil.copy(pdf_path, os.path.join(PUB_DIR, "02_academic_research_paper.pdf"))
    print(f"Created: {pdf_path}")

# -------------------------------------------------------------
# 3. Legal Service Level Agreement (3-Page PDF)
# -------------------------------------------------------------
def make_legal_contract():
    pdf_path = os.path.join(OUT_DIR, "03_legal_service_contract_3pages.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=45, leftMargin=45, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle('HeadStyle', parent=styles['Heading1'], fontSize=15, leading=18, alignment=1, textColor=colors.HexColor('#0f172a'))
    article_style = ParagraphStyle('ArtStyle', parent=styles['Heading2'], fontSize=11, leading=14, textColor=colors.HexColor('#1e293b'), fontName="Helvetica-Bold")
    p_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontSize=8.5, leading=12.5, alignment=4, textColor=colors.HexColor('#334155'))

    story = []

    # Page 1
    story.append(Paragraph("<b>MASTER ENTERPRISE SOFTWARE SERVICE AGREEMENT</b>", header_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<font color='#64748b'><b>Contract Reference:</b> MSA-2026-OCT-7791 | Page 1 of 3</font>", p_style))
    story.append(Spacer(1, 12))

    p1 = (
        "This Master Software Service Agreement (the 'Agreement') is entered into as of October 1, 2026 (the 'Effective Date'), "
        "by and between <b>CloudMatrix Corporation</b>, a Delaware corporation ('Provider'), and <b>Apex Global Logistics LLC</b> ('Client'). "
        "WHEREAS, Provider provides proprietary machine learning optical recognition and indexing services ('Services'); and "
        "WHEREAS, Client desires to retain Provider to perform such Services under the terms set forth herein."
    )
    story.append(Paragraph(p1, p_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("ARTICLE 1: DEFINITIONS AND SCOPE OF SERVICE", article_style))
    story.append(Spacer(1, 4))
    p_def = (
        "1.1. 'Confidential Information' means any proprietary data, customer records, source algorithms, and pricing tables.<br/>"
        "1.2. 'Uptime Commitment' means Provider guarantees 99.95% system availability measured monthly, excluding scheduled maintenance.<br/>"
        "1.3. 'Authorized Users' means designated employees, contractors, and affiliates authorized to submit API payloads.<br/>"
        "1.4. 'Output Data' means parsed markdown, tabular matrices, structured key-value extractions, and vectorized search indexes."
    )
    story.append(Paragraph(p_def, p_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("ARTICLE 2: PROVISION OF SERVICES & LICENSING", article_style))
    story.append(Spacer(1, 4))
    p_lic = (
        "2.1. Subject to full compliance with this Agreement, Provider grants Client a non-exclusive, non-transferable, "
        "world-wide license during the Term to access and utilize the Indra OCR execution engine.<br/>"
        "2.2. Client shall not reverse engineer, decompile, or attempt to derive underlying trained weights without prior written authorization."
    )
    story.append(Paragraph(p_lic, p_style))
    story.append(PageBreak())

    # Page 2
    story.append(Paragraph("<b>MASTER ENTERPRISE SOFTWARE SERVICE AGREEMENT (CONT.)</b>", header_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<font color='#64748b'><b>Contract Reference:</b> MSA-2026-OCT-7791 | Page 2 of 3</font>", p_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("ARTICLE 3: FEES, BILLING & PAYMENT AUDITING", article_style))
    story.append(Spacer(1, 4))
    p_fees = (
        "3.1. Client agrees to pay the annual subscription fee of $48,000.00 USD, invoiced on a semi-annual basis.<br/>"
        "3.2. Excess volume exceeding 10,000,000 pages per billing cycle shall be charged at the rate of $0.002 per page processed.<br/>"
        "3.3. Invoices are payable within thirty (30) calendar days from invoice presentation via electronic wire transfer."
    )
    story.append(Paragraph(p_fees, p_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("ARTICLE 4: DATA PRIVACY, SECURITY & ON-PREMISE COMPLIANCE", article_style))
    story.append(Spacer(1, 4))
    p_priv = (
        "4.1. Local Edge Processing: All document parsing occurs directly in Client's memory or on-premises servers. "
        "Zero document images or metadata are transmitted over external networks to Provider.<br/>"
        "4.2. Provider certifies compliance with SOC 2 Type II, ISO/IEC 27001:2022, and HIPAA Security Rules.<br/>"
        "4.3. Mutual Non-Disclosure: Each party agrees to safeguard Confidential Information using reasonable professional care."
    )
    story.append(Paragraph(p_priv, p_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("ARTICLE 5: WARRANTIES AND LIMITATION OF LIABILITY", article_style))
    story.append(Spacer(1, 4))
    p_liab = (
        "5.1. Provider warrants that the software will operate in substantial accordance with official documentation.<br/>"
        "5.2. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, OR PUNITIVE DAMAGES."
    )
    story.append(Paragraph(p_liab, p_style))
    story.append(PageBreak())

    # Page 3
    story.append(Paragraph("<b>MASTER ENTERPRISE SOFTWARE SERVICE AGREEMENT (CONT.)</b>", header_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<font color='#64748b'><b>Contract Reference:</b> MSA-2026-OCT-7791 | Page 3 of 3</font>", p_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("ARTICLE 6: TERM, TERMINATION & GOVERNING LAW", article_style))
    story.append(Spacer(1, 4))
    p_term = (
        "6.1. Initial Term: This Agreement shall commence on the Effective Date and remain in effect for thirty-six (36) months.<br/>"
        "6.2. Termination for Cause: Either party may terminate immediately upon written notice if the other party materially breaches.<br/>"
        "6.3. Governing Law: This Agreement shall be construed under the laws of the State of California, without regard to conflict of laws."
    )
    story.append(Paragraph(p_term, p_style))
    story.append(Spacer(1, 20))

    # Signature Block
    story.append(Paragraph("<b>IN WITNESS WHEREOF</b>, the authorized representatives have executed this Agreement:", p_style))
    story.append(Spacer(1, 15))

    sig_data = [
        [Paragraph("<b>FOR PROVIDER:</b><br/>CloudMatrix Corporation", p_style),
         Paragraph("<b>FOR CLIENT:</b><br/>Apex Global Logistics LLC", p_style)],
        [Paragraph("<br/><br/>________________________________________<br/><b>Signature:</b> Marcus Vance<br/><b>Title:</b> Chief Executive Officer<br/><b>Date:</b> October 1, 2026", p_style),
         Paragraph("<br/><br/>________________________________________<br/><b>Signature:</b> Sarah Jenkins-Miller<br/><b>Title:</b> VP, Global Procurement<br/><b>Date:</b> October 3, 2026", p_style)]
    ]
    t_sig = Table(sig_data, colWidths=[260, 260])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sig)

    doc.build(story)
    shutil.copy(pdf_path, os.path.join(PUB_DIR, "03_legal_service_contract_3pages.pdf"))
    print(f"Created: {pdf_path}")

# -------------------------------------------------------------
# 4. Realistic Grocery / Store Receipt (PNG Image)
# -------------------------------------------------------------
def make_store_receipt():
    img_w, img_h = 750, 1150
    img = Image.new("RGB", (img_w, img_h), color=(250, 250, 248))
    draw = ImageDraw.Draw(img)

    # Let's use clean default or basic fonts
    f_large = ImageFont.load_default()
    f_body = ImageFont.load_default()

    lines = [
        ("====================================================", True, 30),
        ("           WHOLE HARVEST ORGANIC MARKET             ", True, 25),
        ("             Store #0482 - Downtown SF              ", False, 20),
        ("          450 Mission Street, San Francisco         ", False, 20),
        ("               Tel: (415) 555-0199                  ", False, 20),
        ("====================================================", True, 25),
        ("DATE: 10/16/2026 14:32:08         REG: 04   TRN: 8821", False, 25),
        ("CASHIER: Samantha B.              MEMBER ID: *******492", False, 25),
        ("----------------------------------------------------", False, 25),
        ("ITEM DESCRIPTION                  QTY   PRICE    TOTAL", True, 25),
        ("----------------------------------------------------", False, 20),
        ("ORGANIC AVOCADOS (BAG OF 4)         1   $5.99    $5.99", False, 22),
        ("ALMOND MILK UNSWEETENED 64OZ        2   $3.49    $6.98", False, 22),
        ("ARTISAN SOURDOUGH BREAD             1   $4.50    $4.50", False, 22),
        ("FAIR TRADE ROASTED COFFEE 12OZ      1  $14.25   $14.25", False, 22),
        ("HONEYCRISP APPLES (2.4 LBS)         1   $6.84    $6.84", False, 22),
        ("GREEK YOGURT PLAIN 32OZ             2   $4.99    $9.98", False, 22),
        ("ORGANIC BABY SPINACH 16OZ           1   $3.99    $3.99", False, 22),
        ("EXTRA VIRGIN OLIVE OIL 750ML        1  $18.50   $18.50", False, 22),
        ("WILD CAUGHT SALMON FILLET (1.1LB)   1  $16.99   $16.99", False, 22),
        ("DARK CHOCOLATE SEA SALT 85%         2   $2.75    $5.50", False, 22),
        ("----------------------------------------------------", False, 25),
        ("SUBTOTAL:                                       $93.54", True, 25),
        ("STORE LOYALTY SAVINGS:                         -$10.00", False, 22),
        ("SALES TAX (8.625%):                              $7.20", False, 22),
        ("====================================================", True, 25),
        ("TOTAL BALANCE DUE:                              $90.74", True, 30),
        ("====================================================", True, 25),
        ("PAYMENT METHOD: VISA CONTACTLESS                       ", False, 22),
        ("ACCOUNT: ************8814   AUTH: 092819               ", False, 22),
        ("AID: A0000000031010        TC: 9283BF721               ", False, 22),
        ("----------------------------------------------------", False, 25),
        ("            ITEMS SOLD: 13                             ", False, 22),
        ("         THANK YOU FOR SHOPPING ORGANIC!               ", True, 25),
        ("       RETURN POLICY: 30 DAYS WITH RECEIPT             ", False, 20),
        ("       SURVEY: www.wholeharvest.com/feedback           ", False, 20),
        ("        ENTER CODE: 482-8821-9942 FOR $5 OFF           ", False, 20),
        ("====================================================", True, 25),
        ("  |||| ||| ||||||| |||| |||||| |||||||| |||| ||||  ", False, 25),
        ("                  *48288219942*                     ", False, 25),
    ]

    # Draw on canvas
    y = 40
    for text, bold, spacing in lines:
        color = (15, 23, 42) if bold else (51, 65, 85)
        # Center or left-align based on spaces
        draw.text((60, y), text, fill=color, font=f_body)
        y += spacing

    png_path = os.path.join(OUT_DIR, "04_grocery_store_receipt.png")
    img.save(png_path)
    shutil.copy(png_path, os.path.join(PUB_DIR, "04_grocery_store_receipt.png"))
    print(f"Created: {png_path}")

# -------------------------------------------------------------
# 5. Product Specification & Hardware Sheet (PNG Image)
# -------------------------------------------------------------
def make_spec_sheet():
    img_w, img_h = 1000, 1100
    img = Image.new("RGB", (img_w, img_h), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([(0, 0), (img_w, 80)], fill=(15, 23, 42))
    draw.text((40, 28), "APEX INDUSTRIAL SENSOR UNIT - SPECIFICATION SHEET", fill=(255, 255, 255))

    lines = [
        ("MODEL IDENTIFIER: AIS-9800-PRO-XT", 110, True),
        ("REVISION: 3.4.1 | COMPLIANCE: CE, FCC, RoHS, IP68 WATERPROOF", 135, False),
        ("-------------------------------------------------------------------------------------------------------", 160, False),
        ("1. SYSTEM OVERVIEW & ARCHITECTURE", 185, True),
        ("The AIS-9800 is a high-precision multi-spectral optical transducer engineered for industrial", 215, False),
        ("automation, robotic sorting, and harsh ambient temperature operational deployments.", 235, False),
        ("", 255, False),
        ("2. ELECTRICAL & HARDWARE SPECIFICATIONS", 270, True),
        ("PARAMETER                    TYPICAL VALUE            OPERATIONAL TOLERANCE", 300, True),
        ("Input Voltage (DC)           24.0 V                  18.0 V to 36.0 V Max", 325, False),
        ("Nominal Power Consumption   4.8 Watts               Max 7.2W with heater enabled", 350, False),
        ("Optical Sampling Frequency   2,500 Hz                +/- 0.05% stability", 375, False),
        ("Operating Temperature Range  -40 deg C to +85 deg C  Tested per MIL-STD-810H", 400, False),
        ("Bus Communication Protocol   CANopen / RS-485 / Modbus RTU at 115,200 baud", 425, False),
        ("Resolution / Bit Depth       16-bit Delta-Sigma ADC  0.0015% FSO precision", 450, False),
        ("", 470, False),
        ("3. PIN CONFIGURATION & TERMINAL BLOCK", 490, True),
        ("PIN #   DESIGNATION     COLOR CODE      SIGNAL FUNCTION", 520, True),
        ("Pin 1   VCC_IN (+)      Red             Primary DC supply line (18-36V)", 545, False),
        ("Pin 2   GND_PWR (-)     Black           Power ground return", 570, False),
        ("Pin 3   CAN_HIGH        White           Differential high serial signal", 595, False),
        ("Pin 4   CAN_LOW         Blue            Differential low serial signal", 620, False),
        ("Pin 5   CHASSIS_SHIELD  Bare/Drain      EMI earth ground drain connection", 645, False),
        ("", 670, False),
        ("4. CAUTIONARY OPERATING INSTRUCTIONS", 695, True),
        ("- CAUTION: Disconnect main power source before servicing wiring terminals.", 725, False),
        ("- DO NOT exceed 40V continuous potential across terminals 1 and 2.", 750, False),
        ("- Ensure torque of 0.4 Nm on terminal screws to prevent contact resistance.", 775, False),
        ("", 800, False),
        ("5. WARRANTY AND FACTORY CALIBRATION", 820, True),
        ("Serial Number: SN-2026-99381-F04        Calibration Date: September 28, 2026", 850, False),
        ("Technician ID: QC-TECH-882              Next Recalibration Due: September 2028", 875, False),
        ("Apex Instruments Ltd. | Tokyo - Munich - Chicago | support@apexsensors.com", 910, True)
    ]

    for text, y, bold in lines:
        col = (15, 23, 42) if bold else (71, 85, 105)
        draw.text((40, y), text, fill=col)

    # Draw border around the spec sheet
    draw.rectangle([(10, 10), (img_w - 10, img_h - 10)], outline=(203, 213, 225), width=2)

    png_path = os.path.join(OUT_DIR, "05_hardware_spec_sheet.png")
    img.save(png_path)
    shutil.copy(png_path, os.path.join(PUB_DIR, "05_hardware_spec_sheet.png"))
    print(f"Created: {png_path}")

# Run all
if __name__ == "__main__":
    make_business_invoice()
    make_academic_math_paper()
    make_legal_contract()
    make_store_receipt()
    make_spec_sheet()
    print("All test samples successfully generated!")
