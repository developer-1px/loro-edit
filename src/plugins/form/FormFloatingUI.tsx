// src/plugins/form/FormFloatingUI.tsx

import React from 'react';
import { Settings, Globe, Lock, Send } from 'lucide-react';
import { FloatingDropdown, FloatingInput } from '../../features/floating-ui';
import type { DropdownItem } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import type { RegularElement } from '../../types';

type FormMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const getMethodIcon = (method: FormMethod) => {
  switch (method) {
    case 'GET': return <Globe size={14} />;
    case 'POST': return <Send size={14} />;
    case 'PUT': return <Settings size={14} />;
    case 'PATCH': return <Settings size={14} />;
    case 'DELETE': return <Lock size={14} />;
  }
};

export const FormFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement,
  selectionColor
}) => {
  const formElement = element as RegularElement;
  const currentMethod = (formElement.attributes?.method as FormMethod) || 'POST';
  const currentAction = formElement.attributes?.action || '';
  
  const handleMethodChange = (method: FormMethod) => {
    updateElement(element.id, {
      attributes: {
        ...formElement.attributes,
        method: method.toLowerCase()
      }
    });
  };
  
  const handleActionSave = (action: string) => {
    updateElement(element.id, {
      attributes: {
        ...formElement.attributes,
        action: action
      }
    });
  };
  
  const methodItems: DropdownItem[] = [
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
  ].map(method => ({
    id: method,
    label: method,
    icon: getMethodIcon(method as FormMethod),
    onClick: () => handleMethodChange(method as FormMethod),
    isActive: currentMethod.toUpperCase() === method
  }));
  
  const selectedMethod = methodItems.find(item => item.isActive);
  
  return (
    <div className="flex items-center gap-2">
      <FloatingDropdown
        items={methodItems}
        selectedItem={selectedMethod}
        placeholder="Method"
        onSelect={() => {
          // Method is already updated in onClick
        }}
        selectionColor={selectionColor}
      />
      
      <FloatingInput
        value={currentAction}
        onChange={() => {}} // Handle changes in real time if needed
        onSave={handleActionSave}
        placeholder="/api/endpoint"
        type="text"
        width="w-48"
        selectionColor={selectionColor}
      />
    </div>
  );
};