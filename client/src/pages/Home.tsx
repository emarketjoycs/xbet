import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import MatchCard from "@/components/MatchCard";
import { Dialog } from "@/components/ui/dialog"; // Adicionar Dialog para evitar erro de componente não definido
import { useFormingMarkets } from "@/hooks/useBackendMatches";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Trophy, Clock, TrendingUp, ShieldCheck, Users, Activity } from "lucide-react";

export default function Home() {
  const { markets, isLoading } = useFormingMarkets();

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
	
	          {/* Match Carousel */}
	          <Carousel
	            opts={{
	              align: "start",
	              loop: true,
	            }}
	            className="w-full relative px-12" // Adicionado padding para as setas
	          >
            <CarouselContent>
              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground">
                  Carregando partidas...
                </div>
              ) : !markets || markets.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhuma partida disponível no momento
                </div>
              ) : (
                markets && markets.map((market) => (
                  <CarouselItem key={market.marketId} className="md:basis-1/2 lg:basis-1/3">
                    <MatchCard match={{
                      id: market.marketId.toString(),
                      homeTeam: market.homeTeam,
                      awayTeam: market.awayTeam,
                      league: market.league,
                      date: new Date(market.startTime * 1000).toLocaleDateString('pt-BR'),
                      time: new Date(market.startTime * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                      oddsHome: 0, // Será calculado dinamicamente
                      oddsDraw: 0,
                      oddsAway: 0,
                      status: market.state === 1 ? 'upcoming' : 'live',
                      marketId: market.marketId
                    }} />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
	            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
	            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
	          </Carousel>
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
                Segurança total com contratos verificados na Polygon PoS. Sem intermediários, sem risco de custódia.
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
