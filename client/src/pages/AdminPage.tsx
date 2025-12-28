import { useState, useEffect } from 'react';
import React from 'react';
import { useLocation } from 'wouter';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Check, X, Wallet, TrendingUp, Clock, Play, XCircle } from 'lucide-react';
import { useIsOwner, useAdminRead, useAdminWrite, useMatchDetails } from '@/hooks/useAdminContract';
import { useAdminConfig, AdminConfig, ApiProvider } from '@/hooks/useAdminConfig';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { BetOutcome, MatchStatus } from '@shared/const';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [, navigate] = useLocation();
  const { isOwner, isLoadingOwner } = useIsOwner();
  
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

      <main className="flex-grow container py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="create">Criar Partida</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Partidas</TabsTrigger>
            <TabsTrigger value="fees">Taxas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateMatchTab />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <ManageMatchesTab />
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <FeesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

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

function CreateMatchTab() {
  const { config, setConfig, saveConfig } = useAdminConfig();
  
  // Importar o componente CreateMatchForm
  const CreateMatchForm = React.lazy(() => import('@/components/CreateMatchForm'));

  const handleApiProviderChange = (index: number, enabled: boolean) => {
    const newApiProviders = [...config.apiProviders];
    newApiProviders[index].enabled = enabled;
    handleConfigChange('apiProviders', newApiProviders);
  };

  const handleActiveApiCountChange = (value: string) => {
    handleConfigChange('activeApiCount', parseInt(value, 10));
  };

  const handleConfigChange = (key: keyof AdminConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTextareaChange = (key: 'priorityTeams' | 'priorityLeagues', value: string) => {
    setConfig(prev => ({ ...prev, [key]: value.split('\n').filter(line => line.trim() !== '') }));
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Criação Manual */}
      <React.Suspense fallback={<div>Carregando...</div>}>
        <CreateMatchForm />
      </React.Suspense>
      
      <h2 className="text-2xl font-bold text-white">Configurações de Criação Automática</h2>
      <Card className="p-6 bg-gray-800 border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-lg font-medium text-white">Criação Automática de Partidas</label>
          <Switch 
            checked={config.isAutoCreationEnabled}
            onCheckedChange={(checked) => handleConfigChange('isAutoCreationEnabled', checked)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Máximo de Partidas Simultâneas</label>
            <Input
              type="number"
              value={config.maxConcurrentMatches}
              onChange={(e) => handleConfigChange('maxConcurrentMatches', Number(e.target.value))}
              className="bg-gray-900 text-white border-gray-600 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Valor da Seed Virtual (USDC)</label>
            <Input
              type="number"
              value={config.virtualSeedAmount}
              onChange={(e) => handleConfigChange('virtualSeedAmount', Number(e.target.value))}
              className="bg-gray-900 text-white border-gray-600 focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Times Prioritários (um por linha)</label>
          <Textarea
            value={config.priorityTeams.join('\n')}
            onChange={(e) => handleTextareaChange('priorityTeams', e.target.value)}
            className="bg-gray-900 text-white border-gray-600 focus:border-primary"
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Campeonatos Prioritários (um por linha)</label>
          <Textarea
            value={config.priorityLeagues.join('\n')}
            onChange={(e) => handleTextareaChange('priorityLeagues', e.target.value)}
            className="bg-gray-900 text-white border-gray-600 focus:border-primary"
            rows={5}
          />
        </div>
        <Button 
          onClick={() => {
            saveConfig();
            toast.success('Configurações salvas com sucesso!');
          }}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          Salvar Configurações
        </Button>
      </Card>

      <h2 class="text-2xl font-bold text-white">Configurações de API de Esportes</h2>
      <Card class="p-6 bg-gray-800 border-gray-700 space-y-6">
        <div>
          <Label class="block text-lg font-medium text-white mb-2">Número de APIs para Consenso</Label>
          <p class="text-sm text-muted-foreground mb-4">
            Selecione quantas fontes de API devem concordar sobre o resultado de uma partida antes que os pagamentos sejam liberados.
          </p>
          <RadioGroup
            value={config.activeApiCount.toString()}
            onValueChange={handleActiveApiCountChange}
            class="flex space-x-4"
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="1" id="api-1" />
              <Label htmlFor="api-1">1 API</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="2" id="api-2" />
              <Label htmlFor="api-2">2 APIs</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="3" id="api-3" />
              <Label htmlFor="api-3">3 APIs</Label>
            </div>
          </RadioGroup>
        </div>

        <div class="space-y-4">
          <Label class="block text-lg font-medium text-white">Provedores de API</Label>
          {config.apiProviders.map((provider, index) => (
            <div key={provider.name} class="flex items-center justify-between p-3 bg-gray-900 rounded-md">
              <div>
                <p class="font-semibold text-white">{provider.name}</p>
                <p class="text-xs font-mono text-muted-foreground">Variável de Ambiente: <span class="text-primary">{provider.envVar}</span></p>
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={(checked) => handleApiProviderChange(index, checked)}
              />
            </div>
          ))}
        </div>
        <Button 
          onClick={() => {
            saveConfig();
            toast.success('Configurações de API salvas com sucesso!');
          }}
          class="w-full bg-primary hover:bg-primary/90 text-white"
        >
          Salvar Configurações de API
        </Button>
      </Card>
    </div>
  );
}

function ManageMatchesTab() {
  const { data: matchCounter, isLoading: isLoadingMatchCounter } = useAdminRead('matchCounter');
  const [matchId, setMatchId] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchMatch = async () => {
    if (!matchId || matchId.trim() === '') {
      toast.error('Digite um ID de partida válido');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSelectedMatch(null);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${BACKEND_URL}/api/markets/${matchId}`);
      
      if (!response.ok) {
        throw new Error('Partida não encontrada');
      }

      const data = await response.json();
      setSelectedMatch(data.data);
      toast.success('Partida encontrada!');
    } catch (error: any) {
      setSearchError(error.message || 'Erro ao buscar partida');
      toast.error(error.message || 'Erro ao buscar partida');
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivateMarket = async () => {
    if (!matchId || matchId.trim() === '') {
      toast.error('Nenhuma partida selecionada');
      return;
    }

    if (!selectedMatch) {
      toast.error('Dados da partida não carregados');
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Criar array de valores mínimos (0 para cada pool, sem validação)
      const minPoolAmounts = Array(selectedMatch.outcomesCount).fill(0);
      
      const response = await fetch(`${BACKEND_URL}/api/admin/activate-market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          marketId: Number(matchId), 
          minPoolAmounts 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao ativar mercado');
      }

      toast.success('Mercado ativado com sucesso!');
      // Recarregar dados da partida
      handleSearchMatch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao ativar mercado');
    }
  };

  const handleSettleMarket = async (winningOutcome: number) => {
    if (!matchId || matchId.trim() === '') {
      toast.error('Nenhuma partida selecionada');
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${BACKEND_URL}/api/admin/settle-market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId: Number(matchId), winningOutcome })
      });

      if (!response.ok) {
        throw new Error('Erro ao encerrar partida');
      }

      toast.success('Partida encerrada com sucesso!');
      // Recarregar dados da partida
      handleSearchMatch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao encerrar partida');
    }
  };

  const handleVoidMarket = async () => {
    if (!matchId || matchId.trim() === '') {
      toast.error('Nenhuma partida selecionada');
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${BACKEND_URL}/api/admin/void-market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId: Number(matchId) })
      });

      if (!response.ok) {
        throw new Error('Erro ao anular partida');
      }

      toast.success('Partida anulada com sucesso!');
      // Recarregar dados da partida
      handleSearchMatch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao anular partida');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gerenciar Partida por ID</h2>
      <div className="flex gap-2">
        <Input 
          type="text" 
          placeholder="ID da Partida"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="bg-gray-900 text-white border-gray-700 focus:border-primary"
        />
        <Button onClick={handleSearchMatch}>Buscar</Button>
      </div>
      
      {/* Exibir detalhes da partida */}
      {searchError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {selectedMatch && (
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Detalhes da Partida</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Market ID</p>
              <p className="text-lg font-semibold text-white">{matchId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge className="mt-1">
                {selectedMatch.state === 0 && 'CREATED'}
                {selectedMatch.state === 1 && 'FORMING'}
                {selectedMatch.state === 2 && 'ACTIVE'}
                {selectedMatch.state === 3 && 'SETTLED'}
                {selectedMatch.state === 4 && 'VOIDED'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário de Início</p>
              <p className="text-lg font-semibold text-white">
                {new Date(Number(selectedMatch.startTime) * 1000).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número de Resultados</p>
              <p className="text-lg font-semibold text-white">{selectedMatch.outcomesCount}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Pools</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {selectedMatch.pools && selectedMatch.pools.map((pool: bigint, index: number) => (
                  <div key={index} className="p-3 bg-gray-900 rounded">
                    <p className="text-xs text-muted-foreground">
                      {index === 0 ? 'Casa' : index === 1 ? 'Empate' : 'Fora'}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {(Number(pool) / 1e6).toFixed(2)} USDC
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações de Gerenciamento */}
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h4 className="text-lg font-bold text-white mb-4">Ações</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ativar Mercado */}
              {selectedMatch.state === 1 && (
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h5 className="text-md font-semibold text-white mb-3">Ativar Mercado</h5>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ative o mercado para permitir apostas reais (Fase 2).
                  </p>
                  <Button
                    onClick={handleActivateMarket}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ativar Mercado
                  </Button>
                </Card>
              )}

              {/* Encerrar Partida */}
              {selectedMatch.state === 2 && (
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h5 className="font-semibold text-white mb-2">Encerrar Partida</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Defina o resultado final da partida
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleSettleMarket(0)} 
                      className="w-full"
                      variant="outline"
                    >
                      Casa Venceu
                    </Button>
                    {selectedMatch.outcomesCount === 3 && (
                      <Button 
                        onClick={() => handleSettleMarket(1)} 
                        className="w-full"
                        variant="outline"
                      >
                        Empate
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleSettleMarket(selectedMatch.outcomesCount === 3 ? 2 : 1)} 
                      className="w-full"
                      variant="outline"
                    >
                      Fora Venceu
                    </Button>
                  </div>
                </Card>
              )}

              {/* Anular Partida */}
              {selectedMatch.state !== 3 && selectedMatch.state !== 4 && (
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h5 className="font-semibold text-white mb-2">Anular Partida</h5>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cancela a partida e devolve as apostas
                  </p>
                  <Button 
                    onClick={handleVoidMarket} 
                    className="w-full"
                    variant="destructive"
                  >
                    Anular Partida
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function FeesTab() {
  const { housePendingBalance, isLoadingHouseBalance } = useAdminRead();
  const { withdrawFees, isPending, isSuccess, isError, error } = useAdminWrite();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Taxas sacadas com sucesso!');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(`Erro: ${error?.message || 'Falha ao sacar taxas'}`);
    }
  }, [isError, error]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gerenciamento de Taxas</h2>
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-white">Saldo de Taxas Acumuladas</p>
            <p className="text-3xl font-bold text-primary">
              {isLoadingHouseBalance ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `${(Number(housePendingBalance || 0n) / 1e6).toFixed(2)} USDC`
              )}
            </p>
          </div>
          <Button onClick={() => withdrawFees()} disabled={isPending || !housePendingBalance || housePendingBalance === 0n}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sacar Taxas
          </Button>
        </div>
      </Card>
    </div>
  );
}
