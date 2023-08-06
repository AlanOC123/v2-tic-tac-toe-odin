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

  // Functions to get Player Information
  const getPlayerName = () => { return _playerName }
  const getPlayerMarker = () => { return _playerMarker }

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
    if (start) { return }
    console.log(1);
    gameOver = false;
    currentPlayerIndex = 0;

    // Render the board
    gameBoardModule.render()

    // Create players and add them to the game
    players = [
      createPlayer(document.querySelector('#player-1').value, 'X'),
      createPlayer(document.querySelector('#player-2').value, 'O')
    ];
    start = true;
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
    document.querySelector('#player-1').value = '';
    document.querySelector('#player-2').value = '';
    gameBoardModule.hideModule();
    gameOverModule.showModule(text);
  }

  function newGame () {
    gameOverModule.hideModule()
    gameBoardModule.showModule()
    gameBoardModule.clearBoard();

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
  startGameBtn.addEventListener('click', gameFlow.startGame);
  restartGameBtn.addEventListener('click', gameFlow.resetGame);
  playAgainButton.addEventListener('click', gameFlow.newGame)
  board.addEventListener('click', gameFlow.registerMove);
})()