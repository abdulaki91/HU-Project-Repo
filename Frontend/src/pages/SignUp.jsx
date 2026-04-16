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
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { departments } from "../constants/departments";
import { BATCHES } from "../constants/batches";
import { LegalModal, useLegalModal } from "../components/LegalModal";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, modalType, openTerms, openPrivacy, close } = useLegalModal();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    // Ensure we're always storing strings, not objects
    const stringValue =
      typeof value === "object" ? value.value || value.label || value : value;
    setFormData((prev) => ({
      ...prev,
      [name]: stringValue,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!formData.role) {
      toast.error("Please select your role");
      return false;
    }
    if (!formData.batch) {
      toast.error("Please select your batch");
      return false;
    }
    if (!formData.department) {
      toast.error("Please select your department");
      return false;
    }
    if (!formData.terms) {
      toast.error("Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

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

      toast.success(
        response.data.message ||
          "Registration successful! Please check your email to verify your account.",
        { duration: 6000 },
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
      let errorMessage = "Registration failed. Please try again.";

      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        // Handle validation errors - show the first few specific errors
        const validationErrors = err.response.data.errors;
        if (validationErrors.length === 1) {
          errorMessage = validationErrors[0].message;
        } else if (validationErrors.length <= 3) {
          errorMessage = validationErrors
            .map((error) => error.message)
            .join(". ");
        } else {
          errorMessage = `${validationErrors.length} validation errors found. Please check: ${validationErrors
            .slice(0, 2)
            .map((error) => error.field)
            .join(", ")} and others.`;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage, { duration: 7000 });
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
                    {BATCHES.map((batch) => (
                      <SelectItem key={batch.value} value={batch.value}>
                        {batch.label}
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
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
            <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <Checkbox
                id="terms"
                name="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({
                    ...prev,
                    terms: checked,
                  }));
                }}
                required
                className="mt-1 flex-shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 dark:text-gray-300 leading-5 cursor-pointer select-none"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    terms: !prev.terms,
                  }));
                }}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openTerms();
                  }}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPrivacy();
                  }}
                >
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

      {/* Legal Modal */}
      <LegalModal isOpen={isOpen} onClose={close} type={modalType} />
    </div>
  );
}
