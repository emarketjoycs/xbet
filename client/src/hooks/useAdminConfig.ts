import { useState } from 'react';

export interface ApiProvider {
  name: string;
  enabled: boolean;
  envVar: string;
}

export interface AdminConfig {
  maxConcurrentMatches: number;
  virtualSeedAmount: number;
  priorityTeams: string[];
  priorityLeagues: string[];
  isAutoCreationEnabled: boolean;
  activeApiCount: number; // 1, 2, or 3
  apiProviders: ApiProvider[];
}

// Hook para gerenciar as configurações administrativas
export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(() => {
    // Tenta carregar a configuração do localStorage
    const savedConfig = localStorage.getItem('adminConfig');

    // Configuração padrão
    const defaultConfig: AdminConfig = {
      maxConcurrentMatches: 10,
      virtualSeedAmount: 100,
      priorityTeams: [],
      priorityLeagues: [],
      isAutoCreationEnabled: true,
      activeApiCount: 1,
      apiProviders: [
        { name: 'API 1', enabled: true, envVar: 'VITE_SPORTS_API_1' },
        { name: 'API 2', enabled: false, envVar: 'VITE_SPORTS_API_2' },
        { name: 'API 3', enabled: false, envVar: 'VITE_SPORTS_API_3' },
      ],
    };

    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Merge para garantir retrocompatibilidade se novas chaves forem adicionadas
      return { ...defaultConfig, ...parsed };
    }

    return defaultConfig;
  });

  // Função manual para salvar a configuração
  const saveConfig = () => {
    localStorage.setItem('adminConfig', JSON.stringify(config));
  };

  return { config, setConfig, saveConfig };
}
