'use client';
import { useState } from 'react';
import { ShoppingCart, Star, Heart, Share, ChevronDown } from 'lucide-react';

export default function DemoPage() {
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const addToCart = () => {
    setCartCount(c => c + quantity);
  };
  
  // Payment buttons - first 4 are broken
  const paymentButtons = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    broken: i < 4,
    name: `Payment Option ${i+1}`
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Amazon-style header */}
      <header className="bg-black text-white p-4 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold">amazon</div>
          <div className="flex items-center space-x-6">
            <span>Hello, sign in</span>
            <span>Returns & Orders</span>
            <div className="flex items-center">
              <ShoppingCart size={24} />
              <span className="ml-1">{cartCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-blue-600">
        Electronics › Headphones › Wireless › Over-Ear
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-lg h-96 mb-4 flex items-center justify-center">
              <div className="text-black text-center">
                <div className="text-6xl mb-2">🎧</div>
                <div>Premium Headphones</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-100 rounded border h-16"></div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-normal mb-2">Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones with Auto Noise Canceling Optimizer</h1>
            
            <div className="flex items-center mb-2">
              <div className="flex text-orange-400">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} fill="currentColor" size={16} />
                ))}
              </div>
              <span className="ml-2 text-blue-600 text-sm">4.5 out of 5 stars (15,847 reviews)</span>
            </div>

            <div className="mb-4">
              <span className="text-red-600 text-sm">Limited time deal</span>
              <div className="flex items-baseline">
                <span className="text-2xl font-normal">$279.99</span>
                <span className="ml-2 text-black line-through">$399.99</span>
                <span className="ml-2 text-red-600 font-bold">30% off</span>
              </div>
              <div className="text-sm text-black">FREE Returns</div>
              <div className="text-sm text-black">In Stock</div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">About this item</h3>
              <ul className="text-sm space-y-1">
                <li>• Industry-leading noise canceling with Dual Noise Sensor technology</li>
                <li>• Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo</li>
                <li>• Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback)</li>
                <li>• Ultra-comfortable, lightweight design with soft fit leather</li>
                <li>• Multipoint connection allows you to connect two devices at once</li>
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">Payment Options</h3>
              <div className="grid grid-cols-2 gap-2">
                {paymentButtons.map(button => (
                  <button
                    key={button.id}
                    className={`p-2 border rounded text-sm ${
                      button.broken 
                        ? 'bg-gray-100 text-black cursor-default border-gray-200' 
                        : 'bg-white hover:bg-gray-50 text-black border-gray-300'
                    }`}
                    disabled={button.broken}
                  >
                    {button.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase Options */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 bg-white sticky top-4">
              <div className="text-2xl font-normal mb-2">$279.99</div>
              <div className="text-sm text-black mb-2">FREE delivery tomorrow</div>
              <div className="text-sm mb-4">Order within 2 hrs 15 mins</div>
              
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Qty:</label>
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-3 py-1 w-20"
                >
                  {[1,2,3,4,5].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={addToCart}
                className="w-full bg-orange-400 hover:bg-orange-500 text-black py-2 px-4 rounded-full font-bold mb-2"
              >
                Add to Cart
              </button>
              
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full font-bold mb-4">
                Buy Now
              </button>

              <div className="text-sm mb-2">
                <span className="font-bold">Ships from:</span> Amazon
              </div>
              <div className="text-sm mb-4">
                <span className="font-bold">Sold by:</span> Sony
              </div>

              <div className="flex justify-between text-sm">
                <button className="flex items-center text-blue-600 hover:text-blue-800">
                  <Heart size={16} className="mr-1" />
                  Add to List
                </button>
                <button className="flex items-center text-blue-600 hover:text-blue-800">
                  <Share size={16} className="mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold mb-6">Customer reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <div className="flex text-orange-400">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} fill="currentColor" size={14} />
                  ))}
                </div>
                <span className="ml-2 font-bold">Excellent sound quality</span>
              </div>
              <div className="text-sm text-black mb-2">By John D. on December 15, 2023</div>
              <p className="text-sm">Amazing noise cancellation and crystal clear audio. Worth every penny!</p>
            </div>
            
            <div className="border rounded p-4">
              <div className="flex items-center mb-2">
                <div className="flex text-orange-400">
                  {[1,2,3,4].map(i => (
                    <Star key={i} fill="currentColor" size={14} />
                  ))}
                  <Star className="text-black" size={14} />
                </div>
                <span className="ml-2 font-bold">Great but pricey</span>
              </div>
              <div className="text-sm text-black mb-2">By Sarah M. on December 10, 2023</div>
              <p className="text-sm">Love the comfort and battery life, but wished it was more affordable.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Include tracker script */}
      <script src="/tracker.js" defer />
    </div>
  );
}
