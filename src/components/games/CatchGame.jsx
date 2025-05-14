import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaRedo, FaHome } from 'react-icons/fa';

const CatchGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('ready');
  const [basketPos, setBasketPos] = useState(50);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const gameAreaRef = useRef(null);
  const speedRef = useRef(2);
  const dropRateRef = useRef(0.05);
  const timerRef = useRef(null);
  const moveIntervalRef = useRef(null);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setItems([]);
    setTimeLeft(60);
    speedRef.current = 2;
    dropRateRef.current = 0.05;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseGame = () => {
    setGameState('paused');
    clearInterval(timerRef.current);
  };

  const resumeGame = () => {
    setGameState('playing');
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameState('over');
    clearInterval(timerRef.current);
  };

  const restartGame = () => {
    endGame();
    startGame();
  };

  const startMoving = (direction) => {
    if (moveIntervalRef.current) return;

    moveIntervalRef.current = setInterval(() => {
      setBasketPos(prev => {
        if (direction === 'left') {
          return Math.max(0, prev - 5);
        } else {
          return Math.min(80, prev + 5);
        }
      });
    }, 50);
  };

  const stopMoving = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') setBasketPos(prev => Math.max(0, prev - 5));
      if (e.key === 'ArrowRight') setBasketPos(prev => Math.min(80, prev + 5));
    };

    const gameLoop = setInterval(() => {
      if (Math.random() < dropRateRef.current) {
        const types = ['🍎', '🍌', '🍒', '🍊', '🍇', '💣'];
        const type = types[Math.floor(Math.random() * types.length)];
        setItems(prev => [...prev, {
          id: Date.now() + Math.random(),
          type,
          x: Math.random() * 90,
          y: 0,
          speed: 1 + Math.random() * speedRef.current
        }]);
      }

      setItems(prev => prev.map(item => ({ ...item, y: item.y + item.speed }))
        .filter(item => {
          if (item.y >= 90) {
            if (Math.abs(item.x - basketPos) < 10) {
              if (item.type === '💣') {
                endGame();
              } else {
                setScore(s => s + 10);
                if (speedRef.current < 5) speedRef.current += 0.05;
                if (dropRateRef.current < 0.2) dropRateRef.current += 0.002;
              }
            }
            return false;
          }
          return true;
        })
      );
    }, 50);

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameLoop);
    };
  }, [gameState, basketPos]);

  const handleTouchMove = (e) => {
    if (gameState !== 'playing') return;
    const touchX = e.touches[0].clientX;
    const gameRect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((touchX - gameRect.left) / gameRect.width) * 100;
    setBasketPos(Math.max(0, Math.min(90, relativeX)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <a
            className="inline-block px-4 py-1 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base"
            href="/"
          >
            ← Home
          </a>
        </div>

        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">🍎 Catch The Fruits</h1>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white relative">
              <div className="flex justify-between items-center mt-2 text-sm">
                <div>Score: {score}</div>
                <div>Time: ⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
              </div>
            </div>

            {/* Game Area */}
            <div
              ref={gameAreaRef}
              className="relative h-96 bg-gradient-to-b from-blue-200 to-blue-300 overflow-hidden"
              onTouchMove={handleTouchMove}
            >
              {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">
                      {gameState === 'ready' ? 'Ready!' :
                        gameState === 'paused' ? 'Paused' : 'Game Over!'}
                    </h2>
                    {gameState === 'over' && (
                      <div className="mb-3">
                        <p className="text-lg">Your Score: {score}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {gameState === 'paused' ? (
                        <>
                          <button onClick={resumeGame} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                            <FaPlay className="inline mr-2" /> Resume
                          </button>
                          <button onClick={restartGame} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                            <FaRedo className="inline mr-2" /> Restart
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={startGame} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                            <FaPlay className="inline mr-2" /> {gameState === 'ready' ? 'Start' : 'Play Again'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Basket */}
              <div className="absolute bottom-4 w-20 h-6 bg-yellow-500 rounded-t-lg transition-all duration-100" style={{ left: `${basketPos}%` }}>
                <div className="absolute -top-1 left-0 right-0 h-2 bg-yellow-400 rounded-t-lg" />
              </div>

              {/* Fruits */}
              {items.map(item => (
                <div key={item.id}
                  className="absolute text-3xl transition-all duration-50"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `rotate(${item.x * 3.6}deg)`
                  }}>
                  {item.type}
                </div>
              ))}
            </div>

            {/* Controls */}
            {gameState === 'playing' && (
              <div className="bg-gray-100 p-3 flex justify-center gap-4">
                <button onClick={pauseGame} className="bg-yellow-500 text-white p-3 rounded-full shadow-md">
                  <FaPause />
                </button>
                <button onClick={restartGame} className="bg-red-500 text-white p-3 rounded-full shadow-md">
                  <FaRedo />
                </button>
              </div>
            )}

            {/* Touch Controls */}
            {gameState === 'playing' && (
              <div className="bg-gray-100 p-4 flex justify-center gap-8">
                <button
                  onMouseDown={() => startMoving('left')}
                  onMouseUp={stopMoving}
                  onMouseLeave={stopMoving}
                  onTouchStart={() => startMoving('left')}
                  onTouchEnd={stopMoving}
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-lg text-xl font-bold active:bg-blue-600"
                >
                  ←
                </button>
                <button
                  onMouseDown={() => startMoving('right')}
                  onMouseUp={stopMoving}
                  onMouseLeave={stopMoving}
                  onTouchStart={() => startMoving('right')}
                  onTouchEnd={stopMoving}
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-lg text-xl font-bold active:bg-blue-600"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatchGame;
