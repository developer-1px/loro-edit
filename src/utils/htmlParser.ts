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
      const children: ParsedElement[] = Array.from(element.childNodes)
        .map((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              return {
                type: "text",
                content: text,
                id: crypto.randomUUID(),
              } as ParsedElement;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            return processElement(child as Element);
          }
          return null;
        })
        .filter((child): child is ParsedElement => child !== null);

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

  const children: ParsedElement[] = isVoidElement
    ? []
    : Array.from(element.childNodes)
        .map((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              return {
                type: "text",
                content: text,
                id: crypto.randomUUID(),
              } as ParsedElement;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            return processElement(child as Element);
          }
          return null;
        })
        .filter((child): child is ParsedElement => child !== null);

  return {
    type: "element",
    tagName,
    attributes,
    children,
    id,
    repeatItem: attributes["data-repeat-item"],
  };
};
