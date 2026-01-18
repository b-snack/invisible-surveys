'use client';
import { useState } from 'react';
import { ShoppingCart, CreditCard, Info } from 'lucide-react';

export default function DemoPage() {
  const [cartCount, setCartCount] = useState(0);
  
  const addToCart = () => {
    setCartCount(c => c + 1);
  };
  
  // Payment buttons - first 4 are broken
  const paymentButtons = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    broken: i < 4,
    name: `Payment ${i+1}`
  }));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
          {/* Educational section explaining data collection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <Info className="text-blue-500 mr-2" size={20} />
              <div>
                <h3 className="font-light text-gray-800 mb-1">Invisible Survey Tracker Demo</h3>
                <p className="text-gray-600 text-sm">
                  This page demonstrates how our tracker collects user behavior data, including mouse movements, 
                  clicks, and scrolls. The data is collected anonymously and used to generate UX insights.
                </p>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-light text-gray-800 mb-2">Premium Wireless Headphones</h1>
        
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 mb-4" />
        
        <p className="text-gray-600 mb-4">
          Experience crystal-clear sound with our premium wireless headphones. 
          Featuring noise cancellation and 30-hour battery life.
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-normal">$199.99</span>
          <button 
            onClick={addToCart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h2 className="font-light text-gray-800 mb-3">Payment Methods</h2>
          <div className="grid grid-cols-3 gap-3">
            {paymentButtons.map(button => (
              <button
                key={button.id}
                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                  button.broken 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
                disabled={button.broken}
              >
                <CreditCard size={20} className="mb-1" />
                <span className="text-sm">{button.name}</span>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
      
      {/* Include tracker script */}
      <script src="/tracker.js" defer />
    </div>
  );
}
