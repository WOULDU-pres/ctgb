import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // 에러 정보를 부모 컴포넌트에 전달
    this.props.onError?.(error, errorInfo);

    // 에러 로깅 (실제 서비스에서는 에러 추적 서비스로 전송)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 Error Boundary - Error Details");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Full Error Data:", errorData);
      console.groupEnd();
    }

    // 실제 환경에서는 에러 추적 서비스에 전송
    // 예: Sentry, LogRocket, 또는 자체 로깅 시스템
    try {
      localStorage.setItem("lastError", JSON.stringify(errorData));
    } catch (e) {
      console.error("Failed to save error to localStorage:", e);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                앗! 문제가 발생했습니다
              </h1>
              <p className="text-muted-foreground">
                게임 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시
                시도해주세요.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  개발자 정보 (클릭하여 펼치기)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 bg-background p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 bg-background p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                페이지 새로고침
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              문제가 계속 발생하면 브라우저 캐시를 삭제하거나 다른 브라우저를
              사용해보세요.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 함수형 컴포넌트를 위한 HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// 게임 전용 에러 바운더리
export const GameErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const handleGameError = (error: Error, errorInfo: ErrorInfo) => {
    // 게임 관련 에러 처리 로직
    console.error("Game Error:", error);

    // 게임 상태 초기화
    try {
      localStorage.removeItem("gameState");
      localStorage.removeItem("currentGame");
    } catch (e) {
      console.error("Failed to clear game state:", e);
    }
  };

  const gameFallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">게임 오류</h2>
        <p className="text-muted-foreground">
          게임을 불러오는 중 문제가 발생했습니다.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          게임 다시 시작
        </Button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary onError={handleGameError} fallback={gameFallback}>
      {children}
    </ErrorBoundary>
  );
};
