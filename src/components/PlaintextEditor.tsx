import React, { useState, useEffect, useRef, useCallback } from 'react';

interface EditableTextProps {
  text: string;
  onTextChange: (newText: string) => void;
  className?: string;
  elementId: string;
}

interface EditableImageProps {
  src?: string;
  alt?: string;
  onImageChange: (newSrc: string) => void;
  className?: string;
  elementId: string;
}

const EditableText: React.FC<EditableTextProps> = ({ text, onTextChange, className, elementId }) => {
  const [currentText, setCurrentText] = useState(text);
  const textRef = useRef<HTMLSpanElement>(null);
  const originalTextRef = useRef<string>(text);
  const isCommittingRef = useRef<boolean>(false);

  // Update current text when prop changes
  useEffect(() => {
    if (!isCommittingRef.current) {
      setCurrentText(text);
      originalTextRef.current = text;
      if (textRef.current) {
        textRef.current.textContent = text;
      }
    }
  }, [text]);

  // Initialize as editable on mount
  useEffect(() => {
    if (textRef.current) {
      textRef.current.contentEditable = 'plaintext-only';
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (textRef.current && !isCommittingRef.current) {
      isCommittingRef.current = true;
      
      const newText = textRef.current.textContent || '';
      setCurrentText(newText);
      
      // Only trigger change if text actually changed
      if (newText !== originalTextRef.current) {
        onTextChange(newText);
      }
      
      // Reset commit flag after a short delay
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 100);
    }
  }, [onTextChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    } else if (e.key === 'Escape') {
      if (textRef.current) {
        // Restore original text
        textRef.current.textContent = originalTextRef.current;
        setCurrentText(originalTextRef.current);
        textRef.current.blur();
      }
    }
  }, []);

  return (
    <span
      ref={textRef}
      contentEditable="plaintext-only"
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-blue-50 rounded px-1 transition-all duration-200 inline-block min-w-[20px] min-h-[1em]`}
      data-element-id={elementId}
    >
      {currentText || '\u00A0'}
    </span>
  );
};

const EditableImage: React.FC<EditableImageProps> = ({ src, alt, onImageChange, className, elementId }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          return;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div
      className={`${className} relative group`}
      data-element-id={elementId}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Editable image'}
          className="transition-all duration-200 group-hover:opacity-75"
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ outline: 'none' }}
        />
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg text-center transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none flex items-center justify-center ${
            dragOver ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ aspectRatio: 'auto', minHeight: 'auto' }}
        >
          <div className="text-gray-400 p-4">
            <svg className="mx-auto w-8 h-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
      
      {src && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded">
        </div>
      )}
    </div>
  );
};

interface PlaintextEditorProps {}

export const PlaintextEditor: React.FC<PlaintextEditorProps> = () => {
  const [htmlInput, setHtmlInput] = useState(`<div class="min-h-screen bg-gray-50">
  <!-- Hero Section with Image -->
  <section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="text-center lg:text-left">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">Build the Future with AI</h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90">Transform your business with cutting-edge artificial intelligence solutions that drive innovation and growth.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Start Free Trial</button>
            <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">Watch Demo</button>
          </div>
        </div>
        <div class="flex justify-center">
          <picture class="w-full max-w-md">
            <source media="(min-width: 768px)" srcset="">
            <img src="" alt="AI Technology Dashboard" class="w-full h-auto rounded-lg shadow-2xl">
          </picture>
        </div>
      </div>
    </div>
  </section>

  <!-- Navigation Bar -->
  <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold text-gray-900">TechCorp</h2>
          <div class="hidden md:flex space-x-8 ml-8">
            <a href="#" class="text-gray-600 hover:text-gray-900">Products</a>
            <a href="#" class="text-gray-600 hover:text-gray-900">Solutions</a>
            <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
            <a href="#" class="text-gray-600 hover:text-gray-900">Contact</a>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button class="text-gray-600 hover:text-gray-900">Sign In</button>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get Started</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Features Section -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose TechCorp?</h3>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Our platform combines powerful AI capabilities with intuitive design to deliver results that matter.</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h4 class="text-2xl font-bold text-gray-900 mb-6">Advanced AI Dashboard</h4>
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-white text-xs">✓</span>
              </div>
              <p class="text-gray-600">Real-time data processing and analysis</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-white text-xs">✓</span>
              </div>
              <p class="text-gray-600">Customizable workflows and automations</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span class="text-white text-xs">✓</span>
              </div>
              <p class="text-gray-600">Enterprise-grade security and compliance</p>
            </div>
          </div>
        </div>
        <div>
          <picture class="w-full">
            <source media="(min-width: 768px)" srcset="">
            <img src="" alt="Dashboard Screenshot" class="w-full h-auto rounded-lg shadow-lg border">
          </picture>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <picture class="w-16 h-16 mx-auto mb-4 block">
            <img src="" alt="Speed Icon" class="w-full h-full rounded-lg">
          </picture>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
          <p class="text-gray-600">Process data at incredible speeds with our optimized AI algorithms and cloud infrastructure.</p>
        </div>
        
        <div class="text-center p-6">
          <picture class="w-16 h-16 mx-auto mb-4 block">
            <img src="" alt="Security Icon" class="w-full h-full rounded-lg">
          </picture>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h4>
          <p class="text-gray-600">Bank-level security with end-to-end encryption and compliance with global standards.</p>
        </div>
        
        <div class="text-center p-6">
          <picture class="w-16 h-16 mx-auto mb-4 block">
            <img src="" alt="Analytics Icon" class="w-full h-full rounded-lg">
          </picture>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h4>
          <p class="text-gray-600">Get deep insights with real-time analytics and customizable dashboards.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10M+</div>
          <div class="text-gray-300">Users Worldwide</div>
        </div>
        <div>
          <div class="text-3xl md:text-4xl font-bold text-green-400 mb-2">99.9%</div>
          <div class="text-gray-300">Uptime Guarantee</div>
        </div>
        <div>
          <div class="text-3xl md:text-4xl font-bold text-purple-400 mb-2">150+</div>
          <div class="text-gray-300">Countries Served</div>
        </div>
        <div>
          <div class="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
          <div class="text-gray-300">Customer Support</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 bg-blue-600 text-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h3 class="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h3>
      <p class="text-xl mb-8 opacity-90">Join thousands of companies already using our platform to drive innovation.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Start Your Free Trial</button>
        <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">Contact Sales</button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-800 text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <h5 class="text-white font-semibold mb-4">TechCorp</h5>
          <p class="text-sm">Building the future of AI-powered solutions for businesses worldwide.</p>
        </div>
        <div>
          <h6 class="text-white font-semibold mb-4">Product</h6>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">Features</a></li>
            <li><a href="#" class="hover:text-white">Pricing</a></li>
            <li><a href="#" class="hover:text-white">API Docs</a></li>
          </ul>
        </div>
        <div>
          <h6 class="text-white font-semibold mb-4">Company</h6>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">About Us</a></li>
            <li><a href="#" class="hover:text-white">Careers</a></li>
            <li><a href="#" class="hover:text-white">Blog</a></li>
          </ul>
        </div>
        <div>
          <h6 class="text-white font-semibold mb-4">Support</h6>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white">Help Center</a></li>
            <li><a href="#" class="hover:text-white">Contact</a></li>
            <li><a href="#" class="hover:text-white">Status</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
        <p>&copy; 2024 TechCorp. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>`);
  
  const [parsedElements, setParsedElements] = useState<any[]>([]);
  const [textStates, setTextStates] = useState<{[key: string]: string}>({});
  const [imageStates, setImageStates] = useState<{[key: string]: string}>({});
  const [history, setHistory] = useState<Array<{[key: string]: string}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    parseAndRenderHTML(htmlInput);
  }, []);

  const parseAndRenderHTML = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = processElement(doc.body.firstElementChild);
    setParsedElements([elements]);
    
    // Initialize text states with original content
    const initialTextStates: {[key: string]: string} = {};
    const initialImageStates: {[key: string]: string} = {};
    extractTextStates(elements, initialTextStates);
    extractImageStates(elements, initialImageStates);
    setTextStates(initialTextStates);
    setImageStates(initialImageStates);
    setHistory([initialTextStates]);
    setHistoryIndex(0);
  };

  const extractTextStates = (element: any, states: {[key: string]: string}) => {
    if (element && element.type === 'text') {
      states[element.id] = element.content;
    } else if (element && element.children) {
      element.children.forEach((child: any) => extractTextStates(child, states));
    }
  };

  const extractImageStates = (element: any, states: {[key: string]: string}) => {
    if (element && (element.type === 'img' || element.type === 'picture')) {
      if (element.src) {
        states[element.id] = element.src;
      }
    } else if (element && element.children) {
      element.children.forEach((child: any) => extractImageStates(child, states));
    }
  };

  const processElement = (element: Element | null): any => {
    if (!element) return null;

    const tagName = element.tagName.toLowerCase();
    const className = element.getAttribute('class') || '';

    // Handle img tags specially
    if (tagName === 'img') {
      return {
        type: 'img',
        tagName,
        className,
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        id: Math.random().toString(36).substr(2, 9)
      };
    }

    // Handle picture tags specially
    if (tagName === 'picture') {
      // Find the img element inside picture
      const imgElement = element.querySelector('img');
      return {
        type: 'picture',
        tagName,
        className,
        src: imgElement?.getAttribute('src') || '',
        alt: imgElement?.getAttribute('alt') || '',
        id: Math.random().toString(36).substr(2, 9)
      };
    }

    const children: any[] = [];

    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          children.push({
            type: 'text',
            content: text,
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const processedChild = processElement(child as Element);
        if (processedChild) {
          children.push(processedChild);
        }
      }
    }

    return {
      type: 'element',
      tagName,
      className,
      children,
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  const handleTextChange = (textId: string, newText: string) => {
    const newStates = { ...textStates, [textId]: newText };
    setTextStates(newStates);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStates);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Update parsed elements for undo/redo functionality
    const updateElementText = (element: any): any => {
      if (element.type === 'text' && element.id === textId) {
        return { ...element, content: newText };
      } else if (element.children) {
        return {
          ...element,
          children: element.children.map(updateElementText)
        };
      }
      return element;
    };

    setParsedElements(prev => prev.map(updateElementText));
  };

  const handleImageChange = (imageId: string, newSrc: string) => {
    const newImageStates = { ...imageStates, [imageId]: newSrc };
    setImageStates(newImageStates);

    // Update parsed elements for immediate visual feedback
    const updateElementImage = (element: any): any => {
      if ((element.type === 'img' || element.type === 'picture') && element.id === imageId) {
        return { ...element, src: newSrc };
      } else if (element.children) {
        return {
          ...element,
          children: element.children.map(updateElementImage)
        };
      }
      return element;
    };

    setParsedElements(prev => prev.map(updateElementImage));
  };

  const renderElement = (element: any): React.ReactNode => {
    if (element.type === 'text') {
      const currentContent = textStates[element.id] || element.content;
      return (
        <EditableText
          key={element.id}
          elementId={element.id}
          text={currentContent}
          onTextChange={(newText) => handleTextChange(element.id, newText)}
        />
      );
    } else if (element.type === 'img' || element.type === 'picture') {
      const currentSrc = imageStates[element.id] || element.src;
      return (
        <EditableImage
          key={element.id}
          elementId={element.id}
          src={currentSrc}
          alt={element.alt}
          className={element.className}
          onImageChange={(newSrc) => handleImageChange(element.id, newSrc)}
        />
      );
    } else if (element.type === 'element') {
      const Tag = element.tagName as keyof React.JSX.IntrinsicElements;
      return React.createElement(
        Tag,
        { key: element.id, className: element.className },
        element.children.map(renderElement)
      );
    }
    return null;
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const historicalStates = history[newIndex];
      setTextStates(historicalStates);
      applyStates(historicalStates);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const historicalStates = history[newIndex];
      setTextStates(historicalStates);
      applyStates(historicalStates);
    }
  };

  const applyStates = (states: {[key: string]: string}) => {
    const updateElementsWithStates = (element: any): any => {
      if (element.type === 'text') {
        const content = states[element.id] || element.content;
        return { ...element, content };
      } else if (element.children) {
        return {
          ...element,
          children: element.children.map(updateElementsWithStates)
        };
      }
      return element;
    };
    
    setParsedElements(prev => prev.map(updateElementsWithStates));
  };

  const handleNewHTML = () => {
    parseAndRenderHTML(htmlInput);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Panel - Rendered Output */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Live Preview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={historyIndex <= 0}
                title={`Undo (${historyIndex} available)`}
              >
                ↶ Undo
              </button>
              <button
                onClick={handleRedo}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={historyIndex >= history.length - 1}
                title={`Redo (${history.length - 1 - historyIndex} available)`}
              >
                ↷ Redo
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border min-h-full">
            <div className="p-4">
              {parsedElements.map(renderElement)}
            </div>
          </div>
        </div>

        {/* Right Panel - HTML Input */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML Source</h3>
            <p className="text-sm text-gray-600 mb-4">Edit the TailwindCSS HTML below</p>
            
            <button
              onClick={handleNewHTML}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4"
            >
              Apply Changes
            </button>

            <div className="flex justify-between text-xs text-gray-500">
              <span>History: {history.length} steps</span>
              <span>Index: {historyIndex}</span>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className="w-full h-full p-3 border border-gray-300 rounded-md font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your TailwindCSS HTML here..."
              spellCheck={false}
            />
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Quick Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Click text to edit in-place</li>
              <li>• Real-time layout preview</li>
              <li>• Enter saves, Escape cancels</li>
              <li>• Images maintain original dimensions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};