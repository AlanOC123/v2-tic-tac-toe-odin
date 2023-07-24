const gameBoardModule = (() => {
  
})

const setUpGameModule = (() => {

})

const startGameModule = (() => {

})

// Welcome Module
const welcomeModule = (() => {

  const cacheDOM = () => {
    const mainBody = document.querySelector('body');
    const welcomeMessageModule = mainBody.querySelector('.welcome-message-module');
    const startGameButton = welcomeMessageModule.querySelector('#start-game');

    return {
      welcomeMessageModule,
      startGameButton
    }
  }

  const hideWelcomeScreen = () => {
    cacheDOM().welcomeMessageModule.style.opacity = '0';
    cacheDOM().welcomeMessageModule.style.scale = "1";
    cacheDOM().welcomeMessageModule.style.scale = '1';
    moveLeft();
  }

  const moveLeft = () => {
    const containers = document.querySelectorAll('.container')
    containers.forEach(container => {
      const timesMoved = Number(container.dataset.timesMoved);
      console.log(-100 * timesMoved);
      container.style.transform = `translateX(${(-100 * timesMoved)}%)`;
      container.dataset.timesMoved++;
    })
  }

  return {
    hideWelcomeScreen,
    cacheDOM
  }
})()

// Main Game Flow Module
const mainGameModule = (() => {

  //const startGameButton = document.querySelector('#start-game');
  //const playasAI = document.querySelector('#play-ai');

  // Event Listeners
  welcomeModule.cacheDOM().startGameButton.addEventListener('click', welcomeModule.hideWelcomeScreen)
})()