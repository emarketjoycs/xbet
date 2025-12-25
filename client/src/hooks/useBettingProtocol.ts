import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// ABI do contrato BettingProtocol
const BETTING_PROTOCOL_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "depositPhaseOne",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" }
    ],
    "name": "withdrawPhaseOne",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "maxSlippageOdds", "type": "uint256" }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "betId", "type": "uint256" }
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256[]", "name": "betIds", "type": "uint256[]" }
    ],
    "name": "claimMultiple",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" }
    ],
    "name": "getMarket",
    "outputs": [
      { "internalType": "uint8", "name": "state", "type": "uint8" },
      { "internalType": "uint256", "name": "startTime", "type": "uint256" },
      { "internalType": "uint256", "name": "activationDeadline", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPools", "type": "uint256" },
      { "internalType": "uint8", "name": "outcomesCount", "type": "uint8" },
      { "internalType": "string", "name": "homeTeam", "type": "string" },
      { "internalType": "string", "name": "awayTeam", "type": "string" },
      { "internalType": "string", "name": "league", "type": "string" },
      { "internalType": "uint8", "name": "winningOutcome", "type": "uint8" },
      { "internalType": "bool", "name": "resultSet", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" }
    ],
    "name": "getPool",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserBets",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "isPhaseOne", "type": "bool" }
    ],
    "name": "calculatePayout",
    "outputs": [
      { "internalType": "uint256", "name": "estimatedPayout", "type": "uint256" },
      { "internalType": "uint256", "name": "estimatedOdds", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketCounter",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "bets",
    "outputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "odds", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "bool", "name": "isPhaseOne", "type": "bool" },
      { "internalType": "bool", "name": "claimed", "type": "bool" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Endereço do contrato (será preenchido após deploy)
const CONTRACT_ADDRESS = (import.meta.env.VITE_BETTING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

/**
 * Hook para interagir com o contrato BettingProtocol
 */
export function useBettingProtocol() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI
  };
}

/**
 * Hook para buscar informações de um mercado
 */
export function useMarket(marketId: number | undefined) {
  const { data, isLoading, isError, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'getMarket',
    args: marketId !== undefined ? [BigInt(marketId)] : undefined,
    enabled: marketId !== undefined && marketId > 0
  });

  if (!data) {
    return {
      market: null,
      isLoading,
      isError,
      refetch
    };
  }

  const [state, startTime, activationDeadline, totalPools, outcomesCount, homeTeam, awayTeam, league, winningOutcome, resultSet] = data;

  return {
    market: {
      state: Number(state), // 0=CREATED, 1=FORMING, 2=ACTIVE, 3=SETTLED, 4=VOIDED
      startTime: Number(startTime),
      activationDeadline: Number(activationDeadline),
      totalPools: formatUnits(totalPools, 6), // USDC tem 6 decimais
      outcomesCount: Number(outcomesCount),
      homeTeam,
      awayTeam,
      league,
      winningOutcome: Number(winningOutcome),
      resultSet
    },
    isLoading,
    isError,
    refetch
  };
}

/**
 * Hook para buscar pool de um resultado específico
 */
export function usePool(marketId: number | undefined, outcome: number | undefined) {
  const { data, isLoading, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'getPool',
    args: marketId !== undefined && outcome !== undefined ? [BigInt(marketId), outcome] : undefined,
    enabled: marketId !== undefined && outcome !== undefined
  });

  return {
    poolAmount: data ? formatUnits(data, 6) : '0',
    isLoading,
    refetch
  };
}

/**
 * Hook para buscar apostas de um usuário
 */
export function useUserBets(userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'getUserBets',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress
  });

  return {
    betIds: data ? data.map(id => Number(id)) : [],
    isLoading,
    refetch
  };
}

/**
 * Hook para calcular payout estimado
 */
export function useCalculatePayout(
  marketId: number | undefined,
  outcome: number | undefined,
  amount: string | undefined,
  isPhaseOne: boolean
) {
  const { data, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'calculatePayout',
    args: marketId !== undefined && outcome !== undefined && amount
      ? [BigInt(marketId), outcome, parseUnits(amount, 6), isPhaseOne]
      : undefined,
    enabled: marketId !== undefined && outcome !== undefined && !!amount
  });

  if (!data) {
    return {
      estimatedPayout: '0',
      estimatedOdds: '0',
      isLoading
    };
  }

  const [payout, odds] = data;

  return {
    estimatedPayout: formatUnits(payout, 6),
    estimatedOdds: (Number(odds) / 100).toFixed(2), // Converter de 173 para 1.73
    isLoading
  };
}

/**
 * Hook para depositar na Fase 1
 */
export function useDepositPhaseOne() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'depositPhaseOne'
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  const deposit = (marketId: number, outcome: number, amount: string) => {
    if (!write) return;
    write({
      args: [BigInt(marketId), outcome, parseUnits(amount, 6)]
    });
  };

  return {
    deposit,
    isLoading: isLoading || isWaiting,
    isSuccess,
    txHash: data?.hash
  };
}

/**
 * Hook para retirar da Fase 1
 */
export function useWithdrawPhaseOne() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'withdrawPhaseOne'
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  const withdraw = (marketId: number) => {
    if (!write) return;
    write({
      args: [BigInt(marketId)]
    });
  };

  return {
    withdraw,
    isLoading: isLoading || isWaiting,
    isSuccess,
    txHash: data?.hash
  };
}

/**
 * Hook para realizar aposta na Fase 2
 */
export function usePlaceBet() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'placeBet'
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  const placeBet = (marketId: number, outcome: number, amount: string, maxSlippageOdds: number) => {
    if (!write) return;
    write({
      args: [BigInt(marketId), outcome, parseUnits(amount, 6), BigInt(maxSlippageOdds)]
    });
  };

  return {
    placeBet,
    isLoading: isLoading || isWaiting,
    isSuccess,
    txHash: data?.hash
  };
}

/**
 * Hook para reivindicar prêmio
 */
export function useClaim() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'claim'
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  const claim = (betId: number) => {
    if (!write) return;
    write({
      args: [BigInt(betId)]
    });
  };

  return {
    claim,
    isLoading: isLoading || isWaiting,
    isSuccess,
    txHash: data?.hash
  };
}

/**
 * Hook para reivindicar múltiplos prêmios
 */
export function useClaimMultiple() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'claimMultiple'
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash
  });

  const claimMultiple = (betIds: number[]) => {
    if (!write) return;
    write({
      args: [betIds.map(id => BigInt(id))]
    });
  };

  return {
    claimMultiple,
    isLoading: isLoading || isWaiting,
    isSuccess,
    txHash: data?.hash
  };
}

/**
 * Hook para buscar informações de uma aposta
 */
export function useBet(betId: number | undefined) {
  const { data, isLoading, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'bets',
    args: betId !== undefined ? [BigInt(betId)] : undefined,
    enabled: betId !== undefined && betId > 0
  });

  if (!data) {
    return {
      bet: null,
      isLoading,
      refetch
    };
  }

  const [user, marketId, amount, odds, outcome, isPhaseOne, claimed, timestamp] = data;

  return {
    bet: {
      user,
      marketId: Number(marketId),
      amount: formatUnits(amount, 6),
      odds: (Number(odds) / 100).toFixed(2),
      outcome: Number(outcome),
      isPhaseOne,
      claimed,
      timestamp: Number(timestamp)
    },
    isLoading,
    refetch
  };
}

/**
 * Hook para buscar contador de mercados
 */
export function useMarketCounter() {
  const { data, isLoading, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: BETTING_PROTOCOL_ABI,
    functionName: 'marketCounter'
  });

  return {
    marketCounter: data ? Number(data) : 0,
    isLoading,
    refetch
  };
}
