import React, { useState, useEffect } from 'react';

const scoreWords = [
  "Amazing", "Wonderful", "Wordlicious", "Incredible", "Fantastic",
  "Superb", "Outstanding", "Excellent", "Impressive", "Spectacular"
];

const ScoreDisplay = ({ score, strikes, maxStrikes, passes, maxPasses, showCelebration }) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const [celebrationWord, setCelebrationWord] = useState('');

  useEffect(() => {
    if (score !== displayScore) {
      setIsAnimating(true);
      if (showCelebration) {
        setCelebrationWord(scoreWords[Math.floor(Math.random() * scoreWords.length)]);
      }
      const timer = setTimeout(() => {
        setDisplayScore(score);
        setIsAnimating(false);
        setCelebrationWord('');
      }, showCelebration ? 1100 : 500); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [score, displayScore, showCelebration]);

  return (
    <div className="score-container">
      <p>
        <span id="scoreLabel" style={{ display: celebrationWord ? 'none' : 'inline' }}>Score: </span>
        <b id="scoreValue" className={isAnimating ? 'score-update' : ''}>
          {celebrationWord ? <span className="celebrate-word">{celebrationWord}</span> : displayScore}
        </b>
      </p>
      <p>Strikes: <b>{strikes}/{maxStrikes}</b></p>
      <p>Passes Left: <b>{passes}/{maxPasses}</b></p>
    </div>
  );
};

export default ScoreDisplay;
