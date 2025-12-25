import { useAccount } from 'wagmi';
import { useUSDC } from '@/hooks/useErc20';
import { Spinner } from '@/components/ui/spinner';

export default function USDCBalanceDisplay() {
  const { isConnected } = useAccount();
  const { balance, isBalanceLoading } = useUSDC();

  if (!isConnected) {
    return null; // Não exibe nada se não estiver conectado
  }

  if (isBalanceLoading) {
    return <Spinner className="w-5 h-5 mr-2" />; // Exibe um spinner enquanto carrega
  }

  // Formata o saldo para duas casas decimais e exibe o símbolo USDC
  const formattedBalance = balance.toFixed(2);

  return (
    <div className="flex items-center text-sm font-medium text-white bg-muted/30 px-3 py-2 rounded-full border border-primary/50">
      {formattedBalance} USDC
    </div>
  );
}