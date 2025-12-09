import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';

// Endereço do Contrato USDC na Arbitrum One (fornecido pelo usuário)
const USDC_CONTRACT_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// Endereço do Contrato de Apostas (Placeholder - deve ser o mesmo de useBettingContract.ts)
// O usuário deve substituir este endereço pelo endereço real do contrato de apostas.
const BETTING_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

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
    address: USDC_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: 42161, // Arbitrum One
    query: {
      enabled: !!address,
    },
  });

  // 2. Leitura da Aprovação (Allowance)
  const { data: allowanceData, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, BETTING_CONTRACT_ADDRESS as `0x${string}`],
    chainId: 42161, // Arbitrum One
    query: {
      enabled: !!address,
    },
  });

  // 3. Escrita da Aprovação (Approve)
  const { writeContract: writeApprove, isPending: isApprovePending, isSuccess: isApproveSuccess } = useWriteContract();

  /**
   * Função para aprovar o gasto de USDC pelo contrato de apostas.
   * Por convenção, aprovamos o valor máximo (maxUint256) para evitar aprovações futuras.
   */
  const approve = () => {
    writeApprove({
      address: USDC_CONTRACT_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [BETTING_CONTRACT_ADDRESS as `0x${string}`, maxUint256],
      chainId: 42161, // Arbitrum One
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
