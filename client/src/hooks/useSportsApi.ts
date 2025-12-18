import { useState, useEffect } from 'react';
import axios from 'axios';

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
}

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
        // setMatches(response.data.matches);
        
        // Simulação de delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMatches(mockFutureMatches);
      } catch (err) {
        // setError('Falha ao buscar jogos da API. Verifique a chave e o endpoint.');
        setMatches(mockFutureMatches); // Mantém o mock em caso de erro de simulação
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [enabled]);

  return { matches, isLoading, error };
}
