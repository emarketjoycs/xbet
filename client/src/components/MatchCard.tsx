import React, { useState } from 'react';
import { Trophy, Clock, Users, Activity } from "lucide-react";
import { Match } from "../lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BetForm from './BetForm'; // Importar o novo componente

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'Ao Vivo';
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'home' | 'draw' | 'away' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Primeiro Tempo' | 'Segundo Tempo' | 'Jogo Todo'>('Jogo Todo'); // Default category

  return (
    <div className="cyber-card p-1 rounded-none group hover:border-primary/50 transition-colors">
      <div className="bg-card/50 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex flex-col justify-between items-center gap-6">
          
          {/* Match Info */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4 text-sm font-mono text-muted-foreground">
              <span className="flex items-center gap-2 text-primary">
                <Trophy size={16} /> {match.league}
              </span>
              <span className={`flex items-center gap-2 ${isLive ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                <span className={`w-2 h-2 ${isLive ? 'bg-red-500' : 'bg-yellow-500'} rounded-full`}></span> {match.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4 h-20">
              <div className="text-center flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{match.homeTeam}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Mandante</span>
              </div>
              <div className="text-3xl font-bold text-muted-foreground">VS</div>
              <div className="text-center flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{match.awayTeam}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Visitante</span>
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {/* Home Win */}
              <button onClick={() => { setSelectedOutcome('home'); setDialogOpen(true); }} className="group/btn relative flex flex-col items-center justify-center p-4 bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground group-hover/btn:text-white">{match.homeTeam.toUpperCase()}</span>
                <span className="text-4xl font-bold text-primary">{match.odds.home.toFixed(2)}</span>
              </button>

              {/* Draw */}
              <button onClick={() => { setSelectedOutcome('draw'); setDialogOpen(true); }} className="group/btn relative flex flex-col items-center justify-center p-4 bg-card border border-border hover:border-secondary hover:bg-secondary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground group-hover/btn:text-white">EMPATE</span>
                <span className="text-4xl font-bold text-secondary">{match.odds.draw.toFixed(2)}</span>
              </button>

              {/* Away Win */}
              <button onClick={() => { setSelectedOutcome('away'); setDialogOpen(true); }} className="group/btn relative flex flex-col items-center justify-center p-4 bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground group-hover/btn:text-white">{match.awayTeam.toUpperCase()}</span>
                <span className="text-4xl font-bold text-primary">{match.odds.away.toFixed(2)}</span>
              </button>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={14} /> Pool: <span className="text-white">{match.poolSize}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> Encerra em: {match.timeRemaining}
              </span>
            </div>

            {/* Bet Category Selector - Replicating the visual from the image */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Selecione o tempo da aposta</span>
              <div className="flex gap-2">
                {match.betCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as any)}
                    className={
                      selectedCategory === category
                        ? category === 'Jogo Todo' 
                          ? 'bg-secondary text-secondary-foreground font-bold px-4 py-2 text-sm transition-colors' // Cyan for Jogo Todo
                          : 'bg-primary text-primary-foreground font-bold px-4 py-2 text-sm transition-colors' // Green for Primeiro/Segundo Tempo
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 px-4 py-2 text-sm transition-colors'
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="cyber-dialog">
          {selectedOutcome && (
            <BetForm 
              match={match} 
              selectedOutcome={selectedOutcome} 
              selectedCategory={selectedCategory}
              onClose={() => setDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
