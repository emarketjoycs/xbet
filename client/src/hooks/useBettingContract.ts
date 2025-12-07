import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { arbitrum } from 'wagmi/chains';
import { useAccount } from 'wagmi';

/**
 * ENDEREÇO DO CONTRATO (Placeholder)
 * Substituir pelo endereço real após o deploy na Arbitrum One
 */
const BETTING_CONTRACT_ADDRESS = "0xSEU_ENDERECO_AQUI"; // ATUALIZAR APÓS DEPLOY
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

/**
 * ABI DO CONTRATO (Exemplo Parcial)
 * ESTA ABI DEVE SER ATUALIZADA COM A ABI FINAL GERADA PELO COMPILADOR
 * (Incluindo todas as novas funções: setReferrer, withdrawAffiliateFees, getAffiliateTier, etc.)
 */
const BETTING_ABI = [
  // Funções de Escrita
  {
    inputs: [
      { name: "_matchId", type: "uint256" },
      { name: "_outcome", type: "uint8" },
      { name: "_amount", type: "uint256" }
    ],
    name: "placeBet",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_betId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_referrer", type: "address" }],
    name: "setReferrer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawAffiliateFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Funções de Leitura
  {
    inputs: [{ name: "_matchId", type: "uint256" }],
    name: "getOdds",
    outputs: [
      { name: "oddsTeamA", type: "uint256" },
      { name: "oddsDraw", type: "uint256" },
      { name: "oddsTeamB", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_matchId", type: "uint256" }],
    name: "getMatch",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "homeTeam", type: "string" },
          { name: "awayTeam", type: "string" },
          { name: "startTime", type: "uint256" },
          { name: "totalPoolAmount", type: "uint256" },
          { name: "poolTeamA", type: "uint256" },
          { name: "poolDraw", type: "uint256" },
          { name: "poolTeamB", type: "uint256" },
          { name: "result", type: "uint8" },
          { name: "status", type: "uint8" },
          { name: "exists", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserBalance",
    outputs: [
      {
        components: [
          { name: "available", type: "uint256" },
          { name: "locked", type: "uint256" },
          { name: "won", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserBets",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "player", type: "address" },
          { name: "matchId", type: "uint256" },
          { name: "outcome", type: "uint8" },
          { name: "amount", type: "uint256" },
          { name: "claimed", type: "bool" },
          { name: "refunded", type: "bool" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_affiliate", type: "address" }],
    name: "getAffiliateTier",
    outputs: [
      { name: "tier", type: "uint256" },
      { name: "percentage", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_affiliate", type: "address" }],
    name: "getAffiliatePendingBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_affiliate", type: "address" }],
    name: "getReferredFeesVolume",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "referrer",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// ====================================================================
// HOOKS DE ESCRITA (Transações)
// ====================================================================

/**
 * Hook para aprovar USDC para o contrato de apostas
 */
export function useApproveUSDC() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const approve = (amount: string) => {
    const amountInWei = parseUnits(amount, 6); // USDC tem 6 decimais
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [BETTING_CONTRACT_ADDRESS as `0x${string}`, amountInWei],
      chainId: arbitrum.id
    });
  };

  return { approve, isPending, isConfirming, isSuccess };
}

/**
 * Hook para realizar uma aposta
 */
export function usePlaceBet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const placeBet = (matchId: number, outcome: number, amount: string) => {
    const amountInWei = parseUnits(amount, 6);
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'placeBet',
      args: [BigInt(matchId), outcome, amountInWei],
      chainId: arbitrum.id
    });
  };

  return { placeBet, isPending, isConfirming, isSuccess };
}

/**
 * Hook para sacar ganhos de uma aposta
 */
export function useClaimWinnings() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const claim = (betId: number) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'claimWinnings',
      args: [BigInt(betId)],
      chainId: arbitrum.id
    });
  };

  return { claim, isPending, isConfirming, isSuccess };
}

/**
 * Hook para sacar saldo pendente (reembolsos e ganhos)
 */
export function useWithdraw() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const withdraw = () => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'withdraw',
      chainId: arbitrum.id
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess };
}

/**
 * Hook para definir o referenciador
 */
export function useSetReferrer() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const setReferrer = (referrerAddress: `0x${string}`) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'setReferrer',
      args: [referrerAddress],
      chainId: arbitrum.id
    });
  };

  return { setReferrer, isPending, isConfirming, isSuccess };
}

/**
 * Hook para sacar taxas de afiliado
 */
export function useWithdrawAffiliateFees() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  const withdrawFees = () => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'withdrawAffiliateFees',
      chainId: arbitrum.id
    });
  };

  return { withdrawFees, isPending, isConfirming, isSuccess };
}

// ====================================================================
// HOOKS DE LEITURA (View Functions)
// ====================================================================

/**
 * Hook para verificar allowance de USDC
 */
export function useUSDCAllowance(userAddress?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, BETTING_CONTRACT_ADDRESS as `0x${string}`] : undefined,
    chainId: arbitrum.id
  });

  return { 
    allowance: data ? formatUnits(data, 6) : '0',
    refetch
  };
}

/**
 * Hook para obter dados de uma partida
 */
export function useMatchData(matchId: number) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getMatch',
    args: [BigInt(matchId)],
    chainId: arbitrum.id
  });

  return { match: data, isError, isLoading, refetch };
}

/**
 * Hook para obter odds de uma partida
 */
export function useMatchOdds(matchId: number) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getOdds',
    args: [BigInt(matchId)],
    chainId: arbitrum.id
  });

  // O contrato retorna odds * 100, então dividimos por 100 para o frontend
  const formattedOdds = data ? {
    teamA: Number(data[0]) / 100,
    draw: Number(data[1]) / 100,
    teamB: Number(data[2]) / 100,
  } : { teamA: 0, draw: 0, teamB: 0 };

  return { odds: formattedOdds, isError, isLoading, refetch };
}

/**
 * Hook para obter saldo do usuário
 */
export function useUserBalance(userAddress?: `0x${string}`) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getUserBalance',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  const formattedBalance = data ? {
    available: formatUnits(data[0], 6),
    locked: formatUnits(data[1], 6),
    won: formatUnits(data[2], 6),
  } : { available: '0', locked: '0', won: '0' };

  return { balance: formattedBalance, isError, isLoading, refetch };
}

/**
 * Hook para obter apostas do usuário
 */
export function useUserBets(userAddress?: `0x${string}`) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getUserBets',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  return { bets: data, isError, isLoading, refetch };
}

/**
 * Hook para obter informações de afiliado
 */
export function useAffiliateInfo(userAddress?: `0x${string}`) {
  const { data: tierData, refetch: refetchTier } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getAffiliateTier',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  const { data: pendingBalance, refetch: refetchPending } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getAffiliatePendingBalance',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  const { data: referredFeesVolume, refetch: refetchVolume } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'getReferredFeesVolume',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  const { data: referrerAddress, refetch: refetchReferrer } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: BETTING_ABI,
    functionName: 'referrer',
    args: userAddress ? [userAddress] : undefined,
    chainId: arbitrum.id
  });

  const formattedInfo = {
    tier: tierData ? Number(tierData[0]) : 0,
    percentage: tierData ? Number(tierData[1]) : 0,
    pendingBalance: pendingBalance ? formatUnits(pendingBalance, 6) : '0',
    referredFeesVolume: referredFeesVolume ? formatUnits(referredFeesVolume, 6) : '0',
    referrerAddress: referrerAddress,
  };

  return { 
    affiliateInfo: formattedInfo, 
    refetch: () => {
      refetchTier();
      refetchPending();
      refetchVolume();
      refetchReferrer();
    }
  };
}
