// hooks/useCreateResource.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/api";

const useCreateResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { data: res } = await api.post(`/${resource}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success(`${queryKey} created successfully!`);
    },
  });
};
export default useCreateResource;
