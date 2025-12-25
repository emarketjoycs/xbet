import { useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

/**
 * ENDEREÇO DO CONTRATO
 * Busca da variável de ambiente ou usa o endereço padrão
 */
const BETTING_CONTRACT_ADDRESS = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS || "0x2405e4c50865b8Dc2EC15D5afc28736397E999bc";

/**
 * ABI DO CONTRATO (Exemplo Parcial)
 * Esta ABI deve ser atualizada com a ABI final gerada pelo Hardhat/Foundry
 */
const BETTING_ABI = [
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
    inputs: [{ name: "matchId", type: "uint256" }, { name: "outcome", type: "uint8" }, { name: "amount", type: "uint256" }],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
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
      // O valor da aposta deve ser aprovado previamente via 'approve' no contrato USDC.
    
    writeContract({
      address: BETTING_CONTRACT_ADDRESS,
      abi: BETTING_ABI,
      functionName: 'placeBet',
      args: [BigInt(matchId), outcome, parseUnits(amount, 6)], // USDC tem 6 casas decimais
      // value: parseEther(amount) // Removido, pois aposta é feita com token ERC20 (USDC)
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

/**
 * Hook para ler e formatar as odds de uma partida.
 * O contrato retorna as odds em Basis Points (multiplicado por 10000).
 */
export function useMatchOdds(matchId: number) {
  const { data, isError, isLoading } = useReadContract({
    address: BETTING_CONTRACT_ADDRESS,
    abi: BETTING_ABI,
    functionName: 'getOdds',
    args: [BigInt(matchId)],
  });

  const ODDS_BASE = 10000;

  const oddsData = data ? {
    oddsTeamA: Number(data[0]) / ODDS_BASE,
    oddsDraw: Number(data[1]) / ODDS_BASE,
    oddsTeamB: Number(data[2]) / ODDS_BASE,
  } : undefined;

  return { oddsData, isError, isLoading };
}
