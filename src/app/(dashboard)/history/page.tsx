"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Swords, Trophy, MinusCircle, Clock } from "lucide-react";

import { useMatchHistory } from "@/hooks/queries/useMatchHistory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HistoryPage() {
  const router = useRouter();
  const { data: history, isLoading, isError } = useMatchHistory();

  const getResultIcon = (result: string) => {
    switch (result) {
      case "Vitória":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "Derrota":
        return <Swords className="w-5 h-5 text-red-500" />;
      default:
        return <MinusCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "Vitória":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "Derrota":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
          onClick={() => router.push("/lobby")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-white">Histórico de Batalhas</h1>
      </div>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400">Suas últimas missões</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-slate-400">Buscando registros táticos...</p>
          )}
          {isError && (
            <p className="text-red-400">
              Falha ao acessar os arquivos da marinha.
            </p>
          )}

          {history && history.length === 0 && (
            <div className="text-center py-10">
              <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">
                Você ainda não participou de nenhuma batalha.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {history?.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full border ${getResultColor(match.result)}`}
                  >
                    {getResultIcon(match.result)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      vs {match.opponentName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded text-cyan-400 text-xs font-semibold uppercase">
                        {match.gameMode}
                      </span>
                      <span>
                        {format(
                          parseISO(match.playedAt),
                          "dd 'de' MMMM 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {match.duration && (
                  <div className="flex items-center text-slate-400 text-sm bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800">
                    <Clock className="w-4 h-4 mr-1.5 text-cyan-500" />
                    {match.duration.substring(0, 8)}{" "}
                    {/* Formata o TimeSpan para HH:mm:ss */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
