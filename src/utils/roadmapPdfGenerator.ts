import { jsPDF } from 'jspdf';
import { BranchRoadmap } from '../types';

/**
 * Generates a clean, branded multi-page PDF for the selected engineering branch roadmap.
 * Adheres strictly to branding:
 * - Brand: "StudyMacha — All-in-One Student & Career Utility Hub"
 * - Platform URL: "studymacha.pages.dev"
 */
export function generateRoadmapPdf(roadmap: BranchRoadmap): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const BRAND_HEADER = 'StudyMacha — All-in-One Student & Career Utility Hub';
  const BRAND_URL = 'studymacha.pages.dev';
  const BRAND_WATERMARK = 'STUDYMACHA • studymacha.pages.dev';

  const addHeaderAndWatermark = (pageNum: number) => {
    // Watermark in background (soft light gray)
    doc.saveGraphicsState();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(232, 237, 245);
    // Draw diagonal or centered watermark
    doc.text(BRAND_WATERMARK, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 35,
    });
    doc.restoreGraphicsState();

    // Top Header Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(BRAND_HEADER, margin, 26);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(14, 116, 144); // Sky/Cyan
    doc.text(BRAND_URL, pageWidth - margin, 26, { align: 'right' });

    // Top border line
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.75);
    doc.line(margin, 32, pageWidth - margin, 32);
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Official Career Guide • ${roadmap.code} - ${roadmap.name} • ${BRAND_URL}`,
      margin,
      pageHeight - 16
    );

    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 16, {
      align: 'right',
    });
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - 45) {
      doc.addPage();
      y = 48;
    }
  };

  // ----------------------------------------------------
  // COVER / HEADER BLOCK
  // ----------------------------------------------------
  y = 48;

  // Title Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 68, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${roadmap.code}: ${roadmap.name}`, margin + 14, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const taglineLines = doc.splitTextToSize(roadmap.tagline, contentWidth - 28);
  doc.text(taglineLines, margin + 14, y + 42);

  // Badge pill on top right
  doc.setFillColor(224, 242, 254);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(pageWidth - margin - 120, y + 12, 106, 18, 9, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(3, 105, 161);
  doc.text(roadmap.categoryLabel, pageWidth - margin - 67, y + 24, { align: 'center' });

  y += 78;

  // ----------------------------------------------------
  // SECTION: STRATEGIC OVERVIEW & SALARIES
  // ----------------------------------------------------
  ensureSpace(130);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 105, 161);
  doc.text('1. STRATEGIC CAREER & COMPENSATION OVERVIEW', margin, y);
  y += 14;

  // Table-style card for salary brackets
  const salaryCardWidth = contentWidth;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, salaryCardWidth, 34, 3, 3, 'F');

  const colW = salaryCardWidth / 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ENTRY TIER (0-2 YRS)', margin + 10, y + 12);
  doc.text('MID TIER (3-6 YRS)', margin + colW + 10, y + 12);
  doc.text('PEAK / PRODUCT TIER', margin + colW * 2 + 10, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(roadmap.strategicOverview.salaryBrackets.entryTier, margin + 10, y + 26);
  doc.text(roadmap.strategicOverview.salaryBrackets.midTier, margin + colW + 10, y + 26);
  doc.text(roadmap.strategicOverview.salaryBrackets.peakTier, margin + colW * 2 + 10, y + 26);

  y += 42;

  // Corporate vs Govt Viability
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Corporate Viability: ${roadmap.strategicOverview.corporateViability}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const corpLines = doc.splitTextToSize(roadmap.strategicOverview.corporateSummary, contentWidth);
  doc.text(corpLines, margin, y + 11);
  y += 11 + corpLines.length * 10 + 4;

  ensureSpace(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Govt & PSU Viability: ${roadmap.strategicOverview.govtPsuViability}`, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const govtLines = doc.splitTextToSize(roadmap.strategicOverview.govtPsuSummary, contentWidth);
  doc.text(govtLines, margin, y + 11);
  y += 11 + govtLines.length * 10 + 4;

  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Target Roles: ', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const rolesText = roadmap.strategicOverview.targetRoles.join(' • ');
  const rolesLines = doc.splitTextToSize(rolesText, contentWidth - 65);
  doc.text(rolesLines, margin + 65, y);
  y += rolesLines.length * 11 + 10;

  // ----------------------------------------------------
  // SECTION: SKILLS & PLATFORMS MATRIX
  // ----------------------------------------------------
  ensureSpace(65);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 105, 161);
  doc.text('2. INDUSTRY SKILLS & SOFTWARE MATRIX', margin, y);
  y += 14;

  const renderSkillRow = (label: string, items: string[]) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const text = items.join(', ');
    const lines = doc.splitTextToSize(text, contentWidth - 100);
    doc.text(lines, margin + 100, y);
    y += Math.max(14, lines.length * 10 + 4);
  };

  renderSkillRow('Foundational Core', roadmap.skillsMatrix.foundational);
  renderSkillRow('Advanced & Specialization', roadmap.skillsMatrix.advanced);
  renderSkillRow('Software & Industry Tools', roadmap.skillsMatrix.industryTools);

  y += 10;

  // ----------------------------------------------------
  // SECTION: 4-YEAR SEMESTER-WISE ACTION PLAN
  // ----------------------------------------------------
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 105, 161);
  doc.text('3. 4-YEAR SEMESTER-BY-SEMESTER ACTION PLAN', margin, y);
  y += 16;

  roadmap.years.forEach((yr) => {
    ensureSpace(50);
    // Year Header Banner
    doc.setFillColor(224, 231, 255); // Indigo 100
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 27, 75); // Indigo 950
    doc.text(`${yr.yearTitle} — ${yr.theme}`, margin + 8, y + 13);
    y += 26;

    yr.semesters.forEach((sem) => {
      ensureSpace(120);

      // Semester Box
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 8, 'F'); // Small top anchor

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sem.title, margin + 4, y);
      y += 12;

      const printSubItem = (prefix: string, content: string) => {
        ensureSpace(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`${prefix}:`, margin + 8, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const prefixWidth = doc.getTextWidth(`${prefix}: `) + 4;
        const lines = doc.splitTextToSize(content, contentWidth - prefixWidth - 16);
        doc.text(lines, margin + 8 + prefixWidth, y);
        y += lines.length * 9.5 + 3;
      };

      printSubItem('Core Subjects', sem.coreSubjects.join(', '));
      printSubItem('Industry Skills', sem.industrySkills.join(', '));
      printSubItem('Tools & Platforms', sem.toolsAndPlatforms.join(', '));
      printSubItem('Portfolio Projects', sem.keyProjects.join('; '));
      printSubItem('Internship Milestone', sem.internshipOrMilestone);
      printSubItem('Placement / Exam Prep', sem.examOrPlacementPrep);

      y += 6;
    });

    y += 8;
  });

  // ----------------------------------------------------
  // SECTION: PRO TIPS FOR PLACEMENT CRACKING
  // ----------------------------------------------------
  ensureSpace(70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(3, 105, 161);
  doc.text('4. STRATEGIC TIPS FOR CRACKING TIER-1 PLACEMENTS', margin, y);
  y += 14;

  roadmap.proTips.forEach((tip, idx) => {
    ensureSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}.`, margin + 6, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(tip, contentWidth - 24);
    doc.text(lines, margin + 20, y);
    y += lines.length * 10 + 4;
  });

  // ----------------------------------------------------
  // APPLY HEADERS, FOOTERS & TOTAL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderAndWatermark(i);
    addFooter(i, totalPages);
  }

  // Save the PDF
  const filename = `${roadmap.code}_Engineering_Career_Roadmap_StudyMacha.pdf`;
  doc.save(filename);
}
