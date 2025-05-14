import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const BallBounce = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [paddleY, setPaddleY] = useState(50);
  const [velocity, setVelocity] = useState({ dx: 2, dy: 2 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('tennisHighScore');
    return savedScore ? parseInt(savedScore) : 0;
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const touchStartY = useRef(null);

  const [isMovingUp, setIsMovingUp] = useState(false);
  const [isMovingDown, setIsMovingDown] = useState(false);

  // Swipe Detection (mobile)
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const endY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - endY;

      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          setPaddleY((prev) => Math.max(10, prev - 10)); // Swipe Up
        } else {
          setPaddleY((prev) => Math.min(90, prev + 10)); // Swipe Down
        }
      }

      touchStartY.current = null;
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('touchstart', handleTouchStart);
      gameArea.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (gameArea) {
        gameArea.removeEventListener('touchstart', handleTouchStart);
        gameArea.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameStarted, gameOver]);

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPaddleY(prev => Math.max(10, prev - 15));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPaddleY(prev => Math.min(90, prev + 15));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  // Update paddle position based on key states
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const movePaddle = () => {
      if (isMovingUp) {
        setPaddleY(prev => Math.max(10, prev - 5));
      }
      if (isMovingDown) {
        setPaddleY(prev => Math.min(90, prev + 5));
      }
    };

    const interval = setInterval(movePaddle, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isMovingUp, isMovingDown, gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const updateGame = (timestamp) => {
      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateGame);
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime > 0) {
        setPosition(prev => {
          const newX = prev.x + velocity.dx;
          const newY = prev.y + velocity.dy;
          let newDx = velocity.dx;
          let newDy = velocity.dy;
          let scored = false;

          if (newY <= 5 || newY >= 95) newDy *= -1;
          if (newX <= 5) newDx *= -1;

          if (newX >= 90 && Math.abs(newY - paddleY) < 15 && velocity.dx > 0) {
            newDx *= -1;
            scored = true;
          }

          if (newX >= 95 && Math.abs(newY - paddleY) >= 15) {
            setGameOver(true);
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('tennisHighScore', score.toString());
              setShowConfetti(true);
            }

          }

          if (scored) setScore(prev => prev + 1);
          setVelocity({ dx: newDx, dy: newDy });

          return {
            x: Math.max(5, Math.min(95, newX)),
            y: Math.max(5, Math.min(95, newY)),
          };
        });
      }

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    animationFrameRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [velocity, gameStarted, gameOver, paddleY, score, highScore, isPaused]);

  const startGame = () => {
    setPosition({ x: 50, y: 50 });
    setVelocity({ dx: 2, dy: 0.7 });
    setPaddleY(50);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    setShowConfetti(false);
    setIsPaused(false);
  };

  const restartGame = () => {
    startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <div class="max-w-2xl mx-auto">
        <a class="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 class="text-4xl font-bold text-center mb-8">Ball Bounce</h1>

        <div class="bg-white rounded-xl shadow-2xl p-8">


          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-700">Score: {score} | High Score: {highScore}</p>
          </div>

          <div
            ref={gameAreaRef}
            className="relative h-96 bg-gray-100 rounded-xl overflow-hidden border-4 border-green-300 touch-none"
          >
            {/* Ball */}
            <div
              className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-400 shadow-lg"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Paddle */}
            <div
              className="absolute w-3 h-20 bg-green-500 rounded-lg shadow-md"
              style={{
                right: '2%',
                top: `${paddleY}%`,
                transform: 'translateY(-50%)',
              }}
            />

            {/* Game over screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-white mb-4">Game Over!</h3>
                <p className="text-xl text-white mb-6">Your score: {score}</p>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-lg"
                  onClick={restartGame}
                >
                  🔄 Play Again
                </button>
              </div>
            )}

            {/* Start screen */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-white mb-6">Tennis Paddle Game</h3>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl"
                  onClick={startGame}
                >
                  🎾 Start Game
                </button>
                <p className="text-white mt-4">Swipe up/down or use ↑ ↓ keys</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {gameStarted && !gameOver && (
              <>
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                    onClick={restartGame}
                  >
                    🔄 Restart
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setIsPaused(prev => !prev)}
                  >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </button>
                </div>

                {/* Touch Controls */}
                <div className="grid grid-cols-1 gap-3 max-w-[200px] mx-auto">
                  <button
                    onTouchStart={(e) => {
                      setPaddleY(prev => Math.max(10, prev - 15));
                    }}
                    className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
                  >
                    ↑
                  </button>
                  <button
                    onTouchStart={(e) => {
                      setPaddleY(prev => Math.min(90, prev + 15));
                    }}
                    className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
                  >
                    ↓
                  </button>
                </div>
                <p className="text-gray-600 text-sm">Use arrow keys or tap buttons to move</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallBounce;
