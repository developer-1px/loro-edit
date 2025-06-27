// Media Selection Strategy (images, videos, etc.)

import { BaseSelectionStrategy } from './BaseSelectionStrategy';
// Media selection doesn't need context types directly

export class MediaSelectionStrategy extends BaseSelectionStrategy {
  constructor() {
    super({
      basePriority: 90, // High priority for media
      supportedModes: ['block'],
      priorityModifiers: {
        directClick: 60, // Very high boost for direct clicks on media
        custom: (element, context) => {
          // Media elements should almost always be selected when clicked
          const rect = element.getBoundingClientRect();
          const { x, y } = context.point;
          
          // Check if click is within the media bounds
          if (x >= rect.left && x <= rect.right && 
              y >= rect.top && y <= rect.bottom) {
            return 30;
          }
          
          return 0;
        }
      }
    });
  }
}