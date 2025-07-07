/**
 * CTGB 에러 핸들링 시스템
 * 일관된 에러 처리 및 로깅을 위한 유틸리티들
 */

// 에러 타입 정의
export enum ErrorType {
  GAME_ERROR = 'GAME_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMER_ERROR = 'TIMER_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 기본 에러 인터페이스
export interface CTGBError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  context?: {
    gameMode?: string;
    round?: number;
    userId?: string;
    component?: string;
  };
}

// 커스텀 에러 클래스들
export class GameError extends Error {
  public readonly type = ErrorType.GAME_ERROR;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly context?: CTGBError['context'];

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: Record<string, unknown>,
    context?: CTGBError['context']
  ) {
    super(message);
    this.name = 'GameError';
    this.severity = severity;
    if (code !== undefined) this.code = code;
    if (details !== undefined) this.details = details;
    if (context !== undefined) this.context = context;
  }
}

export class NetworkError extends Error {
  public readonly type = ErrorType.NETWORK_ERROR;
  public readonly severity: ErrorSeverity;
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    statusCode?: number,
    endpoint?: string
  ) {
    super(message);
    this.name = 'NetworkError';
    this.severity = severity;
    if (statusCode !== undefined) this.statusCode = statusCode;
    if (endpoint !== undefined) this.endpoint = endpoint;
  }
}

export class AuthError extends Error {
  public readonly type = ErrorType.AUTH_ERROR;
  public readonly severity = ErrorSeverity.HIGH;
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    if (code !== undefined) this.code = code;
  }
}

export class ValidationError extends Error {
  public readonly type = ErrorType.VALIDATION_ERROR;
  public readonly severity = ErrorSeverity.MEDIUM;
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    if (field !== undefined) this.field = field;
    if (value !== undefined) this.value = value;
  }
}

// 에러 처리 유틸리티
export class ErrorHandler {
  private static logError(error: CTGBError): void {
    // 개발 환경에서는 상세 로깅
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.severity.toUpperCase()} ERROR - ${error.type}`);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Context:', error.context);
      console.error('Timestamp:', error.timestamp);
      console.groupEnd();
    }

    // 로컬 스토리지에 에러 저장 (최근 10개만 유지)
    try {
      const errors = this.getStoredErrors();
      errors.unshift(error);
      
      // 최대 10개까지만 저장
      const trimmedErrors = errors.slice(0, 10);
      localStorage.setItem('ctgb_errors', JSON.stringify(trimmedErrors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }

    // Critical 에러의 경우 추가 처리
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(error);
    }
  }

  private static handleCriticalError(error: CTGBError): void {
    // Critical 에러의 경우 사용자에게 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Critical Error', {
        body: error.message,
        icon: '/pwa-192x192.png'
      });
    }

    // 게임 상태 초기화
    try {
      localStorage.removeItem('gameState');
      localStorage.removeItem('currentGame');
    } catch (e) {
      console.error('Failed to clear game state after critical error:', e);
    }
  }

  public static handle(error: unknown, context?: CTGBError['context']): CTGBError {
    let ctgbError: CTGBError;

    if (error instanceof GameError || 
        error instanceof NetworkError || 
        error instanceof AuthError || 
        error instanceof ValidationError) {
      const baseError: CTGBError = {
        type: error.type,
        severity: error.severity,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      
      // Add optional properties only if they exist
      if ('code' in error && error.code !== undefined) {
        baseError.code = error.code;
      }
      if ('details' in error && error.details !== undefined) {
        baseError.details = error.details;
      }
      if ('context' in error && error.context !== undefined) {
        baseError.context = { ...error.context, ...context };
      } else if (context !== undefined) {
        baseError.context = context;
      }
      
      ctgbError = baseError;
    } else if (error instanceof Error) {
      const baseError: CTGBError = {
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      
      if (error.stack !== undefined) {
        baseError.details = { stack: error.stack };
      }
      if (context !== undefined) {
        baseError.context = context;
      }
      
      ctgbError = baseError;
    } else {
      const baseError: CTGBError = {
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.LOW,
        message: String(error),
        timestamp: new Date().toISOString(),
      };
      
      if (context !== undefined) {
        baseError.context = context;
      }
      
      ctgbError = baseError;
    }

    this.logError(ctgbError);
    return ctgbError;
  }

  public static getStoredErrors(): CTGBError[] {
    try {
      const stored = localStorage.getItem('ctgb_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to retrieve stored errors:', e);
      return [];
    }
  }

  public static clearStoredErrors(): void {
    try {
      localStorage.removeItem('ctgb_errors');
    } catch (e) {
      console.error('Failed to clear stored errors:', e);
    }
  }

  public static getErrorsByType(type: ErrorType): CTGBError[] {
    return this.getStoredErrors().filter(error => error.type === type);
  }

  public static getErrorsBySeverity(severity: ErrorSeverity): CTGBError[] {
    return this.getStoredErrors().filter(error => error.severity === severity);
  }
}

// React 컴포넌트에서 사용할 수 있는 에러 핸들링 훅
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: CTGBError['context']) => {
    return ErrorHandler.handle(error, context);
  };

  const createGameError = (
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: Record<string, unknown>,
    context?: CTGBError['context']
  ) => {
    return new GameError(message, severity, code, details, context);
  };

  const createNetworkError = (
    message: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    statusCode?: number,
    endpoint?: string
  ) => {
    return new NetworkError(message, severity, statusCode, endpoint);
  };

  const createAuthError = (message: string, code?: string) => {
    return new AuthError(message, code);
  };

  const createValidationError = (message: string, field?: string, value?: unknown) => {
    return new ValidationError(message, field, value);
  };

  return {
    handleError,
    createGameError,
    createNetworkError,
    createAuthError,
    createValidationError,
    getStoredErrors: ErrorHandler.getStoredErrors,
    clearStoredErrors: ErrorHandler.clearStoredErrors,
    getErrorsByType: ErrorHandler.getErrorsByType,
    getErrorsBySeverity: ErrorHandler.getErrorsBySeverity
  };
};

// 비동기 함수를 위한 에러 처리 래퍼
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: CTGBError['context']
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const ctgbError = ErrorHandler.handle(error, context);
      throw ctgbError;
    }
  };
};

// 동기 함수를 위한 에러 처리 래퍼
export const withSyncErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => R,
  context?: CTGBError['context']
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      const ctgbError = ErrorHandler.handle(error, context);
      throw ctgbError;
    }
  };
};