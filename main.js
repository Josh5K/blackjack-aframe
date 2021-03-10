const dealerVisable = document.getElementById("dealer-visable")
const dealerHidden = document.getElementById("dealer-hidden")
const playerVisable = document.getElementById("player-visable")
const playerHidden = document.getElementById("player-hidden")
const scene = document.querySelector('a-scene')
const camera = document.getElementById('camera')

var playerCards = []
var dealerCards = []
var gameDeck;
var currentOffset = -1.2
var dealerCurrentOffset = -1.2
var dealerY = 6
var playerZ = -6.2
var dealerZ = -13

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
  winnerText.setAttribute('position', '-1.5 4 -10')
  winnerText.setAttribute('scale', '3 3 3')
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
      camera.appendChild(winnerText);
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
      camera.appendChild(winnerText);
      console.log(`${dealerScore}/${playerScore}`)
      return;
    }
  }

  console.log(`${dealerScore}/${playerScore}`)
  let winner = dealerScore > playerScore ? 'Dealer' : 'Player'
  winnerText.setAttribute('value', `${winner} Wins!`)
  camera.appendChild(winnerText);
  console.log(`${winner} Wins!`)
}

function pushCardToScreen(card, x, y, z) {
  cardPlane = document.createElement('a-plane')
  cardPlane.setAttribute('height', '1')
  cardPlane.setAttribute('width', '.75')
  cardPlane.setAttribute('position', `${x} ${y} ${z}`)
  cardPlane.setAttribute('rotation', '-90 0 0')
  cardPlane.setAttribute('src', `assets/${card.toString()}.png`)
  cardPlane.setAttribute('class', 'additional-cards')
  scene.appendChild(cardPlane);
}

function clearBoard() {
  currentOffset = -1.2
  dealerCurrentOffset = -1.2
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

function hit_event() {
  let dealerScore = 0
  let playerCard = gameDeck.deal()

  playerCards.push(playerCard)
  pushCardToScreen(playerCard, currentOffset, -.5, playerZ)
  currentOffset += .9

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
    pushCardToScreen(dealerCard, dealerCurrentOffset, -.5, dealerZ)
    dealerCurrentOffset += .9
  }
}

function stand_event() {
  dealerHidden.setAttribute('src', `assets/${dealerCards[0].toString()}.png`)
  let dealerScore = 0
  dealerCards.forEach(card => {
    dealerScore += card.getNumericValue();
  });
  while(dealerScore < 17) {
    let dealerCard = gameDeck.deal()
    dealerCards.push(dealerCard)
    pushCardToScreen(dealerCard, dealerCurrentOffset, -.5, dealerZ)
    dealerCurrentOffset += .9
    dealerScore = 0
    dealerCards.forEach(card => {
      dealerScore += card.getNumericValue();
    });
  }
  calculateScore()
}

function start_event() {
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
}

function hide_event() {
  let control_elements = document.getElementsByClassName('controls');
  for (let i=0; i < control_elements.length; i++) {
    control_elements[i].setAttribute("visible", !control_elements[i].getAttribute("visible"))
  }
}

document.addEventListener('keydown', function(event) {
  switch(event.code) {
    case "KeyZ":
      start_event()
      break;
    case "KeyX":
      hit_event()
      break;
    case "KeyC":
      stand_event();
      break;
    case "KeyH":
      hide_event();
      break;
    default:
      // code block
  }
});

//Github Pages implements some aggressive caching. Load new versions of the page if there's an update
document.addEventListener('load', function(e) {

  document.applicationCache.addEventListener('updateready', function(e) {
    if (document.applicationCache.status == window.applicationCache.UPDATEREADY) {
      document.applicationCache.swapCache();
      if (confirm('A new version of this site is available. Load it?')) {
        document.location.reload();
      }
    }
  }, false);

}, false);

