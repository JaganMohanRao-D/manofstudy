import { jsPDF } from 'jspdf';
import { BranchRoadmap } from '../types';

/**
 * MAN OF STUDY - Engineering & Degree Roadmap PDF Generator
 * Authoritative, beautifully typeset, printable A4 document.
 * 
 * Specifications:
 * - Page Dimensions: 210mm x 297mm (A4 Portrait)
 * - Margins: Left: 14mm, Right: 14mm, Content Width: 182mm (14mm to 196mm)
 * - Vertical Margins: Top: 16mm, Bottom: 16mm (maxY: 281mm)
 * - Watermark: Ultra-subtle background opacity 0.04, -45 degree angle, single word "MAN OF STUDY"
 * - Section 1 Compensation: 3 distinct non-overlapping columns (58mm width, 4mm gap)
 * - Auto-Wrapping: All narrative text, roles, semester descriptions strictly auto-wrapped via splitTextToSize
 * - Footer: Strict 3-part non-colliding grid (Left: Official Career Blueprint • CODE, Center: clickable MAN OF STUDY link, Right: Page X of Y)
 * - Interactive Callout Banners: Clickable links directing to https://manofstudy.com/#career-blueprints
 */

export function generateRoadmapPdf(roadmap: BranchRoadmap): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 14;
  const marginRight = 14;
  const marginTop = 16;
  const marginBottom = 16;
  const contentWidth = 182; // Strict 182mm usable content width (14mm to 196mm)
  const maxY = pageHeight - marginBottom; // 281mm

  const BRAND_NAME = 'MAN OF STUDY';
  const TARGET_URL = 'https://manofstudy.com';
  const EXPLORE_URL = 'https://manofstudy.com/#career-blueprints';

  let currentY = marginTop + 3;

  // ----------------------------------------------------
  // WATERMARK (Strictly 0.04 Opacity, Single Word "MAN OF STUDY", -45 Degree Angle)
  // ----------------------------------------------------
  const renderBackgroundWatermark = () => {
    doc.saveGraphicsState();
    try {
      // jsPDF GState for true 0.04 alpha transparency (never obscures text)
      // @ts-ignore
      if (typeof doc.GState === 'function') {
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.04 }));
      }
    } catch {
      // Graceful fallback
    }

    const centerX = 105;
    const centerY = 148.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(100, 116, 139); // Slate-500 with 0.04 opacity
    doc.text('MAN OF STUDY', centerX, centerY, {
      align: 'center',
      angle: -45,
    });

    doc.restoreGraphicsState();
  };

  // ----------------------------------------------------
  // VECTOR ACCENT HEADER (Deep Indigo to Cyan Gradient Bar)
  // ----------------------------------------------------
  const renderHeader = () => {
    // 1. Sleek top gradient accent bar across entire page width
    const barHeight = 2.8;
    const segW = pageWidth / 4;
    // Deep Indigo (#1e1b4b)
    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, segW, barHeight, 'F');
    // Violet/Indigo (#4338ca)
    doc.setFillColor(67, 56, 202);
    doc.rect(segW, 0, segW, barHeight, 'F');
    // Sky Blue (#0284c7)
    doc.setFillColor(2, 132, 199);
    doc.rect(segW * 2, 0, segW, barHeight, 'F');
    // Bright Cyan (#06b6d4)
    doc.setFillColor(6, 182, 212);
    doc.rect(segW * 3, 0, segW, barHeight, 'F');

    // 2. MAN OF STUDY Emblem Badge Pill (Left)
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.setDrawColor(51, 65, 85); // Slate 700
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, 5.5, 30, 6.2, 1.8, 1.8, 'FD');

    // Emblem Dot
    doc.setFillColor(6, 182, 212); // Cyan dot
    doc.circle(marginLeft + 3.6, 8.6, 1.1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text(BRAND_NAME, marginLeft + 6.5, 9.7);

    // 3. Category & Discipline Label (Center-Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105); // Slate 600
    const catLabel = `MAN OF STUDY — 4-YEAR CAREER BLUEPRINT • ${roadmap.categoryLabel.toUpperCase()}`;
    const maxCatW = contentWidth - 30 - 36 - 8;
    const catLines = doc.splitTextToSize(catLabel, maxCatW);
    doc.text(catLines[0], marginLeft + 34, 9.7);

    // 4. Verified Badge Pill (Right at 162mm to 196mm)
    const badgeW = 34;
    const badgeX = pageWidth - marginRight - badgeW; // 210 - 14 - 34 = 162mm
    doc.setFillColor(240, 249, 255); // Sky 50
    doc.setDrawColor(186, 230, 253); // Sky 200
    doc.roundedRect(badgeX, 5.5, badgeW, 6.2, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(2, 132, 199); // Sky 600
    // @ts-ignore
    doc.textWithLink('VERIFIED BLUEPRINT', badgeX + badgeW / 2, 9.7, {
      url: TARGET_URL,
      align: 'center',
    });

    // 5. Clean Divider Line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.25);
    doc.line(marginLeft, 13.5, pageWidth - marginRight, 13.5);
  };

  // ----------------------------------------------------
  // STRICT FOOTER GRID LAYOUT (y = pageHeight - 8 = 289mm)
  // Left: Official Career Blueprint • CODE (max width: 90mm)
  // Center: Clickable "MAN OF STUDY" link at X = 105mm
  // Right: Page X of Y at X = 196mm
  // ----------------------------------------------------
  const renderFooter = (pageIdx: number, totalPages: number) => {
    // Divider line above footer at 285mm
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);

    // Left-align at X = 14mm: Render only the short code (max width: 90mm, truncated cleanly, font-size: 7.5pt, color: #64748b)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // #64748b
    const leftText = `Official Career Blueprint • ${roadmap.code}`;
    doc.text(leftText, marginLeft, pageHeight - 8);

    // Center at X = 105mm: Render an interactive clickable link labeled "MAN OF STUDY"
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    // @ts-ignore
    doc.textWithLink('MAN OF STUDY', 105, pageHeight - 8, {
      url: TARGET_URL,
      align: 'center',
    });

    // Right-align at X = 196mm: Dynamic Page Numbers
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text(`Page ${pageIdx} of ${totalPages}`, pageWidth - marginRight, pageHeight - 8, {
      align: 'right',
    });
  };

  // Helper to ensure page space with orphan avoidance
  const ensurePageSpace = (requiredHeightMm: number) => {
    if (currentY + requiredHeightMm > maxY) {
      doc.addPage();
      renderBackgroundWatermark();
      renderHeader();
      currentY = marginTop + 3;
    }
  };

  // Helper to draw a section card box (rounded box with #e2e8f0 border, white background)
  const drawCardBox = (heightMm: number) => {
    doc.setFillColor(255, 255, 255); // White background ensures crisp text above watermark
    doc.setDrawColor(226, 232, 240); // 0.5px #e2e8f0 border
    doc.setLineWidth(0.22);
    doc.roundedRect(marginLeft, currentY, contentWidth, heightMm, 2.5, 2.5, 'FD');
  };

  // Helper to inject interactive "EXPLORE MORE ROADMAPS" banner
  const renderExploreBanner = () => {
    ensurePageSpace(14);
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.25);
    doc.roundedRect(14, currentY, 182, 10, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    // @ts-ignore
    doc.textWithLink(
      '👉 Click here to explore & download other 24+ Engineering & Degree Roadmaps on MAN OF STUDY',
      105,
      currentY + 6.5,
      { url: EXPLORE_URL, align: 'center' }
    );
    currentY += 14;
  };

  // Initialize Page 1
  renderBackgroundWatermark();
  renderHeader();

  // ----------------------------------------------------
  // SECTION: HERO TITLE & DEGREE OVERVIEW CARD
  // Strict auto-wrapping for both title and tagline
  // ----------------------------------------------------
  const categoryPillW = doc.getTextWidth(roadmap.categoryLabel) + 6;
  const maxTitleWidth = contentWidth - categoryPillW - 14;
  const titleLines = doc.splitTextToSize(`${roadmap.code}: ${roadmap.name}`, maxTitleWidth);
  const taglineLines = doc.splitTextToSize(roadmap.tagline, contentWidth - 10);

  const heroCardHeight = 12 + titleLines.length * 5.2 + taglineLines.length * 4.0;

  ensurePageSpace(heroCardHeight);
  drawCardBox(heroCardHeight);

  // Category Pill Tag (Top Right of Hero Card)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - marginRight - categoryPillW - 4, currentY + 3.2, categoryPillW, 5.2, 1.2, 1.2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(roadmap.categoryLabel, pageWidth - marginRight - 4 - categoryPillW / 2, currentY + 6.8, { align: 'center' });

  // Branch Code & Title (Auto-wrapped)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(titleLines, marginLeft + 5, currentY + 7);

  // Tagline / Value Proposition (Auto-wrapped)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(taglineLines, marginLeft + 5, currentY + 9 + titleLines.length * 5.2);

  currentY += heroCardHeight + 3.5;

  // ----------------------------------------------------
  // SECTION 1: STRATEGIC CAREER & COMPENSATION OVERVIEW
  // 3 distinct non-overlapping responsive columns (58mm width, 4mm gap)
  // Col 1: X = 14mm, W = 58mm
  // Col 2: X = 76mm, W = 58mm
  // Col 3: X = 138mm, W = 58mm
  // ----------------------------------------------------
  const sec1TitleHeight = 6;
  ensurePageSpace(sec1TitleHeight + 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199); // Sky 600
  doc.text('1. STRATEGIC CAREER & COMPENSATION OVERVIEW', marginLeft, currentY + 4);
  currentY += sec1TitleHeight;

  // Helper to format salary values concisely and avoid string overflows
  const cleanLpaString = (raw: string | undefined, defaultVal: string): string => {
    if (!raw) return defaultVal;
    // Extract main part before slashes or parentheticals
    let cleaned = raw.split('/')[0].replace(/\(.*?\)/g, '').replace(/–/g, '-').trim();
    // Normalize "LPA - "
    cleaned = cleaned.replace(/LPA\s*-\s*/i, '- ').replace(/\s+/g, ' ');
    if (!cleaned.toLowerCase().includes('lpa')) {
      cleaned = `${cleaned} LPA`;
    }
    if (cleaned.length > 20) {
      return defaultVal;
    }
    return cleaned;
  };

  const sb = roadmap.strategicOverview?.salaryBrackets;
  const colWidth = 58; // 58mm per column
  const colGap = 4;    // 4mm gap
  const colY = currentY;
  const colHeight = 22;

  const columnsData = [
    {
      x: 14,
      title: 'ENTRY TIER (0-2 YRS)',
      val: cleanLpaString(sb?.entryTier, '₹7 - ₹14 LPA'),
      sub: 'Campus Hiring & Junior Roles',
      titleColor: [71, 85, 105], // Slate 600
    },
    {
      x: 76,
      title: 'MID TIER (3-6 YRS)',
      val: cleanLpaString(sb?.midTier, '₹18 - ₹35 LPA'),
      sub: 'Senior Tech / Domain Lead',
      titleColor: [15, 118, 110], // Teal 700
    },
    {
      x: 138,
      title: 'PEAK / GLOBAL TIER',
      val: cleanLpaString(sb?.peakTier, '₹45 - ₹90+ LPA'),
      sub: 'Principal / Tier-1 Global AI Labs',
      titleColor: [3, 105, 161], // Sky 700
    },
  ];

  columnsData.forEach((col) => {
    // Clean background cards: doc.roundedRect(x, y, 58, 22, 2, 2, 'F') with padding
    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.roundedRect(col.x, colY, 58, 22, 2, 2, 'F');

    // Line 1: Tier Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(col.titleColor[0], col.titleColor[1], col.titleColor[2]);
    doc.text(col.title, col.x + colWidth / 2, colY + 5.5, { align: 'center' });

    // Line 2: Bold Salary Range Value (Completely isolated, zero collision)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(col.val, col.x + colWidth / 2, colY + 12.2, { align: 'center' });

    // Line 3: Subtext / Scope
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.9);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(col.sub, col.x + colWidth / 2, colY + 17.5, { align: 'center' });
  });

  currentY += colHeight + 3.5;

  // Career Roles & Reality Notes Card (Strict auto-wrapping)
  const targetRoles = roadmap.strategicOverview?.targetRoles || [];
  const rolesText = `Primary Career Roles: ${targetRoles.slice(0, 5).join(' • ') || 'Core Engineer • Technical Specialist • Systems Analyst'}`;
  const rolesLines = doc.splitTextToSize(rolesText, contentWidth - 10);
  const realityNote = roadmap.strategicOverview?.tierReality?.tier1Reality || roadmap.strategicOverview?.corporateSummary || 'Focus on verifiable projects, core fundamentals, and hands-on skill development.';
  const noteLines = doc.splitTextToSize(`Placement Reality: ${realityNote}`, contentWidth - 10);
  const careerCardHeight = 7 + rolesLines.length * 4.0 + noteLines.length * 3.8;

  ensurePageSpace(careerCardHeight);
  drawCardBox(careerCardHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(rolesLines, marginLeft + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text(noteLines, marginLeft + 5, currentY + 7 + rolesLines.length * 4.0);

  currentY += careerCardHeight + 3.5;

  // ----------------------------------------------------
  // SECTION 2: INDUSTRY SKILLS & TECHNICAL STACK MATRIX
  // Strict auto-wrapping on all skill categories
  // ----------------------------------------------------
  const skillsTitleHeight = 6;
  ensurePageSpace(skillsTitleHeight + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('2. INDUSTRY SKILLS & TECHNICAL STACK MATRIX', marginLeft, currentY + 4);
  currentY += skillsTitleHeight;

  const fLines = doc.splitTextToSize(`Foundational Core: ${roadmap.skillsMatrix.foundational.join(', ')}`, contentWidth - 10);
  const aLines = doc.splitTextToSize(`Advanced & Specialization: ${roadmap.skillsMatrix.advanced.join(', ')}`, contentWidth - 10);
  const tLines = doc.splitTextToSize(`Software & Industry Tools: ${roadmap.skillsMatrix.industryTools.join(', ')}`, contentWidth - 10);
  const skillsCardHeight = 8 + (fLines.length + aLines.length + tLines.length) * 4.0 + 3;

  ensurePageSpace(skillsCardHeight);
  drawCardBox(skillsCardHeight);

  let sY = currentY + 5.5;
  const renderSkillBlock = (lines: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, marginLeft + 5, sY);
    sY += lines.length * 4.0 + 1.2;
  };

  renderSkillBlock(fLines);
  renderSkillBlock(aLines);
  renderSkillBlock(tLines);

  currentY += skillsCardHeight + 3.5;

  // Optional: Higher Studies & GATE Gateway (Strict auto-wrapping)
  if (roadmap.strategicOverview?.higherStudiesGate) {
    const hg = roadmap.strategicOverview.higherStudiesGate;
    const gateStr = `GATE / Higher Studies Gateway (${hg.exam}): Top Institutes: ${hg.topInstitutes.join(', ')} | M.Tech Tracks: ${hg.mtechSpecializations.join(', ')} | Scope: ${hg.msAbroadScope}`;
    const gateLines = doc.splitTextToSize(gateStr, contentWidth - 10);
    const gateCardHeight = 7 + gateLines.length * 3.8;

    ensurePageSpace(gateCardHeight);
    drawCardBox(gateCardHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(gateLines, marginLeft + 5, currentY + 5.5);

    currentY += gateCardHeight + 3.5;
  }

  // ----------------------------------------------------
  // SECTION 3: 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN
  // Dynamic height calculation and strict auto-wrapping
  // ----------------------------------------------------
  ensurePageSpace(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('3. 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.years.forEach((yr, yrIdx) => {
    // Year Header Banner
    ensurePageSpace(12);
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254); // Indigo 200
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, currentY, contentWidth, 7.5, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(49, 46, 129); // Indigo 900
    const yearText = `${yr.yearTitle.toUpperCase()} — ${yr.theme}`;
    const yearLines = doc.splitTextToSize(yearText, contentWidth - 8);
    doc.text(yearLines[0], marginLeft + 4, currentY + 5.2);
    currentY += 10;

    yr.semesters.forEach((sem) => {
      const subItems = [
        { label: 'Core Subjects', val: sem.coreSubjects.join(', ') },
        { label: 'Industry Skills', val: sem.industrySkills.join(', ') },
        { label: 'Tools & Platforms', val: sem.toolsAndPlatforms.join(', ') },
        { label: 'Portfolio Projects', val: sem.keyProjects.join('; ') },
        { label: 'Internship Milestone', val: sem.internshipOrMilestone },
        { label: 'Placement / Exam Prep', val: sem.examOrPlacementPrep },
      ];

      // Measure total height for this semester card
      const labelW = 38; // mm allocated for label column
      const valueW = contentWidth - labelW - 12; // 132mm for wrapped value column

      const semTitleLines = doc.splitTextToSize(sem.title, contentWidth - 12);
      let innerContentHeight = 6 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 4.0 : 0);

      const formattedSubItems = subItems.map((item) => {
        const lines = doc.splitTextToSize(item.val || '—', valueW);
        const itemH = Math.max(3.8, lines.length * 3.6 + 0.8);
        innerContentHeight += itemH;
        return { label: item.label, lines, itemH };
      });

      const semCardHeight = innerContentHeight + 4;

      // Prevent orphan cards: ensure sufficient space
      ensurePageSpace(semCardHeight + 2);
      drawCardBox(semCardHeight);

      // Semester Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(semTitleLines, marginLeft + 5, currentY + 5.5);

      // Small accent tag dot
      doc.setFillColor(6, 182, 212);
      doc.circle(marginLeft + 2.5, currentY + 4.8, 0.8, 'F');

      let itemY = currentY + 7.5 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 4.0 : 0);
      formattedSubItems.forEach((fItem) => {
        // Label (Left Column)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.text(`${fItem.label}:`, marginLeft + 5, itemY);

        // Value (Right Column with strict line-wrapping and spacing)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(fItem.lines, marginLeft + labelW + 6, itemY);

        itemY += fItem.itemH;
      });

      currentY += semCardHeight + 3.0;
    });

    currentY += 2.0;

    // INJECT INTERACTIVE CALLOUT BANNER BETWEEN YEAR 2 AND YEAR 3 (Midway through action plan)
    if (yrIdx === 1) {
      renderExploreBanner();
    }
  });

  // ----------------------------------------------------
  // SECTION 4: STRATEGIC TIPS FOR CRACKING HIGH-GROWTH PLACEMENTS
  // Strict auto-wrapping for pro-tips
  // ----------------------------------------------------
  ensurePageSpace(14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('4. STRATEGIC TIPS FOR CRACKING HIGH-GROWTH PLACEMENTS', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.proTips.forEach((tip, idx) => {
    const tipLines = doc.splitTextToSize(tip, contentWidth - 16);
    const tipCardH = 6 + tipLines.length * 3.8;

    ensurePageSpace(tipCardH);
    drawCardBox(tipCardH);

    // Number Badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginLeft + 3, currentY + 2.8, 5, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(2, 132, 199);
    doc.text(`${idx + 1}`, marginLeft + 5.5, currentY + 6.3, { align: 'center' });

    // Tip Body Text (Strictly wrapped)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(51, 65, 85);
    doc.text(tipLines, marginLeft + 10.5, currentY + 5.8);

    currentY += tipCardH + 2.8;
  });

  // Inject interactive callout banner at the conclusion of Section 4
  renderExploreBanner();

  // ----------------------------------------------------
  // RENDER FOOTERS ACROSS ALL PAGES (Strict Grid Layout)
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderFooter(i, totalPages);
  }

  // ----------------------------------------------------
  // SAVE / DOWNLOAD PDF
  // ----------------------------------------------------
  const filename = `${roadmap.code}_Engineering_Career_Roadmap_MAN_OF_STUDY.pdf`;
  doc.save(filename);
}

