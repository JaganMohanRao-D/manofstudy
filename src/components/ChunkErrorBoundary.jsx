import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleHardReload = this.handleHardReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ChunkErrorBoundary] Caught error loading component chunk:', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  handleHardReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      const isDynamicImportError =
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.name === 'TypeError';

      return (
        <div className="w-full max-w-xl mx-auto my-8 p-6 rounded-2xl bg-[var(--mos-surface)] border border-[var(--mos-border)] shadow-lg text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--mos-text-primary)]">
              {this.props.fallbackTitle || 'Unable to load module'}
            </h3>
            <p className="text-xs text-[var(--mos-text-secondary)] max-w-md mx-auto leading-relaxed">
              {isDynamicImportError
                ? 'A network update or new app version was detected. Please retry or refresh the page.'
                : (this.state.error?.message || 'An unexpected error occurred while loading this section.')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={this.handleHardReload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-surface-raised)] border border-[var(--mos-border)] text-[var(--mos-text-primary)] transition-colors cursor-pointer"
            >
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
