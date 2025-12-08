// Definição da interface para a estrutura de dados de uma partida
export interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'Ao Vivo' | 'Em Breve' | 'Encerrado';
  poolSize: string;
  timeRemaining: string; // Tempo para encerramento da aposta
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  betCategories: ('Primeiro Tempo' | 'Segundo Tempo' | 'Jogo Todo')[];
}

// Dados mockados de partidas
export const mockMatches: Match[] = [
  {
    id: 1,
    league: "Brasileirão Série A",
    homeTeam: "Santos",
    awayTeam: "Corinthians",
    startTime: "Hoje, 21:30",
    status: "Ao Vivo",
    poolSize: "12,450 USDC",
    timeRemaining: "45min",
    odds: {
      home: 2.45,
      draw: 3.10,
      away: 2.85
    },
    betCategories: ['Jogo Todo', 'Primeiro Tempo']
  },
  {
    id: 2,
    league: "Premier League",
    homeTeam: "Manchester Utd",
    awayTeam: "Liverpool",
    startTime: "Amanhã, 16:00",
    status: "Em Breve",
    poolSize: "25,800 USDC",
    timeRemaining: "12h 30min",
    odds: {
      home: 3.50,
      draw: 3.80,
      away: 1.90
    },
    betCategories: ['Jogo Todo']
  },
  {
    id: 3,
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    startTime: "Sábado, 18:45",
    status: "Ao Vivo",
    poolSize: "40,120 USDC",
    timeRemaining: "15min",
    odds: {
      home: 1.80,
      draw: 4.00,
      away: 4.50
    },
    betCategories: ['Jogo Todo', 'Segundo Tempo']
  },
  {
    id: 4,
    league: "Copa do Brasil",
    homeTeam: "Flamengo",
    awayTeam: "Vasco",
    startTime: "Hoje, 20:00",
    status: "Em Breve",
    poolSize: "8,900 USDC",
    timeRemaining: "2h 10min",
    odds: {
      home: 1.55,
      draw: 4.20,
      away: 5.50
    },
    betCategories: ['Jogo Todo', 'Primeiro Tempo', 'Segundo Tempo']
  }
];
