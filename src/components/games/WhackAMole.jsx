import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const WhackAMole = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(1);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const gameAreaRef = useRef(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('whackAMoleHighScore') || 0;
    setHighScore(parseInt(savedHighScore));
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  // Mole popping logic
  useEffect(() => {
    if (!gameActive) return;

    const speed = 1500 - (level * 200); // Faster moles as level increases
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * 9);
      popUpMole(randomIndex);
    }, speed > 500 ? speed : 500); // Minimum 500ms

    return () => clearInterval(interval);
  }, [gameActive, level]);

  const popUpMole = (index) => {
    if (!moles[index]) {
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[index] = true;
        return newMoles;
      });

      setTimeout(() => {
        setMoles(prev => {
          const newMoles = [...prev];
          if (newMoles[index]) { // Only hide if not whacked
            newMoles[index] = false;
          }
          return newMoles;
        });
      }, 800 - (level * 50)); // Faster hide as level increases
    }
  };

  const whackMole = (index) => {
    if (moles[index]) {
      setScore(prev => prev + (10 * level)); // Higher score at higher levels
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[index] = false;
        return newMoles;
      });
      // Play sound
      new Audio('/pop.mp3').play().catch(e => console.log("Audio error:", e));
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setLevel(1);
    setMoles(Array(9).fill(false));
    setGameActive(true);
    setShowWinPopup(false);
  };

  const endGame = () => {
    setGameActive(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whackAMoleHighScore', score);
    }
    if (score >= level * 50) { // Win condition
      setShowWinPopup(true);
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setTimeLeft(30);
    setGameActive(true);
    setShowWinPopup(false);
  };

  // Mobile touch support
  const handleTouch = (e, index) => {
    e.preventDefault();
    whackMole(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      <div class="max-w-2xl mx-auto">
        <a class="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 class="text-4xl font-bold text-center mb-8">WhackAMole</h1>
        <div class="bg-white rounded-xl shadow-2xl p-8">
          {showWinPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl text-center">
                <Confetti width={window.innerWidth} height={window.innerHeight} />
                <h2 className="text-3xl font-bold text-green-600 mb-4">Level {level} Complete!</h2>
                <p className="text-xl mb-6">Score: {score}</p>
                <div className="flex gap-4 justify-center">
                  {level < 5 ? (
                    <button
                      onClick={nextLevel}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Next Level
                    </button>
                  ) : (
                    <button
                      onClick={startGame}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Play Again
                    </button>
                  )}

                </div>
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto bg-white bg-opacity-90 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <div className="text-xl text-gray-600 font-bold">Level: {level}</div>
                <div className="text-sm text-gray-600">Target: {level * 100}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6" ref={gameAreaRef}>
              {moles.map((isUp, index) => (
                <button
                  key={index}
                  onClick={() => whackMole(index)}
                  onTouchStart={(e) => handleTouch(e, index)}
                  className={`aspect-square rounded-full transition-all duration-200 flex items-center justify-center ${isUp ? 'bg-green-500 transform -translate-y-2' : 'bg-gray-300'
                    } ${gameActive ? 'cursor-pointer' : 'cursor-default'}`}
                  disabled={!gameActive}
                >
                  {isUp && (
                    <span className="text-4xl animate-bounce">🐹</span>
                  )}
                  {!isUp && (
                    <div className="w-3/4 h-3/4 rounded-full bg-gray-400"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-xl text-gray-600 font-bold">Score: {score}</div>
              <div className="text-xl text-green-400">
                <span className="font-bold">High:</span> {highScore}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              ></div>
            </div>

            <div className="text-center text-xl mb-4">
              Time: {timeLeft}s
            </div>

            {!gameActive ? (
              <button
                onClick={startGame}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xl font-bold"
              >
                {score > 0 ? 'Play Again' : 'Start Game'}
              </button>
            ) : (
              <button
                onClick={endGame}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xl font-bold"
              >
                End Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhackAMole;