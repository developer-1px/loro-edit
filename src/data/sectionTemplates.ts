import type { SectionTemplate } from '../types';

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'test-simple-text',
    name: 'Test Simple Text',
    category: 'Test',
    thumbnail: '🧪',
    description: 'Simple text for testing',
    html: `<p>This is a simple test text</p>`
  },
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
    id: 'hero-split',
    name: 'Hero Split',
    category: 'Hero Sections',
    thumbnail: '📱',
    description: 'Two column hero with image',
    html: `<section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Welcome to the Future of Design</h1>
          <p class="text-xl text-gray-600 mb-8">Build stunning websites with our intuitive visual editor. No coding required.</p>
          <div class="flex flex-wrap gap-4">
            <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">Start Free Trial</button>
            <button class="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50">Watch Demo</button>
          </div>
        </div>
        <div class="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
          <img src="https://via.placeholder.com/600x400" alt="Hero Image" class="rounded-lg shadow-lg" />
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
    id: 'features-alternating',
    name: 'Features Alternating',
    category: 'Content Sections',
    thumbnail: '🔄',
    description: 'Alternating left/right feature blocks',
    html: `<section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Discover what makes our platform unique.</p>
        </div>
        <div class="space-y-20">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Visual Editor</h3>
              <p class="text-lg text-gray-600 mb-6">Design beautiful layouts with our intuitive drag-and-drop editor. No coding skills required.</p>
              <a href="#" class="text-blue-600 font-semibold hover:text-blue-700">Learn more →</a>
            </div>
            <div class="bg-gray-200 rounded-lg h-64"></div>
          </div>
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="order-2 md:order-1 bg-gray-200 rounded-lg h-64"></div>
            <div class="order-1 md:order-2">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
              <p class="text-lg text-gray-600 mb-6">Work together in real-time with your team. Share projects and get feedback instantly.</p>
              <a href="#" class="text-blue-600 font-semibold hover:text-blue-700">Learn more →</a>
            </div>
          </div>
        </div>
      </div>
    </section>`
  },
  {
    id: 'testimonials-grid',
    name: 'Testimonials Grid',
    category: 'Social Proof',
    thumbnail: '💬',
    description: 'Customer testimonials in a grid',
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
    id: 'testimonials-carousel',
    name: 'Testimonials Carousel',
    category: 'Social Proof',
    thumbnail: '🎠',
    description: 'Single testimonial with navigation',
    html: `<section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-12">What People Are Saying</h2>
        <div class="bg-gray-50 rounded-2xl p-12">
          <blockquote class="text-2xl text-gray-700 italic mb-8">"This is the best tool we've ever used. It has completely revolutionized our workflow and increased our productivity by 300%."</blockquote>
          <div class="flex items-center justify-center space-x-4">
            <img src="https://via.placeholder.com/64" alt="Avatar" class="w-16 h-16 rounded-full" />
            <div class="text-left">
              <p class="font-semibold text-gray-900">Emily Rodriguez</p>
              <p class="text-gray-600">VP of Engineering, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </section>`
  },
  {
    id: 'cta-simple',
    name: 'Simple CTA',
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
  },
  {
    id: 'cta-split',
    name: 'Split CTA',
    category: 'CTA Sections',
    thumbnail: '📣',
    description: 'Two column CTA with form',
    html: `<section class="py-20 bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold mb-6">Start Your Free Trial Today</h2>
          <p class="text-xl mb-8 text-gray-300">No credit card required. Get started in minutes.</p>
          <ul class="space-y-3 text-gray-300">
            <li class="flex items-center"><span class="mr-3">✓</span> 14-day free trial</li>
            <li class="flex items-center"><span class="mr-3">✓</span> No setup fees</li>
            <li class="flex items-center"><span class="mr-3">✓</span> Cancel anytime</li>
          </ul>
        </div>
        <div class="bg-white p-8 rounded-lg text-gray-900">
          <form class="space-y-4">
            <input type="email" placeholder="Your email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <input type="password" placeholder="Choose password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Create Account</button>
          </form>
        </div>
      </div>
    </section>`
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    category: 'Pricing',
    thumbnail: '💰',
    description: 'Three tier pricing table',
    html: `<section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Choose the plan that's right for you.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="border border-gray-200 rounded-lg p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Starter</h3>
            <p class="text-4xl font-bold text-gray-900 mb-6">$29<span class="text-base font-normal text-gray-600">/month</span></p>
            <ul class="space-y-3 mb-8 text-gray-600">
              <li>✓ Up to 10 projects</li>
              <li>✓ Basic analytics</li>
              <li>✓ 24/7 support</li>
            </ul>
            <button class="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">Get Started</button>
          </div>
          <div class="border-2 border-blue-600 rounded-lg p-8 relative">
            <span class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Popular</span>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Professional</h3>
            <p class="text-4xl font-bold text-gray-900 mb-6">$79<span class="text-base font-normal text-gray-600">/month</span></p>
            <ul class="space-y-3 mb-8 text-gray-600">
              <li>✓ Unlimited projects</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
              <li>✓ Custom integrations</li>
            </ul>
            <button class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Get Started</button>
          </div>
          <div class="border border-gray-200 rounded-lg p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Enterprise</h3>
            <p class="text-4xl font-bold text-gray-900 mb-6">Custom</p>
            <ul class="space-y-3 mb-8 text-gray-600">
              <li>✓ Everything in Pro</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ Custom contracts</li>
              <li>✓ SLA guarantee</li>
            </ul>
            <button class="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>`
  },
  {
    id: 'footer-simple',
    name: 'Simple Footer',
    category: 'Footer',
    thumbnail: '🦶',
    description: 'Basic footer with links',
    html: `<footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-xl font-bold mb-4">Company</h3>
            <p class="text-gray-400">Building the future of web design.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Features</a></li>
              <li><a href="#" class="hover:text-white">Pricing</a></li>
              <li><a href="#" class="hover:text-white">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">About</a></li>
              <li><a href="#" class="hover:text-white">Blog</a></li>
              <li><a href="#" class="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Privacy</a></li>
              <li><a href="#" class="hover:text-white">Terms</a></li>
              <li><a href="#" class="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>`
  }
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Hero Sections',
  'Content Sections',
  'Social Proof',
  'CTA Sections',
  'Pricing',
  'Footer'
];

export function getTemplatesByCategory(category: string): SectionTemplate[] {
  if (category === 'All') {
    return SECTION_TEMPLATES;
  }
  return SECTION_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find(template => template.id === id);
}