/**
 * Public Profile Page - Career Stats & Medals
 * Displays comprehensive user statistics for a specific player (from Leaderboard)
 */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePlayerProfile } from "@/hooks/queries/useUserProfile";
import { getUserRank, getWinRate } from "@/hooks/queries/useUserProfile";
import { MedalBadge } from "@/components/profile/MedalBadge";
import {
  getUserMedals,
  getUnlockedMedalCount,
  sortMedalsByStatus,
} from "@/lib/medals";
import {
  Trophy,
  Skull,
  Target,
  Medal,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: "success" | "danger" | "info";
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = "info",
}) => {
  const bgClasses = {
    success: "bg-emerald-950/40 border-emerald-800/40",
    danger: "bg-rose-950/40 border-rose-800/40",
    info: "bg-slate-800/40 border-slate-700/40",
  };

  const iconBgClasses = {
    success: "bg-emerald-500/20 text-emerald-400",
    danger: "bg-rose-500/20 text-rose-400",
    info: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <div
      className={`relative p-3 sm:p-5 rounded-2xl border ${bgClasses[color]} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${iconBgClasses[color]}`}
        >
          {icon}
        </div>
        <p className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-2xl sm:text-4xl font-bold text-white mb-1">{value}</p>
      {trend && <p className="text-xs sm:text-sm text-slate-400">{trend}</p>}
    </div>
  );
};

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: profile, isLoading, isError } = usePlayerProfile(userId);

  // --- ESTADO PARA O BOTÃO DE COPIAR ---
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setHasCopied(true);
    // Retorna o ícone ao normal após 2 segundos
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-naval-border rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-naval-border rounded" />
            ))}
          </div>
          <div className="h-96 bg-naval-border rounded" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Erro ao Carregar Perfil
            </h2>
            <p className="text-naval-text-secondary mb-4">
              Não foi possível localizar os dados deste comandante.
            </p>
            <Button onClick={() => router.back()}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gamesPlayed = profile.wins + profile.losses;
  const rank = getUserRank(profile.wins);
  const winRate = getWinRate(profile.wins, gamesPlayed);

  const medals = getUserMedals(profile);
  const sortedMedals = sortMedalsByStatus(medals);
  const unlockedCount = getUnlockedMedalCount(medals);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3 sm:mb-4 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Radar
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Perfil do Comandante
          </h1>
          <p className="text-cyan-400/70 mt-1 sm:mt-2 text-base sm:text-lg">
            Análise de inteligência da frota adversária
          </p>
        </div>
      </div>

      {/* Player Identity Card */}
      <Card className="mb-4 sm:mb-6 bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-cyan-400 shadow-lg shadow-cyan-500/20 flex-shrink-0">
                <Image
                  src="/mortyy.jpg"
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                  {profile.username}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Badge de Patente */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                    <span className="text-sm">{rank.icon}</span>
                    <span className="text-sm font-semibold text-cyan-400">
                      {rank.title}
                    </span>
                  </div>

                  {/* Badge de ID com Botão de Copiar */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {userId.substring(0, 8)}...
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700 active:scale-90"
                      title="Copiar ID completo para desafiar"
                    >
                      {hasCopied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-8 px-2 md:px-6 w-full md:w-auto justify-around md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">
                  {profile.rankPoints}
                </p>
                <p className="text-xs text-slate-400 mt-1">Pontos Ranking</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{winRate}</p>
                <p className="text-xs text-slate-400 mt-1">Taxa de Vitória</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Vitórias"
          value={profile.wins}
          icon={<Trophy className="w-5 h-5" />}
          color="success"
          trend={`Em ${gamesPlayed} partidas`}
        />
        <StatCard
          label="Derrotas"
          value={profile.losses}
          icon={<Skull className="w-5 h-5" />}
          color="danger"
          trend={`Em ${gamesPlayed} partidas`}
        />
        <StatCard
          label="Total de Partidas"
          value={gamesPlayed}
          icon={<Target className="w-5 h-5" />}
          color="info"
          trend="Registadas no radar"
        />
      </div>

      {/* Medals Showcase */}
      <Card className="bg-slate-900/50 border-slate-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="block text-lg font-bold">Condecorações</span>
                  <span className="block text-sm font-normal text-cyan-400/60">
                    {unlockedCount} de {medals.length} medalhas obtidas por este
                    comandante
                  </span>
                </div>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {medals.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
                {sortedMedals.map((medal) => (
                  <MedalBadge key={medal.id} medal={medal} size="md" />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Nenhuma medalha disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
