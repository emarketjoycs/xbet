import { useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

/**
 * ENDEREÇO DO CONTRATO (Placeholder)
 * Substituir pelo endereço real após o deploy na Arbitrum One
 */
const BETTING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * ABI DO CONTRATO (Exemplo Parcial)
 * Esta ABI deve ser atualizada com a ABI final gerada pelo Hardhat/Foundry
 */
const BETTING_ABI = [
  {
    inputs: [{ name: "matchId", type: "uint256" }, { name: "outcome", type: "uint8" }],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "matchId", type: "uint256" }],
    name: "getMatchInfo",
    outputs: [
      { name: "homePool", type: "uint256" },
      { name: "awayPool", type: "uint256" },
      { name: "drawPool", type: "uint256" },
      { name: "status", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

export function useBettingContract() {
  const { writeContract, isPending, isSuccess } = useWriteContract();

  /**
   * Função para realizar uma aposta
   * @param matchId ID da partida
   * @param outcome 0 = Casa, 1 = Empate, 2 = Visitante
   * @param amount Valor em USDC (será convertido para wei/unidades do token)
   */
  const placeBet = (matchId: number, outcome: number, amount: string) => {
    // NOTA: Para tokens ERC20 (USDC), primeiro é necessário chamar 'approve' no contrato do token.
    // Esta implementação assume ETH nativo ou que o approve já foi feito.
    // Futuramente implementar fluxo de Approve -> Bet.
    
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: BETTING_ABI,
      functionName: 'placeBet',
      args: [BigInt(matchId), outcome],
      // value: parseEther(amount) // Se for ETH nativo
    });
  };

  return {
    placeBet,
    isLoading: isPending,
    isSuccess
  };
}

/**
 * Hook para ler dados de uma partida
 */
export function useMatchData(matchId: number) {
  const { data, isError, isLoading } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: BETTING_ABI,
    functionName: 'getMatchInfo',
    args: [BigInt(matchId)],
  });

  return { data, isError, isLoading };
}
