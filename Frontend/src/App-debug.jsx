import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Simple test component
function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          UPSHU Project Store
        </h1>
        <p className="text-gray-600">
          Application is working! This is a test page.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            ✅ React is rendering
            <br />
            ✅ Router is working
            <br />✅ CSS is loading
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </Router>
  );
}
