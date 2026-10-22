import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle, ArrowDown, ArrowRight, ArrowUp, BadgeCheck, Check, CheckCircle2,
  ClipboardCheck, Copy, Download, GraduationCap, Info, ListOrdered, MapPin, Plus,
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
interface GeneratedOption extends PriorityChoice {
  closingRank: number | null; matchedRecords: number; isUserPriority: boolean;
  observedStatus: ObservedStatus; profileRank: number; category: string;
  gender: 'M' | 'F'; region: string; specialCategory: string;
}
interface GeneratedProfile {
  rank: number; category: string; gender: 'M' | 'F'; region: string; specialCategory: string;
  districts: string[]; branches: string[]; totalFilteredMatches: number;
  displayedAlternatives: number; priorityCount: number;
}

const MAX_PRIORITY_CHOICES = 30;
const MAX_AUTO_OPTIONS = 60;
const formatRank = (value: number) => Math.round(value).toLocaleString('en-IN');
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
          const quotaCount = Object.values(quotas).reduce((total: number, quota: any) => total + Math.max(0, Number(quota?.count) || 0), 0);
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

  useEffect(() => {
    setGeneratedOptions([]);
    setGeneratedProfile(null);
    setCopyMessage('');
  }, [rankInput, category, gender, region, specialCategory, selectedDistricts, selectedBranches, priorityChoices]);

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
    setGeneratedOptions([]);
    setGeneratedProfile(null);
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
      const matchById = new Map<string, ApCollegeBranchMatch>(response.matches.map((match) => [match.id, match]));
      const toGeneratedOption = (choice: PriorityChoice, isUserPriority: boolean): GeneratedOption => {
        const match = matchById.get(choice.id);
        const closingRank = match && match.closingRank > 0 ? match.closingRank : null;
        return {
          ...choice, closingRank, matchedRecords: match?.matchingRecordCount || 0,
          isUserPriority, observedStatus: getObservedStatus(rank, closingRank),
          profileRank: rank, category, gender, region, specialCategory,
        };
      };

      // Keep the student's explicit preference order; historical rank context never silently demotes a dream choice.
      const priorityIds = new Set(priorityChoices.map((choice) => choice.id));
      const priorityOptions = priorityChoices.map((choice) => toGeneratedOption(choice, true));
      const alternativeMatches = response.matches.filter((match) => {
        if (!match.closingRank || match.closingRank < 1 || priorityIds.has(match.id)) return false;
        if (selectedDistricts.length && !selectedDistricts.includes(match.district)) return false;
        if (selectedBranches.length && !selectedBranches.includes(match.branchCode)) return false;
        return true;
      }).sort((a, b) => {
        const aWithin = rank <= a.closingRank;
        const bWithin = rank <= b.closingRank;
        if (aWithin !== bWithin) return aWithin ? -1 : 1;
        if (aWithin && bWithin) {
          const diff = b.closingRank - a.closingRank;
          if (diff !== 0) return diff;
        } else {
          const aBeyond = rank - a.closingRank;
          const bBeyond = rank - b.closingRank;
          if (aBeyond !== bBeyond) return aBeyond - bBeyond;
        }
        if (selectedBranches.length) {
          const difference = selectedBranches.indexOf(a.branchCode) - selectedBranches.indexOf(b.branchCode);
          if (difference !== 0) return difference;
        }
        return a.collegeName.localeCompare(b.collegeName) || a.branchName.localeCompare(b.branchName);
      });

      const alternativeOptions = alternativeMatches.slice(0, MAX_AUTO_OPTIONS).map((match) => toGeneratedOption({
        id: match.id, collegeCode: match.collegeCode, collegeName: match.collegeName,
        district: match.district, branchCode: match.branchCode, branchName: match.branchName,
      }, false));
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
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Could not generate the web options from the 2026 rank index.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyOptions = async () => {
    if (!generatedOptions.length) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
      await navigator.clipboard.writeText(makeExportText(generatedOptions, generatedProfile));
      setCopyMessage('Priority list copied. You can paste it into your notes and enter the choices on the official counselling portal.');
    } catch {
      setCopyMessage('Clipboard access was blocked. Use Download .txt to save the generated preference list instead.');
    }
  };

  const downloadOptions = () => {
    if (!generatedOptions.length) return;
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
          <div className="apwo-kicker"><span className="apwo-kicker-icon"><ListOrdered size={16} /></span> AP EAPCET 2026 · PRIORITY PLANNER</div>
          <h1>Build your <span>web options.</span></h1>
          <p>Turn your rank and preferences into an editable college-and-branch priority list, grounded in the AP EAPCET 2026 rank data already available on Naa College.</p>
          <div className="apwo-hero-pills">
            <span><ShieldCheck size={15} /> Existing dataset only</span>
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
          <strong>Your preferred college can stay at the top—even if your rank is beyond its observed closing rank.</strong>
          <p>We keep your manually ordered choices first and show their historical rank context honestly. Alternatives are listed afterward. Nothing here is an official seat guarantee or a submitted counselling form.</p>
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
            <div className="apwo-results-head"><div><span className="apwo-results-kicker"><CheckCircle2 size={15} /> YOUR OPTIONS DRAFT IS READY</span><h2 id="apwo-results-heading">Your priority ladder</h2><p>{'Rank ' + formatRank(generatedProfile.rank) + ' · ' + generatedProfile.category + ' · ' + (generatedProfile.gender === 'M' ? 'Male' : 'Female') + ' · ' + generatedProfile.region + ' · Special: ' + generatedProfile.specialCategory}</p></div><div className="apwo-results-actions"><button type="button" className="apwo-secondary-button" onClick={() => void copyOptions()} disabled={!generatedOptions.length}><Copy size={15} /> Copy list</button><button type="button" className="apwo-download-button" onClick={downloadOptions} disabled={!generatedOptions.length}><Download size={15} /> Download .txt</button></div></div>
            <div className="apwo-results-summary"><div><strong>{generatedOptions.length}</strong><span>options in current order</span></div><div><strong>{generatedProfile.priorityCount}</strong><span>your priority choices</span></div><div><strong>{generatedProfile.displayedAlternatives}</strong><span>data-backed alternatives shown</span></div></div>
            <div className="apwo-observed-note"><Info size={16} /><span>Your chosen priority order is preserved. Alternatives sort using only the rank index: options within observed closing rank first, then options beyond the observed closing rank with the smallest rank gap. This is not a college-quality ranking or a probability estimate.</span></div>
            {generatedOptions.length ? <ol className="apwo-generated-list">{generatedOptions.map((option, index) => {
              const gap = option.closingRank ? option.profileRank - option.closingRank : null;
              return <li key={option.id + (option.isUserPriority ? '-priority' : '-suggestion')} className={'apwo-generated-item' + (option.isUserPriority ? ' is-priority' : '')}>
                <span className={'apwo-generated-number' + (option.isUserPriority ? ' is-priority-number' : '')}>{String(index + 1).padStart(2, '0')}</span>
                <div className="apwo-generated-main">
                  <div className="apwo-generated-overline">{option.isUserPriority ? <span className="apwo-top-badge"><Sparkles size={12} /> YOUR PRIORITY</span> : <span className="apwo-alt-badge">DATA-BACKED ALTERNATIVE</span>}{option.district && <span className="apwo-location-pill"><MapPin size={12} /> {option.district}</span>}</div>
                  <h3>{option.collegeName}</h3><p className="apwo-generated-branch">{option.branchCode} <span>·</span> {option.branchName}</p>
                  <div className="apwo-observed-line">
                    {option.observedStatus === 'within' ? <span className="apwo-status apwo-status-within"><CheckCircle2 size={14} /> {statusLabel.within}</span> : option.observedStatus === 'beyond' ? <span className="apwo-status apwo-status-beyond"><Target size={14} /> {statusLabel.beyond}</span> : <span className="apwo-status apwo-status-missing"><Info size={14} /> {statusLabel.missing}</span>}
                    {option.closingRank ? <span className="apwo-closing-rank">2026 observed closing rank <strong>{formatRank(option.closingRank)}</strong></span> : <span className="apwo-no-cutoff">No eligible closing-rank value returned for these filters</span>}
                  </div>
                  {option.observedStatus === 'beyond' && gap !== null && <p className="apwo-gap-detail">{'Your entered rank is ' + formatRank(gap) + ' places beyond the observed closing rank. ' + (option.isUserPriority ? 'Kept here because you explicitly prioritised this choice.' : 'Included as an alternative for comparison; future allotment is not predictable from this value alone.')}</p>}
                  {option.observedStatus === 'within' && option.closingRank && <p className="apwo-gap-detail">{formatRank(option.closingRank - option.profileRank) + ' rank places between your entered rank and the observed closing rank. This historical comparison is not a seat guarantee.'}</p>}
                  {option.observedStatus === 'missing' && <p className="apwo-gap-detail">This college and branch exists in the loaded selector, but the selected candidate filters did not return a usable closing-rank value. No rank value is inferred or filled in.</p>}
                </div>
                <div className="apwo-generated-actions"><button type="button" onClick={() => moveGeneratedOption(index, 'up')} disabled={index === 0} aria-label={'Move option ' + (index + 1) + ' up'} title="Move option up"><ArrowUp size={16} /></button><button type="button" onClick={() => moveGeneratedOption(index, 'down')} disabled={index === generatedOptions.length - 1} aria-label={'Move option ' + (index + 1) + ' down'} title="Move option down"><ArrowDown size={16} /></button><button type="button" onClick={() => setGeneratedOptions((current) => current.filter((item) => item.id !== option.id))} aria-label={'Remove option ' + (index + 1)} title="Remove option"><X size={16} /></button></div>
              </li>;
            })}</ol> : <div className="apwo-no-results"><Search size={23} /><strong>No options matched the selected filters.</strong><p>Change your district or branch filters, add a personal priority choice, and generate again.</p></div>}
            {generatedProfile.totalFilteredMatches > generatedProfile.displayedAlternatives && <p className="apwo-truncation-note">{'Showing ' + generatedProfile.displayedAlternatives + ' of ' + generatedProfile.totalFilteredMatches.toLocaleString('en-IN') + ' eligible data-backed alternatives, in addition to your priority choices. Refine district or branch filters to narrow the list.'}</p>}
            {copyMessage && <p className="apwo-copy-status" role="status"><CheckCircle2 size={15} /> {copyMessage}</p>}
            <div className="apwo-results-footer"><ShieldCheck size={17} /><p>Use this editable draft to organise your preferences. It does not log in to, or submit choices on, the official AP EAPCET counselling portal. Review the current counselling instructions before submission.</p></div>
          </section>}
        </>
      )}
      <footer className="apwo-page-footer"><GraduationCap size={18} /><span>Built around the available AP EAPCET 2026 rank data · Personal preference order stays yours.</span></footer>
    </main>
  );
};

export default ApWebOptionsBuilder;
