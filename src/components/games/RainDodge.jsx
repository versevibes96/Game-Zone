import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const RainDodge = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('start'); // start, playing, over
  const [playerPos, setPlayerPos] = useState(50);
  const [drops, setDrops] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('rainDodgeHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [difficulty, setDifficulty] = useState(1);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const gameAreaRef = useRef(null);
  const playerRef = useRef(null);
  const dropSpeed = useRef(2);
  const dropInterval = useRef(50);

  // Initialize game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setDrops([]);
    setPlayerPos(50);
    setDifficulty(1);
    dropSpeed.current = 2;
    dropInterval.current = 50;
    setShowNewHighScore(false); // Reset new high score message
  };

  // Handle player movement
  useEffect(() => {
    const movePlayer = (e) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        setPlayerPos(p => Math.max(0, p - 3));
      }
      if (e.key === 'ArrowRight') {
        setPlayerPos(p => Math.min(98, p + 3));
      }
    };

    window.addEventListener('keydown', movePlayer);
    return () => window.removeEventListener('keydown', movePlayer);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Update drops
      setDrops(prev => {
        // Add new drops
        const newDrops = [...prev.filter(d => d.y < 100)];
        
        // Add drops based on difficulty
        for (let i = 0; i < difficulty; i++) {
          if (Math.random() < 0.3) {
            newDrops.push({
              x: Math.random() * 90,
              y: 0,
              id: Date.now() + i,
              speed: dropSpeed.current + Math.random()
            });
          }
        }
        
        // Move drops
        return newDrops.map(d => ({
          ...d,
          y: d.y + d.speed
        }));
      });

      // Update score
      setScore(s => s + 1);

      // Increase difficulty
      if (score > 0 && score % 500 === 0) {
        setDifficulty(d => Math.min(d + 1, 5));
        dropSpeed.current = Math.min(dropSpeed.current + 0.5, 5);
        dropInterval.current = Math.max(dropInterval.current - 5, 20);
      }
    }, dropInterval.current);

    return () => clearInterval(gameLoop);
  }, [gameState, score, difficulty]);

  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing' || !playerRef.current) return;

    const checkCollision = () => {
      const player = playerRef.current.getBoundingClientRect();
      
      drops.forEach(drop => {
        const dropElement = document.getElementById(`drop-${drop.id}`);
        if (!dropElement) return;

        const dropRect = dropElement.getBoundingClientRect();
        
        if (
          player.left < dropRect.right &&
          player.right > dropRect.left &&
          player.top < dropRect.bottom &&
          player.bottom > dropRect.top
        ) {
          handleGameOver();
        }
      });
    };

    const collisionInterval = setInterval(checkCollision, 50);
    return () => clearInterval(collisionInterval);
  }, [gameState, drops]);

  // Handle game over
  const handleGameOver = () => {
    setGameState('over');
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('rainDodgeHighScore', score.toString());
      setShowNewHighScore(true);
      
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    } else {
      setShowNewHighScore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      <div className="max-w-2xl mx-auto">
        {/* Home Button */}
        <div className="pt-6 pb-2 flex justify-start">
          <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/">← Home</a>
        </div>
        <h1 className="text-4xl text-center font-bold mb-4">Rain Dodge</h1>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center">
          {/* Title */}
          

          {/* Game States */}
          {gameState === 'start' && (
            <div className="w-full flex flex-col items-center">
              <div className="text-lg md:text-xl text-purple-700 mb-6">
                <p>High Score: <span className="text-yellow-500 font-bold">{highScore}</span></p>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-lg md:text-xl font-bold text-white shadow transition-all duration-300 mb-2"
              >
                Start Game
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              <div className="flex justify-between w-full mb-4">
                <div className="text-lg md:text-xl text-purple-700 font-semibold">Level: {difficulty}</div>
                <div className="text-lg md:text-xl text-purple-700 font-semibold">Score: {score}</div>
              </div>
              <div className="relative w-full max-w-md h-[400px] md:h-[500px] bg-black bg-opacity-10 rounded-xl overflow-hidden flex items-end justify-center mb-6">
                {/* Player */}
                <div 
                  ref={playerRef}
                  className="absolute w-12 h-12 bg-blue-500 rounded-full bottom-4 transition-all duration-100 shadow-lg border-4 border-white"
                  style={{ 
                    left: `${playerPos}%`,
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                  }}
                />
                {/* Raindrops */}
                {drops.map(drop => (
                  <div 
                    key={drop.id}
                    id={`drop-${drop.id}`}
                    className="absolute w-4 h-8 bg-blue-300 rounded-lg shadow-md border-2 border-blue-200"
                    style={{ 
                      left: `${drop.x}%`,
                      top: `${drop.y}%`,
                      boxShadow: '0 0 10px rgba(147, 197, 253, 0.5)'
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {gameState === 'over' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-2">Game Over!</h2>
              <div className="text-lg md:text-xl text-purple-700 mb-2">
                <p>Score: <span className="text-blue-500 font-bold">{score}</span></p>
                <p>High Score: <span className="text-yellow-500 font-bold">{highScore}</span></p>
              </div>
              {showNewHighScore && (
                <div className="text-lg text-yellow-500 mb-2 animate-bounce font-bold">
                  New High Score! 🎉
                  <div className="text-base mt-1">Previous: {highScore - score}</div>
                </div>
              )}
              <button
                onClick={startGame}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-lg md:text-xl font-bold text-white shadow transition-all duration-300 mb-2"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        {/* Arrow Key Buttons Below Card */}
        {gameState === 'playing' && (
          <div className="flex justify-center mt-6 gap-8">
            <button
              onClick={() => setPlayerPos(p => Math.max(0, p - 3))}
              onTouchStart={() => setPlayerPos(p => Math.max(0, p - 3))}
              className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
            >
              ←
            </button>
            <button
              onClick={() => setPlayerPos(p => Math.min(98, p + 3))}
              onTouchStart={() => setPlayerPos(p => Math.min(98, p + 3))}
              className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RainDodge;