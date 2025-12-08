// Enums para o Smart Contract BettingPool.sol
// Mapeamento dos enums do Solidity para o TypeScript

export enum BetOutcome {
    NONE,
    TEAM_A_WINS,
    DRAW,
    TEAM_B_WINS
}

export enum MatchStatus {
    PENDING,
    FINISHED,
    CANCELLED
}

export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
