import React, { useState, useEffect } from "react";
import words from "../utils/words"; // ✅ Correct path
import { shuffle } from "../utils/shuffle"; // Adjust this path as needed

const MAX_STRIKES = 3;
const MAX_PASSES = 3;

const getScrambled = (word) => {
  let scrambled = word;
  while (scrambled.toLowerCase() === word.toLowerCase()) {
    scrambled = shuffle(word.split("")).join("");
  }
  return scrambled;
};

const Game = () => {
  const wordList = shuffle(words.map(w => w.word));
  const [wordsState, setWordsState] = useState(wordList);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [passes, setPasses] = useState(MAX_PASSES);
  const [usedWords, setUsedWords] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scrambleGame"));
    if (saved) {
      setWordsState(saved.words);
      setUsedWords(saved.usedWords);
      setScore(saved.score);
      setStrikes(saved.strikes);
      setPasses(saved.passes);
      setCurrentWord(saved.currentWord);
      setScrambled(saved.scrambled);
    } else {
      loadNextWord(wordList);
    }
  }, []);

  useEffect(() => {
    if (!gameOver) {
      localStorage.setItem("scrambleGame", JSON.stringify({
        words: wordsState,
        usedWords,
        score,
        strikes,
        passes,
        currentWord,
        scrambled
      }));
    }
  }, [score, strikes, passes, usedWords, currentWord]);

  const loadNextWord = (wordsToUse = wordsState) => {
    const nextWord = wordsToUse.find((w) => !usedWords.includes(w));
    if (!nextWord) {
      setGameOver(true);
      return;
    }
    setCurrentWord(nextWord);
    setScrambled(getScrambled(nextWord));
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (gameOver) return;

    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      setScore(s => s + 1);
      setUsedWords([...usedWords, currentWord]);
      setMessage("✅ Correct!");
      setGuess("");
      setTimeout(() => {
        loadNextWord();
        setMessage("");
      }, 500);
    } else {
      setStrikes(s => s + 1);
      setMessage("❌ Incorrect");
      setGuess("");
      if (strikes + 1 >= MAX_STRIKES) {
        setGameOver(true);
      }
    }
  };

  const handlePass = () => {
    if (passes > 0 && !gameOver) {
      setPasses(p => p - 1);
      setUsedWords([...usedWords, currentWord]);
      setMessage("⏭️ Passed");
      setTimeout(() => {
        loadNextWord();
        setMessage("");
      }, 500);
    }
  };

  const restartGame = () => {
    localStorage.removeItem("scrambleGame");
    const newShuffled = shuffle(words.map(w => w.word));
    setWordsState(newShuffled);
    setScore(0);
    setStrikes(0);
    setPasses(MAX_PASSES);
    setUsedWords([]);
    setGameOver(false);
    setGuess("");
    setMessage("");
    setCurrentWord(newShuffled[0]);
    setScrambled(getScrambled(newShuffled[0]));
  };

  if (gameOver) {
    return (
      <div>
        <h2>Game Over!</h2>
        <p>Score: {score}</p>
        <button onClick={restartGame}>Play Again</button>
      </div>
    );
  }

  return (
    <div>
      <p>Scrambled Word: <strong>{scrambled}</strong></p>
      <form onSubmit={handleGuess}>
        <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} autoFocus />
        <button type="submit">Guess</button>
      </form>
      <p>{message}</p>
      <p>Score: {score} | Strikes: {strikes}/{MAX_STRIKES} | Passes: {passes}</p>
      <button onClick={handlePass} disabled={passes === 0}>Pass</button>
    </div>
  );
};

export default Game;
