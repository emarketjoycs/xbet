import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { calculateInitialPools } from './useSportsApi';
import { FEATURED_TEAMS, AVAILABLE_LEAGUES } from '../shared/matchConfig';

// Definindo a estrutura de dados para uma partida no frontend
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  // Odds Iniciais (Web2) - Usadas para cálculo da Seed Virtual
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  // Pools Iniciais (Seed Virtual) - Usados como valor mínimo de validação
  minPoolHome: number;
  minPoolDraw: number;
  minPoolAway: number;
  // Pools Reais (Valores Apostados) - Vêm do Contrato Inteligente
  realPoolHome: number;
  realPoolDraw: number;
  realPoolAway: number;
  // Odds Dinâmicas (Calculadas no Frontend)
  dynamicOddsHome: number;
  dynamicOddsDraw: number;
  dynamicOddsAway: number;
  // Status de Validação
  isValidated: boolean;
  status: 'open' | 'in_progress' | 'finished';
}

// Simulação de dados de partidas criadas (simulando o que viria do contrato)
const mockCreatedMatches: Match[] = [
  {
    id: 'match_1',
    homeTeam: 'Flamengo',
    awayTeam: 'Vasco',
    league: 'Brasileirão Série A',
    startTime: new Date(Date.now() + 86400000 * 2),
    oddsHome: 1.5,
    oddsDraw: 3.5,
    oddsAway: 5.0,
    // Pools Iniciais (Seed Virtual de 100 USDC)
    ...calculateInitialPools({ oddsHome: 1.5, oddsDraw: 3.5, oddsAway: 5.0 }, 100),
    // Pools Reais (Simulação de apostas)
    realPoolHome: 50.00, // Não atingiu 57.85
    realPoolDraw: 30.00, // Atingiu 24.79
    realPoolAway: 10.00, // Não atingiu 17.36
    dynamicOddsHome: 1.5, // Fixo antes da validação
    dynamicOddsDraw: 3.5, // Fixo antes da validação
    dynamicOddsAway: 5.0, // Fixo antes da validação
    isValidated: false,
    status: 'open',
  },
  {
    id: 'match_2',
    homeTeam: 'São Paulo',
    awayTeam: 'Palmeiras',
    league: 'Copa do Brasil',
    startTime: new Date(Date.now() + 86400000 * 5),
    oddsHome: 2.2,
    oddsDraw: 3.0,
    oddsAway: 3.1,
    // Pools Iniciais (Seed Virtual de 100 USDC)
    ...calculateInitialPools({ oddsHome: 2.2, oddsDraw: 3.0, oddsAway: 3.1 }, 100),
    // Pools Reais (Simulação de apostas)
    realPoolHome: 40.00, // Min: 39.38 - Atingiu
    realPoolDraw: 35.00, // Min: 28.86 - Atingiu
    realPoolAway: 32.00, // Min: 31.76 - Atingiu
    dynamicOddsHome: 2.5, // Dinâmico após validação
    dynamicOddsDraw: 3.2, // Dinâmico após validação
    dynamicOddsAway: 2.8, // Dinâmico após validação
    isValidated: true,
    status: 'open',
  },
  {
    id: 'match_3',
    homeTeam: 'Grêmio',
    awayTeam: 'Internacional',
    league: 'Gauchão',
    startTime: new Date(Date.now() - 86400000), // Ontem
    oddsHome: 1.9,
    oddsDraw: 3.3,
    oddsAway: 4.0,
    // Pools Iniciais (Seed Virtual de 100 USDC)
    ...calculateInitialPools({ oddsHome: 1.9, oddsDraw: 3.3, oddsAway: 4.0 }, 100),
    // Pools Reais (Simulação de apostas)
    realPoolHome: 60.00,
    realPoolDraw: 20.00,
    realPoolAway: 20.00,
    dynamicOddsHome: 1.8,
    dynamicOddsDraw: 4.0,
    dynamicOddsAway: 4.5,
    isValidated: true,
    status: 'in_progress',
  },
];

/**
 * Hook para buscar e gerenciar dados de partidas (simulando a leitura do contrato).
 */
export function useMatchData() {
  const { address } = useAccount();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Simulação de leitura do contrato para obter partidas criadas
    setTimeout(() => {
      // Em um ambiente real, você faria useReadContract para buscar a lista de partidas
      // e os pools reais de cada uma.
      
      // A lógica de cálculo de odds dinâmicas (odd = (poolTotal - poolResultado) / poolResultado)
      // deve ser implementada aqui ou no componente que exibe as odds.
      
      setMatches(mockCreatedMatches);
      setIsLoading(false);
    }, 1000);
  }, [address]);

  // Função auxiliar para determinar se uma partida é "Em Destaque"
  const isFeatured = (match: Match): boolean => {
    return FEATURED_TEAMS.some(team => match.homeTeam.includes(team) || match.awayTeam.includes(team));
  };

  // Função auxiliar para filtrar partidas por status
  const filterByStatus = (status: 'open' | 'in_progress' | 'finished') => {
    return matches.filter(match => match.status === status);
  };

  return {
    matches,
    isLoading,
    error,
    isFeatured,
    filterByStatus,
    AVAILABLE_LEAGUES,
  };
}
