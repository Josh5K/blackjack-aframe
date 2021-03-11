const dealerVisable = document.getElementById("dealer-visable")
const dealerHidden = document.getElementById("dealer-hidden")
const playerVisable = document.getElementById("player-visable")
const playerHidden = document.getElementById("player-hidden")
const scene = document.querySelector('a-scene')
const camera = document.getElementById('camera')
const playerScoreElement = document.getElementById("player-count")
const dealerScoreElement = document.getElementById("dealer-count")

var playerCards = []
var dealerCards = []
var gameDeck;
var currentOffset = -1.2
var dealerCurrentOffset = -1.2
var dealerY = 6
var playerZ = -6.2
var dealerZ = -13
var winner = false;

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

function getCardsScore(cards) {
  let score = 0;
  cards.forEach(card => {
    score += card.getNumericValue();
  });

  if(score > 21) {
    score = 0;
    cards.forEach(card => {
      score += card.getNumericValue(1);
    });
  }

  return score
}

function checkForWinner() {
  let playerScore = getCardsScore(playerCards);
  let playerBust = checkForBust(playerScore);
  let dealerScore = getCardsScore(dealerCards);
  let dealerBust = checkForBust(dealerScore);

  if(playerBust) {
    win("Dealer")
    return true;
  }
  else if(dealerBust) {
    win("Player")
    return true;
  }
  return false;
}

function win(winnerName) {
  let winnerText = document.createElement('a-text')
  winnerText.setAttribute('position', '-1.5 1 -10')
  winnerText.setAttribute('scale', '3 3 3')
  winnerText.setAttribute('class', 'winner-text')
  winnerText.setAttribute('value', `${winnerName} Wins!`)
  scene.appendChild(winnerText);
  dealerHidden.setAttribute('src', `assets/${dealerCards[0].toString()}.png`)
  winner = true;
}

function checkForBust(score) {
  return score > 21;
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
  winner = false;
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
  if (winner) return;
  let playerCard = gameDeck.deal()

  playerCards.push(playerCard)
  pushCardToScreen(playerCard, currentOffset, -.5, playerZ)
  currentOffset += .9
  if(!checkForWinner()) {
    let dealerScore = getCardsScore(dealerCards)

    if(17 > dealerScore) {
      let dealerCard = gameDeck.deal()
      dealerCards.push(dealerCard)
      pushCardToScreen(dealerCard, dealerCurrentOffset, -.5, dealerZ)
      dealerCurrentOffset += .9
    }
    checkForWinner();
  }
  setScores();
}

function simDealerPlay() {
  while(getCardsScore(dealerCards) < 17) {
    let dealerCard = gameDeck.deal()
    dealerCards.push(dealerCard)
    pushCardToScreen(dealerCard, dealerCurrentOffset, -.5, dealerZ)
    dealerCurrentOffset += .9
    if(checkForWinner()) return true;
  }
  return false
}

function stand_event() {
  if(winner) return;
  if (!simDealerPlay()) {
    let playerScore = getCardsScore(playerCards)
    let dealerScore = getCardsScore(dealerCards)
    playerScore >= dealerScore ? win("Player") : win("Dealer")
  }
  setScores();
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
  setScores();
}

function setScores() {
  playerScore = getCardsScore(playerCards)
  dealerScore = getCardsScore(dealerCards)

  if(!winner) {
    dealerScore -= dealerCards[0].getNumericValue();
  }

  playerScoreElement.setAttribute("text", `value: Player: ${playerScore}`)
  dealerScoreElement.setAttribute("text", `value: Dealer: ${dealerScore}`)
}

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

