import type { Section, ParsedElement } from '../types';

/**
 * Converts ParsedElement objects back to HTML string
 */
export function elementsToHtml(elements: ParsedElement[]): string {
  return elements.map(elementToHtml).join('\n');
}

function elementToHtml(element: ParsedElement): string {
  if (element.type === 'text') {
    return element.content;
  }

  // Get tag name
  let tagName = '';
  if ('tagName' in element && element.tagName) {
    tagName = element.tagName;
  } else if ((element as any).type === 'img' || (element as any).type === 'picture') {
    tagName = (element as any).type;
  } else if ((element as any).type === 'svg') {
    tagName = 'svg';
  } else {
    tagName = 'div'; // Default fallback
  }

  // Build attributes
  const attributes: Record<string, string> = {};
  
  if ('attributes' in element && element.attributes) {
    Object.assign(attributes, element.attributes);
  }

  if (element.id) {
    attributes.id = element.id;
  }

  // Special attributes for specific types
  if (element.type === 'img' || element.type === 'picture') {
    attributes.src = element.src;
    attributes.alt = element.alt;
  }

  if (element.type === 'database') {
    attributes['data-database'] = element.database;
    if (element.apiUrl) attributes['data-api-url'] = element.apiUrl;
    attributes['data-view-mode'] = element.viewMode;
  }

  if (element.type === 'repeat-container') {
    attributes['data-repeat-container'] = element.repeatContainer;
  }

  if ('repeatItem' in element && element.repeatItem) {
    attributes['data-repeat-item'] = element.repeatItem;
  }

  // Convert attributes to string
  const attributesStr = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');

  // Handle self-closing tags
  const voidElements = ['img', 'br', 'hr', 'input', 'meta', 'link'];
  if (voidElements.includes(tagName)) {
    return `<${tagName}${attributesStr ? ' ' + attributesStr : ''} />`;
  }

  // Handle SVG elements
  if (element.type === 'svg') {
    return `<svg${attributesStr ? ' ' + attributesStr : ''}>${element.svgContent}</svg>`;
  }

  // Handle elements with children
  let childrenHtml = '';
  if ('children' in element && element.children) {
    childrenHtml = element.children.map(elementToHtml).join('');
  }

  // Handle repeat container items
  if (element.type === 'repeat-container' && element.items) {
    childrenHtml += element.items.map(elementToHtml).join('');
  }

  return `<${tagName}${attributesStr ? ' ' + attributesStr : ''}>${childrenHtml}</${tagName}>`;
}

function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Combines all sections into a single HTML string
 */
export function sectionsToHtml(sections: Section[]): string {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const htmlParts = sortedSections.map(section => elementsToHtml(section.elements));
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${htmlParts.join('\n\n')}
</body>
</html>`;
}

/**
 * Generates HTML for preview (without doctype and head)
 */
export function sectionsToPreviewHtml(sections: Section[]): string {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  return sortedSections
    .map(section => elementsToHtml(section.elements))
    .join('\n\n');
}