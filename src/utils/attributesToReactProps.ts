// src/utils/attributesToReactProps.ts

// A map of HTML attributes that have a different name in React
const attributeNameMap: Record<string, string> = {
  class: "className",
  for: "htmlFor",

  // SVG attributes that are camelCased in React
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-width": "strokeWidth",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "text-anchor": "textAnchor",
  "xmlns:xlink": "xmlnsXlink",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  "xml:lang": "xmlLang",
};

// Converts a string from kebab-case to camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/[-:]([a-z])/g, (g) => g[1].toUpperCase());
};

export const attributesToReactProps = (
  attributes: Record<string, string>
): Record<string, unknown> => {
  const props: Record<string, unknown> = {};

  for (const key in attributes) {
    const value = attributes[key];

    // Pass through data-* and aria-* attributes as is
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      props[key] = value;
      continue;
    }

    // Check our explicit map for special cases, otherwise convert to camelCase
    const reactPropName = attributeNameMap[key] || toCamelCase(key);
    props[reactPropName] = value;
  }
  return props;
};
