import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Shield, ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export const Unauthorized = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <Card className="p-8 glass-morphism border-0 backdrop-blur-xl shadow-2xl text-center">
          <div className="space-y-6">
            {/* Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                403
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  Access Denied
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Unauthorized Access
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You don't have permission to access this page. Please contact
                your administrator if you believe this is an error.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Error Code: 403 - Forbidden
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
