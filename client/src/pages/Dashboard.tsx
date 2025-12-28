import { useAccount } from 'wagmi';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Trophy, Clock, ArrowUpRight, ArrowDownLeft, Loader2, X } from 'lucide-react';

/**
 * Dashboard Page - Página principal para usuários logados
 * Exibe saldo, histórico de apostas, e opções de saque
 * 
 * INTEGRAÇÃO COM SMART CONTRACT:
 * 1. Descomentar import de useBettingContract
 * 2. Descomentar linha que usa o hook
 * 3. Atualizar useBettingContract() com funções reais:
 *    - getUserBalance(address)
 *    - getUserBets(address)
 *    - claimWinnings(betId)
 * 4. Substituir dados mockados por dados do contrato
 */
import { useUserDashboardData } from '@/hooks/useUserDashboardData';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [, navigate] = useLocation();
  
  const { balance, bets, stats, isLoading, claimWinnings } = useUserDashboardData();

  // Redirecionar se não estiver conectado
  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  // Se não estiver conectado, mostrar mensagem
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Conecte sua Carteira</h1>
          <p className="text-muted-foreground mb-8">Você precisa conectar uma carteira para acessar o dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !balance || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-white">Carregando dados da carteira...</span>
      </div>
    );
  }

  const handleClaim = async (betId: number) => {
    try {
      await claimWinnings(betId);
    } catch (error) {
      console.error('Erro ao sacar:', error);
      // TODO: Mostrar toast de erro
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header do Dashboard */}
      <section className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-muted-foreground font-mono">
                Carteira: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Conectado
            </Badge>
          </div>

          {/* Cards de Saldo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Saldo Total */}
            <Card className="bg-background border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-mono mb-1">Saldo Total</p>
                  <h2 className="text-3xl font-bold text-white">
                    {balance.total.toFixed(2)} <span className="text-lg text-primary">{balance.currency}</span>
                  </h2>
                </div>
                <Wallet className="text-primary" size={24} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">Saldo em conta</p>
            </Card>

            {/* Saldo Disponível */}
            <Card className="bg-background border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-mono mb-1">Disponível</p>
                  <h2 className="text-3xl font-bold text-primary">
                    {balance.available.toFixed(2)} <span className="text-lg">{balance.currency}</span>
                  </h2>
                </div>
                <ArrowDownLeft className="text-primary" size={24} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">Pronto para apostar</p>
            </Card>

            {/* Saldo Bloqueado */}
            <Card className="bg-background border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-mono mb-1">Em Apostas</p>
                  <h2 className="text-3xl font-bold text-yellow-400">
                    {balance.locked.toFixed(2)} <span className="text-lg">{balance.currency}</span>
                  </h2>
                </div>
                <Clock className="text-yellow-400" size={24} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">Aguardando resultado</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="container py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Histórico de Apostas */}
          <div className="lg:col-span-2">
	            <div className="mb-8">
	              <h2 className="text-2xl font-bold text-white mb-2">Minhas Apostas</h2>
	              <p className="text-muted-foreground font-mono text-sm">
	                Total de {bets.length} apostas
	              </p>
	            </div>

	            {/* Lista de Apostas */}
	            <div className="space-y-4">
	              {bets.length === 0 ? (
	                <Card className="p-6 text-center bg-background border-border">
	                  <p className="text-muted-foreground">Nenhuma aposta encontrada.</p>
	                </Card>
	              ) : (
	                bets.map((bet) => (
	                  <Card 
	                    key={bet.id}
	                    className="bg-background border-border p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
	                  >
	                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
	                      {/* Info da Partida */}
	                      <div className="md:col-span-2">
	                        <h3 className="text-white font-bold mb-1">{bet.match}</h3>
	                        <p className="text-muted-foreground text-sm font-mono">{bet.league}</p>
	                        <p className="text-primary text-sm font-mono mt-2">{bet.betType}</p>
	                      </div>

	                      {/* Valores */}
	                      <div className="text-center">
	                        <p className="text-muted-foreground text-xs font-mono mb-1">Aposta</p>
	                        <p className="text-white font-bold">{bet.amount} USDC</p>
	                        <p className="text-muted-foreground text-xs font-mono mt-1">
	                          @ {bet.odds.toFixed(2)}x
	                        </p>
	                      </div>

	                      {/* Ganho Potencial */}
	                      <div className="text-center">
	                        <p className="text-muted-foreground text-xs font-mono mb-1">Ganho Potencial</p>
	                        <p className="text-green-400 font-bold">{bet.potentialWin} USDC</p>
	                      </div>

	                      {/* Status e Ação */}
	                      <div className="flex flex-col gap-2">
	                        {bet.status === 'pending' ? (
	                          <>
	                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 justify-center">
	                              <Clock size={14} className="mr-1" />
	                              Pendente
	                            </Badge>
	                            <p className="text-muted-foreground text-xs font-mono text-center">
	                              {bet.createdAt}
	                            </p>
	                          </>
	                        ) : bet.status === 'won' ? (
	                          <>
	                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 justify-center">
	                              <Trophy size={14} className="mr-1" />
	                              Ganhou
	                            </Badge>
	                            <Button 
	                              size="sm"
	                              className="cyber-button h-8 text-xs"
	                              onClick={() => handleClaim(bet.id)}
	                            >
	                              Sacar <ArrowUpRight size={14} className="ml-1" />
	                            </Button>
	                          </>
	                        ) : (
	                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 justify-center">
	                            <X size={14} className="mr-1" />
	                            Perdeu
	                          </Badge>
	                        )}
	                      </div>
	                    </div>
	                  </Card>
	                ))
	              )}
	            </div>
          </div>

          {/* Coluna Lateral - Resumo e Ações */}
          <div className="lg:col-span-1">
	            {/* Card de Ações Rápidas */}
	            <Card className="bg-background border-border p-6 mb-6">
	              <h3 className="text-white font-bold mb-4">Ações Rápidas</h3>
	              
	              <div className="space-y-3">
	                <Button 
	                  className="cyber-button w-full h-12"
	                  onClick={() => navigate('/')} // Navega para a página principal de apostas
	                >
	                  Fazer Nova Aposta
	                </Button>
	                <Button 
	                  variant="outline" 
	                  className="w-full h-12"
	                  onClick={() => alert('Simulando abertura de modal de Saque. Implementar modal de input e chamar withdrawFunds(amount).')}
	                >
	                  Sacar Fundos
	                </Button>
	                <Button 
	                  variant="outline" 
	                  className="w-full h-12"
	                  onClick={() => alert('Simulando abertura de modal de Depósito. Implementar modal de input e chamar depositFunds(amount).')}
	                >
	                  Depositar
	                </Button>
	              </div>


	            </Card>

	            {/* Card de Estatísticas */}
	            <Card className="bg-background border-border p-6">
	              <h3 className="text-white font-bold mb-4 flex items-center">
	                <TrendingUp size={20} className="mr-2 text-primary" />
	                Estatísticas
	              </h3>
	              
	              <div className="space-y-4">
	                <div className="border-b border-border pb-4">
	                  <p className="text-muted-foreground text-sm font-mono mb-1">Taxa de Vitória</p>
	                  <p className="text-white font-bold text-2xl">{stats.winRate.toFixed(0)}%</p>
	                  <p className="text-muted-foreground text-xs font-mono mt-1">{stats.totalWins} vitórias em {stats.totalBets} apostas</p>
	                </div>

	                <div className="border-b border-border pb-4">
	                  <p className="text-muted-foreground text-sm font-mono mb-1">Lucro Líquido</p>
	                  <p className={`font-bold text-2xl ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
	                    {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)} USDC
	                  </p>
	                  <p className="text-muted-foreground text-xs font-mono mt-1">Ganhos Totais - Perdas Totais</p>
	                </div>

	                <div>
	                  <p className="text-muted-foreground text-sm font-mono mb-1">Apostas Ativas</p>
	                  <p className="text-yellow-400 font-bold text-2xl">{stats.activeBets}</p>
	                  <p className="text-muted-foreground text-xs font-mono mt-1">Aguardando resultado</p>
	                </div>
	              </div>
	            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
