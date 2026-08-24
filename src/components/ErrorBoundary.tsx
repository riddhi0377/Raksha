import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hazard-critical/10 text-hazard-critical ring-1 ring-hazard-critical/20">
            !
          </div>
          <h2 className="text-sm font-semibold text-slate-100">Something went wrong</h2>
          <p className="max-w-md text-xs text-slate-400">
            An unexpected error occurred while rendering this view. Reload the prototype to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="focus-ring rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/[0.04]"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
