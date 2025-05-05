import Card from "./card";

class Player{
    constructor(name){
        this.name = name;
        this.hand = [];
    }

    drawCard(deck) {
        const card = deck.shift(); 
        if (card) this.hand.push(card);
    }

    hasPlayableCard(topCard) {
        return this.hand.some(card => Card.isValidPlay(topCard, card));
    }

    getPlayableCards(topCard) {
        return this.hand.filter(card => Card.isValidPlay(topCard, card));
    }

}
