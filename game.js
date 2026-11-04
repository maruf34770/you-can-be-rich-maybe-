// You Can Be Rich (Maybe) — Complete Board Game Engine with smooth animations, AI bots, and 2-24 player support

class RichupGame {
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.turnCount = 1;
    this.consecutiveDoubles = 0;
    this.dice = [1, 1];
    this.diceSum = 2;
    this.isRolling = false;
    this.isMoving = false;
    this.fastSpeed = false;
    this.freeParkingPool = 0;
    this.ruleParkingPool = true;
    this.startingCash = 1500;
    this.state = "SETUP"; // SETUP, WAITING_ROLL, MOVING, ACTION_PENDING, AUCTION, WAITING_END, GAME_OVER

    // Decks
    this.surpriseDeck = [...SURPRISE_CARDS].sort(() => Math.random() - 0.5);
    this.treasureDeck = [...TREASURE_CARDS].sort(() => Math.random() - 0.5);

    // Property state: tileId -> { owner: playerIndex | null, houses: 0..5, mortgaged: bool }
    this.properties = {};
    BOARD_DATA.forEach(tile => {
      if (tile.type === "property" || tile.type === "station" || tile.type === "utility") {
        this.properties[tile.id] = {
          owner: null,
          houses: 0,
          mortgaged: false
        };
      }
    });

    // Auction State
    this.auction = {
      tileId: null,
      highestBid: 0,
      highestBidder: null,
      timer: null,
      timeLeft: 5,
      activeBidders: []
    };

    this.pendingBuyTileId = null;
    this.pendingCardAction = null;

    this.initDOM();
    this.renderLobbySlots(4);
  }

  /* ----------------- DOM Initialization & Event Listeners ----------------- */
  initDOM() {
    // Sound Toggle
    const soundBtn = document.getElementById("btn-sound-toggle");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        const muted = audio.toggleMute();
        soundBtn.innerHTML = `<span id="sound-icon">${muted ? "🔇" : "🔊"}</span> Sound: ${muted ? "OFF" : "ON"}`;
      });
    }

    // Fast Speed Toggle
    const speedBtn = document.getElementById("btn-fast-speed");
    if (speedBtn) {
      speedBtn.addEventListener("click", () => {
        this.fastSpeed = !this.fastSpeed;
        speedBtn.innerHTML = `<span>⚡</span> Speed: ${this.fastSpeed ? "Fast" : "Normal"}`;
      });
    }

    // New Game / Restart
    const restartBtn = document.getElementById("btn-restart-game");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        if (confirm("Restart game and return to lobby?")) {
          this.openSetupLobby();
        }
      });
    }

    // Lobby count buttons
    const minusBtn = document.getElementById("btn-minus-player");
    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        const count = parseInt(document.getElementById("setup-player-count-display").textContent, 10);
        if (count > 2) this.renderLobbySlots(count - 1);
      });
    }

    const plusBtn = document.getElementById("btn-plus-player");
    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        const count = parseInt(document.getElementById("setup-player-count-display").textContent, 10);
        if (count < 24) this.renderLobbySlots(count + 1);
      });
    }

    // Lobby helper buttons
    const allBotsBtn = document.getElementById("btn-all-bots");
    if (allBotsBtn) {
      allBotsBtn.addEventListener("click", () => {
        document.querySelectorAll(".setup-is-bot").forEach((select, idx) => {
          if (idx > 0) select.value = "bot";
        });
      });
    }

    const allHumansBtn = document.getElementById("btn-all-humans");
    if (allHumansBtn) {
      allHumansBtn.addEventListener("click", () => {
        document.querySelectorAll(".setup-is-bot").forEach(select => {
          select.value = "human";
        });
      });
    }

    // Start Game Button
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.startGameFromLobby();
      });
    }

    // Roll Dice Button
    const rollBtn = document.getElementById("btn-roll-dice");
    if (rollBtn) {
      rollBtn.addEventListener("click", () => {
        this.handleHumanRoll();
      });
    }

    // End Turn Button
    const endTurnBtn = document.getElementById("btn-end-turn");
    if (endTurnBtn) {
      endTurnBtn.addEventListener("click", () => {
        this.endTurn();
      });
    }

    // Open Trade Modal
    const tradeBtn = document.getElementById("btn-open-trade");
    if (tradeBtn) {
      tradeBtn.addEventListener("click", () => {
        this.openTradeModal();
      });
    }
    const closeTradeBtn = document.getElementById("btn-close-trade");
    if (closeTradeBtn) {
      closeTradeBtn.addEventListener("click", () => {
        this.closeModal("modal-trade");
      });
    }

    const targetPlayerSelect = document.getElementById("trade-target-player");
    if (targetPlayerSelect) {
      targetPlayerSelect.addEventListener("change", () => {
        this.renderTradeInventories();
      });
    }

    const submitTradeBtn = document.getElementById("btn-submit-trade");
    if (submitTradeBtn) {
      submitTradeBtn.addEventListener("click", () => {
        this.submitTradeOffer();
      });
    }

    // Open Properties Modal
    const propsBtn = document.getElementById("btn-open-props");
    if (propsBtn) {
      propsBtn.addEventListener("click", () => {
        this.openPropertiesModal(this.currentPlayerIndex);
      });
    }
    const closePropsBtn = document.getElementById("btn-close-props");
    if (closePropsBtn) {
      closePropsBtn.addEventListener("click", () => {
        this.closeModal("modal-props");
      });
    }

    // Close Property Info Modal (Read-only inspecting)
    const closeInfoBtn = document.getElementById("btn-close-info");
    if (closeInfoBtn) {
      closeInfoBtn.addEventListener("click", () => {
        this.closeModal("modal-info");
      });
    }

    // Buy Modal Buttons + Close Button
    const confirmBuyBtn = document.getElementById("btn-confirm-buy");
    if (confirmBuyBtn) {
      confirmBuyBtn.addEventListener("click", () => {
        this.buyCurrentProperty();
      });
    }

    const passAuctionBtn = document.getElementById("btn-pass-auction");
    if (passAuctionBtn) {
      passAuctionBtn.addEventListener("click", () => {
        const tileId = this.pendingBuyTileId;
        this.closeModal("modal-buy");
        if (tileId !== null) {
          this.startAuction(tileId);
        } else {
          this.finalizeTurnMovement();
        }
      });
    }

    const closeBuyBtn = document.getElementById("btn-close-buy");
    if (closeBuyBtn) {
      closeBuyBtn.addEventListener("click", () => {
        // Back button on buy popup: decline purchase and pass to auction
        const tileId = this.pendingBuyTileId;
        this.closeModal("modal-buy");
        if (tileId !== null) {
          this.logActivity(`${this.getCurrentPlayer().name} declined to buy. Passing to auction.`);
          this.startAuction(tileId);
        } else {
          this.finalizeTurnMovement();
        }
      });
    }

    // Auction Bid & Close Buttons
    const bid10Btn = document.getElementById("btn-bid-10");
    if (bid10Btn) bid10Btn.addEventListener("click", () => this.handleBid(10));
    const bid50Btn = document.getElementById("btn-bid-50");
    if (bid50Btn) bid50Btn.addEventListener("click", () => this.handleBid(50));
    const bid100Btn = document.getElementById("btn-bid-100");
    if (bid100Btn) bid100Btn.addEventListener("click", () => this.handleBid(100));

    const foldBtn = document.getElementById("btn-auction-fold");
    if (foldBtn) foldBtn.addEventListener("click", () => this.handleFold(this.currentPlayerIndex));

    const closeAuctionBtn = document.getElementById("btn-close-auction");
    if (closeAuctionBtn) {
      closeAuctionBtn.addEventListener("click", () => {
        // Human folded/closed auction modal
        this.handleFold(this.currentPlayerIndex);
      });
    }

    // Card Modal Buttons + Close Button
    const cardOkBtn = document.getElementById("btn-card-ok");
    if (cardOkBtn) {
      cardOkBtn.addEventListener("click", () => {
        this.handleCardClose();
      });
    }
    const closeCardBtn = document.getElementById("btn-close-card");
    if (closeCardBtn) {
      closeCardBtn.addEventListener("click", () => {
        this.handleCardClose();
      });
    }

    // Jail Choice Modal Buttons + Close Button
    const jailPayBtn = document.getElementById("btn-jail-pay");
    if (jailPayBtn) {
      jailPayBtn.addEventListener("click", () => {
        this.payJailFine();
      });
    }

    const jailCardBtn = document.getElementById("btn-jail-card");
    if (jailCardBtn) {
      jailCardBtn.addEventListener("click", () => {
        this.useJailFreeCard();
      });
    }

    const jailRollBtn = document.getElementById("btn-jail-roll");
    if (jailRollBtn) {
      jailRollBtn.addEventListener("click", () => {
        this.closeModal("modal-jail");
        this.handleHumanRoll(true);
      });
    }

    const closeJailBtn = document.getElementById("btn-close-jail");
    if (closeJailBtn) {
      closeJailBtn.addEventListener("click", () => {
        // Closing jail modal rolls by default
        this.closeModal("modal-jail");
        this.handleHumanRoll(true);
      });
    }

    // Victory Restart
    const victoryRestartBtn = document.getElementById("btn-victory-restart");
    if (victoryRestartBtn) {
      victoryRestartBtn.addEventListener("click", () => {
        this.closeModal("modal-victory");
        this.openSetupLobby();
      });
    }
  }

  handleCardClose() {
    this.closeModal("modal-card");
    if (this.pendingCardAction) {
      const action = this.pendingCardAction;
      this.pendingCardAction = null;
      action();
    } else {
      this.finalizeTurnMovement();
    }
  }

  /* ----------------- Setup & Lobby (2 to 24 Players) ----------------- */
  openSetupLobby() {
    this.state = "SETUP";
    this.openModal("modal-setup");
  }

  renderLobbySlots(count) {
    const countDisplay = document.getElementById("setup-player-count-display");
    if (countDisplay) countDisplay.textContent = count;
    const grid = document.getElementById("setup-players-grid");
    if (!grid) return;
    grid.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const preset = PLAYER_PRESETS[i % PLAYER_PRESETS.length];
      const slot = document.createElement("div");
      slot.className = "setup-player-item";
      slot.innerHTML = `
        <div style="font-size: 1.5rem; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: ${preset.bg}; border-radius: 50%; border: 2px solid ${preset.color};">
          ${preset.icon}
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
          <input type="text" class="setup-player-input setup-player-name" value="${preset.name}" data-idx="${i}">
          <div style="display: flex; gap: 6px;">
            <select class="setup-player-input setup-is-bot" data-idx="${i}" style="padding: 2px 6px; font-size: 0.75rem;">
              <option value="human" ${i === 0 ? "selected" : ""}>Human</option>
              <option value="bot" ${i > 0 ? "selected" : ""}>AI Bot</option>
            </select>
          </div>
        </div>
      `;
      grid.appendChild(slot);
    }
  }

  startGameFromLobby() {
    const count = parseInt(document.getElementById("setup-player-count-display").textContent, 10);
    this.startingCash = parseInt(document.getElementById("setup-starting-cash").value, 10);
    this.ruleParkingPool = document.getElementById("setup-free-parking-pool").value === "yes";

    const nameInputs = document.querySelectorAll(".setup-player-name");
    const botSelects = document.querySelectorAll(".setup-is-bot");

    this.players = [];
    for (let i = 0; i < count; i++) {
      const preset = PLAYER_PRESETS[i % PLAYER_PRESETS.length];
      const name = (nameInputs[i] && nameInputs[i].value.trim()) || `Player ${i + 1}`;
      const isBot = botSelects[i] && botSelects[i].value === "bot";

      this.players.push({
        id: i,
        name: name,
        color: preset.color,
        icon: preset.icon,
        isBot: isBot,
        money: this.startingCash,
        position: 0,
        inJail: false,
        jailTurns: 0,
        jailCards: 0,
        bankrupt: false
      });
    }

    // Reset properties
    BOARD_DATA.forEach(tile => {
      if (this.properties[tile.id]) {
        this.properties[tile.id].owner = null;
        this.properties[tile.id].houses = 0;
        this.properties[tile.id].mortgaged = false;
      }
    });

    this.freeParkingPool = 0;
    this.currentPlayerIndex = 0;
    this.turnCount = 1;
    this.consecutiveDoubles = 0;
    this.closeModal("modal-setup");

    this.renderBoard();
    this.renderSidebar();
    this.startTurn();
  }

  /* ----------------- Board Rendering (11x11 Grid) ----------------- */
  renderBoard() {
    const board = document.getElementById("board");
    const center = board.querySelector(".board-center");
    board.innerHTML = "";
    board.appendChild(center);

    BOARD_DATA.forEach((tile, index) => {
      const tileEl = document.createElement("div");
      tileEl.className = "tile";
      tileEl.id = `tile-${index}`;
      tileEl.dataset.id = index;

      // Position in CSS Grid
      let col = 1, row = 1;
      let orientation = "tile-bottom";

      if (index === 0) {
        col = 11; row = 11; orientation = "tile-corner";
      } else if (index >= 1 && index <= 9) {
        col = 11 - index; row = 11; orientation = "tile-bottom";
      } else if (index === 10) {
        col = 1; row = 11; orientation = "tile-corner";
      } else if (index >= 11 && index <= 19) {
        col = 1; row = 11 - (index - 10); orientation = "tile-left";
      } else if (index === 20) {
        col = 1; row = 1; orientation = "tile-corner";
      } else if (index >= 21 && index <= 29) {
        col = 1 + (index - 20); row = 1; orientation = "tile-top";
      } else if (index === 30) {
        col = 11; row = 1; orientation = "tile-corner";
      } else if (index >= 31 && index <= 39) {
        col = 11; row = 1 + (index - 30); orientation = "tile-right";
      }

      tileEl.style.gridColumn = col;
      tileEl.style.gridRow = row;
      tileEl.classList.add(orientation);

      let subHtml = "";
      if (tile.type === "property" || tile.type === "station" || tile.type === "utility") {
        subHtml = `<div class="tile-price">$${tile.price}</div>`;
      } else if (tile.subtitle) {
        subHtml = `<div class="tile-subtitle">${tile.subtitle}</div>`;
      }

      let mortgagedBannerHtml = "";
      const prop = this.properties[index];
      if (prop && prop.owner !== null) {
        const owner = this.players[prop.owner];
        tileEl.classList.add("tile-owned");
        tileEl.style.backgroundColor = owner.color;
        tileEl.style.background = owner.color;
        if (prop.mortgaged) {
          mortgagedBannerHtml = `<div class="tile-mortgaged-banner">MORTGAGED</div>`;
          tileEl.style.filter = "saturate(0.55) brightness(0.85)";
        } else {
          tileEl.style.filter = "";
        }
      } else {
        tileEl.classList.remove("tile-owned");
        tileEl.style.backgroundColor = "";
        tileEl.style.background = "";
        tileEl.style.filter = "";
      }

      tileEl.innerHTML = `
        ${mortgagedBannerHtml}
        <div class="tile-content">
          ${tile.country ? `<div class="tile-country">${tile.country}</div>` : ""}
          ${tile.icon ? `<div class="tile-icon">${tile.icon}</div>` : ""}
          <div class="tile-name">${tile.name}</div>
          <div class="tile-pawns" id="tile-pawns-${index}"></div>
          ${subHtml}
          <div class="tile-buildings" id="tile-buildings-${index}"></div>
        </div>
      `;

      // Clicking a tile now OPENS THE READ-ONLY INFO CARD, NEVER the buy modal
      tileEl.addEventListener("click", () => {
        this.inspectTile(index);
      });

      board.appendChild(tileEl);

      if (prop && prop.houses > 0) {
        this.updateBuildingIndicators(index);
      }
    });

    this.renderAllPawns();
  }

  renderAllPawns() {
    BOARD_DATA.forEach((_, idx) => {
      const container = document.getElementById(`tile-pawns-${idx}`);
      if (container) container.innerHTML = "";
    });

    this.players.forEach(p => {
      if (p.bankrupt) return;
      const container = document.getElementById(`tile-pawns-${p.position}`);
      if (container) {
        const pawn = document.createElement("div");
        pawn.className = "pawn";
        pawn.id = `pawn-player-${p.id}`;
        pawn.style.background = p.color;
        pawn.dataset.tooltip = `${p.name} ($${p.money})`;
        pawn.innerHTML = p.icon;
        container.appendChild(pawn);
      }
    });
  }

  /* ----------------- Turn Lifecycle ----------------- */
  startTurn() {
    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length <= 1) {
      this.declareVictory(activePlayers[0]);
      return;
    }

    const player = this.getCurrentPlayer();
    if (player.bankrupt) {
      this.nextPlayer();
      return;
    }

    this.state = "WAITING_ROLL";
    this.updateStatusDisplay();
    this.renderSidebar();

    // Reset controls visibility
    const rollBtn = document.getElementById("btn-roll-dice");
    const endTurnBtn = document.getElementById("btn-end-turn");
    if (rollBtn) rollBtn.style.display = "inline-flex";
    if (endTurnBtn) endTurnBtn.style.display = "none";

    if (player.inJail) {
      this.handleJailTurn(player);
      return;
    }

    if (player.isBot) {
      this.setControlsDisabled(true);
      setTimeout(() => this.handleBotTurn(), this.fastSpeed ? 350 : 800);
    } else {
      this.setControlsDisabled(false);
      this.setMessage(`${player.name}'s turn. Roll the dice!`);
    }
  }

  handleJailTurn(player) {
    player.jailTurns++;
    this.setMessage(`${player.name} is in Jail (Turn ${player.jailTurns}/3)!`);

    if (player.isBot) {
      this.setControlsDisabled(true);
      setTimeout(() => {
        if (player.jailCards > 0) {
          this.useJailFreeCard();
        } else if (player.money > 300) {
          this.payJailFine();
        } else {
          this.handleHumanRoll(true);
        }
      }, this.fastSpeed ? 400 : 900);
    } else {
      this.setControlsDisabled(true);
      this.openModal("modal-jail");
      const cardBtn = document.getElementById("btn-jail-card");
      if (cardBtn) cardBtn.style.display = player.jailCards > 0 ? "block" : "none";
    }
  }

  payJailFine() {
    const player = this.getCurrentPlayer();
    if (player.money < 50) {
      alert("Not enough money to pay $50 fine!");
      return;
    }
    this.adjustMoney(player, -50, "Jail fine");
    player.inJail = false;
    player.jailTurns = 0;
    this.closeModal("modal-jail");
    this.logActivity(`${player.name} paid $50 fine and was released from Jail.`);
    this.startTurn();
  }

  useJailFreeCard() {
    const player = this.getCurrentPlayer();
    if (player.jailCards <= 0) return;
    player.jailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.closeModal("modal-jail");
    this.logActivity(`${player.name} used a Get Out of Jail Free card.`);
    this.startTurn();
  }

  handleHumanRoll(attemptingJailEscape = false) {
    if (this.isRolling || this.isMoving) return;
    this.rollDice(attemptingJailEscape);
  }

  handleBotTurn() {
    this.botTryBuilding(this.getCurrentPlayer());
    this.rollDice(this.getCurrentPlayer().inJail);
  }

  /* ----------------- 3D Animated Dice Roll ----------------- */
  rollDice(attemptingJailEscape = false) {
    this.isRolling = true;
    this.setControlsDisabled(true);
    audio.playDiceRoll();

    const d1El = document.getElementById("die1");
    const d2El = document.getElementById("die2");
    if (d1El) d1El.classList.add("rolling");
    if (d2El) d2El.classList.add("rolling");

    const rollDuration = this.fastSpeed ? 350 : 650;
    const interval = setInterval(() => {
      if (d1El) this.renderDiePips(d1El, Math.floor(Math.random() * 6) + 1);
      if (d2El) this.renderDiePips(d2El, Math.floor(Math.random() * 6) + 1);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      if (d1El) d1El.classList.remove("rolling");
      if (d2El) d2El.classList.remove("rolling");

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      this.dice = [d1, d2];
      this.diceSum = d1 + d2;
      if (d1El) this.renderDiePips(d1El, d1);
      if (d2El) this.renderDiePips(d2El, d2);
      this.isRolling = false;

      const player = this.getCurrentPlayer();
      const isDoubles = d1 === d2;

      this.logActivity(`${player.name} rolled ${d1} + ${d2} = ${this.diceSum}${isDoubles ? " (DOUBLES!)" : ""}`);

      if (attemptingJailEscape) {
        if (isDoubles) {
          player.inJail = false;
          player.jailTurns = 0;
          this.logActivity(`🎉 ${player.name} rolled doubles and broke free from Jail!`);
          this.animatePawnMovement(player, this.diceSum);
        } else if (player.jailTurns >= 3) {
          this.logActivity(`${player.name} failed 3 doubles attempts, pays $50 and is released.`);
          this.adjustMoney(player, -50, "Jail release");
          player.inJail = false;
          player.jailTurns = 0;
          if (player.money < 0) {
            this.handleDebt(player, null);
          } else {
            this.animatePawnMovement(player, this.diceSum);
          }
        } else {
          this.logActivity(`${player.name} failed to roll doubles and stays in Jail.`);
          this.endTurn();
        }
        return;
      }

      if (isDoubles) {
        this.consecutiveDoubles++;
        if (this.consecutiveDoubles >= 3) {
          this.logActivity(`🚨 ${player.name} rolled 3 consecutive doubles and goes to Jail!`);
          this.sendToJail(player);
          return;
        }
      } else {
        this.consecutiveDoubles = 0;
      }

      this.animatePawnMovement(player, this.diceSum);
    }, rollDuration);
  }

  renderDiePips(dieEl, value) {
    const pips = dieEl.querySelectorAll(".pip");
    pips.forEach(p => p.style.visibility = "hidden");

    const map = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    (map[value] || []).forEach(idx => {
      if (pips[idx]) pips[idx].style.visibility = "visible";
    });
  }

  /* ----------------- Smooth Pawn Hopping Animation ----------------- */
  animatePawnMovement(player, steps, onComplete = null) {
    this.isMoving = true;
    let step = 0;
    const stepDuration = this.fastSpeed ? 70 : 140;

    const hopInterval = setInterval(() => {
      step++;
      const nextPos = (player.position + 1) % 40;
      player.position = nextPos;

      if (nextPos === 0) {
        this.adjustMoney(player, 200, "Passed GO bonus");
        audio.playCash();
        this.showFloatingText(player, "+$200", "#10B981");
        this.logActivity(`${player.name} passed GO and collected $200!`);
      }

      this.renderAllPawns();
      const pawn = document.getElementById(`pawn-player-${player.id}`);
      if (pawn) {
        pawn.classList.add("hopping");
        setTimeout(() => pawn.classList.remove("hopping"), stepDuration * 0.7);
      }
      audio.playHop();

      if (step >= steps) {
        clearInterval(hopInterval);
        this.isMoving = false;
        const destTile = document.getElementById(`tile-${player.position}`);
        if (destTile) {
          destTile.classList.add("highlight");
          setTimeout(() => destTile.classList.remove("highlight"), 1200);
        }

        if (onComplete) {
          onComplete();
        } else {
          this.handleTileLanding(player);
        }
      }
    }, stepDuration);
  }

  /* ----------------- Tile Landing & Actions ----------------- */
  handleTileLanding(player) {
    const tile = BOARD_DATA[player.position];
    this.setMessage(`${player.name} landed on ${tile.name}.`);

    // 1. GO
    if (tile.type === "go") {
      this.finalizeTurnMovement();
      return;
    }

    // 2. Unowned Property / Station / Utility
    // (Only landed tile can be bought)
    if (tile.type === "property" || tile.type === "station" || tile.type === "utility") {
      const prop = this.properties[tile.id];
      if (prop.owner === null) {
        if (player.money >= tile.price) {
          if (player.isBot) {
            this.handleBotBuyDecision(player, tile);
          } else {
            this.showBuyModal(tile);
          }
        } else {
          this.logActivity(`${player.name} cannot afford ${tile.name} ($${tile.price}). Passing to auction!`);
          this.startAuction(tile.id);
        }
        return;
      } else if (prop.owner === player.id) {
        this.logActivity(`${player.name} relaxed on their own property.`);
        this.finalizeTurnMovement();
        return;
      } else {
        this.handleRentPayment(player, tile);
        return;
      }
    }

    // 3. Tax Tiles
    if (tile.type === "tax") {
      audio.playRent();
      this.showFloatingText(player, `-$${tile.amount}`, "#EF4444");
      this.adjustMoney(player, -tile.amount, `${tile.name}`);
      if (this.ruleParkingPool) {
        this.freeParkingPool += tile.amount;
      }
      this.logActivity(`${player.name} paid $${tile.amount} for ${tile.name}.`);
      if (player.money < 0) {
        this.handleDebt(player, null);
      } else {
        this.finalizeTurnMovement();
      }
      return;
    }

    // 4. Free Rest
    if (tile.type === "parking") {
      if (this.ruleParkingPool && this.freeParkingPool > 0) {
        const pool = this.freeParkingPool;
        this.freeParkingPool = 0;
        this.adjustMoney(player, pool, "Free Parking Pool");
        audio.playCash();
        this.showFloatingText(player, `+$${pool}`, "#10B981");
        this.logActivity(`💰 ${player.name} landed on Free Rest and collected the $${pool} jackpot!`);
      } else {
        this.logActivity(`${player.name} is chilling at the Free Rest area.`);
      }
      this.finalizeTurnMovement();
      return;
    }

    // 5. Go To Jail
    if (tile.type === "gotojail") {
      this.sendToJail(player);
      return;
    }

    // 6. Jail (Visiting)
    if (tile.type === "jail") {
      this.logActivity(`${player.name} is just visiting Jail.`);
      this.finalizeTurnMovement();
      return;
    }

    // 7. Surprise / Treasure Cards
    if (tile.type === "chance" || tile.type === "chest") {
      this.drawCard(player, tile.type);
      return;
    }

    this.finalizeTurnMovement();
  }

  /* ----------------- Property Purchase & Rent ----------------- */
  showBuyModal(tile) {
    this.pendingBuyTileId = tile.id;
    const body = document.getElementById("modal-buy-body");
    const confirmBtn = document.getElementById("btn-confirm-buy");

    if (confirmBtn) {
      confirmBtn.textContent = `💰 Buy for $${tile.price}`;
    }

    let rentDetails = "";
    if (tile.type === "property") {
      rentDetails = `
        <table class="deed-rent-table">
          <tr><td>Base Rent</td><td>$${tile.rent[0]}</td></tr>
          <tr><td>With Color Monopoly</td><td>$${tile.rent[0] * 2}</td></tr>
          <tr><td>With 1 House</td><td>$${tile.rent[1]}</td></tr>
          <tr><td>With 2 Houses</td><td>$${tile.rent[2]}</td></tr>
          <tr><td>With 3 Houses</td><td>$${tile.rent[3]}</td></tr>
          <tr><td>With 4 Houses</td><td>$${tile.rent[4]}</td></tr>
          <tr><td>With Hotel</td><td>$${tile.rent[5]}</td></tr>
        </table>
        <div style="font-size: 0.75rem; color: #64748B; margin-top: 6px;">
          House Cost: $${tile.houseCost} each | Mortgage: $${tile.mortgage}
        </div>
      `;
    } else if (tile.type === "station") {
      rentDetails = `
        <div style="font-size: 0.85rem; line-height: 1.5;">
          Rent with 1 Airport: $25<br>
          Rent with 2 Airports: $50<br>
          Rent with 3 Airports: $100<br>
          Rent with 4 Airports: $200
        </div>
      `;
    } else {
      rentDetails = `
        <div style="font-size: 0.85rem; line-height: 1.5;">
          Rent is 4x Dice Roll (or 10x if both utilities owned).
        </div>
      `;
    }

    if (body) {
      body.innerHTML = `
        <div class="deed-card">
          <div class="deed-header" style="background: ${tile.color || '#3B82F6'};">
            ${tile.country || tile.icon || ""} ${tile.name}
          </div>
          ${rentDetails}
        </div>
      `;
    }

    this.openModal("modal-buy");
  }

  buyCurrentProperty() {
    const player = this.getCurrentPlayer();
    const tileId = this.pendingBuyTileId;
    if (tileId === null) {
      this.finalizeTurnMovement();
      return;
    }

    const tile = BOARD_DATA[tileId];
    this.closeModal("modal-buy");
    this.pendingBuyTileId = null;

    if (player.money >= tile.price && this.properties[tile.id].owner === null) {
      this.adjustMoney(player, -tile.price, `Bought ${tile.name}`);
      this.properties[tile.id].owner = player.id;
      audio.playCash();
      this.showFloatingText(player, `-$${tile.price}`, "#EF4444");
      this.logActivity(`🏠 ${player.name} bought ${tile.name} for $${tile.price}!`);
      this.renderBoard();
      this.renderSidebar();
    }
    this.finalizeTurnMovement();
  }

  handleBotBuyDecision(bot, tile) {
    const remainingCash = bot.money - tile.price;
    const shouldBuy = remainingCash >= 150 || (tile.group && this.doesCompleteMonopoly(bot.id, tile.group));

    setTimeout(() => {
      if (shouldBuy && bot.money >= tile.price && this.properties[tile.id].owner === null) {
        this.adjustMoney(bot, -tile.price, `Bought ${tile.name}`);
        this.properties[tile.id].owner = bot.id;
        audio.playCash();
        this.logActivity(`🤖 ${bot.name} bought ${tile.name} for $${tile.price}!`);
        this.renderBoard();
        this.renderSidebar();
        this.finalizeTurnMovement();
      } else {
        this.logActivity(`🤖 ${bot.name} declined to buy ${tile.name}. Starting auction!`);
        this.startAuction(tile.id);
      }
    }, this.fastSpeed ? 300 : 650);
  }

  handleRentPayment(tenant, tile) {
    const prop = this.properties[tile.id];
    const owner = this.players[prop.owner];

    if (prop.mortgaged) {
      this.logActivity(`${tile.name} is mortgaged. No rent due!`);
      this.finalizeTurnMovement();
      return;
    }

    let rent = 0;
    if (tile.type === "property") {
      if (prop.houses === 0) {
        rent = tile.rent[0];
        if (this.hasMonopoly(owner.id, tile.group)) rent *= 2;
      } else {
        rent = tile.rent[prop.houses];
      }
    } else if (tile.type === "station") {
      const ownedStations = PROPERTY_GROUPS.station.tiles.filter(tId => this.properties[tId].owner === owner.id).length;
      rent = 25 * Math.pow(2, ownedStations - 1);
    } else if (tile.type === "utility") {
      const ownedUtils = PROPERTY_GROUPS.utility.tiles.filter(tId => this.properties[tId].owner === owner.id).length;
      rent = this.diceSum * (ownedUtils === 2 ? 10 : 4);
    }

    audio.playRent();
    this.showFloatingText(tenant, `-$${rent}`, "#EF4444");
    this.showFloatingText(owner, `+$${rent}`, "#10B981");

    this.adjustMoney(tenant, -rent, `Rent for ${tile.name}`);
    this.adjustMoney(owner, rent, `Rent from ${tenant.name}`);

    this.logActivity(`💸 ${tenant.name} paid $${rent} rent to ${owner.name} for ${tile.name}.`);

    if (tenant.money < 0) {
      this.handleDebt(tenant, owner);
    } else {
      this.finalizeTurnMovement();
    }
  }

  /* ----------------- Inspect Tile (READ-ONLY Modal) ----------------- */
  inspectTile(tileId) {
    const tile = BOARD_DATA[tileId];
    const modal = document.getElementById("modal-info");
    const body = document.getElementById("modal-info-body");
    const title = document.getElementById("info-modal-title");

    if (!modal || !body) return;

    if (title) {
      title.textContent = tile.name;
    }

    const prop = this.properties[tileId];
    let ownerText = "<span style='color: var(--accent-green);'>Unowned</span>";
    let statusText = "";

    if (prop) {
      if (prop.owner !== null) {
        const owner = this.players[prop.owner];
        ownerText = `<span style='color: ${owner.color}; font-weight: bold;'>${owner.icon} ${owner.name}</span>`;
        if (prop.mortgaged) {
          statusText = `<div style='color: var(--accent-yellow); font-weight: bold; margin-top: 4px;'>⚠️ Mortgaged</div>`;
        } else if (prop.houses > 0) {
          statusText = `<div style='color: var(--accent-green); font-weight: bold; margin-top: 4px;'>🏠 ${prop.houses === 5 ? 'Hotel' : `${prop.houses} Houses`}</div>`;
        }
      }
    }

    let detailHtml = "";
    if (tile.type === "property") {
      detailHtml = `
        <div class="deed-card">
          <div class="deed-header" style="background: ${tile.color || '#3B82F6'};">
            ${tile.country || ""} ${tile.name}
          </div>
          <table class="deed-rent-table">
            <tr><td>Base Rent</td><td>$${tile.rent[0]}</td></tr>
            <tr><td>Monopoly Rent</td><td>$${tile.rent[0] * 2}</td></tr>
            <tr><td>1 House</td><td>$${tile.rent[1]}</td></tr>
            <tr><td>2 Houses</td><td>$${tile.rent[2]}</td></tr>
            <tr><td>3 Houses</td><td>$${tile.rent[3]}</td></tr>
            <tr><td>4 Houses</td><td>$${tile.rent[4]}</td></tr>
            <tr><td>Hotel</td><td>$${tile.rent[5]}</td></tr>
          </table>
          <div style="font-size: 0.8rem; color: #64748B; margin-top: 4px;">
            House Cost: $${tile.houseCost} | Mortgage Value: $${tile.mortgage}
          </div>
        </div>
      `;
    } else if (tile.type === "station") {
      detailHtml = `
        <div class="deed-card">
          <div class="deed-header" style="background: ${tile.color || '#64748B'};">
            ✈️ ${tile.name}
          </div>
          <div style="font-size: 0.85rem; line-height: 1.6; padding: 6px;">
            Rent with 1 Airport: $25<br>
            Rent with 2 Airports: $50<br>
            Rent with 3 Airports: $100<br>
            Rent with 4 Airports: $200<br>
            Mortgage Value: $${tile.mortgage}
          </div>
        </div>
      `;
    } else if (tile.type === "utility") {
      detailHtml = `
        <div class="deed-card">
          <div class="deed-header" style="background: ${tile.color || '#A855F7'};">
            ⚡ ${tile.name}
          </div>
          <div style="font-size: 0.85rem; line-height: 1.6; padding: 6px;">
            1 Utility Owned: 4 × Dice Roll<br>
            2 Utilities Owned: 10 × Dice Roll<br>
            Mortgage Value: $${tile.mortgage}
          </div>
        </div>
      `;
    } else {
      detailHtml = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">${tile.icon || "📍"}</div>
          <div style="font-size: 1rem; color: var(--text-main); font-weight: 700;">${tile.name}</div>
          <div>${tile.subtitle || ""}</div>
        </div>
      `;
    }

    body.innerHTML = `
      ${detailHtml}
      ${prop ? `
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; margin-top: 12px; font-size: 0.88rem;">
          <div><strong>Owner:</strong> ${ownerText}</div>
          <div><strong>Price:</strong> $${tile.price}</div>
          ${statusText}
        </div>
      ` : ""}
    `;

    this.openModal("modal-info");
  }

  /* ----------------- Auctions (Live Bidding Room) ----------------- */
  startAuction(tileId) {
    this.state = "AUCTION";
    const tile = BOARD_DATA[tileId];
    this.auction = {
      tileId: tileId,
      highestBid: 10,
      highestBidder: null,
      timeLeft: 5,
      timer: null,
      activeBidders: this.players.filter(p => !p.bankrupt && p.money >= 10).map(p => p.id)
    };

    const info = document.getElementById("auction-property-info");
    if (info) {
      info.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: 800; color: ${tile.color || '#3B82F6'}; margin-bottom: 4px;">
          ${tile.country || tile.icon || ""} ${tile.name}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Market Value: $${tile.price} | Starting Bid: $10
        </div>
      `;
    }

    this.updateAuctionUI();
    this.openModal("modal-auction");
    this.resetAuctionTimer();
  }

  updateAuctionUI() {
    const curBidEl = document.getElementById("auction-current-bid");
    const highBidderEl = document.getElementById("auction-highest-bidder");
    const bidderTurnEl = document.getElementById("auction-bidder-turn");

    if (curBidEl) curBidEl.textContent = `$${this.auction.highestBid}`;
    if (highBidderEl) {
      if (this.auction.highestBidder !== null) {
        const bidder = this.players[this.auction.highestBidder];
        highBidderEl.textContent = `Leading: ${bidder.name}`;
        highBidderEl.style.color = bidder.color;
      } else {
        highBidderEl.textContent = "No bids yet";
        highBidderEl.style.color = "var(--text-muted)";
      }
    }

    if (bidderTurnEl) {
      const activeCount = this.auction.activeBidders.length;
      bidderTurnEl.textContent = `${activeCount} active bidder${activeCount === 1 ? '' : 's'}`;
    }
  }

  handleBid(increment) {
    const player = this.getCurrentPlayer();
    if (this.auction.activeBidders.indexOf(player.id) === -1) {
      alert("You have folded from this auction!");
      return;
    }

    const newBid = this.auction.highestBid + increment;
    if (player.money < newBid) {
      alert(`You do not have $${newBid} to place this bid!`);
      return;
    }

    this.placeBid(player.id, newBid);
  }

  handleFold(playerId) {
    const idx = this.auction.activeBidders.indexOf(playerId);
    if (idx !== -1) {
      this.auction.activeBidders.splice(idx, 1);
      this.logActivity(`${this.players[playerId].name} folded from the auction.`);
    }
    this.updateAuctionUI();

    if (this.auction.activeBidders.length === 0 || (this.auction.activeBidders.length === 1 && this.auction.highestBidder !== null)) {
      this.concludeAuction();
    }
  }

  placeBid(playerId, amount) {
    this.auction.highestBid = amount;
    this.auction.highestBidder = playerId;
    audio.playTick();
    this.updateAuctionUI();
    this.resetAuctionTimer();
  }

  resetAuctionTimer() {
    if (this.auction.timer) clearInterval(this.auction.timer);
    this.auction.timeLeft = 5;
    const fill = document.getElementById("auction-timer-fill");
    if (fill) fill.style.width = "100%";

    this.auction.timer = setInterval(() => {
      this.auction.timeLeft -= 0.1;
      const pct = Math.max(0, (this.auction.timeLeft / 5) * 100);
      if (fill) fill.style.width = `${pct}%`;

      if (Math.random() < 0.3) {
        this.botAuctionCheck();
      }

      if (this.auction.timeLeft <= 0) {
        clearInterval(this.auction.timer);
        this.concludeAuction();
      }
    }, 100);
  }

  botAuctionCheck() {
    const tile = BOARD_DATA[this.auction.tileId];
    this.auction.activeBidders.forEach(pId => {
      const p = this.players[pId];
      if (p.isBot && pId !== this.auction.highestBidder) {
        const maxWillingToPay = tile.price * (this.doesCompleteMonopoly(p.id, tile.group) ? 1.2 : 0.85);
        const nextBid = this.auction.highestBid + (Math.random() > 0.5 ? 10 : 50);
        if (p.money >= nextBid && nextBid <= maxWillingToPay) {
          this.placeBid(p.id, nextBid);
        } else if (nextBid > maxWillingToPay) {
          this.handleFold(p.id);
        }
      }
    });
  }

  concludeAuction() {
    if (this.auction.timer) {
      clearInterval(this.auction.timer);
      this.auction.timer = null;
    }
    this.closeModal("modal-auction");
    const tile = BOARD_DATA[this.auction.tileId];

    if (this.auction.highestBidder !== null) {
      const winner = this.players[this.auction.highestBidder];
      this.adjustMoney(winner, -this.auction.highestBid, `Auction win: ${tile.name}`);
      this.properties[tile.id].owner = winner.id;
      audio.playCash();
      this.logActivity(`🏆 ${winner.name} won ${tile.name} at auction for $${this.auction.highestBid}!`);
    } else {
      this.logActivity(`No bids placed on ${tile.name}. It remains unowned.`);
    }

    this.renderBoard();
    this.renderSidebar();
    this.finalizeTurnMovement();
  }

  /* ----------------- Chance & Community Chest Cards ----------------- */
  drawCard(player, type) {
    audio.playCard();
    let card = null;
    let title = "";
    let icon = "";

    if (type === "chance") {
      card = this.surpriseDeck.pop();
      this.surpriseDeck.unshift(card);
      title = "Surprise Card";
      icon = "❓";
    } else {
      card = this.treasureDeck.pop();
      this.treasureDeck.unshift(card);
      title = "Treasure Chest";
      icon = "📦";
    }

    const titleEl = document.getElementById("card-modal-title");
    const iconEl = document.getElementById("card-modal-icon");
    const textEl = document.getElementById("card-modal-text");
    if (titleEl) titleEl.textContent = title;
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = card.text;

    this.pendingCardAction = () => {
      this.executeCardAction(player, card);
    };

    if (player.isBot) {
      setTimeout(() => {
        this.executeCardAction(player, card);
      }, this.fastSpeed ? 350 : 750);
    } else {
      this.openModal("modal-card");
    }
  }

  executeCardAction(player, card) {
    switch (card.action) {
      case "receive":
        this.adjustMoney(player, card.amount, "Card bonus");
        audio.playCash();
        this.showFloatingText(player, `+$${card.amount}`, "#10B981");
        this.finalizeTurnMovement();
        break;

      case "pay":
        this.adjustMoney(player, -card.amount, "Card fee");
        audio.playRent();
        this.showFloatingText(player, `-$${card.amount}`, "#EF4444");
        if (player.money < 0) {
          this.handleDebt(player, null);
        } else {
          this.finalizeTurnMovement();
        }
        break;

      case "teleport":
        if (card.target < player.position && card.collectGo) {
          this.adjustMoney(player, 200, "Passed GO");
          audio.playCash();
          this.showFloatingText(player, "+$200", "#10B981");
        }
        player.position = card.target;
        this.renderAllPawns();
        this.handleTileLanding(player);
        break;

      case "move_relative":
        player.position = (player.position + card.steps + 40) % 40;
        this.renderAllPawns();
        this.handleTileLanding(player);
        break;

      case "gotojail":
        this.sendToJail(player);
        break;

      case "jailcard":
        player.jailCards++;
        this.logActivity(`${player.name} received a Get Out of Jail Free card!`);
        this.finalizeTurnMovement();
        break;

      case "collect_from_all":
        this.players.forEach(p => {
          if (p.id !== player.id && !p.bankrupt) {
            this.adjustMoney(p, -card.amount, "Card gift");
            this.adjustMoney(player, card.amount, "Card gift");
            if (p.money < 0) {
              this.handleDebt(p, player);
            }
          }
        });
        audio.playCash();
        this.finalizeTurnMovement();
        break;

      case "repairs":
        let houses = 0, hotels = 0;
        Object.entries(this.properties).forEach(([tId, p]) => {
          if (p.owner === player.id) {
            if (p.houses === 5) hotels++;
            else houses += p.houses;
          }
        });
        const cost = (houses * card.perHouse) + (hotels * card.perHotel);
        if (cost > 0) {
          this.adjustMoney(player, -cost, "Property repairs");
          this.logActivity(`${player.name} paid $${cost} for repairs (${houses} houses, ${hotels} hotels).`);
          if (player.money < 0) {
            this.handleDebt(player, null);
            return;
          }
        }
        this.finalizeTurnMovement();
        break;

      default:
        this.finalizeTurnMovement();
    }
  }

  sendToJail(player) {
    audio.playJail();
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    this.consecutiveDoubles = 0;
    this.renderAllPawns();
    this.logActivity(`🔒 ${player.name} was sent directly to Jail!`);
    this.endTurn();
  }

  /* ----------------- Turn Completion & Doubler Rules ----------------- */
  finalizeTurnMovement() {
    const player = this.getCurrentPlayer();
    const rolledDoubles = this.dice[0] === this.dice[1];

    if (rolledDoubles && !player.inJail) {
      this.logActivity(`🎲 ${player.name} rolled doubles and gets an extra turn!`);
      this.state = "WAITING_ROLL";
      if (player.isBot) {
        setTimeout(() => this.startTurn(), this.fastSpeed ? 350 : 750);
      } else {
        this.setControlsDisabled(false);
        this.setMessage(`Doubles! Roll again.`);
      }
    } else {
      if (player.isBot) {
        setTimeout(() => this.endTurn(), this.fastSpeed ? 300 : 600);
      } else {
        this.state = "WAITING_END";
        const rollBtn = document.getElementById("btn-roll-dice");
        const endTurnBtn = document.getElementById("btn-end-turn");
        if (rollBtn) rollBtn.style.display = "none";
        if (endTurnBtn) endTurnBtn.style.display = "inline-flex";
        this.setMessage("Turn complete. Click End Turn.");
      }
    }
  }

  endTurn() {
    const endTurnBtn = document.getElementById("btn-end-turn");
    const rollBtn = document.getElementById("btn-roll-dice");
    if (endTurnBtn) endTurnBtn.style.display = "none";
    if (rollBtn) rollBtn.style.display = "inline-flex";
    this.nextPlayer();
  }

  nextPlayer() {
    this.consecutiveDoubles = 0;
    let attempts = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      attempts++;
    } while (this.players[this.currentPlayerIndex].bankrupt && attempts < this.players.length);

    this.turnCount++;
    this.startTurn();
  }

  /* ----------------- Trading System ----------------- */
  openTradeModal() {
    const targetSelect = document.getElementById("trade-target-player");
    if (!targetSelect) return;
    targetSelect.innerHTML = "";

    const human = this.getCurrentPlayer();
    this.players.forEach(p => {
      if (p.id !== human.id && !p.bankrupt) {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} ${p.isBot ? '(AI)' : ''} — $${p.money}`;
        targetSelect.appendChild(opt);
      }
    });

    this.renderTradeInventories();
    this.openModal("modal-trade");
  }

  renderTradeInventories() {
    const me = this.getCurrentPlayer();
    const targetSelect = document.getElementById("trade-target-player");
    if (!targetSelect || !targetSelect.value) return;

    const targetId = parseInt(targetSelect.value, 10);
    const target = this.players[targetId];

    const giveContainer = document.getElementById("trade-give-props");
    const getContainer = document.getElementById("trade-get-props");
    if (giveContainer) giveContainer.innerHTML = "";
    if (getContainer) getContainer.innerHTML = "";

    Object.entries(this.properties).forEach(([tId, p]) => {
      if (p.owner === me.id) {
        const tile = BOARD_DATA[tId];
        const item = document.createElement("div");
        item.className = "trade-prop-item";
        item.dataset.id = tId;
        item.innerHTML = `<span><span style="color:${tile.color}">■</span> ${tile.name}</span><input type="checkbox" class="trade-give-check" value="${tId}">`;
        if (giveContainer) giveContainer.appendChild(item);
      }
    });

    if (target) {
      Object.entries(this.properties).forEach(([tId, p]) => {
        if (p.owner === target.id) {
          const tile = BOARD_DATA[tId];
          const item = document.createElement("div");
          item.className = "trade-prop-item";
          item.dataset.id = tId;
          item.innerHTML = `<span><span style="color:${tile.color}">■</span> ${tile.name}</span><input type="checkbox" class="trade-get-check" value="${tId}">`;
          if (getContainer) getContainer.appendChild(item);
        }
      });
    }
  }

  submitTradeOffer() {
    const me = this.getCurrentPlayer();
    const targetSelect = document.getElementById("trade-target-player");
    if (!targetSelect || !targetSelect.value) return;

    const targetId = parseInt(targetSelect.value, 10);
    const target = this.players[targetId];

    const giveCash = parseInt(document.getElementById("trade-give-cash").value, 10) || 0;
    const getCash = parseInt(document.getElementById("trade-get-cash").value, 10) || 0;

    const giveProps = Array.from(document.querySelectorAll(".trade-give-check:checked")).map(el => parseInt(el.value, 10));
    const getProps = Array.from(document.querySelectorAll(".trade-get-check:checked")).map(el => parseInt(el.value, 10));

    if (giveCash > me.money) {
      alert("You cannot offer more cash than you have!");
      return;
    }
    if (getCash > target.money) {
      alert(`${target.name} does not have enough cash for this offer!`);
      return;
    }

    this.closeModal("modal-trade");

    if (target.isBot) {
      const accepted = this.evaluateBotTrade(target, me, giveCash, getCash, giveProps, getProps);
      if (accepted) {
        this.executeTrade(me, target, giveCash, getCash, giveProps, getProps);
        audio.playCash();
        alert(`🤝 ${target.name} accepted your trade proposal!`);
      } else {
        audio.playRent();
        alert(`❌ ${target.name} declined your trade proposal.`);
      }
    } else {
      if (confirm(`${target.name}, do you accept this trade from ${me.name}?`)) {
        this.executeTrade(me, target, giveCash, getCash, giveProps, getProps);
        audio.playCash();
      }
    }
  }

  evaluateBotTrade(bot, human, giveCash, getCash, giveProps, getProps) {
    let offeredValue = giveCash;
    giveProps.forEach(id => {
      const tile = BOARD_DATA[id];
      offeredValue += tile.price;
      if (this.doesCompleteMonopoly(bot.id, tile.group)) offeredValue += tile.price * 1.5;
    });

    let requestedValue = getCash;
    getProps.forEach(id => {
      const tile = BOARD_DATA[id];
      requestedValue += tile.price;
      if (this.hasMonopoly(bot.id, tile.group)) requestedValue += tile.price * 2.5;
    });

    return offeredValue >= requestedValue;
  }

  executeTrade(p1, p2, cash1To2, cash2To1, props1To2, props2To1) {
    this.adjustMoney(p1, -cash1To2 + cash2To1, "Trade");
    this.adjustMoney(p2, cash1To2 - cash2To1, "Trade");

    props1To2.forEach(id => {
      this.properties[id].owner = p2.id;
    });
    props2To1.forEach(id => {
      this.properties[id].owner = p1.id;
    });

    this.logActivity(`🤝 Trade executed between ${p1.name} and ${p2.name}!`);
    this.renderBoard();
    this.renderSidebar();
  }

  /* ----------------- Property Management (Mortgage / Houses) ----------------- */
  openPropertiesModal(playerId) {
    const player = this.players[playerId];
    const container = document.getElementById("props-list-container");
    if (!container) return;
    container.innerHTML = "";

    const ownedTiles = BOARD_DATA.filter(t => this.properties[t.id] && this.properties[t.id].owner === player.id);

    if (ownedTiles.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No properties owned yet.</p>`;
    } else {
      ownedTiles.forEach(tile => {
        const prop = this.properties[tile.id];
        const canBuild = tile.type === "property" && this.hasMonopoly(player.id, tile.group) && prop.houses < 5 && !prop.mortgaged;
        const canSell = tile.type === "property" && prop.houses > 0;

        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px;";
        row.innerHTML = `
          <div>
            <div style="font-weight: 700; color: ${tile.color || 'white'}; font-size: 0.95rem;">${tile.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ${prop.mortgaged ? '<span style="color:var(--accent-yellow)">MORTGAGED</span>' : `Houses: ${prop.houses === 5 ? 'HOTEL' : prop.houses}`}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            ${canBuild ? `<button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="game.buildHouse(${tile.id})">+ House ($${tile.houseCost})</button>` : ""}
            ${canSell ? `<button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="game.sellHouse(${tile.id})">- House</button>` : ""}
            ${!prop.mortgaged && prop.houses === 0 ? `<button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem; color:var(--accent-yellow);" onclick="game.toggleMortgage(${tile.id})">Mortgage ($${tile.mortgage})</button>` : ""}
            ${prop.mortgaged ? `<button class="btn-secondary" style="padding:4px 8px; font-size:0.75rem; color:var(--accent-green);" onclick="game.toggleMortgage(${tile.id})">Unmortgage ($${Math.round(tile.mortgage * 1.1)})</button>` : ""}
          </div>
        `;
        container.appendChild(row);
      });
    }

    this.openModal("modal-props");
  }

  buildHouse(tileId, silent = false) {
    const tile = BOARD_DATA[tileId];
    const prop = this.properties[tileId];
    const owner = this.players[prop.owner];

    if (owner.money < tile.houseCost) {
      if (!silent) alert("Not enough money to build a house!");
      return;
    }
    if (prop.houses >= 5) {
      if (!silent) alert("Already has a Hotel!");
      return;
    }

    this.adjustMoney(owner, -tile.houseCost, `Built house on ${tile.name}`);
    prop.houses++;
    audio.playCash();
    this.updateBuildingIndicators(tileId);
    if (!silent && !owner.isBot) {
      this.openPropertiesModal(owner.id);
    }
    this.logActivity(`🏠 ${owner.name} built on ${tile.name} (Level: ${prop.houses === 5 ? 'Hotel' : prop.houses})!`);
  }

  sellHouse(tileId, silent = false) {
    const tile = BOARD_DATA[tileId];
    const prop = this.properties[tileId];
    const owner = this.players[prop.owner];

    if (prop.houses <= 0) return;
    const refund = Math.round(tile.houseCost / 2);
    this.adjustMoney(owner, refund, `Sold house on ${tile.name}`);
    prop.houses--;
    this.updateBuildingIndicators(tileId);
    if (!silent && !owner.isBot) {
      this.openPropertiesModal(owner.id);
    }
    this.logActivity(`${owner.name} sold a building on ${tile.name} for $${refund}.`);
  }

  toggleMortgage(tileId, silent = false) {
    const tile = BOARD_DATA[tileId];
    const prop = this.properties[tileId];
    const owner = this.players[prop.owner];

    if (!prop.mortgaged) {
      prop.mortgaged = true;
      this.adjustMoney(owner, tile.mortgage, `Mortgaged ${tile.name}`);
      this.logActivity(`${owner.name} mortgaged ${tile.name} for $${tile.mortgage}.`);
    } else {
      const cost = Math.round(tile.mortgage * 1.1);
      if (owner.money < cost) {
        if (!silent) alert(`Need $${cost} to unmortgage!`);
        return;
      }
      this.adjustMoney(owner, -cost, `Unmortgaged ${tile.name}`);
      prop.mortgaged = false;
      this.logActivity(`${owner.name} lifted mortgage on ${tile.name}.`);
    }

    this.renderBoard();
    if (!silent && !owner.isBot) {
      this.openPropertiesModal(owner.id);
    }
  }

  updateBuildingIndicators(tileId) {
    const prop = this.properties[tileId];
    const container = document.getElementById(`tile-buildings-${tileId}`);
    if (!container) return;
    container.innerHTML = "";

    if (prop.houses === 5) {
      container.innerHTML = `<div class="hotel-cube" title="Hotel"></div>`;
    } else if (prop.houses > 0) {
      for (let i = 0; i < prop.houses; i++) {
        const h = document.createElement("div");
        h.className = "house-cube";
        h.title = `${prop.houses} Houses`;
        container.appendChild(h);
      }
    }
  }

  botTryBuilding(bot) {
    Object.entries(PROPERTY_GROUPS).forEach(([groupName, groupData]) => {
      if (groupName !== "station" && groupName !== "utility") {
        if (this.hasMonopoly(bot.id, groupName)) {
          groupData.tiles.forEach(tId => {
            const tile = BOARD_DATA[tId];
            const prop = this.properties[tId];
            if (prop.houses < 5 && bot.money > tile.houseCost + 200) {
              this.buildHouse(tId, true);
            }
          });
        }
      }
    });
  }

  /* ----------------- Bankruptcy & Debt ----------------- */
  handleDebt(debtor, creditor) {
    // Attempt auto-mortgages to cover debt
    const owned = BOARD_DATA.filter(t => this.properties[t.id] && this.properties[t.id].owner === debtor.id && !this.properties[t.id].mortgaged);
    for (const t of owned) {
      if (debtor.money >= 0) break;
      this.toggleMortgage(t.id, true);
    }

    if (debtor.money < 0) {
      this.declareBankruptcy(debtor, creditor);
    } else {
      this.finalizeTurnMovement();
    }
  }

  declareBankruptcy(debtor, creditor) {
    debtor.bankrupt = true;
    debtor.money = 0;
    audio.playJail();
    this.logActivity(`💀 ${debtor.name} went BANKRUPT!`);

    Object.entries(this.properties).forEach(([tId, p]) => {
      if (p.owner === debtor.id) {
        p.owner = creditor ? creditor.id : null;
        if (!creditor) {
          p.mortgaged = false;
          p.houses = 0;
        }
      }
    });

    this.renderAllPawns();
    this.renderSidebar();

    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length <= 1) {
      this.declareVictory(activePlayers[0]);
    } else {
      this.nextPlayer();
    }
  }

  declareVictory(winner) {
    this.state = "GAME_OVER";
    audio.playWin();
    const avatarEl = document.getElementById("victory-avatar");
    const nameEl = document.getElementById("victory-player-name");
    const statsEl = document.getElementById("victory-stats");

    if (avatarEl) avatarEl.textContent = winner.icon;
    if (nameEl) nameEl.textContent = `${winner.name} WINS!`;

    if (statsEl) {
      statsEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 6px;">Final Standings:</div>
        ${this.players.map(p => `
          <div style="display:flex; justify-content:space-between; padding:3px 0; font-size:0.85rem; color:${p.color}">
            <span>${p.icon} ${p.name} ${p.bankrupt ? '(Bankrupt)' : ''}</span>
            <span>$${p.money}</span>
          </div>
        `).join("")}
      `;
    }

    this.openModal("modal-victory");
  }

  /* ----------------- Helper / Utility Methods ----------------- */
  hasMonopoly(playerId, groupKey) {
    if (!groupKey || !PROPERTY_GROUPS[groupKey]) return false;
    const tiles = PROPERTY_GROUPS[groupKey].tiles;
    return tiles.every(tId => this.properties[tId].owner === playerId);
  }

  doesCompleteMonopoly(playerId, groupKey) {
    if (!groupKey || !PROPERTY_GROUPS[groupKey]) return false;
    const tiles = PROPERTY_GROUPS[groupKey].tiles;
    const unownedOrOwnedByBot = tiles.filter(tId => this.properties[tId].owner === playerId);
    return unownedOrOwnedByBot.length === tiles.length - 1;
  }

  adjustMoney(player, amount, reason = "") {
    player.money += amount;
    this.renderSidebar();
  }

  showFloatingText(player, text, color) {
    const card = document.getElementById(`player-card-${player.id}`);
    if (!card) return;

    const el = document.createElement("div");
    el.className = "floating-text";
    el.style.color = color;
    el.style.top = "10px";
    el.style.right = "20px";
    el.textContent = text;
    card.appendChild(el);

    setTimeout(() => el.remove(), 1200);
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  setControlsDisabled(disabled) {
    const rollBtn = document.getElementById("btn-roll-dice");
    const tradeBtn = document.getElementById("btn-open-trade");
    const propsBtn = document.getElementById("btn-open-props");
    if (rollBtn) rollBtn.disabled = disabled;
    if (tradeBtn) tradeBtn.disabled = disabled;
    if (propsBtn) propsBtn.disabled = disabled;
  }

  setMessage(msg) {
    const msgEl = document.getElementById("center-message");
    if (msgEl) msgEl.textContent = msg;
  }

  logActivity(text) {
    const feed = document.getElementById("activity-feed");
    if (feed) feed.textContent = text;
  }

  updateStatusDisplay() {
    const p = this.getCurrentPlayer();
    const dot = document.getElementById("current-player-dot");
    const nameEl = document.getElementById("current-player-name");
    const timerEl = document.getElementById("turn-timer-text");
    if (dot) dot.style.background = p.color;
    if (nameEl) nameEl.textContent = `${p.icon} ${p.name}`;
    if (timerEl) timerEl.textContent = `Turn: ${this.turnCount}`;
  }

  renderSidebar() {
    const list = document.getElementById("player-list");
    if (!list) return;
    list.innerHTML = "";
    const countEl = document.getElementById("sidebar-count");
    if (countEl) countEl.textContent = `${this.players.length} / 24 Players`;

    this.players.forEach(p => {
      const card = document.createElement("div");
      card.className = `player-card ${p.id === this.currentPlayerIndex ? 'active-turn' : ''} ${p.bankrupt ? 'bankrupt' : ''}`;
      card.id = `player-card-${p.id}`;

      const ownedProps = BOARD_DATA.filter(t => this.properties[t.id] && this.properties[t.id].owner === p.id);
      const propsHtml = ownedProps.map(t => `
        <span class="prop-badge ${this.properties[t.id].mortgaged ? 'mortgaged' : ''}" style="background: ${t.color || '#64748B'};" title="${t.name}">
          ${t.name.charAt(0)}
        </span>
      `).join("");

      card.innerHTML = `
        <div class="player-card-top">
          <div class="player-info-main">
            <div class="player-avatar" style="background: ${p.color};">
              ${p.icon}
            </div>
            <div class="player-name-wrapper">
              <div class="player-name-row">
                <span class="player-card-name">${p.name}</span>
                ${p.isBot ? '<span class="bot-tag">BOT</span>' : ''}
                ${p.inJail ? '<span class="jail-badge">JAIL</span>' : ''}
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${p.bankrupt ? 'Eliminated' : `${ownedProps.length} properties`}</span>
            </div>
          </div>
          <div class="player-money">$${p.money}</div>
        </div>
        ${propsHtml ? `<div class="player-properties-bar">${propsHtml}</div>` : ''}
      `;

      list.appendChild(card);
    });
  }

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  }
}

// Global game instance
let game = null;
window.addEventListener("DOMContentLoaded", () => {
  game = new RichupGame();
});
