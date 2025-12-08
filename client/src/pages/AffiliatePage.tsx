import React from 'react';
import { useAccount } from 'wagmi';
import { Loader2, Link, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAffiliateData } from "@/hooks/useAdminContract"; // Reutilizando o hook de leitura
import { useAdminWrite } from "@/hooks/useAdminContract"; // Reutilizando o hook de escrita
import { formatUnits } from 'viem';

// Dados de Tier (Baseado na descrição do usuário)
const TIER_DATA = [
  { tier: 1, volume: '0 – 1000 USDC Mês', percentage: '10%' },
  { tier: 2, volume: '1.000 – 10.000 USDC Mês', percentage: '20%' },
  { tier: 3, volume: '10.000 – 50.000 USDC Mês', percentage: '30%' },
  { tier: 4, volume: '50.000 – 150.000 USDC Mês', percentage: '40%' },
  { tier: 5, volume: '+150.000 USDC Mês', percentage: '50%' },
];

// Componente para exibir o link de afiliado
const AffiliateLinkCard: React.FC<{ address: `0x${string}` }> = ({ address }) => {
  const affiliateLink = `https://xbetas.netlify.app/?ref=${address}`; // Exemplo de link de afiliado

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    // Em um ambiente real, você usaria um toast para notificar o usuário
    console.log('Link de afiliado copiado!');
  };

  return (
    <Card className="bg-card/50 border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Link className="w-5 h-5" /> Seu Link de Afiliado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Compartilhe este link para convidar novos usuários:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={affiliateLink}
            className="flex-1 p-2 border border-border bg-background/50 text-sm font-mono truncate"
          />
          <Button onClick={handleCopy} className="cyber-button-outline">
            Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para exibir os ganhos e o botão de saque
const EarningsCard: React.FC<{ address: `0x${string}` }> = ({ address }) => {
  const { referredFeesVolume, isLoadingVolume } = useAffiliateData(address);
  const { withdrawAffiliateCommission, isPending, isSuccess, isError, error } = useAdminWrite();

  // O volume de taxas é o total gerado pelos referidos (em wei/unidades do token)
  const volume = referredFeesVolume ? formatUnits(referredFeesVolume, 6) : '0.00'; 
  
  // NOTA: O cálculo exato da comissão pendente para saque deve ser feito no Smart Contract.
  // Aqui, estamos apenas exibindo o volume de taxas gerado e o botão de saque.
  // O contrato deve ter uma função `getAffiliatePendingCommission` para um valor mais preciso.
  // Por enquanto, usamos o volume como proxy para o potencial de ganho.

  return (
    <Card className="bg-card/50 border-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary">
          <DollarSign className="w-5 h-5" /> Seus Ganhos de Afiliado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Volume de Taxas Gerado por Referidos (Mês):</p>
        <p className="text-3xl font-bold mb-4">
          {isLoadingVolume ? <Loader2 className="w-6 h-6 animate-spin inline-block" /> : `${volume} USDC`}
        </p>
        
        <Button 
          onClick={() => withdrawAffiliateCommission()} 
          disabled={isPending || referredFeesVolume === BigInt(0)} 
          className="w-full cyber-button"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sacar Comissão'}
        </Button>
        {isSuccess && <p className="text-green-400 mt-2">Saque de comissão realizado com sucesso!</p>}
        {isError && <p className="text-red-400 mt-2">Erro no saque: {error?.message}</p>}
      </CardContent>
    </Card>
  );
};

// Componente para exibir o Tier atual
const TierCard: React.FC<{ address: `0x${string}` }> = ({ address }) => {
  const { affiliateTier, isLoadingTier } = useAffiliateData(address);
  
  const currentTier = affiliateTier?.tier.toString() || '1';
  const currentPercentage = affiliateTier?.percentage.toFixed(2) || '10.00';

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" /> Seu Tier Atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Tier de Afiliado:</p>
        <Badge className="text-2xl font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30">
          Tier {currentTier}
        </Badge>
        <p className="text-sm text-muted-foreground mt-4">Porcentagem de Comissão:</p>
        <p className="text-2xl font-bold text-green-400">{currentPercentage}%</p>
        {isLoadingTier && <Loader2 className="w-4 h-4 animate-spin mt-2" />}
      </CardContent>
    </Card>
  );
};

// Componente principal da página de afiliados
export default function AffiliatePage() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold text-red-400">Conecte sua Carteira</h1>
        <p className="text-muted-foreground mt-2">Conecte sua carteira Metamask/Rainbow para acessar o Painel de Afiliados.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" /> Sistema de Afiliados
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AffiliateLinkCard address={address} />
        <EarningsCard address={address} />
        <TierCard address={address} />
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-xl">Tabela de Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume de Taxas Gerado (Mês)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">% da Taxa da Casa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TIER_DATA.map((item) => (
                  <tr key={item.tier} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Tier {item.tier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.volume}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
