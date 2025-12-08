import { useEffect, useState } from 'react';
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
import { BetOutcome, MatchStatus } from '../../shared/const';

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
  useEffect(() => {
    if (!isLoadingOwner && !isOwner) {
      navigate('/');
      toast.error('Acesso negado. Apenas o Owner pode acessar esta página.');
    }
  }, [isOwner, isLoadingOwner, navigate]);

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
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [startTime, setStartTime] = useState('');

  const handleCreateMatch = async () => {
    if (!homeTeam.trim() || !awayTeam.trim() || !startTime) {
      toast.error('Preencha todos os campos');
      return;
    }

    const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);
    if (startTimeUnix <= Math.floor(Date.now() / 1000)) {
      toast.error('A data/hora deve ser no futuro');
      return;
    }

    createMatch(homeTeam, awayTeam, BigInt(startTimeUnix));
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Partida criada com sucesso!');
      setHomeTeam('');
      setAwayTeam('');
      setStartTime('');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(`Erro: ${error?.message || 'Falha ao criar partida'}`);
    }
  }, [isError, error]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Criar Nova Partida</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time da Casa</label>
            <Input
              placeholder="Ex: Santos"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Visitante</label>
            <Input
              placeholder="Ex: Corinthians"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Data e Hora de Início</label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isPending}
          />
        </div>

        <Button
          onClick={handleCreateMatch}
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Criar Partida
            </>
          )}
        </Button>
      </div>
    </Card>
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
    <div className="space-y-4">
      {matches.map((matchId) => (
        <MatchCard
          key={matchId.toString()}
          matchId={matchId}
          onSetResult={handleSetResult}
          onCancel={handleCancelMatch}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

/**
 * Componente: Match Card
 * Card individual para cada partida
 */
function MatchCard({
  matchId,
  onSetResult,
  onCancel,
  isPending,
}: {
  matchId: bigint;
  onSetResult: (matchId: bigint, result: BetOutcome) => void;
  onCancel: (matchId: bigint) => void;
  isPending: boolean;
}) {
  const { matchData, isLoading } = useMatchDetails(matchId);
  const [selectedResult, setSelectedResult] = useState<BetOutcome | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!matchData || !matchData.exists) {
    return null;
  }

  const statusBadgeColor = {
    [MatchStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
    [MatchStatus.FINISHED]: 'bg-green-500/20 text-green-400',
    [MatchStatus.CANCELLED]: 'bg-red-500/20 text-red-400',
  };

  const resultText = {
    [BetOutcome.NONE]: '-',
    [BetOutcome.TEAM_A_WINS]: `${matchData.homeTeam} Vence`,
    [BetOutcome.DRAW]: 'Empate',
    [BetOutcome.TEAM_B_WINS]: `${matchData.awayTeam} Vence`,
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">
            {matchData.homeTeam} vs {matchData.awayTeam}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>ID: {matchId.toString()}</span>
            <span>Início: {new Date(Number(matchData.startTime) * 1000).toLocaleString('pt-BR')}</span>
            <Badge className={statusBadgeColor[matchData.status]}>
              {matchData.status === MatchStatus.PENDING && 'Pendente'}
              {matchData.status === MatchStatus.FINISHED && 'Finalizado'}
              {matchData.status === MatchStatus.CANCELLED && 'Cancelado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Pool Information */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-background/50 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{matchData.homeTeam}</p>
          <p className="text-lg font-bold text-primary">{(Number(matchData.poolTeamA) / 1e6).toFixed(2)} USDC</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Empate</p>
          <p className="text-lg font-bold text-primary">{(Number(matchData.poolDraw) / 1e6).toFixed(2)} USDC</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{matchData.awayTeam}</p>
          <p className="text-lg font-bold text-primary">{(Number(matchData.poolTeamB) / 1e6).toFixed(2)} USDC</p>
        </div>
      </div>

      {/* Actions */}
      {matchData.status === MatchStatus.PENDING && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Definir Resultado</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedResult === BetOutcome.TEAM_A_WINS ? 'default' : 'outline'}
                onClick={() => setSelectedResult(BetOutcome.TEAM_A_WINS)}
                disabled={isPending}
              >
                {matchData.homeTeam} Vence
              </Button>
              <Button
                variant={selectedResult === BetOutcome.DRAW ? 'default' : 'outline'}
                onClick={() => setSelectedResult(BetOutcome.DRAW)}
                disabled={isPending}
              >
                Empate
              </Button>
              <Button
                variant={selectedResult === BetOutcome.TEAM_B_WINS ? 'default' : 'outline'}
                onClick={() => setSelectedResult(BetOutcome.TEAM_B_WINS)}
                disabled={isPending}
              >
                {matchData.awayTeam} Vence
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (selectedResult !== null) {
                  onSetResult(matchId, selectedResult);
                } else {
                  toast.error('Selecione um resultado');
                }
              }}
              disabled={isPending || selectedResult === null}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Resultado
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Partida
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Cancelar Partida?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os apostadores receberão reembolso. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Não</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(matchId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, Cancelar
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {matchData.status === MatchStatus.FINISHED && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm text-green-400">
            Resultado: <span className="font-bold">{resultText[matchData.result]}</span>
          </p>
        </div>
      )}

      {matchData.status === MatchStatus.CANCELLED && (
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-sm text-red-400">Esta partida foi cancelada</p>
        </div>
      )}
    </Card>
  );
}

/**
 * Componente: Fees Tab
 * Gerenciamento de taxas da casa
 */
function FeesTab() {
  const { housePendingBalance, isLoadingHouseBalance, refetchHouseBalance } = useAdminRead();
  const { withdrawHouseFees, isPending, isSuccess } = useAdminWrite();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Taxas sacadas com sucesso!');
      refetchHouseBalance();
    }
  }, [isSuccess, refetchHouseBalance]);

  const handleWithdraw = () => {
    if (!housePendingBalance || housePendingBalance === 0n) {
      toast.error('Nenhuma taxa disponível para saque');
      return;
    }
    withdrawHouseFees();
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Saldo de Taxas da Casa</h2>

      <div className="space-y-6">
        <div className="p-6 bg-background/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Saldo Pendente (USDC)</p>
          <p className="text-4xl font-bold text-primary mb-4">
            {isLoadingHouseBalance ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              `${(Number(housePendingBalance || 0n) / 1e6).toFixed(2)}`
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Valor total acumulado de taxas que podem ser sacadas
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              className="w-full"
              disabled={isPending || !housePendingBalance || housePendingBalance === 0n}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Sacar Taxas
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Confirmar Saque de Taxas</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a sacar {(Number(housePendingBalance || 0n) / 1e6).toFixed(2)} USDC. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdraw}>
                Confirmar Saque
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
