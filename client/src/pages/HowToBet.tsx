import { Card } from "@/components/ui/card";
import { Wallet, ArrowRightLeft, Trophy, Coins } from "lucide-react";

export default function HowToBet() {
  const steps = [
    {
      icon: <Wallet className="w-10 h-10 text-primary" />,
      title: "1. Conecte sua Carteira",
      description: "Use MetaMask, Rabby ou qualquer carteira compatível com WalletConnect. Certifique-se de estar na rede Arbitrum One e ter USDC para apostar e ETH para taxas de gás."
    },
    {
      icon: <ArrowRightLeft className="w-10 h-10 text-secondary" />,
      title: "2. Escolha o Lado",
      description: "Analise as odds em tempo real. Lembre-se: em um sistema P2P, as odds mudam conforme mais pessoas apostam em cada lado. O mercado define o preço."
    },
    {
      icon: <Coins className="w-10 h-10 text-primary" />,
      title: "3. Confirme a Aposta",
      description: "Insira o valor em USDC e assine a transação. Seus fundos ficam travados no Smart Contract até o fim da partida. Segurança total e sem custódia."
    },
    {
      icon: <Trophy className="w-10 h-10 text-secondary" />,
      title: "4. Receba os Ganhos",
      description: "Se seu time vencer, você recebe sua aposta de volta + lucro proporcional do pool perdedor (menos 1% de taxa da plataforma). O saque é manual (pull payment) para segurança."
    }
  ];

  return (
    <div className="container py-20 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 glitch-text" data-text="COMO APOSTAR">
          COMO APOSTAR
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
          Guia rápido para participar do futuro das apostas esportivas descentralizadas.
        </p>
      </div>

      <div className="grid gap-8 relative">
        {/* Connecting Line (Desktop only) */}
        <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary opacity-30"></div>

        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col md:flex-row gap-8 items-start group">
            {/* Step Number/Icon */}
            <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-none border border-border bg-background flex items-center justify-center group-hover:border-primary transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              {step.icon}
            </div>

            {/* Content Card */}
            <Card className="flex-1 bg-card/50 border-border p-8 hover:border-primary/30 transition-all duration-300 cyber-card">
              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-mono text-sm">
                {step.description}
              </p>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-16 p-6 border border-yellow-500/30 bg-yellow-500/5 rounded-none">
        <h4 className="text-yellow-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          ⚠️ Importante
        </h4>
        <p className="text-sm text-muted-foreground font-mono">
          Em caso de partidas adiadas ou canceladas, o Smart Contract possui uma função de emergência que permite o reembolso total (refund) de todas as apostas para as carteiras de origem.
        </p>
      </div>
    </div>
  );
}
