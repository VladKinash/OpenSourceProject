import Card    from './card.js';
import Deck    from './deck.js';
import Effects from './effects.js';

export default class Game {
  constructor(playerNames) {
    this.players = playerNames.map(name => ({ name, hand: [] }));
    this.deck    = new Deck();
    this.currentPlayerIndex = 0;
    this.direction          = 1;
    this.isOver             = false;
    this.scores             = {};
  }

  startGame() {
    this.deck.shuffle();
    this.players.forEach(p => p.hand = []);
    for (let i = 0; i < 7; i++) {
      this.players.forEach(p => p.hand.push(this.deck.drawCard()));
    }

    const first = this.deck.drawCard();
    this.deck.discard(first);

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

  advanceTurn() {
    const n = this.players.length;
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + n) % n;
  }

  drawForCurrentPlayer(n) {
    for (let i = 0; i < n; i++) {
      this.players[this.currentPlayerIndex].hand.push(this.deck.drawCard());
    }
  }

  getTopCard() {
    return this.deck.getTopDiscard();
  }

  playCard(playerIndex, cardIndex, chosenColor = null) {
    if (this.isOver) throw new Error('Game is already over');
    if (playerIndex !== this.currentPlayerIndex)
      throw new Error('Not your turn');

    const player = this.players[playerIndex];
    const card   = player.hand[cardIndex];
    const top    = this.getTopCard();

    if (!Card.isValidPlay(top, card))
      throw new Error('Invalid play');

    if ((card.type === 'wild' || card.type === 'wild_draw4') && !chosenColor)
      throw new Error('A color must be chosen when playing a wild card');

    if (card.type === 'wild' || card.type === 'wild_draw4')
      card.chosenColor = chosenColor;

    player.hand.splice(cardIndex, 1);
    this.deck.discard(card);

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
        scores[p.name] = p.hand.reduce((sum, c) => {
          if (c.type === 'number') return sum + c.value;
          if (['skip','reverse','draw2'].includes(c.type)) return sum + 20;
          return sum + 50; // wilds
        }, 0);
      }
    });
    this.scores = scores;
  }
}
