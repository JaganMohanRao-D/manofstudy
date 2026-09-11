import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  BookOpen,
  Code2,
  Copy,
  Check,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Bookmark,
  Share2,
  Flame,
  ArrowRight,
  Eye,
  EyeOff,
  Shuffle,
  Layers,
  Cpu,
  Database,
  Globe,
  Sparkles,
  Filter,
} from 'lucide-react';
import { VIVA_FLASHCARDS, CODE_SNIPPETS } from '../data/placementVaultData';

export const PlacementCodeVault = () => {
  // Tab state: 'viva' (Interview Flashcards) | 'code' (Practical Code Snippets)
  const [activeTab, setActiveTab] = useState('viva');

  // ==========================================
  // FLASHCARD STATE
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vivaSearch, setVivaSearch] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revisedCards, setRevisedCards] = useState(() => {
    try {
      const saved = localStorage.getItem('javisak_revised_viva_cards') || localStorage.getItem('studymacha_revised_viva_cards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save revised cards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('javisak_revised_viva_cards', JSON.stringify(revisedCards));
    } catch (e) {
      console.error('Failed to save revised cards', e);
    }
  }, [revisedCards]);

  const categories = ['All', 'OOPs', 'DBMS', 'OS', 'Computer Networks', 'DSA'];

  // Filtered flashcards
  const filteredFlashcards = useMemo(() => {
    return VIVA_FLASHCARDS.filter((card) => {
      const matchesCat = selectedCategory === 'All' || card.category === selectedCategory;
      const matchesSearch =
        vivaSearch === '' ||
        card.question.toLowerCase().includes(vivaSearch.toLowerCase()) ||
        card.answer.toLowerCase().includes(vivaSearch.toLowerCase()) ||
        card.category.toLowerCase().includes(vivaSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, vivaSearch]);

  // Keep index in range
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, vivaSearch]);

  const currentCard = filteredFlashcards[currentCardIndex] || filteredFlashcards[0];
  const isCurrentRevised = currentCard ? revisedCards.includes(currentCard.id) : false;

  const handleToggleRevised = (cardId) => {
    setRevisedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleNextCard = () => {
    if (filteredFlashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredFlashcards.length);
  };

  const handlePrevCard = () => {
    if (filteredFlashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredFlashcards.length) % filteredFlashcards.length);
  };

  const handleRandomCard = () => {
    if (filteredFlashcards.length <= 1) return;
    setIsFlipped(false);
    let nextIdx = Math.floor(Math.random() * filteredFlashcards.length);
    if (nextIdx === currentCardIndex) {
      nextIdx = (nextIdx + 1) % filteredFlashcards.length;
    }
    setCurrentCardIndex(nextIdx);
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'viva') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, filteredFlashcards.length]);

  // ==========================================
  // CODE SNIPPETS STATE
  // ==========================================
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [codeSearch, setCodeSearch] = useState('');
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);

  const languages = ['All', 'Python', 'C', 'C++'];

  const filteredSnippets = useMemo(() => {
    return CODE_SNIPPETS.filter((item) => {
      const matchesLang = selectedLanguage === 'All' || item.language === selectedLanguage;
      const matchesSearch =
        codeSearch === '' ||
        item.title.toLowerCase().includes(codeSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(codeSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(codeSearch.toLowerCase());
      return matchesLang && matchesSearch;
    });
  }, [selectedLanguage, codeSearch]);

  const handleCopyCode = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedSnippetId(snippet.id);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = snippet.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSnippetId(snippet.id);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% In-Browser Placement & Lab Suite</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              JAVISAK Placement Code Vault &amp; Viva Flashcards
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              50+ high-frequency technical interview viva flashcards across OOPs, DBMS, OS, Networks &amp; DSA, plus 27 self-contained, non-blocking Python, C, and C++ code templates with zero infinite loops.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl text-center shadow-sm">
              <div className="text-2xl font-black text-emerald-400">50</div>
              <div className="text-[11px] text-slate-400 font-medium">Viva Cards</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl text-center shadow-sm">
              <div className="text-2xl font-black text-cyan-400">27</div>
              <div className="text-[11px] text-slate-400 font-medium">Code Templates</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl text-center shadow-sm">
              <div className="text-2xl font-black text-amber-400">0</div>
              <div className="text-[11px] text-slate-400 font-medium">Server Latency</div>
            </div>
          </div>
        </div>

        {/* PRIMARY TAB SWITCHER */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-6">
          <button
            type="button"
            id="tab-viva-flashcards"
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'viva'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interview &amp; Lab Viva Cards (50)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/30 font-mono">
              {revisedCards.length}/50 Revised
            </span>
          </button>

          <button
            type="button"
            id="tab-code-vault"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Practical Code Vault (27 Clean Templates)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/30 font-mono">
              Python • C • C++
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: VIVA FLASHCARDS                                          */}
      {/* ================================================================ */}
      {activeTab === 'viva' && (
        <div className="space-y-6">
          {/* Controls Bar: Category Pills + Search */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vivaSearch}
                onChange={(e) => setVivaSearch(e.target.value)}
                placeholder="Search questions (e.g. ACID, OSI, deadlock)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {vivaSearch && (
                <button
                  type="button"
                  onClick={() => setVivaSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="bg-slate-900/90 border border-slate-800/80 px-5 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                Revision Progress:{' '}
                <strong className="text-white font-bold">{revisedCards.length}</strong> of{' '}
                <strong className="text-white font-bold">{VIVA_FLASHCARDS.length}</strong> concepts marked revised
              </span>
            </div>
            <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${(revisedCards.length / VIVA_FLASHCARDS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* FLASHCARD DISPLAY BOX */}
          {filteredFlashcards.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-white">No flashcards found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting "All" categories.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setVivaSearch('');
                }}
                className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card Container with Flip Action */}
              <div
                id="interactive-viva-card"
                className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[380px] flex flex-col justify-between transition-all"
              >
                {/* Card Header Info */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentCard.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Card {currentCardIndex + 1} of {filteredFlashcards.length}
                    </span>
                  </div>

                  {/* Revised Checkbox Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleRevised(currentCard.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isCurrentRevised
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isCurrentRevised ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{isCurrentRevised ? 'Revised ✅' : 'Mark Revised'}</span>
                  </button>
                </div>

                {/* Card Main Body */}
                <div className="py-6 space-y-4 flex-1">
                  {!isFlipped ? (
                    // FRONT: QUESTION
                    <div className="space-y-4">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interview Viva Question</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                        {currentCard.question}
                      </h2>
                      <p className="text-xs text-slate-400 pt-2">
                        💡 Think through your answer: state the definition, compare with an alternative, or provide a real-world example.
                      </p>
                    </div>
                  ) : (
                    // BACK: MODEL ANSWER & BULLETS
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Model Viva Answer</span>
                      </div>
                      <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                        {currentCard.answer}
                      </div>

                      {/* Key Takeaways */}
                      {currentCard.keyPoints && currentCard.keyPoints.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            Key Bullet Points to Speak in Viva:
                          </span>
                          <ul className="space-y-1">
                            {currentCard.keyPoints.map((pt, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Flip Button + Navigation */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    {isFlipped ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Hide Answer (Flip Back)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Reveal Answer &amp; Notes</span>
                      </>
                    )}
                  </button>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleRandomCard}
                      title="Shuffle / Random Question"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePrevCard}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextCard}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcut Hint */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <span>
                  Shortcut:{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                    Space
                  </kbd>{' '}
                  flip answer,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                    ←
                  </kbd>{' '}
                  prev,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                    →
                  </kbd>{' '}
                  next
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: PRACTICAL CODE VAULT                                     */}
      {/* ================================================================ */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          {/* Controls Bar: Language Filter + Search */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Language:
              </span>
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {lang === 'All' ? 'All (27)' : lang}
                </button>
              ))}
            </div>

            {/* Code Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder="Search templates (e.g. calculator, Dijkstra, stack)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {codeSearch && (
                <button
                  type="button"
                  onClick={() => setCodeSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Zero Interactive Freeze Notice */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 px-5 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Non-Blocking Guarantee:</strong> All 27 templates use hardcoded test inputs and include expected outputs directly in comments. Zero infinite input loops (`scanf`, `input()`) to ensure complete stability.
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200 shrink-0 hidden sm:inline">
              Self-Executable
            </span>
          </div>

          {/* Snippets List Grid */}
          {filteredSnippets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-white">No code snippets match your search</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the language filter or search query.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('All');
                  setCodeSearch('');
                }}
                className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSnippets.map((snippet) => {
                const isCopied = copiedSnippetId === snippet.id;
                return (
                  <div
                    key={snippet.id}
                    id={`snippet-${snippet.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 transition-all hover:border-slate-700"
                  >
                    {/* Snippet Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              snippet.language === 'Python'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : snippet.language === 'C'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {snippet.language}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {snippet.category}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {snippet.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {snippet.description}
                        </p>
                      </div>

                      {/* 1-Click Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(snippet)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-slate-950" />
                            <span>Copied! ✅</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Syntax Highlighted Terminal View */}
                    <div className="relative group">
                      <pre className="bg-slate-950 text-emerald-300 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed selection:bg-emerald-900/60 selection:text-white">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementCodeVault;
