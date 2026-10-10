import { jsPDF } from 'jspdf';
import { BranchRoadmap } from '../types';

/**
 * Naa College - Professional Career Roadmap PDF Document Generator
 * 
 * Rebuilt from first principles as an authoritative, print-oriented A4 document:
 * - Fixed A4 Portrait Geometry: 210mm x 297mm
 * - Margins: Left/Right: 14mm, Content Width: 182mm (Safe printable area)
 * - Page 1: Dedicated Executive Cover Page with 4 structured direction blocks
 * - Pages 2+: Content sections with strict deterministic flow
 * - Subtle Watermark (5.5% visual intensity) on every page: "Naa College"
 * - Running Header & Non-Colliding Footer (Page X of Y) on all content pages
 * - Atomic Semester Cards with Strict Orphan Prevention (break-inside: avoid)
 * - Dynamic Text Splitting & Pre-Measured Box Heights (No text clipping or collisions)
 * - Sanitized currency symbols (Rs. / INR instead of broken Unicode glyphs)
 * - Safe Dynamic Filename: [BRANCH_NAME]_Roadmap_by_Man_of_Study.pdf
 */

export function getRoadmapPdfFilename(branch: BranchRoadmap): string {
  let raw = '';
  if (branch.code && branch.code.includes('(')) {
    raw = branch.code.replace(/[()]/g, ' ');
  } else if (
    branch.code &&
    branch.code.length <= 5 &&
    ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL', 'CSBS', 'CSD', 'CSM', 'RAM'].includes(branch.code)
  ) {
    if (branch.code === 'MECH') {
      raw = 'Mechanical_Engineering';
    } else if (branch.code === 'RAM') {
      raw = 'Robotics_and_Automation';
    } else {
      raw = branch.code;
    }
  } else {
    raw = branch.name || branch.code || 'Engineering';
  }

  let base = raw
    .replace(/[()]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9\s_-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!base || base.toLowerCase() === 'undefined') {
    base = 'Career';
  }

  return `${base}_Roadmap_by_Man_of_Study.pdf`;
}

export function generateRoadmapPdf(roadmap: BranchRoadmap, returnDocOnly = false): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 14;
  const marginRight = 14;
  const contentWidth = 182; // 210 - 28
  const minY = 22; // Safe start below running header
  const maxY = 276; // Safe content cutoff, leaving buffer above footer line at 283mm

  const BRAND_NAME = 'Naa College';
  const TARGET_URL = 'https://manofstudy.com';
  const EXPLORE_URL = 'https://manofstudy.com/#career-blueprints';

  let currentY = minY;

  // Helper: Ensures required space with strict orphan prevention
  const ensureSpace = (requiredHeightMm: number): boolean => {
    if (currentY + requiredHeightMm > maxY) {
      doc.addPage();
      currentY = minY;
      return true;
    }
    return false;
  };

  // Helper: Clean card box with light background and subtle border
  const drawCardBox = (
    y: number,
    heightMm: number,
    fillR = 255,
    fillG = 255,
    fillB = 255,
    borderR = 226,
    borderG = 232,
    borderB = 240
  ) => {
    doc.setFillColor(fillR, fillG, fillB);
    doc.setDrawColor(borderR, borderG, borderB);
    doc.setLineWidth(0.22);
    doc.roundedRect(marginLeft, y, contentWidth, heightMm, 2.0, 2.0, 'FD');
  };

  // Helper: Format salary string cleanly without Unicode glyph errors
  const formatSalary = (raw: string | undefined, fallback: string): string => {
    if (!raw) return fallback;
    let s = raw
      .split('/')[0]
      .replace(/[₹]/g, 'Rs. ')
      .replace(/–/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s.toLowerCase().includes('lpa') && !s.toLowerCase().includes('pm') && !s.toLowerCase().includes('k')) {
      s = `${s} LPA`;
    }
    return s;
  };

  // =========================================================================
  // 1. DEDICATED EXECUTIVE COVER PAGE (PAGE 1)
  // =========================================================================

  // Top decorative color band
  const segW = pageWidth / 4;
  doc.setFillColor(30, 27, 75); // Deep Indigo
  doc.rect(0, 0, segW, 3.5, 'F');
  doc.setFillColor(67, 56, 202); // Indigo
  doc.rect(segW, 0, segW, 3.5, 'F');
  doc.setFillColor(2, 132, 199); // Sky
  doc.rect(segW * 2, 0, segW, 3.5, 'F');
  doc.setFillColor(6, 182, 212); // Cyan
  doc.rect(segW * 3, 0, segW, 3.5, 'F');

  let coverY = 16;

  // Header Brand Pill
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.roundedRect(marginLeft, coverY, 32, 7.0, 1.8, 1.8, 'FD');

  // Cyan dot
  doc.setFillColor(6, 182, 212);
  doc.circle(marginLeft + 4.0, coverY + 3.5, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND_NAME, marginLeft + 7.2, coverY + 4.6);

  // Series Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CAREER ROADMAP SERIES', marginLeft + 36, coverY + 4.6);

  // Verified Badge (Right)
  const verW = 42;
  const verX = pageWidth - marginRight - verW;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(verX, coverY, verW, 7.0, 1.8, 1.8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.0);
  doc.setTextColor(2, 132, 199);
  doc.text('OFFICIAL BLUEPRINT', verX + verW / 2, coverY + 4.6, { align: 'center' });

  coverY += 13;

  // Title Container Card
  const titleText = `${roadmap.name}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(titleText, contentWidth - 14);
  const titleBoxHeight = 25 + titleLines.length * 8.5;

  drawCardBox(coverY, titleBoxHeight, 255, 255, 255, 203, 213, 225);

  // Accent bar on left of title card
  doc.setFillColor(67, 56, 202);
  doc.rect(marginLeft, coverY, 3.5, titleBoxHeight, 'F');

  // Branch Code Pill
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(marginLeft + 8, coverY + 6, 26, 6.0, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text(roadmap.code, marginLeft + 21, coverY + 10.2, { align: 'center' });

  // Degree & Category Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(100, 116, 139);
  const metaSubtitle = `${roadmap.degreeType || 'B.Tech / B.E.'} • Discipline: ${roadmap.categoryLabel.toUpperCase()}`;
  doc.text(metaSubtitle, marginLeft + 38, coverY + 10.2);

  // Large Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(titleLines, marginLeft + 8, coverY + 21);

  // Blueprint Subtitle
  const subY = coverY + 21 + (titleLines.length - 1) * 8.5 + 7.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(2, 132, 199);
  doc.text('4-Year Comprehensive Career & Curriculum Action Plan', marginLeft + 8, subY);

  coverY += titleBoxHeight + 5;

  // Executive Description Card
  const taglineLines = doc.splitTextToSize(roadmap.tagline, contentWidth - 14);
  const corpOverview = roadmap.strategicOverview?.corporateSummary || '';
  const corpLines = corpOverview
    ? doc.splitTextToSize(`Industry Context: ${corpOverview}`, contentWidth - 14)
    : [];
  const descHeight = 10 + (taglineLines.length + corpLines.length) * 4.2 + (corpLines.length > 0 ? 3 : 0);

  drawCardBox(coverY, descHeight, 248, 250, 252, 226, 232, 240);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(30, 41, 59);
  doc.text(taglineLines, marginLeft + 7, coverY + 6.5);

  if (corpLines.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.0);
    doc.setTextColor(71, 85, 105);
    doc.text(corpLines, marginLeft + 7, coverY + 6.5 + taglineLines.length * 4.2 + 2);
  }

  coverY += descHeight + 6;

  // 4 Structured Strategic Blocks on Cover (2x2 Grid)
  const gridW = 88; // 88 * 2 + 6 = 182mm
  const gridH = 40;
  const gap = 6;
  const row1Y = coverY;
  const row2Y = coverY + gridH + gap;

  // Block 1: Career Direction & Target Roles
  const targetRoles = roadmap.strategicOverview?.targetRoles || [];
  const rolesPreview = targetRoles.slice(0, 5).join(' • ') || 'Core Technical Specialist • Systems Analyst';
  const roleLines = doc.splitTextToSize(rolesPreview, gridW - 12);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginLeft, row1Y, gridW, gridH, 2.0, 2.0, 'FD');
  doc.setFillColor(2, 132, 199);
  doc.rect(marginLeft, row1Y, 2.5, gridH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(2, 132, 199);
  doc.text('1. TARGET INDUSTRY ROLES', marginLeft + 6, row1Y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(roleLines.slice(0, 5), marginLeft + 6, row1Y + 12.5);

  // Block 2: Core Skill Stack
  const foundationalSkills = roadmap.skillsMatrix.foundational.slice(0, 4).join(', ');
  const advancedSkills = roadmap.skillsMatrix.advanced.slice(0, 4).join(', ');
  const skillsText = `Core: ${foundationalSkills}\nSpecialization: ${advancedSkills}`;
  const skillLines = doc.splitTextToSize(skillsText, gridW - 12);

  const col2X = marginLeft + gridW + gap;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, row1Y, gridW, gridH, 2.0, 2.0, 'FD');
  doc.setFillColor(67, 56, 202);
  doc.rect(col2X, row1Y, 2.5, gridH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(67, 56, 202);
  doc.text('2. CORE TECHNICAL STACK', col2X + 6, row1Y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(skillLines.slice(0, 5), col2X + 6, row1Y + 12.5);

  // Block 3: Major Project Path & Portfolio
  const year4Projects = roadmap.years[3]?.semesters[1]?.keyProjects || roadmap.years[2]?.semesters[1]?.keyProjects || [];
  const projectPreview = year4Projects.slice(0, 2).join('; ') || 'Production Capstone System with Full-Stack Deployment';
  const projLines = doc.splitTextToSize(projectPreview, gridW - 12);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginLeft, row2Y, gridW, gridH, 2.0, 2.0, 'FD');
  doc.setFillColor(16, 185, 129); // Emerald
  doc.rect(marginLeft, row2Y, 2.5, gridH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(5, 150, 105);
  doc.text('3. MAJOR PORTFOLIO PROJECT PATH', marginLeft + 6, row2Y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(projLines.slice(0, 5), marginLeft + 6, row2Y + 12.5);

  // Block 4: Placement, PSU & Higher Studies Gateway
  const sb = roadmap.strategicOverview?.salaryBrackets;
  const gateInfo = roadmap.strategicOverview?.higherStudiesGate;
  const compLines = [
    `Entry Tier: ${formatSalary(sb?.entryTier, 'Competitive')}`,
    `Mid Tier: ${formatSalary(sb?.midTier, 'High Growth')} | Peak: ${formatSalary(sb?.peakTier, 'Tier-1')}`,
    gateInfo ? `Gateway: ${gateInfo.exam} (${gateInfo.topInstitutes.slice(0, 2).join(', ')})` : 'Gateway: Campus Drives & Off-Campus Hiring',
  ];

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, row2Y, gridW, gridH, 2.0, 2.0, 'FD');
  doc.setFillColor(217, 119, 6); // Amber
  doc.rect(col2X, row2Y, 2.5, gridH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(180, 83, 9);
  doc.text('4. PLACEMENT & GATEWAY TRAJECTORY', col2X + 6, row2Y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  let curCompY = row2Y + 12.5;
  compLines.forEach((cl) => {
    doc.text(cl, col2X + 6, curCompY);
    curCompY += 4.5;
  });

  // Cover Footer Banner at bottom of Page 1
  const coverFooterY = 262;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginLeft, coverFooterY, contentWidth, 14, 2.0, 2.0, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Naa College • Student Career Planning Platform', marginLeft + 8, coverFooterY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Comprehensive 8-Semester Curriculum Architecture • Engineered for Day-1 Placement Success & Technical Depth',
    marginLeft + 8,
    coverFooterY + 10.5
  );

  // START PAGE 2: CONTENT FLOW
  doc.addPage();
  currentY = minY;

  // Helper: Render section heading with orphan protection
  const renderSectionHeader = (title: string, subtitle?: string) => {
    // Ensure room for section header + subtitle + initial card to prevent orphaned headers
    ensureSpace(subtitle ? 18 + 25 : 12 + 25);

    // Accent line
    doc.setFillColor(2, 132, 199);
    doc.rect(marginLeft, currentY + 1.0, 3.2, 7.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginLeft + 6, currentY + 6.8);
    currentY += 9.5;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(100, 116, 139);
      const subLines = doc.splitTextToSize(subtitle, contentWidth - 8);
      doc.text(subLines, marginLeft + 6, currentY + 1.5);
      currentY += subLines.length * 3.8 + 2.5;
    }
  };

  // Helper: Interactive banner to explore all blueprints
  const renderExploreBanner = () => {
    ensureSpace(12);
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.22);
    doc.roundedRect(marginLeft, currentY, contentWidth, 8.5, 1.8, 1.8, 'FD');

    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    // @ts-ignore
    doc.textWithLink(
      'Click here to explore & download all 24+ Engineering & Degree Roadmaps on Naa College',
      105,
      currentY + 5.5,
      { url: EXPLORE_URL, align: 'center' }
    );
    currentY += 12.0;
  };

  // =========================================================================
  // SECTION 2: STRATEGIC CAREER OVERVIEW & INDUSTRY SCOPE
  // =========================================================================
  renderSectionHeader(
    '2. STRATEGIC CAREER OVERVIEW & INDUSTRY SCOPE',
    'Industry compensation tiers, target roles, corporate viability, and tier-wise hiring dynamics.'
  );

  // 3-Column Salary Brackets
  const colWidth = 57; // 57 * 3 + 11 = 182mm
  const colHeight = 22;
  const colY = currentY;

  const salaryCols = [
    {
      x: marginLeft,
      title: 'ENTRY TIER (0-2 YRS)',
      val: formatSalary(sb?.entryTier, 'Competitive'),
      sub: 'Campus Hiring & Day-1 Roles',
      color: [71, 85, 105],
    },
    {
      x: marginLeft + colWidth + 5.5,
      title: 'MID TIER (3-6 YRS)',
      val: formatSalary(sb?.midTier, 'High Growth'),
      sub: 'Senior Engineer / Specialist',
      color: [15, 118, 110],
    },
    {
      x: marginLeft + (colWidth + 5.5) * 2,
      title: 'PEAK / GLOBAL TIER',
      val: formatSalary(sb?.peakTier, 'Tier-1 / Global'),
      sub: 'Staff Architect / Global Lead',
      color: [3, 105, 161],
    },
  ];

  salaryCols.forEach((col) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(col.x, colY, colWidth, colHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(col.color[0], col.color[1], col.color[2]);
    doc.text(col.title, col.x + colWidth / 2, colY + 5.2, { align: 'center' });

    // Dynamic Font Scaling to prevent overflow
    doc.setFont('helvetica', 'bold');
    let valSize = 9.5;
    doc.setFontSize(valSize);
    while (doc.getTextWidth(col.val) > colWidth - 6 && valSize > 6.5) {
      valSize -= 0.5;
      doc.setFontSize(valSize);
    }
    doc.setTextColor(15, 23, 42);
    doc.text(col.val, col.x + colWidth / 2, colY + 12.0, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(col.sub, col.x + colWidth / 2, colY + 17.5, { align: 'center' });
  });

  currentY += colHeight + 4.5;

  // Target Roles & Corporate Outlook Card
  const rolesText = `Primary Industry Roles: ${targetRoles.join(' • ') || 'Core Technical Specialist • Systems Analyst'}`;
  const rolesWrapped = doc.splitTextToSize(rolesText, contentWidth - 14);

  const corpText = corpOverview ? `Corporate Viability & Scope: ${corpOverview}` : '';
  const corpWrapped = corpText ? doc.splitTextToSize(corpText, contentWidth - 14) : [];

  const govtSummary = roadmap.strategicOverview?.govtPsuSummary || '';
  const govtWrapped = govtSummary ? doc.splitTextToSize(`Government & PSU Opportunities: ${govtSummary}`, contentWidth - 14) : [];

  const rolesCardH =
    8 +
    rolesWrapped.length * 3.8 +
    (corpWrapped.length > 0 ? 3 + corpWrapped.length * 3.6 : 0) +
    (govtWrapped.length > 0 ? 3 + govtWrapped.length * 3.6 : 0);

  ensureSpace(rolesCardH);
  drawCardBox(currentY, rolesCardH);

  let cCardY = currentY + 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text(rolesWrapped, marginLeft + 7, cCardY);
  cCardY += rolesWrapped.length * 3.8 + 2.0;

  if (corpWrapped.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(corpWrapped, marginLeft + 7, cCardY);
    cCardY += corpWrapped.length * 3.6 + 2.0;
  }

  if (govtWrapped.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text(govtWrapped, marginLeft + 7, cCardY);
  }

  currentY += rolesCardH + 4.5;

  // Tier Reality & Off-Campus Blueprint Card
  const tr = roadmap.strategicOverview?.tierReality;
  if (tr) {
    const t1Text = `Apex / Tier-1 Campus Reality: ${tr.tier1Reality || ''}`;
    const t3Text = `Regional / Tier-3 Campus Reality: ${tr.tier3Reality || ''}`;
    const t1Lines = doc.splitTextToSize(t1Text, contentWidth - 14);
    const t3Lines = doc.splitTextToSize(t3Text, contentWidth - 14);

    const tactics = tr.offCampusTactics || [];
    const tacticLines = tactics.map((t, idx) => doc.splitTextToSize(`${idx + 1}. ${t}`, contentWidth - 16));
    const totalTacticCount = tacticLines.reduce((acc, lines) => acc + lines.length, 0);

    const tierCardH =
      9 +
      (t1Lines.length + t3Lines.length) * 3.6 +
      (tactics.length > 0 ? 6 + totalTacticCount * 3.4 : 0);

    ensureSpace(tierCardH);
    drawCardBox(currentY, tierCardH);

    let trY = currentY + 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(t1Lines, marginLeft + 7, trY);
    trY += t1Lines.length * 3.6 + 2.0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.setTextColor(225, 29, 72); // Rose 600
    doc.text(t3Lines, marginLeft + 7, trY);
    trY += t3Lines.length * 3.6 + 3.0;

    if (tactics.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(67, 56, 202);
      doc.text('Key Off-Campus Placement Tactics:', marginLeft + 7, trY);
      trY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      tacticLines.forEach((lines) => {
        doc.text(lines, marginLeft + 9, trY);
        trY += lines.length * 3.4 + 0.8;
      });
    }

    currentY += tierCardH + 5.0;
  }

  // =========================================================================
  // SECTION 3: CORE SKILLS & TECHNICAL STACK MATRIX
  // =========================================================================
  renderSectionHeader(
    '3. CORE SKILLS & TECHNICAL STACK MATRIX',
    'Structured competency progression from fundamental concepts to production tools.'
  );

  const fText = `Foundational Core: ${roadmap.skillsMatrix.foundational.join(', ')}`;
  const aText = `Advanced Specialization: ${roadmap.skillsMatrix.advanced.join(', ')}`;
  const tText = `Software, Tooling & DevOps: ${roadmap.skillsMatrix.industryTools.join(', ')}`;

  const fLines = doc.splitTextToSize(fText, contentWidth - 14);
  const aLines = doc.splitTextToSize(aText, contentWidth - 14);
  const tLines = doc.splitTextToSize(tText, contentWidth - 14);

  const skillsCardH = 8 + (fLines.length + aLines.length + tLines.length) * 3.8 + 4;

  ensureSpace(skillsCardH);
  drawCardBox(currentY, skillsCardH);

  let skY = currentY + 5.5;
  const renderSkillRow = (lines: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, marginLeft + 7, skY);
    skY += lines.length * 3.8 + 1.8;
  };

  renderSkillRow(fLines);
  renderSkillRow(aLines);
  renderSkillRow(tLines);

  currentY += skillsCardH + 4.5;

  // =========================================================================
  // SECTION 4: 4-YEAR CAREER ROADMAP (SEMESTERS 1 TO 8)
  // =========================================================================
  renderSectionHeader(
    '4. 4-YEAR CAREER ROADMAP (SEMESTERS 1 TO 8)',
    'Exhaustive 8-semester roadmap covering core subjects, skills, tools, projects, and milestones.'
  );

  roadmap.years.forEach((yr, yrIdx) => {
    // Year Header Banner (Glued to first semester card)
    ensureSpace(12 + 45); // Year banner + space for at least first semester card

    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, currentY, contentWidth, 8.0, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(49, 46, 129);
    const yearTitleStr = `${yr.yearTitle.toUpperCase()} — ${yr.theme}`;
    const yearTitleLines = doc.splitTextToSize(yearTitleStr, contentWidth - 10);
    doc.text(yearTitleLines[0], marginLeft + 6, currentY + 5.5);
    currentY += 10.5;

    yr.semesters.forEach((sem) => {
      // Clean up sem title so it doesn't say "Semester X: Semester X:"
      let cleanSemTitle = sem.title;
      const redundantPrefix = new RegExp(`^semester\\s*${sem.semNumber}[:\\-\\s]+`, 'i');
      cleanSemTitle = cleanSemTitle.replace(redundantPrefix, '').trim();

      const subItems = [
        { label: 'Core Subjects', val: sem.coreSubjects.join(', ') },
        { label: 'Industry Skills', val: sem.industrySkills.join(', ') },
        { label: 'Tools & Platforms', val: sem.toolsAndPlatforms.join(', ') },
        { label: 'Build / Project', val: sem.keyProjects.join('; ') },
        { label: 'Career Milestone', val: sem.internshipOrMilestone },
        { label: 'Placement Prep', val: sem.examOrPlacementPrep },
      ];

      const labelW = 38;
      const valueW = contentWidth - labelW - 14;

      const semTitleLines = doc.splitTextToSize(`SEMESTER ${sem.semNumber} • ${cleanSemTitle}`, contentWidth - 14);
      let innerContentHeight = 6 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 4.0 : 0);

      const formattedSubItems = subItems.map((item) => {
        const lines = doc.splitTextToSize(item.val || '—', valueW);
        const itemH = Math.max(3.8, lines.length * 3.4 + 1.0);
        innerContentHeight += itemH;
        return { label: item.label, lines, itemH };
      });

      const semCardHeight = innerContentHeight + 5;

      // Strict orphan avoidance: If entire card doesn't fit on this page, move to next page
      ensureSpace(semCardHeight);
      drawCardBox(currentY, semCardHeight);

      // Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.4);
      doc.setTextColor(15, 23, 42);
      doc.text(semTitleLines, marginLeft + 6, currentY + 5.5);

      // Cyan accent dot
      doc.setFillColor(6, 182, 212);
      doc.circle(marginLeft + 3.2, currentY + 4.5, 0.9, 'F');

      let itemY = currentY + 7.5 + (semTitleLines.length > 1 ? (semTitleLines.length - 1) * 4.0 : 0);
      formattedSubItems.forEach((fItem) => {
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(71, 85, 105);
        doc.text(`${fItem.label}:`, marginLeft + 6, itemY);

        // Value
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);
        doc.text(fItem.lines, marginLeft + labelW + 6, itemY);

        itemY += fItem.itemH;
      });

      currentY += semCardHeight + 3.5;
    });

    currentY += 2.0;

    // Inject explore banner midway through action plan
    if (yrIdx === 1) {
      renderExploreBanner();
    }
  });

  // =========================================================================
  // SECTION 5: PORTFOLIO & CAPSTONE PROJECT STRATEGY
  // =========================================================================
  renderSectionHeader(
    '5. PORTFOLIO & CAPSTONE PROJECT STRATEGY',
    'Best practices for constructing verifiable proof of technical competence.'
  );

  const portfolioGuidelines = [
    {
      title: 'Production-Grade Engineering',
      desc: 'Avoid academic tutorial clones. Build end-to-end systems featuring real deployment, comprehensive test coverage, robust error handling, and containerized Docker runtimes.',
    },
    {
      title: 'Public GitHub & Open Source Presence',
      desc: 'Maintain an active GitHub profile with modular repositories, detailed architectural READMEs, clean commit histories, and meaningful contributions to open-source libraries.',
    },
    {
      title: 'Specialized Domain Capstone',
      desc: 'In Years 3 & 4, execute at least 2 full-lifecycle capstone projects directly addressing industry challenges in this specific engineering specialization.',
    },
  ];

  portfolioGuidelines.forEach((g, idx) => {
    const descLines = doc.splitTextToSize(g.desc, contentWidth - 18);
    const cardH = 9 + descLines.length * 3.6;

    ensureSpace(cardH);
    drawCardBox(currentY, cardH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(67, 56, 202);
    doc.text(`${idx + 1}. ${g.title}`, marginLeft + 7, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(51, 65, 85);
    doc.text(descLines, marginLeft + 7, currentY + 9.5);

    currentY += cardH + 3.0;
  });

  // =========================================================================
  // SECTION 6: INTERNSHIP & PLACEMENT READINESS PATHWAY
  // =========================================================================
  renderSectionHeader(
    '6. INTERNSHIP & PLACEMENT READINESS PATHWAY',
    'Strategic summer timeline and day-1 campus recruitment readiness benchmarks.'
  );

  const internshipTimeline = [
    {
      period: 'After Year 1 (Summer)',
      milestone: 'Foundations & Open Source: Implement 15+ core algorithms; establish active GitHub profile.',
    },
    {
      period: 'After Year 2 (Summer)',
      milestone: 'First Technical Internship or Research Fellowship: Build functional full-stack / domain prototypes.',
    },
    {
      period: 'After Year 3 (Summer)',
      milestone: 'Pre-Placement Offer (PPO) Internship: 8-12 week industry stint at high-growth startups or product firms.',
    },
    {
      period: 'During Year 4',
      milestone: 'Final Placement Conversion: Day-1 campus placement drives and Tier-1 off-campus applications.',
    },
  ];

  internshipTimeline.forEach((t) => {
    const mLines = doc.splitTextToSize(t.milestone, contentWidth - 65);
    const cardH = 7 + mLines.length * 3.5;

    ensureSpace(cardH);
    drawCardBox(currentY, cardH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text(t.period, marginLeft + 7, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(51, 65, 85);
    doc.text(mLines, marginLeft + 58, currentY + 5.5);

    currentY += cardH + 2.5;
  });

  // =========================================================================
  // SECTION 7: HIGHER STUDIES & COMPETITIVE EXAM GATEWAYS
  // =========================================================================
  if (roadmap.strategicOverview?.higherStudiesGate) {
    const hg = roadmap.strategicOverview.higherStudiesGate;
    renderSectionHeader(
      '7. HIGHER STUDIES & COMPETITIVE EXAM GATEWAYS',
      'Advanced degree pathways, national examinations, and institutional options.'
    );

    const gateItems = [
      { label: `Primary Examination`, val: hg.exam },
      { label: `Premier Institutions`, val: hg.topInstitutes.join(', ') },
      { label: `Specialization Tracks`, val: hg.mtechSpecializations.join(', ') },
      { label: `Scope for MS Abroad`, val: hg.msAbroadScope },
    ];

    const gateLinesArr = gateItems.map((gi) => {
      const lines = doc.splitTextToSize(gi.val, contentWidth - 48);
      return { label: gi.label, lines, h: Math.max(4.0, lines.length * 3.5 + 1.2) };
    });

    const totalGateH = 7 + gateLinesArr.reduce((acc, item) => acc + item.h, 0);

    ensureSpace(totalGateH);
    drawCardBox(currentY, totalGateH);

    let gY = currentY + 5.5;
    gateLinesArr.forEach((gi) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.0);
      doc.setTextColor(71, 85, 105);
      doc.text(`${gi.label}:`, marginLeft + 7, gY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.0);
      doc.setTextColor(30, 41, 59);
      doc.text(gi.lines, marginLeft + 46, gY);

      gY += gi.h;
    });

    currentY += totalGateH + 4.5;
  }

  // =========================================================================
  // SECTION 8: STRATEGIC CAREER TIPS & INDUSTRY GUIDELINES
  // =========================================================================
  renderSectionHeader(
    '8. STRATEGIC CAREER TIPS & INDUSTRY GUIDELINES',
    'Actionable recommendations from engineering mentors, technical interviewers, and alumni.'
  );

  roadmap.proTips.forEach((tip, idx) => {
    const tipLines = doc.splitTextToSize(tip, contentWidth - 18);
    const tipCardH = 6 + tipLines.length * 3.6;

    ensureSpace(tipCardH);
    drawCardBox(currentY, tipCardH);

    // Number Badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginLeft + 3.5, currentY + 2.8, 5.5, 5.5, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(2, 132, 199);
    doc.text(`${idx + 1}`, marginLeft + 6.2, currentY + 6.5, { align: 'center' });

    // Tip Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    doc.text(tipLines, marginLeft + 11.5, currentY + 5.8);

    currentY += tipCardH + 3.0;
  });

  // =========================================================================
  // SECTION 9: NEXT STEPS & ACADEMIC ACTION BLUEPRINT
  // =========================================================================
  renderSectionHeader(
    '9. NEXT STEPS & ACADEMIC ACTION BLUEPRINT',
    'Immediate execution milestones to implement this blueprint starting today.'
  );

  const nextSteps = [
    'Print & Pin: Keep a physical copy of this 8-semester roadmap near your primary study workstation.',
    'Version Control Audit: Initialize your professional GitHub account and push code daily following semester targets.',
    'Peer Study Group: Form a 3-4 member peer circle to tackle semester capstone projects and competitive challenges.',
    'Explore More Disciplines: Access complementary engineering and degree roadmaps on the Naa College platform.',
  ];

  nextSteps.forEach((step, idx) => {
    const sLines = doc.splitTextToSize(step, contentWidth - 18);
    const cardH = 6 + sLines.length * 3.5;

    ensureSpace(cardH);
    drawCardBox(currentY, cardH);

    doc.setFillColor(238, 242, 255);
    doc.circle(marginLeft + 6.0, currentY + 4.5, 1.4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(30, 41, 59);
    doc.text(sLines, marginLeft + 11.0, currentY + 5.5);

    currentY += cardH + 2.5;
  });

  // Concluding Explore Banner
  renderExploreBanner();

  // =========================================================================
  // MULTI-PASS: WATERMARKS, RUNNING HEADERS & ACCURATE FOOTERS
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // 1. Watermark on EVERY page (Subtle 5.5% visual intensity)
    doc.saveGraphicsState();
    try {
      // @ts-ignore
      if (typeof doc.GState === 'function') {
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.055 }));
      }
    } catch {
      // Fallback
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(38);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('NAA COLLEGE', 105, 148.5, {
      align: 'center',
      angle: -45,
    });
    doc.restoreGraphicsState();

    // 2. Running Header on Pages 2..N
    if (i >= 2) {
      // Top accent bar
      const hSegW = pageWidth / 4;
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, hSegW, 2.2, 'F');
      doc.setFillColor(67, 56, 202);
      doc.rect(hSegW, 0, hSegW, 2.2, 'F');
      doc.setFillColor(2, 132, 199);
      doc.rect(hSegW * 2, 0, hSegW, 2.2, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(hSegW * 3, 0, hSegW, 2.2, 'F');

      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 27, 75);
      doc.text(BRAND_NAME, marginLeft, 9.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.0);
      doc.setTextColor(100, 116, 139);
      doc.text('• Career Roadmap Series', marginLeft + 24, 9.5);

      // Right: Branch Code & Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      const rightHeader = `${roadmap.code} — ${roadmap.name}`;
      const rightLines = doc.splitTextToSize(rightHeader, 85);
      doc.text(rightLines[0], pageWidth - marginRight, 9.5, { align: 'right' });

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.22);
      doc.line(marginLeft, 13.0, pageWidth - marginRight, 13.0);
    }

    // 3. Running Footer on ALL Pages
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.22);
    doc.line(marginLeft, pageHeight - 12.0, pageWidth - marginRight, pageHeight - 12.0);

    // Left: Brand Platform
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text('Naa College • Student Career Planning Platform', marginLeft, pageHeight - 7.5);

    // Center: Interactive Brand Link
    doc.setTextColor(2, 132, 199);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    // @ts-ignore
    doc.textWithLink('manofstudy.com', 105, pageHeight - 7.5, {
      url: TARGET_URL,
      align: 'center',
    });

    // Right: Accurate Page Counter
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginRight, pageHeight - 7.5, {
      align: 'right',
    });
  }

  // =========================================================================
  // SAVE / DOWNLOAD PDF
  // =========================================================================
  if (!returnDocOnly) {
    const filename = getRoadmapPdfFilename(roadmap);
    doc.save(filename);
  }
  return doc;
}
