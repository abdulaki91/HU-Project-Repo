// hooks/useCreateResource.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const useCreateResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, config }) => {
      const { data: res } = await api.post(`/${resource}`, data, config);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export default useCreateResource;
