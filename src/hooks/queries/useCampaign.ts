import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/campaignService";
import { ApiError } from "@/services/api";

export const useCampaignProgressQuery = () => {
  return useQuery({
    queryKey: ["campaignProgress"],
    queryFn: campaignService.getProgress,
  });
};

export const useStartCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignService.startMatch,
    onSuccess: (data) => {
      // Invalida a query para manter a interface atualizada
      queryClient.invalidateQueries({ queryKey: ["campaignProgress"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (typeof window !== "undefined") {
        localStorage.setItem("matchId", data.matchId);
      }
    },
  });
};
