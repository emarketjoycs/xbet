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
import { useAdminConfig, AdminConfig } from '@/hooks/useAdminConfig';
import { Textarea } from '@/components/ui/textarea';
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
