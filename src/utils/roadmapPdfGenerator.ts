import { jsPDF } from 'jspdf';
import { BranchRoadmap } from '../types';

/**
 * MAN OF STUDY - Engineering & Degree Roadmap PDF Generator
 * Authoritative, beautifully typeset, printable A4 document.
 * 
 * Specifications:
 * - Page Dimensions: 210mm x 297mm (A4 Portrait)
 * - Usable Margins: Left: 14mm, Right: 14mm, Content Width: 182mm (14mm to 196mm)
 * - Vertical Margins: Top: 16mm, Bottom: 16mm (maxY: 281mm)
 * - Strict Orphan Avoidance: Headings and their accompanying cards are glued together
 * - Dynamic Font Scaling: Prevents column and salary overflow under all data variants
 * - Auto-Wrapping: All narrative text, roles, semester descriptions strictly auto-wrapped
 * - Non-Colliding Footer: Left: Branch Code, Center: Interactive Brand Link, Right: Page X of Y
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
  const contentWidth = 182; // 210 - 28 = 182mm
  const maxY = pageHeight - marginBottom; // 281mm

  const BRAND_NAME = 'MAN OF STUDY';
  const TARGET_URL = 'https://manofstudy.com';
  const EXPLORE_URL = 'https://manofstudy.com/#career-blueprints';

  let currentY = marginTop + 2;

  // ----------------------------------------------------
  // WATERMARK (Strictly 0.035 Opacity, -45 Degree Angle)
  // ----------------------------------------------------
  const renderBackgroundWatermark = () => {
    doc.saveGraphicsState();
    try {
      // @ts-ignore
      if (typeof doc.GState === 'function') {
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.035 }));
      }
    } catch {
      // Graceful fallback
    }

    const centerX = 105;
    const centerY = 148.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(38);
    doc.setTextColor(100, 116, 139);
    doc.text('MAN OF STUDY', centerX, centerY, {
      align: 'center',
      angle: -45,
    });

    doc.restoreGraphicsState();
  };

  // ----------------------------------------------------
  // VECTOR ACCENT HEADER
  // ----------------------------------------------------
  const renderHeader = () => {
    // 1. Top gradient accent bar
    const barHeight = 2.8;
    const segW = pageWidth / 4;
    doc.setFillColor(30, 27, 75); // Deep Indigo
    doc.rect(0, 0, segW, barHeight, 'F');
    doc.setFillColor(67, 56, 202); // Indigo
    doc.rect(segW, 0, segW, barHeight, 'F');
    doc.setFillColor(2, 132, 199); // Sky
    doc.rect(segW * 2, 0, segW, barHeight, 'F');
    doc.setFillColor(6, 182, 212); // Cyan
    doc.rect(segW * 3, 0, segW, barHeight, 'F');

    // 2. MAN OF STUDY Emblem Badge Pill (Left)
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, 5.5, 30, 6.2, 1.8, 1.8, 'FD');

    // Cyan dot emblem
    doc.setFillColor(6, 182, 212);
    doc.circle(marginLeft + 3.6, 8.6, 1.1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(255, 255, 255);
    doc.text(BRAND_NAME, marginLeft + 6.5, 9.7);

    // 3. Category & Discipline Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    const catLabel = `CAREER BLUEPRINT • ${roadmap.categoryLabel.toUpperCase()}`;
    const maxCatW = contentWidth - 30 - 36 - 8;
    const catLines = doc.splitTextToSize(catLabel, maxCatW);
    doc.text(catLines[0], marginLeft + 34, 9.7);

    // 4. Verified Blueprint Badge Pill (Right)
    const badgeW = 34;
    const badgeX = pageWidth - marginRight - badgeW;
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.roundedRect(badgeX, 5.5, badgeW, 6.2, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(2, 132, 199);
    // @ts-ignore
    doc.textWithLink('VERIFIED BLUEPRINT', badgeX + badgeW / 2, 9.7, {
      url: TARGET_URL,
      align: 'center',
    });

    // 5. Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginLeft, 13.5, pageWidth - marginRight, 13.5);
  };

  // ----------------------------------------------------
  // FOOTER (Rendered on all pages at y = 289mm)
  // ----------------------------------------------------
  const renderFooter = (pageIdx: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(marginLeft, pageHeight - 11, pageWidth - marginRight, pageHeight - 11);

    // Left: Official Career Blueprint • Code
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const leftText = `Official Career Blueprint • ${roadmap.code} (${roadmap.degreeType || 'B.Tech'})`;
    doc.text(leftText, marginLeft, pageHeight - 7);

    // Center: Interactive Brand Link
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    // @ts-ignore
    doc.textWithLink('MAN OF STUDY', 105, pageHeight - 7, {
      url: TARGET_URL,
      align: 'center',
    });

    // Right: Page Counter
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageIdx} of ${totalPages}`, pageWidth - marginRight, pageHeight - 7, {
      align: 'right',
    });
  };

  // Helper: Ensures space with orphan prevention
  const ensurePageSpace = (requiredHeightMm: number) => {
    if (currentY + requiredHeightMm > maxY) {
      doc.addPage();
      renderBackgroundWatermark();
      renderHeader();
      currentY = marginTop + 2;
    }
  };

  // Helper: Draw standard card container
  const drawCardBox = (heightMm: number, fillR = 255, fillG = 255, fillB = 255) => {
    doc.setFillColor(fillR, fillG, fillB);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.22);
    doc.roundedRect(marginLeft, currentY, contentWidth, heightMm, 2.2, 2.2, 'FD');
  };

  // Helper: Interactive banner to explore other blueprints
  const renderExploreBanner = () => {
    ensurePageSpace(13);
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginLeft, currentY, contentWidth, 9.5, 2, 2, 'FD');

    doc.setFontSize(8.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    // @ts-ignore
    doc.textWithLink(
      '👉 Click here to explore & download all 24+ Engineering & Degree Roadmaps on MAN OF STUDY',
      105,
      currentY + 6.2,
      { url: EXPLORE_URL, align: 'center' }
    );
    currentY += 13.5;
  };

  // Initialize Page 1
  renderBackgroundWatermark();
  renderHeader();

  // ----------------------------------------------------
  // SECTION: HERO TITLE & OVERVIEW CARD
  // ----------------------------------------------------
  const categoryPillW = doc.getTextWidth(roadmap.categoryLabel) + 6;
  const maxTitleWidth = contentWidth - categoryPillW - 14;
  const titleLines = doc.splitTextToSize(`${roadmap.code}: ${roadmap.name}`, maxTitleWidth);
  const taglineLines = doc.splitTextToSize(roadmap.tagline, contentWidth - 10);
  const heroCardHeight = 11 + titleLines.length * 5.2 + taglineLines.length * 4.0;

  ensurePageSpace(heroCardHeight);
  drawCardBox(heroCardHeight);

  // Category Pill Tag (Top Right)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - marginRight - categoryPillW - 4, currentY + 3.2, categoryPillW, 5.2, 1.2, 1.2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(roadmap.categoryLabel, pageWidth - marginRight - 4 - categoryPillW / 2, currentY + 6.8, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text(titleLines, marginLeft + 5, currentY + 6.8);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(taglineLines, marginLeft + 5, currentY + 8.8 + titleLines.length * 5.2);

  currentY += heroCardHeight + 3.5;

  // ----------------------------------------------------
  // SECTION 1: STRATEGIC CAREER & COMPENSATION OVERVIEW
  // ----------------------------------------------------
  const sec1TitleHeight = 6;
  // Ensure space for header + salary columns + career roles card together to prevent orphan header
  ensurePageSpace(sec1TitleHeight + 24 + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('1. STRATEGIC CAREER & COMPENSATION OVERVIEW', marginLeft, currentY + 4);
  currentY += sec1TitleHeight;

  // Clean salary string while preserving authentic data
  const formatSalary = (raw: string | undefined, fallback: string): string => {
    if (!raw) return fallback;
    let s = raw.split('/')[0].replace(/–/g, '-').trim();
    if (!s.toLowerCase().includes('lpa') && !s.toLowerCase().includes('pm') && !s.toLowerCase().includes('k')) {
      s = `${s} LPA`;
    }
    return s;
  };

  const sb = roadmap.strategicOverview?.salaryBrackets;
  const colWidth = 58;
  const colHeight = 22;
  const colY = currentY;

  const columnsData = [
    {
      x: 14,
      title: 'ENTRY TIER (0-2 YRS)',
      val: formatSalary(sb?.entryTier, 'Competitive'),
      sub: 'Campus & Day-1 Junior Roles',
      titleColor: [71, 85, 105],
    },
    {
      x: 76,
      title: 'MID TIER (3-6 YRS)',
      val: formatSalary(sb?.midTier, 'High Growth'),
      sub: 'Senior Tech / Domain Specialist',
      titleColor: [15, 118, 110],
    },
    {
      x: 138,
      title: 'PEAK / GLOBAL TIER',
      val: formatSalary(sb?.peakTier, 'Leadership'),
      sub: 'Staff Architect / Global Lead',
      titleColor: [3, 105, 161],
    },
  ];

  columnsData.forEach((col) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(col.x, colY, colWidth, colHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(col.titleColor[0], col.titleColor[1], col.titleColor[2]);
    doc.text(col.title, col.x + colWidth / 2, colY + 5.5, { align: 'center' });

    // Dynamic Font Scaling for Salary Value to prevent any card collision
    doc.setFont('helvetica', 'bold');
    let valFontSize = 9.5;
    doc.setFontSize(valFontSize);
    while (doc.getTextWidth(col.val) > colWidth - 6 && valFontSize > 6.5) {
      valFontSize -= 0.5;
      doc.setFontSize(valFontSize);
    }
    doc.setTextColor(15, 23, 42);
    doc.text(col.val, col.x + colWidth / 2, colY + 12.2, { align: 'center' });

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.9);
    doc.setTextColor(100, 116, 139);
    doc.text(col.sub, col.x + colWidth / 2, colY + 17.5, { align: 'center' });
  });

  currentY += colHeight + 3.5;

  // Corporate Outlook & Primary Roles Card
  const targetRoles = roadmap.strategicOverview?.targetRoles || [];
  const rolesText = `Target Industry Roles: ${targetRoles.slice(0, 6).join(' • ') || 'Core Technical Specialist • Systems Analyst'}`;
  const rolesLines = doc.splitTextToSize(rolesText, contentWidth - 10);

  const corpSummary = roadmap.strategicOverview?.corporateSummary || '';
  const corpLines = corpSummary ? doc.splitTextToSize(`Corporate Outlook: ${corpSummary}`, contentWidth - 10) : [];

  const govtSummary = roadmap.strategicOverview?.govtPsuSummary || '';
  const govtLines = govtSummary ? doc.splitTextToSize(`PSU / Government Scope: ${govtSummary}`, contentWidth - 10) : [];

  let careerCardHeight = 6 + rolesLines.length * 3.8;
  if (corpLines.length > 0) careerCardHeight += 2 + corpLines.length * 3.6;
  if (govtLines.length > 0) careerCardHeight += 2 + govtLines.length * 3.6;

  ensurePageSpace(careerCardHeight);
  drawCardBox(careerCardHeight);

  let curCardY = currentY + 5.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(rolesLines, marginLeft + 5, curCardY);
  curCardY += rolesLines.length * 3.8 + 1.5;

  if (corpLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(51, 65, 85);
    doc.text(corpLines, marginLeft + 5, curCardY);
    curCardY += corpLines.length * 3.6 + 1.5;
  }

  if (govtLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(71, 85, 105);
    doc.text(govtLines, marginLeft + 5, curCardY);
  }

  currentY += careerCardHeight + 3.5;

  // Campus Tier Reality & Off-Campus Blueprint Card
  const tr = roadmap.strategicOverview?.tierReality;
  if (tr) {
    const tier1Text = `Apex / Tier-1 Reality: ${tr.tier1Reality || ''}`;
    const tier3Text = `Regional / Tier-3 Reality: ${tr.tier3Reality || ''}`;
    const t1Lines = doc.splitTextToSize(tier1Text, contentWidth - 10);
    const t3Lines = doc.splitTextToSize(tier3Text, contentWidth - 10);

    const tactics = tr.offCampusTactics || [];
    const tacticLines = tactics.map((t, idx) => doc.splitTextToSize(`${idx + 1}. ${t}`, contentWidth - 14));
    const totalTacticLineCount = tacticLines.reduce((acc, lines) => acc + lines.length, 0);

    const tierCardH = 8 + (t1Lines.length + t3Lines.length) * 3.6 + (tactics.length > 0 ? 5 + totalTacticLineCount * 3.4 : 0);

    ensurePageSpace(tierCardH);
    drawCardBox(tierCardH);

    let trY = currentY + 5.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.3);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(t1Lines, marginLeft + 5, trY);
    trY += t1Lines.length * 3.6 + 1.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.3);
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(t3Lines, marginLeft + 5, trY);
    trY += t3Lines.length * 3.6 + 2.0;

    if (tactics.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(67, 56, 202);
      doc.text('Key Off-Campus Strategy:', marginLeft + 5, trY);
      trY += 4.0;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      tacticLines.forEach((lines) => {
        doc.text(lines, marginLeft + 7, trY);
        trY += lines.length * 3.4 + 0.6;
      });
    }

    currentY += tierCardH + 3.5;
  }

  // ----------------------------------------------------
  // SECTION 2: INDUSTRY SKILLS & TECHNICAL STACK MATRIX
  // ----------------------------------------------------
  const skillsTitleHeight = 6;
  ensurePageSpace(skillsTitleHeight + 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('2. INDUSTRY SKILLS & TECHNICAL STACK MATRIX', marginLeft, currentY + 4);
  currentY += skillsTitleHeight;

  const fLines = doc.splitTextToSize(`Foundational Core: ${roadmap.skillsMatrix.foundational.join(', ')}`, contentWidth - 10);
  const aLines = doc.splitTextToSize(`Advanced & Specialization: ${roadmap.skillsMatrix.advanced.join(', ')}`, contentWidth - 10);
  const tLines = doc.splitTextToSize(`Software & Industry Tools: ${roadmap.skillsMatrix.industryTools.join(', ')}`, contentWidth - 10);
  const skillsCardHeight = 8 + (fLines.length + aLines.length + tLines.length) * 3.8;

  ensurePageSpace(skillsCardHeight);
  drawCardBox(skillsCardHeight);

  let sY = currentY + 5.2;
  const renderSkillBlock = (lines: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, marginLeft + 5, sY);
    sY += lines.length * 3.8 + 1.2;
  };

  renderSkillBlock(fLines);
  renderSkillBlock(aLines);
  renderSkillBlock(tLines);

  currentY += skillsCardHeight + 3.5;

  // GATE / Higher Studies Gateway Card
  if (roadmap.strategicOverview?.higherStudiesGate) {
    const hg = roadmap.strategicOverview.higherStudiesGate;
    const gateStr = `GATE / Higher Studies Gateway (${hg.exam}): Top Institutes: ${hg.topInstitutes.join(', ')} | M.Tech Tracks: ${hg.mtechSpecializations.join(', ')} | Scope: ${hg.msAbroadScope}`;
    const gateLines = doc.splitTextToSize(gateStr, contentWidth - 10);
    const gateCardHeight = 7 + gateLines.length * 3.6;

    ensurePageSpace(gateCardHeight);
    drawCardBox(gateCardHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(51, 65, 85);
    doc.text(gateLines, marginLeft + 5, currentY + 5.2);

    currentY += gateCardHeight + 3.5;
  }

  // ----------------------------------------------------
  // SECTION 3: 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN
  // ----------------------------------------------------
  // Header with orphan prevention (needs header + year banner + sem 1 card)
  ensurePageSpace(14 + 10 + 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('3. 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.years.forEach((yr, yrIdx) => {
    // Year Header Banner (Glued to first semester card to prevent orphan banner)
    ensurePageSpace(10 + 38);
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, currentY, contentWidth, 7.5, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(49, 46, 129);
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

      const labelW = 38;
      const valueW = contentWidth - labelW - 12;

      const semTitleLines = doc.splitTextToSize(sem.title, contentWidth - 12);
      let innerContentHeight = 6 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 3.8 : 0);

      const formattedSubItems = subItems.map((item) => {
        const lines = doc.splitTextToSize(item.val || '—', valueW);
        const itemH = Math.max(3.6, lines.length * 3.4 + 0.6);
        innerContentHeight += itemH;
        return { label: item.label, lines, itemH };
      });

      const semCardHeight = innerContentHeight + 4;

      ensurePageSpace(semCardHeight + 2);
      drawCardBox(semCardHeight);

      // Semester Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(15, 23, 42);
      doc.text(semTitleLines, marginLeft + 5, currentY + 5.2);

      // Cyan accent dot
      doc.setFillColor(6, 182, 212);
      doc.circle(marginLeft + 2.5, currentY + 4.5, 0.8, 'F');

      let itemY = currentY + 7.0 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 3.8 : 0);
      formattedSubItems.forEach((fItem) => {
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${fItem.label}:`, marginLeft + 5, itemY);

        // Value
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);
        doc.text(fItem.lines, marginLeft + labelW + 6, itemY);

        itemY += fItem.itemH;
      });

      currentY += semCardHeight + 3.0;
    });

    currentY += 2.0;

    // Inject explore banner midway through action plan
    if (yrIdx === 1) {
      renderExploreBanner();
    }
  });

  // ----------------------------------------------------
  // SECTION 4: STRATEGIC TIPS FOR CRACKING HIGH-GROWTH PLACEMENTS
  // ----------------------------------------------------
  ensurePageSpace(14 + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text('4. STRATEGIC TIPS FOR CRACKING HIGH-GROWTH PLACEMENTS', marginLeft, currentY + 4);
  currentY += 7;

  roadmap.proTips.forEach((tip, idx) => {
    const tipLines = doc.splitTextToSize(tip, contentWidth - 16);
    const tipCardH = 6 + tipLines.length * 3.6;

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
    doc.setFontSize(7.0);
    doc.setTextColor(51, 65, 85);
    doc.text(tipLines, marginLeft + 10.5, currentY + 5.8);

    currentY += tipCardH + 2.8;
  });

  // Concluding Explore Banner
  renderExploreBanner();

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
  const filename = `${roadmap.code}_Career_Roadmap_MAN_OF_STUDY.pdf`;
  doc.save(filename);
}
