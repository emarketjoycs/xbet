import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { BetOutcome, MatchStatus } from '@shared/const'; // Enums do Smart Contract BettingPool.sol

/**
 * ENDEREÇO DO CONTRATO (Placeholder)
 * Substituir pelo endereço real após o deploy na Arbitrum One
 */
const BETTING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * ABI DO CONTRATO (Funções de Owner e View)
 * Baseado no BettingPool.sol
 */
const ADMIN_ABI = [
  // View Functions
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "matchCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "matches",
    outputs: [
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
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "housePendingBalance",
    outputs: [{ name: "", type: "uint256" }],
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
    name: "getReferredFeesVolume",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  // Write Functions (Owner)
  {
    inputs: [
      { name: "_homeTeam", type: "string" },
      { name: "_awayTeam", type: "string" },
      { name: "_startTime", type: "uint256" }
    ],
    name: "createMatch",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_matchId", type: "uint256" },
      { name: "_result", type: "uint8" }
    ],
    name: "setMatchResult",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_matchId", type: "uint256" }],
    name: "cancelMatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdrawHouseFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Tipagem para os dados de Match retornados pela função 'matches'
export type MatchData = {
  id: bigint;
  homeTeam: string;
  awayTeam: string;
  startTime: bigint;
  totalPoolAmount: bigint;
  poolTeamA: bigint;
  poolDraw: bigint;
  poolTeamB: bigint;
  result: BetOutcome;
  status: MatchStatus;
  exists: boolean;
};

/**
 * Hook para verificar se o usuário conectado é o Owner do contrato.
 */
export function useIsOwner() {
  const { address, isConnected } = useAccount();
  
  // *** SIMULAÇÃO DE ADMIN PARA TESTES ***
  // Substitua 'SEU_ENDERECO_DE_TESTE' pelo endereço da sua carteira de teste (em minúsculas)
  const SIMULATED_OWNER_ADDRESS = "0xAD1e0c6495aC38D3b88f2aD32F963E491926EC33".toLowerCase(); 
  
  // A leitura do contrato real pode ser mantida, mas a lógica de verificação será alterada
  const { data: ownerAddress, isLoading: isLoadingOwner } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'owner',
    query: {
      enabled: isConnected,
    },
  });

  // Acesso de administrador é concedido se o endereço conectado for o endereço simulado
  const isOwner = isConnected && address?.toLowerCase() === SIMULATED_OWNER_ADDRESS;

  // Você pode retornar o endereço simulado como ownerAddress para fins de exibição
  return { isOwner, isLoadingOwner: false, ownerAddress: SIMULATED_OWNER_ADDRESS };
}

/**
 * Hook para ler dados administrativos do contrato.
 */
export function useAdminRead() {
  const { data: matchCounter, isLoading: isLoadingMatchCounter, refetch: refetchMatchCounter } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'matchCounter',
  });

  const { data: housePendingBalance, isLoading: isLoadingHouseBalance, refetch: refetchHouseBalance } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'housePendingBalance',
  });

  return {
    matchCounter: matchCounter as bigint | undefined,
    isLoadingMatchCounter,
    refetchMatchCounter,
    housePendingBalance: housePendingBalance as bigint | undefined,
    isLoadingHouseBalance,
    refetchHouseBalance,
  };
}

/**
 * Hook para ler dados de uma partida específica.
 */
export function useMatchDetails(matchId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'matches',
    args: [matchId],
    query: {
      enabled: matchId > 0,
    },
  });

  // Mapear o array de retorno para o tipo MatchData
  const matchData: MatchData | undefined = data ? {
    id: data[0] as bigint,
    homeTeam: data[1] as string,
    awayTeam: data[2] as string,
    startTime: data[3] as bigint,
    totalPoolAmount: data[4] as bigint,
    poolTeamA: data[5] as bigint,
    poolDraw: data[6] as bigint,
    poolTeamB: data[7] as bigint,
    result: data[8] as BetOutcome,
    status: data[9] as MatchStatus,
    exists: data[10] as boolean,
  } : undefined;

  return { matchData, isLoading, refetch };
}

/**
 * Hook para ler dados de afiliados.
 */
export function useAffiliateData(affiliateAddress: `0x${string}`) {
  const { data: tierData, isLoading: isLoadingTier, refetch: refetchTier } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'getAffiliateTier',
    args: [affiliateAddress],
  });

  const { data: volumeData, isLoading: isLoadingVolume, refetch: refetchVolume } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'getReferredFeesVolume',
    args: [affiliateAddress],
  });

  const PERCENTAGE_BASE = 10000;

  const affiliateTier = tierData ? {
    tier: tierData[0] as bigint,
    percentage: Number(tierData[1]) / (PERCENTAGE_BASE / 100), // Divide por 100 para obter a porcentagem (ex: 1000 -> 10%)
  } : undefined;

  return {
    affiliateTier,
    referredFeesVolume: volumeData as bigint | undefined,
    isLoadingTier,
    isLoadingVolume,
    refetchTier,
    refetchVolume,
  };
}

/**
 * Hook para escrever (transacionar) funções administrativas.
 */
export function useAdminWrite() {
  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

  const createMatch = (homeTeam: string, awayTeam: string, startTime: bigint) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: ADMIN_ABI,
      functionName: 'createMatch',
      args: [homeTeam, awayTeam, startTime],
    });
  };

  const setMatchResult = (matchId: bigint, result: BetOutcome) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: ADMIN_ABI,
      functionName: 'setMatchResult',
      args: [matchId, result],
    });
  };

  const cancelMatch = (matchId: bigint) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: ADMIN_ABI,
      functionName: 'cancelMatch',
      args: [matchId],
    });
  };

  const withdrawHouseFees = () => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: ADMIN_ABI,
      functionName: 'withdrawHouseFees',
    });
  };

  return {
    createMatch,
    setMatchResult,
    cancelMatch,
    withdrawHouseFees,
    isPending,
    isSuccess,
    isError,
    error,
  };
}
