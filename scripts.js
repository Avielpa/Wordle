let wordList = ["APPLE", "BREAD", "CHAIR", "DANCE", "EAGLE", "FLAME", "GRAPE", "HEART", "IMAGE", "JUMBO"];
let word;
let hintCount;
let guessedLetters;
let gameOver;
let maxAttempts;
let attempts;
let filledPositions;

// Initialize game state
function initializeGame() {
    word = wordList[Math.floor(Math.random() * wordList.length)];
    hintCount = 2;
    guessedLetters = [];
    gameOver = false;
    maxAttempts = 7;
    attempts = 0;
    filledPositions = new Array(word.length).fill(false);
    
    // Clear the board and messages
    initializeBoard();
    document.getElementById("message").innerText = "";
    
    // Reset the hint count display
    document.getElementById("hint-count").innerText = `Hints Left: ${hintCount}`;
    
    // Update attempts counter
    updateAttemptsCounter();
    
    // Update input settings
    const guessInput = document.getElementById("guess");
    guessInput.value = "";
    guessInput.maxLength = word.length;
    guessInput.placeholder = `Enter a letter or ${word.length}-letter word`;
    
    // Reset submit button text
    document.getElementById("submit-btn").innerText = "Guess";

    console.log("New game started with word:", word); // For testing
}

function updateAttemptsCounter() {
    const remainingAttempts = maxAttempts - attempts;
    const attemptsCounter = document.getElementById("attempts-counter");
    if (attemptsCounter) {
        attemptsCounter.innerText = `${remainingAttempts} attempts left`;
    } else {
        console.error("Attempts counter element not found!");
    }
}

window.onload = function () {
    // Create attempts counter if it doesn't exist
    if (!document.getElementById("attempts-counter")) {
        const counterDiv = document.createElement("div");
        counterDiv.id = "attempts-counter";
        counterDiv.className = "attempts-counter";
        const boardDiv = document.getElementById("board");
        boardDiv.parentNode.insertBefore(counterDiv, boardDiv);
    }

    document.getElementById("submit-btn").addEventListener("click", handleSubmit);
    document.getElementById("hint-btn").addEventListener("click", getHint);
    initializeGame();
}

function initializeBoard() {
    const board = document.getElementById("board");
    board.innerHTML = '';

    for (let i = 0; i < word.length; i++) {
        let tile = document.createElement("div");
        tile.id = "tile-" + i;
        tile.classList.add("tile");
        tile.innerText = "";
        board.appendChild(tile);
    }
}

function handleSubmit() {
    if (gameOver) {
        initializeGame();
        return;
    }

    let guess = document.getElementById("guess").value.trim().toUpperCase();
    
    if (!guess) {
        document.getElementById("message").innerText = "Please enter a letter or word";
        return;
    }

    if (guess.length === 1) {
        // Single letter guess
        if (!guessedLetters.includes(guess)) {
            checkLetterGuess(guess);
            guessedLetters.push(guess);
        } else {
            document.getElementById("message").innerText = "You already guessed this letter";
        }
    } else if (guess.length === word.length) {
        // Full word guess
        checkWordGuess(guess);
    } else {
        document.getElementById("message").innerText = `Please enter a single letter or ${word.length}-letter word`;
        return;
    }

    document.getElementById("guess").value = "";
    updateAttemptsCounter();
    checkGameCompletion();
}

function checkLetterGuess(guess) {
    let found = false;
    
    for (let i = 0; i < word.length; i++) {
        if (word[i] === guess) {
            let tile = document.getElementById("tile-" + i);
            tile.innerText = guess;
            tile.classList.add("correct");
            filledPositions[i] = true;
            found = true;
        }
    }
    
    if (!found) {
        document.getElementById("message").innerText = "Letter not in word";
        attempts++;
    } else {
        document.getElementById("message").innerText = "Correct letter!";
    }
    
    checkGameEnd();
}

function checkWordGuess(guess) {
    let correctCount = 0;
    let result = Array(word.length).fill("absent");
    
    // First check for correct positions
    for (let i = 0; i < word.length; i++) {
        if (guess[i] === word[i]) {
            result[i] = "correct";
            correctCount++;
            filledPositions[i] = true;
        }
    }
    
    // Then check for present letters in wrong positions
    for (let i = 0; i < word.length; i++) {
        if (result[i] !== "correct" && word.includes(guess[i])) {
            let letterCount = word.split(guess[i]).length - 1;
            let markedCount = result.filter((r, idx) => 
                (r === "correct" || r === "present") && guess[idx] === guess[i]
            ).length;
            
            if (markedCount < letterCount) {
                result[i] = "present";
            }
        }
    }
    
    // Update the board
    for (let i = 0; i < word.length; i++) {
        let tile = document.getElementById("tile-" + i);
        tile.innerText = guess[i];
        tile.className = "tile " + result[i];
    }
    
    attempts++;
    
    if (correctCount === word.length) {
        endGame(true);
    } else if (correctCount === 0) {
        document.getElementById("message").innerText = "Not even close!";
    } else {
        document.getElementById("message").innerText = "Some letters are correct!";
    }
}

function checkGameCompletion() {
    // Check if all positions are filled with correct letters
    if (filledPositions.every(filled => filled)) {
        let allCorrect = true;
        for (let i = 0; i < word.length; i++) {
            const tile = document.getElementById("tile-" + i);
            if (tile.innerText !== word[i]) {
                allCorrect = false;
                break;
            }
        }
        if (allCorrect) {
            endGame(true);
        }
    }
}

function endGame(isWin) {
    gameOver = true;
    if (isWin) {
        document.getElementById("message").innerText = "Congratulations! You won! Click 'New Game' to play again";
    } else {
        document.getElementById("message").innerText = `Game Over! The word was: ${word}. Click 'New Game' to try again`;
    }
    document.getElementById("submit-btn").innerText = "New Game";
}

function checkGameEnd() {
    if (attempts >= maxAttempts && !gameOver) {
        endGame(false);
    }
}

function getHint() {
    if (hintCount > 0 && !gameOver) {
        let unrevealedLetters = word.split('').filter(letter => !guessedLetters.includes(letter));
        
        if (unrevealedLetters.length > 0) {
            let hintLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
            document.getElementById("message").innerText = `Hint: The word contains the letter '${hintLetter}'`;
            hintCount--;
            document.getElementById("hint-count").innerText = `Hints Left: ${hintCount}`;
        } else {
            document.getElementById("message").innerText = "You've already discovered all letters!";
        }
    } else if (hintCount <= 0) {
        document.getElementById("message").innerText = "No hints left!";
    }
}

// For testing
function runTests() {
    for (let i = 0; i < 400; i++) {
        console.log(`Test ${i + 1}:`);
        
        // Test single letter guess
        let testLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        console.log(`Testing letter: ${testLetter}`);
        document.getElementById("guess").value = testLetter;
        handleSubmit();
        
        // Test word guess
        let testWord = wordList[Math.floor(Math.random() * wordList.length)];
        console.log(`Testing word: ${testWord}`);
        document.getElementById("guess").value = testWord;
        handleSubmit();
        
        // Test game completion
        checkGameCompletion();
        
        // Reset for next test
        initializeGame();
    }
}