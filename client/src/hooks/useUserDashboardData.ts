import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Simulação de dados do usuário
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

/**
 * Hook para simular a leitura de dados do usuário (saldo, apostas, estatísticas)
 * Em um ambiente real, este hook usaria useReadContract para buscar os dados do contrato.
 */
export function useUserDashboardData() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [bets, setBets] = useState<UserBet[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dados mockados para simulação
  const mockBalance: UserBalance = {
    total: 1250.50,
    available: 750.50,
    locked: 500.00,
    currency: 'USDC'
  };

  const mockBets: UserBet[] = [
    {
      id: 1,
      match: 'Santos vs Corinthians',
      league: 'Brasileirão',
      betType: 'Santos Ganha',
      amount: 100,
      odds: 2.45,
      potentialWin: 245,
      status: 'pending',
      createdAt: '2025-12-04 15:30'
    },
    {
      id: 2,
      match: 'Flamengo vs Vasco',
      league: 'Brasileirão',
      betType: 'Empate',
      amount: 250,
      odds: 3.10,
      potentialWin: 775,
      status: 'pending',
      createdAt: '2025-12-04 14:15'
    },
    {
      id: 3,
      match: 'Palmeiras vs Cruzeiro',
      league: 'Brasileirão',
      betType: 'Palmeiras Ganha',
      amount: 500,
      odds: 1.85,
      potentialWin: 925,
      status: 'won',
      createdAt: '2025-12-03 18:45',
      finishedAt: '2025-12-04 22:00'
    },
    {
      id: 4,
      match: 'Grêmio vs Inter',
      league: 'Gauchão',
      betType: 'Inter Ganha',
      amount: 50,
      odds: 4.00,
      potentialWin: 200,
      status: 'lost',
      createdAt: '2025-12-02 10:00',
      finishedAt: '2025-12-03 00:00'
    }
  ];

  const calculateStats = (userBets: UserBet[]): UserStats => {
    const totalBets = userBets.length;
    const totalWins = userBets.filter(bet => bet.status === 'won').length;
    const activeBets = userBets.filter(bet => bet.status === 'pending').length;
    
    // Simulação de lucro líquido (ganhos - perdas)
    const totalWinnings = userBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.potentialWin - bet.amount, 0); // Lucro = Ganho Potencial - Aposta
    
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

  useEffect(() => {
    if (address) {
      // Simulação de leitura do contrato
      setIsLoading(true);
      
      // Simulação de delay
      setTimeout(() => {
        setBalance(mockBalance);
        setBets(mockBets);
        setStats(calculateStats(mockBets));
        setIsLoading(false);
      }, 1000);
    } else {
      setBalance(null);
      setBets([]);
      setStats(null);
      setIsLoading(false);
    }
  }, [address]);

  // Simulação de função de escrita (claimWinnings)
  const claimWinnings = async (betId: number) => {
    // Em um ambiente real, aqui seria a chamada useWriteContract
    toast.info(`Simulando saque da aposta #${betId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Saque da aposta #${betId} simulado com sucesso!`);
    // Em um ambiente real, você faria um refetch dos dados aqui
  };

  return {
    balance,
    bets,
    stats,
    isLoading,
    claimWinnings,
    // Funções para Depósito e Aposta Real seriam adicionadas aqui
  };
}
