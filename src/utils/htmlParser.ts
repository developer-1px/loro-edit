// src/utils/htmlParser.ts

import type { ParsedElement, RegularElement } from "../types";
import { pluginManager } from "../plugins/PluginManager";
import { VOID_ELEMENTS } from "./voidElements";

export const parseAndRenderHTML = (html: string): ParsedElement[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements = processElement(doc.body.firstElementChild);
  return elements ? [elements] : [];
};

// Inline formatting tags that should be merged into text content
const INLINE_FORMAT_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'span', 'mark', 'small', 'del', 'ins', 'sub', 'sup', 'code'
]);

const processElement = (element: Element | null): ParsedElement | null => {
  if (!element) return null;

  const tagName = element.tagName.toLowerCase();
  const isVoidElement = VOID_ELEMENTS.has(tagName);
  
  // Try to use plugin system to parse the element
  const parsed = pluginManager.parseElement(element);
  if (parsed) {
    
    // Recursively parse children if this is a container element
    if (
      !isVoidElement &&
      (parsed.type === "element" || parsed.type === "repeat-container")
    ) {
      const children: ParsedElement[] = processChildren(element);

      if (parsed.type === "repeat-container") {
        // Handle repeat container items
        const items = children.filter(
          (c) => c.type === "element" && (c as RegularElement).repeatItem
        ) as RegularElement[];
        const nonItemChildren = children.filter(
          (c) => !(c.type === "element" && (c as RegularElement).repeatItem)
        );

        return {
          ...parsed,
          items,
          children: nonItemChildren,
        };
      } else {
        return {
          ...parsed,
          children,
        };
      }
    }

    return parsed;
  }

  // Fallback for elements not handled by plugins
  const id = crypto.randomUUID();

  const attributes = Array.from(element.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);

  const children: ParsedElement[] = isVoidElement ? [] : processChildren(element);

  // Generate preview for section elements
  const preview = tagName === 'section' ? generateSectionPreview(element) : undefined;

  return {
    type: "element",
    tagName,
    attributes,
    children,
    id,
    repeatItem: attributes["data-repeat-item"],
    preview,
  };
};

// Process children and merge consecutive text nodes with inline formatting
const processChildren = (element: Element): ParsedElement[] => {
  const children: ParsedElement[] = [];
  let currentTextContent = '';
  let hasInlineFormatting = false;

  const flushTextContent = () => {
    if (currentTextContent.trim()) {
      children.push({
        type: "text",
        content: currentTextContent.trim(),
        id: crypto.randomUUID(),
      } as ParsedElement);
    }
    currentTextContent = '';
    hasInlineFormatting = false;
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim() || hasInlineFormatting) {
        currentTextContent += text;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = node as Element;
      const childTagName = childElement.tagName.toLowerCase();
      
      // If it's an inline formatting tag, extract its text content and continue merging
      if (INLINE_FORMAT_TAGS.has(childTagName)) {
        hasInlineFormatting = true;
        // Recursively process all child nodes of the inline element
        Array.from(childElement.childNodes).forEach(processNode);
      } else {
        // It's a block element, flush current text and process as separate element
        flushTextContent();
        const processedChild = processElement(childElement);
        if (processedChild) {
          children.push(processedChild);
        }
      }
    }
  };

  Array.from(element.childNodes).forEach(processNode);
  
  // Flush any remaining text content
  flushTextContent();

  return children;
};

// Generate section preview HTML content
const generateSectionPreview = (element: Element): string => {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as Element;
  
  // Apply basic styling to make it look good in preview
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    * {
      font-size: 8px !important;
      line-height: 1.2 !important;
      margin: 0 !important;
      padding: 2px !important;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold !important;
      margin-bottom: 4px !important;
    }
    h1 { font-size: 12px !important; }
    h2 { font-size: 10px !important; }
    h3 { font-size: 9px !important; }
    p { margin-bottom: 4px !important; }
    img {
      max-width: 100% !important;
      height: auto !important;
      max-height: 20px !important;
    }
    .repeat-container {
      border: 1px solid #e5e7eb !important;
      border-radius: 2px !important;
    }
    .repeat-item {
      border-bottom: 1px solid #f3f4f6 !important;
    }
  `;
  
  // Create a temporary container
  const tempContainer = document.createElement('div');
  tempContainer.appendChild(styleElement);
  tempContainer.appendChild(clonedElement);
  
  return tempContainer.innerHTML;
};
