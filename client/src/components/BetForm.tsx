import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsdcContract } from "@/hooks/useUsdcContract";
import { useBettingContract } from "@/hooks/useBettingContract";
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';

// Endereço do Contrato de Apostas (Placeholder do useBettingContract)
const BETTING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

interface BetFormProps {
  matchId: number;
  outcome: 0 | 1 | 2; // 0 = Casa, 1 = Empate, 2 = Visitante
  teamName: string;
  odds: number;
  onBetSuccess: () => void;
}

export const BetForm: React.FC<BetFormProps> = ({ matchId, outcome, teamName, odds, onBetSuccess }) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approval' | 'bet'>('input');
  const { isConnected } = useAccount();

  // Hooks de Contrato
  const { approveUsdc, isApproving, isWaitingForApproval, isApproved, approvalHash } = useUsdcContract();
  const { placeBet, isLoading: isPlacingBet, isSuccess: isBetSuccess } = useBettingContract();

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('approval');
    // O valor a ser aprovado deve ser o valor da aposta
    approveUsdc(BETTING_CONTRACT_ADDRESS, amount);
  };

  const handlePlaceBet = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep('bet');
    placeBet(matchId, outcome, amount);
  };

  // Efeito para avançar para a aposta após a aprovação
  React.useEffect(() => {
    if (isApproved && step === 'approval') {
      // A aprovação foi confirmada na blockchain, agora podemos apostar
      handlePlaceBet();
    }
  }, [isApproved, step]);

  // Efeito para notificar sucesso e resetar o formulário
  React.useEffect(() => {
    if (isBetSuccess && step === 'bet') {
      onBetSuccess();
      setAmount('');
      setStep('input');
    }
  }, [isBetSuccess, step, onBetSuccess]);

  if (!isConnected) {
    return <p className="text-center text-red-400">Conecte sua carteira para apostar.</p>;
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card/50">
      <h3 className="text-lg font-bold mb-3">Apostar em: {teamName} ({odds.toFixed(2)})</h3>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">
          Valor da Aposta (USDC)
        </label>
        <Input
          id="amount"
          type="number"
          placeholder="Ex: 10.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={step !== 'input'}
          className="bg-background/50 border-primary/50 focus:border-primary"
        />
      </div>

      {step === 'input' && (
        <Button 
          onClick={handleApprove} 
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full cyber-button"
        >
          1. Aprovar USDC
        </Button>
      )}

      {step === 'approval' && (
        <Button 
          disabled 
          className="w-full cyber-button-outline"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isApproving ? 'Aguardando Confirmação...' : 'Aguardando Transação...'}
        </Button>
      )}

      {step === 'bet' && (
        <Button 
          disabled 
          className="w-full cyber-button"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isPlacingBet ? 'Aguardando Confirmação da Aposta...' : 'Aguardando Transação da Aposta...'}
        </Button>
      )}

      {isApproved && step === 'input' && (
        <Button 
          onClick={handlePlaceBet} 
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full cyber-button"
        >
          2. Realizar Aposta
        </Button>
      )}

      {/* Mensagens de Status */}
      {approvalHash && step === 'approval' && (
        <p className="mt-2 text-xs text-yellow-400">Transação de Aprovação enviada. Hash: {approvalHash.substring(0, 10)}...</p>
      )}
      {isApproved && step === 'input' && (
        <p className="mt-2 text-sm text-green-400">Aprovação concluída! Prossiga para a aposta.</p>
      )}
    </div>
  );
};
