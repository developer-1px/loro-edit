// src/plugins/utils.ts

import type { ParsedElement } from '../types';
import { VOID_ELEMENTS } from '../utils/voidElements';

// 공통 DOM 속성 파싱 유틸리티
export function parseAttributes(element: Element): Record<string, string> {
  return Array.from(element.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);
}

// 기본 요소 파싱 유틸리티
export function parseBasicElement(element: Element, type: ParsedElement['type']): ParsedElement {
  const tagName = element.tagName.toLowerCase();
  const isVoidElement = VOID_ELEMENTS.has(tagName);
  
  return {
    type,
    id: element.id || crypto.randomUUID(),
    tagName,
    attributes: parseAttributes(element),
    children: isVoidElement ? undefined : [], // Don't set children for void elements
    repeatItem: element.getAttribute("data-repeat-item") || undefined,
  } as ParsedElement;
}

// 공통 래퍼 컴포넌트 속성 생성
export function createElementProps(parsedElement: ParsedElement, isSelected?: boolean) {
  const hasAttributes = 'attributes' in parsedElement;
  // Currently not using isSelected but keeping for future use
  void isSelected;
  return {
    key: parsedElement.id,
    'data-element-id': parsedElement.id,
    id: hasAttributes && parsedElement.attributes?.id ? parsedElement.attributes.id : undefined,
    className: hasAttributes ? parsedElement.attributes?.class || "" : "",
  };
}