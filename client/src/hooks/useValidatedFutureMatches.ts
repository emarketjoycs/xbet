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

// Interface para resultado final de uma partida
export interface MatchResult {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  result: 'home' | 'draw' | 'away'; // Resultado final
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

/**
 * Função para normalizar nomes de times (remove acentos, espaços extras, etc.)
 */
const normalizeTeamName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

/**
 * Função para gerar uma chave única de partida baseada em times, campeonato e data
 */
const generateMatchKey = (homeTeam: string, awayTeam: string, league: string, startTime: Date): string => {
  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);
  const normalizedLeague = normalizeTeamName(league);
  const dateKey = startTime.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return `${normalizedHome}_vs_${normalizedAway}_${normalizedLeague}_${dateKey}`;
};

/**
 * Função para simular uma chamada de API que retorna partidas futuras
 * Na produção, substituir por chamadas reais às APIs de esportes
 */
const mockApiFetchMatches = async (providerName: string): Promise<MatchData[]> => {
  console.log(`Fetching matches from ${providerName}...`);
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Simula latência

  // Simula falha ocasional
  const r = Math.random();
  if (r < 0.05) { // 5% de chance de falha
    console.error(`${providerName} failed to fetch matches`);
    return [];
  }

  // Dados mockados de partidas futuras
  const mockMatches: MatchData[] = [
    {
      id: 'match_1',
      homeTeam: 'Flamengo',
      awayTeam: 'Vasco',
      league: 'Brasileirão Série A',
      startTime: new Date(Date.now() + 86400000 * 2), // Daqui a 2 dias
      oddsHome: 1.5,
      oddsDraw: 3.5,
      oddsAway: 5.0,
    },
    {
      id: 'match_2',
      homeTeam: 'São Paulo',
      awayTeam: 'Palmeiras',
      league: 'Copa do Brasil',
      startTime: new Date(Date.now() + 86400000 * 3), // Daqui a 3 dias
      oddsHome: 2.2,
      oddsDraw: 3.0,
      oddsAway: 3.1,
    },
    {
      id: 'match_3',
      homeTeam: 'Grêmio',
      awayTeam: 'Internacional',
      league: 'Gauchão',
      startTime: new Date(Date.now() + 86400000 * 5), // Daqui a 5 dias
      oddsHome: 1.9,
      oddsDraw: 3.3,
      oddsAway: 4.0,
    },
  ];

  // Simula pequenas variações nas odds entre APIs (mas times, campeonato e data são consistentes)
  if (providerName === 'API 2') {
    return mockMatches.map(m => ({ ...m, oddsHome: m.oddsHome + 0.05, oddsDraw: m.oddsDraw - 0.05 }));
  } else if (providerName === 'API 3') {
    return mockMatches.map(m => ({ ...m, oddsAway: m.oddsAway + 0.1 }));
  }

  return mockMatches;
};

/**
 * Função para simular uma chamada de API que retorna o resultado final de uma partida
 * Esta função será usada APÓS a partida terminar para validar o resultado
 * Na produção, substituir por chamadas reais às APIs de esportes
 */
export const mockApiFetchResult = async (
  providerName: string,
  matchId: string
): Promise<MatchResult | null> => {
  console.log(`Fetching result for match ${matchId} from ${providerName}...`);
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500)); // Simula latência

  // Simula falha ocasional
  const r = Math.random();
  if (r < 0.05) { // 5% de chance de falha
    console.error(`${providerName} failed to fetch result for ${matchId}`);
    return null;
  }

  // Resultado mockado (na produção, vem da API)
  return {
    matchId,
    homeTeam: 'Flamengo',
    awayTeam: 'Vasco',
    league: 'Brasileirão Série A',
    startTime: new Date(Date.now() - 86400000), // Partida já aconteceu
    result: 'home', // Time da casa venceu
  };
};

/**
 * Função para validar o resultado final de uma partida com consenso de múltiplas APIs
 * Retorna o resultado apenas se o número mínimo de APIs concordarem
 */
export const validateMatchResult = async (
  matchId: string,
  enabledProviders: { name: string; envVar: string }[],
  requiredConsensus: number
): Promise<'home' | 'draw' | 'away' | null> => {
  const resultPromises = enabledProviders.map(provider => mockApiFetchResult(provider.name, matchId));
  const results = await Promise.all(resultPromises);

  // Filtra resultados válidos
  const validResults = results.filter(r => r !== null) as MatchResult[];
  if (validResults.length < requiredConsensus) {
    console.warn(`Not enough valid results for match ${matchId}. Got ${validResults.length}, required ${requiredConsensus}`);
    return null;
  }

  // Conta votos para cada resultado
  const votes = { home: 0, draw: 0, away: 0 };
  for (const result of validResults) {
    votes[result.result]++;
  }

  // Verifica se algum resultado tem consenso suficiente
  if (votes.home >= requiredConsensus) return 'home';
  if (votes.draw >= requiredConsensus) return 'draw';
  if (votes.away >= requiredConsensus) return 'away';

  console.warn(`No consensus reached for match ${matchId}. Votes: home=${votes.home}, draw=${votes.draw}, away=${votes.away}`);
  return null;
};

/**
 * Função para remover duplicatas de partidas baseado em times, campeonato e data
 */
const removeDuplicates = (matches: MatchData[]): MatchData[] => {
  const seenKeys = new Set<string>();
  const uniqueMatches: MatchData[] = [];

  for (const match of matches) {
    const key = generateMatchKey(match.homeTeam, match.awayTeam, match.league, match.startTime);
    
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueMatches.push(match);
    } else {
      console.log(`Duplicate match detected and removed: ${match.homeTeam} vs ${match.awayTeam} (${match.league})`);
    }
  }

  return uniqueMatches;
};

/**
 * Hook principal para buscar e validar partidas futuras
 */
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

      try {
        // Busca partidas de todas as APIs ativas
        const matchPromises = enabledProviders.map(provider => mockApiFetchMatches(provider.name));
        const allResults = await Promise.all(matchPromises);

        // Combina todos os resultados em uma única lista
        const allMatches = allResults.flat();

        setStatus('Removing duplicates...');
        // Remove duplicatas baseado em times, campeonato e data
        const uniqueMatches = removeDuplicates(allMatches);

        setStatus('Creating match pools...');
        // Converte para FutureMatch com pools calculados
        const validatedMatches: FutureMatch[] = uniqueMatches.map(match => {
          const pools = calculateInitialPools(
            { oddsHome: match.oddsHome, oddsDraw: match.oddsDraw, oddsAway: match.oddsAway },
            config.virtualSeedAmount
          );
          const totalPool = pools.initialPoolHome + pools.initialPoolDraw + pools.initialPoolAway;

          return {
            ...match,
            ...pools,
            minPoolHome: pools.initialPoolHome,
            minPoolDraw: pools.initialPoolDraw,
            minPoolAway: pools.initialPoolAway,
            realPoolHome: Math.random() * pools.initialPoolHome * 1.5,
            realPoolDraw: Math.random() * pools.initialPoolDraw * 1.5,
            realPoolAway: Math.random() * pools.initialPoolAway * 1.5,
            dynamicOddsHome: match.oddsHome,
            dynamicOddsDraw: match.oddsDraw,
            dynamicOddsAway: match.oddsAway,
            totalPoolAmount: totalPool,
            status: 'open' as const,
          };
        });

        setMatches(validatedMatches);
        setStatus(validatedMatches.length > 0 ? `${validatedMatches.length} partidas carregadas` : 'Nenhuma partida encontrada.');
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Erro ao buscar partidas das APIs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndValidate();
  }, [enabled, config.apiProviders, config.virtualSeedAmount, config.activeApiCount]);

  return { matches, isLoading, error, status };
}
