import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { parseUnits } from 'viem';

/**
 * ENDEREÇO DO CONTRATO (Placeholder)
 * Deve ser o mesmo endereço usado em useBettingContract.ts
 */
const BETTING_CONTRACT_ADDRESS = "0xSEU_ENDERECO_AQUI"; 

/**
 * ABI DO CONTRATO (Exemplo Parcial)
 * A ABI COMPLETA DEVE SER USADA AQUI
 */
const BETTING_ABI = [
  // Funções de Escrita (Owner)
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
    inputs: [{ name: "_newHouseWallet", type: "address" }],
    name: "setHouseWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_tier", type: "uint256" },
      { name: "_volumeThreshold", type: "uint256" },
      { name: "_percentage", type: "uint256" }
    ],
    name: "setAffiliateTier",
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
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// Helper para converter data/hora para Unix Timestamp
const toUnixTimestamp = (date: Date): bigint => {
    return BigInt(Math.floor(date.getTime() / 1000));
}

/**
 * Hook para funções administrativas (Owner) do BettingPool
 */
export function useAdminContract() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: arbitrum.id });

  /**
   * Cria uma nova partida
   * @param homeTeam Nome do time da casa
   * @param awayTeam Nome do time visitante
   * @param startTime Data e hora de início (objeto Date)
   */
  const createMatch = (homeTeam: string, awayTeam: string, startTime: Date) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'createMatch',
      args: [homeTeam, awayTeam, toUnixTimestamp(startTime)],
      chainId: arbitrum.id
    });
  };

  /**
   * Define o resultado de uma partida
   * @param matchId ID da partida
   * @param result Resultado (1: Time A, 2: Empate, 3: Time B)
   */
  const setMatchResult = (matchId: number, result: 1 | 2 | 3) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'setMatchResult',
      args: [BigInt(matchId), result],
      chainId: arbitrum.id
    });
  };

  /**
   * Cancela uma partida
   * @param matchId ID da partida
   */
  const cancelMatch = (matchId: number) => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'cancelMatch',
      args: [BigInt(matchId)],
      chainId: arbitrum.id
    });
  };

  /**
   * Saca as taxas acumuladas da casa
   */
  const withdrawHouseFees = () => {
    writeContract({
      address: BETTING_CONTRACT_ADDRESS as `0x${string}`,
      abi: BETTING_ABI,
      functionName: 'withdrawHouseFees',
      chainId: arbitrum.id
    });
  };

  // Outras funções admin (setHouseWallet, setAffiliateTier, pause, unpause) podem ser adicionadas conforme necessário

  return {
    createMatch,
    setMatchResult,
    cancelMatch,
    withdrawHouseFees,
    isLoading: isPending,
    isConfirming,
    isSuccess
  };
}
