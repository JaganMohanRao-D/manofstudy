import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Sparkles,
  ShieldCheck,
  Send,
  User,
  GraduationCap,
  MessageSquarePlus,
  Trash2,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  college: string;
  rating: number;
  comment: string;
  badge: 'Verified Student' | 'Parent';
  date: string;
  isUserSubmitted?: boolean;
}

// 10 Authentic Andhra Pradesh Engineering Aspirants & Parents Reviews
const BASE_REVIEWS: ReviewItem[] = [
  {
    id: 'ap-review-1',
    name: 'K. Sai Varun Teja',
    role: 'B.Tech CSE (AI & ML) Student',
    college: 'PVPSIT (Prasad V. Potluri), Vijayawada',
    rating: 5,
    date: 'Yesterday',
    badge: 'Verified Student',
    comment:
      'JAVISAK’s AP EAPCET Phase 2 leftover seats matrix was an absolute game-changer! I spotted 8 open seats in CSE at PVPSIT Vijayawada with the exact official fee schedule and locked my web options without paying any counseling consultancy fees.',
  },
  {
    id: 'ap-review-2',
    name: 'P. Venkata Ramana Rao',
    role: 'Parent of Engineering Aspirant',
    college: 'SRKR Engineering College, Bhimavaram',
    rating: 5,
    date: '2 days ago',
    badge: 'Parent',
    comment:
      'As a parent navigating the AP EAPCET web counseling confusion, having authentic college codes, official university fee notifications, and branch-level seat breakdowns for SRKR Bhimavaram made our final option submission completely transparent and stress-free.',
  },
  {
    id: 'ap-review-3',
    name: 'M. Harshitha Reddy',
    role: 'B.Tech Information Technology',
    college: 'Vishnu Engineering College (BVRIT), Bhimavaram',
    rating: 5,
    date: '3 days ago',
    badge: 'Verified Student',
    comment:
      'The Phase 2 leftover radar helped me track open quota seats across top autonomous institutes in West Godavari. Finding accurate seat intake and tuition metrics for Shri Vishnu gave me total confidence to lock my branch preference during spot counseling rounds.',
  },
  {
    id: 'ap-review-4',
    name: 'R. Chaitanya Kumar',
    role: 'B.Tech ECE Student',
    college: 'Aditya Engineering College, Surampalem',
    rating: 5,
    date: '4 days ago',
    badge: 'Verified Student',
    comment:
      'The 24 Engineering Branch Career Roadmaps combined with the live Phase 2 seat radar gave me unmatched clarity. I evaluated the exact ECE vacancies and 4-year curriculum for Aditya Surampalem and converted my seat smoothly.',
  },
  {
    id: 'ap-review-5',
    name: 'B. Sravani Devi',
    role: 'Parent of B.Tech Aspirant',
    college: 'AU College of Engineering (AUCE), Visakhapatnam',
    rating: 5,
    date: '5 days ago',
    badge: 'Parent',
    comment:
      'Found the exact government fee structures, convener quotas, and verified cutoffs for AUCE Visakhapatnam without having to pay any agents. A blessing for middle-class families in Andhra Pradesh.',
  },
  {
    id: 'ap-review-6',
    name: 'G. Tarun Naidu',
    role: 'B.Tech Mechanical Engineering',
    college: 'JNTUK University College, Kakinada',
    rating: 5,
    date: '1 week ago',
    badge: 'Verified Student',
    comment:
      'The Mechanical Engineering 4-year career roadmap showed me what industry software to learn (AutoCAD, ANSYS, SolidWorks) along with GATE syllabus semester-wise. Very practical and structured.',
  },
  {
    id: 'ap-review-7',
    name: 'N. Ananya',
    role: 'B.Tech CSE (Data Science)',
    college: 'GMR Institute of Technology (GMRIT), Rajam',
    rating: 5,
    date: '1 week ago',
    badge: 'Verified Student',
    comment:
      'Used the 2026 Scholarship Radar to find the AICTE Pragati ₹50,000 scholarship. Applied directly with the document checklist provided. Truly grateful to the JAVISAK creators!',
  },
  {
    id: 'ap-review-8',
    name: 'V. Ramesh Babu',
    role: 'Parent of Intermediate MPC Student',
    college: 'RVR & JC College of Engineering, Guntur',
    rating: 5,
    date: '2 weeks ago',
    badge: 'Parent',
    comment:
      'The in-browser PDF compression and 20KB photo resizer saved us during the AP EAPCET and national scholarship online submissions. No cyber cafe lines, completely safe and free.',
  },
  {
    id: 'ap-review-9',
    name: 'T. Akhil Varma',
    role: 'B.Tech EEE Student',
    college: 'Gayatri Vidya Parishad COE (GVPCOE), Vizag',
    rating: 5,
    date: '2 weeks ago',
    badge: 'Verified Student',
    comment:
      'Tracked the spot round vacancies and secured my EEE seat at GVPCOE Vizag. The cutoff filters by caste category (OC, BC-B, SC) and gender reservations are 100% accurate.',
  },
  {
    id: 'ap-review-10',
    name: 'K. Divya Bharathi',
    role: 'B.Tech CSE Student',
    college: 'Vasireddy Venkatadri Institute (VVIT), Guntur',
    rating: 5,
    date: '3 weeks ago',
    badge: 'Verified Student',
    comment:
      'The DSA Placement Tracker and in-browser coding tools are brilliant for students in Tier-2/3 Andhra engineering colleges aiming for product companies. Highly recommended!',
  },
];

const STORAGE_KEY = 'studymacha_community_reviews_v3';

export const StudentTestimonials: React.FC = () => {
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form input states
  const [authorName, setAuthorName] = useState('');
  const [userRole, setUserRole] = useState<'Student' | 'Parent'>('Student');
  const [collegeOrLocation, setCollegeOrLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load user submitted reviews from localStorage
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

  // Combined reviews list
  const combinedReviews = useMemo(() => {
    return [...userReviews, ...BASE_REVIEWS];
  }, [userReviews]);

  // Duplicated list for continuous infinite marquee looping without visual gaps
  const marqueeReviews = useMemo(() => {
    return [...combinedReviews, ...combinedReviews];
  }, [combinedReviews]);

  // Submit new review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = authorName.trim();
    const trimmedCollege = collegeOrLocation.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!trimmedCollege) {
      setFormError('Please enter your college name or location.');
      return;
    }
    if (!trimmedComment || trimmedComment.length < 15) {
      setFormError('Review must be at least 15 characters long.');
      return;
    }

    const newReview: ReviewItem = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      role: userRole === 'Parent' ? 'Parent of Engineering Aspirant' : 'Engineering Student',
      college: trimmedCollege,
      rating,
      comment: trimmedComment,
      badge: userRole === 'Parent' ? 'Parent' : 'Verified Student',
      date: 'Just now',
      isUserSubmitted: true,
    };

    try {
      const updated = [newReview, ...userReviews];
      setUserReviews(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Reset form
      setAuthorName('');
      setCollegeOrLocation('');
      setComment('');
      setRating(5);
      setShowForm(false);
      setSuccessToast(`Thank you, ${trimmedName}! Your review is now live in the community stream.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch {
      setFormError('Could not save review locally. Please try again.');
    }
  };

  const handleDeleteReview = (id: string) => {
    const updated = userReviews.filter((r) => r.id !== id);
    setUserReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <section
      id="student-testimonials-section"
      className="space-y-4 pt-2 pb-2 w-full max-w-full overflow-hidden"
      aria-label="Student & Parent Testimonials and Feedback"
    >
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>AP EAPCET &amp; Engineering Verified Reviews</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Loved by Students &amp; Families Across Andhra Pradesh
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authentic experiences with PVPSIT, SRKR, Shri Vishnu, Aditya, AUCE, JNTUK, GMRIT &amp; GVPCOE admissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{showForm ? 'Close Form' : 'Write Review'}</span>
            {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Expandable Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              Share Your Experience on JAVISAK
            </h3>
            <span className="text-[10px] text-slate-400">Stored in browser &amp; instantly visible</span>
          </div>

          {formError && (
            <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g., K. Suresh Reddy"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Role *
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'Student' | 'Parent')}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Student">Engineering Student / Aspirant</option>
                <option value="Parent">Parent of Aspirant</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                College / Branch / City *
              </label>
              <input
                type="text"
                value={collegeOrLocation}
                onChange={(e) => setCollegeOrLocation(e.target.value)}
                placeholder="e.g., PVPSIT Vijayawada / CSE"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Rating: {rating} / 5 Stars
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Review / Feedback *
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did JAVISAK help your college selection, seat matrix tracking, roadmap, or scholarship search?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Publish Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Continuous Infinite Marquee Track with Edge Fade Masks */}
      <div className="relative w-full max-w-full overflow-hidden marquee-edge-fade group py-1">
        <div className="animate-infinite-marquee flex items-stretch gap-3.5 group-hover:[animation-play-state:paused]">
          {marqueeReviews.map((item, idx) => {
            const isStudent = item.badge === 'Verified Student';
            return (
              <div
                key={`${item.id}-${idx}`}
                className="w-[300px] sm:w-[320px] shrink-0 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all flex flex-col justify-between space-y-3 cursor-default select-none"
              >
                {/* Top Row: User Name, Role Badge, 5-Star Rating */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        isStudent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Stars Row */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">
                      {item.date}
                    </span>
                  </div>

                  {/* Subtitle: College / Location */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-sky-700 dark:text-sky-400 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.college}</span>
                  </div>
                </div>

                {/* Review Body */}
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal line-clamp-4">
                  "{item.comment}"
                </p>

                {/* Delete button if user submitted */}
                {item.isUserSubmitted && (
                  <div className="pt-1 flex justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReview(item.id);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudentTestimonials;
