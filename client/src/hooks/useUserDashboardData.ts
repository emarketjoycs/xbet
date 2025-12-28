import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useErc20 } from './useErc20';

// Interfaces
interface UserBalance {
  total: number;
  available: number;
  locked: number;
  currency: string;
}

export interface UserBet {
  id: number;
  match: string;
  league: string;
  betType: string;
  amount: number;
  odds: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
  finishedAt?: string;
}

interface UserStats {
  winRate: number;
  totalWins: number;
  totalBets: number;
  netProfit: number;
  activeBets: number;
}

// Endereço do contrato
const BETTING_CONTRACT_ADDRESS = (import.meta.env.VITE_BETTING_CONTRACT_ADDRESS || "0x2405e4c50865b8Dc2EC15D5afc28736397E999bc") as `0x${string}`;

// ABI mínimo necessário
const BETTING_ABI = [
  "function userBets(address user, uint256 index) external view returns (uint256)",
  "function bets(uint256 betId) external view returns (address user, uint256 marketId, uint256 amount, uint256 odds, uint8 outcome, bool isPhaseOne, bool claimed, uint256 timestamp)",
  "function markets(uint256 marketId) external view returns (uint8 state, uint256 startTime, uint256 activationDeadline, uint256 totalPools, uint8 outcomesCount, uint256 createdAt, string memory homeTeam, string memory awayTeam, string memory league, uint8 winningOutcome, bool resultSet)",
  "function depositPhaseOne(uint256 marketId, uint8 outcome, uint256 amount) external",
  "function withdrawPhaseOne(uint256 marketId, uint8 outcome, uint256 amount) external",
  "function claim(uint256 betId) external",
  "function calculatePayout(uint256 betId) external view returns (uint256)"
] as const;

/**
 * Hook para ler dados reais do usuário do Smart Contract
 */
export function useUserDashboardData() {
  const { address } = useAccount();
  const { balance: usdcBalance, allowance, approve } = useErc20(BETTING_CONTRACT_ADDRESS);
  
  const [balance, setBalance] = useState<UserBalance>({
    total: 0,
    available: 0,
    locked: 0,
    currency: 'USDC'
  });
  const [bets, setBets] = useState<UserBet[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBets: 0,
    totalWins: 0,
    activeBets: 0,
    winRate: 0,
    netProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Buscar apostas do usuário do backend
  useEffect(() => {
    if (address) {
      fetchUserData();
    } else {
      setBalance({ total: 0, available: 0, locked: 0, currency: 'USDC' });
      setBets([]);
      setStats({ totalBets: 0, totalWins: 0, activeBets: 0, winRate: 0, netProfit: 0 });
      setIsLoading(false);
    }
  }, [address, usdcBalance]);

  const fetchUserData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Buscar apostas do usuário
      const response = await fetch(`${BACKEND_URL}/api/user/${address}/bets`);
      
      if (response.ok) {
        const data = await response.json();
        const userBets: UserBet[] = data.bets || [];
        
        // Calcular saldo
        const lockedAmount = userBets
          .filter(bet => bet.status === 'pending')
          .reduce((sum, bet) => sum + bet.amount, 0);
        
        setBalance({
          total: usdcBalance + lockedAmount,
          available: usdcBalance,
          locked: lockedAmount,
          currency: 'USDC'
        });
        
        setBets(userBets);
        setStats(calculateStats(userBets));
      } else {
        // Se não houver apostas, apenas mostrar saldo USDC
        setBalance({
          total: usdcBalance,
          available: usdcBalance,
          locked: 0,
          currency: 'USDC'
        });
        setBets([]);
        setStats({ totalBets: 0, totalWins: 0, activeBets: 0, winRate: 0, netProfit: 0 });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Em caso de erro, mostrar apenas saldo USDC
      setBalance({
        total: usdcBalance,
        available: usdcBalance,
        locked: 0,
        currency: 'USDC'
      });
      setBets([]);
      setStats({ totalBets: 0, totalWins: 0, activeBets: 0, winRate: 0, netProfit: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = (userBets: UserBet[]): UserStats => {
    const totalBets = userBets.length;
    const totalWins = userBets.filter(bet => bet.status === 'won').length;
    const activeBets = userBets.filter(bet => bet.status === 'pending').length;
    
    const totalWinnings = userBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.potentialWin - bet.amount, 0);
    
    const totalLosses = userBets
      .filter(bet => bet.status === 'lost')
      .reduce((sum, bet) => sum + bet.amount, 0);
      
    const netProfit = totalWinnings - totalLosses;

    return {
      totalBets,
      totalWins,
      activeBets,
      winRate: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
      netProfit: netProfit,
    };
  };

  // Hooks de escrita
  const { writeContract: writeDeposit, data: depositHash } = useWriteContract();
  const { writeContract: writeWithdraw, data: withdrawHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();

  const { isLoading: isDepositPending } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawPending } = useWaitForTransactionReceipt({ hash: withdrawHash });
  const { isLoading: isClaimPending } = useWaitForTransactionReceipt({ hash: claimHash });

  // Função de depósito (Fase 1)
  const depositFunds = async (marketId: number, outcome: number, amount: number) => {
    if (!address) {
      toast.error('Conecte sua carteira');
      return;
    }

    try {
      // Converter para unidades do USDC (6 decimais)
      const amountInWei = BigInt(Math.floor(amount * 1e6));

      // Verificar allowance
      if (allowance < amount) {
        toast.info('Aprovando USDC...');
        await approve(amount);
        toast.success('USDC aprovado!');
      }

      // Fazer depósito
      toast.info(`Depositando ${amount} USDC...`);
      writeDeposit({
        address: BETTING_CONTRACT_ADDRESS,
        abi: BETTING_ABI,
        functionName: 'depositPhaseOne',
        args: [BigInt(marketId), outcome, amountInWei]
      });

      // Aguardar confirmação
      if (isDepositPending) {
        toast.success(`Depósito de ${amount} USDC realizado com sucesso!`);
        fetchUserData(); // Atualizar dados
      }
    } catch (error: any) {
      console.error('Erro ao depositar:', error);
      toast.error(error.message || 'Erro ao depositar fundos');
    }
  };

  // Função de saque (Fase 1)
  const withdrawFunds = async (marketId: number, outcome: number, amount: number) => {
    if (!address) {
      toast.error('Conecte sua carteira');
      return;
    }

    try {
      // Converter para unidades do USDC (6 decimais)
      const amountInWei = BigInt(Math.floor(amount * 1e6));

      toast.info(`Sacando ${amount} USDC...`);
      writeWithdraw({
        address: BETTING_CONTRACT_ADDRESS,
        abi: BETTING_ABI,
        functionName: 'withdrawPhaseOne',
        args: [BigInt(marketId), outcome, amountInWei]
      });

      // Aguardar confirmação
      if (isWithdrawPending) {
        toast.success(`Saque de ${amount} USDC realizado com sucesso!`);
        fetchUserData(); // Atualizar dados
      }
    } catch (error: any) {
      console.error('Erro ao sacar:', error);
      toast.error(error.message || 'Erro ao sacar fundos');
    }
  };

  // Função de reivindicar prêmios
  const claimWinnings = async (betId: number) => {
    if (!address) {
      toast.error('Conecte sua carteira');
      return;
    }

    try {
      toast.info(`Reivindicando prêmio da aposta #${betId}...`);
      writeClaim({
        address: BETTING_CONTRACT_ADDRESS,
        abi: BETTING_ABI,
        functionName: 'claim',
        args: [BigInt(betId)]
      });

      // Aguardar confirmação
      if (isClaimPending) {
        toast.success(`Prêmio da aposta #${betId} reivindicado com sucesso!`);
        fetchUserData(); // Atualizar dados
      }
    } catch (error: any) {
      console.error('Erro ao reivindicar:', error);
      toast.error(error.message || 'Erro ao reivindicar prêmio');
    }
  };

  return {
    balance,
    bets,
    stats,
    isLoading,
    claimWinnings,
    depositFunds,
    withdrawFunds,
  };
}
