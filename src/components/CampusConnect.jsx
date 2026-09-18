import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Plus,
  Send,
  Upload,
  FileText,
  Download,
  Share2,
  ThumbsUp,
  Lock,
  Unlock,
  AlertCircle,
  Building2,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  Megaphone,
  X,
  Code2,
  ChevronDown,
  Filter,
  Check,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User,
  Users,
  Compass,
  Heart,
  Mail,
  Image as ImageIcon,
} from 'lucide-react';

import { initialCommunityPosts } from '../data/communityPosts';
export { initialCommunityPosts };

const STORAGE_KEY = 'mos_forum_seed_v2';
const UPVOTES_KEY = 'mos_forum_upvotes_v2';

const POPULAR_COLLEGES = [
  'CBIT (Chaitanya Bharathi)',
  'OUCE (Osmania University)',
  'JNTUH College of Engineering',
  'VNR Vignana Jyothi (VNR VJIET)',
  'Vasavi College of Engineering',
  'CVR College of Engineering',
  'PVP Siddhartha (Vijayawada)',
  'VR Siddhartha Engineering College',
  'Andhra University CE (AUCE)',
  'GMR Institute of Technology (GMRIT)',
  'Gayatri Vidya Parishad (GVPCE)',
  'JNTUK Kakinada',
  'SRKR Engineering College',
  'Sreenidhi Institute of Sci & Tech (SNIST)',
  'KMIT (Keshav Memorial)',
  'MGIT (Mahatma Gandhi)',
  'BVRIT Hyderabad / Narsapur',
  'Other Engineering College',
];

const BRANCH_OPTIONS = [
  'Computer Science (CSE)',
  'AI & Machine Learning (CSM)',
  'Data Science (CSD)',
  'Information Technology (IT)',
  'Electronics & Comm (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Chemical / Biotech (CHEM/BIO)',
  'All Engineering Branches',
];

const INITIAL_SEED_POSTS = initialCommunityPosts;

export const CampusConnect = ({ onNavigateToTool }) => {
  // State: Posts and User Interactions
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialCommunityPosts;
  });

  const [upvotedPostIds, setUpvotedPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem(UPVOTES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');

  // Modals & Bottom Sheets
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState('dispatch');
  const [activeReplyPost, setActiveReplyPost] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [replyAuthorName, setReplyAuthorName] = useState('Student Peer');
  const [replyAuthorCollege, setReplyAuthorCollege] = useState('Telangana / AP College');
  const [shareSuccessId, setShareSuccessId] = useState(null);

  // Form Fields for Create Modal
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formBranch, setFormBranch] = useState('Computer Science (CSE)');
  const [formCollege, setFormCollege] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formAuthorYear, setFormAuthorYear] = useState('3rd Year B.Tech');
  const [formIsAnonymous, setFormIsAnonymous] = useState(true);
  const [formUrgency, setFormUrgency] = useState('Casual');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formAuthorEmail, setFormAuthorEmail] = useState('');
  const [formAttachments, setFormAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [formError, setFormError] = useState(null);

  const fileInputRef = useRef(null);

  // Multi-attachment file selection handler
  const handleFilesSelected = (e) => {
    setFormError(null);
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (formAttachments.length + selected.length > 4) {
      setFormError({
        message: `You can attach up to 4 files total. You currently have ${formAttachments.length} attached.`,
      });
      return;
    }

    const newAttachments = [];
    for (const file of selected) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

      if (!isPdf && !isImage) {
        setFormError({
          message: `File "${file.name}" is not supported. Please upload PDF documents or image files (.jpg, .png, .webp).`,
        });
        return;
      }

      // PDF 50 MB limit
      if (isPdf && file.size > 50 * 1024 * 1024) {
        setFormError({
          message: `PDF "${file.name}" exceeds 50 MB limit.`,
          link: '#pdf-tools',
          linkText: 'Compress PDF here using our client-side tools',
        });
        return;
      }

      // Image 3 MB limit
      if (isImage && file.size > 3 * 1024 * 1024) {
        setFormError({
          message: `Image "${file.name}" exceeds 3 MB limit.`,
          link: '#image-tools',
          linkText: 'Compress/Resize here before uploading',
        });
        return;
      }

      const fileSizeFormatted = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      let previewUrl = '';
      if (isImage) {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {
          previewUrl = '';
        }
      }

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: fileSizeFormatted === '0.0 MB' ? `${Math.round(file.size / 1024)} KB` : fileSizeFormatted,
        type: isPdf ? 'pdf' : 'image',
        previewUrl,
      });
    }

    setFormAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setFormAttachments((prev) => {
      const item = prev.find((a) => a.id === attachmentId);
      if (item && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // localStorage quota
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(UPVOTES_KEY, JSON.stringify(upvotedPostIds));
    } catch {
      // ignore
    }
  }, [upvotedPostIds]);

  // Upvote Handler
  const handleToggleUpvote = (postId) => {
    const isUpvoted = !!upvotedPostIds[postId];
    setUpvotedPostIds((prev) => ({
      ...prev,
      [postId]: !isUpvoted,
    }));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            upvotes: isUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1,
          };
        }
        return p;
      })
    );

    if (activeReplyPost && activeReplyPost.id === postId) {
      setActiveReplyPost((prev) => (prev ? {
        ...prev,
        upvotes: isUpvoted ? Math.max(0, prev.upvotes - 1) : prev.upvotes + 1,
      } : null));
    }
  };

  // Upvote a reply
  const handleReplyUpvote = (replyId) => {
    if (!activeReplyPost) return;
    const updatedReplies = activeReplyPost.replies.map((r) => {
      if (r.id === replyId) {
        return { ...r, upvotes: r.upvotes + 1 };
      }
      return r;
    });

    const updatedPost = { ...activeReplyPost, replies: updatedReplies };
    setActiveReplyPost(updatedPost);

    setPosts((prev) =>
      prev.map((p) => (p.id === activeReplyPost.id ? updatedPost : p))
    );
  };

  // Add Reply
  const handleAddReply = (e) => {
    e.preventDefault();
    if (!activeReplyPost || !replyInputText.trim()) return;

    const replyContentText = replyInputText.trim();
    const replyAuthorNameFormatted = replyAnonymous ? 'Anonymous Scholar' : (replyAuthorName.trim() || 'Student Peer');
    const replyCollegeFormatted = replyAnonymous ? 'Telangana / AP College' : (replyAuthorCollege.trim() || 'Engineering College');

    const newReply = {
      id: `reply-${Date.now()}`,
      authorName: replyAuthorNameFormatted,
      role: replyAnonymous ? 'Anonymous Scholar' : '3rd Year Peer',
      authorCollege: replyCollegeFormatted,
      authorYear: 'B.Tech Student',
      isAnonymous: replyAnonymous,
      content: replyContentText,
      createdAt: 'Just now',
      timestamp: 'Just now',
      upvotes: 1,
    };

    const updatedReplies = [newReply, ...activeReplyPost.replies];
    const updatedPost = { ...activeReplyPost, replies: updatedReplies };

    setActiveReplyPost(updatedPost);
    setPosts((prev) =>
      prev.map((p) => (p.id === activeReplyPost.id ? updatedPost : p))
    );

    // Trigger automated email alert if post author provided a notification email
    const recipientEmail = activeReplyPost.author_email || activeReplyPost.authorEmail;
    if (recipientEmail && typeof recipientEmail === 'string' && recipientEmail.includes('@')) {
      fetch('/api/send-reply-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: recipientEmail.trim(),
          questionTitle: activeReplyPost.title,
          replyAuthor: newReply.authorName || 'A fellow student',
          replyContent: newReply.content,
          college: activeReplyPost.college || 'Campus',
        }),
      }).catch((err) => {
        console.warn('[CampusConnect] Email notification alert error:', err);
      });
    }

    setReplyInputText('');
  };

  // Web Share API or Clipboard Fallback
  const handleSharePost = async (post) => {
    const shareData = {
      title: `${post.title} — MOS CampusConnect`,
      text: `[${post.college} • ${post.branch}] ${post.title}\nRead peer answers on MAN OF STUDY CampusConnect:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccessId(post.id);
        setTimeout(() => setShareSuccessId(null), 2500);
      } catch {
        // User dismissed
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShareSuccessId(post.id);
        setTimeout(() => setShareSuccessId(null), 2500);
      } catch {
        // clipboard error
      }
    }
  };

  // Handle Create Post Submit
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive post title.');
      return;
    }
    if (!formCollege.trim()) {
      setFormError('Please enter your college name (e.g. PVP Siddhartha, CBIT, JNTU...).');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Please write your campus dispatch or query content.');
      return;
    }

    let uploadedAttachments = [];

    // Process attached files
    if (formAttachments.length > 0) {
      setIsUploadingFile(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      uploadedAttachments = formAttachments.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.previewUrl || `https://cdn.manofstudy.com/notes/mos-student-notes/${Date.now()}_${att.name.replace(/\s+/g, '_')}`,
      }));
      setIsUploadingFile(false);
    }

    const newPost = {
      id: `post-${Date.now()}`,
      type: createMode,
      title: formTitle.trim(),
      content: formContent.trim(),
      branch: formBranch,
      college: formCollege.trim(),
      authorName: formIsAnonymous ? 'Anonymous Scholar' : (formAuthorName.trim() || 'Verified Scholar'),
      authorYear: formAuthorYear,
      isAnonymous: formIsAnonymous,
      author_email: formAuthorEmail.trim() || undefined,
      authorEmail: formAuthorEmail.trim() || undefined,
      createdAt: 'Just now',
      timestamp: 'Just now',
      urgency: createMode === 'doubt' ? formUrgency : 'Casual',
      codeSnippet: formCodeSnippet.trim() ? formCodeSnippet.trim() : undefined,
      attachments: uploadedAttachments,
      attachment: uploadedAttachments[0] || undefined,
      upvotes: 1,
      replies: [],
    };

    setPosts([newPost, ...posts]);
    setUpvotedPostIds((prev) => ({ ...prev, [newPost.id]: true }));

    // Reset Form & Close Modal
    setFormTitle('');
    setFormContent('');
    setFormCodeSnippet('');
    setFormAuthorEmail('');
    setFormCollege('');
    setFormAttachments([]);
    setFormError(null);
    setIsCreateModalOpen(false);
  };

  // Filter Categories
  const filterChips = [
    { id: 'all', label: '🔥 All Feeds' },
    { id: 'dispatches', label: '💡 Campus Insights' },
    { id: 'doubts', label: '❓ Peer Doubts' },
    { id: 'cse', label: '💻 CSE/IT' },
    { id: 'internships_placements', label: '🚀 Internships & Placements' },
    { id: 'first_year_eapcet', label: '🎓 First Year & EAPCET' },
    { id: 'core', label: '⚡ Core Engg' },
    { id: 'unresolved', label: '⏳ Unresolved Doubts' },
  ];

  // Filtered Posts Computation
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category Chip Filter
      if (activeFilter === 'dispatches' && post.type !== 'dispatch') return false;
      if (activeFilter === 'doubts' && post.type !== 'doubt') return false;
      if (activeFilter === 'unresolved' && (post.type !== 'doubt' || (post.replies && post.replies.length > 0))) return false;

      const branchStr = (post.branch || '').toUpperCase();
      if (activeFilter === 'cse') {
        const isCSE = branchStr.includes('CSE') || branchStr.includes('COMPUTER') || branchStr.includes('IT') || branchStr.includes('INFORMATION') || branchStr.includes('CSM') || branchStr.includes('CSD');
        if (!isCSE) return false;
      }
      if (activeFilter === 'internships_placements') {
        const isPlacementUrgency = post.urgency === 'Placement Prep' || post.urgency === 'Internship Advice';
        const textToSearch = `${post.title} ${post.content}`.toLowerCase();
        const matchesPlacementText = /placement|internship|package|lpa|hiring|gsoc|dsa|leetcode|off-campus|on-campus|interview|recruiter|referral/i.test(textToSearch);
        if (!isPlacementUrgency && !matchesPlacementText) return false;
      }
      if (activeFilter === 'first_year_eapcet') {
        const textToSearch = `${post.title} ${post.content}`.toLowerCase();
        const isFirstYearOrEapcet =
          /eapcet|counselling|first year|1st year|m1|m2|bee|chemistry|drawing|workshop|fee reimbursement|jvd|epass|sliding round|category b/i.test(textToSearch) ||
          post.title.includes('M1') ||
          post.title.includes('ED / CAD') ||
          post.title.includes('BEE');
        if (!isFirstYearOrEapcet) return false;
      }
      if (activeFilter === 'core') {
        const isCore = branchStr.includes('ECE') || branchStr.includes('EEE') || branchStr.includes('MECH') || branchStr.includes('CIVIL') || branchStr.includes('ELECTRONICS') || branchStr.includes('MECHANICAL') || branchStr.includes('ELECTRICAL');
        if (!isCore) return false;
      }

      // Branch Dropdown Filter
      if (selectedBranchFilter !== 'All') {
        const branchLower = (post.branch || '').toLowerCase();
        if (selectedBranchFilter === 'Computer' && !branchLower.includes('cse') && !branchLower.includes('computer') && !branchLower.includes('it') && !branchLower.includes('csm') && !branchLower.includes('csd')) return false;
        if (selectedBranchFilter === 'AI' && !branchLower.includes('csm') && !branchLower.includes('csd') && !branchLower.includes('ai') && !branchLower.includes('data')) return false;
        if (selectedBranchFilter === 'Electronics' && !branchLower.includes('ece') && !branchLower.includes('eee') && !branchLower.includes('electronics') && !branchLower.includes('electrical')) return false;
        if (selectedBranchFilter === 'Mechanical' && !branchLower.includes('mech')) return false;
        if (selectedBranchFilter === 'Civil' && !branchLower.includes('civil')) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesContent = post.content.toLowerCase().includes(query);
        const matchesCollege = post.college.toLowerCase().includes(query);
        const matchesBranch = post.branch.toLowerCase().includes(query);
        const matchesAuthor = (post.authorName || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesCollege && !matchesBranch && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [posts, activeFilter, selectedBranchFilter, searchQuery]);

  return (
    <div
      id="campus-connect"
      className="w-full max-w-full overflow-x-hidden bg-gradient-to-b from-pink-50 via-rose-50/60 to-white text-slate-900 min-h-screen pb-24 md:pb-16 break-words"
    >
      {/* 1. Header Banner & Identity */}
      <div className="relative border-b border-pink-200/80 bg-gradient-to-b from-pink-100/70 via-rose-50/50 to-white px-3 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200 shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              MOS CampusConnect
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200">
              <Users className="w-3.5 h-3.5 text-pink-600" />
              Student Network
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
              100% Free &amp; Open Access
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight break-words">
              MOS CampusConnect
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
              Real campus updates, senior mentorship, viva cheat-sheets, and affectionate peer doubt resolution across engineering colleges.
            </p>
          </div>

          {/* Quick Search & Mobile Filter Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries, lab topics, or colleges (e.g., OS Viva, CBIT, Microchip)..."
                className="w-full bg-white border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-white border border-pink-200 text-xs font-medium text-slate-800 rounded-2xl px-3.5 py-2.5 focus:outline-hidden focus:border-pink-400 focus:ring-2 focus:ring-pink-100 cursor-pointer min-h-[44px] shadow-xs"
              >
                <option value="All">All Branches</option>
                <option value="Computer">CSE / IT Streams</option>
                <option value="AI">AI &amp; Data Science</option>
                <option value="Electronics">ECE / EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setCreateMode('dispatch');
                  setIsCreateModalOpen(true);
                }}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-xs font-semibold shadow-sm shadow-pink-300/50 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Post Query / Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Scrollable Chip Strip (Touch Carousel) */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-pink-200/70 py-2.5 px-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                className={`min-h-[42px] px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none shrink-0 flex items-center justify-center active:scale-95 ${
                  isActive
                    ? 'bg-pink-500 text-white font-semibold border border-pink-500 shadow-sm shadow-pink-300/40'
                    : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50 hover:text-slate-900 shadow-xs'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Single-Column Feed Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-4">
        {/* Quick Post Box (Desktop / Tablet trigger) */}
        <div
          onClick={() => {
            setCreateMode('dispatch');
            setIsCreateModalOpen(true);
          }}
          className="hidden sm:flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm border border-pink-100 hover:border-pink-300 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm shadow-pink-100/50 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 border border-pink-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Share a campus dispatch or post an academic doubt...
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lab exam questions, placement drives, syllabus updates &amp; anonymous queries
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-xl group-hover:bg-pink-100 transition-colors">
            Post Now
          </span>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 px-4 bg-white/90 border border-pink-200 rounded-2xl space-y-3 shadow-xs">
            <AlertCircle className="w-9 h-9 text-pink-400 mx-auto" />
            <h3 className="text-sm sm:text-base font-bold text-slate-950">No discussions found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              No queries match your active filter. Be the first to share an update or question for your college!
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSelectedBranchFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-pink-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Reset all filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* List of Community Posts */}
        {filteredPosts.map((post) => {
          const isUpvoted = !!upvotedPostIds[post.id];
          return (
            <article
              key={post.id}
              className="bg-white/95 backdrop-blur-sm border border-pink-100 hover:border-pink-300/70 rounded-2xl p-4 sm:p-5 shadow-sm shadow-pink-200/40 hover:shadow-md transition-all space-y-3.5 overflow-hidden break-words"
            >
              {/* Card Header: Meta row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                      post.isAnonymous
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : post.type === 'dispatch'
                        ? 'bg-pink-100 text-pink-600 border-pink-200'
                        : 'bg-purple-100 text-purple-600 border-purple-200'
                    }`}
                  >
                    {post.isAnonymous ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : post.type === 'dispatch' ? (
                      <Megaphone className="w-4 h-4 text-pink-600" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
                        {post.authorName}
                      </span>
                      {post.isAnonymous ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                          Anonymous
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 truncate">
                          • {post.authorYear}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap mt-0.5">
                      <span className="text-pink-600 font-semibold truncate max-w-[180px] sm:max-w-none">
                        {post.college}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{post.createdAt || post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Badges: Type & Urgency */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {post.type === 'dispatch' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      Dispatch
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      Query
                    </span>
                  )}

                  {post.urgency && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        post.urgency === 'Mid Exams Near'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : post.urgency === 'Sem Exams Near'
                          ? 'bg-red-100 text-red-800 border-red-300 font-bold'
                          : post.urgency === 'Placement Prep'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : post.urgency === 'Internship Advice'
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {post.urgency}
                    </span>
                  )}
                </div>
              </div>

              {/* Branch Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-md border border-pink-200">
                  {post.branch}
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug break-words">
                  {post.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed break-words whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Optional Code Snippet */}
              {post.codeSnippet && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-pink-300 overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre">{post.codeSnippet}</pre>
                </div>
              )}

              {/* Multi-Attachment List */}
              {(() => {
                const allAttachments = post.attachments && Array.isArray(post.attachments) && post.attachments.length > 0
                  ? post.attachments
                  : post.attachment ? [post.attachment] : [];

                if (!allAttachments.length) return null;

                return (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allAttachments.map((att, idx) => {
                        const isPdf = att.type === 'pdf' || att.name?.toLowerCase().endsWith('.pdf');
                        return (
                          <div
                            key={att.id || idx}
                            className="flex items-center justify-between p-3 bg-pink-50/80 border border-pink-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 transition-colors gap-2.5 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isPdf
                                    ? 'bg-rose-100 border-rose-200 text-rose-600'
                                    : 'bg-pink-100 border-pink-200 text-pink-600'
                                }`}
                              >
                                {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {att.name}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {att.size || 'Attached File'} • {isPdf ? 'PDF Document' : 'Image'}
                                </p>
                              </div>
                            </div>

                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[36px] px-3 bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer active:scale-95 shadow-xs"
                              title="Open attached file"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="text-[11px]">View</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Engagement Row (Sticky Thumb-Friendly Tap Targets) */}
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between gap-1 text-xs">
                {/* Left Controls: Upvotes & Answers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(post.id)}
                    className={`min-h-[42px] px-3.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                      isUpvoted
                        ? 'bg-pink-500 text-white border border-pink-600 shadow-sm font-bold'
                        : 'bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 font-medium'
                    }`}
                    title="Mark helpful / Upvote"
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        isUpvoted ? 'fill-white text-white' : 'text-pink-600'
                      }`}
                    />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReplyPost(post)}
                    className="min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="View & post replies"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span>
                      {post.replies.length} {post.replies.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                  </button>
                </div>

                {/* Right Controls: Share Action */}
                <button
                  type="button"
                  onClick={() => handleSharePost(post)}
                  className="min-h-[42px] px-3.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200 hover:border-pink-200 flex items-center gap-1.5 font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Share to WhatsApp or Telegram"
                >
                  {shareSuccessId === post.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-pink-600" />
                      <span className="text-pink-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. Sticky Bottom Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => {
            setCreateMode('doubt');
            setIsCreateModalOpen(true);
          }}
          className="min-h-[52px] px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg shadow-pink-300 flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border border-pink-300/40"
          title="Create a new query or campus dispatch"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-bold tracking-tight">+ Post Doubt / Dispatch</span>
        </button>
      </div>

      {/* 5. Create Modal (Mode A: Campus Dispatch vs Mode B: Peer Doubt) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:max-w-lg bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 text-slate-900 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl shadow-pink-200/50"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <h3 className="text-base font-bold text-slate-950">
                    Create New Community Post
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-pink-50 active:scale-95 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher: Dispatch vs Doubt */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-pink-50 rounded-2xl border border-pink-200">
                <button
                  type="button"
                  onClick={() => setCreateMode('dispatch')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    createMode === 'dispatch'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-pink-100/60'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Campus Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('doubt')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    createMode === 'doubt'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-pink-100/60'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ask Peer Doubt</span>
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">
                      {typeof formError === 'string' ? formError : formError.message}
                    </p>
                    {typeof formError === 'object' && formError.link && (
                      <a
                        href={formError.link}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsCreateModalOpen(false);
                          window.location.hash = formError.link;
                          if (onNavigateToTool) {
                            onNavigateToTool(formError.link.replace('#', ''));
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700 underline underline-offset-2 cursor-pointer"
                      >
                        <span>{formError.linkText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleCreatePostSubmit} className="space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {createMode === 'dispatch' ? 'Dispatch Headline *' : 'Question Title *'}
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      createMode === 'dispatch'
                        ? 'e.g., VNR VJIET Semester 6 Advanced Java Lab Experiments'
                        : 'e.g., How to solve Peterson algorithm critical section in OS?'
                    }
                    className="w-full min-h-[44px] bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden transition-all shadow-xs"
                  />
                </div>

                {/* College and Branch Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      College / Campus *
                    </label>
                    <input
                      type="text"
                      value={formCollege}
                      onChange={(e) => setFormCollege(e.target.value)}
                      placeholder="e.g. PVP Siddhartha, CBIT, JNTU..."
                      className="w-full min-h-[44px] bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-xl px-3 py-2 text-slate-900 text-xs placeholder-slate-400 focus:outline-hidden transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Branch / Stream *
                    </label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full min-h-[44px] bg-pink-50/40 border border-pink-200 text-slate-900 rounded-xl px-2.5 py-2.5 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white shadow-xs"
                    >
                      {BRANCH_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Urgency Tag (Mode B: Doubt) */}
                {createMode === 'doubt' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Urgency Level
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[
                        'Casual',
                        'Mid Exams Near',
                        'Sem Exams Near',
                        'Placement Prep',
                        'Internship Advice',
                      ].map((urg) => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => setFormUrgency(urg)}
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                            formUrgency === urg
                              ? 'bg-pink-500 text-white border border-pink-600 shadow-sm font-bold'
                              : 'bg-white border border-pink-200 text-slate-700 hover:bg-pink-50 font-medium'
                          }`}
                        >
                          {urg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Details */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {createMode === 'dispatch' ? 'Dispatch Details (Markdown enabled) *' : 'Explain your Query / Context *'}
                  </label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Provide specific details, syllabus references, professor guidelines, or what you've tried..."
                    className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-xl p-3 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden resize-y transition-all shadow-xs"
                  />
                </div>

                {/* Optional Code Snippet */}
                {createMode === 'doubt' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Code Snippet / Terminal Log (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formCodeSnippet}
                      onChange={(e) => setFormCodeSnippet(e.target.value)}
                      placeholder="// Paste relevant error trace, C++, Java, or Python code here..."
                      className="w-full font-mono bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl p-2.5 text-pink-300 text-xs focus:outline-hidden resize-y"
                    />
                  </div>
                )}

                {/* Optional Email Input in "Ask Peer Doubt" Modal */}
                {createMode === 'doubt' && (
                  <div className="p-3 bg-pink-50/50 border border-pink-200 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="doubt-notification-email"
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800"
                      >
                        <Mail className="w-3.5 h-3.5 text-pink-600" />
                        <span>Notification Email</span>
                        <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">(optional)</span>
                      </label>
                      <span className="text-[10px] text-pink-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                        🔒 100% Private
                      </span>
                    </div>
                    <input
                      id="doubt-notification-email"
                      type="email"
                      value={formAuthorEmail}
                      onChange={(e) => setFormAuthorEmail(e.target.value)}
                      placeholder="Enter your email (e.g. name@gmail.com)"
                      className="w-full min-h-[44px] bg-white border border-pink-200 focus:border-pink-500 rounded-xl px-3.5 py-2 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden transition-all shadow-2xs"
                    />
                    <p className="text-[11px] text-slate-600 leading-normal">
                      We will alert you instantly when a peer or senior answers your query. 100% private.
                    </p>
                  </div>
                )}

                {/* Multi-Attachment Section (PDFs and Images) */}
                <div className="p-3 bg-pink-50/50 border border-dashed border-pink-300 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-pink-600" />
                      <span className="text-[11px] font-bold text-slate-900">
                        Attach Notes, Cheatsheets or Screenshots
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-pink-700 font-bold">
                      {formAttachments.length}/4 attached
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />

                  {/* Attachment Preview Strip */}
                  {formAttachments.length > 0 && (
                    <div className="space-y-1.5">
                      {formAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2 bg-white border border-pink-200 rounded-xl text-xs gap-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {att.type === 'pdf' ? (
                              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : att.previewUrl ? (
                              <img
                                src={att.previewUrl}
                                alt={att.name}
                                className="w-6 h-6 rounded object-cover border border-pink-200 shrink-0"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />
                            )}
                            <span className="text-slate-900 truncate text-[11px] font-medium">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {att.size}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formAttachments.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-[44px] py-2 border border-pink-200 hover:border-pink-300 bg-white hover:bg-pink-50 rounded-xl text-pink-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-pink-600" />
                      <span>Add File (PDF ≤ 50MB, Image ≤ 3MB)</span>
                    </button>
                  )}

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Direct high-speed CDN delivery for instant mobile viewing. Need to reduce size? Use our built-in compressors.
                  </p>
                </div>

                {/* Identity & Privacy Toggle */}
                <div className="p-3 bg-pink-50/60 border border-pink-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="post-anon-toggle"
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      {formIsAnonymous ? (
                        <Lock className="w-4 h-4 text-pink-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-slate-500" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900">Post Anonymously</span>
                        <p className="text-[10px] text-slate-500">
                          Renders as &ldquo;Anonymous Scholar&rdquo; to eliminate embarrassment for shy students.
                        </p>
                      </div>
                    </label>
                    <input
                      id="post-anon-toggle"
                      type="checkbox"
                      checked={formIsAnonymous}
                      onChange={(e) => setFormIsAnonymous(e.target.checked)}
                      className="w-4 h-4 accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {!formIsAnonymous && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-200/80">
                      <div>
                        <input
                          type="text"
                          value={formAuthorName}
                          onChange={(e) => setFormAuthorName(e.target.value)}
                          placeholder="Your Name (e.g. Priya R.)"
                          className="w-full min-h-[44px] bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-hidden focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formAuthorYear}
                          onChange={(e) => setFormAuthorYear(e.target.value)}
                          placeholder="Year (e.g. 3rd Year B.Tech)"
                          className="w-full min-h-[44px] bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-hidden focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 hover:bg-pink-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingFile}
                    className="min-h-[44px] px-6 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm shadow-pink-300/50 flex items-center gap-2"
                  >
                    {isUploadingFile ? (
                      <span>Uploading Attachments...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish {createMode === 'dispatch' ? 'Dispatch' : 'Query'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Mobile Bottom Sheet / Drawer for Threaded Replies */}
      <AnimatePresence>
        {activeReplyPost && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 120 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 120 }}
              transition={{ duration: 0.22 }}
              className="w-full sm:max-w-2xl bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 text-slate-900 max-h-[90vh] flex flex-col shadow-2xl shadow-pink-200/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-pink-100 gap-2 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      {activeReplyPost.college}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeReplyPost.timestamp}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-950 mt-1.5 break-words line-clamp-2">
                    {activeReplyPost.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReplyPost(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-pink-50 shrink-0 active:scale-95 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Answers List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-200 text-xs text-slate-800 leading-relaxed break-words whitespace-pre-line">
                  {activeReplyPost.content}
                </div>

                {/* Active Post Attachments */}
                {(() => {
                  const allAttachments = activeReplyPost.attachments && Array.isArray(activeReplyPost.attachments) && activeReplyPost.attachments.length > 0
                    ? activeReplyPost.attachments
                    : activeReplyPost.attachment ? [activeReplyPost.attachment] : [];
                  if (!allAttachments.length) return null;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allAttachments.map((att, idx) => {
                        const isPdf = att.type === 'pdf' || att.name?.toLowerCase().endsWith('.pdf');
                        return (
                          <div
                            key={att.id || idx}
                            className="flex items-center justify-between p-2.5 bg-pink-50/80 border border-pink-200 rounded-xl text-xs gap-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isPdf ? (
                                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />
                              )}
                              <span className="text-slate-900 font-medium truncate text-xs">{att.name}</span>
                              <span className="text-[10px] text-slate-500 shrink-0">{att.size}</span>
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
                    <span>Peer Solutions ({activeReplyPost.replies.length})</span>
                  </h4>
                </div>

                {activeReplyPost.replies.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 space-y-1 bg-pink-50/30 rounded-2xl border border-pink-100 p-4">
                    <p>No answers posted yet.</p>
                    <p className="text-pink-700 font-medium">
                      Be the first senior or peer to answer this query!
                    </p>
                  </div>
                ) : (
                  activeReplyPost.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 shadow-xs ${
                        reply.isVerifiedSolution
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-white border-pink-100'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">
                            {reply.authorName}
                          </span>
                          {reply.role ? (
                            <span className="text-[10px] font-semibold text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full border border-pink-200">
                              {reply.role}
                            </span>
                          ) : reply.authorCollege ? (
                            <span className="text-[10px] text-slate-500">
                              • {reply.authorCollege}
                            </span>
                          ) : null}
                        </div>

                        {reply.isVerifiedSolution && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Solution
                          </span>
                        )}
                      </div>

                      <p className="text-slate-800 leading-relaxed whitespace-pre-line break-words">
                        {reply.content}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>{reply.createdAt || reply.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleReplyUpvote(reply.id)}
                          className="min-h-[38px] px-3 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 font-medium shadow-xs"
                        >
                          <ThumbsUp className="w-3 h-3 text-pink-600" />
                          <span>{reply.upvotes} Helpful</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sticky Bottom Reply Input */}
              <form
                onSubmit={handleAddReply}
                className="pt-3 border-t border-pink-100 space-y-2 shrink-0 bg-white"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={replyAnonymous}
                      onChange={(e) => setReplyAnonymous(e.target.checked)}
                      className="w-3.5 h-3.5 accent-pink-500 cursor-pointer"
                    />
                    <span>Reply Anonymously</span>
                  </label>
                  <span>Markdown formatting supported</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInputText}
                    onChange={(e) => setReplyInputText(e.target.value)}
                    placeholder="Write a clear answer or verified tip..."
                    className="flex-1 min-h-[44px] bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-2xl px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden shadow-xs transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!replyInputText.trim()}
                    className="min-h-[44px] min-w-[44px] px-4 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm shadow-pink-300/50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Submit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampusConnect;
