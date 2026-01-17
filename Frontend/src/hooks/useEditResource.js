import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import { toast } from "react-toastify";

export default function useEditResource(resource, queryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, ...rest } = data;
      const { data: response } = await api.put(`/${resource}/${id}`, rest);
      return response;
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
      const key = Array.isArray(queryKey) ? queryKey : [queryKey];
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (err) => {
      // Extract error message from backend response
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update";
      toast.error(message);
      console.error(err);
    },
  });
}
