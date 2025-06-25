// src/plugins/text/TextFloatingUI.tsx

import React, { useState } from 'react';
import { Type, Link as LinkIcon } from 'lucide-react';
import { FloatingDropdown } from '../../features/floating-ui';
import type { DropdownItem } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import { useEditorStore } from '../../store/editorStore';
import { getParentLinkInfo } from '../../utils/parentElementUtils';
import { LinkFloatingUI } from '../link/LinkFloatingUI';

export const TextFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement,
  selectionColor
}) => {
  const parsedElements = useEditorStore(state => state.parsedElements);
  
  // 상위 링크 정보 확인
  const parentLink = getParentLinkInfo(element.id, parsedElements);
  
  const [activeTab, setActiveTab] = useState<'text' | 'link'>('text');
  
  // 텍스트 스타일 옵션
  const textStyleItems: DropdownItem[] = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <Type size={14} />,
      onClick: () => {
        // 텍스트 스타일 변경 로직
      }
    },
    {
      id: 'bold',
      label: 'Bold', 
      icon: <Type size={14} style={{ fontWeight: 'bold' }} />,
      onClick: () => {
        // Bold 스타일 적용 로직
      }
    }
  ];

  return (
    <div className="flex items-center gap-1">
      {/* 상위 링크가 있으면 탭 표시 */}
      {parentLink && (
        <div className="flex items-center gap-0.5 mr-1">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-1.5 py-0.5 rounded text-[9px] ${
              activeTab === 'text' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ borderColor: selectionColor }}
          >
            <Type size={10} />
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`px-1.5 py-0.5 rounded text-[9px] ${
              activeTab === 'link' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ borderColor: selectionColor }}
          >
            <LinkIcon size={10} />
          </button>
        </div>
      )}

      {/* 현재 활성 탭에 따라 UI 표시 */}
      {activeTab === 'text' && (
        <>
          <FloatingDropdown
            items={textStyleItems}
            placeholder="Style"
            selectionColor={selectionColor}
          />
        </>
      )}

      {/* 링크 편집 UI */}
      {activeTab === 'link' && parentLink && (
        <LinkFloatingUI
          element={parentLink}
          updateElement={updateElement}
          selectionColor={selectionColor}
          isOpen={true}
          onClose={() => {}}
        />
      )}
    </div>
  );
};