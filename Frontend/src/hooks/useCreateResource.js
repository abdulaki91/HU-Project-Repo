import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const useCreateResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, config, onUploadProgress }) => {
      const { data: response } = await api.post(`/${resource}`, data, {
        ...config,
        onUploadProgress,
      });
      return response;
    },
    onSuccess: () => {
      const key = Array.isArray(queryKey) ? queryKey : [queryKey];
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (err) => {
      console.error("Create failed:", err);
      throw err; // Re-throw to let the component handle the error
    },
  });
};

export default useCreateResource;
