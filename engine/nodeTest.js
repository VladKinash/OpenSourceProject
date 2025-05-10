const Game = require('./Game');
const Card = require('./card');
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateRound(playerNames) {
  const game = new Game(playerNames);
  game.startGame();

  while (!game.isOver) {
    const idx = game.currentPlayerIndex;
    const top = game.getTopCard();
    const hand = game.players[idx].hand;
    let playable = hand.filter(c => Card.isValidPlay(top, c));

    if (playable.length > 0) {
      const card = rand(playable);
      const cardIndex = hand.indexOf(card);
      const chosenColor =
        card.type === 'wild' || card.type === 'wild_draw4'
          ? rand(['red','yellow','green','blue'])
          : null;
      game.playCard(idx, cardIndex, chosenColor);

    } else {
      const drawn = game.deck.drawCard();
      game.players[idx].hand.push(drawn);

      if (Card.isValidPlay(top, drawn)) {
        const chosenColor =
          drawn.type === 'wild' || drawn.type === 'wild_draw4'
            ? rand(['red','yellow','green','blue'])
            : null;
        game.playCard(idx, game.players[idx].hand.length - 1, chosenColor);
      } 
      game.advanceTurn();
    }
  }

  console.log('Final scores:', game.scores);
}

simulateRound(['Alice','Bob']);
