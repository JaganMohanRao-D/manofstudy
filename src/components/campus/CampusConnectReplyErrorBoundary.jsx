import React from 'react';

export class CampusConnectReplyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[CampusConnect] Reply thread render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const onClose = this.props.onClose;
      return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-white border border-rose-200 rounded-t-3xl sm:rounded-3xl p-6 text-slate-900 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <span className="font-bold">!</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-950">This discussion could not be displayed</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  The discussion data could not be rendered safely. Your CampusConnect page is still available.
                  Close this window and continue browsing.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors"
              >
                Close discussion
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
