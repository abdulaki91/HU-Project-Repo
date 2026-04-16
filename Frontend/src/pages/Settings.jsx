import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import useUpdateProfile from "../hooks/useUpdateProfile";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import {
  User,
  Mail,
  Calendar,
  Building,
  Save,
  ArrowLeft,
  Settings as SettingsIcon,
  Lock,
} from "lucide-react";
import { DEPARTMENTS } from "../constants/departments";
import { BATCHES } from "../constants/batches";
import { ChangePasswordModal } from "../components/ChangePasswordModal";

export function Settings() {
  const { userData } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    batch: "",
    department: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (userData) {
      setUserInfo((prev) => ({ ...prev, ...userData }));
      setIsLoaded(true);
    }
  }, [userData]);

  const updateProfile = useUpdateProfile();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSelectChange = (id, value) => {
    setUserInfo((prev) => ({ ...prev, [id]: value }));
    // Clear error when user makes selection
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!userInfo.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (userInfo.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(userInfo.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters and spaces";
    }

    // Last name validation
    if (!userInfo.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (userInfo.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(userInfo.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters and spaces";
    }

    // Email validation
    if (!userInfo.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Batch validation
    if (!userInfo.batch) {
      newErrors.batch = "Batch year is required";
    } else if (!/^\d{4}$/.test(userInfo.batch)) {
      newErrors.batch = "Batch must be a 4-digit year";
    }

    // Department validation
    if (!userInfo.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userInfo.id) {
      toast.error("Unable to update profile at this time.", {
        title: "Update Failed",
        description: "User information not loaded yet. Please try again.",
        duration: 4000,
      });
      return;
    }

    // Validate form before submitting
    if (!validateForm()) {
      toast.error("Please fix the validation errors", {
        title: "Form Validation Failed",
        description: "Check the highlighted fields and try again.",
        duration: 4000,
      });
      return;
    }

    const payload = {
      id: userInfo.id,
      firstName: userInfo.firstName.trim(),
      lastName: userInfo.lastName.trim(),
      email: userInfo.email.trim().toLowerCase(),
      batch: userInfo.batch,
      department: userInfo.department,
    };

    try {
      await updateProfile.mutateAsync(payload);
      toast.success("Your profile has been updated successfully!", {
        title: "Profile Updated",
        description: "Your changes have been saved.",
        duration: 4000,
      });
      // Navigate back to profile after successful update
      setTimeout(() => navigate("/profile"), 1500);
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        title: "Update Error",
        description: "Please check your connection and try again.",
        duration: 5000,
      });
    }
  };

  const handleBack = () => {
    navigate("/profile");
  };

  return (
    <div
      className={`p-8 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Account Settings
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Update your personal information and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card className="p-8 glass-morphism border-0 backdrop-blur-xl shadow-xl">
        <form className="space-y-8" onSubmit={handleSave}>
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="firstName"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={userInfo.firstName}
                  onChange={handleInputChange}
                  className={`h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.firstName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="lastName"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={userInfo.lastName}
                  onChange={handleInputChange}
                  className={`h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.lastName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contact Information
              </h3>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={handleInputChange}
                className={`h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Changing your email will require verification
              </p>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
              <Building className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Academic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="batch"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  Batch Year
                </Label>
                <Select
                  value={userInfo.batch}
                  onValueChange={(value) => handleSelectChange("batch", value)}
                >
                  <SelectTrigger
                    className={`h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.batch ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCHES.map((batch) => (
                      <SelectItem key={batch.value} value={batch.value}>
                        {batch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batch && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.batch}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="department"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  Department
                </Label>
                <Select
                  value={userInfo.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger
                    className={`h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.department
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex-1 md:flex-none md:px-8 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              className="px-6 h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="px-8 h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
