/**
 * User Profile Query Hook
 *
 * TanStack Query hook for fetching and caching user profile data.
 * Provides loading, error, and data states for the authenticated user's profile.
 */
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { LeaderBoardResponse, UserDetails } from "@/types/api-responses";
import { getPlayerProfileById} from "@/services/api";

/**
 * Query key for user profile
 */
export const userProfileKeys = {
  all: ["userProfile"] as const,
  profile: () => [...userProfileKeys.all, "me"] as const,
};

/**
 * Hook to fetch the current user's profile
 *
 * Uses the /auth/profile endpoint (or /auth/me depending on backend).
 * Caches data and prevents unnecessary refetches.
 *
 * @returns Query result with user profile data, loading, and error states
 */
export const useUserProfile = () => {
  return useQuery<UserDetails, Error>({
    queryKey: userProfileKeys.profile(),
    queryFn: async () => {
      const apiData = await authService.getProfile();
      const storedUsername =
        typeof window !== "undefined" ? localStorage.getItem("username") : "";
      return {
        ...apiData,
        gamesPlayed: apiData.wins + apiData.losses,
        username: storedUsername || "JOGADOR",
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 1, // Only retry once for auth failures
  });
};
export const useLeaderboard = () => {
  return useQuery<LeaderBoardResponse[], Error>({
    queryKey: ["leaderBoard"],
    queryFn: authService.getLeaderBoard,
    staleTime: 5 * 60 * 1000,
  });
};
/**
 * Calculate user rank based on wins
 *
 * @param wins - Number of wins
 * @returns Rank title and icon
 */
export const getUserRank = (wins: number): { title: string; icon: string } => {
  if (wins >= 100) return { title: "Almirante", icon: "⭐⭐⭐⭐⭐" };
  if (wins >= 50) return { title: "Vice-Almirante", icon: "⭐⭐⭐⭐" };
  if (wins >= 25) return { title: "Contra-Almirante", icon: "⭐⭐⭐" };
  if (wins >= 10) return { title: "Capitão", icon: "⭐⭐" };
  if (wins >= 5) return { title: "Tenente", icon: "⭐" };
  return { title: "Recruta", icon: "🎖️" };
};

/**
 * Calculate win rate percentage
 *
 * @param wins - Number of wins
 * @param gamesPlayed - Total games played
 * @returns Win rate as percentage string
 */
export const getWinRate = (wins: number, gamesPlayed: number): string => {
  if (gamesPlayed === 0) return "0%";
  return `${Math.round((wins / gamesPlayed) * 100)}%`;
};

export const usePlayerProfile = (userId: string | null) => {
  return useQuery({
    queryKey: ["playerProfile", userId],
    queryFn: () => getPlayerProfileById(userId!),
    enabled: !!userId, // Só executa a query se tivermos um ID válido (quando o modal abrir)
    staleTime: 1000 * 60 * 5, // Mantém o dado em cache por 5 minutos para evitar spam na API
  });
};
