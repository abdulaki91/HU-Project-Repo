
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
import api from "../api/api";

const useDeleteResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => await api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      // toast.success(`${queryKey} deleted successfully!`);
    },
  });
};
export default useDeleteResource;
