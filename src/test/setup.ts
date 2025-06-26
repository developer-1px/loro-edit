import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15)
  }
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}))

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