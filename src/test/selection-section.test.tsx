import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { PluginBasedEditor } from '../components/PluginBasedEditor';

// Enable only selection logs for debugging
beforeEach(() => {
  // Use window.debugLog if available, otherwise skip
  if (typeof window !== 'undefined' && (window as any).debugLog) {
    (window as any).debugLog.only('selection', 'ui');
  }
});

describe('Section Selection Tests', () => {
  it('should allow selecting elements inside a section', async () => {
    // Render the editor
    const { container } = render(<PluginBasedEditor />);
    
    // Wait for sections to be loaded - look for main editor content
    await waitFor(() => {
      const previewContainer = container.querySelector('[data-preview-container]');
      const sections = previewContainer?.querySelectorAll('section[data-element-id]');
      console.log('Preview container found:', !!previewContainer);
      console.log('Sections found:', sections?.length || 0);
      expect(sections?.length || 0).toBeGreaterThan(0);
    }, { timeout: 10000 });
    
    // Find a section element
    const section = container.querySelector('section[data-element-id]');
    console.log('Found section:', section?.getAttribute('data-element-id'));
    
    // Find elements inside the section
    const textInSection = section?.querySelector('[data-element-type="text"]');
    const buttonInSection = section?.querySelector('button[data-element-id]');
    
    console.log('Text in section:', textInSection?.getAttribute('data-element-id'));
    console.log('Button in section:', buttonInSection?.getAttribute('data-element-id'));
    
    // Test clicking on the section first
    if (section) {
      const rect = section.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      console.log('Clicking section at:', { x, y });
      
      // Simulate click on section
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      
      const previewContainer = container.querySelector('[data-preview-container]');
      previewContainer?.dispatchEvent(clickEvent);
      
      await waitFor(() => {
        const selectedElement = container.querySelector('[data-selection-overlay]');
        console.log('Selection overlay after section click:', selectedElement);
      });
    }
    
    // Now try to click on text inside the section
    if (textInSection) {
      const rect = textInSection.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      console.log('Clicking text in section at:', { x, y });
      
      // Check what elements are at this point
      const elementsAtPoint = document.elementsFromPoint(x, y);
      console.log('Elements at text click point:', elementsAtPoint.map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        dataElementId: el.getAttribute('data-element-id'),
      })));
      
      // Simulate click on text
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      
      const previewContainer = container.querySelector('[data-preview-container]');
      previewContainer?.dispatchEvent(clickEvent);
      
      await waitFor(() => {
        // Check if text is selected
        const selectedId = document.querySelector('[data-selection-overlay]')?.getAttribute('data-target-id');
        console.log('Selected element ID after text click:', selectedId);
      });
    }
  });
  
  it('should debug findSelectableAtPoint filtering', async () => {
    const { container } = render(<PluginBasedEditor />);
    
    await waitFor(() => {
      const sections = container.querySelectorAll('section[data-element-id]');
      expect(sections.length).toBeGreaterThan(0);
    });
    
    // Get a button inside a section
    const button = container.querySelector('section button[data-element-id]');
    expect(button).toBeTruthy();
    
    const rect = button!.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Get all elements at this point
    const allElements = document.elementsFromPoint(x, y);
    console.log('\n=== All elements at button click point ===');
    allElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      console.log(`${index}: ${htmlEl.tagName}`, {
        id: htmlEl.id,
        className: htmlEl.className,
        dataElementId: htmlEl.dataset?.elementId,
        dataElementType: htmlEl.dataset?.elementType,
        isInPreviewContainer: document.querySelector('[data-preview-container]')?.contains(el),
        isInSectionPreviewRenderer: !!el.closest('[data-section-preview-renderer]'),
      });
    });
    
    // Check preview container
    const previewContainer = document.querySelector('[data-preview-container]');
    console.log('\nPreview container found:', !!previewContainer);
    console.log('Preview container rect:', previewContainer?.getBoundingClientRect());
    
    // Check if button is inside preview container
    console.log('Button is inside preview container:', previewContainer?.contains(button!));
    
    // Simulate the filtering logic from PluginManager
    const filteredElements = allElements.filter(el => {
      // Must be in preview container
      if (!previewContainer?.contains(el)) {
        console.log('Filtered out - not in preview container:', el.tagName);
        return false;
      }
      
      // Must not be in section preview renderer
      if (el.closest('[data-section-preview-renderer]')) {
        console.log('Filtered out - in section preview renderer:', el.tagName);
        return false;
      }
      
      return true;
    });
    
    console.log('\nFiltered elements count:', filteredElements.length);
    filteredElements.forEach((el, index) => {
      console.log(`Filtered ${index}: ${el.tagName}`, {
        dataElementId: (el as HTMLElement).dataset?.elementId,
      });
    });
  });
});