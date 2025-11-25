import { useNavigate } from "react-router-dom";

export function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-r from-purple-100 via-indigo-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-center p-4">
      <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">
        404
      </h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition"
      >
        Go Back Home
      </button>
    </div>
  );
}
