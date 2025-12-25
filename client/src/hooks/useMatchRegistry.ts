import { useState, useEffect } from 'react';

/**
 * Interface para registro de partida no histórico
 */
export interface MatchRegistryEntry {
  matchKey: string;          // Chave única: "time1_vs_time2_campeonato_data"
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: Date;
  createdAt: Date;           // Quando foi criada no sistema
  contractMatchId?: number;  // ID da partida no contrato (se já foi criada)
  status: 'pending' | 'created' | 'finished';
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
export const generateMatchKey = (
  homeTeam: string,
  awayTeam: string,
  league: string,
  startTime: Date
): string => {
  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);
  const normalizedLeague = normalizeTeamName(league);
  const dateKey = startTime.toISOString().split('T')[0]; // YYYY-MM-DD

  return `${normalizedHome}_vs_${normalizedAway}_${normalizedLeague}_${dateKey}`;
};

/**
 * Hook para gerenciar o registro de partidas criadas e evitar duplicatas
 */
export function useMatchRegistry() {
  const [registry, setRegistry] = useState<Map<string, MatchRegistryEntry>>(() => {
    // Carrega o registro do localStorage
    const saved = localStorage.getItem('matchRegistry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const map = new Map<string, MatchRegistryEntry>();
        
        // Converte datas de string para Date
        for (const [key, entry] of Object.entries(parsed)) {
          const typedEntry = entry as any;
          map.set(key, {
            ...typedEntry,
            startTime: new Date(typedEntry.startTime),
            createdAt: new Date(typedEntry.createdAt),
          });
        }
        
        return map;
      } catch (err) {
        console.error('Error loading match registry:', err);
      }
    }
    return new Map();
  });

  // Salva o registro no localStorage sempre que mudar
  useEffect(() => {
    const registryObj = Object.fromEntries(registry);
    localStorage.setItem('matchRegistry', JSON.stringify(registryObj));
  }, [registry]);

  /**
   * Verifica se uma partida já existe no registro
   */
  const isMatchRegistered = (
    homeTeam: string,
    awayTeam: string,
    league: string,
    startTime: Date
  ): boolean => {
    const key = generateMatchKey(homeTeam, awayTeam, league, startTime);
    return registry.has(key);
  };

  /**
   * Registra uma nova partida
   */
  const registerMatch = (
    homeTeam: string,
    awayTeam: string,
    league: string,
    startTime: Date,
    contractMatchId?: number
  ): string => {
    const key = generateMatchKey(homeTeam, awayTeam, league, startTime);

    if (registry.has(key)) {
      console.warn(`Match already registered: ${key}`);
      return key;
    }

    const entry: MatchRegistryEntry = {
      matchKey: key,
      homeTeam,
      awayTeam,
      league,
      startTime,
      createdAt: new Date(),
      contractMatchId,
      status: contractMatchId ? 'created' : 'pending',
    };

    setRegistry(prev => new Map(prev).set(key, entry));
    console.log(`Match registered: ${key}`);
    return key;
  };

  /**
   * Atualiza o status de uma partida
   */
  const updateMatchStatus = (
    matchKey: string,
    status: 'pending' | 'created' | 'finished',
    contractMatchId?: number
  ): void => {
    const entry = registry.get(matchKey);
    if (!entry) {
      console.warn(`Match not found in registry: ${matchKey}`);
      return;
    }

    const updatedEntry: MatchRegistryEntry = {
      ...entry,
      status,
      contractMatchId: contractMatchId ?? entry.contractMatchId,
    };

    setRegistry(prev => new Map(prev).set(matchKey, updatedEntry));
    console.log(`Match status updated: ${matchKey} -> ${status}`);
  };

  /**
   * Remove partidas antigas do registro (mais de 30 dias)
   */
  const cleanupOldMatches = (): void => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newRegistry = new Map(registry);
    let removedCount = 0;

    for (const [key, entry] of registry) {
      if (entry.startTime < thirtyDaysAgo && entry.status === 'finished') {
        newRegistry.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      setRegistry(newRegistry);
      console.log(`Cleaned up ${removedCount} old matches from registry`);
    }
  };

  /**
   * Obtém todas as partidas registradas
   */
  const getAllMatches = (): MatchRegistryEntry[] => {
    return Array.from(registry.values());
  };

  /**
   * Obtém uma partida específica pelo matchKey
   */
  const getMatch = (matchKey: string): MatchRegistryEntry | undefined => {
    return registry.get(matchKey);
  };

  /**
   * Limpa todo o registro (usar com cuidado!)
   */
  const clearRegistry = (): void => {
    setRegistry(new Map());
    localStorage.removeItem('matchRegistry');
    console.log('Match registry cleared');
  };

  return {
    isMatchRegistered,
    registerMatch,
    updateMatchStatus,
    cleanupOldMatches,
    getAllMatches,
    getMatch,
    clearRegistry,
    registrySize: registry.size,
  };
}
