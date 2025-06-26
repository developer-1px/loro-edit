import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PluginBasedEditor } from '../components/PluginBasedEditor'
import { logger } from '../utils/logger'

// Mock the logger to capture logs
const logSpy = vi.spyOn(logger, 'debug')
const logInfoSpy = vi.spyOn(logger, 'info')
const logWarnSpy = vi.spyOn(logger, 'warn')

describe('Selection UI Debug Tests', () => {
  beforeEach(() => {
    // Clear logs before each test
    logSpy.mockClear()
    logInfoSpy.mockClear() 
    logWarnSpy.mockClear()
    
    // Enable only selection logs
    logger.enableOnly('selection')
  })

  it('should log selection events when clicking on text', async () => {
    const user = userEvent.setup()
    
    // Render the main editor
    render(<PluginBasedEditor />)
    
    // Wait for sections to be fully loaded and rendered
    await waitFor(() => {
      const textSpans = document.querySelectorAll('span[data-element-id]')
      expect(textSpans.length).toBeGreaterThan(0)
    }, { timeout: 10000 })
    
    // Look for text spans with data-element-id (actual rendered text elements)
    const textSpans = document.querySelectorAll('span[data-element-id]')
    console.log('🎯 Found text spans for selection test:', textSpans.length)
    
    if (textSpans.length > 0) {
      const textElement = textSpans[0] as HTMLElement
      
      console.log('🔍 Found text element:', {
        tagName: textElement.tagName,
        className: textElement.className,
        id: textElement.id,
        dataset: textElement.dataset,
        textContent: textElement.textContent?.substring(0, 30)
      })
      
      // Try both user event click and direct fireEvent
      console.log('🖱️ Clicking with userEvent...')
      await user.click(textElement)
      
      // Wait a moment, then try fireEvent if no logs
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let selectionLogs = [
        ...logSpy.mock.calls,
        ...logInfoSpy.mock.calls,
        ...logWarnSpy.mock.calls
      ].filter(call => call[0] === 'selection')
      
      if (selectionLogs.length === 0) {
        console.log('🖱️ No logs from userEvent, trying fireEvent...')
        
        // Try direct fireEvent click
        fireEvent.click(textElement)
        
        // Also try clicking on the parent preview container with proper coordinates
        const previewContainer = document.querySelector('[data-preview-container]')
        if (previewContainer) {
          console.log('🖱️ Clicking on preview container...')
          const rect = textElement.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          
          console.log('🎯 Click coordinates:', { 
            x: centerX, 
            y: centerY, 
            rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          })
          
          fireEvent.click(previewContainer, {
            clientX: centerX,
            clientY: centerY
          })
        }
      }
      
      // Wait a bit for async operations
      await waitFor(() => {
        // Check if selection logs were captured
        selectionLogs = [
          ...logSpy.mock.calls,
          ...logInfoSpy.mock.calls,
          ...logWarnSpy.mock.calls
        ].filter(call => call[0] === 'selection')
        
        console.log('📝 Selection logs captured:', selectionLogs)
        
        return selectionLogs.length > 0
      }, { timeout: 2000 })
      
      // Verify logs were generated
      const allCalls = [
        ...logSpy.mock.calls,
        ...logInfoSpy.mock.calls,
        ...logWarnSpy.mock.calls
      ]
      
      const selectionCalls = allCalls.filter(call => call[0] === 'selection')
      console.log('🎯 All selection calls:', selectionCalls)
      
      expect(selectionCalls.length).toBeGreaterThan(0)
    } else {
      console.warn('❌ No text elements found to test selection')
    }
  })

  it('should verify DOM structure for debugging', async () => {
    render(<PluginBasedEditor />)
    
    // Wait for initialization
    await waitFor(() => {
      expect(document.body).toBeDefined()
    }, { timeout: 3000 })
    
    // Log DOM structure for debugging
    const elementsWithDataElementId = document.querySelectorAll('[data-element-id]')
    const elementsWithDataSectionId = document.querySelectorAll('[data-section-id]')
    
    console.log('🏗️ DOM Structure Debug:')
    console.log('Elements with data-element-id:', elementsWithDataElementId.length)
    console.log('Elements with data-section-id:', elementsWithDataSectionId.length)
    
    elementsWithDataElementId.forEach((el, index) => {
      console.log(`Element ${index}:`, {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        dataElementId: (el as HTMLElement).dataset.elementId,
        textContent: el.textContent?.substring(0, 50),
        outerHTML: el.outerHTML.substring(0, 200)
      })
    })
    
    // Verify at least some elements have proper data attributes
    expect(elementsWithDataElementId.length).toBeGreaterThan(0)
  })
  
  it('should test plugin matching logic', async () => {
    render(<PluginBasedEditor />)
    
    await waitFor(() => {
      expect(document.body).toBeDefined()
    }, { timeout: 3000 })
    
    // Test if we can find paragraph elements
    const paragraphs = document.querySelectorAll('p')
    console.log('📄 Found paragraphs:', paragraphs.length)
    
    paragraphs.forEach((p, index) => {
      console.log(`Paragraph ${index}:`, {
        id: p.id,
        className: p.className,
        dataElementId: (p as HTMLElement).dataset.elementId,
        textContent: p.textContent?.substring(0, 50)
      })
    })
    
    // Test if we can find span elements (text elements)
    const spans = document.querySelectorAll('span[data-element-id]')
    console.log('📝 Found text spans:', spans.length)
    
    spans.forEach((span, index) => {
      console.log(`Span ${index}:`, {
        id: span.id,
        className: span.className,
        dataElementId: (span as HTMLElement).dataset.elementId,
        textContent: span.textContent?.substring(0, 50)
      })
    })
  })
})