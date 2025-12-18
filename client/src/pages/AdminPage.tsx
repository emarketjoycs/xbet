import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Check, X, Wallet, TrendingUp, Clock } from 'lucide-react';
import { useIsOwner, useAdminRead, useAdminWrite, useMatchDetails } from '@/hooks/useAdminContract';
import { useFutureMatches, FutureMatch } from '@/hooks/useSportsApi';
import { format } from 'date-fns';
import { BetOutcome, MatchStatus } from '@shared/const';

/**
 * AdminPage.tsx - Painel Administrativo
 * Permite que o Owner gerencie partidas, definir resultados e sacar taxas
 * 
 * Funcionalidades:
 * - Criar novas partidas
 * - Definir resultado de partidas
 * - Cancelar partidas
 * - Visualizar saldo de taxas da casa
 * - Sacar taxas acumuladas
 */

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [, navigate] = useLocation();
  const { isOwner, isLoadingOwner } = useIsOwner();
  
  // Redirecionar se não for Owner
  /*
  useEffect(() => {
    if (!isLoadingOwner && !isOwner) {
      navigate('/');
      toast.error('Acesso negado. Apenas o Owner pode acessar esta página.');
    }
  }, [isOwner, isLoadingOwner, navigate]);
  */

  if (isLoadingOwner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie partidas, resultados e taxas da casa</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="text-sm font-mono text-primary">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow container py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="create">Criar Partida</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Partidas</TabsTrigger>
            <TabsTrigger value="fees">Taxas</TabsTrigger>
          </TabsList>

          {/* TAB: Overview */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          {/* TAB: Create Match */}
          <TabsContent value="create" className="space-y-6">
            <CreateMatchTab />
          </TabsContent>

          {/* TAB: Manage Matches */}
          <TabsContent value="manage" className="space-y-6">
            <ManageMatchesTab />
          </TabsContent>

          {/* TAB: Fees */}
          <TabsContent value="fees" className="space-y-6">
            <FeesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/**
 * Componente: Overview Tab
 * Exibe estatísticas gerais do contrato
 */
function OverviewTab() {
  const { matchCounter, isLoadingMatchCounter, housePendingBalance, isLoadingHouseBalance } = useAdminRead();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total de Partidas</p>
            <p className="text-3xl font-bold text-primary">
              {isLoadingMatchCounter ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                matchCounter?.toString() || '0'
              )}
            </p>
          </div>
          <Clock className="w-8 h-8 text-primary/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Saldo de Taxas (USDC)</p>
            <p className="text-3xl font-bold text-primary">
              {isLoadingHouseBalance ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `${(Number(housePendingBalance || 0n) / 1e6).toFixed(2)}`
              )}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-primary/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Endereço Conectado</p>
            <p className="text-sm font-mono text-primary truncate">
              {/* Endereço será exibido no header */}
            </p>
          </div>
          <Wallet className="w-8 h-8 text-primary/50" />
        </div>
      </Card>
    </div>
  );
}

/**
 * Componente: Create Match Tab
 * Formulário para criar novas partidas
 */
function CreateMatchTab() {
  const { createMatch, isPending, isSuccess, isError, error } = useAdminWrite();
  const { matches, isLoading: isLoadingMatches, error: matchesError } = useFutureMatches();
  const [selectedMatch, setSelectedMatch] = useState<FutureMatch | null>(null);
  const [seedAmount, setSeedAmount] = useState<number>(100); // Valor inicial de 100 USDC

  useEffect(() => {
    if (isSuccess) {
      toast.success('Partida criada com sucesso!');
      setSelectedMatch(null); // Limpa a seleção após sucesso
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(`Erro: ${error?.message || 'Falha ao criar partida'}`);
    }
  }, [isError, error]);

  useEffect(() => {
    if (matchesError) {
      toast.error(`Erro ao carregar jogos da API: ${matchesError}`);
    }
  }, [matchesError]);

  const handleCreateMatch = () => {
    if (!selectedMatch) {
      toast.error('Selecione uma partida para criar.');
      return;
    }

    // O valor da seed deve ser passado para o contrato em sua menor unidade (wei/gwei, etc.)
    // Como o token é USDC (6 decimais), precisamos multiplicar por 10^6.
    // Para simplificar a simulação no frontend, vamos usar 1e6 como fator de conversão
    // para BigInt, assumindo que o contrato espera o valor em 6 decimais.
    const seedFactor = 1_000_000; // 10^6 para USDC

    const initialPoolHome = BigInt(Math.round(selectedMatch.initialPoolHome * seedFactor));
    const initialPoolDraw = BigInt(Math.round(selectedMatch.initialPoolDraw * seedFactor));
    const initialPoolAway = BigInt(Math.round(selectedMatch.initialPoolAway * seedFactor));

    const startTimeUnix = BigInt(Math.floor(selectedMatch.startTime.getTime() / 1000));
    
    // Chamada para o contrato inteligente com os pools iniciais
    createMatch(
      selectedMatch.homeTeam, 
      selectedMatch.awayTeam, 
      startTimeUnix, 
      initialPoolHome, 
      initialPoolDraw, 
      initialPoolAway
    );
  };

  if (isLoadingMatches) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Carregando jogos futuros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Jogos Futuros (API)</h2>
      <p className="text-white/80">Selecione um jogo para criar a partida no contrato inteligente.</p>

      {/* Input para o valor da Seed */}
      <Card className="p-4 bg-gray-800 border-gray-700">
        <label className="block text-lg font-medium text-white mb-2">Valor da Seed (USDC)</label>
        <Input
          type="number"
          placeholder="Ex: 100"
          value={seedAmount}
          onChange={(e) => setSeedAmount(Number(e.target.value))}
          disabled={isPending}
          className="bg-gray-900 text-white border-gray-600 focus:border-primary"
        />
        <p className="text-sm text-white/60 mt-1">Este valor será distribuído proporcionalmente para os pools iniciais (mínimo 1 USDC).</p>
      </Card>

      {selectedMatch && (
        <Card className="p-6 border-2 border-primary space-y-4 bg-gray-900 text-white">
          <h3 className="text-2xl font-semibold text-primary">Partida Selecionada para Criação</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-white/70">Time da Casa</p>
              <p className="font-extrabold text-xl">{selectedMatch.homeTeam}</p>
            </div>
            <div>
              <p className="text-base text-white/70">Time Visitante</p>
              <p className="font-extrabold text-xl">{selectedMatch.awayTeam}</p>
            </div>
            <div>
              <p className="text-base text-white/70">Início</p>
              <p className="font-bold text-lg">{format(selectedMatch.startTime, 'dd/MM/yyyy')}</p>
              <p className="font-bold text-lg">{format(selectedMatch.startTime, 'HH:mm')}</p>
            </div>
            <div>
              <p className="text-base text-white/70">Campeonato</p>
              <p className="font-bold text-lg">{selectedMatch.league}</p>
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-base text-white/70">Odds Médias (Simuladas)</p>
              <div className="flex space-x-4 mt-1">
                <Badge className="bg-white text-black hover:bg-white/90 text-base font-bold">Casa: {selectedMatch.oddsHome.toFixed(2)}</Badge>
                <Badge className="bg-white text-black hover:bg-white/90 text-base font-bold">Empate: {selectedMatch.oddsDraw.toFixed(2)}</Badge>
                <Badge className="bg-white text-black hover:bg-white/90 text-base font-bold">Fora: {selectedMatch.oddsAway.toFixed(2)}</Badge>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-base text-white/70">Pools Iniciais (Seed de {seedAmount.toFixed(2)} USDC)</p>
              <div className="flex space-x-4 mt-1">
                <Badge className="bg-green-700 text-white hover:bg-green-800 text-base font-bold">Casa: {selectedMatch.initialPoolHome.toFixed(2)} USDC</Badge>
                <Badge className="bg-yellow-700 text-white hover:bg-yellow-800 text-base font-bold">Empate: {selectedMatch.initialPoolDraw.toFixed(2)} USDC</Badge>
                <Badge className="bg-red-700 text-white hover:bg-red-800 text-base font-bold">Fora: {selectedMatch.initialPoolAway.toFixed(2)} USDC</Badge>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleCreateMatch}
            disabled={isPending || seedAmount <= 0}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando Criação...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Confirmar Criação de Partida
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedMatch(null)}
            className="w-full border-white text-white hover:bg-white/10"
          >
            Cancelar Seleção
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card className="p-6 text-center bg-gray-800 border-gray-700">
            <p className="text-white/70">Nenhum jogo futuro encontrado na API.</p>
          </Card>
        ) : (
          matches.map((match) => (
            <Card 
              key={match.id} 
              className={`p-4 cursor-pointer transition-all bg-gray-900 text-white ${selectedMatch?.id === match.id ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50 border-gray-700'}`}
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-extrabold text-white">{match.homeTeam} vs {match.awayTeam}</p>
                  <p className="text-base text-white/70">{match.league}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{format(match.startTime, 'dd/MM/yyyy')}</p>
                  <p className="text-base text-white/70">{format(match.startTime, 'HH:mm')}</p>
                </div>
              </div>
              <div className="flex space-x-4 mt-2 text-base">
                <Badge className="bg-white text-black hover:bg-white/90 font-bold">Casa: {match.oddsHome.toFixed(2)}</Badge>
                <Badge className="bg-white text-black hover:bg-white/90 font-bold">Empate: {match.oddsDraw.toFixed(2)}</Badge>
                <Badge className="bg-white text-black hover:bg-white/90 font-bold">Fora: {match.oddsAway.toFixed(2)}</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Componente: Manage Matches Tab
 * Lista e gerencia partidas existentes
 */
function ManageMatchesTab() {
  const { matchCounter, isLoadingMatchCounter, refetchMatchCounter } = useAdminRead();
  const { setMatchResult, cancelMatch, isPending } = useAdminWrite();
  const [selectedMatchId, setSelectedMatchId] = useState<bigint | null>(null);
  const [selectedResult, setSelectedResult] = useState<BetOutcome | null>(null);

  const matches = Array.from({ length: Number(matchCounter || 0) }, (_, i) => i + 1).map(id => BigInt(id));

  const handleSetResult = (matchId: bigint, result: BetOutcome) => {
    setMatchResult(matchId, result);
    toast.success('Resultado definido com sucesso!');
    refetchMatchCounter();
  };

  const handleCancelMatch = (matchId: bigint) => {
    cancelMatch(matchId);
    toast.success('Partida cancelada com sucesso!');
    refetchMatchCounter();
  };

  if (isLoadingMatchCounter) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!matchCounter || matchCounter === 0n) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Nenhuma partida criada ainda</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {matches.map((matchId) => (
        <MatchManager key={matchId.toString()} matchId={matchId} onSetResult={handleSetResult} onCancelMatch={handleCancelMatch} isPending={isPending} />
      ))}
    </div>
  );
}

/**
 * Componente: MatchManager
 * Gerencia uma partida individual
 */
function MatchManager({ matchId, onSetResult, onCancelMatch, isPending }: { matchId: bigint, onSetResult: (matchId: bigint, result: BetOutcome) => void, onCancelMatch: (matchId: bigint) => void, isPending: boolean }) {
  const { matchData, isLoading } = useMatchDetails(matchId);
  const [result, setResult] = useState<BetOutcome>(BetOutcome.TEAM_A_WINS);

  if (isLoading || !matchData) {
    return (
      <Card className="p-4 flex items-center justify-between">
        <p className="text-muted-foreground">Carregando partida #{matchId.toString()}...</p>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Card>
    );
  }

  const isFinished = matchData.status === MatchStatus.FINISHED;
  const isCanceled = matchData.status === MatchStatus.CANCELED;
  const isPendingResult = matchData.status === MatchStatus.PENDING_RESULT;
  const isOngoing = matchData.status === MatchStatus.ONGOING;

  const statusBadge = () => {
    if (isCanceled) return <Badge variant="destructive">Cancelada</Badge>;
    if (isFinished) return <Badge variant="success">Finalizada</Badge>;
    if (isPendingResult) return <Badge variant="warning">Aguardando Resultado</Badge>;
    if (isOngoing) return <Badge variant="default">Em Andamento</Badge>;
    return <Badge variant="secondary">Agendada</Badge>;
  };

  const resultText = (outcome: BetOutcome) => {
    switch (outcome) {
      case BetOutcome.TEAM_A_WINS: return `${matchData.homeTeam} Vence`;
      case BetOutcome.TEAM_B_WINS: return `${matchData.awayTeam} Vence`;
      case BetOutcome.DRAW: return 'Empate';
      default: return 'N/A';
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Partida #{matchId.toString()}: {matchData.homeTeam} vs {matchData.awayTeam}</h3>
        {statusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p><strong>Início:</strong> {new Date(Number(matchData.startTime) * 1000).toLocaleString()}</p>
        <p><strong>Pool Total:</strong> {(Number(matchData.totalPoolAmount) / 1e6).toFixed(2)} USDC</p>
        <p><strong>Pool {matchData.homeTeam}:</strong> {(Number(matchData.poolTeamA) / 1e6).toFixed(2)} USDC</p>
        <p><strong>Pool Empate:</strong> {(Number(matchData.poolDraw) / 1e6).toFixed(2)} USDC</p>
        <p><strong>Pool {matchData.awayTeam}:</strong> {(Number(matchData.poolTeamB) / 1e6).toFixed(2)} USDC</p>
        {isFinished && <p className="col-span-2"><strong>Resultado:</strong> {resultText(matchData.result)}</p>}
      </div>

      {!isFinished && !isCanceled && (
        <div className="pt-4 border-t border-border space-y-4">
          <h4 className="font-semibold">Definir Resultado</h4>
          <div className="flex space-x-2">
            <Button variant={result === BetOutcome.TEAM_A_WINS ? 'default' : 'outline'} onClick={() => setResult(BetOutcome.TEAM_A_WINS)} disabled={isPending}>
              {matchData.homeTeam} Vence
            </Button>
            <Button variant={result === BetOutcome.DRAW ? 'default' : 'outline'} onClick={() => setResult(BetOutcome.DRAW)} disabled={isPending}>
              Empate
            </Button>
            <Button variant={result === BetOutcome.TEAM_B_WINS ? 'default' : 'outline'} onClick={() => setResult(BetOutcome.TEAM_B_WINS)} disabled={isPending}>
              {matchData.awayTeam} Vence
            </Button>
          </div>
          <div className="flex space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isPending} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Resultado
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Confirmar Resultado</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja definir o resultado desta partida como: <strong>{resultText(result)}</strong>? Esta ação é irreversível.
                </AlertDialogDescription>
                <div className="flex justify-end space-x-2">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onSetResult(matchId, result)} disabled={isPending}>
                    Confirmar
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Partida
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Cancelar Partida</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja **cancelar** esta partida? Todas as apostas serão reembolsadas. Esta ação é irreversível.
                </AlertDialogDescription>
                <div className="flex justify-end space-x-2">
                  <AlertDialogCancel>Não, Manter</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancelMatch(matchId)} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                    Sim, Cancelar
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Componente: Fees Tab
 * Gerencia o saque das taxas da casa
 */
function FeesTab() {
  const { housePendingBalance, isLoadingHouseBalance, refetchHouseBalance } = useAdminRead();
  const { withdrawHouseFees, isPending, isSuccess, isError, error } = useAdminWrite();

  const handleWithdraw = () => {
    withdrawHouseFees();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Taxas sacadas com sucesso!');
      refetchHouseBalance();
    }
  }, [isSuccess, refetchHouseBalance]);

  useEffect(() => {
    if (isError) {
      toast.error(`Erro: ${error?.message || 'Falha ao sacar taxas'}`);
    }
  }, [isError, error]);

  const balance = Number(housePendingBalance || 0n) / 1e6;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Taxas da Casa</h2>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <p className="text-lg font-medium">Saldo Pendente de Taxas (USDC)</p>
        <p className="text-3xl font-bold text-primary">
          {isLoadingHouseBalance ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            `${balance.toFixed(2)}`
          )}
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isPending || balance <= 0} className="w-full" size="lg">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sacando...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Sacar Taxas ({balance.toFixed(2)} USDC)
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirmar Saque de Taxas</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja sacar o saldo de taxas de <strong>{balance.toFixed(2)} USDC</strong> para o endereço do Owner?
          </AlertDialogDescription>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} disabled={isPending}>
              Confirmar Saque
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
