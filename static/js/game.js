const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const BASE_GAME_DURATION = 60; // seconds
let timeLeft;
let gameOver = false;
let level = 1;
let maxLevel = 3;

const player = new Player(100, 100);
const ai = new AI(700, 500);
const helperAI = new HelperAI(400, 300);
let coffees = [];

const kitchenArea = {
    x: 700,
    y: 500,
    width: 100,
    height: 100,
    image: new Image()
};
kitchenArea.image.src = '/static/images/kitchen.svg';

// Add audio objects for pickup, drop, and return sounds
const pickupSound = new Audio('/static/audio/pickup.mp3');
const dropSound = new Audio('/static/audio/drop.mp3');
const returnSound = new Audio('/static/audio/return.mp3');
const interactionSound = new Audio('/static/audio/interaction.mp3');

// Add background music
const backgroundMusic = new Audio('/static/audio/background_music.mp3');
backgroundMusic.loop = true;

// Volume control
let musicVolume = 0.5;
backgroundMusic.volume = musicVolume;

function playBackgroundMusic() {
    backgroundMusic.play();
    updateMusicButton();
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    updateMusicButton();
}

function toggleBackgroundMusic() {
    if (backgroundMusic.paused) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
}

function updateMusicButton() {
    const musicButton = document.getElementById('play-music');
    if (backgroundMusic.paused) {
        musicButton.textContent = 'Play Music';
    } else {
        musicButton.textContent = 'Pause Music';
    }
}

function setMusicVolume(volume) {
    musicVolume = volume;
    backgroundMusic.volume = musicVolume;
}

function init() {
    resetLevel();
    gameLoop();

    // Start timer
    const timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver = true;
            stopBackgroundMusic();
        }
    }, 1000);
}

function resetLevel() {
    // Clear existing coffees
    coffees = [];
    
    // Create coffee cups based on the current level
    const cupCount = level === 1 ? 5 : 10 + (level - 1) * 5;
    for (let i = 0; i < cupCount; i++) {
        coffees.push(new Coffee(Math.random() * canvas.width, Math.random() * canvas.height));
    }
    // Remove cups outside the game area
    coffees = coffees.filter(coffee => isInsideGameArea(coffee));

    // Adjust AI speed based on the level
    ai.speed = level === 1 ? 2 : 3 + (level - 1) * 0.5;

    // Reset player position and stats
    player.x = 100;
    player.y = 100;
    player.cupsCarried = 0;
    player.cupsCollected = 0;

    // Reset helper AI position
    helperAI.x = 400;
    helperAI.y = 300;
    helperAI.cupsCarried = 0;

    // Set time based on level
    timeLeft = level === 1 ? BASE_GAME_DURATION + 30 : BASE_GAME_DURATION;

    // Update UI
    updateScore();
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('current-level').textContent = level;
}

function gameLoop() {
    update();
    render();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        if (level < maxLevel && coffees.length === 0) {
            levelUp();
        } else {
            showGameOver(coffees.length === 0);
            stopBackgroundMusic();
        }
    }
}

function update() {
    player.update();
    ai.update(coffees, kitchenArea);

    // Update helper AI only for level 2 and above
    if (level >= 2) {
        helperAI.update(coffees, kitchenArea);
    }

    // Check for player collecting coffee
    coffees.forEach((coffee, index) => {
        if (!coffee.isCollected && player.isColliding(coffee)) {
            const droppedCups = player.collectCoffee(coffee);
            updateScore();
            // Play pickup sound
            pickupSound.play();

            // Check if player has collected 12 cups
            if (droppedCups) {
                coffees = coffees.concat(droppedCups);
                // Remove cups outside the game area
                coffees = coffees.filter(coffee => isInsideGameArea(coffee));
                // Play drop sound
                dropSound.play();
            }
        }
    });

    // Check for player dropping coffee in kitchen
    if (player.cupsCarried > 0 && player.isCollidingWithKitchen(kitchenArea)) {
        player.dropCoffee();
        updateScore();
        coffees = coffees.filter(coffee => !coffee.isCollected);
        if (coffees.length === 0) {
            gameOver = true;
        }
        // Play return sound for returning cups to the cafe
        returnSound.play();
    }

    // Check for player-AI interaction
    if (player.isColliding(ai)) {
        // Play interaction sound
        interactionSound.play();
        // Implement any additional interaction logic here
    }

    // Update coffee collection status
    coffees = coffees.filter(coffee => !coffee.isCollected);
}

function render() {
    // Draw lighter gray background
    ctx.fillStyle = '#C0C0C0';  // Silver color (lighter gray)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw kitchen area using the new SVG image
    ctx.drawImage(kitchenArea.image, kitchenArea.x, kitchenArea.y, kitchenArea.width, kitchenArea.height);

    // Draw coffee cups
    coffees.forEach(coffee => coffee.draw(ctx));

    // Draw player and AI
    player.draw(ctx);
    ai.draw(ctx);

    // Draw helper AI only for level 2 and above
    if (level >= 2) {
        helperAI.draw(ctx);
    }

    // Draw level info
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${level}`, 10, 30);
}

function updateScore() {
    document.getElementById('cups-carried').textContent = player.cupsCarried;
    document.getElementById('cups-collected').textContent = player.cupsCollected;
}

function showGameOver(playerWon) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerWon ? 'You Win!' : 'Game Over!', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px Arial';
    ctx.fillText(`Total Cups Collected: ${player.cupsCollected}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText(`Level Reached: ${level}`, canvas.width / 2, canvas.height / 2 + 90);
}

function isInsideGameArea(coffee) {
    return coffee.x >= 0 && coffee.x <= canvas.width - coffee.width &&
           coffee.y >= 0 && coffee.y <= canvas.height - coffee.height;
}

function levelUp() {
    level++;
    if (level <= maxLevel) {
        resetLevel();
        gameOver = false;
        gameLoop();
    } else {
        showGameOver(true);
        stopBackgroundMusic();
    }
}

// Event listeners for player movement
document.addEventListener('keydown', (e) => player.handleKeyDown(e));
document.addEventListener('keyup', (e) => player.handleKeyUp(e));

// Add event listener for user interaction to start background music
document.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        playBackgroundMusic();
    }
});

// Start the game
init();

// Update music button text on page load
document.addEventListener('DOMContentLoaded', updateMusicButton);
