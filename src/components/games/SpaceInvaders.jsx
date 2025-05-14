import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const LEVELS = [
  { enemyHealth: 1, speed: 1, fireRate: 0.01 },
  { enemyHealth: 2, speed: 1, fireRate: 0.015 },
  { enemyHealth: 2, speed: 1, fireRate: 0.02 },
  { enemyHealth: 3, speed: 1, fireRate: 0.025 },
  { enemyHealth: 3, speed: 1, fireRate: 0.03 },
];

const getResponsiveCanvasSize = () => {
  const maxWidth = Math.min(window.innerWidth - 16, 800);
  const scale = maxWidth / 800;
  return {
    width: Math.round(800 * scale),
    height: Math.round(600 * scale),
    scale,
  };
};

const SpaceInvaders = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextLevelBtn, setShowNextLevelBtn] = useState(false);
  const [canvasSize, setCanvasSize] = useState(getResponsiveCanvasSize());
  const [mobileMove, setMobileMove] = useState({ left: false, right: false });

  const player = useRef({ x: CANVAS_WIDTH / 2 - 25, y: CANVAS_HEIGHT - 60, width: 50, height: 20 });
  const bullets = useRef([]);
  const enemyBullets = useRef([]);
  const enemies = useRef([]);
  const shields = useRef([]);

  useEffect(() => {
    if (gameState === 'playing') {
      initEnemies();
      initShields();
      const interval = setInterval(updateGame, 1000 / 60);
      const handleKeyDown = (e) => {
        if (paused || showNextLevelBtn) return;
        if (e.key === 'ArrowLeft' && player.current.x > 0) player.current.x -= 20;
        if (e.key === 'ArrowRight' && player.current.x + player.current.width < CANVAS_WIDTH) player.current.x += 20;
        if (e.key === ' ') bullets.current.push({ x: player.current.x + 20, y: player.current.y });
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        clearInterval(interval);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [gameState, paused, level]);

  useEffect(() => {
    const handleResize = () => setCanvasSize(getResponsiveCanvasSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!gameState === 'playing') return;
    let moveInterval;
    if (mobileMove.left || mobileMove.right) {
      moveInterval = setInterval(() => {
        if (mobileMove.left && player.current.x > 0) player.current.x -= 20;
        if (mobileMove.right && player.current.x + player.current.width < CANVAS_WIDTH) player.current.x += 20;
      }, 30);
    }
    return () => clearInterval(moveInterval);
  }, [mobileMove, gameState]);

  const initEnemies = () => {
    const { enemyHealth } = LEVELS[level];
    enemies.current = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        enemies.current.push({ x: 80 + j * 80, y: 60 + i * 40, health: enemyHealth });
      }
    }
  };

  const initShields = () => {
    shields.current = [];
    const startX = 100;
    const shieldWidth = 60;
    for (let s = 0; s < 4; s++) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          shields.current.push({
            x: startX + s * 160 + c * 10,
            y: CANVAS_HEIGHT - 150 + r * 10,
            health: 2,
          });
        }
      }
    }
  };

  const getScale = () => canvasSize.width / 800;

  const drawRect = (ctx, x, y, w, h, color) => {
    const scale = getScale();
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
  };

  const updateGame = () => {
    if (paused || gameState !== 'playing') return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    const scale = getScale();

    // Draw player
    drawRect(ctx, player.current.x, player.current.y, player.current.width, player.current.height, 'lime');

    // Draw shields
    shields.current = shields.current.filter((s) => s.health > 0);
    shields.current.forEach((s) => {
      drawRect(ctx, s.x, s.y, 10, 10, s.health === 2 ? '#00f0ff' : '#007788');
    });

    // Player bullets
    ctx.fillStyle = 'yellow';
    bullets.current = bullets.current.filter((b) => b.y > 0);
    bullets.current.forEach((b) => {
      b.y -= 5;
      drawRect(ctx, b.x, b.y, 5, 10, 'yellow');
    });

    // Enemy bullets
    const fireRate = LEVELS[level].fireRate;
    enemies.current.forEach((enemy) => {
      if (Math.random() < fireRate && enemy.health > 0) {
        enemyBullets.current.push({ x: enemy.x + 20, y: enemy.y + 30 });
      }
    });

    ctx.fillStyle = 'red';
    enemyBullets.current = enemyBullets.current.filter((b) => b.y < CANVAS_HEIGHT);
    enemyBullets.current.forEach((b) => {
      b.y += 4;
      drawRect(ctx, b.x, b.y, 5, 10, 'red');

      // Collision with player
      if (
        b.x < player.current.x + player.current.width &&
        b.x + 5 > player.current.x &&
        b.y < player.current.y + player.current.height &&
        b.y + 10 > player.current.y
      ) {
        b.y = CANVAS_HEIGHT + 10;
        setGameState('over');
      }

      // Collision with shield
      shields.current.forEach((s) => {
        if (
          b.x < s.x + 10 &&
          b.x + 5 > s.x &&
          b.y < s.y + 10 &&
          b.y + 10 > s.y
        ) {
          s.health--;
          b.y = CANVAS_HEIGHT + 10;
        }
      });
    });

    // Enemies
    enemies.current.forEach((enemy) => {
      if (enemy.health > 0) drawRect(ctx, enemy.x, enemy.y, 40, 30, 'pink');
    });

    // Collision: bullet hits enemy
    bullets.current.forEach((bullet) => {
      enemies.current.forEach((enemy) => {
        if (
          bullet.x < enemy.x + 40 &&
          bullet.x + 5 > enemy.x &&
          bullet.y < enemy.y + 30 &&
          bullet.y + 10 > enemy.y &&
          enemy.health > 0
        ) {
          bullet.y = -10;
          enemy.health--;
          if (enemy.health === 0) setScore((prev) => prev + 10);
        }
      });

      // Collision with shields
      shields.current.forEach((s) => {
        if (
          bullet.x < s.x + 10 &&
          bullet.x + 5 > s.x &&
          bullet.y < s.y + 10 &&
          bullet.y + 10 > s.y
        ) {
          s.health--;
          bullet.y = -10;
        }
      });
    });

    // Win check
    if (enemies.current.every((e) => e.health <= 0)) {
      if (level < LEVELS.length - 1) {
        setShowNextLevelBtn(true);
      } else {
        endGame();
      }
    }

    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `${16 * scale}px Arial`;
    ctx.fillText(`Score: ${score}`, 10 * scale, 20 * scale);
    ctx.fillText(`Level: ${level + 1}`, 10 * scale, 60 * scale);
  };

  const endGame = () => {
    setGameState('over');
    setShowConfetti(true);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(0);
    setShowConfetti(false);
    setGameState('playing');
    setShowNextLevelBtn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-2 md:p-6 relative">
      <div className="w-full max-w-2xl mx-auto">
        {/* Home Button */}
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base mb-2" href="/">← Home</a>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-8">Space Invaders</h1>
        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-3 md:p-8">
          {/* Score/Level */}
          <div className="flex flex-col md:flex-row justify-between w-full mb-2 md:mb-4 gap-2 md:gap-8">
            <div className="text-base md:text-xl text-purple-700 font-semibold">Score: {score}</div>
            <div className="text-base md:text-xl text-purple-700 font-semibold">Level: {level + 1}</div>
          </div>
          {/* Canvas */}
          <div className="flex justify-center w-full mb-4 md:mb-6 overflow-x-auto">
            <div style={{ width: canvasSize.width, height: canvasSize.height }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{ width: canvasSize.width, height: canvasSize.height, maxWidth: '100%', display: 'block' }}
                className="border-4 border-green-500 bg-black rounded-xl shadow-lg"
              />
            </div>
          </div>
          {/* Mobile Controls */}
          {gameState === 'playing' && (
            <div className="flex justify-center gap-6 mb-4">
              <button
                className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
                onTouchStart={() => setMobileMove(m => ({ ...m, left: true }))}
                onTouchEnd={() => setMobileMove(m => ({ ...m, left: false }))}
                onMouseDown={() => setMobileMove(m => ({ ...m, left: true }))}
                onMouseUp={() => setMobileMove(m => ({ ...m, left: false }))}
                onMouseLeave={() => setMobileMove(m => ({ ...m, left: false }))}
              >
                ←
              </button>
              <button
                className="bg-yellow-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-yellow-600"
                onClick={() => bullets.current.push({ x: player.current.x + 20, y: player.current.y })}
              >
                ⬆️
              </button>
              <button
                className="bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg active:bg-blue-600"
                onTouchStart={() => setMobileMove(m => ({ ...m, right: true }))}
                onTouchEnd={() => setMobileMove(m => ({ ...m, right: false }))}
                onMouseDown={() => setMobileMove(m => ({ ...m, right: true }))}
                onMouseUp={() => setMobileMove(m => ({ ...m, right: false }))}
                onMouseLeave={() => setMobileMove(m => ({ ...m, right: false }))}
              >
                →
              </button>
            </div>
          )}
          {/* Game States */}
          {gameState === 'start' && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                className="bg-green-500 hover:bg-green-600 px-6 md:px-8 py-3 md:py-4 text-lg md:text-2xl rounded-lg font-bold shadow mb-2"
                onClick={handleRestart}
              >
                START GAME
              </button>
            </div>
          )}
          {gameState === 'over' && (
            <div className="text-center w-full flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold text-purple-900 mb-2">GAME OVER</h2>
              <div className="text-base md:text-xl text-purple-700 mb-2">
                <p>Score: <span className="text-blue-500 font-bold">{score}</span></p>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 px-6 md:px-8 py-3 rounded-lg font-bold text-white shadow mb-2"
                onClick={handleRestart}
              >
                NEW GAME
              </button>
            </div>
          )}
          {showConfetti && <Confetti width={canvasSize.width} height={canvasSize.height} />}
          {gameState === 'playing' && (
            <div className="flex flex-col md:flex-row gap-4 mt-4 w-full justify-center items-center">
              {showNextLevelBtn ? (
                <button
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-white shadow"
                  onClick={() => {
                    setLevel((prev) => prev + 1);
                    setShowNextLevelBtn(false);
                    bullets.current = [];
                    enemyBullets.current = [];
                    initEnemies();
                    initShields();
                  }}
                >
                  NEXT LEVEL
                </button>
              ) : (
                <>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-bold text-white shadow"
                    onClick={() => setPaused(!paused)}
                  >
                    {paused ? 'RESUME' : 'PAUSE'}
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-bold text-white shadow"
                    onClick={() => setGameState('start')}
                  >
                    RESTART
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceInvaders;
