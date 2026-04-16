import { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { useToast } from "./Toast";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../api/api";
import { Eye, EyeOff, Lock, Save, X } from "lucide-react";

export function ChangePasswordModal({ isOpen, onClose }) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await authAPI.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      handleClose();
    },
    onError: (error) => {
      // Handle validation errors with specific messages
      if (
        error.response?.data?.code === "VALIDATION_ERROR" &&
        error.response?.data?.errors
      ) {
        const validationErrors = error.response.data.errors;

        if (validationErrors.length === 1) {
          toast.error(validationErrors[0].message);
        } else if (validationErrors.length <= 3) {
          const errorMessages = validationErrors
            .map((err) => err.message)
            .join(". ");
          toast.error(errorMessages);
        } else {
          toast.error(
            `${validationErrors.length} validation errors found. Please check your input.`,
          );
        }
      } else {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to change password";
        toast.error(message);
      }
    },
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPasswords((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await changePasswordMutation.mutateAsync({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  };

  const handleClose = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 glass-morphism border-0 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Change Password
            </h2>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-slate-700 dark:text-slate-300"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={handleInputChange}
                className={`pr-10 ${errors.currentPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-slate-700 dark:text-slate-300"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.newPassword}
                onChange={handleInputChange}
                className={`pr-10 ${errors.newPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-slate-700 dark:text-slate-300"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                className={`pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
