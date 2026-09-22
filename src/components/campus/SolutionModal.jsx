import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Download,
  ThumbsUp,
  CheckCircle2,
  Flag,
  UserCheck,
  Code,
  Share2,
  Send,
  Loader2,
  Lock,
} from 'lucide-react';
import { RichContentRenderer } from './RichContentRenderer';
import { ProblemSolverBadge } from './ProblemSolverBadge';

export const SolutionModal = ({
  post,
  onClose,
  user,
  userProfile,
  userSolutionsCounts = {},
  replyInputText = '',
  setReplyInputText,
  replyAnonymous = false,
  setReplyAnonymous,
  replyAuthorCollege = '',
  setReplyAuthorCollege,
  isSubmittingReply = false,
  handleAddReply,
  handleInsertCodeSnippetInReply,
  handleInsertDriveLinkInReply,
  handleInsertGitHubLinkInReply,
  handleReplyUpvote,
  handleOpenReport,
  openAuthModal,
}) => {
  // Safe normalization of post fields
  const activePost = post || null;
  const authorName = activePost?.authorName || activePost?.author || (activePost?.isAnonymous ? 'Anonymous Student' : 'Student Peer');
  const college = activePost?.college || 'Campus Community';
  const branch = activePost?.branch || 'All Branches';
  const timestamp = activePost?.createdAt || activePost?.timestamp || 'Recently';
  const title = activePost?.title || 'Academic Query';
  const content = activePost?.content || '';

  // Safe attachments extraction
  const allAttachments = Array.isArray(activePost?.attachments) && activePost.attachments.length > 0
    ? activePost.attachments
    : activePost?.attachment
    ? [activePost.attachment]
    : [];

  // Safe replies extraction
  const safeReplies = (Array.isArray(activePost?.replies) ? activePost.replies : []).filter(
    (r) => r && !r.isHidden && (!r.reportCount || r.reportCount < 3)
  );

  return (
    <div
      id="campus-solution-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs"
    >
      <motion.div
        id="campus-solution-modal-container"
        initial={{ opacity: 0, y: 120 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 120 }}
        transition={{ duration: 0.22 }}
        className="w-full sm:max-w-2xl bg-white border border-pink-200 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 text-slate-900 max-h-[90vh] flex flex-col shadow-2xl shadow-pink-200/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-pink-100 gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                {college}
              </span>
              {branch && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {branch}
                </span>
              )}
              <span className="text-[11px] text-slate-500">
                {timestamp}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-950 mt-1.5 break-words line-clamp-2">
              {title}
            </h3>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Asked by <strong className="text-slate-700 font-semibold">{authorName}</strong></span>
            </div>
          </div>
          <button
            id="close-solution-modal-btn"
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-pink-50 shrink-0 active:scale-95 cursor-pointer transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Answers List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {content && (
            <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-200 text-xs text-slate-800 leading-relaxed break-words whitespace-pre-line">
              <RichContentRenderer content={content} />
            </div>
          )}

          {/* Active Post Attachments */}
          {allAttachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allAttachments.map((att, idx) => {
                const isPdf = att?.type === 'pdf' || att?.name?.toLowerCase().endsWith('.pdf');
                return (
                  <div
                    key={att?.id || idx}
                    className="flex items-center justify-between p-2.5 bg-pink-50/80 border border-pink-200 rounded-xl text-xs gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />
                      )}
                      <span className="text-slate-900 font-medium truncate text-xs">{att?.name || 'Attachment'}</span>
                      {att?.size && <span className="text-[10px] text-slate-500 shrink-0">{att.size}</span>}
                    </div>
                    {att?.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>View</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answers Header */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
              <span>Peer Solutions ({safeReplies.length})</span>
            </h4>
          </div>

          {safeReplies.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-1 bg-pink-50/30 rounded-2xl border border-pink-100 p-4">
              <p>No answers posted yet.</p>
              <p className="text-pink-700 font-medium">
                Be the first senior or peer to answer this query!
              </p>
            </div>
          ) : (
            safeReplies.map((reply, idx) => {
              const replyAuthorName = reply?.authorName || reply?.displayName || (reply?.isAnonymous ? 'Anonymous Student' : 'Student Peer');
              const replyUpvotes = Number.isFinite(reply?.upvotes) ? reply.upvotes : 0;
              const replySolutionsCount = reply?.authorUid && userSolutionsCounts ? (userSolutionsCounts[reply.authorUid] || 0) : 0;

              return (
                <div
                  key={reply?.id || `reply-${idx}`}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 shadow-xs ${
                    reply?.isVerifiedSolution
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-white border-pink-100'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">
                        {replyAuthorName}
                      </span>
                      <ProblemSolverBadge solutionsCount={replySolutionsCount} />
                      {reply?.role ? (
                        <span className="text-[10px] font-semibold text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full border border-pink-200">
                          {reply.role}
                        </span>
                      ) : reply?.authorCollege ? (
                        <span className="text-[10px] text-slate-500">
                          • {reply.authorCollege}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {reply?.isVerifiedSolution && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Solution
                        </span>
                      )}
                      {handleOpenReport && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenReport({
                              type: 'reply',
                              id: reply?.id,
                              postId: activePost?.id,
                              authorUid: reply?.authorUid,
                              authorName: replyAuthorName,
                              titleSnippet: reply?.content ? reply.content.substring(0, 60) : '',
                            })
                          }
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Report solution"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <RichContentRenderer content={reply?.content || ''} />

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>{reply?.createdAt || reply?.timestamp || 'Recently'}</span>
                    {handleReplyUpvote && (
                      <button
                        type="button"
                        onClick={() => handleReplyUpvote(reply?.id)}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 font-medium shadow-xs"
                      >
                        <ThumbsUp className="w-3 h-3 text-pink-600" />
                        <span>{replyUpvotes} Helpful</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
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
                    onChange={() => setReplyAnonymous?.(false)}
                    className="w-3.5 h-3.5 accent-pink-600 cursor-pointer"
                  />
                  <span className="text-slate-800 font-medium">
                    Show my name ({user?.displayName || 'Me'})
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reply-identity-option"
                    checked={replyAnonymous}
                    onChange={() => setReplyAnonymous?.(true)}
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
                onChange={(e) => setReplyInputText?.(e.target.value)}
                placeholder="Write a clear solution, code explanation, or verified peer advice. Supports ```code``` and links..."
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:bg-white rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden shadow-xs transition-all resize-y min-h-[72px]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Tip: Wrap code in ```language ... ``` for syntax highlighting.
                </span>
                <button
                  id="submit-solution-btn"
                  type="submit"
                  disabled={!replyInputText?.trim() || isSubmittingReply}
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
          <div className="pt-3 border-t border-pink-100 flex items-center justify-between gap-3 bg-pink-50/40 p-3 rounded-2xl border">
            <div>
              <p className="text-xs font-bold text-slate-900">Have a solution or verified answer?</p>
              <p className="text-[11px] text-slate-500">Sign in with Google to post your answer and help peers.</p>
            </div>
            <button
              id="solution-modal-signin-btn"
              type="button"
              onClick={() => openAuthModal?.({ type: 'post-solution', postId: activePost?.id })}
              className="min-h-[38px] px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              Sign In to Answer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
