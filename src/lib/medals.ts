/**
 * Medal System Configuration
 * Synchronized with the Backend Database Codes
 */
import { Medal } from "@/components/profile/MedalBadge";
import { UserDetails } from "@/types/api-responses";

/**
 * Static definitions of the 4 valid Backend Medals
 */
export const MEDAL_DEFINITIONS = [
  {
    id: "SAILOR", // DEVE SER EXATAMENTE O CODE DO BANCO DE DADOS
    name: "Marinheiro",
    description: "Vença uma partida de forma rápida e eficiente.",
    icon: "⏱️",
    requirement: "Vencer a partida em menos de 2 minutos",
  },
  {
    id: "CAPTAIN",
    name: "Capitão",
    description: "Demonstre grande precisão na batalha.",
    icon: "🎯",
    requirement: "Acertar 7 tiros seguidos na mesma partida",
  },
  {
    id: "CAPTAIN_WAR",
    name: "Capitão de Mar e Guerra",
    description: "Uma precisão impecável e letal.",
    icon: "⚔️",
    requirement: "Acertar 8 tiros seguidos na mesma partida",
  },
  {
    id: "ADMIRAL",
    name: "Almirante",
    description: "Uma tática de defesa impenetrável.",
    icon: "👑",
    requirement: "Vencer sem perder nenhum navio da sua frota",
  },
];

/**
 * Generate medal instances for a user based on Backend response
 */
export const getUserMedals = (user: UserDetails): Medal[] => {
  // Pega a lista de IDs de medalhas retornadas do Back-end.
  // Usa fallback para array vazio caso ainda não tenha carregado.
  const earnedCodes = user.earnedMedalCodes || [];

  return MEDAL_DEFINITIONS.map((def) => {
    const unlocked = earnedCodes.includes(def.id);

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      requirement: def.requirement,
      unlocked,
    };
  });
};

/**
 * Calculate total unlocked medals
 */
export const getUnlockedMedalCount = (medals: Medal[]): number => {
  return medals.filter((m) => m.unlocked).length;
};

/**
 * Get medals sorted by unlock status (unlocked first)
 */
export const sortMedalsByStatus = (medals: Medal[]): Medal[] => {
  return [...medals].sort((a, b) => {
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });
};