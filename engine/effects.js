export default class Effects {
  static apply(game, card, chosenColor) {
    switch (card.type) {
      case "skip":
        game.advanceTurn(); // skip next
        break;
      case "reverse":
        game.direction *= -1;
        if (game.players.length === 2) game.advanceTurn();
        break;
      case "draw2":
        game.advanceTurn();
        game.drawForCurrentPlayer(2);
        break;
      case "wild":
        card.color = chosenColor;
        break;
      case "wild_draw4":
        card.color = chosenColor;
        game.advanceTurn();
        game.drawForCurrentPlayer(4);
        break;
    }
  }
}
