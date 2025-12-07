import { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePlaceBet, useApproveUSDC, useUSDCAllowance } from '@/hooks/useBettingContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatUnits } from 'viem';

interface BetFormProps {
  matchId: number;
  outcome: 1 | 2 | 3; // 1: Time A, 2: Empate, 3: Time B
  teamName: string;
  odds: number;
}

export default function BetForm({ matchId, outcome, teamName, odds }: BetFormProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('0');
  const amountWei = BigInt(parseUnits(amount, 6)); // USDC tem 6 decimais

  // Hooks de Contrato
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const { approve, isPending: isApproving, isSuccess: isApproved } = useApproveUSDC();
  const { placeBet, isPending: isBetting, isSuccess: isBetPlaced } = usePlaceBet();

  const allowanceWei = BigInt(formatUnits(BigInt(allowance), 6));
  const needsApproval = isConnected && amountWei > allowanceWei;
  const isLoading = isApproving || isBetting;

  // Handlers
  const handleApprove = () => {
    if (!isConnected) {
      toast("Erro", { description: "Por favor, conecte sua carteira.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast("Erro", { description: "Insira um valor de aposta válido.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
      return;
    }
    
    // Aprova um valor alto para evitar múltiplas aprovações
    approve("1000000000"); // Aprova 1 bilhão de USDC
    toast("Aprovação Solicitada", { description: "Confirme a transação na sua carteira para permitir o gasto de USDC.", icon: <Wallet className="h-4 w-4 text-primary" /> });
  };

  const handlePlaceBet = () => {
    if (!isConnected) {
      toast("Erro", { description: "Por favor, conecte sua carteira.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast("Erro", { description: "Insira um valor de aposta válido.", icon: <XCircle className="h-4 w-4 text-red-500" /> });
      return;
    }
    
    placeBet(matchId, outcome, amount);
    toast("Aposta Enviada", { description: "Confirme a transação na sua carteira.", icon: <Wallet className="h-4 w-4 text-primary" /> });
  };

  // Efeitos de feedback
  useEffect(() => {
    if (isApproved) {
      refetchAllowance();
      toast("Aprovação Concluída", { description: "Agora você pode fazer sua aposta.", icon: <CheckCircle className="h-4 w-4 text-green-500" /> });
    }
  }, [isApproved, refetchAllowance]);

  useEffect(() => {
    if (isBetPlaced) {
      setAmount('0');
      toast("Aposta Realizada!", { description: `Você apostou ${amount} USDC em ${teamName}.`, icon: <CheckCircle className="h-4 w-4 text-green-500" /> });
    }
  }, [isBetPlaced, amount, teamName]);

  const potentialReturn = (parseFloat(amount) * odds).toFixed(2);

  return (
    <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
      <h4 className="text-lg font-bold text-white">Apostar em {teamName}</h4>
      
      <div className="space-y-1">
        <Label htmlFor="bet-amount" className="text-sm text-muted-foreground">Valor da Aposta (USDC)</Label>
        <Input
          id="bet-amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="bg-background/50 border-primary/50 focus:border-primary"
        />
      </div>

      <div className="flex justify-between text-sm font-mono text-muted-foreground">
        <span>Odds:</span>
        <span className="text-primary font-bold">{odds.toFixed(2)}x</span>
      </div>
      <div className="flex justify-between text-sm font-mono text-muted-foreground">
        <span>Retorno Potencial:</span>
        <span className="text-green-400 font-bold">{potentialReturn} USDC</span>
      </div>

      {!isConnected ? (
        <Button className="w-full cyber-button" disabled>
          <Wallet className="mr-2 h-4 w-4" /> Conecte a Carteira
        </Button>
      ) : needsApproval ? (
        <Button 
          className="w-full cyber-button-outline" 
          onClick={handleApprove} 
          disabled={isLoading || parseFloat(amount) <= 0}
        >
          {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "1. Aprovar USDC"}
        </Button>
      ) : (
        <Button 
          className="w-full cyber-button" 
          onClick={handlePlaceBet} 
          disabled={isLoading || parseFloat(amount) <= 0}
        >
          {isBetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `2. Apostar ${amount} USDC`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
