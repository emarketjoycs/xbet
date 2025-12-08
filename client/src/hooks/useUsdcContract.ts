import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

/**
 * Endereço do Contrato USDC na Arbitrum One (fornecido pelo usuário)
 * 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
 */
const USDC_CONTRACT_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as const;

/**
 * ABI Mínima do ERC-20 para a função 'approve'
 */
const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Hook para interagir com o contrato USDC, especificamente para a função 'approve'.
 */
export function useUsdcContract() {
  const { data: hash, writeContract, isPending: isApproving } = useWriteContract();
  
  const { isLoading: isWaitingForApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Aprova o contrato de apostas para gastar USDC em nome do usuário.
   * @param spenderAddress Endereço do contrato de apostas (o 'gastador').
   * @param amount Valor em USDC que o gastador pode gastar (em string, ex: "100.00").
   */
  const approveUsdc = (spenderAddress: `0x${string}`, amount: string) => {
    // USDC tem 6 decimais
    const amountInWei = parseUnits(amount, 6); 

    writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountInWei],
    });
  };

  return {
    approveUsdc,
    isApproving,
    isWaitingForApproval,
    isApproved,
    approvalHash: hash,
  };
}
