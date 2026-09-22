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
  Bell,
  Image as ImageIcon,
  LogOut,
  LogIn,
  UserCheck,
  Loader2,
  Flag,
  Trophy,
  Award,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

import { initialCommunityPosts } from '../data/communityPosts';
import { useAuth } from '../context/AuthContext';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  db,
  syncUserProfile,
  saveCampusPostToFirestore,
  saveCampusReplyToFirestore,
  upvotePostInFirestore,
  dispatchAnswerNotification,
  incrementUserSolutionsCount,
} from '../services/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import {
  triggerResendEmailAlert,
  dispatchAnswerNotificationFlow,
} from '../services/campusNotifications';
import { RichContentRenderer } from './campus/RichContentRenderer';
import { ProblemSolverBadge } from './campus/ProblemSolverBadge';
import { ReportModal } from './campus/ReportModal';
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

  // Auth Context for Verified Google Login
  const {
    user,
    userProfile,
    updateEmailNotificationPreference,
    openAuthModal,
    signOut,
    pendingAction,
    clearPendingAction,
  } = useAuth();
  const [isSavingNotificationPref, setIsSavingNotificationPref] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'info' | 'error', title?: string }

  const showToast = (message, type = 'info', title = null, duration = 4500) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, duration);
  };

  // Google Sign-In with popup, capturing displayName, email, photoURL, and storing profile state
  const handleGoogleSignIn = async (pendingOpt = null) => {
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const loggedUser = result.user;
        const displayName = loggedUser.displayName || 'Student Peer';
        const email = loggedUser.email || '';
        const photoURL = loggedUser.photoURL || '';

        // Properly store & sync student profile in Firestore
        try {
          await syncUserProfile(loggedUser);
        } catch (syncErr) {
          console.warn('[CampusConnect] Profile sync notice:', syncErr);
        }

        setFormAuthorName(displayName);
        setReplyAuthorName(displayName);

        showToast(
          `Welcome, ${displayName}! You are signed in with Google and can now post doubts and verified peer answers.`,
          'success',
          'Signed in with Google'
        );

        // Auto-resume pending action if any
        const act = pendingOpt || pendingAction;
        if (act?.type === 'ask-doubt') {
          setCreateMode('doubt');
          setIsCreateModalOpen(true);
          clearPendingAction?.();
        } else if (act?.type === 'post-solution' && act.postId) {
          const targetPost = posts.find((p) => p.id === act.postId);
          if (targetPost) {
            setActiveReplyPost(targetPost);
          }
          clearPendingAction?.();
        }
        return loggedUser;
      }
    } catch (error) {
      // Gracefully handle popup cancellation or closure without scary errors
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('closed-by-user') ||
        error?.message?.includes('cancelled')
      ) {
        showToast('Sign-in cancelled. You can sign in anytime when you want to ask a doubt or post a reply.', 'info', 'Sign-in Cancelled');
        return null;
      }

      // Handle network errors gracefully
      if (error?.code === 'auth/network-request-failed' || error?.message?.toLowerCase().includes('network')) {
        showToast('Network issue connecting to Google Sign-In. Please check your internet connection and try again.', 'error', 'Network Connection Error');
        return null;
      }

      // Handle popup blocked
      if (error?.code === 'auth/popup-blocked') {
        showToast('Sign-in popup was blocked by your browser. Please allow popups or open the app in a new tab.', 'info', 'Popup Blocked');
        return null;
      }

      // Handle unauthorized domain
      if (error?.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
        showToast(
          `Domain ${currentHost || 'current domain'} is not yet authorized in Firebase Console under Authentication > Settings > Authorized Domains.`,
          'error',
          'Domain Authorization Required',
          7000
        );
        return null;
      }

      console.warn('[CampusConnect] Google sign-in status:', error?.message || error);
      showToast('Could not complete Google Sign-In right now. Please try again.', 'info', 'Notice');
      return null;
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleToggleNotificationPref = async (checked) => {
    setIsSavingNotificationPref(true);
    try {
      await updateEmailNotificationPreference(checked);
    } catch (err) {
      console.warn('Failed to update notification preference:', err);
    } finally {
      setIsSavingNotificationPref(false);
    }
  };

  // In-App Real-Time Notification Center State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  // Real-time Firestore sync for student's notifications: where("recipientEmail", "==", currentUser.email)
  useEffect(() => {
    const studentEmail = user?.email || auth.currentUser?.email;
    if (!studentEmail) {
      setNotifications([]);
      return;
    }

    try {
      const notifQuery = query(
        collection(db, 'notifications'),
        where('recipientEmail', '==', studentEmail)
      );

      const unsubscribe = onSnapshot(
        notifQuery,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          // Sort in descending order by createdAt in memory (reliable, index-free)
          items.sort((a, b) => {
            const getMillis = (val) => {
              if (!val) return 0;
              if (typeof val.toMillis === 'function') return val.toMillis();
              if (val.seconds) return val.seconds * 1000;
              return new Date(val).getTime() || 0;
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
          });

          setNotifications(items);
        },
        (err) => {
          console.warn('[CampusConnect] Notifications onSnapshot note:', err.message);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('[CampusConnect] Notifications setup note:', e);
    }
  }, [user?.email]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAllNotificationsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const notif of unread) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
      } catch (err) {
        console.warn('Error marking notification read:', err);
      }
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read in Firestore
    if (!notif.isRead && notif.id) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
      } catch (err) {
        console.warn('Error marking notification read:', err);
      }
    }

    setIsNotificationsOpen(false);

    // 2. Locate post and auto-scroll to it
    const targetPost = posts.find((p) => p.id === notif.questionId);
    if (targetPost) {
      setActiveReplyPost(targetPost);
    }
    setTimeout(() => {
      const el = document.getElementById(notif.questionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-pink-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-pink-400'), 3000);
      }
    }, 200);
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    let date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - date.getTime()) / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Modals & Bottom Sheets
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState('dispatch');
  const [activeReplyPost, setActiveReplyPost] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [replyAuthorName, setReplyAuthorName] = useState('Student Peer');
  const [replyAuthorCollege, setReplyAuthorCollege] = useState('Telangana / AP College');
  const [shareSuccessId, setShareSuccessId] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Compute solutions count for reputation badges
  const userSolutionsCounts = useMemo(() => {
    const counts = {};
    posts.forEach((p) => {
      (p.replies || []).forEach((r) => {
        if (r.authorUid && !r.isAnonymous) {
          counts[r.authorUid] = (counts[r.authorUid] || 0) + 1;
        }
      });
    });
    if (user?.uid) {
      const profileCount = userProfile?.solutionsCount || 0;
      counts[user.uid] = Math.max(counts[user.uid] || 0, profileCount);
    }
    return counts;
  }, [posts, user?.uid, userProfile?.solutionsCount]);

  const handleOpenReport = (target) => {
    if (!auth.currentUser) {
      openAuthModal({ type: 'report' });
      showToast('Please sign in with Google to report content.', 'info', 'Sign in Required');
      return;
    }
    setReportTarget(target);
  };

  const handleReportSuccess = (target, isHidden, userBanned) => {
    if (isHidden) {
      if (target.type === 'post') {
        setPosts((prev) =>
          prev.map((p) => (p.id === target.id ? { ...p, isHidden: true, reportCount: (p.reportCount || 0) + 1 } : p))
        );
        if (activeReplyPost && activeReplyPost.id === target.id) {
          setActiveReplyPost(null);
        }
      } else {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === target.postId) {
              return {
                ...p,
                replies: (p.replies || []).map((r) =>
                  r.id === target.id ? { ...r, isHidden: true, reportCount: (r.reportCount || 0) + 1 } : r
                ),
              };
            }
            return p;
          })
        );
        if (activeReplyPost && activeReplyPost.id === target.postId) {
          setActiveReplyPost((prev) =>
            prev
              ? {
                  ...prev,
                  replies: (prev.replies || []).map((r) =>
                    r.id === target.id ? { ...r, isHidden: true, reportCount: (r.reportCount || 0) + 1 } : r
                  ),
                }
              : null
          );
        }
      }
      showToast('Content flagged with 3+ reports and has been automatically hidden.', 'info', 'Content Moderated');
    } else {
      if (target.type === 'post') {
        setPosts((prev) =>
          prev.map((p) => (p.id === target.id ? { ...p, reportCount: (p.reportCount || 0) + 1 } : p))
        );
      } else {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === target.postId) {
              return {
                ...p,
                replies: (p.replies || []).map((r) =>
                  r.id === target.id ? { ...r, reportCount: (r.reportCount || 0) + 1 } : r
                ),
              };
            }
            return p;
          })
        );
      }
      showToast('Report submitted. Thank you for protecting our community guidelines.', 'success', 'Report Received');
    }

    if (userBanned) {
      showToast('Author has accumulated 5 violation reports and their account has been suspended.', 'error', 'Account Suspended');
    }
  };

  const handleInsertCodeSnippetInReply = () => {
    setReplyInputText((prev) => {
      const template = "\n```typescript\n// Paste code or terminal output here\n```\n";
      return prev ? `${prev}${template}` : "```typescript\n// Paste code or terminal output here\n```\n";
    });
  };

  const handleInsertDriveLinkInReply = () => {
    setReplyInputText((prev) => {
      const template = " https://drive.google.com/open?id=your-file-id ";
      return prev ? `${prev}${template}` : "https://drive.google.com/open?id=your-file-id ";
    });
  };

  const handleInsertGitHubLinkInReply = () => {
    setReplyInputText((prev) => {
      const template = " https://github.com/your-username/your-repo ";
      return prev ? `${prev}${template}` : "https://github.com/your-username/your-repo ";
    });
  };

  // Form Fields for Create Modal - Default to showing verified Google name publicly
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formBranch, setFormBranch] = useState('Computer Science (CSE)');
  const [formCollege, setFormCollege] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formAuthorYear, setFormAuthorYear] = useState('3rd Year B.Tech');
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [formUrgency, setFormUrgency] = useState('Casual');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formAuthorEmail, setFormAuthorEmail] = useState('');
  const [formAttachments, setFormAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [formError, setFormError] = useState(null);

  const fileInputRef = useRef(null);

  // Sync display name from authenticated Google user
  useEffect(() => {
    if (user?.displayName) {
      setFormAuthorName(user.displayName);
      setReplyAuthorName(user.displayName);
    }
  }, [user]);

  // Auto-resume action after Google Sign-In succeeds
  useEffect(() => {
    if (user && pendingAction) {
      if (pendingAction.type === 'ask-doubt') {
        setCreateMode('doubt');
        setIsCreateModalOpen(true);
        clearPendingAction();
      } else if (pendingAction.type === 'post-solution' && pendingAction.postId) {
        const targetPost = posts.find((p) => p.id === pendingAction.postId);
        if (targetPost) {
          setActiveReplyPost(targetPost);
        }
        clearPendingAction();
      }
    }
  }, [user, pendingAction, posts, clearPendingAction]);

  // Real-time Firestore sync for campus posts
  useEffect(() => {
    try {
      const q = query(collection(db, 'campus_posts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestorePosts = snapshot.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              replies: d.data().replies || [],
            }));

            setPosts((prevPosts) => {
              const firestoreIds = new Set(firestorePosts.map((p) => p.id));
              const nonFirestore = prevPosts.filter((p) => !firestoreIds.has(p.id));
              return [...firestorePosts, ...nonFirestore];
            });
          }
        },
        (err) => {
          console.debug('[Firebase] Firestore onSnapshot note:', err.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.debug('[Firebase] Firestore snapshot listener note:', e);
    }
  }, []);

  // Action initiation gates checking Firebase Auth
  const handleInitiateAskDoubt = (mode = 'doubt') => {
    if (!auth.currentUser) {
      openAuthModal({ type: 'ask-doubt' });
      return;
    }
    setCreateMode(mode);
    setIsCreateModalOpen(true);
  };

  const handleInitiatePostSolution = (post) => {
    if (!auth.currentUser) {
      openAuthModal({ type: 'post-solution', postId: post.id });
      return;
    }
    setActiveReplyPost(post);
  };

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
  const handleToggleUpvote = async (postId) => {
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

    try {
      await upvotePostInFirestore(postId, !isUpvoted);
    } catch (err) {
      console.debug('[Firebase] Upvote synced locally:', err.message);
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

  // Add Solution / Reply (Requires Real Firebase Google Auth)
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!activeReplyPost || !replyInputText.trim() || isSubmittingReply) return;

    // Check account suspension
    if (userProfile?.isBanned) {
      showToast('Your account has been suspended due to community guideline violations.', 'error', 'Account Suspended');
      return;
    }

    // Strict Firebase Auth verification
    if (!auth.currentUser) {
      openAuthModal({ type: 'post-solution', postId: activeReplyPost.id });
      return;
    }

    setIsSubmittingReply(true);

    const currentAuthUser = auth.currentUser;
    const authorDisplayName = currentAuthUser.displayName || 'Student Peer';
    const isAnon = replyAnonymous;
    const publicAuthorName = isAnon ? 'Anonymous Student' : authorDisplayName;

    // Anti-spoofing check for official admin name
    if (!isAnon && publicAuthorName.toLowerCase().includes('man of study admin')) {
      showToast("The identity 'Man of Study Admin' is reserved for verified administrators.", 'error', 'Identity Reserved');
      setIsSubmittingReply(false);
      return;
    }

    const replyContentText = replyInputText.trim();
    const replyCollegeFormatted = isAnon ? 'Campus Peer' : (replyAuthorCollege.trim() || 'Engineering College');

    const newReply = {
      id: `reply-${Date.now()}`,
      authorUid: currentAuthUser.uid,
      authorName: publicAuthorName,
      displayName: authorDisplayName,
      role: isAnon ? 'Anonymous Scholar' : 'Verified Student Peer',
      authorCollege: replyCollegeFormatted,
      authorYear: 'B.Tech Student',
      isAnonymous: isAnon,
      isAdmin: false,
      content: replyContentText,
      createdAt: 'Just now',
      timestamp: 'Just now',
      upvotes: 1,
      reportCount: 0,
      isHidden: false,
    };

    // 1. Immediately update local state so user sees solution instantly without waiting
    const updatedReplies = [newReply, ...(activeReplyPost.replies || [])];
    const updatedPost = { ...activeReplyPost, replies: updatedReplies };

    setActiveReplyPost(updatedPost);
    setPosts((prev) =>
      prev.map((p) => (p.id === activeReplyPost.id ? updatedPost : p))
    );

    // 2. Clear input immediately so input box is ready
    setReplyInputText('');

    try {
      // 3. Save to Firestore subcollections and update solutions count
      await saveCampusReplyToFirestore(activeReplyPost.id, {
        id: newReply.id,
        content: newReply.content,
        isAnonymous: isAnon,
        college: newReply.authorCollege,
        role: newReply.role,
      });

      // Increment user's verified solution reputation count
      if (currentAuthUser.uid) {
        incrementUserSolutionsCount(currentAuthUser.uid).catch((cntErr) => {
          console.debug('[CampusConnect] Reputation count sync note:', cntErr);
        });
      }

      showToast('Solution posted successfully! Your peer was notified.', 'success', 'Solution Published');

      // 4. TWO-WAY NOTIFICATION SYSTEM: In-App Notification Center + Automated Resend Email
      let recipientEmail = activeReplyPost.authorEmail || activeReplyPost.authorEmailAddress || null;
      let recipientName = activeReplyPost.authorName || activeReplyPost.displayName || 'Student';

      if (!recipientEmail && activeReplyPost.authorUid) {
        try {
          const authorUserDoc = await getDoc(doc(db, 'users', activeReplyPost.authorUid));
          if (authorUserDoc.exists()) {
            const userData = authorUserDoc.data();
            recipientEmail = userData.email || null;
            if (userData.displayName) recipientName = userData.displayName;
          }
        } catch (lookupErr) {
          console.debug('[CampusConnect] Author email lookup note:', lookupErr);
        }
      }

      const currentStudentEmail = currentAuthUser.email;
      const isSelfReply =
        recipientEmail &&
        currentStudentEmail &&
        recipientEmail.toLowerCase() === currentStudentEmail.toLowerCase();

      // Dispatch answer notification flow
      if (recipientEmail && !isSelfReply) {
        dispatchAnswerNotificationFlow({
          recipientEmail: recipientEmail,
          recipientName: recipientName,
          senderName: isAnon ? 'A Fellow Student' : authorDisplayName,
          questionId: activeReplyPost.id,
          questionTitle: activeReplyPost.title,
          answerText: replyContentText,
        }).catch((notifErr) => {
          console.warn('[CampusConnect] Notification dispatch note:', notifErr);
        });
      }

      // Zero-trust mail queue trigger as secondary fallback
      if (activeReplyPost.authorUid && activeReplyPost.authorUid !== currentAuthUser.uid) {
        dispatchAnswerNotification({
          postId: activeReplyPost.id,
          replyId: newReply.id,
          questionAuthorUid: activeReplyPost.authorUid,
          questionTitle: activeReplyPost.title,
          replyAuthorName: newReply.authorName,
          replyContent: newReply.content,
          isAnonymous: isAnon,
        }).catch((err) => {
          console.warn('[CampusConnect] Email notification trigger note:', err);
        });
      }
    } catch (err) {
      console.warn('[Firebase] saveCampusReply notice:', err?.message || err);
      showToast(err?.message || 'Could not sync solution to cloud database right now, but saved to your local session.', 'info', 'Notice');
    } finally {
      setIsSubmittingReply(false);
    }
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

  // Handle Create Post / Doubt Submit (Requires Real Firebase Google Auth)
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Strict Firebase Auth verification - never trust only frontend state
    if (!auth.currentUser) {
      openAuthModal({ type: 'ask-doubt' });
      setFormError('Authentication required: Please sign in with your Google account.');
      return;
    }

    const currentAuthUser = auth.currentUser;

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

    const isAnon = formIsAnonymous;
    const authorDisplayName = currentAuthUser.displayName || 'Verified Student';
    const publicAuthorName = isAnon ? 'Anonymous Student' : authorDisplayName;

    // Anti-spoofing check for official admin name
    if (!isAnon && publicAuthorName.toLowerCase().includes('man of study admin')) {
      setFormError("The identity 'Man of Study Admin' is reserved for verified administrators.");
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
      authorUid: currentAuthUser.uid,
      authorName: currentAuthUser.displayName || publicAuthorName,
      authorEmail: currentAuthUser.email || '',
      displayName: authorDisplayName,
      isAnonymous: isAnon,
      type: createMode,
      title: formTitle.trim(),
      content: formContent.trim(),
      branch: formBranch,
      college: formCollege.trim(),
      authorYear: formAuthorYear,
      createdAt: 'Just now',
      timestamp: 'Just now',
      urgency: createMode === 'doubt' ? formUrgency : 'Casual',
      codeSnippet: formCodeSnippet.trim() ? formCodeSnippet.trim() : undefined,
      attachments: uploadedAttachments,
      attachment: uploadedAttachments[0] || undefined,
      upvotes: 1,
      replies: [],
    };

    // Save to Firestore
    try {
      await saveCampusPostToFirestore({
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        college: newPost.college,
        branch: newPost.branch,
        type: newPost.type,
        urgency: newPost.urgency,
        isAnonymous: isAnon,
        codeSnippet: newPost.codeSnippet,
        attachments: uploadedAttachments,
      });
    } catch (err) {
      console.warn('[Firebase] Stored in local state (Firestore note):', err.message);
    }

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
      // Moderation: Auto-hide posts that have 3+ reports or are marked hidden
      if (post.isHidden || (post.reportCount && post.reportCount >= 3)) return false;

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
                onClick={() => handleInitiateAskDoubt('doubt')}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-pink-500 hover:bg-pink-600 text-white rounded-2xl text-xs font-semibold shadow-sm shadow-pink-300/50 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Ask a Doubt</span>
              </button>
            </div>
          </div>

          {/* User Authentication Status Banner in CampusConnect Header */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 pt-3 border-t border-pink-200/70">
            {user ? (
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border-2 border-pink-400 object-cover shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center border border-pink-300 shadow-xs">
                      {(user.displayName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Signed in as {user.displayName || 'Student'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Google Verified & Active" />
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Google Verified • Choose to post with your name or anonymously
                    </span>
                    {/* Notification Preference Setting (Requirement 9 & 12) */}
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer select-none bg-pink-50/80 hover:bg-pink-100/80 px-2 py-0.5 rounded-md border border-pink-200/80 transition-colors">
                        <input
                          type="checkbox"
                          checked={userProfile?.emailNotificationsEnabled !== false}
                          onChange={(e) => handleToggleNotificationPref(e.target.checked)}
                          className="w-3.5 h-3.5 text-pink-600 rounded border-pink-300 focus:ring-pink-400 cursor-pointer"
                        />
                        <Mail className="w-3 h-3 text-pink-600 shrink-0" />
                        <span>Notify me by email when someone answers my question</span>
                      </label>
                      {isSavingNotificationPref && (
                        <span className="text-[10px] text-pink-600 font-semibold animate-pulse">Saving...</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Real-time In-App Notification Center Bell */}
                  <div className="relative" ref={notificationDropdownRef}>
                    <button
                      type="button"
                      id="campus-notifications-bell-btn"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center min-h-[36px] min-w-[36px] ${
                        isNotificationsOpen
                          ? 'bg-pink-100 border-pink-400 text-pink-700'
                          : 'bg-white border-pink-200 hover:bg-pink-50 text-slate-700 hover:text-pink-600'
                      }`}
                      title="Discussion Notifications & Alerts"
                      aria-label="Discussion Notifications & Alerts"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                          {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                        </span>
                      )}
                    </button>

                    {/* Sleek Notifications Dropdown Modal */}
                    {isNotificationsOpen && (
                      <div
                        id="campus-notifications-dropdown"
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-pink-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
                      >
                        {/* Dropdown Header */}
                        <div className="p-3.5 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-pink-600" />
                            <span className="text-xs font-bold text-slate-900">Notifications</span>
                            {unreadNotificationsCount > 0 ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500 text-white">
                                {unreadNotificationsCount} new
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-pink-100 text-pink-700">
                                Caught up
                              </span>
                            )}
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllNotificationsRead}
                              className="text-[11px] font-semibold text-pink-600 hover:text-pink-800 hover:underline cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-pink-50">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-500">
                              <CheckCircle2 className="w-7 h-7 text-pink-400 mx-auto mb-2 opacity-80" />
                              <p className="font-semibold text-slate-800 text-xs">No new alerts</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Your discussions are all caught up!</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full p-3 text-left transition-colors cursor-pointer flex gap-3 items-start ${
                                  !notif.isRead
                                    ? 'bg-pink-50/50 hover:bg-pink-100/60'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5 border border-pink-200">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs text-slate-900 leading-snug line-clamp-2">
                                      <span className="font-bold text-slate-950">{notif.senderName}</span> answered:
                                      <span className="font-semibold text-pink-800 ml-1">"{notif.questionTitle}"</span>
                                    </p>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-pink-600 shrink-0" title="Unread alert" />
                                    )}
                                  </div>
                                  {notif.replySnippet && (
                                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 bg-white/80 p-1.5 rounded-lg border border-pink-100 font-sans">
                                      "{notif.replySnippet}"
                                    </p>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{formatNotificationTime(notif.createdAt)}</span>
                                    <span className="text-pink-400">•</span>
                                    <span className="text-pink-600 font-medium">Tap to view</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>

                        {/* Dropdown Footer */}
                        <div className="p-2 text-center text-[10px] text-slate-500 bg-pink-50/40 border-t border-pink-100">
                          Click any alert to jump directly to the answer discussion.
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiateAskDoubt('doubt')}
                    className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ask a Doubt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-[11px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Sign out of CampusConnect"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full flex-wrap gap-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-bold">Sign in with Google</strong> to ask doubts or post peer solutions.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn()}
                  disabled={isSigningIn}
                  className="px-4 py-2 bg-white hover:bg-pink-50 text-slate-800 border border-slate-300 hover:border-pink-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-600 shrink-0" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
          onClick={() => handleInitiateAskDoubt('doubt')}
          className="hidden sm:flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm border border-pink-100 hover:border-pink-300 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm shadow-pink-100/50 hover:shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 border border-pink-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Have an academic doubt or query? Ask your peers &amp; seniors...
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Verified with Google Sign-In • Choose to display your name or post as Anonymous Student
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-xl group-hover:bg-pink-100 transition-colors">
            Ask a Doubt
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
                      {post.isAnonymous ? (
                        <>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            Anonymous Student
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                            Anonymous Post
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
                            {post.authorName || 'Verified Scholar'}
                          </span>
                          <ProblemSolverBadge solutionsCount={post.authorUid ? userSolutionsCounts[post.authorUid] : 0} />
                          {post.authorYear && (
                            <span className="text-[11px] text-slate-500 truncate">
                              • {post.authorYear}
                            </span>
                          )}
                        </>
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

                {/* Badges: Type, Urgency, & Report Flag */}
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

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenReport({
                        type: 'post',
                        id: post.id,
                        postId: post.id,
                        authorUid: post.authorUid,
                        authorName: post.authorName,
                        titleSnippet: post.title,
                      })
                    }
                    className="min-h-[28px] px-2 py-0.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Report post"
                  >
                    <Flag className="w-3 h-3" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
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
                <RichContentRenderer content={post.content} className="text-xs sm:text-sm" />
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
                {/* Left Controls: Upvotes, Answers & Post a Solution */}
                <div className="flex items-center gap-2 flex-wrap">
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
                    title="View solutions & replies"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span>
                      {post.replies.length} {post.replies.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInitiatePostSolution(post)}
                    className="min-h-[42px] px-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Post a verified or anonymous solution"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post a Solution</span>
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
          onClick={() => handleInitiateAskDoubt('doubt')}
          className="min-h-[52px] px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg shadow-pink-300 flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer border border-pink-300/40"
          title="Ask an academic doubt or campus query"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-bold tracking-tight">Ask a Doubt</span>
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

                {/* Email Notification Setting in "Ask Peer Doubt" Modal (Requirement 2, 9 & 12) */}
                {createMode === 'doubt' && (
                  <div className="p-3 bg-pink-50/50 border border-pink-200 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                        <Mail className="w-3.5 h-3.5 text-pink-600" />
                        <span>Answer Email Notification</span>
                      </span>
                      <span className="text-[10px] text-pink-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs">
                        🔒 100% Private & Verified
                      </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={userProfile?.emailNotificationsEnabled !== false}
                        onChange={(e) => handleToggleNotificationPref(e.target.checked)}
                        className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-400 cursor-pointer"
                      />
                      <span className="font-medium">
                        Notify me when someone answers my question
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Notification will be sent automatically to your verified Google account. Your email is never shown publicly to students.
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

                {/* Posting Identity Option */}
                <div className="p-3.5 bg-slate-50 border border-pink-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-pink-600" />
                      <span className="text-xs font-bold text-slate-900">Posting identity</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Google Verified</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        !formIsAnonymous
                          ? 'bg-white border-pink-500 ring-2 ring-pink-100 font-semibold text-slate-900 shadow-xs'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="doubt-identity-option"
                        checked={!formIsAnonymous}
                        onChange={() => setFormIsAnonymous(false)}
                        className="w-4 h-4 accent-pink-600 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-semibold">Show my name publicly</span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {user?.displayName || formAuthorName || 'Your Name'}
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        formIsAnonymous
                          ? 'bg-white border-pink-500 ring-2 ring-pink-100 font-semibold text-slate-900 shadow-xs'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="doubt-identity-option"
                        checked={formIsAnonymous}
                        onChange={() => setFormIsAnonymous(true)}
                        className="w-4 h-4 accent-pink-600 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold">Post anonymously</span>
                        <span className="text-[10px] text-slate-500 block">
                          Displays as &ldquo;Anonymous Student&rdquo;
                        </span>
                      </div>
                    </label>
                  </div>

                  {!formIsAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={formAuthorName}
                          onChange={(e) => setFormAuthorName(e.target.value)}
                          placeholder="Your Name (from Google)"
                          className="w-full min-h-[40px] bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-hidden focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Academic Year</label>
                        <input
                          type="text"
                          value={formAuthorYear}
                          onChange={(e) => setFormAuthorYear(e.target.value)}
                          placeholder="Year (e.g. 3rd Year B.Tech)"
                          className="w-full min-h-[40px] bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:outline-hidden focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Your Google email is never shown publicly. Posting anonymously keeps your question private from peers while remaining securely verified internally.
                  </p>
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
                    <span>Peer Solutions ({activeReplyPost.replies.filter((r) => !r.isHidden && (!r.reportCount || r.reportCount < 3)).length})</span>
                  </h4>
                </div>

                {activeReplyPost.replies.filter((r) => !r.isHidden && (!r.reportCount || r.reportCount < 3)).length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 space-y-1 bg-pink-50/30 rounded-2xl border border-pink-100 p-4">
                    <p>No answers posted yet.</p>
                    <p className="text-pink-700 font-medium">
                      Be the first senior or peer to answer this query!
                    </p>
                  </div>
                ) : (
                  activeReplyPost.replies
                    .filter((r) => !r.isHidden && (!r.reportCount || r.reportCount < 3))
                    .map((reply) => (
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
                            <ProblemSolverBadge solutionsCount={reply.authorUid ? userSolutionsCounts[reply.authorUid] : 0} />
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

                          <div className="flex items-center gap-2">
                            {reply.isVerifiedSolution && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified Solution
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenReport({
                                  type: 'reply',
                                  id: reply.id,
                                  postId: activeReplyPost.id,
                                  authorUid: reply.authorUid,
                                  authorName: reply.authorName,
                                  titleSnippet: reply.content?.substring(0, 60),
                                })
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Report solution"
                            >
                              <Flag className="w-3 h-3" />
                              <span>Report</span>
                            </button>
                          </div>
                        </div>

                        <RichContentRenderer content={reply.content} />

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <span>{reply.createdAt || reply.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => handleReplyUpvote(reply.id)}
                            className="min-h-[36px] px-3 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 font-medium shadow-xs"
                          >
                            <ThumbsUp className="w-3 h-3 text-pink-600" />
                            <span>{reply.upvotes} Helpful</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Sticky Bottom Reply Input or Auth Gate */}
              {user ? (
                <form
                  onSubmit={handleAddReply}
                  className="pt-3 border-t border-pink-100 space-y-2.5 shrink-0 bg-white"
                >
                  <div className="p-2.5 bg-slate-50 border border-pink-200/70 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                        Posting identity
                      </span>
                      <span className="text-[10px] text-slate-500">Google Verified</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reply-identity-option"
                          checked={!replyAnonymous}
                          onChange={() => setReplyAnonymous(false)}
                          className="w-3.5 h-3.5 accent-pink-600 cursor-pointer"
                        />
                        <span className="text-slate-800 font-medium">
                          Show my name ({user.displayName || 'Me'})
                        </span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reply-identity-option"
                          checked={replyAnonymous}
                          onChange={() => setReplyAnonymous(true)}
                          className="w-3.5 h-3.5 accent-pink-600 cursor-pointer"
                        />
                        <span className="text-slate-700">
                          Post anonymously (&ldquo;Anonymous Student&rdquo;)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Rich Solution Formatting Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Insert:</span>
                    <button
                      type="button"
                      onClick={handleInsertCodeSnippetInReply}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                      title="Insert code snippet formatting"
                    >
                      <Code className="w-3 h-3 text-pink-600" />
                      <span>Code (```)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertDriveLinkInReply}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-sans flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer"
                      title="Insert Google Drive link placeholder"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Drive Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertGitHubLinkInReply}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-sans flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                      title="Insert GitHub repo link placeholder"
                    >
                      <Share2 className="w-3 h-3 text-slate-700" />
                      <span>GitHub</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={replyInputText}
                      onChange={(e) => setReplyInputText(e.target.value)}
                      placeholder="Write a clear solution, code explanation, or verified peer advice. Supports ```code``` and links..."
                      className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden shadow-xs transition-all resize-y min-h-[72px]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Tip: Wrap code in ```language ... ``` for syntax highlighting.
                      </span>
                      <button
                        type="submit"
                        disabled={!replyInputText.trim() || isSubmittingReply}
                        className="min-h-[42px] px-5 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm shadow-pink-300/50"
                      >
                        {isSubmittingReply ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Post Solution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="pt-3 border-t border-pink-100 p-3 bg-pink-50/50 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
                    <span>
                      Sign in with your Google account to post a solution.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn({ type: 'post-solution', postId: activeReplyPost.id })}
                    disabled={isSigningIn}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Moderation Report Modal */}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        target={reportTarget}
        onSuccess={handleReportSuccess}
      />

      {/* Toast Alert Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-300 max-w-sm w-full px-4 sm:px-0">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-800 shadow-pink-100/50'
                : toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-950 shadow-rose-100/50'
                : 'bg-white/95 border-pink-200 text-slate-800 shadow-pink-100/50'
            }`}
          >
            {toast.type === 'success' && (
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900">
                {toast.title || (toast.type === 'success' ? 'CampusConnect' : 'Notice')}
              </p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusConnect;
