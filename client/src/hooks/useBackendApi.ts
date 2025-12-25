import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Hook para buscar partidas futuras de uma liga
 */
export function useFutureMatches(leagueId?: string, season?: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId || !season) return;

    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BACKEND_URL}/api/matches/future`, {
          params: { leagueId, season }
        });

        setMatches(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [leagueId, season]);

  return { matches, isLoading, error };
}

/**
 * Hook para buscar odds de uma partida
 */
export function useMatchOdds(fixtureId?: number) {
  const [odds, setOdds] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;

    const fetchOdds = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BACKEND_URL}/api/matches/${fixtureId}/odds`);
        setOdds(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
        setOdds(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOdds();
  }, [fixtureId]);

  return { odds, isLoading, error };
}

/**
 * Hook para buscar resultado de uma partida
 */
export function useMatchResult(fixtureId?: number) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = async () => {
    if (!fixtureId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/matches/${fixtureId}/result`);
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [fixtureId]);

  return { result, isLoading, error, refetch: fetchResult };
}

/**
 * Hook para buscar partidas de hoje
 */
export function useTodayMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/matches/today`);
      setMatches(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return { matches, isLoading, error, refetch: fetchMatches };
}

/**
 * Hook para buscar informações de um mercado do backend
 */
export function useBackendMarket(marketId?: number) {
  const [market, setMarket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) return;

    const fetchMarket = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BACKEND_URL}/api/markets/${marketId}`);
        setMarket(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
        setMarket(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarket();
  }, [marketId]);

  return { market, isLoading, error };
}

/**
 * Hook para buscar mercados ativos
 */
export function useActiveMarkets() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/markets/active`);
      setMarkets(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return { markets, isLoading, error, refetch: fetchMarkets };
}

/**
 * Função para normalizar odds (calcular seed virtual)
 */
export async function normalizeOdds(
  home: number,
  draw: number | null,
  away: number,
  seedAmount: number
): Promise<any> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/odds/normalize`, {
      home,
      draw,
      away,
      seedAmount
    });

    return response.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * Função para forçar verificação manual do oracle (apenas para testes)
 */
export async function triggerOracleCheck(): Promise<void> {
  try {
    await axios.post(`${BACKEND_URL}/api/oracle/check`);
  } catch (err: any) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * Hook para verificar status do backend
 */
export function useBackendHealth() {
  const [health, setHealth] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/health`, {
          timeout: 5000
        });

        setHealth(response.data);
        setIsOnline(response.data.status === 'ok');
      } catch (err) {
        setHealth(null);
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return { health, isOnline, isLoading };
}
