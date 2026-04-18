import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export default function useEditResource(resource, queryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, ...rest } = data;

      // Handle FormData (for file uploads) vs regular JSON data
      if (data instanceof FormData) {
        // For FormData, we need to extract the ID and send the FormData as-is
        const formDataId = data.get("id");
        data.delete("id"); // Remove ID from FormData since it goes in URL

        const { data: response } = await api.put(
          `/${resource}/${formDataId}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        return response;
      } else {
        // Regular JSON data
        const { data: response } = await api.put(`/${resource}/${id}`, rest);
        return response;
      }
    },
    onSuccess: () => {
      const key = Array.isArray(queryKey) ? queryKey : [queryKey];
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (err) => {
      console.error("Update failed:", err);
      throw err; // Re-throw to let the component handle the error
    },
  });
}
