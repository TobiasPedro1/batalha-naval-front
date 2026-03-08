// React Query hooks para mutations de match
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchService } from "@/services/matchService";
import { SetupShipPayload, ShootPayload, Match } from "@/types/api-responses";
import { CreateMatch } from "@/types/api-requests";
import { MoveDirection } from "@/types/game-enums";

export const useCreateMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: CreateMatch) => matchService.createMatch(config), // Recebe o objeto completo (mode, aiDifficulty, etc)
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      if (typeof window !== "undefined") {
        localStorage.setItem("matchId", data.matchId);
      }
    },
  });
};

/**
 * Hook for submitting the fleet layout during the Setup phase.
 *
 * Accepts `SetupShipPayload[]` (already mapped to backend DTOs).
 * On success it invalidates the match query so polling picks up the
 * new state (Setup → Battle transition).
 */
export const useSetupMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ships: SetupShipPayload[]) => {
      const storedId = localStorage.getItem("matchId");
      if (!storedId) {
        throw new Error("Match ID NOT FOUND in localStorage");
      }

      return matchService.setupFleet(storedId, ships);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match"] });
    },
    // Error handling is delegated to the caller so SetupPhase can
    // display contextual feedback (toast / inline message).
  });
};

// n funciona ainda, fazer logo o shoot e confirm
export const useJoinMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.joinMatch(matchId),
    onSuccess: (data: Match) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.setQueryData(["match", data.id], data);
    },
  });
};

export const useConfirmSetupMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchService.confirmSetup(matchId),
    onSuccess: (data: Match) => {
      queryClient.setQueryData(["match", matchId], data);
    },
  });
};

export const useShootMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shot: ShootPayload) => matchService.shoot(matchId, shot),
    onSuccess: (data) => {
      // Força refetch imediato após disparo para atualizar UI com estado real do servidor
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
    onError: (error) => {
      // Refetch para garantir que o estado não ficou inconsistente
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};

export const useForfeitMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchService.forfeit(matchId),
    onSuccess: () => {
      // Cancel retorna 204 — invalida cache para refletir estado final
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderBoard"] });
    },
  });
};

export const useMoveShipMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { shipId: string; direction: MoveDirection }) =>
      matchService.moveShip({
        matchId,
        shipId: input.shipId,
        direction: input.direction,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });
};
