import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export function MobileResponsiveTest() {
  const [screenInfo, setScreenInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 1024,
  });

  const updateScreenInfo = () => {
    setScreenInfo({
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 1024,
    });
  };

  // Update screen info on resize
  window.addEventListener("resize", updateScreenInfo);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Mobile Responsiveness Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test sidebar behavior across different screen sizes
          </p>
        </div>
        <Button onClick={updateScreenInfo}>Refresh Screen Info</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Screen Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Width:</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {screenInfo.width}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Height:
              </span>
              <span className="font-mono text-slate-900 dark:text-white">
                {screenInfo.height}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Mode:</span>
              <span
                className={`font-semibold ${
                  screenInfo.isMobile
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {screenInfo.isMobile ? "Mobile/Tablet" : "Desktop"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Breakpoints
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Mobile:
              </span>
              <span className="font-mono text-slate-900 dark:text-white">
                &lt; 1024px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Desktop:
              </span>
              <span className="font-mono text-slate-900 dark:text-white">
                ≥ 1024px
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Expected Behavior
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <strong className="text-slate-900 dark:text-white">
                Mobile:
              </strong>
              <ul className="mt-1 ml-4 list-disc">
                <li>Sidebar hidden by default</li>
                <li>Toggle button visible</li>
                <li>Overlay when open</li>
                <li>Auto-close on navigation</li>
              </ul>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white">
                Desktop:
              </strong>
              <ul className="mt-1 ml-4 list-disc">
                <li>Sidebar visible by default</li>
                <li>Collapsible functionality</li>
                <li>No overlay</li>
                <li>Persistent state</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Test Instructions
        </h3>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Mobile Testing (Screen width &lt; 1024px):
            </h4>
            <ol className="mt-2 ml-4 list-decimal space-y-1">
              <li>
                Resize browser window to mobile size or use device emulation
              </li>
              <li>Sidebar should be hidden by default</li>
              <li>
                Click the hamburger menu button (top-left) to open sidebar
              </li>
              <li>Sidebar should slide in from left with overlay</li>
              <li>Click outside sidebar or X button to close</li>
              <li>Navigate to different page - sidebar should auto-close</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Desktop Testing (Screen width ≥ 1024px):
            </h4>
            <ol className="mt-2 ml-4 list-decimal space-y-1">
              <li>Resize browser window to desktop size</li>
              <li>Sidebar should be visible by default</li>
              <li>Click collapse button (chevron) to collapse/expand</li>
              <li>No overlay should appear</li>
              <li>Navigation should not close sidebar</li>
              <li>Tooltips should appear on collapsed state</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
