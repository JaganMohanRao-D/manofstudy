import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class SolutionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SolutionErrorBoundary] Caught error in solution modal:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-950">Unable to Load Solutions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected display error occurred while rendering this discussion thread. Your data is safe.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Close Modal
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-pink-300/50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
