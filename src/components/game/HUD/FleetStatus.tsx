// Componente FleetStatus - Status da frota (navios vivos/afundados)
"use client";

import React from "react";
import { ShipDto } from "@/types/api-responses";
import { SHIP_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FleetStatusProps {
    ships: ShipDto[];
    title: string;
    isOpponentFleet?: boolean;
}

// O total padrão de navios em uma partida é 6.
const TOTAL_EXPECTED_SHIPS = 6;

export const FleetStatus: React.FC<FleetStatusProps> = ({ ships, title, isOpponentFleet = false }) => {

    // 1. Calcular o estado correto baseando-nos no Fog of War
    let totalShips = ships.length;
    let aliveShips = ships.filter((s) => !s.isSunk).length;

    if (isOpponentFleet) {
        // Se é o adversário, os navios 'ships' são apenas os navios REVELADOS (afundados).
        // Então o total de navios do jogo é 6.
        totalShips = TOTAL_EXPECTED_SHIPS;
        // Os navios vivos são o total de navios (6) MENOS os que já afundámos.
        const sunkCount = ships.filter((s) => s.isSunk).length;
        aliveShips = totalShips - sunkCount;
    }

    const getShipHits = (ship: ShipDto): number => {
        return ship.coordinates?.filter((c) => c.isHit).length ?? 0;
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 shadow-md h-full flex flex-col">
            <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Navios Restantes</span>
                    <span className="font-bold text-white">
            {aliveShips} / {totalShips}
          </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className={cn(
                            "h-2 rounded-full transition-all",
                            aliveShips > 3
                                ? "bg-green-500"
                                : aliveShips > 1
                                    ? "bg-yellow-500"
                                    : "bg-red-500",
                        )}
                        style={{ width: `${(aliveShips / totalShips) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2 flex-1">
                {/* Renderiza os navios que temos dados */}
                {ships.map((ship) => {
                    const hits = getShipHits(ship);
                    const displayName =
                        SHIP_NAMES[ship.name as keyof typeof SHIP_NAMES] || ship.name;

                    return (
                        <div
                            key={ship.id}
                            className={cn(
                                "flex items-center justify-between p-2 rounded text-sm transition-all",
                                ship.isSunk
                                    ? "bg-red-900/40 border border-red-700/50 line-through text-red-300 animate-ship-sunk"
                                    : "bg-green-900/30 border border-green-700/30 text-green-300",
                            )}
                        >
                            <span>{displayName}</span>
                            <span className="text-xs">
                {ship.isSunk
                    ? "💥 Afundado"
                    : `❤️ ${ship.size - hits}/${ship.size}`}
              </span>
                        </div>
                    );
                })}

                {/* Se for a frota do oponente e ainda houver navios ocultos, renderizamos "slots" misteriosos para manter a interface simétrica 
        */}
                {isOpponentFleet && ships.length < TOTAL_EXPECTED_SHIPS && (
                    <>
                        {Array.from({ length: TOTAL_EXPECTED_SHIPS - ships.length }).map((_, index) => (
                            <div
                                key={`hidden-ship-${index}`}
                                className="flex items-center justify-between p-2 rounded text-sm transition-all bg-slate-800/80 border border-slate-700 border-dashed text-slate-500 opacity-60"
                            >
                                <span>Sinal de Radar Desconhecido</span>
                                <span className="text-xs">❓ / ❓</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};