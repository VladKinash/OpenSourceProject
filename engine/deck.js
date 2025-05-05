import Card from './card';

export default class Deck {
  constructor() {
    this.deck = this.shuffle(this.build());
    this.discardPile = [];
  }

  build() {
    const colors = ['red', 'yellow', 'green', 'blue'];
    const cards = [];

    for (const color of colors) {
      cards.push(new Card(color, 0, 'number'));
      for (let i = 1; i <= 9; i++) {
        cards.push(new Card(color, i, 'number'));
        cards.push(new Card(color, i, 'number'));
      }
      for (const type of ['skip', 'reverse', 'draw2']) {
        cards.push(new Card(color, null, type));
        cards.push(new Card(color, null, type));
      }
    }

    for (let i = 0; i < 4; i++) {
      cards.push(new Card(null, null, 'wild'));
      cards.push(new Card(null, null, 'wild_draw4'));
    }

    return cards;
  }

  shuffle(array = this.deck) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    this.deck = this.shuffle(this.discardPile);
    this.discardPile = [top];
  }
}
