// Factory Function to Create the Player
const createPlayer = (_playerName, _playerAvatar, _playerMarker) => {

  // Private Player Variables
  let _playerScore = 0;
  let playerChoice = { 
    i: '',  
    j: ''
  }
  let isWinner = false;

  // Functions to get Player Information

  function getPlayerInformation () {
    const playerName = _playerName;
    const playerAvatar = _playerAvatar;
    const playerMarker = _playerMarker;
    const playerScore = _playerScore;

    return {
      playerName,
      playerAvatar,
      playerMarker,
      playerScore,
    }
  }

  // Functions to change the player
  const updateScore = () => { _playerScore++ }
  const resetPlayer = () => { _playerScore = 0 }
  const updatePlayerChoice = (i, j) => { 
    playerChoice.i = i;
    playerChoice.j = j;
  }
  const updateWinner = value => { isWinner = value }
  const checkWinner = () => { return isWinner }

  // Functions to Manipulate the Player

  return {
    getPlayerInformation,
    updateScore,
    updatePlayerChoice,
    playerChoice,
    resetPlayer,
    updateWinner,
    checkWinner
  }
}

const createAI = (_difficulty, _avatar, _marker) => {

  // AI Prototype
  let obj = Object.create(createPlayer('AI', _avatar, _marker))

  const { boardArray, scoreMap } = gameStateManager.requestState();

  // Lookup table for difficulty
  const difficultyMap = {
    easy: 0,
    medium: 8,
    hard: 8,
    unbeatable: 8
  }

  const depth = difficultyMap[_difficulty];

  function bestMove (players) {

    // Gets a copy of the gameboard
    let board = gameStateManager.getBoardCopy();
  
    // Gets the markers
    const playerMarker = 'O';
  
    // Easy just assigns a random move
    if (_difficulty === 'easy') {
      let moves = [];
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
          if (board[i][j] === '') { moves.push({i, j}) }
        }
      }
      const ind = Math.floor(Math.random() * moves.length);
      const move = moves[ind];
      boardArray[move.i][move.j] = playerMarker;
      gameboardDisplay.render(boardArray);
      return
    }
  
    // Unbeatable first blocks before minimaxing
    // Loop through the board and find an available spot
    if (_difficulty === 'unbeatable') {
      const playerMarker = 'O';
      const opponentMarker = 'X'
  
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
          // If a spot if empty go there
          if (board[i][j] === '') {
            board[i][j] = playerMarker;
            // If theres a win move to block or win
            if (gameStateManager.checkWin(board, players) === playerMarker) {
              boardArray[i][j] = playerMarker;
              gameboardDisplay.render(boardArray);
              return
            }
            board[i][j] = opponentMarker;
            if (gameStateManager.checkWin(board, players) === opponentMarker) {
              boardArray[i][j] = playerMarker;
              gameboardDisplay.render(boardArray);
              return
            }
            // Reset the position back after
            board[i][j] = '';
          }
        }
      }
    }
  
    // Opponent and Player havent won so move on to the minimax
    let bestScore = Infinity;
    let move;
  
    // Loop through the available spots
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        // If empty spot is founf go there
        if (board[i][j] === '') {
          board[i][j] = playerMarker;
  
          // Run minimax on the updated board
          let score = miniMax(board, depth, -Infinity, Infinity, true, players);
  
          // Reset the board
          board[i][j] = '';
  
          // Check score to see if it should be updated
          if (score < bestScore) {
            bestScore = score;
            // Assign move to the index found
            move = { i, j };
          }
        }
      }
    }

    if (_difficulty === 'medium') {
      const chance = Math.floor(Math.random() * 10)
        if (chance < 4) {
          let moves = [];
          for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
              if (board[i][j] === '') { moves.push({i, j}) }
            }
          }
          const ind = Math.floor(Math.random() * moves.length);
          move.i = moves[ind].i;
          move.j = moves[ind].j;
        }
      }
  
    // Update the actual board
    boardArray[move.i][move.j] = playerMarker;
    gameboardDisplay.render(boardArray);
  }

  function miniMax (board, depth, alpha, beta, isMax, players) {

    // Create a copy of the board to prevent mistakes
    const newBoard = JSON.parse(JSON.stringify(board));
  
    // Check the terminal states
    let result = gameStateManager.checkWin(newBoard, players)
    if (result !== false || depth === 0) { return  scoreMap[result] || 0}
    if (gameStateManager.isFull(newBoard)) { return scoreMap.tie }
  
  
    // Assign bestScore depending on if the player is Max or Min
    let bestScore = isMax ? -Infinity : Infinity;
    const playerMarker = isMax ? 'X' : 'O';
  
    // Loop through the board calling minimax on available positions
    loop1: for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard.length; j++) {
        if (newBoard[i][j] === '') {
          // If a spot is empty go there
          newBoard[i][j] = playerMarker;
  
          // Run minimax again
          let score = miniMax(newBoard, depth - 1, alpha, beta, !isMax, players);
  
          // Depending on the player, update the scores
          if (isMax) {
            bestScore = Math.max(score, bestScore);
  
            // Check alpha value for AB Pruning
            alpha = Math.max(alpha, bestScore);
          } else {
            bestScore = Math.min(score, bestScore);
  
            // Check beta value for AB Pruning
            beta = Math.min(beta, bestScore);
          }
  
          // Reset the position of the move made
          newBoard[i][j] = '';
  
          // If alpha is more than beta, prune the tree`
          if (alpha >= beta) { break loop1 }
        }
      }
    }
  
    // Return result
    return bestScore;
  }

  // AI difficulty mapped
  const getDifficulty = () => { return _difficulty };

  // AI Object
  obj = Object.assign(obj, { getDifficulty, bestMove });
  return obj;
}

const displayController = (() => {
  // Get the containers from the HTML
  const containers = [...document.querySelectorAll('.container')];
  const welcomeContainer = containers[0];
  const gameModeContainer = containers[1];
  const setUpContainer = containers[2];
  const gamePlayContainer = containers[3];
  const gameOverContainer = containers[4];

  // Function to create a node for a linked list
  function node (value) {
    let next = null;
    let prev = null;

    return {
      value,
      next,
      prev
    }
  } 

  // Linked List to associate the display
  function linkedList () {
    let head = null;
    let size = 0;

    // Check the size
    const isEmpty = () => { return size === 0 ? true : false }

    // More to intialise the list
    function prepend (value) {
      const newNode = node(value);
      if (!isEmpty()) { newNode.next = head; }
      head = newNode;
      size++
    }

    // Append new nodes
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

        if (value === gamePlayContainer) {
          newNode.prev = searchList(gameModeContainer).currNode;
        } else if (value === gameOverContainer) {
          newNode.prev = searchList(gamePlayContainer).currNode;
        } else {
          newNode.prev = prev;
        }
      }
      size++
    }

    // Get the value of the nodes
    function getValue (module) {
      const target = searchList(module);
      if (!target) { return }
      return target.currNode.value;
    }

    // Searches the list
    function searchList (module) {
      if (isEmpty()) { 
        console.log('Empty')
        return
      }

      let index = 0;
      let value = null;
      let currNode = head;

      while (currNode) {
        if (currNode.value === module) {
          value = currNode.value
          break
        }
        currNode = currNode.next;
        index++;
      }

      if (!value) {
        console.log('Not Found')
        return
      }

      return {
        index,
        value,
        currNode
      }
    }

    // Progress the containers forward
    function progressFlow (module) {
      const target = searchList(module).currNode;
      const next = target.next;
      hideModule(target);
      showModule(next);
    }

    // Moves the containers back
    function regressFlow (module) {
      const target = searchList(module).currNode
      const prev = target.prev;
      hideModule(target);
      showModule(prev);
    }

    // Hides Modules / Containers
    function hideModule (target) {
      target.value.classList.add('hidden');
    }

    // Shows the Modules / Container
    function showModule (target) {
      target.value.classList.remove('hidden')
    }

    // Print the list (more for debug reasons)
    function printList () {
      if (isEmpty()) { 
        console.log('Empty') 
        return
      }

      let curr = head;

      while (curr) {
        curr = curr.next;
      }
    }

    return {
      prepend,
      append,
      printList,
      progressFlow,
      regressFlow,
      getValue,
    }
  }

  // Create the linked list
  const containerList = linkedList();

  containerList.prepend(welcomeContainer);
  containerList.append(gameModeContainer);
  containerList.append(setUpContainer);
  containerList.append(gamePlayContainer);
  containerList.append(gameOverContainer);

  // Progress the game forward
  function progressGame (event) {
    // Declare target
    let target;

    // If the event was captured from a button 
    if (event.constructor.name !== 'PointerEvent') { 
      target = event 
    } else {
      target = event.target
    }

    while (!target.classList.contains('container')) {
      target = target.parentElement;
      if (target.nodeName === 'BODY') { return }
    }

    containerList.progressFlow(target)
  }

  function regressGame (event) {
    let target;

    if (event.constructor.name !== 'PointerEvent') { 
      target = event 
    } else {
      target = event.target
    }

    while (!target.classList.contains('container')) {
      target = target.parentElement;
      if (target.nodeName === 'BODY') { return }
    }

    containerList.regressFlow(target)
  }

  function setUpGameSelection (event) {
    const target = event.target
    if (!target.nodeName === 'BUTTON') {  return }
    const aiCard = document.querySelector('#ai-game');
    const humanCard = document.querySelector('#human-game');

    if (target.id === 'play-ai') {
      humanCard.classList.add('hidden');
      aiCard.classList.remove('hidden');
    } else {
      aiCard.classList.add('hidden');
      humanCard.classList.remove('hidden');
    }

    progressGame(event);
  }

  const getModules = () => {
    return {
      welcomeContainer,
      gameModeContainer,
      setUpContainer,
      gamePlayContainer,
      gameOverContainer
    }
  }

  return {
    progressGame,
    regressGame,
    setUpGameSelection,
    getModules
  }
})()

// Controles the game state
const gameStateManager = (() => {

  // Controls the type of game played
  let gameState = false;
  let gameType;
  const recentMove = {
    i: '',
    j: ''
  }

  // Connects the HTML
  const htmlBoard = document.querySelector('.gameboard');

  htmlBoard.addEventListener('click', e => {
    if (!e.target.classList.contains('square')) { return }
    if (e.target.textContent !== '') { return }
    const target = e.target;
    const { row } = target.dataset;
    const { ind } = target.dataset;
    recentMove.i = row;
    recentMove.j = ind;
    })

  // Global board array
  const boardArray = [
    ['','',''],
    ['','',''],
    ['','',''],
  ]

  // Magic square to map the index to magic square values
  const magicSquare = [
    [2, 7, 6],
    [9, 5, 1],
    [4, 3, 8]
  ]

  // Winning combinations for get win
  const winningCombinations = [
    [2, 7, 6],
    [9, 5, 1],
    [4, 3, 8],
    [2, 9, 4],
    [7, 5, 3],
    [6, 1, 8],
    [2, 5, 8],
    [4, 5, 6],
  ]

  // Score map for the minimax function
  const scoreMap = {
    X: 10,
    O: -10,
    tie: 0
  }

  let players = [];
  let currentPlayer;

  const newPlayers = () => { players = [] }

  // Functions that control access to the gameboard
  const getBoardCopy = () => { return JSON.parse(JSON.stringify(boardArray)) }
  const setGameState = value => { gameState = value }
  const setGameType = value => { gameType = value }

  // Gives access to the game state
  const requestState = () => {
    return {
      boardArray,
      htmlBoard,
      winningCombinations,
      scoreMap,
      gameState,
      gameType,
      magicSquare,
      players,
      currentPlayer
    }
  }

  function startGame () {
    players.push(setUpGameModule.createGamePlayers()[0], setUpGameModule.createGamePlayers()[1]);
    gameboardDisplay.updateDisplayMap(players);
    currentPlayer = players[0];
    gameState = true;
    gameboardDisplay.render(boardArray);
    htmlBoard.addEventListener('click', gameFlow)
  }

  function restartGame() {
    gameboardDisplay.clearBoard();
    players.forEach(player => player.resetPlayer());
  }

  function newGame () {
    newPlayers();
    document.querySelector('#player-name').value = '';
    document.querySelector('#player-1-name').value = '';
    document.querySelector('#player-2-name').value = '';
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
      marker.classList.remove('selected');
    })
    htmlBoard.removeEventListener('click', gameFlow);
    gameboardDisplay.clearBoard();
    gameType = '';
    gameState = false;
  }

  function gameFlow () {
    const { gamePlayContainer, gameOverContainer } = displayController.getModules()
    if (!gameState) { return }
    scoreDisplayModule.updatePlayerScore();
    currentPlayer.updatePlayerChoice(recentMove.i, recentMove.j);
    boardArray[currentPlayer.playerChoice.i][currentPlayer.playerChoice.j] = currentPlayer.getPlayerInformation().playerMarker;
    if (checkWin(boardArray, players) !== false) {
      let winner = checkWin(boardArray, players)
      players.forEach(player => {
        if (winner === player.getPlayerInformation().playerMarker) {
          player.updateWinner(true);
          gameOverContainer.classList.remove('hidden');
          gamePlayContainer.classList.add('hidden');
          gameOverModule.displayMessage();
          player.updateScore();
          gameState = false;
          return
        }
      })
    }
    if (!gameState) { return }
    gameboardDisplay.render(boardArray);
    if (isFull(boardArray)) {
      gameOverContainer.classList.remove('hidden');
      gamePlayContainer.classList.add('hidden');
      gameOverModule.displayMessage();
      return
    }
    if (gameType === 'ai') {
      players[1].bestMove(players);
      if (checkWin(boardArray, players) !== false) {
        let winner = checkWin(boardArray, players)
        players.forEach(player => {
          if (winner === player.getPlayerInformation().playerMarker) {
            player.updateWinner(true);
            gameOverContainer.classList.remove('hidden');
            gamePlayContainer.classList.add('hidden');
            gameOverModule.displayMessage();
            player.updateScore();
            gameState = false;
            return
          }
        })
      }
    } else {
      currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
      if (checkWin(boardArray, players) !== false) {
        let winner = checkWin(boardArray, players)
        players.forEach(player => {
          if (winner === player.getPlayerInformation().playerMarker) {
            player.updateWinner(true);
            gameOverContainer.classList.remove('hidden');
            gamePlayContainer.classList.add('hidden');
            gameOverModule.displayMessage();
            player.updateScore();
            gameState = false;
            return
          }
        })
      }
    }
  }

  // Function checks if the board is full
  function isFull (board) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j] === '') { return false }
      }
    }

    return true;
  }

  // Function checks the game state for win or tie
  function checkWin (board, players) {
    
    // Looping through the players
    for (let p = 0; p < players.length; p++) {

      // Get the playerMarker
      const playerMarker = players[p].getPlayerInformation().playerMarker;
      let moves = [];

      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
          if (board[i][j] === playerMarker) { moves.push(magicSquare[i][j]) }
        }
      }

      for (let comb of winningCombinations) {
        if (comb.every(val => moves.includes(val))) { return playerMarker }
      }
    }
    return false;
  }

  return {
    requestState,
    getBoardCopy,
    setGameState,
    isFull,
    checkWin,
    setGameType,
    startGame,
    restartGame,
    newGame
  }

})()

const gameOverModule = (() => {
  let winner = false;
  const {gameOverContainer, gamePlayContainer} = displayController.getModules();
  const para = gameOverContainer.querySelector('p')

  function displayMessage () {
    const { players } = gameStateManager.requestState();
    players.forEach(player => {
      if (player.checkWinner()) {
        winner = player;
      }
    })
    if (winner) {
      para.textContent = `${winner.getPlayerInformation().playerName} Wins!`
    } else {
      para.textContent = 'Tie Game, Play Again'
    }
    winner = false;
  }

  function hideModule () {
    para.textContent = '';
    gameOverContainer.classList.add('hidden');
    gamePlayContainer.classList.remove('hidden');
  }

  return {
    displayMessage,
    hideModule
  }

})()

const scoreDisplayModule = (() => {
  const playerOneName = document.querySelector('#player-1-name-display');
  const playerTwoName = document.querySelector('#player-2-name-display');
  const playerOneScore = document.querySelector('#player-1-score-display');
  const playerTwoScore = document.querySelector('#player-2-score-display');

  function updatePlayerScore () {
    const { players } = gameStateManager.requestState();
    playerOneName.textContent = players[0].getPlayerInformation().playerName;
    playerOneScore.textContent = players[0].getPlayerInformation().playerScore;
    playerTwoName.textContent = players[1].getPlayerInformation().playerName;
    playerTwoScore.textContent = players[1].getPlayerInformation().playerScore;
  }

  return {
    updatePlayerScore
  }
})()

const setUpGameModule = (() => {

  const markersList = [
    './icons/avatar.svg', 
    './icons/avatar (1).svg', 
    './icons/avatar (2).svg', 
    './icons/avatar (3).svg', 
    './icons/avatar (4).svg', 
    './icons/avatar (5).svg', 
    './icons/avatar (6).svg', 
    './icons/avatar (7).svg', 
    './icons/avatar (8).svg', 
  ]

  const humanCard = document.querySelector('.human');
  const aiCard = document.querySelector('.ai');
  const playerMarkers = document.querySelector('#player-markers');
  const playerOneMarkers = document.querySelector('#player-1-markers');
  const playerTwoMarkers = document.querySelector('#player-2-markers');

  playerMarkers.addEventListener('click', e => {
    const markers = playerMarkers.querySelectorAll('.marker');
    markers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        marker.classList.remove('selected');
      }
    })
    let target;
    if (e.target.nodeName === 'IMG') {
      target = e.target.parentElement;
    } else if (e.target.classList.contains('marker')) {
      target = e.target;
    } else {
      return
    }
    target.classList.add('selected');
  })

  playerOneMarkers.addEventListener('click', e => {
    const markers = playerOneMarkers.querySelectorAll('.marker');
    markers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        marker.classList.remove('selected');
      }
    })
    let target;
    if (e.target.nodeName === 'IMG') {
      target = e.target.parentElement;
    } else if (e.target.classList.contains('marker')) {
      target = e.target;
    } else {
      return
    }
    target.classList.add('selected');
  })

  playerTwoMarkers.addEventListener('click', e => {
    const markers = playerTwoMarkers.querySelectorAll('.marker');
    markers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        marker.classList.remove('selected');
      }
    })
    let target;
    if (e.target.nodeName === 'IMG') {
      target = e.target.parentElement;
    } else if (e.target.classList.contains('marker')) {
      target = e.target;
    } else {
      return
    }
    target.classList.add('selected');
  })

  const selectRandomAvatar = () => {
    const ind = Math.floor(Math.random() * (markersList.length - 1) )
    return markersList[ind];
  }

  function setUpAIGame() {
    const playerMarkersContainer = document.querySelector('#player-markers')
    const playerMarkers = playerMarkersContainer.querySelectorAll('.marker');
    let playerMarker = '';
    playerMarkers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        playerMarker = marker;
      }
    });
    const playerName = document.querySelector('#player-name').value !== '' ? document.querySelector('#player-name').value : 'Player';
    const aiDifficulty = document.querySelector('#difficulty').value;
    const playerAvatar = playerMarker !== '' ? playerMarker.firstChild.src : selectRandomAvatar();
    const aiAvatar = selectRandomAvatar(); 

    return {
      playerName,
      aiDifficulty,
      playerAvatar,
      aiAvatar
    }
  }

  function setUpHumanGame() {
    const playerOneMarkersContainer = document.querySelector('#player-1-markers');
    const playerOneMarkers = playerOneMarkersContainer.querySelectorAll('.marker');
    const playerTwoMarkersContainer = document.querySelector('#player-2-markers');
    const playerTwoMarkers = playerTwoMarkersContainer.querySelectorAll('.marker');
    let playerOneMarker = '';
    let playerTwoMarker = '';

    playerOneMarkers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        playerOneMarker = marker;
      }
    })
    playerTwoMarkers.forEach(marker => {
      if (marker.classList.contains('selected')) {
        playerTwoMarker = marker;
      }
    })

    const playerOneName = document.querySelector('#player-1-name').value !== '' ? document.querySelector('#player-1-name').value : 'Player One';
    const playerTwoName = document.querySelector('#player-2-name').value !== '' ? document.querySelector('#player-2-name').value : 'Player Two';
    const playerOneAvatar = playerOneMarker !== '' ? playerOneMarker.firstChild.src : selectRandomAvatar();
    const playerTwoAvatar = playerTwoMarker !== '' ? playerTwoMarker.firstChild.src : selectRandomAvatar();

    return {
      playerOneName,
      playerTwoName,
      playerOneAvatar,
      playerTwoAvatar
    }
  }

  function createGamePlayers () {
    const { gameType } = gameStateManager.requestState();
    if (gameType === 'ai') {
      const { playerName, aiDifficulty, playerAvatar, aiAvatar } = setUpAIGame();
      return [createPlayer(playerName, playerAvatar, 'X'), createAI(aiDifficulty, aiAvatar, 'O')]
    } else if (gameType === 'human') {
      const { playerOneName, playerTwoName, playerOneAvatar, playerTwoAvatar } = setUpHumanGame();
      return [createPlayer(playerOneName, playerOneAvatar, 'X'), createPlayer(playerTwoName, playerTwoAvatar, 'O')]
    } else {
      return 'error';
    }
  }

  function setUpCards() {
    const { gameType } = gameStateManager.requestState();
    if (gameType === 'ai') {
      showCard(aiCard);
      hideCard(humanCard);
    } else {
      showCard(humanCard);
      hideCard(aiCard);
    }
  }

  function showCard(card) {
    card.classList.remove('hidden');
  }

  function hideCard (card) {
    card.classList.add('hidden');
  }

  return {
    setUpCards,
    createGamePlayers
  }

})()

// Controls the HTML display
const gameboardDisplay = (() => {

  const displayMap = {
    X: '',
    O: '',
    '': ''
  }

  const updateDisplayMap = players => {
    displayMap.X = players[0].getPlayerInformation().playerAvatar;
    displayMap.O = players[1].getPlayerInformation().playerAvatar;
  }

  // Variables from the state manager
  const { htmlBoard, magicSquare } = gameStateManager.requestState()

  // Renders the board
  function render (board) {
    while (htmlBoard.firstChild) {htmlBoard.removeChild(htmlBoard.firstChild)}
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j< board[i].length; j++) {
        const square = document.createElement('div');
        const img = document.createElement('img');
        img.src = displayMap[board[i][j]];
        if (board[i][j] === 'X') {
          square.classList.add('player-1-selected')
        } else if (board[i][j] === 'O') {
          square.classList.add('player-2-selected')
        } 
        square.dataset.row = i;
        square.dataset.ind = j;
        square.dataset.value = magicSquare[i][j];
        square.classList.add('square');
        square.append(img);
        htmlBoard.append(square);
      }
    }
  }

  // Clears the board
  function clearBoard () {
    const { boardArray } = gameStateManager.requestState()
    while (htmlBoard.firstChild) {htmlBoard.removeChild(htmlBoard.firstChild)}
    for (let i = 0; i < boardArray.length; i++) {
      for (let j = 0; j < boardArray.length; j++) {
        boardArray[i][j] = '';
      }
    }
    render(boardArray);
  }

  return {
    render,
    clearBoard,
    updateDisplayMap
  }

})()

const eventBus = (() => {
  // Queries DOM for buttons
  const enterGameBtn = document.querySelector('#enter-btn');
  enterGameBtn.addEventListener('click', displayController.progressGame);

  const aiGameBtn = document.querySelector('#play-ai');
  const humanGameBtn = document.querySelector('#play-human');

  aiGameBtn.addEventListener('click', e => {
    displayController.progressGame(e);
    gameStateManager.setGameType('ai');
    setUpGameModule.setUpCards();
  })

  humanGameBtn.addEventListener('click', e => {
    displayController.progressGame(e);
    gameStateManager.setGameType('human');
    setUpGameModule.setUpCards();
  })

  const backBtns = document.querySelectorAll('.back-btn');
  backBtns.forEach(btn => { btn.addEventListener('click', displayController.regressGame) });

  const playGameBtns = document.querySelectorAll('.play-game-btn');
  playGameBtns.forEach(btn => { btn.addEventListener('click', e => {
      if (setUpGameModule.createGamePlayers() === 'error') { return }

      gameStateManager.startGame();
      displayController.progressGame(e)
    })
  })

  const resetBoardBtn = document.querySelector('#reset-btn');
  resetBoardBtn.addEventListener('click', gameboardDisplay.clearBoard);

  const restartBtn = document.querySelector('#restart-btn');
  restartBtn.addEventListener('click', gameStateManager.restartGame)

  const newGameBtn = document.querySelectorAll('.new-game-btn');
  newGameBtn.forEach(btn => { btn.addEventListener('click', e => {
    gameStateManager.newGame();
    displayController.regressGame(e);
  })})

  const continueButton = document.querySelector('#continue-btn');
  continueButton.addEventListener('click', () => {
    const { players } = gameStateManager.requestState();
    gameStateManager.setGameState(true);
    gameboardDisplay.clearBoard();
    gameOverModule.hideModule();
    scoreDisplayModule.updatePlayerScore();
    players.forEach(player => {
      player.updateWinner(false);
    })
  })
})()

const initalContainer = document.querySelector('.welcome');
document.addEventListener('DOMContentLoaded', () => {
  initalContainer.classList.remove('hidden');
})