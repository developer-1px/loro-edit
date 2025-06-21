export const INITIAL_HTML = `<div class="min-h-screen bg-gray-50">
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
  <nav class="bg-white shadow-sm border-b top-0 z-50">
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

      <div class="grid md:grid-cols-3 gap-8" data-repeat-container="features">
        <div class="text-center p-6" data-repeat-item="feature-1">
          <picture class="w-16 h-16 mx-auto mb-4 block">
            <img src="" alt="Speed Icon" class="w-full h-full rounded-lg">
          </picture>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
          <p class="text-gray-600">Process data at incredible speeds with our optimized AI algorithms and cloud infrastructure.</p>
        </div>
        
        <div class="text-center p-6" data-repeat-item="feature-2">
          <picture class="w-16 h-16 mx-auto mb-4 block">
            <img src="" alt="Security Icon" class="w-full h-full rounded-lg">
          </picture>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h4>
          <p class="text-gray-600">Bank-level security with end-to-end encryption and compliance with global standards.</p>
        </div>
        
        <div class="text-center p-6" data-repeat-item="feature-3">
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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" data-repeat-container="stats">
        <div data-repeat-item="stat-1">
          <div class="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10M+</div>
          <div class="text-gray-300">Users Worldwide</div>
        </div>
        <div data-repeat-item="stat-2">
          <div class="text-3xl md:text-4xl font-bold text-green-400 mb-2">99.9%</div>
          <div class="text-gray-300">Uptime Guarantee</div>
        </div>
        <div data-repeat-item="stat-3">
          <div class="text-3xl md:text-4xl font-bold text-purple-400 mb-2">150+</div>
          <div class="text-gray-300">Countries Served</div>
        </div>
        <div data-repeat-item="stat-4">
          <div class="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
          <div class="text-gray-300">Customer Support</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Database Integration Section -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Data Integration</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">Connect to any API and visualize your data in real-time with our powerful database integration features.</p>
      </div>
      
      <div data-database="User Analytics" 
           data-api-url="https://jsonplaceholder.typicode.com/users" 
           data-view-mode="cards"
           class="mb-12"
           id="user-analytics-db">
        <!-- Database content will be rendered here -->
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
</div>`;
