import { BetOutcome } from '@shared/const';

// Constantes de Limite
const MIN_BET_PERCENTAGE = 0.0075; // 0.75%
const MAX_BET_PERCENTAGE = 0.15; // 15%
const MAX_BET_PRE_VALIDATION = 10.00; // 10% da Seed Virtual de 100 USDC = 10 USDC

/**
 * Calcula a aposta mínima para um determinado resultado.
 * Aposta mínima = 0,75% do pool do resultado.
 * @param poolResult - O valor atual do pool para o resultado (Time A, Empate ou Time B).
 * @returns O valor mínimo de aposta.
 */
export const calculateMinBet = (poolResult: number): number => {
  return poolResult * MIN_BET_PERCENTAGE;
};

/**
 * Calcula a aposta máxima no período de pré-validação (Pool não atingiu o mínimo).
 * Aposta máxima = 10% da Seed Virtual (10 USDC).
 * @returns O valor máximo de aposta (10 USDC).
 */
export const calculateMaxBetPreValidation = (): number => {
  return MAX_BET_PRE_VALIDATION;
};

/**
 * Calcula a aposta máxima para um determinado resultado.
 * Aposta máxima = 15% da soma dos pools contrários.
 * @param poolHome - O valor atual do pool para o Time da Casa.
 * @param poolDraw - O valor atual do pool para o Empate.
 * @param poolAway - O valor atual do pool para o Time Visitante.
 * @param outcome - O resultado para o qual a aposta está sendo feita (BetOutcome).
 * @returns O valor máximo de aposta.
 */
export const calculateMaxBet = (
  poolHome: number,
  poolDraw: number,
  poolAway: number,
  outcome: BetOutcome
): number => {
  let sumOppositePools = 0;

  switch (outcome) {
    case BetOutcome.Home: // Apostando no Time da Casa (Home)
      sumOppositePools = poolDraw + poolAway;
      break;
    case BetOutcome.Draw: // Apostando no Empate (Draw)
      sumOppositePools = poolHome + poolAway;
      break;
    case BetOutcome.Away: // Apostando no Time Visitante (Away)
      sumOppositePools = poolHome + poolDraw;
      break;
    default:
      return 0;
  }

  return sumOppositePools * MAX_BET_PERCENTAGE;
};

/**
 * Hook para simular a lógica de aposta.
 * Em um cenário real, os pools seriam lidos do contrato inteligente.
 * @param poolHome - Pool atual do Time da Casa.
 * @param poolDraw - Pool atual do Empate.
 * @param poolAway - Pool atual do Time Visitante.
 * @returns Funções para calcular aposta mínima e máxima.
 */
export function useBettingLogic(poolHome: number, poolDraw: number, poolAway: number, isPoolValidated: boolean) {
  
  const getMinBet = (outcome: BetOutcome): number => {
    if (!isPoolValidated) {
      // Antes da validação, a aposta mínima é 0 (qualquer valor é aceito, mas o máximo é limitado)
      return 0; 
    }
    
    switch (outcome) {
      case BetOutcome.Home:
        return calculateMinBet(poolHome);
      case BetOutcome.Draw:
        return calculateMinBet(poolDraw);
      case BetOutcome.Away:
        return calculateMinBet(poolAway);
      default:
        return 0;
    }
  };

  const getMaxBet = (outcome: BetOutcome): number => {
    if (!isPoolValidated) {
      // Se o pool não foi validado, a aposta máxima é limitada a 10 USDC (10% da Seed Virtual)
      return calculateMaxBetPreValidation();
    }
    
    return calculateMaxBet(poolHome, poolDraw, poolAway, outcome);
  };

  return {
    getMinBet,
    getMaxBet,
  };
}
