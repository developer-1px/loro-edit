// src/plugins/link/LinkFloatingUI.tsx

import React, { useState } from 'react';
import { ExternalLink, Mail, Phone, Download, Hash } from 'lucide-react';
import { FloatingDropdown, FloatingInput } from '../../features/floating-ui';
import type { DropdownItem } from '../../features/floating-ui';
import type { FloatingUIRenderProps } from '../types';
import type { RegularElement } from '../../types';

type LinkType = 'url' | 'email' | 'phone' | 'download' | 'anchor';

const getLinkTypeIcon = (type: LinkType) => {
  switch (type) {
    case 'url': return <ExternalLink size={14} />;
    case 'email': return <Mail size={14} />;
    case 'phone': return <Phone size={14} />;
    case 'download': return <Download size={14} />;
    case 'anchor': return <Hash size={14} />;
  }
};

const getLinkTypeLabel = (type: LinkType) => {
  switch (type) {
    case 'url': return 'Website';
    case 'email': return 'Email';
    case 'phone': return 'Phone';
    case 'download': return 'Download';
    case 'anchor': return 'Anchor';
  }
};

const getLinkTypePlaceholder = (type: LinkType) => {
  switch (type) {
    case 'url': return 'https://example.com';
    case 'email': return 'user@example.com';
    case 'phone': return '+1-234-567-8900';
    case 'download': return '/path/to/file.pdf';
    case 'anchor': return '#section-id';
  }
};

const detectLinkType = (href: string): LinkType => {
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('#')) return 'anchor';
  if (href.includes('download') || href.match(/\.(pdf|doc|zip|jpg|png)$/i)) return 'download';
  return 'url';
};

export const LinkFloatingUI: React.FC<FloatingUIRenderProps> = ({
  element,
  updateElement
}) => {
  const linkElement = element as RegularElement;
  const currentHref = linkElement.attributes?.href || '';
  
  const [linkType, setLinkType] = useState<LinkType>(detectLinkType(currentHref));
  
  const handleTypeChange = (type: LinkType) => {
    setLinkType(type);
    // Clear href when changing type
    updateElement(element.id, {
      attributes: {
        ...linkElement.attributes,
        href: ''
      }
    });
  };
  
  const handleHrefSave = (href: string) => {
    let formattedHref = href;
    
    // Format href based on type
    switch (linkType) {
      case 'email':
        if (href && !href.startsWith('mailto:')) {
          formattedHref = `mailto:${href}`;
        }
        break;
      case 'phone':
        if (href && !href.startsWith('tel:')) {
          formattedHref = `tel:${href}`;
        }
        break;
      case 'anchor':
        if (href && !href.startsWith('#')) {
          formattedHref = `#${href}`;
        }
        break;
      case 'url':
        if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
          formattedHref = `https://${href}`;
        }
        break;
    }
    
    const attributes: Record<string, string> = {
      ...linkElement.attributes,
      href: formattedHref
    };
    
    // Set target="_blank" for external URLs
    if (linkType === 'url' || linkType === 'download') {
      attributes.target = '_blank';
      attributes.rel = 'noopener noreferrer';
    } else {
      // Remove target for internal links
      delete attributes.target;
      delete attributes.rel;
    }
    
    updateElement(element.id, { attributes });
  };
  
  const typeItems: DropdownItem[] = [
    'url', 'email', 'phone', 'download', 'anchor'
  ].map(type => ({
    id: type,
    label: getLinkTypeLabel(type as LinkType),
    icon: getLinkTypeIcon(type as LinkType),
    onClick: () => handleTypeChange(type as LinkType),
    isActive: linkType === type
  }));
  
  const selectedType = typeItems.find(item => item.isActive);
  
  // Clean href for display (remove prefixes)
  const displayHref = currentHref
    .replace(/^mailto:/, '')
    .replace(/^tel:/, '')
    .replace(/^#/, '');
  
  return (
    <div className="flex items-center gap-2">
      <FloatingDropdown
        items={typeItems}
        selectedItem={selectedType}
        placeholder="Link Type"
        onSelect={() => {
          // Type change is handled in onClick
        }}
      />
      
      <FloatingInput
        value={displayHref}
        onChange={() => {}} // Handle changes in real time if needed
        onSave={handleHrefSave}
        placeholder={getLinkTypePlaceholder(linkType)}
        type={linkType === 'email' ? 'email' : linkType === 'url' ? 'url' : 'text'}
        width="w-48"
      />
    </div>
  );
};