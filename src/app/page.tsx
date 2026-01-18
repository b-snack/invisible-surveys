'use client';
import Link from 'next/link';
import { MousePointer2, Activity, BarChart2, Lightbulb, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-light text-gray-800 mb-4">Invisible Survey Tracker</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Understand user behavior without surveys. AI-powered insights from cursor movements, clicks, and scrolls.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center">
              <LayoutDashboard className="mr-2" size={18} />
              View Dashboard
            </Link>
            <Link href="/demo" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg flex items-center">
              <ShoppingCart className="mr-2" size={18} />
              Try Demo
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-light text-gray-800 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Track', 
                description: 'Records mouse movements, clicks, and scrolls without user interruption',
                icon: <MousePointer2 size={32} className="text-blue-500 mb-4" />
              },
              { 
                title: 'Analyze', 
                description: 'Visualizes user interaction patterns with heatmaps and position graphs',
                icon: <BarChart2 size={32} className="text-blue-500 mb-4" />
              },
              { 
                title: 'Improve', 
                description: 'Generates AI-powered UX recommendations to optimize your site',
                icon: <Lightbulb size={32} className="text-blue-500 mb-4" />
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                {step.icon}
                <h3 className="font-light text-xl text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Preview */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-light text-gray-800 mb-8 text-center">See It in Action</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-gray-500 text-sm">invisible-surveys-demo.com</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-md">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
            </div>
            <div className="mt-6 text-center">
              <Link href="/demo" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                Try Interactive Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started */}
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-light text-gray-800 mb-4">Ready to Understand Your Users?</h2>
          <p className="text-gray-600 mb-8">
            Start gathering real insights without annoying surveys or interruptions.
          </p>
          <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg inline-flex items-center">
            <Activity className="mr-2" size={18} />
            Launch Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
