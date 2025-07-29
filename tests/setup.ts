/**
 * 🧪 Test Setup Configuration
 * 
 * Universal testing setup for UniversalDesktop v2.1
 * Supporting μX-Bagua architecture testing patterns
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
process.env.VITE_LITELLM_BASE_URL = 'https://test-litellm.example.com';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock crypto for UUIDs
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
    getRandomValues: jest.fn((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock File API
global.File = jest.fn().mockImplementation((parts, filename, properties = {}) => ({
  name: filename,
  size: parts.reduce((acc: number, part: any) => acc + part.length, 0),
  type: properties.type || 'application/octet-stream',
  lastModified: Date.now(),
  arrayBuffer: jest.fn(),
  text: jest.fn(),
  stream: jest.fn(),
  slice: jest.fn(),
}));

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  result: null,
  error: null,
  readyState: 0,
}));

// Mock URL API
global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
      })),
    },
  })),
}));

// Enhanced console for testing
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React warnings during tests
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is deprecated') ||
    args[0]?.includes?.('Warning: componentWillReceiveProps')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Test utilities for μX-Bagua architecture
export const TestUtils = {
  // Mock Bagua descriptor generator
  generateBaguaDescriptor: (): number => {
    return Math.floor(Math.random() * 8) + 1; // 1-8 for trigrams
  },

  // Mock UDFormat items
  createMockUDItem: (overrides: any = {}) => ({
    id: crypto.randomUUID(),
    type: 8, // VARIABLE/NOTIZZETTEL
    title: 'Test Item',
    position: { x: 100, y: 100, z: 1 },
    content: 'Test content',
    dimensions: { width: 300, height: 200 },
    bagua_descriptor: TestUtils.generateBaguaDescriptor(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_contextual: false,
    ...overrides,
  }),

  // Mock file system items
  createMockFileItem: (overrides: any = {}) => ({
    id: crypto.randomUUID(),
    name: 'test-file.txt',
    path: '/test/test-file.txt',
    type: 'file' as const,
    size: 1024,
    modified: new Date(),
    created: new Date(),
    accessed: new Date(),
    permissions: '-rw-r--r--',
    owner: 'user',
    group: 'users',
    isHidden: false,
    extension: 'txt',
    mimeType: 'text/plain',
    metadata: {
      icon: '📄',
      tags: ['test'],
    },
    ...overrides,
  }),

  // Mock context menu data
  createMockContextMenu: (overrides: any = {}) => ({
    visible: true,
    x: 100,
    y: 100,
    contextType: 'canvas' as const,
    ...overrides,
  }),

  // Wait for next tick (useful for async operations)
  waitForNextTick: (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 0));
  },

  // Wait for animation frame
  waitForAnimationFrame: (): Promise<void> => {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  },

  // Simulate keyboard events
  simulateKeyboard: (key: string, options: any = {}) => ({
    key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...options,
  }),

  // Simulate mouse events
  simulateMouse: (type: string, options: any = {}) => ({
    type,
    clientX: 100,
    clientY: 100,
    button: 0,
    buttons: 1,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...options,
  }),
};

// Global test configuration
export const TestConfig = {
  defaultTimeout: 5000,
  animationTimeout: 1000,
  apiTimeout: 3000,
  
  // Mock data constants
  mockUserId: 'test-user-123',
  mockWorkspaceId: 'test-workspace-456',
  mockSessionId: 'test-session-789',
  
  // Test environment flags
  skipLongRunningTests: process.env.SKIP_LONG_TESTS === 'true',
  skipPerformanceTests: process.env.SKIP_PERFORMANCE_TESTS === 'true',
  skipE2ETests: process.env.SKIP_E2E_TESTS === 'true',
};

// Export for use in tests
export default TestUtils;