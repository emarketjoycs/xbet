const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BettingPool", function () {
  let bettingPool;
  let usdcToken;
  let owner;
  let addr1;
  let addr2;
  let houseWallet;
  
  const USDC_DECIMALS = 6;
  const parseUSDC = (amount) => ethers.parseUnits(amount.toString(), USDC_DECIMALS);
  const formatUSDC = (amount) => ethers.formatUnits(amount, USDC_DECIMALS);

  beforeEach(async function () {
    [owner, addr1, addr2, houseWallet] = await ethers.getSigners();

    // Deploy mock USDC token
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdcToken = await MockUSDC.deploy();
    await usdcToken.waitForDeployment();

    // Distribuir USDC para testes
    await usdcToken.mint(addr1.address, parseUSDC(10000));
    await usdcToken.mint(addr2.address, parseUSDC(10000));

    // Deploy BettingPool
    const BettingPool = await ethers.getContractFactory("BettingPool");
    bettingPool = await BettingPool.deploy(
      await usdcToken.getAddress(),
      houseWallet.address
    );
    await bettingPool.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct USDC token address", async function () {
      expect(await bettingPool.usdcToken()).to.equal(await usdcToken.getAddress());
    });

    it("Should set the correct house wallet", async function () {
      expect(await bettingPool.houseWallet()).to.equal(houseWallet.address);
    });
  });

  describe("Match Creation", function () {
    it("Should create a match", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      
      await expect(
        bettingPool.createMatch("Santos", "Corinthians", startTime)
      ).to.emit(bettingPool, "MatchCreated");

      const match = await bettingPool.getMatch(1);
      expect(match.homeTeam).to.equal("Santos");
      expect(match.awayTeam).to.equal("Corinthians");
      expect(match.status).to.equal(0); // PENDING
    });

    it("Should not allow creating match in the past", async function () {
      const startTime = Math.floor(Date.now() / 1000) - 1000;
      
      await expect(
        bettingPool.createMatch("Santos", "Corinthians", startTime)
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should not allow non-owner to create match", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 86400;
      
      await expect(
        bettingPool.connect(addr1).createMatch("Santos", "Corinthians", startTime)
      ).to.be.revertedWithCustomError(bettingPool, "OwnableUnauthorizedAccount");
    });
  });

  describe("Betting", function () {
    let matchId;
    const startTime = Math.floor(Date.now() / 1000) + 86400;

    beforeEach(async function () {
      await bettingPool.createMatch("Santos", "Corinthians", startTime);
      matchId = 1;

      // Approve USDC spending
      await usdcToken.connect(addr1).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );
      await usdcToken.connect(addr2).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );
    });

    it("Should place a bet", async function () {
      const amount = parseUSDC(100);
      const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

      await expect(
        bettingPool.connect(addr1).placeBet(matchId, BetOutcome.TEAM_A_WINS, amount)
      ).to.emit(bettingPool, "BetPlaced");

      const bet = await bettingPool.getBet(1);
      expect(bet.player).to.equal(addr1.address);
      expect(bet.amount).to.equal(amount);
      expect(bet.outcome).to.equal(BetOutcome.TEAM_A_WINS);
    });

    it("Should calculate odds correctly", async function () {
      const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

      // addr1 aposta 1000 em Time A
      await bettingPool.connect(addr1).placeBet(
        matchId,
        BetOutcome.TEAM_A_WINS,
        parseUSDC(1000)
      );

      // addr2 aposta 500 em Empate
      await bettingPool.connect(addr2).placeBet(
        matchId,
        BetOutcome.DRAW,
        parseUSDC(500)
      );

      const [oddsTeamA, oddsDraw, oddsTeamB] = await bettingPool.getOdds(matchId);

      // Total = 1500
      // Odds Time A = 1500 / 1000 = 1.5 (150 com 2 decimais)
      // Odds Empate = 1500 / 500 = 3.0 (300 com 2 decimais)
      expect(oddsTeamA).to.equal(150); // 1.5x
      expect(oddsDraw).to.equal(300); // 3.0x
      expect(oddsTeamB).to.equal(0); // Ninguém apostou
    });

    it("Should not allow betting after match starts", async function () {
      const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

      // Avançar tempo para após o início da partida
      await ethers.provider.send("hardhat_mine", ["0x15180"]); // Avançar ~1 dia

      await expect(
        bettingPool.connect(addr1).placeBet(
          matchId,
          BetOutcome.TEAM_A_WINS,
          parseUSDC(100)
        )
      ).to.be.revertedWith("Match already started");
    });
  });

  describe("Match Results and Winnings", function () {
    let matchId;
    const startTime = Math.floor(Date.now() / 1000) + 86400;
    const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

    beforeEach(async function () {
      await bettingPool.createMatch("Santos", "Corinthians", startTime);
      matchId = 1;

      // Approve USDC
      await usdcToken.connect(addr1).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );
      await usdcToken.connect(addr2).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );

      // Place bets
      await bettingPool.connect(addr1).placeBet(
        matchId,
        BetOutcome.TEAM_A_WINS,
        parseUSDC(1000)
      );
      await bettingPool.connect(addr2).placeBet(
        matchId,
        BetOutcome.DRAW,
        parseUSDC(500)
      );
    });

    it("Should set match result", async function () {
      await expect(
        bettingPool.setMatchResult(matchId, BetOutcome.TEAM_A_WINS)
      ).to.emit(bettingPool, "MatchResultSet");

      const match = await bettingPool.getMatch(matchId);
      expect(match.result).to.equal(BetOutcome.TEAM_A_WINS);
      expect(match.status).to.equal(1); // FINISHED
    });

    it("Should calculate winnings correctly with 2% house fee", async function () {
      // Total = 1500
      // addr1 apostou 1000 em Time A
      // Odds Time A = 1500 / 1000 = 1.5x
      // Ganho bruto = 1000 * 1.5 = 1500
      // Lucro = 1500 - 1000 = 500
      // Taxa da casa (2%) = 500 * 0.02 = 10
      // Ganho líquido = 1500 - 10 = 1490

      await bettingPool.setMatchResult(matchId, BetOutcome.TEAM_A_WINS);

      // Claim winnings
      await bettingPool.connect(addr1).claimWinnings(1);

      // Verificar saldo pendente
      const balance = await bettingPool.userPendingBalance(addr1.address);
      expect(balance).to.equal(parseUSDC(1490)); // 1490 USDC

      // Verificar taxa da casa
      const houseFee = await bettingPool.housePendingBalance();
      expect(houseFee).to.equal(parseUSDC(10)); // 10 USDC
    });

    it("Should refund bet if match is cancelled", async function () {
      await bettingPool.cancelMatch(matchId);

      await bettingPool.connect(addr1).claimWinnings(1);

      const balance = await bettingPool.userPendingBalance(addr1.address);
      expect(balance).to.equal(parseUSDC(1000)); // Reembolso total
    });

    it("Should not allow claiming if bet lost", async function () {
      await bettingPool.setMatchResult(matchId, BetOutcome.DRAW);

      await expect(
        bettingPool.connect(addr1).claimWinnings(1)
      ).to.be.revertedWith("Bet lost");
    });
  });

  describe("Withdrawals", function () {
    let matchId;
    const startTime = Math.floor(Date.now() / 1000) + 86400;
    const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

    beforeEach(async function () {
      await bettingPool.createMatch("Santos", "Corinthians", startTime);
      matchId = 1;

      await usdcToken.connect(addr1).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );

      await bettingPool.connect(addr1).placeBet(
        matchId,
        BetOutcome.TEAM_A_WINS,
        parseUSDC(1000)
      );

      await bettingPool.setMatchResult(matchId, BetOutcome.TEAM_A_WINS);
      await bettingPool.connect(addr1).claimWinnings(1);
    });

    it("Should allow user to withdraw winnings", async function () {
      const balanceBefore = await usdcToken.balanceOf(addr1.address);

      await bettingPool.connect(addr1).withdraw();

      const balanceAfter = await usdcToken.balanceOf(addr1.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should allow house to withdraw fees", async function () {
      const balanceBefore = await usdcToken.balanceOf(houseWallet.address);

      await bettingPool.connect(houseWallet).withdrawHouseFees();

      const balanceAfter = await usdcToken.balanceOf(houseWallet.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should not allow non-house to withdraw house fees", async function () {
      await expect(
        bettingPool.connect(addr1).withdrawHouseFees()
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Pausable", function () {
    it("Should pause contract", async function () {
      await bettingPool.pause();
      expect(await bettingPool.paused()).to.be.true;
    });

    it("Should not allow betting when paused", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 86400;
      await bettingPool.createMatch("Santos", "Corinthians", startTime);

      await usdcToken.connect(addr1).approve(
        await bettingPool.getAddress(),
        parseUSDC(10000)
      );

      await bettingPool.pause();

      const BetOutcome = { NONE: 0, TEAM_A_WINS: 1, DRAW: 2, TEAM_B_WINS: 3 };

      await expect(
        bettingPool.connect(addr1).placeBet(1, BetOutcome.TEAM_A_WINS, parseUSDC(100))
      ).to.be.revertedWithCustomError(bettingPool, "EnforcedPause");
    });
  });
});
