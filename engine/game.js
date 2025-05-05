import Deck from './deck';

class Game {
  constructor(playerNames) {
    this.players = playerNames.map(name => ({ name, hand: [] }));
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1;
  }

  startGame() {
    this.deck = Deck.shuffleDeck(Deck.buildUnoDeck());
  }

  advanceTurn() {
    const playerCount = this.players.length;
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + playerCount) % playerCount;
  }

  assignCards() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].hand = this.deck.splice(0, 7);
    }
  }

  playCard(playerIndex, cardIndex, chosenColor) {
    const player = this.players[playerIndex];
    const card = player.hand.splice(cardIndex,1)[0];
    this.discardPile.push(card);
    Effects.apply(this, card, chosenColor);
    this.advanceTurn();
  }
  
}
export default Game;
