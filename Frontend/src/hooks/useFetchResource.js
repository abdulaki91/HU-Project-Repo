import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

const useFetchResource = (resource, queryKey, enabled = true) => {
  const resolvedKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useQuery({
    queryKey: resolvedKey,
    queryFn: async () => {
      const { data } = await api.get(`/${resource}`);
      return data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
export default useFetchResource;
