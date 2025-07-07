/**
 * 에러 핸들링 시스템 테스트
 * 새로 구축한 에러 핸들링 유틸리티들의 단위 테스트
 */

import { renderHook } from '@testing-library/react';
import { 
  ErrorHandler, 
  GameError, 
  NetworkError, 
  AuthError, 
  ValidationError,
  ErrorType,
  ErrorSeverity,
  useErrorHandler 
} from '../errors';

// LocalStorage mock
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Storage mock 설정
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Custom Error Classes', () => {
  it('should create GameError with correct properties', () => {
    const error = new GameError(
      'Game failed',
      ErrorSeverity.HIGH,
      'GAME_001',
      { round: 5 },
      { gameMode: 'normal', component: 'test' }
    );

    expect(error.type).toBe(ErrorType.GAME_ERROR);
    expect(error.message).toBe('Game failed');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.code).toBe('GAME_001');
    expect(error.details).toEqual({ round: 5 });
    expect(error.context).toEqual({ gameMode: 'normal', component: 'test' });
    expect(error.name).toBe('GameError');
  });

  it('should create NetworkError with correct properties', () => {
    const error = new NetworkError(
      'Network request failed',
      ErrorSeverity.CRITICAL,
      500,
      '/api/games'
    );

    expect(error.type).toBe(ErrorType.NETWORK_ERROR);
    expect(error.message).toBe('Network request failed');
    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    expect(error.statusCode).toBe(500);
    expect(error.endpoint).toBe('/api/games');
    expect(error.name).toBe('NetworkError');
  });

  it('should create AuthError with correct properties', () => {
    const error = new AuthError('Authentication failed', 'AUTH_001');

    expect(error.type).toBe(ErrorType.AUTH_ERROR);
    expect(error.message).toBe('Authentication failed');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.code).toBe('AUTH_001');
    expect(error.name).toBe('AuthError');
  });

  it('should create ValidationError with correct properties', () => {
    const error = new ValidationError('Invalid email', 'email', 'invalid-email');

    expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
    expect(error.message).toBe('Invalid email');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.field).toBe('email');
    expect(error.value).toBe('invalid-email');
    expect(error.name).toBe('ValidationError');
  });
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should handle custom errors correctly', () => {
    const gameError = new GameError('Test error', ErrorSeverity.HIGH);
    const result = ErrorHandler.handle(gameError);

    expect(result.type).toBe(ErrorType.GAME_ERROR);
    expect(result.severity).toBe(ErrorSeverity.HIGH);
    expect(result.message).toBe('Test error');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle generic Error objects', () => {
    const error = new Error('Generic error');
    const result = ErrorHandler.handle(error);

    expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    expect(result.message).toBe('Generic error');
    expect(result.details?.stack).toBeDefined();
  });

  it('should handle non-Error objects', () => {
    const result = ErrorHandler.handle('String error');

    expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(result.severity).toBe(ErrorSeverity.LOW);
    expect(result.message).toBe('String error');
  });

  it('should add context to handled errors', () => {
    const error = new Error('Test error');
    const context = { gameMode: 'normal', round: 1 };
    const result = ErrorHandler.handle(error, context);

    expect(result.context).toEqual(context);
  });

  it('should store errors in localStorage', () => {
    const error = new GameError('Test error');
    ErrorHandler.handle(error);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ctgb_errors',
      expect.stringContaining('Test error')
    );
  });

  it('should limit stored errors to 10', () => {
    const existingErrors = Array.from({ length: 10 }, (_, i) => ({
      type: ErrorType.GAME_ERROR,
      severity: ErrorSeverity.LOW,
      message: `Error ${i}`,
      timestamp: new Date().toISOString()
    }));

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingErrors));

    const newError = new GameError('New error');
    ErrorHandler.handle(newError);

    const setItemCall = mockLocalStorage.setItem.mock.calls[0];
    const storedErrors = JSON.parse(setItemCall[1]);
    
    expect(storedErrors).toHaveLength(10);
    expect(storedErrors[0].message).toBe('New error'); // Most recent first
    expect(storedErrors[9].message).toBe('Error 8'); // Oldest error removed
  });

  it('should retrieve stored errors', () => {
    const errors = [
      { type: ErrorType.GAME_ERROR, message: 'Error 1' },
      { type: ErrorType.NETWORK_ERROR, message: 'Error 2' }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(errors));

    const result = ErrorHandler.getStoredErrors();
    expect(result).toEqual(errors);
  });

  it('should filter errors by type', () => {
    const errors = [
      { type: ErrorType.GAME_ERROR, message: 'Game error' },
      { type: ErrorType.NETWORK_ERROR, message: 'Network error' },
      { type: ErrorType.GAME_ERROR, message: 'Another game error' }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(errors));

    const gameErrors = ErrorHandler.getErrorsByType(ErrorType.GAME_ERROR);
    expect(gameErrors).toHaveLength(2);
    expect(gameErrors.every(e => e.type === ErrorType.GAME_ERROR)).toBe(true);
  });

  it('should filter errors by severity', () => {
    const errors = [
      { severity: ErrorSeverity.HIGH, message: 'High severity' },
      { severity: ErrorSeverity.LOW, message: 'Low severity' },
      { severity: ErrorSeverity.HIGH, message: 'Another high severity' }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(errors));

    const highSeverityErrors = ErrorHandler.getErrorsBySeverity(ErrorSeverity.HIGH);
    expect(highSeverityErrors).toHaveLength(2);
    expect(highSeverityErrors.every(e => e.severity === ErrorSeverity.HIGH)).toBe(true);
  });

  it('should clear stored errors', () => {
    ErrorHandler.clearStoredErrors();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ctgb_errors');
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    // Should not throw error
    expect(() => {
      ErrorHandler.handle(new Error('Test error'));
    }).not.toThrow();
  });
});

describe('useErrorHandler hook', () => {
  it('should provide error handling functions', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.createGameError).toBe('function');
    expect(typeof result.current.createNetworkError).toBe('function');
    expect(typeof result.current.createAuthError).toBe('function');
    expect(typeof result.current.createValidationError).toBe('function');
    expect(typeof result.current.getStoredErrors).toBe('function');
    expect(typeof result.current.clearStoredErrors).toBe('function');
  });

  it('should create errors correctly', () => {
    const { result } = renderHook(() => useErrorHandler());

    const gameError = result.current.createGameError('Game failed');
    expect(gameError).toBeInstanceOf(GameError);
    expect(gameError.message).toBe('Game failed');

    const networkError = result.current.createNetworkError('Network failed');
    expect(networkError).toBeInstanceOf(NetworkError);
    expect(networkError.message).toBe('Network failed');

    const authError = result.current.createAuthError('Auth failed');
    expect(authError).toBeInstanceOf(AuthError);
    expect(authError.message).toBe('Auth failed');

    const validationError = result.current.createValidationError('Validation failed');
    expect(validationError).toBeInstanceOf(ValidationError);
    expect(validationError.message).toBe('Validation failed');
  });

  it('should handle errors through hook', () => {
    const { result } = renderHook(() => useErrorHandler());

    const error = new Error('Test error');
    const handledError = result.current.handleError(error);

    expect(handledError.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(handledError.message).toBe('Test error');
  });
});