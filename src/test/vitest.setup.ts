import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  User: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  onSnapshot: vi.fn(),
  writeBatch: vi.fn(),
  getCountFromServer: vi.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
}));

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentMethods: {
      create: vi.fn(),
      list: vi.fn(),
      retrieve: vi.fn(),
    },
    setupIntents: {
      create: vi.fn(),
    },
    accounts: {
      create: vi.fn(),
    },
    accountLinks: {
      create: vi.fn(),
    },
  })),
}));

// Mock crypto-js
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn(() => ({ toString: () => 'encrypted' })),
    decrypt: vi.fn(() => ({ toString: () => 'decrypted' })),
  },
  enc: {
    Utf8: {
      stringify: vi.fn(),
    },
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock performance monitoring to avoid issues
vi.mock('@/utils/performanceMonitor', () => ({
  initPerformanceMonitoring: vi.fn(),
  monitorAPIPerformance: vi.fn(),
  monitorMemoryUsage: vi.fn(),
}));

// Mock security hardening
vi.mock('@/utils/securityHardening', () => ({
  initSecurityHardening: vi.fn(),
}));

// Mock production optimizer
vi.mock('@/utils/productionOptimizer', () => ({
  initProductionOptimizations: vi.fn(),
}));

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();