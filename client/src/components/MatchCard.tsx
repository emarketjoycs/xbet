import { Trophy, Clock, Users, Activity } from "lucide-react";
import { Match } from "../lib/mockData";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'Ao Vivo';

  return (
    <div className="cyber-card p-1 rounded-none group hover:border-primary/50 transition-colors">
      <div className="bg-card/50 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex flex-col justify-between items-center gap-8">
          
          {/* Match Info */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-6 text-sm font-mono text-muted-foreground">
              <span className="flex items-center gap-2 text-primary">
                <Trophy size={16} /> {match.league}
              </span>
              <span className={`flex items-center gap-2 ${isLive ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                <span className={`w-2 h-2 ${isLive ? 'bg-red-500' : 'bg-yellow-500'} rounded-full`}></span> {match.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="text-center flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{match.homeTeam}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Mandante</span>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              <div className="text-center flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{match.awayTeam}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Visitante</span>
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-4">
              {/* Home Win */}
              <button className="group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">{match.homeTeam.toUpperCase()}</span>
                <span className="text-2xl font-bold text-primary font-mono">{match.odds.home.toFixed(2)}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
              </button>

              {/* Draw */}
              <button className="group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border hover:border-secondary hover:bg-secondary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">EMPATE</span>
                <span className="text-2xl font-bold text-secondary font-mono">{match.odds.draw.toFixed(2)}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
              </button>

              {/* Away Win */}
              <button className="group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border hover:border-primary hover:bg-primary/10 transition-all duration-300">
                <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">{match.awayTeam.toUpperCase()}</span>
                <span className="text-2xl font-bold text-primary font-mono">{match.odds.away.toFixed(2)}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
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

            <div className="mt-4 flex flex-wrap gap-2">
              {match.betCategories.map(category => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
