const dealerVisable = document.getElementById("dealer-visable")
const dealerHidden = document.getElementById("dealer-hidden")
const playerVisable = document.getElementById("player-visable")
const playerHidden = document.getElementById("player-hidden")
const scene = document.querySelector('a-scene')

var playerCards = []
var dealerCards = []
var gameDeck;
var currentOffset = -4
var dealerCurrentOffset = -4
var dealerY = 6

function Deck() {
  let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let suits = [ 'C', 'H', 'S', 'D'];
  this.deck = [];

  for (var i = 0; i < suits.length; i++) {
    for (var j = 0; j < values.length; j++) {
      this.deck.push(new Card(values[j], suits[i]));
    }
  }

  this.toString = function () {
      return '[' + this.deck.join(', ') + ']';
  };

  this.shuffle = function () {
      for (var i = 0; i < this.deck.length; i++)
          this.deck[i] = this.deck.splice(
              parseInt(this.deck.length * Math.random()), 1, this.deck[i])[0];
  };

  this.deal = function () {
      return this.deck.shift();
  };
}

function Card(value, suit) {
  this.value = value;
  this.suit = suit;

  this.toString = function () {
      return this.value + this.suit;

  };

  this.getNumericValue = function (aceValue = 11) {
    if(['J', 'Q', 'K'].includes(this.value)) {
      return 10;
    }
    else if(this.value == 'A') {
      return aceValue
    }
    return parseInt(this.value)
  }
}

function calculateScore() {
  let playerScore = 0;
  let dealerScore = 0;
  let winnerText = document.createElement('a-text')
  winnerText.setAttribute('position', '0 -3 -10')
  winnerText.setAttribute('scale', '3 3 3')
  winnerText.setAttribute('color', 'black')
  winnerText.setAttribute('class', 'winner-text')

  playerCards.forEach(card => {
    playerScore += card.getNumericValue();
  });

  if(playerScore > 21) {
    playerScore = 0;
    playerCards.forEach(card => {
      playerScore += card.getNumericValue(1);
    });
    if(playerScore > 21) {
      console.log('Dealer Wins!');
      winnerText.setAttribute('value', "Dealer Wins!")
      scene.appendChild(winnerText);
      console.log(`${dealerScore}/${playerScore}`)
      return;
    }
  }

  dealerCards.forEach(card => {
    dealerScore += card.getNumericValue();
  });

  if(dealerScore > 21) {
    dealerScore = 0;
    dealerCards.forEach(card => {
      dealerScore += card.getNumericValue(1);
    });
    if(dealerScore > 21) {
      console.log('Player Wins!');
      winnerText.setAttribute('value', "Player Wins!")
      scene.appendChild(winnerText);
      console.log(`${dealerScore}/${playerScore}`)
      return;
    }
  }

  console.log(`${dealerScore}/${playerScore}`)
  let winner = dealerScore > playerScore ? 'Dealer' : 'Player'
  winnerText.setAttribute('value', `${winner} Wins!`)
  scene.appendChild(winnerText);
  console.log(`${winner} Wins!`)
}

function pushCardToScreen(card, x, y = 0) {
  cardPlane = document.createElement('a-plane')
  cardPlane.setAttribute('height', '5')
  cardPlane.setAttribute('width', '4')
  cardPlane.setAttribute('position', `${x} ${y} -10`)
  cardPlane.setAttribute('src', `assets/${card.toString()}.png`)
  cardPlane.setAttribute('class', 'additional-cards')
  scene.appendChild(cardPlane);
}

function clearBoard() {
  currentOffset = -4
  dealerCurrentOffset = -4
  let winnerElements = document.getElementsByClassName('winner-text');
  dealerHidden.setAttribute('src', `assets/cardback.jpg`)
  while(winnerElements.length > 0){
    winnerElements[0].parentNode.removeChild(winnerElements[0]);
  }
  let elements = document.getElementsByClassName('additional-cards');
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}

document.querySelector('#hit-button').addEventListener('click', function() {
  let dealerScore = 0
  let playerCard = gameDeck.deal()

  playerCards.push(playerCard)
  pushCardToScreen(playerCard, currentOffset)
  currentOffset += 4

  dealerCards.forEach(card => {
    dealerScore += card.getNumericValue();
  });

  if(dealerScore > 21) {
    dealerScore = 0;
    dealerCards.forEach(card => {
      dealerScore += card.getNumericValue(1);
    });
  }

  if(17 > dealerScore) {
    let dealerCard = gameDeck.deal()
    dealerCards.push(dealerCard)
    pushCardToScreen(dealerCard, dealerCurrentOffset, dealerY)
    dealerCurrentOffset += 4
  }
});

document.querySelector('#stand-button').addEventListener('click', function() {
  dealerHidden.setAttribute('src', `assets/${dealerCards[0].toString()}.png`)
  let dealerScore = 0
  dealerCards.forEach(card => {
    dealerScore += card.getNumericValue();
  });
  while(dealerScore < 17) {
    let dealerCard = gameDeck.deal()
    dealerCards.push(dealerCard)
    pushCardToScreen(dealerCard, dealerCurrentOffset, dealerY)
    dealerCurrentOffset += 4
    dealerScore = 0
    dealerCards.forEach(card => {
      dealerScore += card.getNumericValue();
    });
  }
  calculateScore()
});

document.querySelector('#start-button').addEventListener('click', function() {
  clearBoard()
  playerCards = []
  dealerCards = []
  gameDeck = new Deck();
  gameDeck.shuffle();
  for (let i=0; i <= 1; i++) {
    let playerCard = gameDeck.deal()
    let dealerCard = gameDeck.deal()
    playerCards.push(playerCard)
    dealerCards.push(dealerCard)
  }
  dealerVisable.setAttribute('src', `assets/${dealerCards[1].toString()}.png`)
  playerVisable.setAttribute('src', `assets/${playerCards[0].toString()}.png`)
  playerHidden.setAttribute('src', `assets/${playerCards[1].toString()}.png`)
});
