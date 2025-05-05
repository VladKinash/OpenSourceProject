export default class Card {
  constructor(color, value, type) {
    this.color = color;
    this.value = value;
    this.type = type;
  }

  static isValidPlay(topCard, cardToPlay) {
    if (cardToPlay.type === "wild" || cardToPlay.type === "wild_draw4") {
      return true;
    }
    if (topCard.color === cardToPlay.color) {
      return true;
    }
    if (
      cardToPlay.type === "number" &&
      topCard.type === "number" &&
      cardToPlay.value === topCard.value
    ) {
      return true;
    }
    if (cardToPlay.type !== "number" && cardToPlay.type === topCard.type) {
      return true;
    }
    return false;
  }
}
