import React, { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUSDC } from '@/hooks/useErc20';
import { useBettingContract } from '@/hooks/useBettingContract';
import { Match } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatUnits } from 'viem';

// Mapeamento de resultados para o contrato (exemplo)
const OUTCOME_MAP = {
  'home': 0,
  'draw': 1,
  'away': 2,
};

interface BetFormProps {
  match: Match;
  selectedOutcome: 'home' | 'draw' | 'away';
  selectedCategory: 'Primeiro Tempo' | 'Segundo Tempo' | 'Jogo Todo';
  onClose: () => void;
}

export default function BetForm({ match, selectedOutcome, selectedCategory, onClose }: BetFormProps) {
  const { isConnected } = useAccount();
  const { balance, allowance, isApprovePending, isApproveSuccess, approve, refetchAllowance } = useUSDC();
  const { placeBet, isLoading: isBetting, isSuccess: isBetSuccess } = useBettingContract();

  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedOdds = match.odds[selectedOutcome];
  const outcomeName = selectedOutcome === 'home' ? match.homeTeam : selectedOutcome === 'away' ? match.awayTeam : 'Empate';
  const contractOutcome = OUTCOME_MAP[selectedOutcome];

  const amountInBigInt = useMemo(() => {
    try {
      // O USDC tem 6 casas decimais, mas para o cálculo de comparação,
      // podemos usar o valor formatado em número para simplificar a UX.
      return parseFloat(betAmount) || 0;
    } catch {
      return 0;
    }
  }, [betAmount]);

  const isApproved = allowance >= parseUnits(betAmount || '0', 6);
  const isAmountValid = amountInBigInt > 0 && amountInBigInt <= balance;

  // Efeito para recarregar a allowance após uma aprovação bem-sucedida
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Efeito para fechar o formulário após a aposta bem-sucedida
  useEffect(() => {
    if (isBetSuccess) {
      // Poderia adicionar uma notificação de sucesso aqui
      setTimeout(onClose, 3000); // Fecha após 3 segundos
    }
  }, [isBetSuccess, onClose]);

  const handleApprove = () => {
    setError(null);
    if (!isConnected) {
      setError('Conecte sua carteira para aprovar o USDC.');
      return;
    }
    approve();
  };

  const handlePlaceBet = () => {
    setError(null);
    if (!isConnected) {
      setError('Conecte sua carteira para realizar a aposta.');
      return;
    }
    if (!isAmountValid) {
      setError('Valor de aposta inválido ou superior ao seu saldo de USDC.');
      return;
    }
    
    // O valor da aposta é passado como string e convertido para BigInt dentro do hook useBettingContract
    placeBet(match.id, contractOutcome, betAmount);
  };

  const renderAction = () => {
    if (!isConnected) {
      return (
        <Alert variant="default" className="bg-muted/20 border-primary/50">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Carteira Desconectada</AlertTitle>
          <AlertDescription>
            Por favor, conecte sua carteira para apostar.
          </AlertDescription>
        </Alert>
      );
    }

    if (isBetSuccess) {
      return (
        <Alert variant="default" className="bg-green-500/20 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Aposta Realizada com Sucesso!</AlertTitle>
          <AlertDescription>
            Sua transação foi enviada. Acompanhe o status na sua carteira.
          </AlertDescription>
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!isAmountValid) {
      return (
        <Button disabled className="w-full h-12">
          Insira um valor válido
        </Button>
      );
    }

    if (!isApproved) {
      return (
        <Button 
          onClick={handleApprove} 
          disabled={isApprovePending} 
          className="w-full h-12 bg-yellow-600 hover:bg-yellow-700"
        >
          {isApprovePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprovando USDC...</> : '1. Aprovar USDC (Primeira Vez)'}
        </Button>
      );
    }

    return (
      <Button 
        onClick={handlePlaceBet} 
        disabled={isBetting} 
        className="w-full h-12"
      >
        {isBetting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Realizando Aposta...</> : '2. Realizar Aposta'}
      </Button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-white">Confirmar Aposta</h3>

      <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Partida:</span>
          <span className="font-semibold text-white">{match.homeTeam} vs {match.awayTeam}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sua Escolha:</span>
          <Badge variant="secondary" className="text-base py-1 px-3 bg-primary/20 text-primary border-primary">
            {outcomeName}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Odds:</span>
          <span className="text-xl font-bold text-secondary font-mono">{selectedOdds.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Categoria:</span>
          <span className="text-sm text-white">{selectedCategory}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bet-amount" className="text-sm font-medium text-muted-foreground">
          Valor da Aposta (USDC)
        </label>
        <Input
          id="bet-amount"
          type="number"
          placeholder="0.00"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="h-12 text-lg font-mono bg-muted/30 border-primary/50 focus:border-primary"
          disabled={isBetting || isBetSuccess}
        />
        <p className="text-xs text-muted-foreground flex justify-between">
          <span>Saldo USDC: {balance.toFixed(2)}</span>
          <span 
            className="text-primary cursor-pointer hover:underline"
            onClick={() => setBetAmount(balance.toFixed(2))}
          >
            Apostar Máximo
          </span>
        </p>
      </div>

      {renderAction()}

      <div className="text-xs text-center text-muted-foreground pt-2">
        <p>Você está apostando {betAmount || '0.00'} USDC. Ganhos potenciais: {((amountInBigInt * selectedOdds) - amountInBigInt).toFixed(2)} USDC.</p>
        <p>Taxa da Casa (2% sobre o lucro): {((amountInBigInt * selectedOdds) - amountInBigInt) * 0.02} USDC.</p>
      </div>
    </div>
  );
}
