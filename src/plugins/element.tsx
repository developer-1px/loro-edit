// src/plugins/element.tsx

import React from 'react';
import type { Plugin } from './types';
import type { RegularElement } from '../types';

export const elementPlugin: Plugin = {
  name: 'element',
  version: '1.0.0',
  description: 'Handles generic HTML elements that are not handled by other plugins',
  
  match: {
    condition: (element) => element.type === 'element',
    priority: 10 // Lowest priority - fallback for other elements
  },

  parse: (element: Element) => {
    // This is a fallback parser for generic elements
    return {
      type: 'element' as const,
      id: element.id || crypto.randomUUID(),
      className: element.className || '',
      tagName: element.tagName.toLowerCase(),
      children: [], // Would be parsed from child elements
      repeatItem: element.getAttribute('data-repeat-item') || undefined
    };
  },

  render: ({ element, renderElement }) => {
    const regularElement = element as RegularElement;
    const Tag = regularElement.tagName as keyof React.JSX.IntrinsicElements;
    
    return React.createElement(
      Tag,
      { 
        key: regularElement.id, 
        className: regularElement.className,
        'data-element-id': regularElement.id
      },
      regularElement.children.map(renderElement)
    );
  }
};