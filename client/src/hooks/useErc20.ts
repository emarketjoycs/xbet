import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';

// Endereço do Contrato USDC na Polygon PoS (USDC nativo)
// Este é o endereço oficial do USDC nativo na Polygon PoS
const USDC_CONTRACT_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

// Endereço do Contrato de Apostas
// Busca da variável de ambiente ou usa o endereço padrão
const BETTING_CONTRACT_ADDRESS = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS || "0x2405e4c50865b8Dc2EC15D5afc28736397E999bc"; 

// ABI mínima para interagir com o ERC20 (balanceOf, allowance, approve)
const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

/**
 * Hook para interagir com o token USDC (ERC20)
 */
export function useUSDC() {
  const { address } = useAccount();
  const decimals = 6; // USDC tem 6 casas decimais

  // 1. Leitura do Saldo (Balance)
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Atualiza a cada 10 segundos
    },
  });

  // 2. Leitura da Aprovação (Allowance)
  const { data: allowanceData, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, BETTING_CONTRACT_ADDRESS as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Atualiza a cada 10 segundos
    },
  });

  // 3. Escrita da Aprovação (Approve)
  const { writeContract: writeApprove, isPending: isApprovePending, isSuccess: isApproveSuccess } = useWriteContract();

  /**
   * Função para aprovar o gasto de USDC pelo contrato de apostas.
   * Por convenção, aprovamos o valor máximo (maxUint256) para evitar aprovações futuras.
   */
  const approve = () => {
    if (!address) {
      console.error('Wallet not connected');
      return;
    }
    
    writeApprove({
      address: USDC_CONTRACT_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [BETTING_CONTRACT_ADDRESS as `0x${string}`, maxUint256],
    });
  };

  // Formatação dos dados
  const balance = balanceData ? Number(balanceData) / (10 ** decimals) : 0;
  const allowance = allowanceData ? allowanceData : BigInt(0);

  return {
    USDC_CONTRACT_ADDRESS,
    BETTING_CONTRACT_ADDRESS,
    balance,
    allowance,
    decimals,
    isBalanceLoading,
    isAllowanceLoading,
    isApprovePending,
    isApproveSuccess,
    approve,
    refetchBalance,
    refetchAllowance,
  };
}
