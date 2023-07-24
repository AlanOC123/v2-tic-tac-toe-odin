// Main Game Flow Module
const mainGameModule = (() => {

  const cacheDOM = () => {
    return {
      mainBody: document.querySelector('body'),

      // Main Modules
      welcomeMessageModule: document.querySelector('.welcome-message-module'),
      startGameModule: document.querySelector('.start-game-module'),
      setUpGameModule: document.querySelector('.set-up-module')
    }
  }

  //const startGameButton = document.querySelector('#start-game');
  //const playasAI = document.querySelector('#play-ai');

  // Event Listeners
  //startGameButton.addEventListener('click', welcomeModule().hideWelcomeScreen);
  //playasAI.addEventListener('click', welcomeModule().hideWelcomeScreen);
})()

// Welcome Module
const welcomeModule = (() => {

  const DOMCACHE = {
    mainBody: document.querySelector('body'),
    welcomeContainer: document.querySelector('.welcome-message-module'),
    startGameContainer: document.querySelector('.start-game-module'),
    setUpGameContainer: document.querySelector('.set-up-module'),
  }

  const hideWelcomeScreen = () => {
    DOMCACHE.welcomeContainer.style.opacity = '0';
    DOMCACHE.startGameContainer.style.scale = "1";
    DOMCACHE.setUpGameContainer.style.scale = '1';
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
    DOMCACHE
  }
})