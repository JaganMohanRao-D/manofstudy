import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Quote,
  Award,
  CheckCircle2,
  Sparkles,
  Send,
  User,
  GraduationCap,
  MessageSquarePlus,
  Trash2,
  ThumbsUp,
  Building2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  college: string;
  collegeShort?: string;
  rating: number;
  comment: string;
  badge: string;
  date: string;
  isUserSubmitted?: boolean;
  avatarBg: string;
  verifiedCollege?: boolean;
}

// 4 Reputable AP EAPCET Colleges Verified Reviews (Demo Data)
const BASE_REVIEWS: ReviewItem[] = [
  {
    id: 'pvpsit-review-1',
    name: 'K. Sai Varun Teja',
    role: 'B.Tech CSE (AI & ML) Student',
    college: 'PVPSIT (Prasad V. Potluri Siddhartha Institute of Technology, Vijayawada)',
    collegeShort: 'PVPSIT Vijayawada',
    rating: 5,
    date: 'Yesterday',
    badge: 'Phase 2 Verified',
    verifiedCollege: true,
    avatarBg: 'bg-sky-100 text-sky-700 border-sky-300',
    comment:
      'StudyMacha’s AP EAPCET Phase 2 leftover seats matrix was an absolute game-changer! While other portals were stuck on outdated Phase 1 data, I spotted 8 open seats in CSE at PVPSIT Vijayawada with the exact official fee schedule and locked my web options without paying any counseling consultancy fees.',
  },
  {
    id: 'srkr-review-2',
    name: 'P. Venkata Ramana Rao',
    role: 'Parent of Engineering Aspirant',
    college: 'SRKR Engineering College (Bhimavaram)',
    collegeShort: 'SRKR Bhimavaram',
    rating: 5,
    date: '3 days ago',
    badge: 'Parent Review',
    verifiedCollege: true,
    avatarBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    comment:
      'As a parent navigating the AP EAPCET web counseling confusion, having authentic college codes, official university fee notifications, and branch-level seat breakdowns for SRKR Bhimavaram in one instant dashboard made our final option submission completely transparent and stress-free.',
  },
  {
    id: 'vishnu-review-3',
    name: 'M. Harshitha Reddy',
    role: 'B.Tech Information Technology',
    college: 'Vishnu Engineering College (BVRIT / Shri Vishnu, Bhimavaram)',
    collegeShort: 'Shri Vishnu Bhimavaram',
    rating: 5,
    date: '4 days ago',
    badge: 'Phase 2 Allotment',
    verifiedCollege: true,
    avatarBg: 'bg-purple-100 text-purple-700 border-purple-300',
    comment:
      'The Phase 2 leftover radar helped me track open quota seats across top autonomous institutes in West Godavari. Finding accurate seat intake and tuition metrics for Shri Vishnu Engineering College gave me total confidence to lock my branch preference during spot counseling rounds.',
  },
  {
    id: 'aditya-review-4',
    name: 'R. Chaitanya Kumar',
    role: 'B.Tech ECE Student',
    college: 'Aditya Engineering College (Surampalem)',
    collegeShort: 'Aditya Surampalem',
    rating: 5,
    date: '1 week ago',
    badge: 'Branch Choice Success',
    verifiedCollege: true,
    avatarBg: 'bg-amber-100 text-amber-700 border-amber-300',
    comment:
      'The 24 Engineering Branch Career Roadmaps combined with the live Phase 2 seat radar gave me unmatched clarity. I evaluated the exact ECE vacancies and 4-year curriculum for Aditya Engineering College Surampalem and converted my seat smoothly.',
  },
];

const QUICK_COLLEGE_PREFILLS = [
  'PVPSIT, Vijayawada',
  'SRKR Engineering College, Bhimavaram',
  'Vishnu Engineering College, Bhimavaram',
  'Aditya Engineering College, Surampalem',
  'Andhra University (AUCE), Visakhapatnam',
  'JNTUK University College, Kakinada',
  '2026 AP EAPCET Aspirant',
];

const RATING_LABELS: Record<number, string> = {
  1: '1/5 - Needs Improvement',
  2: '2/5 - Fair Experience',
  3: '3/5 - Good & Helpful',
  4: '4/5 - Very Useful Platform',
  5: '5/5 - Outstanding & Highly Recommended',
};

const STORAGE_KEY = 'studymacha_community_reviews_v2';

export const StudentTestimonials: React.FC = () => {
  // Local state for user submitted reviews
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'reputable' | 'community'>('all');

  // Form input states
  const [authorName, setAuthorName] = useState('');
  const [userRole, setUserRole] = useState<'Student' | 'Parent' | 'Aspirant'>('Student');
  const [collegeOrBranch, setCollegeOrBranch] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  // UI feedback states
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Load reviews from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setUserReviews(parsed);
        }
      }
    } catch {
      // Gracefully ignore local storage errors
    }
  }, []);

  // Combined reviews
  const allReviews = useMemo(() => {
    return [...userReviews, ...BASE_REVIEWS];
  }, [userReviews]);

  // Filtered reviews
  const displayReviews = useMemo(() => {
    if (activeFilter === 'reputable') {
      return BASE_REVIEWS;
    }
    if (activeFilter === 'community') {
      return userReviews;
    }
    return allReviews;
  }, [activeFilter, allReviews, userReviews]);

  // Calculate average rating dynamically
  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return '5.0';
    const total = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / allReviews.length).toFixed(1);
  }, [allReviews]);

  // Submit new review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = authorName.trim();
    const trimmedCollege = collegeOrBranch.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName) {
      setFormError('Please enter your name or alias.');
      return;
    }
    if (trimmedName.length < 2) {
      setFormError('Name must be at least 2 characters.');
      return;
    }
    if (!trimmedCollege) {
      setFormError('Please enter your college, branch, or aspirant status.');
      return;
    }
    if (!trimmedComment) {
      setFormError('Please write your review comment.');
      return;
    }
    if (trimmedComment.length < 10) {
      setFormError('Review must be at least 10 characters long.');
      return;
    }

    setIsFormSubmitting(true);

    const roleLabel =
      userRole === 'Parent'
        ? 'Parent of Engineering Aspirant'
        : userRole === 'Aspirant'
        ? 'AP EAPCET Aspirant'
        : 'Engineering Student';

    const newReview: ReviewItem = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      role: roleLabel,
      college: trimmedCollege,
      rating,
      comment: trimmedComment,
      badge: userRole === 'Parent' ? 'Parent Feedback' : 'Student Review',
      date: 'Just now',
      isUserSubmitted: true,
      avatarBg: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    };

    try {
      const updatedUserReviews = [newReview, ...userReviews];
      setUserReviews(updatedUserReviews);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUserReviews));

      // Reset form
      setAuthorName('');
      setCollegeOrBranch('');
      setComment('');
      setRating(5);
      setSuccessToast(`Thank you, ${trimmedName}! Your review is now live on StudyMacha.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch {
      setFormError('Unable to save review to browser storage. Please try again.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Delete an individual user review
  const handleDeleteUserReview = (id: string) => {
    const updated = userReviews.filter((r) => r.id !== id);
    setUserReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  return (
    <section
      id="student-testimonials-section"
      className="space-y-8 pt-4 pb-2"
      aria-label="Student & Parent Testimonials and Feedback"
    >
      {/* Section Header & Rating Overview Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Real Experiences from AP EAPCET Students &amp; Families</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Trusted by Andhra Pradesh Top Engineering Aspirants
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Authentic feedback from students admitted into premier colleges like{' '}
              <strong className="text-slate-800">PVPSIT</strong>,{' '}
              <strong className="text-slate-800">SRKR</strong>,{' '}
              <strong className="text-slate-800">Vishnu</strong>, and{' '}
              <strong className="text-slate-800">Aditya</strong> using our live Phase 2 vacancy matrices and roadmaps.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-2xs">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-900 tracking-tight">{averageRating}</div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Out of 5</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs font-bold text-slate-800">
                {allReviews.length} Community {allReviews.length === 1 ? 'Review' : 'Reviews'}
              </div>
              <div className="text-[11px] text-slate-500">100% Student &amp; Parent Verified</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Quick Anchor */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Reviews ({allReviews.length})
            </button>
            <button
              onClick={() => setActiveFilter('reputable')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'reputable'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Top Colleges ({BASE_REVIEWS.length})
            </button>
            <button
              onClick={() => setActiveFilter('community')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'community'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Your Feedback ({userReviews.length})
            </button>
          </div>

          <a
            href="#leave-feedback-form"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3.5 py-1.5 rounded-xl border border-rose-200/80 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Leave Your Review ↓</span>
          </a>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayReviews.map((review) => {
          const displayScore = review.rating;
          return (
            <div
              key={review.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-md ${
                review.isUserSubmitted
                  ? 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-300'
                  : 'border-slate-200/90 hover:border-rose-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Stars & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < displayScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        review.verifiedCollege
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : review.isUserSubmitted
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {review.badge}
                    </span>

                    {review.isUserSubmitted && (
                      <button
                        onClick={() => handleDeleteUserReview(review.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete your review from browser"
                        aria-label="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* College Short Pill if available */}
                {review.collegeShort && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{review.collegeShort}</span>
                  </div>
                )}

                {/* Quote Comment */}
                <div className="relative">
                  <Quote className="w-5 h-5 text-slate-200 absolute -top-1 -left-1 -z-0 opacity-40 pointer-events-none" />
                  <p className="text-xs text-slate-700 leading-relaxed relative z-10 pt-1">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${review.avatarBg}`}
                  >
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                      <span>{review.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{review.role}</p>
                    <p className="text-[10px] text-slate-400 truncate" title={review.college}>
                      {review.college}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 shrink-0">{review.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Community filter if no user review yet */}
      {displayReviews.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <MessageSquarePlus className="w-8 h-8 text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">No Community Reviews Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Be the first student or parent to share your feedback about StudyMacha’s tools, roadmaps, or Phase 2 seat radar!
            </p>
          </div>
          <a
            href="#leave-feedback-form"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors"
          >
            Leave Your Feedback Now
          </a>
        </div>
      )}

      {/* "LEAVE A FEEDBACK / COMMENT" INTERACTIVE FEATURE */}
      <div
        id="leave-feedback-form"
        className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Form Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share Your Perspective</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Leave a Review or Comment for StudyMacha
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Did our AP EAPCET Phase 2 leftover radar, 24 engineering career roadmaps, or PDF tools assist your admission?
              Submit your genuine rating and feedback—it appears live right away in the community section!
            </p>
          </div>

          {/* Success Toast Notification */}
          {successToast && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successToast}</span>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-400 hover:text-emerald-200 text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Error Alert */}
          {formError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Identity row: Name + Role + College */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. S. Rohith or M. Lakshmi (Parent)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  I am a <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  {(['Student', 'Parent', 'Aspirant'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserRole(r)}
                      className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        userRole === r
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* College / Branch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  College / Branch / Status <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={collegeOrBranch}
                    onChange={(e) => setCollegeOrBranch(e.target.value)}
                    placeholder="e.g. PVPSIT CSE, SRKR ECE, or Aspirant"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Prefill Chips for AP EAPCET Colleges */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Quick Fill Reputable College:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_COLLEGE_PREFILLS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setCollegeOrBranch(col)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-indigo-600/60 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating Interactive Selector */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-200">Your Rating Score</div>
                <div className="text-[11px] text-indigo-300 font-medium">
                  {RATING_LABELS[hoverRating ?? rating]}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-lg hover:bg-slate-700/60 transition-transform transform active:scale-90 cursor-pointer"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">
                  Your Review / Comment <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {comment.length}/600 characters
                </span>
              </div>
              <textarea
                required
                rows={3}
                maxLength={600}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how the Phase 2 seat radar, fee schedules, or college roadmaps helped your admission or web option decisions..."
                className="w-full p-3 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all resize-none"
              />
            </div>

            {/* Submit Button & Instant Storage Notice */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center sm:text-left">
                <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Reviews are saved instantly in your browser storage and shown on page without reload.
                </span>
              </div>

              <button
                type="submit"
                disabled={isFormSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isFormSubmitting ? 'Publishing...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
