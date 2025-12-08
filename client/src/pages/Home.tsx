import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BetForm } from "@/components/BetForm";
import { useMatchData, useMatchOdds } from "@/hooks/useBettingContract";
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "wouter";
import { ArrowRight, Trophy, Clock, TrendingUp, ShieldCheck, Users, Activity } from "lucide-react";

export default function Home() {
  // Dados simulados para a partida
  // Dados de mock para múltiplos jogos em destaque
const FEATURED_MATCHES = [
  { id: 1, league: "Brasileirão Série A", homeTeam: "Santos", awayTeam: "Corinthians", startTime: "Hoje, 21:30", status: "Ao Vivo", poolSize: "12,450 USDC", odds: { home: 2.45, draw: 3.10, away: 2.85 } },
  { id: 2, league: "Premier League", homeTeam: "Liverpool", awayTeam: "Manchester Utd", startTime: "Amanhã, 16:00", status: "Aberto", poolSize: "25,100 USDC", odds: { home: 1.80, draw: 3.50, away: 4.20 } },
  { id: 3, league: "La Liga", homeTeam: "Real Madrid", awayTeam: "Barcelona", startTime: "Sábado, 18:45", status: "Aberto", poolSize: "30,500 USDC", odds: { home: 2.10, draw: 3.30, away: 3.50 } },
];

export default function Home() {
  const { isConnected } = useAccount();
  // Estado para controlar qual opção de aposta está selecionada
  const [selectedBet, setSelectedBet] = useState<{ matchId: number, outcome: 0 | 1 | 2, teamName: string, odds: number } | null>(null);

  // Função para lidar com o sucesso da aposta
  const handleBetSuccess = () => {
    setSelectedBet(null); // Fecha o formulário após a aposta
    // Aqui você pode adicionar uma notificação de sucesso
    console.log("Aposta realizada com sucesso!");
  };

  // Componente MatchCard para reutilização
  const MatchCard = ({ match }: { match: typeof FEATURED_MATCHES[0] }) => {
    // Hooks de dados reais (usando o ID do mock)
    const { data: matchData, isLoading: isLoadingMatchData } = useMatchData(match.id);
    const { oddsData, isLoading: isLoadingOdds } = useMatchOdds(match.id);

    // Dados reais ou fallback
    const currentOdds = oddsData || match.odds;
    // Assumindo que matchData[0], [1], [2] são os pools em wei/unidades do token (6 decimais para USDC)
    const currentPool = matchData ? \`\${(Number(matchData[0]) + Number(matchData[1]) + Number(matchData[2])) / 10**6} USDC\` : match.poolSize;
    // Assumindo que matchData[3] é o status (ex: 1 para Ao Vivo/Aberto)
    const currentStatus = matchData ? (Number(matchData[3]) === 1 ? "Ao Vivo" : "Aberto") : match.status;
    const currentHomeOdds = currentOdds.oddsTeamA || match.odds.home;
    const currentDrawOdds = currentOdds.oddsDraw || match.odds.draw;
    const currentAwayOdds = currentOdds.oddsTeamB || match.odds.away;

    if (isLoadingMatchData || isLoadingOdds) {
      return (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Carregando dados...</p>
        </div>
      );
    }

    return (
      <div className="cyber-card p-1 rounded-none group hover:border-primary/50 transition-colors">
        <div className="bg-card/50 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Match Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6 text-sm font-mono text-muted-foreground">
                <span className="flex items-center gap-2 text-primary">
                  <Trophy size={16} /> {match.league}
                </span>
                <span className="flex items-center gap-2 text-red-500 animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> {currentStatus}
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
            <div className="flex-1 w-full md:max-w-xl">
              <div className="grid grid-cols-3 gap-4">
                {/* Home Win */}
                <button 
                  onClick={() => setSelectedBet({ matchId: match.id, outcome: 0, teamName: match.homeTeam, odds: currentHomeOdds })}
                  className={`group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border transition-all duration-300 ${selectedBet?.matchId === match.id && selectedBet?.outcome === 0 ? 'border-primary ring-2 ring-primary/50' : 'hover:border-primary hover:bg-primary/10'}`}
                >
                  <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">{match.homeTeam.toUpperCase()}</span>
                  <span className="text-2xl font-bold text-primary font-mono">{currentHomeOdds.toFixed(2)}</span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
                </button>

                {/* Draw */}
                <button 
                  onClick={() => setSelectedBet({ matchId: match.id, outcome: 1, teamName: "EMPATE", odds: currentDrawOdds })}
                  className={`group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border transition-all duration-300 ${selectedBet?.matchId === match.id && selectedBet?.outcome === 1 ? 'border-secondary ring-2 ring-secondary/50' : 'hover:border-secondary hover:bg-secondary/10'}`}
                >
                  <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">EMPATE</span>
                  <span className="text-2xl font-bold text-secondary font-mono">{currentDrawOdds.toFixed(2)}</span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
                </button>

                {/* Away Win */}
                <button 
                  onClick={() => setSelectedBet({ matchId: match.id, outcome: 2, teamName: match.awayTeam, odds: currentAwayOdds })}
                  className={`group/btn relative flex flex-col items-center justify-center p-4 bg-muted/30 border border-border transition-all duration-300 ${selectedBet?.matchId === match.id && selectedBet?.outcome === 2 ? 'border-primary ring-2 ring-primary/50' : 'hover:border-primary hover:bg-primary/10'}`}
                >
                  <span className="text-sm text-muted-foreground mb-1 group-hover/btn:text-white">{match.awayTeam.toUpperCase()}</span>
                  <span className="text-2xl font-bold text-primary font-mono">{currentAwayOdds.toFixed(2)}</span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left"></div>
                </button>
              </div>
              
              <div className="mt-4 flex justify-between items-center text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users size={14} /> Pool: <sp  return (  <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-banner.png" 
            alt="Cyberpunk Stadium" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="container relative z-10 pt-20">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary hover:bg-primary/30 px-4 py-1 text-sm uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Protocolo Descentralizado
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight glitch-text" data-text="APOSTAS DESCENTRALIZADAS">
              APOSTAS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                DESCENTRALIZADAS
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-xl font-mono border-l-2 border-primary pl-4">
              DxBet: Sem casa, sem limites. O sistema calcula as odds baseado no volume de apostas. 
              O vencedor leva tudo (menos 1% de taxa).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="cyber-button h-14 text-lg">
                Começar a Apostar <ArrowRight className="ml-2" />
              </Button>
              <Link href="/whitepaper">
                <Button variant="outline" className="cyber-button-outline h-14 text-lg">
                  Ler Whitepaper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Matches Section */}
      <section className="py-20 relative">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="text-primary" />
              JOGOS EM DESTAQUE
            </h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-primary text-primary bg-primary/5 cursor-pointer">Futebol</Badge>
              <Badge variant="outline" className="border-muted text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors">E-Sports</Badge>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {FEATURED_MATCHES.map((match) => (
                <CarouselItem key={match.id} className="md:basis-1/2 lg:basis-1/3">
                  <MatchCard match={match} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>

          {/* Bet Form Modal/Section */}
          {selectedBet && (
            <div className="mt-8 max-w-lg mx-auto">
              <BetForm
                matchId={selectedBet.matchId}
                outcome={selectedBet.outcome}
                teamName={selectedBet.teamName}
                odds={selectedBet.odds}
                onBetSuccess={handleBetSuccess}
              />
            </div>
          )}
        </div>
      </section>

      {/* Features / Whitepaper Teaser */}
      <section className="py-20 bg-muted/20 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border p-8 hover:border-primary/50 transition-colors group">
              <ShieldCheck className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Smart Contracts Auditados</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Segurança total com contratos verificados na Arbitrum One. Sem intermediários, sem risco de custódia.
              </p>
            </Card>

            <Card className="bg-card/50 border-border p-8 hover:border-secondary/50 transition-colors group">
              <TrendingUp className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Odds Dinâmicas P2P</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O mercado define o preço. As odds flutuam em tempo real baseadas no volume de apostas de cada lado.
              </p>
            </Card>

            <Card className="bg-card/50 border-border p-8 hover:border-primary/50 transition-colors group">
              <Users className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Comunidade Governa</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Taxas mínimas de 1% revertidas para manutenção do protocolo. Transparência total on-chain.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
