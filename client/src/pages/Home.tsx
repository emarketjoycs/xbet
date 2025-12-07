import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Trophy, Clock, TrendingUp, ShieldCheck, Users, Activity, Loader2, XCircle } from "lucide-react";
import { useMatchData, useMatchOdds } from '@/hooks/useBettingContract';
import BetForm from '@/components/BetForm';
import { formatUnits } from 'viem';

export default function Home() {
  // Hardcoded Match ID para demonstração. Em produção, você listaria vários IDs.
  const MATCH_ID = 1; 

  const { match, isLoading: isMatchLoading, isError: isMatchError } = useMatchData(MATCH_ID);
  
  // Variável para garantir que o MATCH_ID seja "usado" e evitar aviso do linter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Variável para garantir que o MATCH_ID seja "usado" e evitar aviso do linter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _matchId = MATCH_ID;
  const { odds, isLoading: isOddsLoading, isError: isOddsError } = useMatchOdds(MATCH_ID);

  const isLoading = isMatchLoading || isOddsLoading;
  const isError = isMatchError || isOddsError;

  // Dados mockados para a liga (o contrato não armazena a liga)
  const league = "Brasileirão Série A"; 

  // Formatação dos dados
  const homeTeam = match?.homeTeam || "Time A";
  const awayTeam = match?.awayTeam || "Time B";
  const totalPoolAmount = match?.totalPoolAmount ? formatUnits(match.totalPoolAmount, 6) : "0";
  const startTime = match?.startTime ? new Date(Number(match.startTime) * 1000).toLocaleString() : "Data Indisponível";
  const status = match?.status === 0 ? "Pendente" : match?.status === 1 ? "Finalizado" : "Cancelado";
  const isPending = match?.status === 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-white mt-4">Carregando dados da blockchain...</p>
      </div>
    );
  }

  if (isError || !match || !odds) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Erro ao Carregar Partida</h1>
        <p className="text-muted-foreground">Verifique se o contrato está deployado e o endereço correto está em useBettingContract.ts.</p>
        <p className="text-sm text-primary mt-2">Partida ID: {MATCH_ID}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
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

          {/* Match Card */}
          <div className="cyber-card p-1 rounded-none group hover:border-primary/50 transition-colors">
            <div className="bg-card/50 p-6 md:p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                
                {/* Match Info */}
                <div className="flex-1 w-full">
	                  <div className="flex items-center justify-between mb-6 text-sm font-mono text-muted-foreground">
	                    <span className="flex items-center gap-2 text-primary">
	                      <Trophy size={16} /> {league}
	                    </span>
	                    <span className={`flex items-center gap-2 ${isPending ? 'text-yellow-500 animate-pulse' : 'text-red-500'}`}>
	                      <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-red-500'}`}></span> {status}
	                    </span>
	                  </div>

	                  <div className="flex items-center justify-between gap-4 mb-2">
	                    <div className="text-center flex-1">
	                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{homeTeam}</h3>
	                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Mandante</span>
	                    </div>
	                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
	                    <div className="text-center flex-1">
	                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{awayTeam}</h3>
	                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Visitante</span>
	                    </div>
	                  </div>
                </div>

                {/* Betting Options */}
                <div className="flex-1 w-full md:max-w-xl">
                  <div className="grid grid-cols-3 gap-4">
	                    {/* Home Win */}
	                    <BetForm matchId={MATCH_ID} outcome={1} teamName={homeTeam} odds={odds.teamA} />
	
	                    {/* Draw */}
	                    <BetForm matchId={MATCH_ID} outcome={2} teamName="Empate" odds={odds.draw} />
	
	                    {/* Away Win */}
	                    <BetForm matchId={MATCH_ID} outcome={3} teamName={awayTeam} odds={odds.teamB} />
                  </div>
                  
	                  <div className="mt-4 flex justify-between items-center text-xs font-mono text-muted-foreground">
	                    <span className="flex items-center gap-1">
	                      <Users size={14} /> Pool Total: <span className="text-white">{totalPoolAmount} USDC</span>
	                    </span>
	                    <span className="flex items-center gap-1">
	                      <Clock size={14} /> Início: {startTime}
	                    </span>
	                  </div>
                </div>

              </div>
            </div>
          </div>
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
