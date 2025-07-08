import React, { useState, useEffect, useRef, useCallback } from 'react';
import wordsData from '../words'; // Renamed to avoid conflict with local 'words' variable
import { shuffle } from './utils/shuffle';
import ScoreDisplay from '../components/ScoreDisplay';
import InputArea from '../components/InputArea';

// Constants for game rules
const MAX_STRIKES = 3;
const INITIAL_PASSES = 2;
const TIME_MAP = { common: 20, rare: 25, exclusive: 30, legendary: 35 };
const SCORE_WORDS = [
  "Amazing", "Wonderful", "Wordlicious", "Incredible", "Fantastic",
  "Superb", "Outstanding", "Excellent", "Impressive", "Spectacular"
];

function App() {
  // Game State
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [passes, setPasses] = useState(INITIAL_PASSES);
  const [allWords, setAllWords] = useState([]); // All words from words.js
  const [availableWords, setAvailableWords] = useState([]); // Words remaining for current game
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [scrambledWord, setScrambledWord] = useState('');
  const [hint, setHint] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [wordShake, setWordShake] = useState(false); // For word shake animation

  // Refs for timer management
  const timerRef = useRef(null);
  const messageTimerRef = useRef(null);
  const gameEndTimerRef = useRef(null);

  // Helper to get word class and style
  const getWordClass = useCallback((wordObj) => {
    if (!wordObj) return 'common'; // Default if no word yet
    if (wordObj.difficulty) return wordObj.difficulty;

    const word = wordObj.word.toLowerCase();
    const wordLength = word.length;
    const repeatingChars = /([a-zA-Z]).*?\1/.test(word);

    if (wordLength <= 4 || repeatingChars) return "common";
    else if (wordLength <= 6) return "rare";
    else if (wordLength <= 8) return "exclusive";
    else return "legendary";
  }, []);

  const getWordClassStyle = useCallback((wordClass) => {
    const colors = {
      common: { color: "black", backgroundColor: "lightblue" },
      rare: { color: "white", backgroundColor: "red" },
      exclusive: { color: "black", backgroundColor: "gold" },
      legendary: { color: "white", backgroundColor: "purple" }
    };
    return colors[wordClass] || {};
  }, []);

  // Initialize Timer
  const initTimer = useCallback((initialTime) => {
    clearInterval(timerRef.current);
    setTimeLeft(initialTime);

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timerRef.current);
          setMessage(`Time off! The word was ${currentWordObj.word.toUpperCase()}`);
          setStrikes(prevStrikes => prevStrikes + 1); // Add a strike for time out
          return 0;
        }
      });
    }, 1000);
  }, [currentWordObj]);

  // Game Initialization Logic
  const initializeGame = useCallback((loadFromStorage = false) => {
    clearInterval(timerRef.current);
    clearTimeout(messageTimerRef.current);
    clearTimeout(gameEndTimerRef.current);

    setMessage('');
    setShowCelebration(false);
    setWordShake(false);

    let wordsToUse;
    if (loadFromStorage && availableWords.length > 0) {
      wordsToUse = availableWords;
    } else {
      wordsToUse = shuffle([...wordsData]); // Start with a fresh shuffled list
      setAllWords([...wordsData]); // Keep original for reset
      setAvailableWords(wordsToUse);
      setScore(0);
      setStrikes(0);
      setPasses(INITIAL_PASSES);
      setGameEnded(false);
    }

    if (wordsToUse.length === 0) {
      setGameEnded(true);
      setMessage(`Game Over! You completed all words! Your final score is ${score}.`);
      return;
    }

    const randomObj = wordsToUse[Math.floor(Math.random() * wordsToUse.length)];
    const scrambled = shuffle(randomObj.word.split('')).join('');

    setCurrentWordObj(randomObj);
    setScrambledWord(scrambled);
    setHint(randomObj.hint);

    const wordClass = getWordClass(randomObj);
    const maxTime = TIME_MAP[wordClass] || 30;
    initTimer(maxTime);
  }, [availableWords, getWordClass, initTimer, score]); // Added score to dependency array for game end message

  // Update Score Logic
  const updateScore = useCallback((timeRemaining) => {
    const baseScore = 10;
    let bonus = 0;

    // Time bonus
    if (timeRemaining > 25) bonus += 10;
    else if (timeRemaining > 20) bonus += 7;
    else if (timeRemaining > 15) bonus += 5;

    // Word class bonus
    const wordClass = getWordClass(currentWordObj);
    if (wordClass === "legendary") bonus += 15;
    else if (wordClass === "exclusive") bonus += 10;

    setScore(prevScore => prevScore + baseScore + bonus);
    setShowCelebration(true); // Trigger celebration word
  }, [currentWordObj, getWordClass]);

  // Check Word Logic
  const checkWord = useCallback((userGuess) => {
    if (!currentWordObj) return; // No word to check

    const trimmedGuess = userGuess.toLowerCase().trim();
    const correctWordLower = currentWordObj.word.toLowerCase();

    if (!trimmedGuess) {
      setMessage("Please enter a word!");
      messageTimerRef.current = setTimeout(() => setMessage(''), 2000);
      return;
    }

    if (trimmedGuess === correctWordLower) {
      clearInterval(timerRef.current);
      setMessage(`🎉 ${currentWordObj.word.toUpperCase()} is correct!`);
      updateScore(timeLeft);

      // Remove the guessed word from available words
      setAvailableWords(prevWords => prevWords.filter(w => w.word !== currentWordObj.word));

      gameEndTimerRef.current = setTimeout(() => {
        // Check if all words are used after removing the current one
        if (availableWords.length - 1 <= 0) { // -1 because currentWordObj is still in availableWords until next render
          setGameEnded(true);
          setMessage(`Game Over! You completed all words! Your final score is ${score + 10 + (timeLeft > 25 ? 10 : timeLeft > 20 ? 7 : timeLeft > 15 ? 5 : 0) + (getWordClass(currentWordObj) === "legendary" ? 15 : getWordClass(currentWordObj) === "exclusive" ? 10 : 0)}.`); // Calculate final score for message
        } else {
          initializeGame();
        }
      }, 2000);
    } else {
      setStrikes(prevStrikes => prevStrikes + 1);
      setWordShake(true);
      setMessage("Oops! Try again.");
      messageTimerRef.current = setTimeout(() => {
        setMessage('');
        setWordShake(false);
      }, 500);
    }
  }, [currentWordObj, timeLeft, updateScore, initializeGame, availableWords, score, getWordClass]);

  // Pass Word Logic
  const passWord = useCallback(() => {
    if (!currentWordObj) return;

    if (passes > 0) {
      clearInterval(timerRef.current);
      setMessage(`Word passed! The word was ${currentWordObj.word.toUpperCase()}`);
      setPasses(prevPasses => prevPasses - 1);

      // Remove the passed word from available words
      setAvailableWords(prevWords => prevWords.filter(w => w.word !== currentWordObj.word));

      gameEndTimerRef.current = setTimeout(() => {
        // Check if all words are used after removing the current one
        if (availableWords.length - 1 <= 0) {
          setGameEnded(true);
          setMessage(`Game Over! You passed all words! Your final score is ${score}.`);
        } else {
          initializeGame();
        }
      }, 1500);
    } else {
      setMessage("No passes left!");
      messageTimerRef.current = setTimeout(() => setMessage(''), 2000);
    }
  }, [currentWordObj, passes, initializeGame, availableWords, score]);

  // Game End Logic
  const endGame = useCallback(() => {
    clearInterval(timerRef.current);
    clearTimeout(messageTimerRef.current);
    clearTimeout(gameEndTimerRef.current);
    setGameEnded(true);
    setMessage(`Game Over! You reached ${MAX_STRIKES} strikes. Your final score is ${score}.`);
  }, [score]);

  // Play Again Logic
  const playAgain = useCallback(() => {
    localStorage.removeItem('scrambleGameState'); // Clear local storage on play again
    initializeGame(false); // Start a brand new game
  }, [initializeGame]);

  // Effect for initial game load or when availableWords changes (to trigger next word)
  useEffect(() => {
    // Load game state from localStorage on initial mount
    const savedState = JSON.parse(localStorage.getItem('scrambleGameState'));
    if (savedState && savedState.availableWords && savedState.availableWords.length > 0 && !savedState.gameEnded) {
      setScore(savedState.score);
      setStrikes(savedState.strikes);
      setPasses(savedState.passes);
      setAvailableWords(savedState.availableWords);
      setCurrentWordObj(savedState.currentWordObj);
      setScrambledWord(savedState.scrambledWord);
      setHint(savedState.hint);
      setTimeLeft(savedState.timeLeft);
      setGameEnded(savedState.gameEnded);
      setMessage(savedState.message || ''); // Restore message if any
      // Restart timer if game was active
      if (savedState.currentWordObj && savedState.timeLeft > 0) {
        initTimer(savedState.timeLeft);
      } else if (savedState.currentWordObj) { // If time was 0, it means time off, so trigger next word
        setStrikes(prevStrikes => prevStrikes + 1); // Add strike for time off
      }
    } else {
      initializeGame(false); // Start a fresh game if no saved state or game ended
    }

    // Cleanup on unmount
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(messageTimerRef.current);
      clearTimeout(gameEndTimerRef.current);
    };
  }, [initializeGame, initTimer]); // Only run once on mount

  // Effect to handle game ending conditions (strikes or no more words)
  useEffect(() => {
    if (strikes >= MAX_STRIKES && !gameEnded) {
      endGame();
    } else if (availableWords.length === 0 && !gameEnded && allWords.length > 0) {
      // This condition handles if the last word was removed and no new word could be initialized
      setGameEnded(true);
      setMessage(`Game Over! You completed all words! Your final score is ${score}.`);
    }
  }, [strikes, availableWords, gameEnded, endGame, allWords.length, score]);

  // Effect to save game state to localStorage
  useEffect(() => {
    const gameState = {
      score,
      strikes,
      passes,
      availableWords,
      currentWordObj,
      scrambledWord,
      hint,
      timeLeft,
      gameEnded,
      message // Save current message for persistence
    };
    localStorage.setItem('scrambleGameState', JSON.stringify(gameState));
  }, [score, strikes, passes, availableWords, currentWordObj, scrambledWord, hint, timeLeft, gameEnded, message]);


  return (
    <div className="container">
      <div className="title-container">
        <img src="%PUBLIC_URL%/img/image.jpeg" className="round-img" alt="Profile" />
        <h2>Word Scramble</h2>
        <a href="https://github.com/GZ30eee" target="_blank" rel="noopener noreferrer">
          <p>Follow me</p>
        </a>
      </div>

      <div className="content">
        <ScoreDisplay
          score={score}
          strikes={strikes}
          maxStrikes={MAX_STRIKES}
          passes={passes}
          maxPasses={INITIAL_PASSES}
          showCelebration={showCelebration}
        />

        {gameEnded ? (
          <div className="game-over-screen">
            <p>{message}</p>
            <button onClick={playAgain}>Play Again</button>
          </div>
        ) : (
          <>
            <p className={`word ${wordShake ? 'shake' : ''}`}>{scrambledWord}</p>
            <p className="word-class-p">
              <span
                className="word-class"
                style={getWordClassStyle(getWordClass(currentWordObj))}
              >
                {currentWordObj ? getWordClass(currentWordObj) : ''}
              </span>
            </p>
            <div className="details">
              <p className="hint">Hint: <span>{hint}</span></p>
              <p className="time">Time Left: <span><b>{timeLeft}</b>s</span></p>
            </div>
            <InputArea
              onCheckWord={checkWord}
              message={message}
              correctWordLength={currentWordObj ? currentWordObj.word.length : 0}
            />
            <div className="buttons">
              <button
                className="refresh-word"
                onClick={passWord}
                disabled={passes <= 0}
              >
                Pass Word ({passes})
              </button>
              <button
                className="check-word"
                onClick={() => checkWord(document.querySelector('input').value)}
              >
                Check Word
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
