import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export type ErrorBoundaryFallbackProps = {
  error: Error;
  resetError: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  onReset?: () => void;
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("捕获到未处理的组件错误", error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.resetErrorBoundary,
        });
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-muted/40 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Something went wrong
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">界面暂时不可用</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "请刷新重试，或联系值班同学"}
        </p>
      </div>
      <Button onClick={resetError}>重新加载模块</Button>
    </div>
  );
}

export { AppErrorBoundary };

