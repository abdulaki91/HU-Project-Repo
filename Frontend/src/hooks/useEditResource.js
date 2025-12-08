// hooks/useEditResource.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import { toast } from "react-toastify";

export default function useEditResource(resource, queryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, ...rest } = data; // separate ID from rest of fields
      const { data: response } = await api.put(`/${resource}/${id}`, rest);
      return response;
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
      const key = Array.isArray(queryKey) ? queryKey : [queryKey];
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (err) => {
      toast.error("Failed to update.");
      console.error(err);
    },
  });
}
