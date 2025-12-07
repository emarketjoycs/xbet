import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Whitepaper() {
  return (
    <div className="container py-20 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar Navigation */}
        <div className="hidden md:block col-span-1 sticky top-24 h-fit">
          <h3 className="text-primary font-bold uppercase tracking-widest mb-6 text-sm">Índice</h3>
          <nav className="flex flex-col gap-3 text-sm font-mono text-muted-foreground border-l border-border pl-4">
            <a href="#intro" className="hover:text-white transition-colors">1. Introdução</a>
            <a href="#architecture" className="hover:text-white transition-colors">2. Arquitetura</a>
            <a href="#odds" className="hover:text-white transition-colors">3. Cálculo de Odds</a>
            <a href="#security" className="hover:text-white transition-colors">4. Segurança</a>
            <a href="#roadmap" className="hover:text-white transition-colors">5. Roadmap</a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="col-span-1 md:col-span-3">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 glitch-text" data-text="WHITEPAPER">
              WHITEPAPER <span className="text-primary text-2xl align-top">v1.0</span>
            </h1>
            <p className="text-xl text-muted-foreground font-mono">
              Especificação técnica do protocolo XBET de apostas descentralizadas.
            </p>
          </div>

          <div className="space-y-16 text-gray-300 leading-relaxed">
            
            <section id="intro">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-primary">01.</span> Introdução
              </h2>
              <p className="mb-4">
                O XBET é um protocolo de apostas peer-to-peer (P2P) construído na rede Arbitrum One. Diferente das casas de apostas tradicionais ("The House"), o XBET atua apenas como um facilitador tecnológico, permitindo que usuários apostem uns contra os outros em um ambiente trustless.
              </p>
              <p>
                O objetivo é eliminar o risco de contraparte, garantir pagamentos instantâneos via contratos inteligentes e oferecer odds justas determinadas puramente pela oferta e demanda do mercado.
              </p>
            </section>

            <Separator className="bg-border" />

            <section id="architecture">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-secondary">02.</span> Arquitetura Técnica
              </h2>
              <div className="bg-card/50 border border-border p-6 mb-6 font-mono text-sm">
                <ul className="list-disc list-inside space-y-2">
                  <li><span className="text-white font-bold">Rede:</span> Arbitrum One (Layer 2 Ethereum)</li>
                  <li><span className="text-white font-bold">Token Base:</span> USDC (USD Coin)</li>
                  <li><span className="text-white font-bold">Oráculos:</span> Chainlink Data Feeds + Adaptadores SportMonks</li>
                  <li><span className="text-white font-bold">Padrão de Pagamento:</span> Pull-over-Push (ReentrancyGuard)</li>
                </ul>
              </div>
              <p>
                Utilizamos uma arquitetura modular onde cada evento esportivo é gerenciado por um contrato isolado ou uma struct robusta dentro do contrato Factory, garantindo que falhas em um evento não comprometam a liquidez global do protocolo.
              </p>
            </section>

            <Separator className="bg-border" />

            <section id="odds">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-primary">03.</span> Cálculo de Odds (Pari-Mutuel)
              </h2>
              <p className="mb-4">
                As odds não são fixas. Elas são calculadas dinamicamente com base no volume total apostado em cada resultado possível (Vitória Casa, Empate, Vitória Visitante).
              </p>
              <div className="bg-muted/20 p-4 border-l-2 border-primary font-mono text-sm mb-4">
                Odd = (Pool Total - Taxa Protocolo) / Pool do Resultado Específico
              </div>
              <p>
                Exemplo: Se há 1000 USDC no total e 200 USDC apostados no Santos, a odd para o Santos é aprox. 4.95x (considerando 1% de taxa). Isso garante que o protocolo seja sempre solvente, pois os perdedores pagam os vencedores.
              </p>
            </section>

            <Separator className="bg-border" />

            <section id="security">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-secondary">04.</span> Segurança e Auditoria
              </h2>
              <p className="mb-4">
                A segurança é a prioridade número um. Implementamos padrões rigorosos de desenvolvimento Solidity:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Uso de <span className="text-white">OpenZeppelin ReentrancyGuard</span> para prevenir ataques de reentrância nos saques.</li>
                <li>Padrão <span className="text-white">PullPayment</span>: O contrato nunca envia tokens automaticamente; o usuário deve solicitar o saque (claim).</li>
                <li>Mecanismo de <span className="text-white">Emergency Stop</span> (Circuit Breaker) para pausar contratos em caso de anomalias.</li>
                <li>Reembolso automático em caso de cancelamento oficial da partida via oráculo.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
