import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const BrickBreaker = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState({
    ballPos: { x: 0, y: 0 },
    ballSpeed: { dx: 0, dy: 0 },
    paddleX: 0,
    bricks: [],
    score: 0,
    level: 1,
    isPaused: false,
    gameOver: false,
    gameWon: false,
    width: Math.min(500, window.innerWidth - 40),
    height: Math.min(500, window.innerWidth - 40),
    showLevelStart: true
  });

  const colors = {
    paddle: '#2563eb',
    ball: '#dc2626',
    brick: [
      '#f87171', '#fb923c', '#facc15', '#4ade80',
      '#60a5fa', '#a78bfa', '#f472b6'
    ],
    background: '#f3f4f6',
    text: '#1f2937'
  };

  const createBrickPattern = useCallback((level) => {
    const cols = 10;
    const rows = Math.min(3 + level, 7);
    const bricks = Array(rows).fill().map(() => Array(cols).fill(0));

    switch (level) {
      case 1:
        return bricks.map(row => row.fill(1));
      case 2:
        return bricks.map((row, r) =>
          row.map((_, c) => (r + c) % 2 === 0 ? 1 : 0)
        );
      case 3:
        return bricks.map(row =>
          row.map((_, c) => (c < 3 || c > 6) ? 1 : 0)
        );
      case 4:
        return bricks.map((row, r) =>
          row.map((_, c) => {
            const center = (cols - 1) / 2;
            const distance = Math.abs(c - center) + Math.abs(r - (rows - 1) / 2);
            return distance <= (rows / 2) ? 1 : 0;
          })
        );
      case 5:
        return bricks.map((row, r) =>
          row.map((_, c) => {
            if (r === 0) return 3;
            if (r === 1) return 2;
            return 1;
          })
        );
      default:
        return bricks.map(row => row.fill(1));
    }
  }, []);

  const initializePositions = useCallback((width, height) => {
    const paddleWidth = Math.min(100, width * 0.2);
    const ballRadius = Math.min(8, width * 0.016);
    const initialSpeed = Math.min(2, width * 0.004);

    return {
      ballPos: { 
        x: width / 2, 
        y: height - 40 
      },
      ballSpeed: { 
        dx: initialSpeed, 
        dy: -initialSpeed 
      },
      paddleX: (width - paddleWidth) / 2,
      paddleWidth: paddleWidth,
      ballRadius: ballRadius
    };
  }, []);

  const resetGame = useCallback(() => {
    const { width, height } = gameState;
    const positions = initializePositions(width, height);
    
    setGameState(prev => ({
      ...prev,
      ...positions,
      bricks: createBrickPattern(1),
      score: 0,
      gameOver: false,
      gameWon: false,
      isPaused: false,
      level: 1,
      showLevelStart: true
    }));
    setStarted(false);
  }, [createBrickPattern, gameState.width, gameState.height, initializePositions]);

  const nextLevel = useCallback(() => {
    if (gameState.level >= 5) {
      setGameState(prev => ({
        ...prev,
        gameWon: true,
        isPaused: true
      }));
      return;
    }

    const { width, height } = gameState;
    const positions = initializePositions(width, height);
    const speedMultiplier = 1.1;

    setGameState(prev => ({
      ...prev,
      ...positions,
      ballSpeed: {
        dx: positions.ballSpeed.dx * speedMultiplier,
        dy: positions.ballSpeed.dy * speedMultiplier
      },
      level: prev.level + 1,
      bricks: createBrickPattern(prev.level + 1),
      gameWon: false,
      isPaused: false,
      showLevelStart: true
    }));
    setStarted(false);
  }, [gameState.level, createBrickPattern, gameState.width, gameState.height, initializePositions]);

  const startLevel = useCallback(() => {
    setGameState(prev => ({ ...prev, showLevelStart: false }));
    setStarted(true);
  }, []);

  const gameLoop = useCallback(() => {
    if (!started || gameState.isPaused || gameState.gameOver || gameState.gameWon || gameState.showLevelStart) return;

    const { width, height } = gameState;
    let { ballPos, ballSpeed, paddleX, bricks, score } = gameState;
    const paddleWidth = Math.min(100, width * 0.2);
    const ballRadius = Math.min(8, width * 0.016);

    ballPos = {
      x: ballPos.x + ballSpeed.dx,
      y: ballPos.y + ballSpeed.dy
    };

    if (ballPos.x <= ballRadius || ballPos.x >= width - ballRadius) {
      ballSpeed.dx = -ballSpeed.dx;
    }
    if (ballPos.y <= ballRadius) {
      ballSpeed.dy = -ballSpeed.dy;
    }

    if (ballPos.y >= height - 20 &&
      ballPos.x >= paddleX &&
      ballPos.x <= paddleX + paddleWidth) {
      const hitPos = (ballPos.x - (paddleX + paddleWidth/2)) / (paddleWidth/2);
      ballSpeed = {
        dx: hitPos * (width * 0.012),
        dy: -Math.abs(ballSpeed.dy)
      };
    }

    let bricksLeft = 0;
    const brickWidth = width / bricks[0].length;
    const brickHeight = 20;
    const newBricks = bricks.map(row => [...row]);

    for (let r = 0; r < bricks.length; r++) {
      for (let c = 0; c < bricks[r].length; c++) {
        if (newBricks[r][c] > 0) {
          bricksLeft++;
          const brickX = c * brickWidth;
          const brickY = r * brickHeight + 30;

          if (
            ballPos.x + 8 > brickX &&
            ballPos.x - 8 < brickX + brickWidth &&
            ballPos.y + 8 > brickY &&
            ballPos.y - 8 < brickY + brickHeight
          ) {
            if (gameState.level >= 5 && newBricks[r][c] > 1) {
              newBricks[r][c] -= 1;
            } else {
              newBricks[r][c] = 0;
            }

            score += 10 * gameState.level;
            ballSpeed.dy = -ballSpeed.dy;
            if (newBricks[r][c] === 0) bricksLeft--;
          }
        }
      }
    }

    // Ball out of bounds (game over immediately)
    if (ballPos.y >= height) {
      setGameState(prev => ({ ...prev, gameOver: true }));
    }
    // Level complete
    else if (bricksLeft === 0) {
      setGameState(prev => ({ ...prev, gameWon: true }));
    }

    setGameState(prev => ({
      ...prev,
      ballPos,
      ballSpeed,
      bricks: newBricks,
      score
    }));

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, started]);

  useEffect(() => {
    resetGame();
    return () => cancelAnimationFrame(requestRef.current);
  }, [resetGame]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const moveAmount = gameState.width * 0.04; // 4% of canvas width
      if (e.key === 'ArrowLeft') {
        setGameState(prev => ({
          ...prev,
          paddleX: Math.max(0, prev.paddleX - moveAmount)
        }));
      } else if (e.key === 'ArrowRight') {
        setGameState(prev => ({
          ...prev,
          paddleX: Math.min(prev.width - prev.paddleWidth, prev.paddleX + moveAmount)
        }));
      } else if (e.key === 'p') {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.width, gameState.paddleWidth]);

  useEffect(() => {
    if (started && !gameState.isPaused && !gameState.gameOver && !gameState.gameWon && !gameState.showLevelStart) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameLoop, gameState.isPaused, gameState.gameOver, gameState.gameWon, started, gameState.showLevelStart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.paddle;
    ctx.fillRect(gameState.paddleX, gameState.height - 20, gameState.paddleWidth, 10);

    ctx.beginPath();
    ctx.arc(gameState.ballPos.x, gameState.ballPos.y, gameState.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.ball;
    ctx.fill();

    gameState.bricks.forEach((row, r) => {
      row.forEach((brick, c) => {
        if (brick > 0) {
          let colorIndex = r % colors.brick.length;
          if (gameState.level >= 5) {
            colorIndex = brick % colors.brick.length;
          }

          ctx.fillStyle = colors.brick[colorIndex];
          const brickWidth = gameState.width / gameState.bricks[0].length;
          ctx.fillRect(c * brickWidth + 1, r * 20 + 30, brickWidth - 2, 18);

          if (gameState.level >= 5 && brick > 1) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
              brick.toString(),
              c * brickWidth + brickWidth / 2,
              r * 20 + 30 + 12
            );
            ctx.textAlign = 'left';
          }
        }
      });
    });

    ctx.fillStyle = colors.text;
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 20);
    ctx.fillText(`Level: ${gameState.level}/5`, gameState.width / 2 - 30, 20);

    if (gameState.isPaused && !gameState.gameOver && !gameState.gameWon) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, gameState.width, gameState.height);
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', gameState.width / 2, gameState.height / 2);
      ctx.textAlign = 'left';
    }
  }, [gameState, colors]);

  useEffect(() => {
    const handleResize = () => {
      const newSize = Math.min(500, window.innerWidth - 40);
      const positions = initializePositions(newSize, newSize);
      
      setGameState(prev => ({
        ...prev,
        width: newSize,
        height: newSize,
        ...positions
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializePositions]);

  useEffect(() => {
    const { width, height } = gameState;
    const positions = initializePositions(width, height);
    setGameState(prev => ({
      ...prev,
      ...positions,
      bricks: createBrickPattern(1)
    }));
  }, [createBrickPattern, initializePositions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {(gameState.gameWon || gameState.level > 5) && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div className="max-w-3xl mx-auto space-y-4">
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h2 className="text-2xl md:text-3xl text-center font-bold">🏓 Brick Breaker</h2>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="w-full max-w-[540px] mx-auto bg-white p-4 md:p-6 rounded-xl shadow-lg relative">
            {(gameState.gameOver || gameState.gameWon || gameState.level > 5) && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-xl z-10">
                <h2 className="text-4xl font-bold text-white mb-4">
                  {gameState.level > 5 ? 'You Won The Game!' :
                    gameState.gameWon ? 'Level Complete!' : 'Game Over!'}
                </h2>
                <p className="text-xl text-white mb-6">
                  Final Score: {gameState.score} | Level: {gameState.level > 5 ? 5 : gameState.level}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => gameState.level > 5 ? resetGame() :
                      gameState.gameWon ? nextLevel() : resetGame()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {gameState.level > 5 ? 'Play Again' :
                      gameState.gameWon ? 'Next Level' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Home
                  </button>
                </div>
              </div>
            )}

            {(!started && gameState.showLevelStart) && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-xl z-10">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Level {gameState.level}
                </h2>
                <p className="text-white mb-6">
                  Score: {gameState.score}
                </p>
                <button
                  onClick={startLevel}
                  className="px-6 py-3 text-xl bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Start Level
                </button>
              </div>
            )}

            <div className="flex justify-center mb-4">
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm md:text-base"
                >
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={resetGame}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm md:text-base"
                >
                  Restart
                </button>
              </div>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={gameState.width}
                height={gameState.height}
                className="w-full h-auto border-2 border-gray-200 rounded-lg bg-gray-100"
              />

              <div className="mt-4 flex justify-center gap-8 max-w-md mx-auto">
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    paddleX: Math.max(0, prev.paddleX - (prev.width * 0.04))
                  }))}
                  onTouchStart={() => setGameState(prev => ({
                    ...prev,
                    paddleX: Math.max(0, prev.paddleX - (prev.width * 0.04))
                  }))}
                  className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg"
                >
                  ←
                </button>
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    paddleX: Math.min(prev.width - prev.paddleWidth, prev.paddleX + (prev.width * 0.04))
                  }))}
                  onTouchStart={() => setGameState(prev => ({
                    ...prev,
                    paddleX: Math.min(prev.width - prev.paddleWidth, prev.paddleX + (prev.width * 0.04))
                  }))}
                  className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrickBreaker;