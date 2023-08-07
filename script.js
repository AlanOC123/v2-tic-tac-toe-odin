const displayController = (() => {
  const parent = document.querySelector('body');
  const containers = [...document.querySelectorAll('.container')];
  const welcomeContainer = containers[0];
  const gameModeContainer = containers[1];
  const setUpContainer = containers[2];
  const gamePlayContainer = containers[3];
  const gameOverContainer = containers[4];

  function node (value) {
    let next = null;
    let prev = null;

    return {
      value,
      next,
      prev
    }
  } 

  function linkedList () {
    let head = null;
    let size = 0;

    const isEmpty = () => { return size === 0 ? true : false }
    const getSize = () => { return size }

    function prepend (value) {
      const newNode = node(value);
      if (!isEmpty()) { newNode.next = head; }
      head = newNode;
      size++
    }

    function append (value) {
      const newNode = node (value);

      if (isEmpty()) { 
        head = newNode;
      } else {
        let prev = head;
        while (prev.next) {
          prev = prev.next;
        }
        prev.next = newNode;

        if (value === gameOverContainer || value === gamePlayContainer) {
          newNode.prev = searchList(gameModeContainer).curr;
        } else {
          newNode.prev = prev;
        }
      }
      size++
    }

    function searchList (module) {
      if (isEmpty()) { 
        console.log('Empty')
        return
      }

      let index = 0;
      let value = null;
      let curr = head;

      while (curr) {
        if (curr.value === module) {
          value = curr.value
          break
        }
        curr = curr.next;
        index++;
      }

      if (!value) {
        console.log('Not Found')
        return
      }

      return {
        index,
        value,
        curr
      }
    }

    function progressFlow (module) {
      if (module === gameOverContainer) { return }
      const target = searchList(module).curr;
      const next = target.next;
      hideModule(target);
      showModule(next);
    }

    function regressFlow (module) {
      console.log(module)
      if (!(module === gameOverContainer || module === gamePlayContainer)) { return }
      const target = searchList(module).curr
      hideModule(target);
      showModule(target.prev);
    }

    function hideModule (target) {
      target.value.classList.add('hidden');
    }

    function showModule (target) {
      target.value.classList.remove('hidden')
    }

    function printList () {
      if (isEmpty()) { 
        console.log('Empty') 
        return
      }

      let curr = head;

      while (curr) {
        console.log(curr)
        curr = curr.next;
      }
    }

    return {
      isEmpty,
      getSize,
      prepend,
      append,
      printList,
      progressFlow,
      regressFlow
    }
  }

  const containerList = linkedList();

  containerList.prepend(welcomeContainer);
  containerList.append(gameModeContainer);
  containerList.append(setUpContainer);
  containerList.append(gamePlayContainer);
  containerList.append(gameOverContainer);
  containerList.regressFlow(gamePlayContainer);



  const getContainers = () => {
    return {
      parent,
      welcomeContainer,
      gameModeContainer,
      setUpContainer,
      gamePlayContainer,
      gameOverContainer
    }
  }

  return {
    getContainers,
  }
})()

const gameOverModule = (() => {
  const container = document.querySelector('.game-over');
  const para = container.querySelector('p')
  
  function hideModule () {
    container.classList.add('hidden');
  }

  function showModule (text) {
    para.textContent = text;
    container.classList.remove('hidden');
  }

  return {
    hideModule,
    showModule
  }

})()

const scoreDisplayModule = (() => {
  const playerOneScore = document.querySelector('#player-1-score');
  const playerTwoScore = document.querySelector('#player-2-score');

  function updatePlayerScore (players) {
    playerOneScore.textContent = `${players[0].getPlayerName()} Score: ${players[0].getPlayerScore()}`;
    playerTwoScore.textContent = `${players[1].getPlayerName()} Score: ${players[1].getPlayerScore()}`;
  }

  return {
    updatePlayerScore
  }
})()

// Function that Renders and Gives Access to the Board
const gameBoardModule = (() => {

  const container = document.querySelector('.game');

  function hideModule () {
    container.classList.add('hidden');
  }

  function showModule () {
    container.classList.remove('hidden');
  }

  // Private Gameboard Variables
  const _gameBoard = [
    '', '','', // Row 1
    '', '','', // Row 2
    '', '','', // Row 3
  ]

  const _magicSquare = {
    0: 2, 1: 7, 2: 6, // Row 1
    3: 9, 4: 5, 5: 1, // Row 2
    6: 4, 7: 3, 8: 8, // Row 3
  };

  const _board = document.querySelector('.gameboard');
  
  // Renders the Board to the Screen
  function render () {
    for (let i = 0; i < _gameBoard.length; i++) {
      const square = document.createElement('div');
      square.dataset.index = i + 1;
      square.dataset.value = _magicSquare[i];
      square.classList.add('square');
      square.textContent = _gameBoard[i];
      _board.append(square);
    }
  }

  // Allows Private Access to the board for Other Modules
  const getGameBoard = () => { return _board }

  // Functions that Manipulate the Board

  // Updates the board with new values
  function updateBoard (cell, marker) {

    // Updates the Board
    while (_board.firstChild) { _board.removeChild(_board.firstChild) }
    _gameBoard[cell.index - 1] = marker;

    // Rerenders the Board with updated values
    gameBoardModule.render();
  }

  function clearBoard () {
    // Clears Board
    while (_board.firstChild) { _board.removeChild(_board.firstChild) }

    for (let i = 0; i < _gameBoard.length; i++) {
      _gameBoard[i] = '';
    }
  }

  function resetBoard () {
    clearBoard();
    render();
    console.clear();
  }

  // Returns public methods
  return {
    hideModule,
    showModule,
    render,
    getGameBoard,
    updateBoard,
    resetBoard,
    clearBoard,
  }
})()

// Factory Function to Create the Player
const createPlayer = (_playerName, _playerMarker) => {

  // Private Player Variables
  let _moveset = [];
  let _playerMoves = 0;
  let _playerScore = 0;

  // Functions to get Player Information
  const getPlayerName = () => { return _playerName }
  const getPlayerMarker = () => { return _playerMarker }
  const getPlayerScore = () => { return _playerScore }

  // Functions to Manipulate the Player
  function checkForWin() {

    if (_playerMoves < 3) { return false }

    let winningValue = 15;
    let sum = 0;
    let won = false;
    
    loop1: for (let i = 0; i < _playerMoves - 2; i++) {
      sum = 0;
      loop2: for (let j = i + 1; j < _playerMoves - 1; j++) {
        sum = _moveset[i] + _moveset[j];
        if (winningValue - sum > 9) { 
          continue loop2 
        }
        for (let a = j + 1; a < _playerMoves; a++) {
          sum = _moveset[i]+ _moveset[j] + _moveset[a];
          console.log(`${_moveset[i]} + ${_moveset[j]} + ${_moveset[a]} = ${sum}`)
          if (sum === winningValue) { 
            won = true;
            break loop1;
          }
        }
      }
    }

    if (_playerMoves === 5 && !(won)) { return 'Draw' }

    if (won) { _playerScore++ }

    return won;
  }

  function updateMoveset (value) {
    _moveset.push(Number(value));
    _playerMoves++;
  }

  function resetPlayers () {
      _moveset = [];
      _playerMoves = 0;
  }

  return {
    getPlayerName,
    getPlayerMarker,
    getPlayerScore,
    updateMoveset,
    checkForWin,
    resetPlayers
  }
}

// Controls the Flow of the Game
const gameFlow = (() => {

  // Set up Game Variables
  let players = [];
  let currentPlayerIndex = 0;
  let gameOver = false;
  let start = false;

  // Start the game
  function startGame () {
    const btn = document.querySelector('#start-btn');
    gameOver = false;
    currentPlayerIndex = 0;

    // Render the board
    gameBoardModule.render()

    // Create players and add them to the game
    players = [
      createPlayer(document.querySelector('#player-1').value, 'X'),
      createPlayer(document.querySelector('#player-2').value, 'O')
    ];

    scoreDisplayModule.updatePlayerScore(players);
    start = true;
    if (start) { 
      btn.textContent = 'New Game';
      btn.removeEventListener('click', startGame)
    }
  }

  function resetGame () {
    if (!start) { return }
    players.forEach(player => player.resetPlayers())
    gameBoardModule.resetBoard();
    currentPlayerIndex = 0;
  }

  function registerMove (event) {

    // Checks if a valid target was clicked
    if (!event.target.classList.contains('square')) { return }

    // Checks if the target already has a marker in it
    if (!event.target.textContent == '') { return }

    // Gets the target
    const target = event.target;
    const { index, value } = target.dataset;
    const cell = {index, value};

    // Updates the board with the marker that was clicked
    gameBoardModule.updateBoard(cell, players[currentPlayerIndex].getPlayerMarker());
    players[currentPlayerIndex].updateMoveset(cell.value);
    gameOver = players[currentPlayerIndex].checkForWin();

    endGame(gameOver);

    // If the game continues assign the next player the controlling index
    if (!gameOver) { currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0 }
  }

  // Updates the board with the new information

  function endGame (gameOver) {
    if (!gameOver) { return }
    let text;
    if (gameOver === 'Draw') {text = 'The Game is a Tie, Play Again?'}
    if (gameOver) {text = `${players[currentPlayerIndex].getPlayerName()} has won`}
    if (gameOver) {players[currentPlayerIndex]}
    document.querySelector('#player-1').value = '';
    document.querySelector('#player-2').value = '';
    gameBoardModule.hideModule();
    gameOverModule.showModule(text);
  }

  function newGame () {
    gameOverModule.hideModule()
    gameBoardModule.showModule()
    gameBoardModule.clearBoard();
    scoreDisplayModule.updatePlayerScore(players);

    players = [];
    start = false;
  }

  return {
    registerMove,
    startGame,
    currentPlayerIndex,
    resetGame,
    newGame
  }

})()

const eventBus = (() => {
  // Queries DOM for buttons
  const startGameBtn = document.querySelector('#start-btn');
  const restartGameBtn = document.querySelector('#restart-btn');
  const playAgainButton = document.querySelector('#play-again');
  const board = gameBoardModule.getGameBoard();

  // Adds event listeners to the buttons
  // startGameBtn.addEventListener('click', gameFlow.startGame);
  // restartGameBtn.addEventListener('click', gameFlow.resetGame);
  // playAgainButton.addEventListener('click', gameFlow.newGame)
  // board.addEventListener('click', gameFlow.registerMove);
})()

const welcomeModule = (() => {
  const continueButton = document.querySelector('#continue-button');
})()