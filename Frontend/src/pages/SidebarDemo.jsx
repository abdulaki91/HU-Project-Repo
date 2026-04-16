import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import {
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Palette,
  Zap,
  Star,
  CheckCircle,
} from "lucide-react";

export function SidebarDemo() {
  const [currentView, setCurrentView] = useState("desktop");

  const features = [
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "Responsive Design",
      description: "Adapts perfectly to desktop, tablet, and mobile screens",
      status: "completed",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Collapsible Sidebar",
      description: "Desktop users can collapse sidebar to icon-only view",
      status: "completed",
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Modern UI/UX",
      description: "Glass morphism, gradients, and smooth animations",
      status: "completed",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Smart Navigation",
      description: "Context-aware navigation with tooltips and descriptions",
      status: "completed",
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "User Profile",
      description: "Rich user information with role-based styling",
      status: "completed",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Accessibility",
      description: "Keyboard navigation and screen reader friendly",
      status: "completed",
    },
  ];

  const viewports = [
    {
      id: "desktop",
      label: "Desktop",
      icon: <Monitor className="h-4 w-4" />,
      width: "1200px",
    },
    {
      id: "tablet",
      label: "Tablet",
      icon: <Tablet className="h-4 w-4" />,
      width: "768px",
    },
    {
      id: "mobile",
      label: "Mobile",
      icon: <Smartphone className="h-4 w-4" />,
      width: "375px",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Modern Sidebar Design
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
            Responsive Sidebar Showcase
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Experience the new modern, responsive sidebar with advanced features
            and elegant design
          </p>
        </div>

        {/* Viewport Selector */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Responsive Preview
          </h3>
          <div className="flex gap-2 mb-6">
            {viewports.map((viewport) => (
              <Button
                key={viewport.id}
                variant={currentView === viewport.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView(viewport.id)}
                className="flex items-center gap-2"
              >
                {viewport.icon}
                {viewport.label}
              </Button>
            ))}
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 overflow-hidden">
            <div
              className="mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-lg transition-all duration-500"
              style={{
                width: viewports.find((v) => v.id === currentView)?.width,
                height: "400px",
              }}
            >
              <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-2xl">📱</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sidebar adapts to {currentView} view
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {viewports.find((v) => v.id === currentView)?.width}{" "}
                    viewport
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </h4>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                      ✓ Done
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Technical Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Technical Implementation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                Responsive Breakpoints
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Mobile:
                  </span>
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    &lt; 768px
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Tablet:
                  </span>
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    768px - 1024px
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Desktop:
                  </span>
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    &gt; 1024px
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                Sidebar States
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Mobile:
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    Overlay (320px)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Desktop Expanded:
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    Fixed (288px)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Desktop Collapsed:
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    Icons Only (80px)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Improvements */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-100">
            Key Improvements Made
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                User Experience
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Smooth animations and transitions</li>
                <li>• Intuitive collapse/expand behavior</li>
                <li>• Mobile-first responsive design</li>
                <li>• Touch-friendly interface</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Visual Design
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Glass morphism effects</li>
                <li>• Gradient backgrounds and borders</li>
                <li>• Role-based color coding</li>
                <li>• Modern typography and spacing</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
