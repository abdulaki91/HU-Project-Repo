import { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { departments } from "../constants/departments";
import { batches } from "../constants/batches";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    batch: "",
    department: "",
    terms: false,
  });

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.email.includes("@")) return "Please enter a valid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (!formData.role) return "Please select your role";
    if (!formData.batch) return "Please select your batch";
    if (!formData.department) return "Please select your department";
    if (!formData.terms) return "Please accept the terms and conditions";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/user/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        batch: formData.batch,
        department: formData.department,
      });

      setSuccess(
        response.data.message ||
          "Registration successful! Please check your email to verify your account.",
      );

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        batch: "",
        department: "",
        terms: false,
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-[70px] h-[70px] bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">HUPS</span>
            </div>
          </div>
          <h1 className="text-slate-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join ProjectNest and start sharing your projects
          </p>
        </div>

        <Card className="p-8 shadow-xl dark:bg-slate-800 dark:border-slate-700">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">
                {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Role & Batch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Batch/Year</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleSelectChange("batch", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="#" className="text-indigo-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Card>

        {/* Switch to Login */}
        <p className="text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
