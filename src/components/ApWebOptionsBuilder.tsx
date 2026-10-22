import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { jsPDF } from 'jspdf';
import {
  AlertCircle, ArrowDown, ArrowRight, ArrowUp, BadgeCheck, Check, CheckCircle2,
  BookOpenCheck, Copy, Download, FileDown, GraduationCap, Info, ListOrdered, MapPin, Plus,
  RefreshCw, Search, ShieldCheck, Sparkles, Target, Trash2, X,
} from 'lucide-react';
import {
  AP_REGION_OPTIONS, AP_SOCIAL_CATEGORIES, AP_SPECIAL_CATEGORIES,
  getApQuotaClosingRanks, runApPredictorAnalysis, type ApCollegeBranchMatch,
} from '../services/apCollegePredictorService';
import './ApWebOptionsBuilder.css';

interface SourceBranch { code: string; name: string; quotaCount: number; }
interface SourceCollege { code: string; name: string; district: string; branches: SourceBranch[]; }
interface PriorityChoice {
  id: string; collegeCode: string; collegeName: string; district: string;
  branchCode: string; branchName: string;
}
type ObservedStatus = 'within' | 'beyond' | 'missing';
type WebOptionGroupKey = 'dream' | 'borderline' | 'available' | 'safe-backup';

interface WebOptionGroup {
  key: WebOptionGroupKey; title: string; badge: string; description: string;
  explanation: string; pdfAccent: [number, number, number]; pdfTint: [number, number, number];
}
interface GeneratedOption extends PriorityChoice {
  closingRank: number | null; matchedRecords: number; isUserPriority: boolean;
  observedStatus: ObservedStatus; groupKey: WebOptionGroupKey; profileRank: number; category: string;
  gender: 'M' | 'F'; region: string; specialCategory: string;
}
interface GeneratedProfile {
  rank: number; category: string; gender: 'M' | 'F'; region: string; specialCategory: string;
  districts: string[]; branches: string[]; totalFilteredMatches: number;
  displayedAlternatives: number; priorityCount: number; priorityChoiceIds: string[];
}

const MAX_PRIORITY_CHOICES = 30;
const MAX_AUTO_OPTIONS_PER_GROUP = 30;
const WEB_OPTIONS_URL = 'https://naacollege.in/ap-eapcet/web-options-builder';
const PLANNING_YEAR = 2027;
const HISTORICAL_DATA_YEAR = 2026;
const WEB_OPTION_GROUPS: WebOptionGroup[] = [
  { key: 'dream', title: 'Dream Options', badge: 'AIM HIGH', description: 'Aspirational, highly competitive choices — including your manually prioritised colleges.', explanation: 'These options have a tighter observed 2026 closing rank than your entered rank would meet. Your priority choices stay here by design.', pdfAccent: [157, 111, 20], pdfTint: [255, 248, 226] },
  { key: 'borderline', title: 'Borderline Chance', badge: 'CLOSE TO CUTOFF', description: 'Your rank is moderately beyond the available 2026 closing-rank reference.', explanation: 'Rank falls within the predictor’s existing 10–35% historical comparison band. This is a borderline context, not a probability.', pdfAccent: [176, 99, 37], pdfTint: [255, 244, 232] },
  { key: 'available', title: 'Available for Rank', badge: 'WITHIN OBSERVED RANGE', description: 'Your rank is at or better than the observed closing rank, without the larger backup buffer.', explanation: 'Your rank is within this category/gender/region-filtered 2026 observed closing-rank value. It does not guarantee a future allotment.', pdfAccent: [36, 112, 77], pdfTint: [235, 248, 239] },
  { key: 'safe-backup', title: 'Safe Backup', badge: 'LARGER HISTORICAL BUFFER', description: 'Options where the observed closing rank is at least 35% higher than your entered rank.', explanation: 'This is a larger historical rank buffer only — no college or seat can be guaranteed safe in a future counselling round.', pdfAccent: [48, 101, 143], pdfTint: [236, 245, 252] },
];
const GROUP_ORDER: Record<WebOptionGroupKey, number> = { dream: 0, borderline: 1, available: 2, 'safe-backup': 3 };
const formatRank = (value: number) => Math.round(value).toLocaleString('en-IN');
const getWebOptionGroup = (rank: number, closingRank: number | null): WebOptionGroupKey => {
  if (!closingRank || closingRank < 1) return 'dream';
  if (rank > closingRank * 1.35) return 'dream';
  if (rank > closingRank * 1.10) return 'borderline';
  if (closingRank >= rank * 1.35) return 'safe-backup';
  return 'available';
};
const loadLogoAsPng = async (src: string): Promise<string> => {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d');
  if (!context || !canvas.width || !canvas.height) throw new Error('The Naa College logo could not be prepared for PDF export.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
};
const getObservedStatus = (rank: number, closingRank: number | null): ObservedStatus => {
  if (!closingRank || closingRank < 1) return 'missing';
  return rank <= closingRank ? 'within' : 'beyond';
};
const statusLabel: Record<ObservedStatus, string> = {
  within: 'Within observed closing rank',
  beyond: 'Beyond observed closing rank',
  missing: 'No matching closing-rank data',
};

const makeExportText = (options: GeneratedOption[], profile: GeneratedProfile | null) => {
  const header = [
    'Naa College — AP Web Options Priority Draft',
    'Prepared from the available AP EAPCET 2026 rank index' + (profile ? ' for rank ' + formatRank(profile.rank) : '') + '.',
    'This is a personal preference list, not an official counselling submission or a guarantee of allotment.',
    '',
  ];
  const entries = options.map((item, index) => {
    const cutoff = item.closingRank
      ? formatRank(item.closingRank) + ' (available eligible-quota closing rank)'
      : 'No matching closing-rank value for the selected category, gender, region and special-category filters';
    let assessment = 'No matching closing-rank comparison is available in this index';
    if (item.observedStatus === 'within') assessment = 'Entered rank is at or better than the observed closing rank';
    if (item.observedStatus === 'beyond') assessment = 'Entered rank is ' + formatRank(item.profileRank - (item.closingRank || 0)) + ' places beyond the observed closing rank';
    return [
      'Option ' + (index + 1) + (item.isUserPriority ? ' — USER PRIORITY' : ''),
      '[' + item.collegeCode + '] ' + item.collegeName,
      'District: ' + (item.district || 'Not listed in the loaded rank index'),
      'Branch: ' + item.branchCode + ' — ' + item.branchName,
      '2026 observed closing-rank value: ' + cutoff,
      'Rank context: ' + assessment,
    ].join('\n');
  });
  return header.concat(entries.join('\n\n')).join('\n');
};

export const ApWebOptionsBuilder: React.FC = () => {
  const [sourceColleges, setSourceColleges] = useState<SourceCollege[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');
  const [rankInput, setRankInput] = useState('');
  const [rankError, setRankError] = useState('');
  const [category, setCategory] = useState('OC');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [region, setRegion] = useState('AU');
  const [specialCategory, setSpecialCategory] = useState('NONE');
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [priorityCollegeSearch, setPriorityCollegeSearch] = useState('');
  const [priorityCollegeCode, setPriorityCollegeCode] = useState('');
  const [priorityBranchCode, setPriorityBranchCode] = useState('');
  const [priorityChoices, setPriorityChoices] = useState<PriorityChoice[]>([]);
  const [priorityError, setPriorityError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedOption[]>([]);
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null);
  const [copyMessage, setCopyMessage] = useState('');

  const loadDataset = useCallback(async () => {
    setIsLoadingData(true);
    setDataError('');
    try {
      const data = await getApQuotaClosingRanks();
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        throw new Error('The AP EAPCET 2026 rank index could not be loaded.');
      }
      const list: SourceCollege[] = Object.entries(data as Record<string, any>).map(([key, raw]) => {
        const branches: SourceBranch[] = Object.entries((raw as any)?.branches || {}).map(([branchCode, value]) => {
          const item = value as any;
          const quotas = item?.quotas && typeof item.quotas === 'object' ? item.quotas : {};
          const quotaCount = (Object.values(quotas) as any[]).reduce<number>((total, quota) => total + Math.max(0, Number(quota?.count) || 0), 0);
          return { code: branchCode, name: String(item?.name || branchCode).trim(), quotaCount };
        }).sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
        return {
          code: String((raw as any)?.code || key).trim(),
          name: String((raw as any)?.name || key).trim(),
          district: String((raw as any)?.district || '').trim(),
          branches,
        };
      }).filter((college) => college.code && college.name && college.branches.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (!list.length) throw new Error('The loaded AP index contains no selectable college/branch entries.');
      setSourceColleges(list);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to load the AP EAPCET 2026 rank index.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => { void loadDataset(); }, [loadDataset]);

  const districts = useMemo(
    () => Array.from(new Set(sourceColleges.map((item) => item.district).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [sourceColleges],
  );

  const branches = useMemo(() => {
    const byCode = new Map<string, string>();
    sourceColleges.forEach((college) => college.branches.forEach((item) => {
      const existing = byCode.get(item.code);
      if (!existing || item.name.length > existing.length) byCode.set(item.code, item.name);
    }));
    return Array.from(byCode.entries()).map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
  }, [sourceColleges]);

  const filteredDistricts = useMemo(() => {
    const query = districtSearch.trim().toLowerCase();
    return query ? districts.filter((district) => district.toLowerCase().includes(query)) : districts;
  }, [districtSearch, districts]);

  const filteredBranches = useMemo(() => {
    const query = branchSearch.trim().toLowerCase();
    return query ? branches.filter((item) => (item.code + ' ' + item.name).toLowerCase().includes(query)) : branches;
  }, [branchSearch, branches]);

  const priorityCollegeChoices = useMemo(() => {
    const matching = selectedDistricts.length
      ? sourceColleges.filter((college) => selectedDistricts.includes(college.district))
      : sourceColleges;
    const query = priorityCollegeSearch.trim().toLowerCase();
    return query ? matching.filter((college) => (college.name + ' ' + college.code + ' ' + college.district).toLowerCase().includes(query)) : matching;
  }, [priorityCollegeSearch, selectedDistricts, sourceColleges]);

  const selectedPriorityCollege = useMemo(
    () => sourceColleges.find((college) => college.code === priorityCollegeCode) || null,
    [priorityCollegeCode, sourceColleges],
  );
  const priorityBranchChoices = selectedPriorityCollege?.branches || [];

  const isGeneratedDraftOutdated = useMemo(() => {
    if (!generatedProfile) return false;
    const currentRank = Number(String(rankInput).replace(/,/g, '').trim());
    const sameSet = (left: string[], right: string[]) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
    return currentRank !== generatedProfile.rank
      || category !== generatedProfile.category
      || gender !== generatedProfile.gender
      || region !== generatedProfile.region
      || specialCategory !== generatedProfile.specialCategory
      || !sameSet(selectedDistricts, generatedProfile.districts)
      || !sameSet(selectedBranches, generatedProfile.branches)
      || JSON.stringify(priorityChoices.map((choice) => choice.id)) !== JSON.stringify(generatedProfile.priorityChoiceIds);
  }, [generatedProfile, rankInput, category, gender, region, specialCategory, selectedDistricts, selectedBranches, priorityChoices]);

  useEffect(() => {
    if (!sourceColleges.length) return;
    if (!priorityCollegeChoices.length) {
      setPriorityCollegeCode('');
      setPriorityBranchCode('');
      return;
    }
    if (!priorityCollegeChoices.some((college) => college.code === priorityCollegeCode)) {
      const nextCollege = priorityCollegeChoices[0];
      setPriorityCollegeCode(nextCollege.code);
      setPriorityBranchCode(nextCollege.branches[0]?.code || '');
    }
  }, [priorityCollegeChoices, priorityCollegeCode, sourceColleges.length]);

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((current) => current.includes(district) ? current.filter((item) => item !== district) : [...current, district]);
  };
  const toggleBranch = (code: string) => {
    setSelectedBranches((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  };

  const addPriorityChoice = () => {
    setPriorityError('');
    const college = sourceColleges.find((item) => item.code === priorityCollegeCode);
    const branch = college?.branches.find((item) => item.code === priorityBranchCode);
    if (!college || !branch) {
      setPriorityError('Choose a college and one of its listed branches first.');
      return;
    }
    const id = college.code + '_' + branch.code;
    if (priorityChoices.some((item) => item.id === id)) {
      setPriorityError('That college and branch is already in your priority list.');
      return;
    }
    if (priorityChoices.length >= MAX_PRIORITY_CHOICES) {
      setPriorityError('You can keep up to ' + MAX_PRIORITY_CHOICES + ' personal priority choices. Remove one before adding another.');
      return;
    }
    setPriorityChoices((current) => current.concat([{
      id, collegeCode: college.code, collegeName: college.name, district: college.district,
      branchCode: branch.code, branchName: branch.name,
    }]));
  };

  const movePriorityChoice = (index: number, direction: 'up' | 'down') => {
    setPriorityChoices((current) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const moveGeneratedOption = (index: number, direction: 'up' | 'down') => {
    setGeneratedOptions((current) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      if (current[index].groupKey !== current[target].groupKey) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleGenerate = async (event?: FormEvent) => {
    event?.preventDefault();
    setRankError('');
    setGenerationError('');
    setCopyMessage('');
    const rank = Number(String(rankInput).replace(/,/g, '').trim());
    if (!Number.isInteger(rank) || rank < 1 || rank > 350000) {
      setRankError('Enter a whole-number AP EAPCET rank between 1 and 350,000.');
      return;
    }
    if (isLoadingData || dataError) {
      setGenerationError('Load the existing AP EAPCET 2026 index before generating options.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await runApPredictorAnalysis({
        rank, category, gender, region, specialCategory,
        collegeCode: 'ALL', branch: 'ALL', collegeQuery: '', sortBy: 'SELECTIVE',
      });
      const makeChoiceKey = (collegeCode: string, branchCode: string) => (
        String(collegeCode).trim().toUpperCase() + '_' + String(branchCode).trim().toUpperCase()
      );
      const matchByChoiceKey = new Map<string, ApCollegeBranchMatch>(
        response.matches.map((match) => [makeChoiceKey(match.collegeCode, match.branchCode), match]),
      );
      const toGeneratedOption = (choice: PriorityChoice, isUserPriority: boolean): GeneratedOption => {
        const match = matchByChoiceKey.get(makeChoiceKey(choice.collegeCode, choice.branchCode));
        const closingRank = match && match.closingRank > 0 ? match.closingRank : null;
        return {
          ...choice, closingRank, matchedRecords: match?.matchingRecordCount || 0,
          isUserPriority,
          observedStatus: getObservedStatus(rank, closingRank),
          groupKey: isUserPriority ? 'dream' : getWebOptionGroup(rank, closingRank),
          profileRank: rank, category, gender, region, specialCategory,
        };
      };

      // Keep the student's explicit preference order; historical rank context never silently demotes a dream choice.
      const priorityIds = new Set(priorityChoices.map((choice) => makeChoiceKey(choice.collegeCode, choice.branchCode)));
      const priorityOptions = priorityChoices.map((choice) => toGeneratedOption(choice, true));
      const alternativeMatches = response.matches.filter((match) => {
        if (!match.closingRank || match.closingRank < 1 || priorityIds.has(makeChoiceKey(match.collegeCode, match.branchCode))) return false;
        if (selectedDistricts.length && !selectedDistricts.includes(match.district)) return false;
        if (selectedBranches.length && !selectedBranches.includes(match.branchCode)) return false;
        return true;
      }).sort((a, b) => {
        const groupA = getWebOptionGroup(rank, a.closingRank);
        const groupB = getWebOptionGroup(rank, b.closingRank);
        if (GROUP_ORDER[groupA] !== GROUP_ORDER[groupB]) return GROUP_ORDER[groupA] - GROUP_ORDER[groupB];

        // Neutral, data-driven ordering. No college code or institution name gets a boost.
        // A lower closing rank is a historical branch-demand indicator, not a quality score.
        if (a.closingRank !== b.closingRank) return a.closingRank - b.closingRank;
        if (a.matchingRecordCount !== b.matchingRecordCount) return b.matchingRecordCount - a.matchingRecordCount;
        return a.collegeName.localeCompare(b.collegeName) || a.branchName.localeCompare(b.branchName);
      });

      const alternativeOptions = WEB_OPTION_GROUPS.flatMap((group) => alternativeMatches
        .filter((match) => getWebOptionGroup(rank, match.closingRank) === group.key)
        .slice(0, MAX_AUTO_OPTIONS_PER_GROUP)
        .map((match) => toGeneratedOption({
          id: match.id, collegeCode: match.collegeCode, collegeName: match.collegeName,
          district: match.district, branchCode: match.branchCode, branchName: match.branchName,
        }, false)));
      const combined = priorityOptions.concat(alternativeOptions);
      if (!combined.length) {
        setGenerationError('No matching closing-rank options were found in the loaded 2026 data for these filters. Try another district or branch. You can still add an explicit preference above and keep it at the top of your list.');
      }
      setGeneratedOptions(combined);
      setGeneratedProfile({
        rank, category, gender, region, specialCategory,
        districts: [...selectedDistricts], branches: [...selectedBranches],
        totalFilteredMatches: alternativeMatches.length,
        displayedAlternatives: alternativeOptions.length, priorityCount: priorityOptions.length,
        priorityChoiceIds: priorityChoices.map((choice) => choice.id),
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Could not generate the web options from the 2026 rank index.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdfOptions = async () => {
    if (!generatedOptions.length || isExportingPdf || isGeneratedDraftOutdated) return;
    setIsExportingPdf(true);
    setCopyMessage('');
    try {
      const logoData = await loadLogoAsPng('/Naacollege_fulllogo.webp');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 18;
      const rank = generatedProfile?.rank || generatedOptions[0]?.profileRank || 0;
      pdf.setProperties({
        title: 'AP EAPCET 2027 Planning Web Options — Naa College',
        subject: 'Personal preference list for 2027 admission planning using available AP EAPCET 2026 historical rank data',
        author: 'Naa College',
        creator: 'Naa College Web Options Builder',
        keywords: 'AP EAPCET, web options, college preferences, Naa College',
      });

      const drawWatermark = () => {
        // Repeat a faint watermark across each page without clipping it over content.
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(237, 242, 238);
        for (let y = 44; y < pageHeight - 18; y += 62) {
          for (let x = 13; x < pageWidth - 34; x += 92) {
            pdf.text('NAA COLLEGE', x, y, { angle: -28 });
          }
        }
      };

      const drawHeader = () => {
        pdf.addImage(logoData, 'PNG', margin, 5.5, 36, 18, 'naa-college-logo', 'FAST');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        pdf.setTextColor(30, 68, 49);
        pdf.text('2027 ADMISSION PLANNING', 54, 11.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.2);
        pdf.setTextColor(98, 116, 105);
        pdf.text('BASED ON HISTORICAL 2026 DATA', 54, 17);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.3);
        pdf.setTextColor(34, 101, 69);
        pdf.textWithLink('OPEN WEB OPTIONS', pageWidth - margin, 13, { url: WEB_OPTIONS_URL, align: 'right' });
        pdf.setDrawColor(213, 226, 216);
        pdf.setLineWidth(0.35);
        pdf.line(margin, 27, pageWidth - margin, 27);
      };

      const startNewPage = () => {
        pdf.addPage();
        drawWatermark();
        drawHeader();
      };

      drawWatermark();
      drawHeader();

      pdf.setFillColor(20, 57, 45);
      pdf.roundedRect(margin, 33, contentWidth, 45, 4, 4, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.1);
      pdf.setTextColor(229, 208, 125);
      pdf.text('AP EAPCET 2027 PLANNING  /  HISTORICAL DATA: 2026', margin + 7, 42);
      pdf.setFontSize(23);
      pdf.setTextColor(255, 255, 255);
      pdf.text('WEB OPTIONS', margin + 7, 54);
      pdf.setFontSize(8);
      pdf.setTextColor(230, 239, 232);
      pdf.text(
        'Rank ' + formatRank(rank) + '  ·  ' + (generatedProfile?.category || generatedOptions[0]?.category || '') +
        '  ·  ' + ((generatedProfile?.gender || generatedOptions[0]?.gender) === 'F' ? 'Female' : 'Male') +
        '  ·  ' + (generatedProfile?.region || generatedOptions[0]?.region || ''),
        margin + 7, 62,
      );
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.8);
      pdf.setTextColor(207, 224, 212);
      pdf.text('A personalised list • Historical rank context • Editable preference draft', margin + 7, 71);
      pdf.link(margin, 33, contentWidth, 45, { url: WEB_OPTIONS_URL });

      const statGap = 3;
      const statWidth = (contentWidth - statGap * 3) / 4;
      WEB_OPTION_GROUPS.forEach((group, index) => {
        const count = generatedOptions.filter((option) => option.groupKey === group.key).length;
        const x = margin + index * (statWidth + statGap);
        pdf.setFillColor(...group.pdfTint);
        pdf.roundedRect(x, 83, statWidth, 19, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(...group.pdfAccent);
        pdf.text(String(count), x + 4, 91.5);
        pdf.setFontSize(5.8);
        pdf.setTextColor(57, 73, 63);
        pdf.text(group.title, x + 4, 97);
        pdf.link(x, 83, statWidth, 19, { url: WEB_OPTIONS_URL });
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.6);
      pdf.setTextColor(93, 108, 99);
      pdf.text(
        pdf.splitTextToSize(
          '2026 closing ranks are historical references for 2027 planning, not future cutoffs. The four groups are based on rank-to-cutoff gaps, not admission probabilities. Within each group, lower observed branch closing ranks come first as a historical demand signal; no college is boosted by name. This is not an overall college-quality ranking. “Safe Backup” means a larger historical buffer only, never a guarantee.',
          contentWidth,
        ),
        margin, 110,
      );

      let y = 125;
      let overallNumber = 0;
      const cardHeight = 31;
      const cardGap = 2.2;
      for (const group of WEB_OPTION_GROUPS) {
        const items = generatedOptions.filter((option) => option.groupKey === group.key);
        if (!items.length) continue;
        if (y + 15 + cardHeight > bottomLimit) {
          startNewPage();
          y = 35;
        }
        pdf.setFillColor(...group.pdfTint);
        pdf.roundedRect(margin, y, contentWidth, 13, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.1);
        pdf.setTextColor(...group.pdfAccent);
        pdf.text(group.title, margin + 4, y + 5.5);
        pdf.setFontSize(6.4);
        pdf.setTextColor(76, 91, 82);
        const sectionDescription = pdf.splitTextToSize(group.description, contentWidth - 37).slice(0, 1);
        pdf.text(sectionDescription, margin + 4, y + 10.2);
        pdf.setFontSize(8.4);
        pdf.setTextColor(...group.pdfAccent);
        pdf.text(String(items.length), pageWidth - margin - 4, y + 6.5, { align: 'right' });
        pdf.link(margin, y, contentWidth, 13, { url: WEB_OPTIONS_URL });
        y += 15;

        for (const option of items) {
          if (y + cardHeight > bottomLimit) {
            startNewPage();
            y = 35;
          }
          overallNumber += 1;
          const titleLines = pdf.splitTextToSize(option.collegeName, contentWidth - 55).slice(0, 2);
          const branchLine = pdf.splitTextToSize(option.branchCode + ' · ' + option.branchName, contentWidth - 16).slice(0, 1);
          const x = margin;
          pdf.setDrawColor(218, 226, 220);
          pdf.setLineWidth(0.32);
          // Outline-only option cards keep the repeating watermark visible beneath the content.
          pdf.roundedRect(x, y, contentWidth, cardHeight, 2, 2, 'S');
          pdf.setDrawColor(...group.pdfAccent);
          pdf.setLineWidth(1.15);
          pdf.line(x + 1, y + 3, x + 1, y + cardHeight - 3);

          pdf.setFillColor(...group.pdfTint);
          pdf.roundedRect(x + 4, y + 4, 8, 8, 1.6, 1.6, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(...group.pdfAccent);
          pdf.text(String(overallNumber).padStart(2, '0'), x + 8, y + 9.2, { align: 'center' });

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.2);
          pdf.setTextColor(30, 48, 39);
          pdf.text(titleLines, x + 15, y + 6.5);
          pdf.setFontSize(5.7);
          pdf.setTextColor(...group.pdfAccent);
          pdf.textWithLink('OPEN', pageWidth - margin - 4, y + 6.5, { url: WEB_OPTIONS_URL, align: 'right' });

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.4);
          pdf.setTextColor(77, 94, 83);
          pdf.text(branchLine, x + 15, y + 14.6);

          pdf.setFontSize(6);
          pdf.setTextColor(102, 116, 106);
          pdf.text('District: ' + (option.district || 'Not listed in rank index') + (option.isUserPriority ? '  ·  YOUR PRIORITY' : ''), x + 15, y + 20.1);

          const cutoffText = option.closingRank ? formatRank(option.closingRank) : 'Not available';
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6.2);
          pdf.setTextColor(49, 69, 56);
          pdf.text('2026 historical closing rank: ' + cutoffText, x + 15, y + 25.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(5.7);
          pdf.setTextColor(105, 116, 107);
          let contextText = 'No matching closing-rank value for these filters';
          if (option.observedStatus === 'within' && option.closingRank) {
            contextText = 'Entered rank is within the observed range; this is not a seat guarantee';
          } else if (option.observedStatus === 'beyond' && option.closingRank) {
            contextText = 'Entered rank is ' + formatRank(option.profileRank - option.closingRank) + ' places beyond the observed closing rank';
          }
          pdf.text(pdf.splitTextToSize(contextText, contentWidth - 20).slice(0, 1), x + 15, y + 29);
          pdf.link(x, y, contentWidth, cardHeight, { url: WEB_OPTIONS_URL });
          y += cardHeight + cardGap;
        }
      }

      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setDrawColor(218, 228, 220);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);
        pdf.setTextColor(56, 95, 69);
        pdf.textWithLink('NAACOLLEGE.IN  ·  OPEN WEB OPTIONS', margin, pageHeight - 7, { url: WEB_OPTIONS_URL });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(119, 132, 122);
        pdf.text('Page ' + page + ' of ' + pageCount, pageWidth - margin, pageHeight - 7, { align: 'right' });
        pdf.link(margin, pageHeight - 11, contentWidth, 8, { url: WEB_OPTIONS_URL });
      }

      pdf.save('Naa-College-AP-EAPCET-Web-Options.pdf');
      setCopyMessage('Premium Naa College PDF downloaded. It includes the logo, repeated watermark, four option groups and clickable links back to the Web Options Builder.');
    } catch (error) {
      setCopyMessage(error instanceof Error ? 'PDF export failed: ' + error.message : 'PDF export failed. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyOptions = async () => {
    if (!generatedOptions.length || isGeneratedDraftOutdated) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
      await navigator.clipboard.writeText(makeExportText(generatedOptions, generatedProfile));
      setCopyMessage('Priority list copied. You can paste it into your notes and enter the choices on the official counselling portal.');
    } catch {
      setCopyMessage('Clipboard access was blocked. Use Download .txt to save the generated preference list instead.');
    }
  };

  const downloadOptions = () => {
    if (!generatedOptions.length || isGeneratedDraftOutdated) return;
    const file = new Blob([makeExportText(generatedOptions, generatedProfile)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'naa-college-ap-web-options.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setCopyMessage('Your preference draft has been downloaded as a text file.');
  };

  return (
    <main className="ap-web-options">
      <header className="apwo-hero">
        <div className="apwo-hero-glow apwo-hero-glow-one" aria-hidden="true" />
        <div className="apwo-hero-glow apwo-hero-glow-two" aria-hidden="true" />
        <div className="apwo-hero-inner">
          <div className="apwo-kicker"><span className="apwo-kicker-icon"><ListOrdered size={16} /></span> AP EAPCET 2027 · ADMISSION PLANNING</div>
          <h1>Build your <span>web options.</span></h1>
          <p>Prepare an editable college-and-branch preference list for 2027 admissions using available 2026 historical allotment ranks. Official 2027 closing-rank data is not assumed or invented.</p>
          <div className="apwo-hero-pills">
            <span><ShieldCheck size={15} /> Historical data labelled clearly</span>
            <span><MapPin size={15} /> District-aware</span>
            <span><ListOrdered size={15} /> Your order comes first</span>
          </div>
        </div>
        <div className="apwo-hero-art" aria-hidden="true">
          <div className="apwo-art-orbit apwo-art-orbit-one" /><div className="apwo-art-orbit apwo-art-orbit-two" />
          <div className="apwo-art-board">
            <div className="apwo-art-board-top"><span /><span /><span /><b>MY OPTIONS</b></div>
            <div className="apwo-art-row apwo-art-row-active"><i>01</i><span /><Check size={15} /></div>
            <div className="apwo-art-row"><i>02</i><span /><ArrowRight size={14} /></div>
            <div className="apwo-art-row"><i>03</i><span /><ArrowRight size={14} /></div>
            <div className="apwo-art-footer"><Sparkles size={14} /> RANK · BRANCH · DISTRICT</div>
          </div>
        </div>
      </header>

      <section className="apwo-rule-note" aria-label="How priority order works">
        <span className="apwo-rule-icon"><Target size={19} /></span>
        <div>
          <strong>Your own priorities come first. Automatic options follow the observed rank data.</strong>
          <p>Add any college-and-branch combination you personally prefer; it will stay at the top because you chose it, not because the tool promotes a particular college. Automatic suggestions are sorted by the matching 2026 closing-rank data within each section.</p>
        </div>
      </section>

      {isLoadingData ? (
        <section className="apwo-state-card" role="status"><RefreshCw className="apwo-spin" size={22} /><div><strong>Loading the existing AP rank data…</strong><p>Reading available college, district, branch and closing-rank entries from Naa College.</p></div></section>
      ) : dataError ? (
        <section className="apwo-state-card apwo-state-error" role="alert"><AlertCircle size={23} /><div className="apwo-state-copy"><strong>Rank data could not be loaded</strong><p>{dataError}</p><button type="button" className="apwo-secondary-button" onClick={() => void loadDataset()}><RefreshCw size={15} /> Retry loading data</button></div></section>
      ) : (
        <>
          <div className="apwo-dataset-strip">
            <div><strong>{sourceColleges.length.toLocaleString('en-IN')}</strong><span>colleges in the loaded rank index</span></div>
            <div><strong>{districts.length.toLocaleString('en-IN')}</strong><span>district labels found</span></div>
            <div><strong>{branches.length.toLocaleString('en-IN')}</strong><span>branch codes found</span></div>
            <div className="apwo-dataset-tag"><BadgeCheck size={16} /><span>Loaded from the existing 2026 data file</span></div>
          </div>

          <form className="apwo-builder-form" onSubmit={handleGenerate}>
            <section className="apwo-panel">
              <div className="apwo-panel-heading"><span className="apwo-step-number">01</span><div><h2>Your rank profile</h2><p>These filters control which historical closing-rank entries can be compared with your rank.</p></div></div>
              <div className="apwo-profile-grid">
                <label className="apwo-field apwo-rank-field"><span>AP EAPCET rank <b>*</b></span><input inputMode="numeric" type="number" min="1" max="350000" step="1" value={rankInput} onChange={(event) => setRankInput(event.target.value)} placeholder="e.g. 24500" aria-invalid={Boolean(rankError)} aria-describedby={rankError ? 'apwo-rank-error' : undefined} />{rankError && <small id="apwo-rank-error" className="apwo-field-error">{rankError}</small>}</label>
                <label className="apwo-field"><span>Community / category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{AP_SOCIAL_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <fieldset className="apwo-field apwo-gender-field"><legend>Gender</legend><div className="apwo-segmented"><button type="button" aria-pressed={gender === 'M'} className={gender === 'M' ? 'is-selected' : ''} onClick={() => setGender('M')}>Male</button><button type="button" aria-pressed={gender === 'F'} className={gender === 'F' ? 'is-selected' : ''} onClick={() => setGender('F')}>Female</button></div></fieldset>
                <label className="apwo-field"><span>Local area / region</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{AP_REGION_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label className="apwo-field"><span>Special category</span><select value={specialCategory} onChange={(event) => setSpecialCategory(event.target.value)}>{AP_SPECIAL_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              </div>
              <div className="apwo-inline-note"><Info size={15} /><span>Category, gender, region and special-category matching use the same AP predictor rank-index rules. If no eligible closing-rank entry exists for a choice, we show that clearly instead of inventing one.</span></div>
            </section>

            <section className="apwo-panel">
              <div className="apwo-panel-heading"><span className="apwo-step-number">02</span><div><h2>Where and what would you like to study?</h2><p>Choose one or more filters for automatically suggested alternatives. Leave a filter empty to include all values present in the loaded index.</p></div></div>
              <div className="apwo-filter-grid">
                <div className="apwo-filter-block">
                  <div className="apwo-filter-title"><span>Preferred districts</span><button type="button" onClick={() => { setSelectedDistricts([]); setDistrictSearch(''); }}>All districts</button></div>
                  <label className="apwo-search-field"><Search size={15} /><input value={districtSearch} onChange={(event) => setDistrictSearch(event.target.value)} placeholder="Search district names in the data" aria-label="Search available districts" />{districtSearch && <button type="button" onClick={() => setDistrictSearch('')} aria-label="Clear district search"><X size={14} /></button>}</label>
                  <div className="apwo-choice-list apwo-district-list">
                    {filteredDistricts.map((district) => <label key={district} className={'apwo-check-row' + (selectedDistricts.includes(district) ? ' is-selected' : '')}><input type="checkbox" checked={selectedDistricts.includes(district)} onChange={() => toggleDistrict(district)} /><span className="apwo-check-mark"><Check size={12} /></span><span>{district}</span></label>)}
                    {!filteredDistricts.length && <p className="apwo-empty-small">No district in the loaded index matches that search.</p>}
                  </div>
                  <small className="apwo-filter-hint">{selectedDistricts.length ? String(selectedDistricts.length) + ' district' + (selectedDistricts.length === 1 ? '' : 's') + ' selected' : 'No district filter — search all districts in the index.'}</small>
                </div>
                <div className="apwo-filter-block">
                  <div className="apwo-filter-title"><span>Preferred branches</span><button type="button" onClick={() => { setSelectedBranches([]); setBranchSearch(''); }}>All branches</button></div>
                  <label className="apwo-search-field"><Search size={15} /><input value={branchSearch} onChange={(event) => setBranchSearch(event.target.value)} placeholder="Search branch name or code" aria-label="Search available branch codes" />{branchSearch && <button type="button" onClick={() => setBranchSearch('')} aria-label="Clear branch search"><X size={14} /></button>}</label>
                  <div className="apwo-choice-list apwo-branch-list">
                    {filteredBranches.map((item) => <label key={item.code} className={'apwo-check-row apwo-branch-check' + (selectedBranches.includes(item.code) ? ' is-selected' : '')}><input type="checkbox" checked={selectedBranches.includes(item.code)} onChange={() => toggleBranch(item.code)} /><span className="apwo-check-mark"><Check size={12} /></span><span className="apwo-branch-label"><strong>{item.code}</strong><small>{item.name}</small></span></label>)}
                    {!filteredBranches.length && <p className="apwo-empty-small">No branch in the loaded index matches that search.</p>}
                  </div>
                  <small className="apwo-filter-hint">{selectedBranches.length ? String(selectedBranches.length) + ' branch code' + (selectedBranches.length === 1 ? '' : 's') + ' selected' : 'No branch filter — all branch codes found in the index can be suggested.'}</small>
                </div>
              </div>
            </section>

            <section className="apwo-panel apwo-priority-panel">
              <div className="apwo-panel-heading"><span className="apwo-step-number">03</span><div><h2>Put your dream choices first</h2><p>Add exact college-and-branch pairs in your personal preference order. These stay above alternatives, even when the rank is beyond the observed closing rank.</p></div></div>
              <div className="apwo-priority-add">
                <label className="apwo-field apwo-priority-college"><span>Search preferred college</span><input value={priorityCollegeSearch} onChange={(event) => setPriorityCollegeSearch(event.target.value)} placeholder="Search college name, code or district" aria-label="Search colleges for personal priority" /><select value={priorityCollegeCode} onChange={(event) => { const code = event.target.value; setPriorityCollegeCode(code); setPriorityBranchCode(sourceColleges.find((item) => item.code === code)?.branches[0]?.code || ''); }} aria-label="Choose a college">{priorityCollegeChoices.map((college) => <option key={college.code} value={college.code}>{college.name + ' · ' + college.code + (college.district ? ' · ' + college.district : '')}</option>)}</select></label>
                <label className="apwo-field"><span>Choose branch</span><select value={priorityBranchCode} onChange={(event) => setPriorityBranchCode(event.target.value)} aria-label="Choose a branch at the selected college" disabled={!priorityBranchChoices.length}>{priorityBranchChoices.map((item) => <option key={item.code} value={item.code}>{item.code + ' — ' + item.name}</option>)}</select></label>
                <button type="button" className="apwo-add-priority" onClick={addPriorityChoice} disabled={!priorityCollegeCode || !priorityBranchCode || priorityChoices.length >= MAX_PRIORITY_CHOICES}><Plus size={17} /> Add priority</button>
              </div>
              {priorityError && <p className="apwo-priority-error" role="alert"><AlertCircle size={14} /> {priorityError}</p>}
              <div className="apwo-priority-list-wrap">
                <div className="apwo-priority-list-heading"><strong>Your priority order</strong><span>{priorityChoices.length} / {MAX_PRIORITY_CHOICES}</span></div>
                {priorityChoices.length ? <ol className="apwo-priority-list">{priorityChoices.map((choice, index) => (
                  <li key={choice.id} className="apwo-priority-item">
                    <span className="apwo-option-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="apwo-priority-identity"><strong>{choice.collegeName}</strong><small>{choice.branchCode + ' · ' + choice.branchName + (choice.district ? ' · ' + choice.district : '')}</small></span>
                    <span className="apwo-priority-label">YOUR PRIORITY</span>
                    <span className="apwo-row-actions"><button type="button" onClick={() => movePriorityChoice(index, 'up')} disabled={index === 0} aria-label={'Move ' + choice.collegeName + ' ' + choice.branchCode + ' up'} title="Move up"><ArrowUp size={15} /></button><button type="button" onClick={() => movePriorityChoice(index, 'down')} disabled={index === priorityChoices.length - 1} aria-label={'Move ' + choice.collegeName + ' ' + choice.branchCode + ' down'} title="Move down"><ArrowDown size={15} /></button><button type="button" onClick={() => setPriorityChoices((current) => current.filter((item) => item.id !== choice.id))} aria-label={'Remove ' + choice.collegeName + ' ' + choice.branchCode} title="Remove"><Trash2 size={15} /></button></span>
                  </li>
                ))}</ol> : <div className="apwo-priority-empty"><Sparkles size={19} /><span><strong>No dream choices added yet</strong><small>Add a college and branch to keep it at the top, regardless of rank context. The builder can also generate alternatives from your filters.</small></span></div>}
              </div>
            </section>

            <div className="apwo-generate-row"><div className="apwo-generate-copy"><strong>Ready to build your preference list?</strong><small>Personal priority choices stay first; data-backed alternatives follow.</small></div><button type="submit" className="apwo-generate-button" disabled={isGenerating || isLoadingData || Boolean(dataError)}>{isGenerating ? <><RefreshCw size={18} className="apwo-spin" /> Building from 2026 data…</> : <><Sparkles size={18} /> Generate web options <ArrowRight size={17} /></>}</button></div>
            {generationError && <div className="apwo-generation-error" role="alert"><AlertCircle size={17} /><span>{generationError}</span></div>}
          </form>

          {generatedProfile && <section className="apwo-results" aria-labelledby="apwo-results-heading">
            <div className="apwo-results-head"><div><span className="apwo-results-kicker"><CheckCircle2 size={15} /> YOUR OPTIONS DRAFT IS READY</span><h2 id="apwo-results-heading">Your priority ladder</h2><p>{'Rank ' + formatRank(generatedProfile.rank) + ' · ' + generatedProfile.category + ' · ' + (generatedProfile.gender === 'M' ? 'Male' : 'Female') + ' · ' + generatedProfile.region + ' · Special: ' + generatedProfile.specialCategory}</p></div><div className="apwo-results-actions"><button type="button" className="apwo-pdf-button" onClick={() => void downloadPdfOptions()} disabled={!generatedOptions.length || isExportingPdf || isGeneratedDraftOutdated}>{isExportingPdf ? <><RefreshCw size={15} className="apwo-spin" /> Preparing PDF…</> : <><FileDown size={15} /> Download premium PDF</>}</button><button type="button" className="apwo-secondary-button" onClick={() => void copyOptions()} disabled={!generatedOptions.length || isGeneratedDraftOutdated}><Copy size={15} /> Copy list</button><button type="button" className="apwo-download-button" onClick={downloadOptions} disabled={!generatedOptions.length || isGeneratedDraftOutdated}><Download size={15} /> Download .txt</button></div></div>
            {isGeneratedDraftOutdated && <div className="apwo-stale-draft-note" role="status"><Info size={16} /><span><strong>Your inputs have changed.</strong> This list remains visible so the page does not jump while you choose filters. It reflects your previous profile; press Generate Web Options again before copying or downloading.</span></div>}
            <div className="apwo-results-summary"><div><strong>{generatedOptions.length}</strong><span>options in current order</span></div><div><strong>{generatedOptions.filter((option) => option.isUserPriority).length}</strong><span>your priority choices</span></div><div><strong>{generatedOptions.filter((option) => !option.isUserPriority).length}</strong><span>data-backed alternatives shown</span></div></div>
            <div className="apwo-observed-note"><Info size={16} /><span>No college is promoted just because of its name. Automatic options are ordered using the matching 2026 closing rank for the selected branch and candidate filters; lower closing ranks appear first within each section. This is a branch-demand signal from historical allotments, not an overall college-quality score. Your manually selected choices appear first only because you explicitly chose them.</span></div>
            {generatedOptions.length ? WEB_OPTION_GROUPS.map((group) => {
              const groupOptions = generatedOptions.filter((item) => item.groupKey === group.key);
              if (!groupOptions.length) return null;
              return <section key={group.key} className={'apwo-result-group apwo-group-' + group.key}>
                <header className={'apwo-result-group-heading apwo-heading-' + group.key}>
                  <div className="apwo-result-group-copy">
                    <span className="apwo-result-group-badge">{group.badge}</span>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span className="apwo-result-group-count">{groupOptions.length}</span>
                </header>
                <ol className="apwo-generated-list">{groupOptions.map((option, groupIndex) => {
                  const index = generatedOptions.findIndex((item) => item.id === option.id);
                  const gap = option.closingRank ? option.profileRank - option.closingRank : null;
                  return <li key={option.id + (option.isUserPriority ? '-priority' : '-suggestion')} className={'apwo-generated-item' + (option.isUserPriority ? ' is-priority' : '')}>
                    <span className={'apwo-generated-number' + (option.isUserPriority ? ' is-priority-number' : '')}>{String(index + 1).padStart(2, '0')}</span>
                    <div className="apwo-generated-main">
                      <div className="apwo-generated-overline">{option.isUserPriority ? <span className="apwo-top-badge"><Sparkles size={12} /> YOUR PRIORITY</span> : <span className="apwo-alt-badge">DATA-BACKED ALTERNATIVE</span>}{option.district && <span className="apwo-location-pill"><MapPin size={12} /> {option.district}</span>}</div>
                      <h3>{option.collegeName}</h3><p className="apwo-generated-branch">{option.branchCode} <span>·</span> {option.branchName}</p>
                      <div className="apwo-observed-line">
                        {option.observedStatus === 'within' ? <span className="apwo-status apwo-status-within"><CheckCircle2 size={14} /> {statusLabel.within}</span> : option.observedStatus === 'beyond' ? <span className="apwo-status apwo-status-beyond"><Target size={14} /> {statusLabel.beyond}</span> : <span className="apwo-status apwo-status-missing"><Info size={14} /> {statusLabel.missing}</span>}
                        {option.closingRank ? <span className="apwo-closing-rank">2026 observed closing rank <strong>{formatRank(option.closingRank)}</strong></span> : <span className="apwo-no-cutoff">No eligible closing-rank value returned for these filters</span>}
                        {option.matchedRecords > 0 && <span className="apwo-record-count">{option.matchedRecords.toLocaleString('en-IN')} matching observations</span>}
                      </div>
                      {option.observedStatus === 'beyond' && gap !== null && <p className="apwo-gap-detail">{'Your entered rank is ' + formatRank(gap) + ' places beyond the observed closing rank. ' + (option.isUserPriority ? 'Kept here because you explicitly prioritised this choice.' : 'Included as an aspirational comparison; future allotment is not predictable from this value alone.')}</p>}
                      {option.observedStatus === 'within' && option.closingRank && <p className="apwo-gap-detail">{formatRank(option.closingRank - option.profileRank) + ' rank places between your entered rank and the observed closing rank. This historical comparison is not a seat guarantee.'}</p>}
                      {option.observedStatus === 'missing' && <p className="apwo-gap-detail">This college and branch exists in the loaded selector, but the selected candidate filters did not return a usable closing-rank value. No rank value is inferred or filled in.</p>}
                    </div>
                    <div className="apwo-generated-actions"><button type="button" onClick={() => moveGeneratedOption(index, 'up')} disabled={groupIndex === 0} aria-label={'Move option ' + (index + 1) + ' up'} title="Move up within this section"><ArrowUp size={16} /></button><button type="button" onClick={() => moveGeneratedOption(index, 'down')} disabled={groupIndex === groupOptions.length - 1} aria-label={'Move option ' + (index + 1) + ' down'} title="Move down within this section"><ArrowDown size={16} /></button><button type="button" onClick={() => setGeneratedOptions((current) => current.filter((item) => item.id !== option.id))} aria-label={'Remove option ' + (index + 1)} title="Remove option"><X size={16} /></button></div>
                  </li>;
                })}</ol>
              </section>;
            }) : <div className="apwo-no-results"><Search size={23} /><strong>No options matched the selected filters.</strong><p>Change your district or branch filters, add a personal priority choice, and generate again.</p></div>}
            {generatedProfile.totalFilteredMatches > generatedProfile.displayedAlternatives && <p className="apwo-truncation-note">{'Showing ' + generatedProfile.displayedAlternatives + ' of ' + generatedProfile.totalFilteredMatches.toLocaleString('en-IN') + ' eligible data-backed alternatives, in addition to your priority choices. Refine district or branch filters to narrow the list.'}</p>}
            {copyMessage && <p className="apwo-copy-status" role="status"><CheckCircle2 size={15} /> {copyMessage}</p>}
            <div className="apwo-results-footer"><ShieldCheck size={17} /><p>Use this editable draft to organise your preferences. It does not log in to, or submit choices on, the official AP EAPCET counselling portal. Review the current counselling instructions before submission.</p></div>
          </section>}
        </>
      )}
      <section className="apwo-guide" id="apwo-guide" aria-labelledby="apwo-guide-title">
        <header className="apwo-guide-header">
          <span className="apwo-guide-eyebrow"><BookOpenCheck size={15} /> STUDENT GUIDE · 2027 ADMISSION PLANNING</span>
          <h2 id="apwo-guide-title">Understand your AP EAPCET web options</h2>
          <p>This planner helps organise preferences using the rank records currently available on Naa College. It does not invent official 2027 cutoffs or decide which college is best for every student.</p>
        </header>
        <div className="apwo-guide-stats">
          <div><strong>{PLANNING_YEAR}</strong><span>admission planning year</span></div>
          <div><strong>{HISTORICAL_DATA_YEAR}</strong><span>historical rank dataset used</span></div>
          <div><strong>4 groups</strong><span>rank-context categories</span></div>
        </div>
        <section className="apwo-guide-section">
          <h3>What is this tool?</h3>
          <p>The AP EAPCET Web Options Builder turns your rank profile and stated preferences into an editable list of college-and-branch combinations. It reads college names, branch codes, district labels and observed closing-rank information from Naa College’s existing AP rank index. It is a planning and comparison aid—not an official counselling portal or a promise of admission.</p>
        </section>
        <section className="apwo-guide-section">
          <h3>How to use it — step by step</h3>
          <ol className="apwo-guide-steps">
            <li><span>01</span><div><strong>Enter your AP EAPCET rank</strong><p>Use your actual rank when you have it. If you are planning before the {PLANNING_YEAR} results, treat any entered number as a scenario, not a rank prediction.</p></div></li>
            <li><span>02</span><div><strong>Select category, gender, region and special category</strong><p>These fields control how the existing quota-closing data is matched. Choose the options that genuinely apply to your counselling profile.</p></div></li>
            <li><span>03</span><div><strong>Filter districts and branches</strong><p>Search and select only the locations and branches you would consider. Leave filters open to explore more of the records present in the index.</p></div></li>
            <li><span>04</span><div><strong>Add your own priority colleges, if you want</strong><p>Search for an exact college and branch and add it to your preference order. Move your choices up or down. No college is inserted or boosted just because of its name.</p></div></li>
            <li><span>05</span><div><strong>Generate and review all four sections</strong><p>Automatic entries are separated by their rank-to-closing-rank context and ordered by lower observed branch closing rank first within each section.</p></div></li>
            <li><span>06</span><div><strong>Edit and export the list</strong><p>Reorder or remove options. Download the branded PDF for your notes; links in the document reopen this builder. Enter and verify your final choices yourself on the official counselling portal.</p></div></li>
          </ol>
        </section>
        <section className="apwo-guide-section">
          <h3>Understanding the four option groups</h3>
          <p>The groups below use only the entered rank and the historical closing-rank value returned for the selected category, gender, region and special category. They are not probabilities and do not measure a college’s overall quality.</p>
          <div className="apwo-guide-group-grid">
            {WEB_OPTION_GROUPS.map((group) => <article key={group.key} className={'apwo-guide-group apwo-guide-group-' + group.key}>
              <span className="apwo-guide-group-badge">{group.badge}</span><h4>{group.title}</h4><p>{group.explanation}</p>
              {group.key === 'dream' && <small>Rule: the entered rank is more than 35% beyond the observed closing rank, or the entry is a manual priority without a matching cutoff.</small>}
              {group.key === 'borderline' && <small>Rule: the entered rank is more than 10% but no more than 35% beyond the observed closing rank.</small>}
              {group.key === 'available' && <small>Rule: the rank is within the observed closing rank or up to 10% beyond it, without the larger backup buffer.</small>}
              {group.key === 'safe-backup' && <small>Rule: the observed closing rank is at least 35% higher than the entered rank. This is never a guaranteed seat.</small>}
            </article>)}
          </div>
        </section>
        <section className="apwo-guide-section">
          <h3>How the college order works</h3>
          <ul className="apwo-guide-bullets">
            <li><strong>Your personal choices:</strong> manual priority options stay in your selected order because they reflect your preferences.</li>
            <li><strong>Automatic options:</strong> no institution has a fixed boost. Within each section, lower observed {HISTORICAL_DATA_YEAR} branch closing ranks are shown first. This is a historical demand/selectivity signal for that branch and filter combination, not an overall college ranking.</li>
            <li><strong>Section limits:</strong> up to 30 automatic suggestions appear per group. The most selective observed closing-rank combinations are retained first; change filters to explore different combinations.</li>
            <li><strong>No invented entries:</strong> if the loaded index does not contain a college/branch or eligible closing-rank value for your filters, the builder cannot add a made-up record. Manual choices are available only for college-and-branch combinations present in the loaded selector.</li>
          </ul>
        </section>
        <section className="apwo-guide-section apwo-guide-faq">
          <h3>Frequently asked questions</h3>
          <details><summary>Is this tool updated with official AP EAPCET 2027 cutoffs?</summary><p>No. It is designed for {PLANNING_YEAR} admission planning but currently compares available {HISTORICAL_DATA_YEAR} historical allotment data. Official {PLANNING_YEAR} cutoff data is not assumed or fabricated. The data basis should be updated when verified {PLANNING_YEAR} records become available.</p></details>
          <details><summary>Why did a college I expected not appear in my list?</summary><p>Automatic entries must exist in the loaded index, match the selected branch and district filters, and have a usable closing-rank value for your category, gender, region and special-category settings. The builder does not force a college into the list or promote it by name. If the college and branch exist in the selector and you personally want them, add them as a manual priority choice.</p></details>
          <details><summary>Why can a 9,000-rank scenario show colleges under Safe Backup?</summary><p>Safe Backup describes a larger rank buffer, not a ranking of college quality. Within that section, the options are ordered by lower historical branch closing rank first, so more selective observed combinations appear before very late-closing alternatives. Review all four sections before deciding which choices you want to prioritise.</p></details>
          <details><summary>Does “Available for Rank” mean I will definitely get a seat?</summary><p>No. It means only that the entered rank compares favourably with the observed closing-rank value in the current data. Seat availability, future applicants, category rules, counselling round and official {PLANNING_YEAR} cutoffs can change the outcome.</p></details>
          <details><summary>Does “Safe Backup” guarantee admission?</summary><p>No college is guaranteed safe. This label indicates a larger historical numerical buffer only. Include choices you would genuinely be willing to attend and verify official counselling notices.</p></details>
          <details><summary>Why does the builder ask for category, gender and region?</summary><p>The underlying index contains quota-specific records. These inputs let the existing AP predictor engine choose eligible closing-rank observations. If no matching record exists, the builder shows no matching cutoff instead of inventing one.</p></details>
          <details><summary>Can I submit these options directly to APSCHE?</summary><p>No. The builder creates an editable planning draft. It does not log in to, save choices to or submit forms to the official counselling site. Enter your final preference order on the official portal during the relevant counselling window.</p></details>
          <details><summary>Can I download or share my preferences?</summary><p>Yes. After generating a fresh list, use “Download premium PDF” for a Naa College-branded PDF with the logo, repeated watermark, grouped options and clickable links back to the builder. Copy and text-download options are also available.</p></details>
        </section>
        <aside className="apwo-guide-disclaimer">
          <ShieldCheck size={20} />
          <div><h3>Data source, limitations and important disclaimer</h3>
            <p><strong>Data basis:</strong> the existing AP EAPCET {HISTORICAL_DATA_YEAR} quota-closing-rank index in Naa College and its category/gender/region/special-category matching logic. No handpicked institution order is applied.</p>
            <p><strong>{PLANNING_YEAR} status:</strong> this is a planning tool for the {PLANNING_YEAR} admission cycle using historical {HISTORICAL_DATA_YEAR} observations. It is not a {PLANNING_YEAR} allotment dataset, official cutoff release, personalised counselling advice or admission guarantee.</p>
            <p><strong>Before submission:</strong> verify current official AP EAPCET/APSCHE counselling notices, eligibility rules, seat matrices, fees, choice-entry deadlines and reporting instructions. The official authority’s latest notice takes precedence over this draft.</p>
          </div>
        </aside>
        <p className="apwo-guide-source-note">Naa College · AP EAPCET {PLANNING_YEAR} admission planning · Rank reference currently available: {HISTORICAL_DATA_YEAR} · Verify official counselling information.</p>
      </section>
      <footer className="apwo-page-footer"><GraduationCap size={18} /><span>For AP EAPCET 2027 admission planning · historical 2026 rank data · your preferences remain yours.</span></footer>
    </main>
  );
};

export default ApWebOptionsBuilder;
