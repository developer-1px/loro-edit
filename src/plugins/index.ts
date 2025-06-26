// src/plugins/index.ts

import { pluginManager } from "./PluginManager";
import { textPlugin } from "./text";
import { paragraphPlugin } from "./paragraph";
import { buttonPlugin } from "./button";
import { sectionPlugin } from "./section";
import { imagePlugin } from "./image";
import { svgPlugin } from "./svg";
import { repeatItemPlugin } from "./repeat-item";
import { formPlugin } from "./form";
import { inputPlugin } from "./input";
import { linkPlugin } from "./link";
import { tablePlugin } from "./table";
import { fallbackPlugin as elementPlugin } from "./fallback";

let pluginsRegistered = false;

// Register all default plugins
export const registerDefaultPlugins = () => {
  if (pluginsRegistered) return;
  
  console.log('📦 Registering plugins...');
  
  // Clear any existing plugins to ensure correct order (important for HMR)
  pluginManager.clearAllPlugins();
  
  // Register plugins in priority order
  pluginManager.register(repeatItemPlugin); // Higher priority for repeat items
  pluginManager.register(formPlugin);
  pluginManager.register(buttonPlugin);
  pluginManager.register(linkPlugin);
  pluginManager.register(inputPlugin);
  pluginManager.register(imagePlugin);
  pluginManager.register(svgPlugin);
  pluginManager.register(sectionPlugin);
  pluginManager.register(tablePlugin);
  pluginManager.register(paragraphPlugin); // Handle <p> tags
  pluginManager.register(textPlugin);
  pluginManager.register(elementPlugin); // Must be last as fallback
  
  console.log('✅ Registered plugins:', pluginManager.plugins.map(p => p.name));
  pluginsRegistered = true;
};

// Re-export everything
export { pluginManager } from "./PluginManager";
export * from "./types";
export { textPlugin } from "./text";
export { paragraphPlugin } from "./paragraph";
export { buttonPlugin } from "./button";
export { sectionPlugin } from "./section";
export { imagePlugin } from "./image";
export { svgPlugin } from "./svg";
export { repeatItemPlugin } from "./repeat-item";
export { formPlugin } from "./form";
export { inputPlugin } from "./input";
export { linkPlugin } from "./link";
export { tablePlugin } from "./table";
export { fallbackPlugin as elementPlugin } from "./fallback";
