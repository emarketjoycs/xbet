// shared/matchConfig.ts

/**
 * Lista de times autorizados para criação automática de partidas.
 * A API deve buscar partidas que contenham pelo menos um desses times.
 */
export const AUTHORIZED_TEAMS = [
  "Flamengo",
  "Vasco",
  "Corinthians",
  "Palmeiras",
  "São Paulo",
  "Santos",
  "Grêmio",
  "Internacional",
  "Cruzeiro",
  "Atlético-MG",
  "Botafogo",
  "Fluminense",
  "Bahia",
  "Fortaleza",
  "Athletico-PR",
  "Red Bull Bragantino",
];

/**
 * Lista de times que devem ser destacados na página "Jogos".
 */
export const FEATURED_TEAMS = [
  "Flamengo",
  "Corinthians",
  "Palmeiras",
  "São Paulo",
];

/**
 * Simulação de Campeonatos disponíveis para filtro.
 */
export const AVAILABLE_LEAGUES = [
  "Brasileirão Série A",
  "Copa do Brasil",
  "Libertadores",
  "Copa Sul-Americana",
  "Premier League",
  "La Liga",
];
