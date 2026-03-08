import { useQuery } from "@tanstack/react-query";
import { getMatchHistory } from "@/services/api";

export function useMatchHistory() {
  return useQuery({
    queryKey: ["matchHistory"],
    queryFn: getMatchHistory,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });
}
