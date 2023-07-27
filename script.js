const setUpGameModule = (function() {

  function cacheDOM() {
    const playerName = document.querySelector('#player-name')
    const playerOneMarkerContainer = document.querySelector('#player-one')
    const playerOneMarkers = playerOneMarkerContainer.querySelectorAll('.marker')
    const aiDifficulty = document.querySelector('#difficulty');
    const aiMarkerContainer = document.querySelector('#ai');
    const aiMarkers = aiMarkerContainer.querySelector('.marker');

    return {
      playerName,
      playerOneMarkers,
      aiDifficulty,
      aiMarkers
    }
  }

  console.log(cacheDOM().aiDifficulty);
})()

const startGameModule = (function() {
  function cacheDOM() {
    const playAIButton = document.querySelector('#play-ai');
    const playHumanButton = document.querySelector('#play-human');

    return {
      playAIButton,
      playHumanButton,
    }
  }



  return {
    cacheDOM
  }

})()

const welcomeModule = (function() {

  function cacheDOM() {
    const startButton = document.querySelector('#start-game');

    return {
      startButton
    }
  }

  return {
    cacheDOM
  }
})()

const mainGame = (function() {

  const { welcomeContainer, startGameContainer, setUpGameContainer, gameBoardContainer } = cacheDOM();

  function cacheDOM() {
    let modules = document.querySelectorAll('.container');
    modules = [...modules];
    const [ welcomeContainer, startGameContainer, setUpGameContainer, gameBoardContainer] = modules;

    return {
      welcomeContainer,
      startGameContainer,
      setUpGameContainer,
      gameBoardContainer
    }
  }

  function hideModule (module) {
    const style = module.style;
    if (module.classList.contains('start-game-module')) {
      style.transformOrigin = 'top';
      style.transform = 'translateY(-100%)'
    } else {
      style.transformOrigin = 'left';
      style.transform = 'translateX(-100%)';
    }
    
    style.opacity = '0';
    style.transition = 'all 300ms ease-in-out'
  }

  function showModule (module) {
    const style = module.style;
    if (module.classList.contains('set-up-game-module')) {
      style.transformOrigin = 'bottom;'
    } else {
      style.transformOrigin = 'right';
    }
    style.opacity = style.scale = '1';
    style.transition = 'all 300ms ease-in-out'
  }

  function startGame () {
    hideModule(welcomeContainer);
    showModule(startGameContainer);
  }

  function setUpGame () {
    hideModule(startGameContainer);
    showModule(setUpGameContainer);
  }

  welcomeModule.cacheDOM().startButton.addEventListener('click', startGame);
  startGameModule.cacheDOM().playAIButton.addEventListener('click', setUpGame);
})()