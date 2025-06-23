// src/plugins/index.ts

import { pluginManager } from "./PluginManager";
import { textPlugin } from "./text";
import { buttonPlugin } from "./button";
import { sectionPlugin } from "./section";
import { imagePlugin } from "./image";
import { svgPlugin } from "./svg";
import { repeatItemPlugin } from "./repeat-item";
import { fallbackPlugin as elementPlugin } from "./fallback";

let pluginsRegistered = false;

// Register all default plugins
export const registerDefaultPlugins = () => {
  if (pluginsRegistered) return;
  
  // Register plugins in priority order
  pluginManager.register(repeatItemPlugin); // Higher priority for repeat items
  pluginManager.register(buttonPlugin);
  pluginManager.register(imagePlugin);
  pluginManager.register(svgPlugin);
  pluginManager.register(sectionPlugin);
  pluginManager.register(textPlugin);
  pluginManager.register(elementPlugin); // Must be last as fallback
  pluginsRegistered = true;
};

// Re-export everything
export { pluginManager } from "./PluginManager";
export * from "./types";
export { textPlugin } from "./text";
export { buttonPlugin } from "./button";
export { sectionPlugin } from "./section";
export { imagePlugin } from "./image";
export { svgPlugin } from "./svg";
export { repeatItemPlugin } from "./repeat-item";
export { fallbackPlugin as elementPlugin } from "./fallback";
