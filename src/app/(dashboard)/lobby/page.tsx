/**
 * Lobby Page - Naval Battle Command Center
 * 
 * Dashboard page where authenticated users can:
 * - View their statistics and rank
 * - Start PvE training matches against AI
 * - Challenge other players in PvP matches
 * - Browse available matches
 */


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useJoinMatchMutation } from '@/hooks/queries/useMatchMutations';
import { GameStatus } from '@/types/game-enums';
import { UserStatsCard } from '@/components/lobby/UserStatsCard';
import { GameModeSelector } from '@/components/lobby/GameModeSelector';
import { LeaderBoardResponse } from '@/types/api-responses';
import { Leaderboard } from '@/components/lobby/LeaderBoard';
import { ScrollText, User, Zap } from 'lucide-react';

export default function LobbyPage() {
  const router = useRouter();
  

  return (
    <div className="display-flex max-w-100vw mx-auto  ">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Centro de Comando
        </h1>
        
      </div>

      {/* Main Grid Layout - 2 columns on desktop, 1 on mobile */}
      <div className="flex center space-evenly gap-6 ">
        {/* Left Column - User Stats */}
        <div className="span-4 space-y-6">
          <UserStatsCard />
          
          {/* Quick Actions */}
          <Card className='rounded-md border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden h-half'>
            <CardHeader className="pb-3 ">
              <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Zap className="w-5 h-5" />
                      Ações Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="link"
                className="w-full justify-start text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
                onClick={() => router.push('/profile')}>
                <User className="mr-3 h-4 w-4 text-cyan-500 group-hover:text-cyan-400" />
                    Ver Perfil Completo
              </Button>
              <Button
                variant="link"
                className="w-full justify-start text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
                onClick={() => router.push('/lobby')}
              >
                <ScrollText className="mr-3 h-4 w-4 text-purple-500 group-hover:text-purple-400" />
          Histórico de Batalhas
              </Button>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Right Column - Battle Station */}
        <div className='display-flex center gap-10'>
          
          {/* Section Header */}
          {/* Game Mode Selector */}
          <GameModeSelector />
          {/* Available Matches List */}
          
        </div>
        <div className="lg:col-span-8 space-y-6">
          <Leaderboard></Leaderboard>
        </div>
      </div>
    </div>
  );
}
