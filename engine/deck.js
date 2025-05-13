const Card = require('./card');

class Deck {
  constructor() {
    this.deck = Deck.buildUnoDeck();
    this.discardPile = [];
  }

  static buildUnoDeck() {
    const colors = ['red', 'yellow', 'green', 'blue'];
    const cards = [];

    for (const color of colors) {
      // Add one 0 card
      cards.push(new Card(color, 0, 'number'));

      // Add two of each 1–9 number card
      for (let i = 1; i <= 9; i++) {
        cards.push(new Card(color, i, 'number'));
        cards.push(new Card(color, i, 'number'));
      }

      // Add two of each action card per color
      for (const type of ['skip', 'reverse', 'draw2']) {
        cards.push(new Card(color, null, type));
        cards.push(new Card(color, null, type));
      }
    }

    // Add wild cards
    for (let i = 0; i < 4; i++) {
      cards.push(new Card(null, null, 'wild'));
      cards.push(new Card(null, null, 'wild_draw4'));
    }

    return cards;
  }

  static shuffleDeck(array) {
    const deck = array.slice();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  shuffle() {
    this.deck = Deck.shuffleDeck(this.deck);
    return this.deck;
  }

  drawCard() {
    if (this.deck.length === 0) this._reshuffle();
    return this.deck.pop();
  }

  discard(card) {
    this.discardPile.push(card);
  }

  getTopDiscard() {
    return this.discardPile[this.discardPile.length - 1] || null;
  }

  _reshuffle() {
    if (this.discardPile.length <= 1) return;
    const top = this.discardPile.pop();
    this.deck = Deck.shuffleDeck(this.discardPile);
    this.discardPile = [top];
  }
}
