// src/plugins/button/ButtonFloatingUI.tsx

import React, { useState } from 'react';
import { MousePointer, ExternalLink, Send, Layers, ArrowDown } from 'lucide-react';
import { FloatingDropdown, FloatingInput } from '../../features/floating-ui';
import type { DropdownItem } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import type { RegularElement } from '../../types';

type ActionType = 'linkTo' | 'submit' | 'onClick' | 'openModal' | 'scrollTo';

const getActionIcon = (type: ActionType) => {
  switch (type) {
    case 'linkTo': return <ExternalLink size={14} />;
    case 'submit': return <Send size={14} />;
    case 'onClick': return <MousePointer size={14} />;
    case 'openModal': return <Layers size={14} />;
    case 'scrollTo': return <ArrowDown size={14} />;
  }
};

const getActionLabel = (type: ActionType) => {
  switch (type) {
    case 'linkTo': return 'Link To';
    case 'submit': return 'Submit Form';
    case 'onClick': return 'On Click';
    case 'openModal': return 'Open Modal';
    case 'scrollTo': return 'Scroll To';
  }
};

export const ButtonFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement
}) => {
  const buttonElement = element as RegularElement;
  const currentAction = (buttonElement.attributes?.['data-action-type'] as ActionType) || 'onClick';
  const currentUrl = buttonElement.attributes?.['data-link-url'] || '';
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  
  const handleActionChange = (actionType: ActionType) => {
    updateElement(element.id, {
      attributes: {
        ...buttonElement.attributes,
        'data-action-type': actionType
      }
    });
    
    if (actionType === 'linkTo') {
      setShowLinkInput(true);
    } else {
      setShowLinkInput(false);
    }
  };
  
  const handleUrlSave = (url: string) => {
    updateElement(element.id, {
      attributes: {
        ...buttonElement.attributes,
        'data-link-url': url
      }
    });
  };
  
  const actionItems: DropdownItem[] = [
    'linkTo', 'submit', 'onClick', 'openModal', 'scrollTo'
  ].map(type => ({
    id: type,
    label: getActionLabel(type as ActionType),
    icon: getActionIcon(type as ActionType),
    onClick: () => handleActionChange(type as ActionType),
    isActive: currentAction === type
  }));
  
  const selectedItem = actionItems.find(item => item.isActive);
  
  return (
    <div className="flex items-center gap-2">
      <FloatingDropdown
        items={actionItems}
        selectedItem={selectedItem}
        onSelect={(item) => {
          if (item.id === 'linkTo') {
            setShowLinkInput(true);
          }
        }}
      />
      
      {(currentAction === 'linkTo' || showLinkInput) && (
        <FloatingInput
          value={currentUrl}
          onChange={() => {}} // Handle changes in real time if needed
          onSave={handleUrlSave}
          placeholder="https://..."
          type="url"
          autoFocus={showLinkInput}
          width="w-40"
        />
      )}
    </div>
  );
};