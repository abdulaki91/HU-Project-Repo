import React from "react";
import "./Sidebar.css";

export function LogoShowcase() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-200">
          UPSHU Project Store Logo Showcase
        </h1>

        {/* Logo Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Full Logo - Light Background */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Full Logo - Light
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative logo-container">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-0.5 mb-1">
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                      <div className="w-1 h-3 bg-white rounded-sm"></div>
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                    </div>
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-sm accent-dot"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-black gradient-text tracking-tight">
                    UPSHU
                  </h1>
                  <span className="text-lg font-bold text-slate-700">
                    Project Store
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                    Academic Excellence Hub
                  </p>
                  <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Logo - Dark Background */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              Full Logo - Dark
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative logo-container">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-0.5 mb-1">
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                      <div className="w-1 h-3 bg-white rounded-sm"></div>
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                    </div>
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-slate-900 shadow-sm accent-dot"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-black gradient-text tracking-tight">
                    UPSHU
                  </h1>
                  <span className="text-lg font-bold text-slate-300">
                    Project Store
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
                  <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                    Academic Excellence Hub
                  </p>
                  <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Icon Only */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Icon Only
            </h3>
            <div className="flex justify-center">
              <div className="relative logo-container">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white text-2xl font-black tracking-tight">
                    U
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-sm accent-dot"></div>
              </div>
            </div>
          </div>

          {/* Compact Version */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-600 mb-4">
              Compact Version
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-black">U</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border border-white"></div>
              </div>
              <div>
                <h2 className="text-sm font-black gradient-text">UPSHU</h2>
                <p className="text-xs text-slate-500">Project Store</p>
              </div>
            </div>
          </div>

          {/* Monochrome Version */}
          <div className="bg-gray-100 rounded-2xl p-6 shadow-lg border border-gray-300">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">
              Monochrome
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="flex space-x-0.5 mb-1">
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                      <div className="w-1 h-3 bg-white rounded-sm"></div>
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                    </div>
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-100 shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-black text-gray-800 tracking-tight">
                    UPSHU
                  </h1>
                  <span className="text-lg font-bold text-gray-700">
                    Project Store
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                    Academic Excellence Hub
                  </p>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Text */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Text Only
            </h3>
            <div className="text-center">
              <h1 className="text-2xl font-black gradient-text tracking-tight mb-1">
                UPSHU
              </h1>
              <p className="text-sm font-bold text-slate-700">Project Store</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Academic Excellence Hub
                </p>
                <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full accent-dot"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
            Usage Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Design Elements
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  • <strong>Primary Colors:</strong> Blue (#2563eb) to Purple
                  (#7c3aed) gradient
                </li>
                <li>
                  • <strong>Accent Color:</strong> Amber (#f59e0b) to Orange
                  (#ea580c)
                </li>
                <li>
                  • <strong>Typography:</strong> Bold, modern sans-serif with
                  tight tracking
                </li>
                <li>
                  • <strong>Icon:</strong> University building symbol with
                  academic pillars
                </li>
                <li>
                  • <strong>Shape:</strong> Rounded rectangles for modern,
                  friendly appearance
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Responsive Behavior
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  • <strong>Desktop:</strong> Full logo with text and subtitle
                </li>
                <li>
                  • <strong>Tablet:</strong> Compact version with main text only
                </li>
                <li>
                  • <strong>Mobile:</strong> Icon-only in collapsed state
                </li>
                <li>
                  • <strong>Animations:</strong> Subtle hover effects and
                  gradient shifts
                </li>
                <li>
                  • <strong>Accessibility:</strong> High contrast mode support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
