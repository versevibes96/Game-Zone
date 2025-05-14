// src/components/SnakeGame.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const DIRECTIONS = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };

const Snake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [gameStarted, setGameStarted] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(150);
    setGameStarted(false);
  };

  const checkCollision = (head) => {
    if (head.x >= GRID_SIZE || head.x < 0 || head.y >= GRID_SIZE || head.y < 0) return true;
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (checkCollision(head)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 1;
          if (newScore % 5 === 0) setSpeed(prevSpeed => Math.max(50, prevSpeed - 10));
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, gameOver, gameStarted, generateFood]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newDirection = DIRECTIONS[e.key];
      if (newDirection) {
        setDirection(prev => {
          if (
            (prev === 'UP' && newDirection === 'DOWN') ||
            (prev === 'DOWN' && newDirection === 'UP') ||
            (prev === 'LEFT' && newDirection === 'RIGHT') ||
            (prev === 'RIGHT' && newDirection === 'LEFT')
          ) return prev;
          return newDirection;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Touch Controls
  const handleTouchControl = (newDirection) => {
    setDirection(prev => {
      if (
        (prev === 'UP' && newDirection === 'DOWN') ||
        (prev === 'DOWN' && newDirection === 'UP') ||
        (prev === 'LEFT' && newDirection === 'RIGHT') ||
        (prev === 'RIGHT' && newDirection === 'LEFT')
      ) return prev;
      return newDirection;
    });
  };

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4 md:p-8 flex flex-col text-white items-center relative">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/">← Home</a>

        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">Snake Game</h1>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <p className="text-lg md:text-xl text-center text-gray-600 mb-4">स्कोर: {score}</p>

          <div className="relative bg-black bg-opacity-50 p-2 rounded-lg shadow-2xl">
            <div
              className="grid gap-px bg-gray-800 rounded"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                width: 'min(80vw, 600px)',
                height: 'min(80vw, 600px)',
                margin: '0 auto'
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;

                return (
                  <div
                    key={index}
                    className={`${isSnake ? 'bg-green-500' : ''} ${isFood ? 'bg-red-500' : 'bg-gray-900'}`}
                  />
                );
              })}
            </div>

            {!gameStarted && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                <button
                  onClick={startGame}
                  className="px-4 md:px-8 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base md:text-xl font-bold transition-colors"
                >
                  खेल शुरू करें
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg">
                <h2 className="text-2xl md:text-3xl text-white font-bold mb-2 md:mb-4">गेम समाप्त!</h2>
                <p className="text-lg md:text-xl text-white mb-4 md:mb-6">अंतिम स्कोर: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-4 md:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
                >
                  फिर से खेलें
                </button>
              </div>
            )}
          </div>

          {/* Touch Controls (Mobile-Friendly Buttons) */}
          <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 max-w-[200px] md:max-w-xs mx-auto">
            <div></div>
            <button
              onClick={() => handleTouchControl('UP')}
              className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => handleTouchControl('LEFT')}
              className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => handleTouchControl('DOWN')}
              className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              ↓
            </button>
            <button
              onClick={() => handleTouchControl('RIGHT')}
              className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snake;