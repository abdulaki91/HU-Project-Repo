// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import api from "../api/api";

// export default function useDeleteSession() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id) => {
//       await api.delete(`/session/delete-session/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["sessions"] });
//       toast.success("Session deleted successfully!");
//     },
//   });
// }
// hooks/useDeleteResource.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../api/api";

const useDeleteResource = (resource, queryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => await api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(`${queryKey} deleted successfully!`);
    },
  });
};
export default useDeleteResource;
