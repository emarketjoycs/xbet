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
      <h2 className="text-2xl font-bold text-white">Configurações de Criação de Partidas</h2>
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

  const handleSearchMatch = () => {
    // Lógica para buscar a partida pelo ID
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
      {/* Lógica para exibir e gerenciar a partida encontrada */}
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
