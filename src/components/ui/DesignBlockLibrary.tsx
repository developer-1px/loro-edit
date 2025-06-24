// src/components/ui/DesignBlockLibrary.tsx

import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { parseAndRenderHTML } from '../../utils/htmlParser';

interface DesignBlock {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  html: string;
  description: string;
}

const DESIGN_BLOCKS: DesignBlock[] = [
  {
    id: 'hero-gradient',
    name: 'Hero Gradient',
    category: 'Hero Sections',
    thumbnail: '🎨',
    description: 'Gradient background hero with CTA buttons',
    html: `<section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-6">Build Something Amazing</h1>
        <p class="text-xl mb-8 opacity-90">Create beautiful websites with our powerful tools and components.</p>
        <div class="flex justify-center space-x-4">
          <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Get Started</button>
          <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">Learn More</button>
        </div>
      </div>
    </section>`
  },
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'Content Sections',
    thumbnail: '⚡',
    description: 'Three column features with icons',
    html: `<section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Amazing Features</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to build modern applications.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-6" data-repeat-item="feature">
            <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-lg">
              <span class="text-2xl">⚡</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
            <p class="text-gray-600">Optimized for speed and performance.</p>
          </div>
          <div class="text-center p-6" data-repeat-item="feature">
            <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-lg">
              <span class="text-2xl">🔒</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Secure</h3>
            <p class="text-gray-600">Enterprise-grade security built-in.</p>
          </div>
          <div class="text-center p-6" data-repeat-item="feature">
            <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-purple-100 rounded-lg">
              <span class="text-2xl">📊</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Analytics</h3>
            <p class="text-gray-600">Deep insights and analytics.</p>
          </div>
        </div>
      </div>
    </section>`
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'Social Proof',
    thumbnail: '💬',
    description: 'Customer testimonials grid',
    html: `<section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Hear from companies who trust our platform.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
            <blockquote class="text-gray-600 italic mb-4">"This platform has transformed how we work. Incredible results!"</blockquote>
            <p class="font-semibold text-gray-900">- John Smith, CEO</p>
          </div>
          <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
            <blockquote class="text-gray-600 italic mb-4">"Easy to use and powerful. Highly recommended for teams."</blockquote>
            <p class="font-semibold text-gray-900">- Sarah Johnson, CTO</p>
          </div>
          <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
            <blockquote class="text-gray-600 italic mb-4">"The best investment we've made for our business."</blockquote>
            <p class="font-semibold text-gray-900">- Mike Chen, Founder</p>
          </div>
        </div>
      </div>
    </section>`
  },
  {
    id: 'cta-simple',
    name: 'Call to Action',
    category: 'CTA Sections',
    thumbnail: '🚀',
    description: 'Simple centered call to action',
    html: `<section class="py-20 bg-blue-600 text-white">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p class="text-xl mb-8 opacity-90">Join thousands of companies already using our platform.</p>
        <div class="flex justify-center space-x-4">
          <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Start Free Trial</button>
          <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">Contact Sales</button>
        </div>
      </div>
    </section>`
  }
];

const CATEGORIES = ['All', 'Hero Sections', 'Content Sections', 'Social Proof', 'CTA Sections'];

export const DesignBlockLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { parsedElements, setParsedElements } = useEditorStore();

  const filteredBlocks = selectedCategory === 'All' 
    ? DESIGN_BLOCKS 
    : DESIGN_BLOCKS.filter(block => block.category === selectedCategory);

  const addBlock = (block: DesignBlock) => {
    const newElements = parseAndRenderHTML(block.html);
    if (newElements.length > 0) {
      setParsedElements([...parsedElements, ...newElements]);
    }
  };

  return (
    <div className="p-4">
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Design Blocks Grid */}
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <div
            key={block.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              <span className="text-3xl">{block.thumbnail}</span>
              <button
                onClick={() => addBlock(block)}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center group"
              >
                <div className="bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlusIcon size={16} />
                </div>
              </button>
            </div>
            
            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm mb-1">{block.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{block.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {block.category}
                </span>
                <button
                  onClick={() => addBlock(block)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No blocks found in this category</p>
        </div>
      )}
    </div>
  );
};