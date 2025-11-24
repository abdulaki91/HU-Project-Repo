import { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useNavigate } from "react-router-dom";

export function Login({ onLogin, onSwitchToSignUp }) {
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    onLogin();
    navigate("/"); // navigate to home page
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-full"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-[70px] h-[70px] bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">HUPS</span>
            </div>
          </div>
          <h1 className="text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to access HU Project Store
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 shadow-xl dark:bg-slate-800 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-slate-200">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Sign In
            </Button>

            {/* Divider & Social login... (keep your existing JSX here) */}
          </form>
        </Card>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
}
