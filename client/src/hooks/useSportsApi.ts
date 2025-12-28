import { useState, useEffect } from 'react';

// Funções de cálculo de pool
const oddToProbability = (odd: number): number => 1 / odd;

export const calculateInitialPools = (
  odds: { oddsHome: number; oddsDraw: number; oddsAway: number },
  seedAmount: number
): { initialPoolHome: number; initialPoolDraw: number; initialPoolAway: number } => {
  const probHome = oddToProbability(odds.oddsHome);
  const probDraw = oddToProbability(odds.oddsDraw);
  const probAway = oddToProbability(odds.oddsAway);

  const totalProb = probHome + probDraw + probAway;
  const normalizedProbHome = probHome / totalProb;
  const normalizedProbDraw = probDraw / totalProb;
  const normalizedProbAway = probAway / totalProb;

  const poolHome = seedAmount * normalizedProbHome;
  const poolDraw = seedAmount * normalizedProbDraw;
  const poolAway = seedAmount * normalizedProbAway;

  return {
    initialPoolHome: poolHome,
    initialPoolDraw: poolDraw,
    initialPoolAway: poolAway,
  };
};
