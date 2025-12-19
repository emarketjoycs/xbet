import { useState, useEffect } from 'react';
import axios from 'axios';
import { AUTHORIZED_TEAMS } from '../../shared/matchConfig';

// Interface para os dados de um jogo futuro (simulados)
export interface FutureMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  // Novos campos para a lógica de seed
  initialPoolHome: number;
  initialPoolDraw: number;
  initialPoolAway: number;
}

/**
 * Converte odds decimais (Web2) em probabilidade implícita.
 * Probabilidade = 1 / Odd
 * @param odd - Odd decimal (ex: 1.5)
 * @returns Probabilidade (ex: 0.666)
 */
const oddToProbability = (odd: number): number => 1 / odd;

/**
 * Calcula a distribuição da seed (100 USDC) proporcionalmente às probabilidades.
 * @param odds - Objeto com as odds iniciais (home, draw, away)
 * @param seedAmount - Valor da seed em USDC
 * @returns Objeto com os valores iniciais de pool (home, draw, away)
 */
export const calculateInitialPools = (odds: { oddsHome: number, oddsDraw: number, oddsAway: number }, seedAmount: number): { initialPoolHome: number, initialPoolDraw: number, initialPoolAway: number } => {
  // 1. Converter Odds para Probabilidades Implícitas
  const probHome = oddToProbability(odds.oddsHome);
  const probDraw = oddToProbability(odds.oddsDraw);
  const probAway = oddToProbability(odds.oddsAway);

  // 2. Normalizar as Probabilidades (para remover o "vig" da casa Web2)
  const totalProb = probHome + probDraw + probAway;
  const normalizedProbHome = probHome / totalProb;
  const normalizedProbDraw = probDraw / totalProb;
  const normalizedProbAway = probAway / totalProb;

  // 3. Distribuir a Seed (100 USDC) inversamente proporcional à probabilidade
  // O pool é o valor que o vencedor leva. Para o sistema P2P, o pool inicial
  // deve ser distribuído de forma que a odd dinâmica (PoolTotal - PoolResultado) / PoolResultado
  // seja próxima da odd inicial.

  // No modelo P2P, a odd é calculada como: (PoolTotal - PoolResultado) / PoolResultado
  // Para que a odd inicial seja respeitada, a distribuição do pool inicial (Seed)
  // deve ser feita de forma que o valor do pool seja inversamente proporcional à probabilidade.
  // PoolResultado = Seed / ProbabilidadeNormalizada

  // No entanto, o objetivo é que o pool inicial de 100 USDC seja a soma dos pools.
  // Se PoolTotal = 100, e PoolResultado = 100 / Odd
  // PoolHome = 100 / OddsHome
  // PoolDraw = 100 / OddsDraw
  // PoolAway = 100 / OddsAway

  // O problema é que a soma desses pools não será 100.
  // Vamos usar a lógica de que a distribuição deve ser proporcional à probabilidade normalizada
  // para que o pool inicial reflita a força de cada resultado.

  // PoolResultado = Seed * ProbabilidadeNormalizada
  const poolHome = seedAmount * normalizedProbHome;
  const poolDraw = seedAmount * normalizedProbDraw;
  const poolAway = seedAmount * normalizedProbAway;

  // A soma desses pools é 100 USDC.
  // Isso garante que o pool inicial de 100 USDC seja distribuído proporcionalmente.
  // A odd dinâmica inicial será: (100 - PoolResultado) / PoolResultado.

  return {
    initialPoolHome: poolHome,
    initialPoolDraw: poolDraw,
    initialPoolAway: poolAway,
  };
};

// Função auxiliar para verificar se a partida deve ser criada automaticamente
const isMatchAuthorized = (match: FutureMatch): boolean => {
  return AUTHORIZED_TEAMS.some(team => match.homeTeam.includes(team) || match.awayTeam.includes(team));
};

// Simulação de dados de jogos futuros
const mockFutureMatches: FutureMatch[] = [
  {
    id: 'match_1',
    homeTeam: 'Flamengo',
    awayTeam: 'Vasco',
    league: 'Brasileirão Série A',
    startTime: new Date(Date.now() + 86400000 * 2), // Daqui a 2 dias
    oddsHome: 1.5,
    oddsDraw: 3.5,
    oddsAway: 5.0,
    // Valores de pool iniciais simulados com seed de 100 USDC
    ...calculateInitialPools({ oddsHome: 1.5, oddsDraw: 3.5, oddsAway: 5.0 }, 100),
  },
  {
    id: 'match_2',
    homeTeam: 'São Paulo',
    awayTeam: 'Palmeiras',
    league: 'Copa do Brasil',
    startTime: new Date(Date.now() + 86400000 * 5), // Daqui a 5 dias
    oddsHome: 2.2,
    oddsDraw: 3.0,
    oddsAway: 3.1,
    // Valores de pool iniciais simulados com seed de 100 USDC
    ...calculateInitialPools({ oddsHome: 2.2, oddsDraw: 3.0, oddsAway: 3.1 }, 100),
  },
  {
    id: 'match_3',
    homeTeam: 'Grêmio',
    awayTeam: 'Internacional',
    league: 'Gauchão',
    startTime: new Date(Date.now() + 86400000 * 10), // Daqui a 10 dias
    oddsHome: 1.9,
    oddsDraw: 3.3,
    oddsAway: 4.0,
    // Valores de pool iniciais simulados com seed de 100 USDC
    ...calculateInitialPools({ oddsHome: 1.9, oddsDraw: 3.3, oddsAway: 4.0 }, 100),
  },
];

/**
 * Hook para buscar jogos futuros via API.
 * Por enquanto, usa dados mockados.
 * @param enabled - Se a busca deve ser executada.
 */
export function useFutureMatches(enabled: boolean = true) {
  const [matches, setMatches] = useState<FutureMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);
      
      // Simulação de chamada de API (substituir pela chamada real da API-Sports.io)
      try {
        // const response = await axios.get('URL_DA_API_SPORTS_IO');
        // const apiMatches = response.data.matches.map((match: any) => ({
        //   ...match,
        //   // Você precisará definir o valor da seed (ex: 100) aqui
        //   ...calculateInitialPools({ oddsHome: match.oddsHome, oddsDraw: match.oddsDraw, oddsAway: match.oddsAway }, 100),
        // }));
        // setMatches(apiMatches);
        
        // Simulação de delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMatches(mockFutureMatches);
      } catch (err) {
        // setError('Falha ao buscar jogos da API. Verifique a chave e o endpoint.');
        // setMatches(mockFutureMatches); // Mantém o mock em caso de erro de simulação
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [enabled]);

  // Simula a criação automática: filtra apenas as partidas que contêm times autorizados
  const authorizedMatches = matches.filter(isMatchAuthorized);

  // Retorna apenas as partidas autorizadas para simular a criação automática
  return { matches: authorizedMatches, isLoading, error };
}