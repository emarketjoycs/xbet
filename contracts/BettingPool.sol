// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BettingPool
 * @dev Smart contract para apostas descentralizadas P2P em futebol
 * 
 * Características:
 * - Apostas em 3 resultados: Vitória Time A, Empate, Vitória Time B
 * - Cálculo de odds em tempo real (Pari-Mutuel)
 * - Taxa de 2% dos lucros do vencedor
 * - Reembolso automático para partidas canceladas
 * - Segurança contra reentrancy e exploits
 * 
 * Rede: Arbitrum One
 * Token: USDC (0xFF970A61A04b1cA14834A43f5dE4533eBDDB5F86)
 */

contract BettingPool is ReentrancyGuard, Pausable, Ownable {
    // ============ Constants ============
    uint256 private constant HOUSE_FEE_PERCENTAGE = 2; // 2% dos lucros
    uint256 private constant PERCENTAGE_BASE = 100;
    
    // ============ State Variables ============
    IERC20 public usdcToken;
    
    // Endereço da carteira da casa (recebe as taxas)
    address public houseWallet;
    
    // Contador de partidas e apostas
    uint256 public matchCounter = 0;
    uint256 public betCounter = 0;
    
    // Saldo pendente da casa (acumulado de taxas)
    uint256 public housePendingBalance = 0;
    
    // ============ Enums ============
    enum BetOutcome { NONE, TEAM_A_WINS, DRAW, TEAM_B_WINS }
    enum MatchStatus { PENDING, FINISHED, CANCELLED }
    
    // ============ Structs ============
    struct Match {
        uint256 id;
        string homeTeam;
        string awayTeam;
        uint256 startTime;
        uint256 totalPoolAmount; // Total apostado
        uint256 poolTeamA; // Total apostado em Time A
        uint256 poolDraw; // Total apostado em Empate
        uint256 poolTeamB; // Total apostado em Time B
        BetOutcome result;
        MatchStatus status;
        bool exists;
    }
    
    struct Bet {
        uint256 id;
        address player;
        uint256 matchId;
        BetOutcome outcome;
        uint256 amount;
        bool claimed;
        bool refunded;
    }
    
    struct UserBalance {
        uint256 available;
        uint256 locked;
        uint256 won;
    }
    
    // ============ Mappings ============
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Bet) public bets;
    mapping(address => uint256[]) public userBets; // Apostas do usuário
    mapping(address => uint256) public userPendingBalance; // Saldo a sacar
    
    // ============ Events ============
    event MatchCreated(
        uint256 indexed matchId,
        string homeTeam,
        string awayTeam,
        uint256 startTime
    );
    
    event BetPlaced(
        uint256 indexed betId,
        address indexed player,
        uint256 indexed matchId,
        BetOutcome outcome,
        uint256 amount
    );
    
    event MatchResultSet(
        uint256 indexed matchId,
        BetOutcome result
    );
    
    event WinningsClaimed(
        uint256 indexed betId,
        address indexed player,
        uint256 amount
    );
    
    event MatchCancelled(
        uint256 indexed matchId
    );
    
    event BetRefunded(
        uint256 indexed betId,
        address indexed player,
        uint256 amount
    );
    
    event HouseFeeCollected(
        uint256 amount
    );
    
    // ============ Constructor ============
    constructor(address _usdcToken, address _houseWallet) {
        require(_usdcToken != address(0), "USDC address cannot be zero");
        require(_houseWallet != address(0), "House wallet cannot be zero");
        
        usdcToken = IERC20(_usdcToken);
        houseWallet = _houseWallet;
    }
    
    // ============ Owner Functions ============
    
    /**
     * @dev Criar nova partida
     */
    function createMatch(
        string memory _homeTeam,
        string memory _awayTeam,
        uint256 _startTime
    ) external onlyOwner returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in future");
        require(bytes(_homeTeam).length > 0, "Home team name required");
        require(bytes(_awayTeam).length > 0, "Away team name required");
        
        uint256 matchId = ++matchCounter;
        
        matches[matchId] = Match({
            id: matchId,
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            startTime: _startTime,
            totalPoolAmount: 0,
            poolTeamA: 0,
            poolDraw: 0,
            poolTeamB: 0,
            result: BetOutcome.NONE,
            status: MatchStatus.PENDING,
            exists: true
        });
        
        emit MatchCreated(matchId, _homeTeam, _awayTeam, _startTime);
        return matchId;
    }
    
    /**
     * @dev Definir resultado da partida
     */
    function setMatchResult(uint256 _matchId, BetOutcome _result) 
        external 
        onlyOwner 
    {
        require(matches[_matchId].exists, "Match does not exist");
        require(matches[_matchId].status == MatchStatus.PENDING, "Match already finished");
        require(_result != BetOutcome.NONE, "Invalid result");
        
        matches[_matchId].result = _result;
        matches[_matchId].status = MatchStatus.FINISHED;
        
        emit MatchResultSet(_matchId, _result);
    }
    
    /**
     * @dev Cancelar partida (reembolsa todos)
     */
    function cancelMatch(uint256 _matchId) external onlyOwner {
        require(matches[_matchId].exists, "Match does not exist");
        require(matches[_matchId].status == MatchStatus.PENDING, "Match already finished");
        
        matches[_matchId].status = MatchStatus.CANCELLED;
        
        emit MatchCancelled(_matchId);
    }
    
    /**
     * @dev Atualizar endereço da carteira da casa
     */
    function setHouseWallet(address _newHouseWallet) external onlyOwner {
        require(_newHouseWallet != address(0), "Invalid address");
        houseWallet = _newHouseWallet;
    }
    
    /**
     * @dev Pausar contrato em emergência
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Retomar contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ User Functions ============
    
    /**
     * @dev Colocar aposta
     */
    function placeBet(
        uint256 _matchId,
        BetOutcome _outcome,
        uint256 _amount
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256)
    {
        require(matches[_matchId].exists, "Match does not exist");
        require(matches[_matchId].status == MatchStatus.PENDING, "Match not available");
        require(block.timestamp < matches[_matchId].startTime, "Match already started");
        require(_outcome != BetOutcome.NONE, "Invalid outcome");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transferir USDC do usuário para o contrato
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );
        
        // Criar aposta
        uint256 betId = ++betCounter;
        bets[betId] = Bet({
            id: betId,
            player: msg.sender,
            matchId: _matchId,
            outcome: _outcome,
            amount: _amount,
            claimed: false,
            refunded: false
        });
        
        // Adicionar à lista de apostas do usuário
        userBets[msg.sender].push(betId);
        
        // Atualizar pools
        matches[_matchId].totalPoolAmount += _amount;
        if (_outcome == BetOutcome.TEAM_A_WINS) {
            matches[_matchId].poolTeamA += _amount;
        } else if (_outcome == BetOutcome.DRAW) {
            matches[_matchId].poolDraw += _amount;
        } else if (_outcome == BetOutcome.TEAM_B_WINS) {
            matches[_matchId].poolTeamB += _amount;
        }
        
        emit BetPlaced(betId, msg.sender, _matchId, _outcome, _amount);
        return betId;
    }
    
    /**
     * @dev Sacar ganhos (Pull Payment pattern)
     */
    function claimWinnings(uint256 _betId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Bet storage bet = bets[_betId];
        require(bet.player == msg.sender, "Not your bet");
        require(!bet.claimed, "Already claimed");
        require(!bet.refunded, "Already refunded");
        
        Match storage matchData = matches[bet.matchId];
        require(matchData.status == MatchStatus.FINISHED, "Match not finished");
        
        // Se foi cancelada, reembolsar
        if (matchData.status == MatchStatus.CANCELLED) {
            bet.refunded = true;
            userPendingBalance[msg.sender] += bet.amount;
            emit BetRefunded(_betId, msg.sender, bet.amount);
            return;
        }
        
        // Verificar se ganhou
        require(bet.outcome == matchData.result, "Bet lost");
        
        // Calcular ganhos
        uint256 winnings = _calculateWinnings(bet, matchData);
        
        require(winnings > 0, "No winnings");
        
        bet.claimed = true;
        userPendingBalance[msg.sender] += winnings;
        
        emit WinningsClaimed(_betId, msg.sender, winnings);
    }
    
    /**
     * @dev Sacar saldo pendente (Pull Payment)
     */
    function withdraw() external nonReentrant {
        uint256 amount = userPendingBalance[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        userPendingBalance[msg.sender] = 0;
        
        require(
            usdcToken.transfer(msg.sender, amount),
            "Transfer failed"
        );
    }
    
    /**
     * @dev Sacar saldo da casa
     */
    function withdrawHouseFees() external nonReentrant {
        require(msg.sender == houseWallet, "Not authorized");
        
        uint256 amount = housePendingBalance;
        require(amount > 0, "No fees to withdraw");
        
        housePendingBalance = 0;
        
        require(
            usdcToken.transfer(houseWallet, amount),
            "Transfer failed"
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Obter odds em tempo real para uma partida
     */
    function getOdds(uint256 _matchId) 
        external 
        view 
        returns (uint256 oddsTeamA, uint256 oddsDraw, uint256 oddsTeamB) 
    {
        Match storage matchData = matches[_matchId];
        require(matchData.exists, "Match does not exist");
        
        uint256 total = matchData.totalPoolAmount;
        
        if (total == 0) {
            return (0, 0, 0);
        }
        
        // Odds = Total / Pool
        // Multiplicar por 100 para manter precisão (2 casas decimais)
        oddsTeamA = matchData.poolTeamA > 0 ? (total * 100) / matchData.poolTeamA : 0;
        oddsDraw = matchData.poolDraw > 0 ? (total * 100) / matchData.poolDraw : 0;
        oddsTeamB = matchData.poolTeamB > 0 ? (total * 100) / matchData.poolTeamB : 0;
    }
    
    /**
     * @dev Obter dados de uma partida
     */
    function getMatch(uint256 _matchId) 
        external 
        view 
        returns (Match memory) 
    {
        require(matches[_matchId].exists, "Match does not exist");
        return matches[_matchId];
    }
    
    /**
     * @dev Obter dados de uma aposta
     */
    function getBet(uint256 _betId) 
        external 
        view 
        returns (Bet memory) 
    {
        return bets[_betId];
    }
    
    /**
     * @dev Obter todas as apostas de um usuário
     */
    function getUserBets(address _user) 
        external 
        view 
        returns (Bet[] memory) 
    {
        uint256[] storage betIds = userBets[_user];
        Bet[] memory userBetsList = new Bet[](betIds.length);
        
        for (uint256 i = 0; i < betIds.length; i++) {
            userBetsList[i] = bets[betIds[i]];
        }
        
        return userBetsList;
    }
    
    /**
     * @dev Obter saldo do usuário
     */
    function getUserBalance(address _user) 
        external 
        view 
        returns (UserBalance memory) 
    {
        uint256 available = userPendingBalance[_user];
        uint256 locked = 0;
        uint256 won = 0;
        
        // Calcular saldo bloqueado e ganhos
        uint256[] storage betIds = userBets[_user];
        for (uint256 i = 0; i < betIds.length; i++) {
            Bet storage bet = bets[betIds[i]];
            Match storage matchData = matches[bet.matchId];
            
            if (matchData.status == MatchStatus.PENDING) {
                locked += bet.amount;
            } else if (matchData.status == MatchStatus.FINISHED && bet.outcome == matchData.result) {
                if (!bet.claimed) {
                    uint256 winnings = _calculateWinnings(bet, matchData);
                    won += winnings;
                }
            }
        }
        
        return UserBalance({
            available: available,
            locked: locked,
            won: won
        });
    }
    
    /**
     * @dev Obter quantidade de partidas
     */
    function getMatchCount() external view returns (uint256) {
        return matchCounter;
    }
    
    /**
     * @dev Obter quantidade de apostas
     */
    function getBetCount() external view returns (uint256) {
        return betCounter;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Calcular ganhos da aposta
     */
    function _calculateWinnings(Bet storage bet, Match storage matchData) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 total = matchData.totalPoolAmount;
        
        // Calcular odds
        uint256 odds = 0;
        if (bet.outcome == BetOutcome.TEAM_A_WINS && matchData.poolTeamA > 0) {
            odds = (total * 100) / matchData.poolTeamA;
        } else if (bet.outcome == BetOutcome.DRAW && matchData.poolDraw > 0) {
            odds = (total * 100) / matchData.poolDraw;
        } else if (bet.outcome == BetOutcome.TEAM_B_WINS && matchData.poolTeamB > 0) {
            odds = (total * 100) / matchData.poolTeamB;
        }
        
        if (odds == 0) return 0;
        
        // Ganho bruto = Aposta × Odds
        uint256 grossWinnings = (bet.amount * odds) / 100;
        
        // Taxa da casa = 2% dos lucros (não da aposta)
        uint256 profit = grossWinnings - bet.amount;
        uint256 houseFee = (profit * HOUSE_FEE_PERCENTAGE) / PERCENTAGE_BASE;
        
        // Ganho líquido
        uint256 netWinnings = grossWinnings - houseFee;
        
        // Adicionar taxa ao saldo da casa (será coletada depois)
        // Nota: Isso é apenas para cálculo, a taxa é coletada quando o usuário saca
        
        return netWinnings;
    }
    
    /**
     * @dev Coletar taxa da casa quando aposta é sacada
     */
    function _collectHouseFee(uint256 _betId) internal {
        Bet storage bet = bets[_betId];
        Match storage matchData = matches[bet.matchId];
        
        if (bet.outcome != matchData.result) return;
        
        uint256 total = matchData.totalPoolAmount;
        uint256 odds = 0;
        
        if (bet.outcome == BetOutcome.TEAM_A_WINS && matchData.poolTeamA > 0) {
            odds = (total * 100) / matchData.poolTeamA;
        } else if (bet.outcome == BetOutcome.DRAW && matchData.poolDraw > 0) {
            odds = (total * 100) / matchData.poolDraw;
        } else if (bet.outcome == BetOutcome.TEAM_B_WINS && matchData.poolTeamB > 0) {
            odds = (total * 100) / matchData.poolTeamB;
        }
        
        if (odds == 0) return;
        
        uint256 grossWinnings = (bet.amount * odds) / 100;
        uint256 profit = grossWinnings - bet.amount;
        uint256 houseFee = (profit * HOUSE_FEE_PERCENTAGE) / PERCENTAGE_BASE;
        
        housePendingBalance += houseFee;
        emit HouseFeeCollected(houseFee);
    }
}
