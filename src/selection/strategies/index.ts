// Selection Strategies Index

export { BaseSelectionStrategy } from './BaseSelectionStrategy';
export type { BaseStrategyConfig } from './BaseSelectionStrategy';

export { TextSelectionStrategy } from './TextSelectionStrategy';
export { ContainerSelectionStrategy } from './ContainerSelectionStrategy';
export { InteractiveSelectionStrategy } from './InteractiveSelectionStrategy';
export { MediaSelectionStrategy } from './MediaSelectionStrategy';

// Import for factory functions
import { TextSelectionStrategy } from './TextSelectionStrategy';
import { ContainerSelectionStrategy } from './ContainerSelectionStrategy';
import { InteractiveSelectionStrategy } from './InteractiveSelectionStrategy';
import { MediaSelectionStrategy } from './MediaSelectionStrategy';

// Convenience factory functions
export const strategies = {
  text: () => new TextSelectionStrategy(),
  container: (priority?: number) => new ContainerSelectionStrategy(priority),
  interactive: () => new InteractiveSelectionStrategy(),
  media: () => new MediaSelectionStrategy(),
};