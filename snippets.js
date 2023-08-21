
// Function that Renders and Gives Access to the Board
const gameBoardModule = (() => {

  let gameType = 'ai';

  const updateGameType = value => { gameType = value }

  // Private Gameboard Variables
  const _aiArray = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  const _humanArray = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]


  const _magicSquare = [
    [2, 7, 6],
    [9, 5, 1],
    [4, 3, 8],
  ]

  const renderMap = {
    '': '',
  }

  const getGameBoard = () => {
    const boardArray = gameType === 'ai' ? [..._aiArray] : [..._humanArray];
    const htmlBoard = document.querySelector(`#${gameType}`);
    const freeSpots = [];

    for (let i = 0; i < boardArray.length; i++) {
      for (let j = 0; j < boardArray[i].length; j++) {
        if (boardArray[i][j] === '') { freeSpots.push([i, j]) } 
      }
    }
    
    return {
      boardArray,
      htmlBoard,
      freeSpots
    }
  }

  function showBoard () {
    const id = gameType === 'ai' ? 'ai' : 'human'; 
    const module = document.querySelector(`#${id}`);
    if (!module.classList.contains(`hidden`)) { return }
    module.classList.remove(`hidden`);
  }

  function hideBoard () {
    const id = gameType === 'ai' ? 'ai' : 'human'; 
    const module = document.querySelector(`#${id}`);
    if (!module.classList.contains(`hidden`)) { return }
    module.classList.remove(`hidden`);
  }
  
  // Renders the Board to the Screen
  function render () {

    // Gets the board
    const boardArray = gameType === 'ai' ? _aiArray : _humanArray;
    const htmlBoard = document.querySelector(`#${gameType}`);

    // Gets the length
    const length = boardArray.length;

    // Loops through the rows
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < boardArray[i].length; j++) {
        const square = document.createElement('div');
        const img = document.createElement('img');
        square.textContent = boardArray[i][j];
        img.src = '';
        square.dataset.row = i + 1
        square.dataset.ind = j + 1
        square.dataset.val = _magicSquare[i][j];
        square.classList.add('square');
        square.append(img);
        htmlBoard.append(square);
      }
    }
  }

  render();

  const updateBoard = (cell) => {
    let boardArray = gameType === 'ai' ? _aiArray : _humanArray;
    let htmlBoard = document.querySelector(`#${gameType}`);

    while (htmlBoard.firstChild) { htmlBoard.removeChild(htmlBoard.firstChild) }
    console.log(cell[1]);
    boardArray[cell[0]][cell[1]] = 'X';
    render();
  } 


  function clearBoard () {

    let boardArray = gameType === 'ai' ? _aiArray : _humanArray;
    let htmlBoard = document.querySelector(`#${gameType}`);

    // Clears Board
    while (htmlBoard.firstChild) { htmlBoard.removeChild(htmlBoard.firstChild) }

    for (let i = 0; i < boardArray.length; i++) {
      for (let j = 0; j < boardArray.length; j++) {
        boardArray[i][j] = '';
      }
    }
  }

  function resetBoard () {
    clearBoard();
    render();
  }

  // Returns public methods
  return {
    render,
    updateBoard,
    resetBoard,
    clearBoard,
    hideBoard,
    showBoard,
    updateGameType,
    getGameBoard
  }
})()

function miniMax (board, depth, alpha, beta, isMax) {

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
        let score = miniMax(newBoard, depth - 1, alpha, beta, !isMax);

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



const aiStrategies = {
  randomMove: function(board) {
    let moves = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j] === '') { moves.push({i, j}) }
      }
    }
    const ind = Math.floor(Math.random() * moves.length);
    return moves[ind];
  },
  findWin: function(board, players) {
    const playerMarker = 'O';
    const opponentMarker = 'X'

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        // If a spot if empty go there
        if (board[i][j] === '') {
          board[i][j] = playerMarker;
          // If theres a win move to block or win
          if (gameStateManager.checkWin(board, players) === playerMarker) {
            return { i, j };
          }
          board[i][j] = opponentMarker;
          if (gameStateManager.checkWin(board, players) === opponentMarker) {
            return { i, j };
          }
          // Reset the position back after
          board[i][j] = '';
        }
      }
    }
    return false;
  }
}

function aiMakesMove (strategy, players) {
  return aiStrategies[strategy](gameStateManager.getBoardCopy(), players);
}                                               
