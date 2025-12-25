import { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface BackendMatch {
  marketId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: number;
  state: number; // 0=CREATED, 1=FORMING, 2=ACTIVE, 3=SETTLED, 4=VOIDED
  outcomesCount: number;
  totalPools: string;
  activationDeadline: number;
  winningOutcome?: number;
  resultSet: boolean;
}

/**
 * Hook para buscar todos os mercados do smart contract via backend
 */
export function useBackendMarkets() {
  const [markets, setMarkets] = useState<BackendMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/markets/all`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar mercados');
        }

        const data = await response.json();
        
        if (data.success) {
          setMarkets(data.data);
        } else {
          throw new Error('Resposta inválida do backend');
        }
      } catch (err) {
        console.error('Erro ao buscar mercados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setMarkets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchMarkets, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { markets, isLoading, error };
}

/**
 * Hook para buscar mercados ativos (em andamento)
 */
export function useActiveMarkets() {
  const { markets, isLoading, error } = useBackendMarkets();
  
  const activeMarkets = markets.filter(m => 
    m.state === 2 && !m.resultSet // State 2 = ACTIVE
  );
  
  return { markets: activeMarkets, isLoading, error };
}

/**
 * Hook para buscar mercados em formação (aceitando apostas)
 */
export function useFormingMarkets() {
  const { markets, isLoading, error } = useBackendMarkets();
  
  const formingMarkets = markets.filter(m => 
    m.state === 1 // State 1 = FORMING
  );
  
  return { markets: formingMarkets, isLoading, error };
}

/**
 * Hook para buscar mercados finalizados
 */
export function useSettledMarkets() {
  const { markets, isLoading, error } = useBackendMarkets();
  
  const settledMarkets = markets.filter(m => 
    m.state === 3 // State 3 = SETTLED
  );
  
  return { markets: settledMarkets, isLoading, error };
}

/**
 * Hook para buscar owner do contrato
 */
export function useContractOwner() {
  const [owner, setOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/owner`);
        const data = await response.json();
        
        if (data.success) {
          setOwner(data.data.owner.toLowerCase());
        }
      } catch (err) {
        console.error('Erro ao buscar owner:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, []);

  return { owner, isLoading };
}

/**
 * Hook para criar mercado via backend
 */
export function useCreateMarket() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarket = async (
    startTime: number,
    outcomesCount: number,
    homeTeam: string,
    awayTeam: string,
    league: string
  ) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/admin/create-market`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime,
          outcomesCount,
          homeTeam,
          awayTeam,
          league
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar mercado');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createMarket, isCreating, error };
}
