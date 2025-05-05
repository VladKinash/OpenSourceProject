class Game {
  constructor(playerNames) {
    this.players = playerNames.map(name => ({ name, hand: [] }));
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.isOver = false;
    this.scores = {};
  }

  startGame() {
    this.deck = Deck.shuffleDeck(Deck.buildUnoDeck());
    this.assignCards();
    this.discardPile.push(this.deck.pop());
    const top = this.getTopCard();

    switch (top.type) {
      case 'skip':
        this.advanceTurn();
        break;
      case 'reverse':
        this.direction *= -1;
        if (this.players.length === 2) this.advanceTurn();
        break;
      case 'draw2':
        this.advanceTurn();
        this.drawForCurrentPlayer(2);
        break;
      case 'wild_draw4':
        this.advanceTurn();
        this.drawForCurrentPlayer(4);
        break;
    }
  }

  assignCards() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].hand = this.deck.splice(0, 7);
    }
  }

  advanceTurn() {
    const count = this.players.length;
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + count) % count;
  }

  drawForCurrentPlayer(n) {
    for (let i = 0; i < n; i++) {
      if (this.deck.length === 0) this._reshuffle();
      const card = this.deck.pop();
      this.players[this.currentPlayerIndex].hand.push(card);
    }
  }

  getTopCard() {
    return this.discardPile[this.discardPile.length - 1] || null;
  }

  _reshuffle() {
    if (this.discardPile.length <= 1) return;
    const top = this.discardPile.pop();
    this.deck = Deck.shuffleDeck(this.discardPile);
    this.discardPile = [top];
  }

  playCard(playerIndex, cardIndex, chosenColor) {
    if (this.isOver) throw new Error('Game is already over');

    const player = this.players[playerIndex];
    const card = player.hand[cardIndex];
    const topCard = this.getTopCard();

    if (!Card.isValidPlay(topCard, card)) {
      throw new Error('Invalid play: card does not match color, value, or type');
    }

    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);
    Effects.apply(this, card, chosenColor);

    if (player.hand.length === 0) {
      this.endRound(playerIndex);
      return;
    }

    this.advanceTurn();
  }

  endRound(winnerIndex) {
    this.isOver = true;
    const scores = {};

    this.players.forEach((p, idx) => {
      if (idx === winnerIndex) {
        scores[p.name] = 0;
      } else {
        let total = 0;
        p.hand.forEach(c => {
          if (c.type === 'number') total += c.value;
          else if (['skip', 'reverse', 'draw2'].includes(c.type)) total += 20;
          else if (['wild', 'wild_draw4'].includes(c.type)) total += 50;
        });
        scores[p.name] = total;
      }
    });

    this.scores = scores;
  }
}

export default Game;