/**
 * Jest 테스트 환경 설정
 * 모든 테스트 파일이 실행되기 전에 로드되는 설정 파일
 */

import '@testing-library/jest-dom';

// Performance API mock (for useGameTimer)
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(),
    getEntriesByType: jest.fn(),
  },
  writable: true
});

// Navigator API mocks
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
});

// ServiceWorker mock
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      sync: {
        register: jest.fn()
      }
    })
  },
  writable: true
});

// Notification API mock
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    constructor(_title: string, _options?: NotificationOptions) {
      // Mock implementation
    }
    close() {}
    static permission = 'granted';
    static requestPermission = jest.fn(() => Promise.resolve('granted'));
  },
  writable: true
});

// MediaQueryList mock
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true
});

// Local Storage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Session Storage mock
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Supabase mock (기본 mock)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
  }
}));

// React Router mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
  useParams: () => ({}),
}));

// Console warnings 숨기기 (특정 경고만)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('Warning: react-dom.development.js'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// 테스트 전 전역 상태 초기화
beforeEach(() => {
  // LocalStorage 초기화
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // SessionStorage 초기화
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // 타이머 초기화
  jest.clearAllTimers();
  jest.useFakeTimers();
});

// 테스트 후 정리
afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});