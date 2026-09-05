import { jsPDF } from 'jspdf';
import { BranchRoadmap } from '../types';

/**
 * StudyMacha - Engineering & Degree Roadmap PDF Generator
 * Generates an authoritative, beautifully typeset, printable A4 document.
 * 
 * Specifications:
 * - Margins: Top 18mm, Bottom 18mm, Left 16mm, Right 16mm.
 * - Watermark: Ultra-subtle background opacity 0.05, 45-degree angled, non-obscuring.
 * - Header: Deep Indigo to Cyan accent bar, StudyMacha emblem, Roadmap category, verified URL badge.
 * - Section Cards: Crisp white boxes with 0.5px #e2e8f0 borders, 12px padding, 10px margin-bottom.
 * - Typography: Clean line-height (1.45), orphan prevention (page-break-inside: avoid).
 */

export function generateRoadmapPdf(roadmap: BranchRoadmap): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 16;
  const marginRight = 16;
  const marginTop = 18;
  const marginBottom = 18;
  const contentWidth = pageWidth - marginLeft - marginRight; // 178mm
  const maxY = pageHeight - marginBottom - 6; // 273mm

  const BRAND_NAME = 'STUDYMACHA';
  const BRAND_URL = 'studymacha.pages.dev';
  const BRAND_WATERMARK = 'STUDYMACHA • studymacha.pages.dev';

  let currentY = marginTop + 4;

  // ----------------------------------------------------
  // WATERMARK (Strictly 0.05 Opacity, Background Only)
  // ----------------------------------------------------
  const renderBackgroundWatermark = () => {
    doc.saveGraphicsState();
    try {
      // jsPDF GState for true 0.05 alpha transparency
      // @ts-ignore
      if (typeof doc.GState === 'function') {
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.05 }));
      }
    } catch {
      // Graceful fallback to ultra-light tint
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(218, 224, 233); // Ultra subtle slate-200 tint
    doc.text(BRAND_WATERMARK, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });

    // Outer margin perimeter watermark for verified authenticity
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(226, 232, 240);
    doc.text('STUDYMACHA OFFICIAL ACADEMIC OPERATING SYSTEM • 100% CLIENT-SIDE VERIFIED', pageWidth / 2, 292, {
      align: 'center',
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

    // 2. StudyMacha Emblem Badge Pill (Left)
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.setDrawColor(51, 65, 85); // Slate 700
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, 5.5, 33, 6.2, 1.8, 1.8, 'FD');

    // Emblem Dot
    doc.setFillColor(6, 182, 212); // Cyan dot
    doc.circle(marginLeft + 3.8, 8.6, 1.1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text(BRAND_NAME, marginLeft + 6.8, 9.7);

    // 3. Category & Discipline Label (Center-Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`${roadmap.categoryLabel.toUpperCase()} • 4-YEAR BLUEPRINT`, marginLeft + 37, 9.7);

    // 4. Verified URL Badge Pill (Right)
    const urlBadgeW = 38;
    const urlBadgeX = pageWidth - marginRight - urlBadgeW;
    doc.setFillColor(240, 249, 255); // Sky 50
    doc.setDrawColor(186, 230, 253); // Sky 200
    doc.roundedRect(urlBadgeX, 5.5, urlBadgeW, 6.2, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(2, 132, 199); // Sky 600
    doc.text(BRAND_URL, urlBadgeX + urlBadgeW / 2, 9.7, { align: 'center' });

    // 5. Clean Divider Line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.25);
    doc.line(marginLeft, 14.5, pageWidth - marginRight, 14.5);
  };

  // ----------------------------------------------------
  // FOOTER (Page Numbering & Disclaimer)
  // ----------------------------------------------------
  const renderFooter = (pageIdx: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginLeft, 281, pageWidth - marginRight, 281);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139); // Slate 500
    const printDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    doc.text(
      `Official Career Guide • ${roadmap.code} - ${roadmap.name} • ${BRAND_URL} • ${printDate}`,
      marginLeft,
      286.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`Page ${pageIdx} of ${totalPages}`, pageWidth - marginRight, 286.5, {
      align: 'right',
    });
  };

  // Helper to ensure page space with orphan avoidance
  const ensurePageSpace = (requiredHeightMm: number) => {
    if (currentY + requiredHeightMm > maxY) {
      doc.addPage();
      renderBackgroundWatermark();
      renderHeader();
      currentY = marginTop + 4;
    }
  };

  // Helper to draw a section card (rounded box with #e2e8f0 border, white background)
  const drawCardBox = (heightMm: number) => {
    doc.setFillColor(255, 255, 255); // White background ensures crisp text above watermark
    doc.setDrawColor(226, 232, 240); // 0.5px #e2e8f0 border
    doc.setLineWidth(0.22);
    doc.roundedRect(marginLeft, currentY, contentWidth, heightMm, 2.5, 2.5, 'FD');
  };

  // Initialize Page 1
  renderBackgroundWatermark();
  renderHeader();

  // ----------------------------------------------------
  // SECTION: HERO TITLE & DEGREE OVERVIEW CARD
  // ----------------------------------------------------
  const taglineLines = doc.splitTextToSize(roadmap.tagline, contentWidth - 14);
  const heroCardHeight = 24 + taglineLines.length * 4.2;

  ensurePageSpace(heroCardHeight);
  drawCardBox(heroCardHeight);

  // Branch Code & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`${roadmap.code}: ${roadmap.name}`, marginLeft + 5, currentY + 7.5);

  // Category Pill Tag
  const categoryPillW = doc.getTextWidth(roadmap.categoryLabel) + 6;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - marginRight - categoryPillW - 4, currentY + 3.2, categoryPillW, 5.2, 1.2, 1.2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(roadmap.categoryLabel, pageWidth - marginRight - 4 - categoryPillW / 2, currentY + 6.8, { align: 'center' });

  // Tagline / Value Proposition
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(taglineLines, marginLeft + 5, currentY + 14);

  currentY += heroCardHeight + 3.2; // 10px margin-bottom

  // ----------------------------------------------------
  // SECTION 1: STRATEGIC CAREER & COMPENSATION OVERVIEW
  // ----------------------------------------------------
  const sec1TitleHeight = 6;
  ensurePageSpace(sec1TitleHeight + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199); // Sky 600
  doc.text('1. STRATEGIC CAREER & COMPENSATION OVERVIEW', marginLeft, currentY + 4);
  currentY += sec1TitleHeight;

  // Salary Tiers Card Box
  const colW = (contentWidth - 6) / 3;
  const salaryCardHeight = 24;
  drawCardBox(salaryCardHeight);

  const salaryBrackets = roadmap.strategicOverview?.salaryBrackets || {
    entryTier: '₹4.5 - ₹8 LPA',
    midTier: '₹12 - ₹22 LPA',
    peakTier: '₹35+ LPA / Global',
  };

  const tiers = [
    { label: 'ENTRY TIER (0-2 YRS)', val: salaryBrackets.entryTier, bg: [248, 250, 252], col: [71, 85, 105] },
    { label: 'MID TIER (3-6 YRS)', val: salaryBrackets.midTier, bg: [240, 253, 250], col: [15, 118, 110] },
    { label: 'PEAK / PRODUCT TIER', val: salaryBrackets.peakTier, bg: [240, 249, 255], col: [3, 105, 161] },
  ];

  tiers.forEach((t, i) => {
    const tx = marginLeft + 3 + i * colW;
    doc.setFillColor(t.bg[0], t.bg[1], t.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(tx, currentY + 2.5, colW - 2.5, 18.5, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(t.col[0], t.col[1], t.col[2]);
    doc.text(t.label, tx + (colW - 2.5) / 2, currentY + 7.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(t.val, tx + (colW - 2.5) / 2, currentY + 14, { align: 'center' });
  });

  currentY += salaryCardHeight + 3.2;

  // Career Roles & Reality Notes Card
  const targetRoles = roadmap.strategicOverview?.targetRoles || [];
  const rolesText = `Primary Career Roles: ${targetRoles.slice(0, 5).join(' • ') || 'Core Engineer • Technical Specialist • Systems Analyst'}`;
  const rolesLines = doc.splitTextToSize(rolesText, contentWidth - 10);
  const realityNote = roadmap.strategicOverview?.tierReality?.tier1Reality || roadmap.strategicOverview?.corporateSummary || 'Focus on verifiable projects, core fundamentals, and hands-on skill development.';
  const noteLines = doc.splitTextToSize(`Placement Reality: ${realityNote}`, contentWidth - 10);
  const careerCardHeight = 7 + rolesLines.length * 4.2 + noteLines.length * 4.0;

  ensurePageSpace(careerCardHeight);
  drawCardBox(careerCardHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(rolesLines, marginLeft + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text(noteLines, marginLeft + 5, currentY + 7 + rolesLines.length * 4.2);

  currentY += careerCardHeight + 3.2;

  // ----------------------------------------------------
  // SECTION 2: INDUSTRY SKILLS & SOFTWARE MATRIX
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
  const skillsCardHeight = 8 + (fLines.length + aLines.length + tLines.length) * 4.2;

  ensurePageSpace(skillsCardHeight);
  drawCardBox(skillsCardHeight);

  let sY = currentY + 5.5;
  const renderSkillBlock = (lines: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, marginLeft + 5, sY);
    sY += lines.length * 4.2 + 1.2;
  };

  renderSkillBlock(fLines);
  renderSkillBlock(aLines);
  renderSkillBlock(tLines);

  currentY += skillsCardHeight + 3.2;

  // Optional: Higher Studies & GATE Gateway
  if (roadmap.strategicOverview?.higherStudiesGate) {
    const hg = roadmap.strategicOverview.higherStudiesGate;
    const gateStr = `GATE / Higher Studies Gateway (${hg.exam}): Top Institutes: ${hg.topInstitutes.join(', ')} | M.Tech Tracks: ${hg.mtechSpecializations.join(', ')} | MS Scope: ${hg.msAbroadScope}`;
    const gateLines = doc.splitTextToSize(gateStr, contentWidth - 10);
    const gateCardHeight = 6 + gateLines.length * 4.2;

    ensurePageSpace(gateCardHeight);
    drawCardBox(gateCardHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(gateLines, marginLeft + 5, currentY + 5.5);

    currentY += gateCardHeight + 3.2;
  }

  // ----------------------------------------------------
  // SECTION 3: 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN
  // ----------------------------------------------------
  ensurePageSpace(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('3. 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.years.forEach((yr) => {
    // Year Header Banner
    ensurePageSpace(12);
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254); // Indigo 200
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, currentY, contentWidth, 7.5, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(49, 46, 129); // Indigo 900
    doc.text(`${yr.yearTitle.toUpperCase()} — ${yr.theme}`, marginLeft + 4, currentY + 5.2);
    currentY += 10;

    yr.semesters.forEach((sem) => {
      // Calculate content lines to determine card height (avoiding orphan titles)
      const subItems = [
        { label: 'Core Subjects', val: sem.coreSubjects.join(', ') },
        { label: 'Industry Skills', val: sem.industrySkills.join(', ') },
        { label: 'Tools & Platforms', val: sem.toolsAndPlatforms.join(', ') },
        { label: 'Portfolio Projects', val: sem.keyProjects.join('; ') },
        { label: 'Internship Milestone', val: sem.internshipOrMilestone },
        { label: 'Placement / Exam Prep', val: sem.examOrPlacementPrep },
      ];

      // Measure total height for this semester card
      const labelW = 34; // mm
      const valueW = contentWidth - labelW - 12; // mm
      let innerContentHeight = 6; // Header space

      const formattedSubItems = subItems.map((item) => {
        const lines = doc.splitTextToSize(item.val, valueW);
        const itemH = Math.max(3.8, lines.length * 3.6 + 0.8);
        innerContentHeight += itemH;
        return { label: item.label, lines, itemH };
      });

      const semCardHeight = innerContentHeight + 4; // top & bottom padding 12px

      // Prevent orphan cards: page-break-inside: avoid
      ensurePageSpace(semCardHeight + 2);
      drawCardBox(semCardHeight);

      // Semester Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(sem.title, marginLeft + 5, currentY + 5.5);

      // Small accent tag
      doc.setFillColor(6, 182, 212);
      doc.circle(marginLeft + 2.5, currentY + 4.8, 0.8, 'F');

      let itemY = currentY + 9;
      formattedSubItems.forEach((fItem) => {
        // Label (Left Column)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.text(`${fItem.label}:`, marginLeft + 5, itemY);

        // Value (Right Column with line-height 1.45)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(fItem.lines, marginLeft + labelW + 6, itemY);

        itemY += fItem.itemH;
      });

      currentY += semCardHeight + 3.0; // 10px margin-bottom
    });

    currentY += 2.0;
  });

  // ----------------------------------------------------
  // SECTION 4: STRATEGIC TIPS FOR CRACKING TIER-1 PLACEMENTS
  // ----------------------------------------------------
  ensurePageSpace(14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('4. STRATEGIC TIPS FOR CRACKING HIGH-GROWTH PLACEMENTS', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.proTips.forEach((tip, idx) => {
    const tipLines = doc.splitTextToSize(tip, contentWidth - 14);
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

    // Tip Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(tipLines, marginLeft + 10.5, currentY + 5.8);

    currentY += tipCardH + 2.8;
  });

  // ----------------------------------------------------
  // RENDER FOOTERS ACROSS ALL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderFooter(i, totalPages);
  }

  // ----------------------------------------------------
  // SAVE / DOWNLOAD PDF
  // ----------------------------------------------------
  const filename = `${roadmap.code}_Engineering_Career_Roadmap_StudyMacha.pdf`;
  doc.save(filename);
}
