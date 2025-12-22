import { useState, useEffect } from 'react';
import { useAdminConfig } from './useAdminConfig';
import { calculateInitialPools } from './useSportsApi';

// Interfaces para os dados da API
export interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
}

export interface FutureMatch extends MatchData {
  initialPoolHome: number;
  initialPoolDraw: number;
  initialPoolAway: number;
  realPoolHome: number;
  realPoolDraw: number;
  realPoolAway: number;
  minPoolHome: number;
  minPoolDraw: number;
  minPoolAway: number;
  dynamicOddsHome: number;
  dynamicOddsDraw: number;
  dynamicOddsAway: number;
  totalPoolAmount: number;
  status: 'open' | 'in_progress' | 'finished';
}

// Função para simular uma chamada de API
const mockApiCall = async (providerName: string, matchId: string): Promise<MatchData | null> => {
  console.log(`Fetching match ${matchId} from ${providerName}...`);
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Simula latência

  // Simula pequenas variações ou falhas na API
  const r = Math.random();
  if (r < 0.1) { // 10% de chance de falha
    console.error(`${providerName} failed to fetch ${matchId}`);
    return null;
  }

  // Dados base (consistentes)
  const baseData = {
    id: matchId,
    homeTeam: 'Flamengo',
    awayTeam: 'Vasco',
    league: 'Brasileirão Série A',
    startTime: new Date(Date.now() + 86400000 * 2),
  };

  // Simula pequenas variações nas odds entre as APIs
  let oddsHome = 1.5, oddsDraw = 3.5, oddsAway = 5.0;
  if (providerName === 'API 2') {
    oddsHome += 0.05;
    oddsDraw -= 0.05;
  } else if (providerName === 'API 3' && r > 0.5) { // API 3 é um pouco menos confiável
    oddsAway += 0.1;
  }

  return { ...baseData, oddsHome, oddsDraw, oddsAway };
};

// Função para encontrar o consenso entre os resultados de múltiplas APIs
const findConsensus = (results: (MatchData | null)[], requiredCount: number): MatchData | null => {
  if (results.length < requiredCount) return null;

  const validResults = results.filter(r => r !== null) as MatchData[];
  if (validResults.length < requiredCount) return null;

  // Agrupa resultados idênticos (simplificado para o exemplo)
  const groups: { data: MatchData, count: number }[] = [];

  for (const result of validResults) {
    let found = false;
    for (const group of groups) {
      // Compara os campos principais para determinar se são "iguais"
      if (
        group.data.homeTeam === result.homeTeam &&
        group.data.awayTeam === result.awayTeam &&
        Math.abs(group.data.oddsHome - result.oddsHome) < 0.1 && // Tolerância para odds
        Math.abs(group.data.oddsDraw - result.oddsDraw) < 0.1
      ) {
        group.count++;
        found = true;
        break;
      }
    }
    if (!found) {
      groups.push({ data: result, count: 1 });
    }
  }

  // Encontra o grupo com o maior número de concordâncias
  const consensusGroup = groups.find(g => g.count >= requiredCount);

  return consensusGroup ? consensusGroup.data : null;
};

// Hook principal para buscar e validar os jogos
export function useValidatedFutureMatches(enabled: boolean = true) {
  const { config } = useAdminConfig();
  const [matches, setMatches] = useState<FutureMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    if (!enabled) return;

    const fetchAndValidate = async () => {
      setIsLoading(true);
      setError(null);
      setStatus('Fetching from APIs...');

      const enabledProviders = config.apiProviders.filter(p => p.enabled);
      if (enabledProviders.length === 0) {
        setError("Nenhum provedor de API está habilitado.");
        setIsLoading(false);
        return;
      }

      // Simula a busca por uma lista de IDs de jogos futuros
      const futureMatchIds = ['match_1', 'match_2', 'match_3']; 
      const validatedMatches: FutureMatch[] = [];

      for (const matchId of futureMatchIds) {
        const apiPromises = enabledProviders.map(provider => mockApiCall(provider.name, matchId));
        const results = await Promise.all(apiPromises);

        setStatus(`Validating consensus for ${matchId}...`);
        const consensusResult = findConsensus(results, config.activeApiCount);

        if (consensusResult) {
          const pools = calculateInitialPools(consensusResult, config.virtualSeedAmount);
          const totalPool = pools.initialPoolHome + pools.initialPoolDraw + pools.initialPoolAway;
          
          validatedMatches.push({ 
            ...consensusResult, 
            ...pools,
            minPoolHome: pools.initialPoolHome,
            minPoolDraw: pools.initialPoolDraw,
            minPoolAway: pools.initialPoolAway,
            realPoolHome: Math.random() * pools.initialPoolHome * 1.5,
            realPoolDraw: Math.random() * pools.initialPoolDraw * 1.5,
            realPoolAway: Math.random() * pools.initialPoolAway * 1.5,
            dynamicOddsHome: consensusResult.oddsHome,
            dynamicOddsDraw: consensusResult.oddsDraw,
            dynamicOddsAway: consensusResult.oddsAway,
            totalPoolAmount: totalPool,
            status: 'open' as const,
          });
        } else {
          console.warn(`No consensus found for match ${matchId} with ${config.activeApiCount} required APIs.`);
        }
      }

      setMatches(validatedMatches);
      setStatus(validatedMatches.length > 0 ? 'Done' : 'No matches found with consensus.');
      setIsLoading(false);
    };

    fetchAndValidate();
  }, [enabled, config]);

  return { matches, isLoading, error, status };
}
