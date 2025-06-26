import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Check if we're in browser environment
const globalThis = typeof window !== 'undefined' ? window : global;

// Mock crypto.randomUUID for tests
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15)
    }
  });
}

// Mock ResizeObserver if not available
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Mock MutationObserver if not available
if (!globalThis.MutationObserver) {
  globalThis.MutationObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Mock document.elementsFromPoint for JSDOM
Object.defineProperty(document, 'elementsFromPoint', {
  value: vi.fn().mockImplementation((x: number, y: number) => {
    // Simple mock: find elements at point based on bounding rect
    const elements = Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect()
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    })
    
    // Return in z-index order (deepest first)
    return elements.reverse()
  })
})

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})