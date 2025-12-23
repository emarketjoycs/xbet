import axios from 'axios';
import { config } from '../config/config.js';

/**
 * Serviço para integração com API-Sports.io
 */
class ApiSportsService {
  constructor() {
    this.baseUrl = config.apiSports.baseUrl;
    this.apiKey = config.apiSports.key;
    this.headers = {
      'x-apisports-key': this.apiKey
    };
  }

  /**
   * Busca partidas futuras de uma liga específica
   * @param {string} leagueId - ID da liga (ex: 71 para Brasileirão)
   * @param {string} season - Ano da temporada (ex: 2024)
   * @returns {Promise<Array>} Lista de partidas
   */
  async getFutureMatches(leagueId, season) {
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures`, {
        headers: this.headers,
        params: {
          league: leagueId,
          season: season,
          status: 'NS', // Not Started
          timezone: 'America/Sao_Paulo'
        }
      });

      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.response.map(fixture => ({
        id: fixture.fixture.id,
        date: fixture.fixture.date,
        timestamp: fixture.fixture.timestamp,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        leagueId: fixture.league.id,
        status: fixture.fixture.status.short,
        venue: fixture.fixture.venue?.name || 'TBD'
      }));
    } catch (error) {
      console.error('Erro ao buscar partidas futuras:', error.message);
      throw error;
    }
  }

  /**
   * Busca odds pré-jogo de uma partida
   * @param {number} fixtureId - ID da partida
   * @returns {Promise<Object>} Odds da partida
   */
  async getMatchOdds(fixtureId) {
    try {
      const response = await axios.get(`${this.baseUrl}/odds`, {
        headers: this.headers,
        params: {
          fixture: fixtureId,
          bet: 1 // Bet ID 1 = Match Winner (Home/Draw/Away)
        }
      });

      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
      }

      if (!response.data.response || response.data.response.length === 0) {
        return null;
      }

      const fixture = response.data.response[0];
      const bookmakers = fixture.bookmakers;

      if (!bookmakers || bookmakers.length === 0) {
        return null;
      }

      // Calcular média das odds de todos os bookmakers
      let homeOddsSum = 0;
      let drawOddsSum = 0;
      let awayOddsSum = 0;
      let count = 0;

      bookmakers.forEach(bookmaker => {
        const bets = bookmaker.bets.find(bet => bet.id === 1);
        if (bets && bets.values) {
          const home = bets.values.find(v => v.value === 'Home');
          const draw = bets.values.find(v => v.value === 'Draw');
          const away = bets.values.find(v => v.value === 'Away');

          if (home && draw && away) {
            homeOddsSum += parseFloat(home.odd);
            drawOddsSum += parseFloat(draw.odd);
            awayOddsSum += parseFloat(away.odd);
            count++;
          }
        }
      });

      if (count === 0) {
        return null;
      }

      return {
        home: homeOddsSum / count,
        draw: drawOddsSum / count,
        away: awayOddsSum / count,
        bookmakerCount: count
      };
    } catch (error) {
      console.error('Erro ao buscar odds:', error.message);
      return null;
    }
  }

  /**
   * Verifica o resultado de uma partida finalizada
   * @param {number} fixtureId - ID da partida
   * @returns {Promise<Object|null>} Resultado da partida ou null se não finalizada
   */
  async getMatchResult(fixtureId) {
    try {
      const response = await axios.get(`${this.baseUrl}/fixtures`, {
        headers: this.headers,
        params: {
          id: fixtureId
        }
      });

      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
      }

      if (!response.data.response || response.data.response.length === 0) {
        return null;
      }

      const fixture = response.data.response[0];
      const status = fixture.fixture.status.short;

      // Verificar se a partida foi finalizada
      if (status !== 'FT' && status !== 'AET' && status !== 'PEN') {
        return {
          finished: false,
          status: status
        };
      }

      const homeGoals = fixture.goals.home;
      const awayGoals = fixture.goals.away;

      let outcome;
      if (homeGoals > awayGoals) {
        outcome = 'home'; // Time da casa venceu
      } else if (homeGoals < awayGoals) {
        outcome = 'away'; // Time visitante venceu
      } else {
        outcome = 'draw'; // Empate
      }

      return {
        finished: true,
        status: status,
        homeGoals: homeGoals,
        awayGoals: awayGoals,
        outcome: outcome,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name
      };
    } catch (error) {
      console.error('Erro ao buscar resultado:', error.message);
      throw error;
    }
  }

  /**
   * Busca partidas de hoje
   * @returns {Promise<Array>} Lista de partidas de hoje
   */
  async getTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await axios.get(`${this.baseUrl}/fixtures`, {
        headers: this.headers,
        params: {
          date: today,
          timezone: 'America/Sao_Paulo'
        }
      });

      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new Error(`API-Sports Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.response.map(fixture => ({
        id: fixture.fixture.id,
        date: fixture.fixture.date,
        timestamp: fixture.fixture.timestamp,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        status: fixture.fixture.status.short,
        homeGoals: fixture.goals.home,
        awayGoals: fixture.goals.away
      }));
    } catch (error) {
      console.error('Erro ao buscar partidas de hoje:', error.message);
      throw error;
    }
  }
}

export default new ApiSportsService();
