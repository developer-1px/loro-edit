export const INITIAL_HTML = `<div class="min-h-screen bg-gray-50">
  <!-- Hero Section with Image -->
  <section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="text-center lg:text-left">
          <h1 class="text-xl md:text-2xl font-bold mb-3">Build the Future with AI</h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90">Transform your business with cutting-edge artificial intelligence solutions that drive innovation and growth.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100" data-action-type="onClick">Start Free Trial</button>
            <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600" data-action-type="linkTo" data-link-url="https://youtube.com/watch?v=demo">Watch Demo</button>
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
            <a href="#products" class="text-gray-600 hover:text-gray-900">Products</a>
            <a href="#solutions" class="text-gray-600 hover:text-gray-900">Solutions</a>
            <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
            <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
            <a href="https://github.com/techcorp" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-900">GitHub</a>
            <a href="https://docs.techcorp.com" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-900">Docs</a>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button class="text-gray-600 hover:text-gray-900" data-action-type="linkTo" data-link-url="/login">Sign In</button>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" data-action-type="openModal">Get Started</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Features Section -->
  <section id="products" class="py-20 bg-white">
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
              <p class="text-gray-600">Customizable <code>workflows</code> and <em>automations</em></p>
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
        <div class="text-center p-6" data-repeat-item="feature">
          <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-lg">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
          <p class="text-gray-600">Process data at <em>incredible speeds</em> with our optimized AI algorithms and cloud infrastructure.</p>
        </div>
        
        <div class="text-center p-6" data-repeat-item="feature">
          <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-lg">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-1.549a12.019 12.019 0 01.44-2.008l4.062-1.132a12.019 12.019 0 01.44 2.008l5.611 1.549A12.02 12.02 0 0021 8.984a11.955 11.955 0 01-2.382-3.001z"></path></svg>
          </div>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h4>
          <p class="text-gray-600">Bank-level security with <code>end-to-end</code> encryption and compliance with global standards.</p>
        </div>
        
        <div class="text-center p-6" data-repeat-item="feature">
          <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-purple-100 rounded-lg">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path></svg>
          </div>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h4>
          <p class="text-gray-600">Get deep insights with real-time analytics and <strong>customizable</strong> dashboards.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="solutions" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Hear from companies who have transformed their business with TechCorp.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 text-center">
        <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
          <blockquote class="text-gray-600 italic">"The AI-powered analytics have given us insights we never thought possible. It's a game-changer for our marketing strategy."</blockquote>
          <p class="mt-4 font-semibold text-gray-900">- Alex Johnson, CEO of Innovate Co.</p>
        </div>
        <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
          <blockquote class="text-gray-600 italic">"Integration was seamless, and the support team is incredibly responsive. We saw a <strong>40% increase</strong> in efficiency within the first quarter."</blockquote>
          <p class="mt-4 font-semibold text-gray-900">- Samantha Lee, CTO of Future Systems</p>
        </div>
        <div class="bg-white p-8 rounded-lg shadow" data-repeat-item="testimonial">
          <blockquote class="text-gray-600 italic">"A truly powerful and intuitive platform. The ability to customize workflows has been invaluable for our unique business needs."</blockquote>
          <p class="mt-4 font-semibold text-gray-900">- Michael Chen, Head of Operations at DataCorp</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="about" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Flexible Pricing for Teams of All Sizes</h3>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Choose a plan that fits your needs and scale as you grow.</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="py-4 px-6 bg-gray-50 font-bold uppercase text-sm text-gray-600 border-b">Plan</th>
              <th class="py-4 px-6 bg-gray-50 font-bold uppercase text-sm text-gray-600 border-b">Features</th>
              <th class="py-4 px-6 bg-gray-50 font-bold uppercase text-sm text-gray-600 border-b">Price</th>
              <th class="py-4 px-6 bg-gray-50 font-bold uppercase text-sm text-gray-600 border-b"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="hover:bg-gray-100">
              <td class="py-4 px-6 border-b border-gray-200">Starter</td>
              <td class="py-4 px-6 border-b border-gray-200">Basic AI tools, 5GB storage, Community support</td>
              <td class="py-4 px-6 border-b border-gray-200">$49/mo</td>
              <td class="py-4 px-6 border-b border-gray-200"><button class="bg-blue-500 text-white px-4 py-2 rounded" data-action-type="onClick">Choose</button></td>
            </tr>
            <tr class="hover:bg-gray-100">
              <td class="py-4 px-6 border-b border-gray-200">Professional</td>
              <td class="py-4 px-6 border-b border-gray-200">Advanced AI tools, 50GB storage, Priority email support</td>
              <td class="py-4 px-6 border-b border-gray-200">$99/mo</td>
              <td class="py-4 px-6 border-b border-gray-200"><button class="bg-blue-600 text-white px-4 py-2 rounded" data-action-type="onClick">Choose</button></td>
            </tr>
            <tr class="hover:bg-gray-100">
              <td class="py-4 px-6 border-b border-gray-200">Enterprise</td>
              <td class="py-4 px-6 border-b border-gray-200">All features, Unlimited storage, 24/7 dedicated support</td>
              <td class="py-4 px-6 border-b border-gray-200">Contact Us</td>
              <td class="py-4 px-6 border-b border-gray-200"><button class="border border-gray-400 text-gray-600 px-4 py-2 rounded" data-action-type="linkTo" data-link-url="https://techcorp.com/contact">Contact</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div data-repeat-item="stat">
          <div class="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10M+</div>
          <div class="text-gray-300">Users Worldwide</div>
        </div>
        <div data-repeat-item="stat">
          <div class="text-3xl md:text-4xl font-bold text-green-400 mb-2">99.9%</div>
          <div class="text-gray-300">Uptime Guarantee</div>
        </div>
        <div data-repeat-item="stat">
          <div class="text-3xl md:text-4xl font-bold text-purple-400 mb-2">150+</div>
          <div class="text-gray-300">Countries Served</div>
        </div>
        <div data-repeat-item="stat">
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

  <!-- Table Data Section -->
  <section class="py-10 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Data Table Integration</h2>
        <p class="text-sm text-gray-600 max-w-3xl mx-auto">Display any API data in a customizable table format with field selection.</p>
      </div>
      
      <!-- Table with API integration -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table data-table
               data-api-url="https://jsonplaceholder.typicode.com/users" 
               data-columns="name,email,phone,website"
               class="min-w-full">
          <!-- Table will be rendered by plugin -->
        </table>
      </div>
      
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Posts Table</h3>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table data-table
                 data-api-url="https://jsonplaceholder.typicode.com/posts" 
                 data-columns="userId,id,title"
                 class="min-w-full">
            <!-- Table will be rendered by plugin -->
          </table>
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
        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100" data-action-type="onClick">Start Your Free Trial</button>
        <button class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700" data-action-type="linkTo" data-link-url="mailto:sales@techcorp.com">Contact Sales</button>
      </div>
    </div>
  </section>

  <!-- Contact Form Section -->
  <section id="contact" class="py-20 bg-gray-50">
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Our Team</h3>
        <p class="text-lg text-gray-600">Have a question? We'd love to hear from you.</p>
      </div>
      <form class="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" name="name" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
          <textarea id="message" name="message" rows="4" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        <div class="text-center">
          <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700" data-action-type="submit">Send Message</button>
        </div>
      </form>
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
