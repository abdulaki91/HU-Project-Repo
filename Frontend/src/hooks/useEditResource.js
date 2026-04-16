import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export default function useEditResource(resource, queryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, ...rest } = data;
      const { data: response } = await api.put(`/${resource}/${id}`, rest);
      return response;
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
