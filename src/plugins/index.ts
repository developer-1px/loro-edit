// src/plugins/index.ts

import { pluginManager } from "./PluginManager";
import { textPlugin } from "./text";
import { imagePlugin } from "./image";
import { svgPlugin } from "./svg";
import { buttonPlugin } from "./button";
import { repeatItemPlugin } from "./repeat-item";
import { sectionPlugin } from "./section";
import { elementPlugin } from "./element";

let pluginsRegistered = false;

// Register all default plugins
export const registerDefaultPlugins = () => {
  if (pluginsRegistered) {
    console.log("Plugins already registered, skipping...");
    return;
  }
  
  console.log("Registering default plugins...");
  // Register plugins in order (higher priority plugins first)
  pluginManager.register(imagePlugin);
  pluginManager.register(svgPlugin);
  pluginManager.register(buttonPlugin);
  pluginManager.register(repeatItemPlugin);
  // pluginManager.register(repeatContainerPlugin);
  // pluginManager.register(databasePlugin);
  pluginManager.register(sectionPlugin);
  pluginManager.register(elementPlugin); // Fallback plugin with lowest priority
  pluginManager.register(textPlugin);
  console.log(
    "Registered plugins:",
    pluginManager.plugins.map((p) => p.name)
  );
  pluginsRegistered = true;
};

// Re-export everything
export { pluginManager } from "./PluginManager";
export * from "./types";
export { textPlugin } from "./text";
export { imagePlugin } from "./image";
export { svgPlugin } from "./svg";
export { buttonPlugin } from "./button";
export { repeatItemPlugin } from "./repeat-item";
export { sectionPlugin } from "./section";
export { elementPlugin } from "./element";
