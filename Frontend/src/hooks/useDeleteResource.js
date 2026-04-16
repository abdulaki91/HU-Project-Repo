import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const useDeleteResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/${resource}/${id}`);
      return data;
    },
    onSuccess: () => {
      const key = Array.isArray(queryKey) ? queryKey : [queryKey];
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (err) => {
      console.error("Delete failed:", err);
      throw err; // Re-throw to let the component handle the error
    },
  });
};

export default useDeleteResource;
