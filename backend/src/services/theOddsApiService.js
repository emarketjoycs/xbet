import axios from 'axios';
import { config } from '../config/config.js';

/**
 * Serviço para integração com The Odds API
 */
class TheOddsApiService {
  constructor() {
    this.baseUrl = config.theOddsApi.baseUrl;
    this.apiKey = config.theOddsApi.key;
  }

  /**
   * Busca odds de uma partida específica
   * @param {string} sport - Esporte (ex: 'soccer_brazil_campeonato')
   * @returns {Promise<Array>} Lista de partidas com odds
   */
  async getOdds(sport = 'soccer_brazil_campeonato') {
    try {
      if (!this.apiKey) {
        console.warn('The Odds API key não configurada, pulando...');
        return [];
      }

      const response = await axios.get(`${this.baseUrl}/sports/${sport}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: 'us,uk,eu',
          markets: 'h2h', // Head to head (Match Winner)
          oddsFormat: 'decimal'
        }
      });

      return response.data.map(event => {
        // Calcular média das odds de todos os bookmakers
        const bookmakers = event.bookmakers;
        let homeOddsSum = 0;
        let drawOddsSum = 0;
        let awayOddsSum = 0;
        let count = 0;

        bookmakers.forEach(bookmaker => {
          const market = bookmaker.markets.find(m => m.key === 'h2h');
          if (market && market.outcomes) {
            const home = market.outcomes.find(o => o.name === event.home_team);
            const away = market.outcomes.find(o => o.name === event.away_team);
            const draw = market.outcomes.find(o => o.name === 'Draw');

            if (home && away) {
              homeOddsSum += home.price;
              awayOddsSum += away.price;
              if (draw) {
                drawOddsSum += draw.price;
              }
              count++;
            }
          }
        });

        if (count === 0) {
          return null;
        }

        return {
          id: event.id,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          commenceTime: event.commence_time,
          odds: {
            home: homeOddsSum / count,
            draw: drawOddsSum > 0 ? drawOddsSum / count : null,
            away: awayOddsSum / count
          },
          bookmakerCount: count
        };
      }).filter(event => event !== null);
    } catch (error) {
      console.error('Erro ao buscar odds (The Odds API):', error.message);
      return [];
    }
  }

  /**
   * Busca resultado de uma partida
   * @param {string} sport - Esporte
   * @param {string} eventId - ID do evento
   * @returns {Promise<Object|null>} Resultado da partida
   */
  async getMatchResult(sport, eventId) {
    try {
      if (!this.apiKey) {
        console.warn('The Odds API key não configurada, pulando...');
        return null;
      }

      const response = await axios.get(`${this.baseUrl}/sports/${sport}/scores`, {
        params: {
          apiKey: this.apiKey,
          daysFrom: 3 // Buscar resultados dos últimos 3 dias
        }
      });

      const event = response.data.find(e => e.id === eventId);

      if (!event || !event.completed) {
        return null;
      }

      const homeScore = event.scores.find(s => s.name === event.home_team);
      const awayScore = event.scores.find(s => s.name === event.away_team);

      if (!homeScore || !awayScore) {
        return null;
      }

      let outcome;
      if (homeScore.score > awayScore.score) {
        outcome = 'home';
      } else if (homeScore.score < awayScore.score) {
        outcome = 'away';
      } else {
        outcome = 'draw';
      }

      return {
        finished: true,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        homeScore: homeScore.score,
        awayScore: awayScore.score,
        outcome: outcome
      };
    } catch (error) {
      console.error('Erro ao buscar resultado (The Odds API):', error.message);
      return null;
    }
  }

  /**
   * Lista esportes disponíveis
   * @returns {Promise<Array>} Lista de esportes
   */
  async getSports() {
    try {
      if (!this.apiKey) {
        return [];
      }

      const response = await axios.get(`${this.baseUrl}/sports`, {
        params: {
          apiKey: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao listar esportes:', error.message);
      return [];
    }
  }
}

export default new TheOddsApiService();
