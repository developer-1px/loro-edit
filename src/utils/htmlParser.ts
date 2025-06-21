// src/utils/htmlParser.ts

import type { ParsedElement, RegularElement } from '../types';

export const parseAndRenderHTML = (html: string): ParsedElement[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = processElement(doc.body.firstElementChild);
  return elements ? [elements] : [];
};

const processElement = (element: Element | null): ParsedElement | null => {
  if (!element) return null;

  const tagName = element.tagName.toLowerCase();
  const className = element.getAttribute('class') || '';
  const repeatContainer = element.getAttribute('data-repeat-container');
  const repeatItem = element.getAttribute('data-repeat-item');
  const id = Math.random().toString(36).substr(2, 9);

  if (tagName === 'img') {
    return {
      type: 'img',
      tagName,
      className,
      src: element.getAttribute('src') || '',
      alt: element.getAttribute('alt') || '',
      id,
      repeatItem: repeatItem || undefined,
    };
  }

  if (tagName === 'picture') {
    const imgElement = element.querySelector('img');
    return {
      type: 'picture',
      tagName,
      className,
      src: imgElement?.getAttribute('src') || '',
      alt: imgElement?.getAttribute('alt') || '',
      id,
      repeatItem: repeatItem || undefined,
    };
  }

  const children: ParsedElement[] = Array.from(element.childNodes)
    .map((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          return {
            type: 'text',
            content: text,
            id: Math.random().toString(36).substr(2, 9),
          } as ParsedElement;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        return processElement(child as Element);
      }
      return null;
    })
    .filter((child): child is ParsedElement => child !== null);

  if (repeatContainer) {
    const items = children.filter(
      (c) => c.type === 'element' && c.repeatItem
    ) as RegularElement[];
    const nonItemChildren = children.filter(
      (c) => !(c.type === 'element' && c.repeatItem)
    );

    return {
      type: 'repeat-container',
      tagName,
      className,
      repeatContainer,
      items,
      children: nonItemChildren,
      id,
    };
  }

  return {
    type: 'element',
    tagName,
    className,
    children,
    id,
    repeatItem: repeatItem || undefined,
  };
};