import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { calculateInitialPools } from './useSportsApi';
import { useAdminConfig } from './useAdminConfig';
import { useMatchRegistry } from './useMatchRegistry';
import { v4 as uuidv4 } from 'uuid';

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
function createMockMatches(config: any): Match[] {
  const mockMatches: Match[] = [];
  const teams = config.priorityTeams.length > 0 ? config.priorityTeams : ['Flamengo', 'Vasco', 'São Paulo', 'Palmeiras', 'Grêmio', 'Internacional'];
  const leagues = config.priorityLeagues.length > 0 ? config.priorityLeagues : ['Brasileirão Série A', 'Copa do Brasil', 'Gauchão'];

  for (let i = 0; i < config.maxConcurrentMatches; i++) {
    const homeTeam = teams[i % teams.length];
    const awayTeam = teams[(i + 1) % teams.length];
    const league = leagues[i % leagues.length];
    const oddsHome = 1.5 + Math.random();
    const oddsDraw = 3.0 + Math.random();
    const oddsAway = 4.0 + Math.random();

    const initialPools = calculateInitialPools({ oddsHome, oddsDraw, oddsAway }, config.virtualSeedAmount);

    mockMatches.push({
      id: uuidv4(),
      homeTeam,
      awayTeam,
      league,
      startTime: new Date(Date.now() + 86400000 * (i + 1)),
      oddsHome,
      oddsDraw,
      oddsAway,
      ...initialPools,
      realPoolHome: Math.random() * initialPools.minPoolHome * 1.5,
      realPoolDraw: Math.random() * initialPools.minPoolDraw * 1.5,
      realPoolAway: Math.random() * initialPools.minPoolAway * 1.5,
      dynamicOddsHome: oddsHome,
      dynamicOddsDraw: oddsDraw,
      dynamicOddsAway: oddsAway,
      isValidated: false,
      status: 'open',
    });
  }

  return mockMatches;
}

/**
 * Hook para buscar e gerenciar dados de partidas (simulando a leitura do contrato).
 */
export function useMatchData() {
  const { address } = useAccount();
  const { config } = useAdminConfig();
  const { isMatchRegistered, registerMatch } = useMatchRegistry();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.isAutoCreationEnabled) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const createdMatches = createMockMatches(config);
      
      // Filtra partidas que já estão registradas para evitar duplicatas
      const newMatches = createdMatches.filter(match => {
        const alreadyRegistered = isMatchRegistered(
          match.homeTeam,
          match.awayTeam,
          match.league,
          match.startTime
        );
        
        if (!alreadyRegistered) {
          // Registra a nova partida
          registerMatch(
            match.homeTeam,
            match.awayTeam,
            match.league,
            match.startTime
          );
          return true;
        }
        
        console.log(`Partida duplicada ignorada: ${match.homeTeam} vs ${match.awayTeam}`);
        return false;
      });
      
      setMatches(newMatches);
      setIsLoading(false);
    }, 1000);
  }, [address, config]);

  const isFeatured = (match: Match): boolean => {
    return config.priorityTeams.some((team: string) => match.homeTeam.includes(team) || match.awayTeam.includes(team));
  };

  const filterByStatus = (status: 'open' | 'in_progress' | 'finished') => {
    return matches.filter(match => match.status === status);
  };

  return {
    matches,
    isLoading,
    error,
    isFeatured,
    filterByStatus,
    AVAILABLE_LEAGUES: config.priorityLeagues,
  };
}
