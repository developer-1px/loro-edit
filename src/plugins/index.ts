// src/plugins/index.ts

import { pluginManager } from "./PluginManager";
import { textPlugin } from "./text";
import { imagePlugin } from "./image";
import { svgPlugin } from "./svg";
import { repeatContainerPlugin } from "./repeat-container";
import { sectionPlugin } from "./section";
import { elementPlugin } from "./element";
import { databasePlugin } from "./database";

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
  pluginManager.register(repeatContainerPlugin);
  pluginManager.register(databasePlugin);
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
export { repeatContainerPlugin } from "./repeat-container";
export { databasePlugin } from "./database";
export { sectionPlugin } from "./section";
export { elementPlugin } from "./element";
