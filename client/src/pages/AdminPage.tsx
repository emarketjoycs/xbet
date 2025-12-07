import { useAccount } from 'wagmi';
import { useAdminContract } from '@/hooks/useAdminContract';
import { useBettingContract } from '@/hooks/useBettingContract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Esquema de validação para criar partida
const createMatchSchema = z.object({
  homeTeam: z.string().min(1, "Nome do time da casa é obrigatório"),
  awayTeam: z.string().min(1, "Nome do time visitante é obrigatório"),
  startTime: z.string().min(1, "Data e hora de início são obrigatórios"),
});

// Esquema de validação para finalizar partida
const setResultSchema = z.object({
  matchId: z.string().min(1, "ID da partida é obrigatório"),
  result: z.enum(["1", "2", "3"], {
    required_error: "O resultado da partida é obrigatório",
  }),
});

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { createMatch, setMatchResult, cancelMatch, withdrawHouseFees, isLoading, isSuccess } = useAdminContract();
  const { match: matchData, refetch: refetchMatch } = useBettingContract().useMatchData(1); // Exemplo de leitura

  // Simulação de verificação de Owner (Substituir pela lógica real se necessário)
  const IS_OWNER = address === "0xSEU_ENDERECO_DE_OWNER_AQUI"; 

  const [matchIdToFinalize, setMatchIdToFinalize] = useState<number | null>(null);

  // Formulário de Criação
  const { register: registerCreate, handleSubmit: handleSubmitCreate, formState: { errors: errorsCreate } } = useForm<z.infer<typeof createMatchSchema>>({
    resolver: zodResolver(createMatchSchema),
  });

  // Formulário de Finalização
  const { register: registerSetResult, handleSubmit: handleSubmitSetResult, formState: { errors: errorsSetResult } } = useForm<z.infer<typeof setResultSchema>>({
    resolver: zodResolver(setResultSchema),
  });

  // Efeito para mostrar toasts de sucesso/erro
  useEffect(() => {
    if (isSuccess) {
      toast("Transação Enviada!", {
        description: "A transação foi enviada para a rede. Aguardando confirmação...",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    }
  }, [isSuccess]);

  // Handlers
  const handleCreateMatch = (data: z.infer<typeof createMatchSchema>) => {
    try {
      const startTime = new Date(data.startTime);
      if (isNaN(startTime.getTime())) {
        toast("Erro", { description: "Data e hora inválidas.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
        return;
      }
      createMatch(data.homeTeam, data.awayTeam, startTime);
    } catch (error) {
      toast("Erro ao Criar Partida", { description: "Verifique se a carteira está conectada e se você é o Owner.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
    }
  };

  const handleSetResult = (data: z.infer<typeof setResultSchema>) => {
    try {
      const matchId = parseInt(data.matchId);
      const result = parseInt(data.result) as 1 | 2 | 3;
      setMatchResult(matchId, result);
    } catch (error) {
      toast("Erro ao Finalizar Partida", { description: "Verifique os dados e se a carteira está conectada.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
    }
  };

  const handleCancelMatch = (matchId: number) => {
    try {
      cancelMatch(matchId);
    } catch (error) {
      toast("Erro ao Cancelar Partida", { description: "Verifique os dados e se a carteira está conectada.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
    }
  };

  const handleWithdrawFees = () => {
    try {
      withdrawHouseFees();
    } catch (error) {
      toast("Erro ao Sacar Taxas", { description: "Verifique se a carteira está conectada e se você é o Owner.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
    }
  };

  if (!isConnected || !IS_OWNER) {
    return (
      <div className="container py-20 text-center">
        <ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground">Esta página é restrita ao Owner do contrato.</p>
        {!isConnected && <p className="text-sm text-primary mt-2">Por favor, conecte sua carteira.</p>}
        {isConnected && !IS_OWNER && <p className="text-sm text-primary mt-2">Sua carteira não é a carteira de Owner.</p>}
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-primary mb-8">Painel Administrativo (Owner)</h1>
      <p className="text-muted-foreground mb-8">Gerencie partidas, resultados e fundos do protocolo.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Criar Partida */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-xl">Criar Nova Partida</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCreate(handleCreateMatch)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeam">Time da Casa</Label>
                <Input id="homeTeam" {...registerCreate("homeTeam")} />
                {errorsCreate.homeTeam && <p className="text-red-500 text-sm">{errorsCreate.homeTeam.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayTeam">Time Visitante</Label>
                <Input id="awayTeam" {...registerCreate("awayTeam")} />
                {errorsCreate.awayTeam && <p className="text-red-500 text-sm">{errorsCreate.awayTeam.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Data e Hora de Início</Label>
                <Input id="startTime" type="datetime-local" {...registerCreate("startTime")} />
                {errorsCreate.startTime && <p className="text-red-500 text-sm">{errorsCreate.startTime.message}</p>}
              </div>
              <Button type="submit" className="w-full cyber-button" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Partida"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Coluna 2: Finalizar Partida */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-xl">Definir Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitSetResult(handleSetResult)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matchId">ID da Partida</Label>
                <Input id="matchId" type="number" {...registerSetResult("matchId")} />
                {errorsSetResult.matchId && <p className="text-red-500 text-sm">{errorsSetResult.matchId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="result">Resultado</Label>
                <Select onValueChange={(value) => handleSubmitSetResult(data => handleSetResult({ ...data, result: value as "1" | "2" | "3" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Time da Casa Ganha</SelectItem>
                    <SelectItem value="2">Empate</SelectItem>
                    <SelectItem value="3">Time Visitante Ganha</SelectItem>
                  </SelectContent>
                </Select>
                {errorsSetResult.result && <p className="text-red-500 text-sm">{errorsSetResult.result.message}</p>}
              </div>
              <Button type="submit" className="w-full cyber-button" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Finalizar Partida"}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-border space-y-4">
                <h3 className="text-lg font-semibold">Ações Adicionais</h3>
                <div className="space-y-2">
                    <Label htmlFor="cancelMatchId">ID da Partida para Cancelar</Label>
                    <Input 
                        id="cancelMatchId" 
                        type="number" 
                        placeholder="ID da Partida"
                        onChange={(e) => setMatchIdToFinalize(parseInt(e.target.value))}
                    />
                    <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => matchIdToFinalize && handleCancelMatch(matchIdToFinalize)}
                        disabled={isLoading || !matchIdToFinalize}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cancelar Partida (Reembolso)"}
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 3: Gerenciamento de Fundos */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-xl">Gerenciamento de Fundos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo de Taxas da Casa</Label>
              <p className="text-2xl font-bold text-green-400">
                {/* TODO: Implementar hook para ler housePendingBalance */}
                XX.XX USDC
              </p>
              <Button 
                className="w-full cyber-button-outline" 
                onClick={handleWithdrawFees}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sacar Taxas Acumuladas"}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border space-y-2">
                <h3 className="text-lg font-semibold">Configurações (Avançado)</h3>
                <Button variant="outline" className="w-full" disabled>
                    Ajustar Tiers de Afiliados
                </Button>
                <Button variant="outline" className="w-full" disabled>
                    Pausar Contrato
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
