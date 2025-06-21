// src/plugins/index.ts

import { pluginManager } from "./PluginManager";
import { textPlugin } from "./text";
import { imagePlugin } from "./image";
import { repeatContainerPlugin } from "./repeat-container";
import { sectionPlugin } from "./section";
import { elementPlugin } from "./element";

// Register all default plugins
export const registerDefaultPlugins = () => {
  // Register plugins in order (higher priority plugins first)
  pluginManager.register(textPlugin);
  pluginManager.register(imagePlugin);
  pluginManager.register(repeatContainerPlugin);
  pluginManager.register(sectionPlugin);
  pluginManager.register(elementPlugin); // Fallback plugin with lowest priority
};

// Re-export everything
export { pluginManager } from "./PluginManager";
export * from "./types";
export { textPlugin } from "./text";
export { imagePlugin } from "./image";
export { repeatContainerPlugin } from "./repeat-container";
export { sectionPlugin } from "./section";
export { elementPlugin } from "./element";
