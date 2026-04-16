import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../api/api";

export default function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, ...profileData } = data;
      const response = await authAPI.updateProfile(id, profileData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);

      // Handle validation errors with specific messages
      if (
        error.response?.data?.code === "VALIDATION_ERROR" &&
        error.response?.data?.errors
      ) {
        const validationErrors = error.response.data.errors;

        if (validationErrors.length === 1) {
          throw new Error(validationErrors[0].message);
        } else if (validationErrors.length <= 3) {
          const errorMessages = validationErrors
            .map((err) => err.message)
            .join(". ");
          throw new Error(errorMessages);
        } else {
          throw new Error(
            `${validationErrors.length} validation errors found. Please check: ${validationErrors
              .slice(0, 2)
              .map((err) => err.field)
              .join(", ")} and others.`,
          );
        }
      }

      // Extract error message from the API response
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      throw new Error(message);
    },
  });
}
