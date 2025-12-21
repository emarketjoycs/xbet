import { useState } from 'react';

export interface AdminConfig {
  maxConcurrentMatches: number;
  virtualSeedAmount: number;
  priorityTeams: string[];
  priorityLeagues: string[];
  isAutoCreationEnabled: boolean;
}

// Hook para gerenciar as configurações administrativas
export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(() => {
    // Tenta carregar a configuração do localStorage
    const savedConfig = localStorage.getItem('adminConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Configuração padrão
    return {
      maxConcurrentMatches: 10,
      virtualSeedAmount: 100,
      priorityTeams: [],
      priorityLeagues: [],
      isAutoCreationEnabled: true,
    };
  });

  // Função manual para salvar a configuração
  const saveConfig = () => {
    localStorage.setItem('adminConfig', JSON.stringify(config));
  };

  return { config, setConfig, saveConfig };
}
