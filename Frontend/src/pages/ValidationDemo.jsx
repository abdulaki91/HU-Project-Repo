import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useToast } from "../components/Toast";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function ValidationDemo() {
  const toast = useToast();

  const showValidationExamples = () => {
    // Show different types of validation errors
    setTimeout(() => {
      toast.error("Title must be at least 5 characters long", {
        title: "Validation Error",
        description: "Field: title",
        duration: 4000,
      });
    }, 500);

    setTimeout(() => {
      toast.error("Please fix the following issues:", {
        title: "Multiple Validation Errors",
        description:
          "1. Title: Must be at least 5 characters long\n2. Description: Must be at least 20 characters long\n3. Course: Please select a valid course",
        duration: 6000,
      });
    }, 2000);

    setTimeout(() => {
      toast.success("All validation checks passed!", {
        title: "Form Valid",
        description: "Your project is ready to upload",
        duration: 3000,
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Validation System Demo</h1>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Validation Requirements
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                    <li>• Title: 5-200 characters</li>
                    <li>• Description: 20-2000 characters</li>
                    <li>• Course: Must select from available options</li>
                    <li>• Department: Must select from available options</li>
                    <li>• Batch: Must be a 4-digit year</li>
                    <li>• Tags: Maximum 10 tags, each up to 30 characters</li>
                    <li>• File: Required, valid file type, under 3GB</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Improvements Made
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 mt-2 space-y-1">
                    <li>• Client-side validation prevents common errors</li>
                    <li>• Clear error messages with field names</li>
                    <li>• Real-time feedback for tags and file selection</li>
                    <li>• Helpful hints and character limits shown</li>
                    <li>• Enhanced error display with detailed descriptions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Common Issues Fixed
                  </h3>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 mt-2 space-y-1">
                    <li>• Description too short (less than 20 characters)</li>
                    <li>• Title too short (less than 5 characters)</li>
                    <li>
                      • Missing required fields (course, department, batch)
                    </li>
                    <li>• Too many tags or tags too long</li>
                    <li>• Invalid file types or files too large</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={showValidationExamples} className="w-full">
              Demo Validation Toasts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
