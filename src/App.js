import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./App.css";

const symbols = [
  "🐻",
  "🐷",
  "🐰",
  "🐸",
  "🦊",
  "🐵",
  "🦁",
  "🐨",
  "🐹",
  "🐼",
  "🐮",
  "🐤",
  "🐔",
  "🦄",
  "🐙",
  "🐳",
];

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const generateCards = (level) => {
  const totalPairs = Math.min(level + 2, 8);
  const selectedSymbols = shuffleArray(symbols).slice(0, totalPairs);
  const pairedSymbols = shuffleArray([...selectedSymbols, ...selectedSymbols]);
  return pairedSymbols.map((symbol, index) => ({
    id: index,
    symbol,
    matched: false,
  }));
};

function App() {
  const [cards, setCards] = useState(generateCards(1));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeUp, setTimeUp] = useState(false);

  const flipSound = new Audio("/sounds/flipcard-91468.mp3");
  const matchSound = new Audio("/sounds/page-flip-47177.mp3");

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const winSound = new Audio("/sounds/game-win-36082.mp3");
      setCompleted(true);
      winSound.play();

      setTimeout(() => {
        setCompleted(false);
        setLevel((prev) => prev + 1);
        setMatched([]);
        setFlipped([]);
        setCards(generateCards(level + 1));
        setTimeLeft(30);
      }, 3000);
    }
  }, [matched, cards, level]);

  useEffect(() => {
    if (showIntro || completed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [level, showIntro, completed]);

  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;

    flipSound.currentTime = 0;
    flipSound.play();

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]].symbol === cards[newFlipped[1]].symbol) {
        setMatched([...matched, ...newFlipped]);
        setScore(score + 10);
        matchSound.play();
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setMatched([]);
    setFlipped([]);
    setCards(generateCards(1));
    setCompleted(false);
    setTimeLeft(30);
  };

  return (
    <div className="game-container">
      {completed && <Confetti />}

      {showIntro ? (
        <div className="intro-modal">
          <div className="intro-content">
            <h2>🎮 Memory Match Game</h2>
            <p>
              Match all the pairs by flipping cards. Each level gets harder with
              more pairs.
              <br />
              <br />
              Click on two cards to flip them.
              <br />
              If they match, they stay revealed.
              <br />
              If not, they flip back.
              <br />
              Clear all pairs to level up!
              <br />
              <br />
              <strong>Good luck and have fun!</strong>
            </p>
            <button onClick={() => setShowIntro(false)}>Start Game</button>
          </div>
        </div>
      ) : (
        <div className="game-wrapper">
          <div className="game-header">
            <span className="side-decoration">🎖️</span>
            <h1 className="game-title">MEMORY GAME</h1>
            <span className="side-decoration">🎲</span>
          </div>

          <h2>
            Score: {score} | Level: {level}
          </h2>
          <div className="top-controls">
            <div className="timer">⏱️ {timeLeft}s</div>
            <button className="restart-button" onClick={handleRestart}>
              Restart
            </button>
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${Math.min(level, 8) * 12.5}%` }}
            ></div>
          </div>

          <div className="board">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`card ${
                  flipped.includes(index) || matched.includes(index)
                    ? "flipped"
                    : ""
                }`}
                onClick={() => handleFlip(index)}
              >
                <span className="card-front">{card.symbol}</span>
                <span className="card-back">❓</span>
              </div>
            ))}
          </div>

          {completed && (
            <div className="modal">
              <div className="modal-content">
                <h3>🎉 Congratulations!</h3>
                <p>You completed Level {level}!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {timeUp && (
        <div className="modal">
          <div className="modal-content">
            <h3>⏰ Time's Up!</h3>
            <p>
              Oops! You ran out of time.
              <br />
              Don't worry — you can try again!
            </p>
            <button
              onClick={() => {
                setTimeUp(false);
                handleRestart();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
