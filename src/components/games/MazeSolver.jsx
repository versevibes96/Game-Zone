import React, { useState, useEffect, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';

const MazeSolver = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('mazeBestScore')) || Infinity;
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [touchDirection, setTouchDirection] = useState(null);
  const touchInterval = useRef(null);

  // Maze configuration
  const getRandomMazeSize = () => {
    const sizes = [12, 15, 18];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const wall = '█';
  const path = '·';
  const player = '●';
  const exit = '★';
  const trap = '×';
  const teleport = '○';
  const coins = ['•', '•', '•'];

  // Add path-finding function to check if maze is solvable
  const isMazeSolvable = useCallback((maze, startX, startY, endX, endY) => {
    const visited = new Set();
    const queue = [[startX, startY]];
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const [x, y] = queue.shift();

      if (x === endX && y === endY) {
        return true;
      }

      // Check all four directions
      const directions = [
        [0, 1],  // right
        [1, 0],  // down
        [0, -1], // left
        [-1, 0]  // up
      ];

      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (
          newX >= 0 && newX < maze[0].length &&
          newY >= 0 && newY < maze.length &&
          !visited.has(`${newX},${newY}`) &&
          maze[newY][newX] !== wall
        ) {
          queue.push([newX, newY]);
          visited.add(`${newX},${newY}`);
        }
      }
    }

    return false;
  }, []);

  // Generate a challenging but solvable maze
  const generateMaze = useCallback(() => {
    let newMaze;
    let isSolvable = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const mazeSize = getRandomMazeSize();
      newMaze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(path));
      setCollectedCoins(0);
      
      // Add walls (40-50% of cells)
      const wallPercentage = 0.40 + (Math.random() * 0.1);
      for (let i = 0; i < mazeSize * mazeSize * wallPercentage; i++) {
        const x = Math.floor(Math.random() * mazeSize);
        const y = Math.floor(Math.random() * mazeSize);
        if (!(x === 0 && y === 0)) { // Don't block start
          newMaze[y][x] = wall;
        }
      }
      
      // Add traps (15-20% of cells)
      const trapCount = Math.floor(mazeSize * mazeSize * (0.15 + Math.random() * 0.05));
      for (let i = 0; i < trapCount; i++) {
        const x = Math.floor(Math.random() * mazeSize);
        const y = Math.floor(Math.random() * mazeSize);
        if (newMaze[y][x] === path && !(x === 0 && y === 0)) {
          newMaze[y][x] = trap;
        }
      }
      
      // Add teleports (3-5 pairs)
      const teleportCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < teleportCount; i++) {
        for (let j = 0; j < 2; j++) { // Create pairs
          let x, y;
          do {
            x = Math.floor(Math.random() * mazeSize);
            y = Math.floor(Math.random() * mazeSize);
          } while (newMaze[y][x] !== path || (x === 0 && y === 0));
          newMaze[y][x] = teleport;
        }
      }
      
      // Add coins (15-20)
      const coinCount = 15 + Math.floor(Math.random() * 6);
      setTotalCoins(coinCount);
      for (let i = 0; i < coinCount; i++) {
        const x = Math.floor(Math.random() * mazeSize);
        const y = Math.floor(Math.random() * mazeSize);
        if (newMaze[y][x] === path) {
          newMaze[y][x] = coins[Math.floor(Math.random() * coins.length)];
        }
      }
      
      // Set exit position (bottom right corner)
      newMaze[mazeSize-1][mazeSize-1] = exit;

      // Check if maze is solvable
      isSolvable = isMazeSolvable(newMaze, 0, 0, mazeSize-1, mazeSize-1);
      attempts++;

      // If not solvable and we've tried too many times, create a simple path
      if (!isSolvable && attempts >= maxAttempts) {
        // Create a simple path from start to end
        let x = 0, y = 0;
        while (x < mazeSize-1 || y < mazeSize-1) {
          if (x < mazeSize-1) {
            x++;
            newMaze[y][x] = path;
          }
          if (y < mazeSize-1) {
            y++;
            newMaze[y][x] = path;
          }
        }
        isSolvable = true;
      }
    } while (!isSolvable && attempts < maxAttempts);

    return newMaze;
  }, [isMazeSolvable]);

  // Initialize game
  const startGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setGameOver(false);
    setShowConfetti(false);
    setMoves(0);
    setTimeLeft(60);
    setTimerActive(true);
  }, [generateMaze]);

  // Handle timer countdown
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && !gameOver) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft <= 0 && !gameOver) {
      setGameOver(true);
      setTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive, gameOver]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;
    
    const { x, y } = playerPos;
    let newX = x;
    let newY = y;
    
    switch(e.key) {
      case 'ArrowUp':
        newY = Math.max(0, y - 1);
        break;
      case 'ArrowDown':
        newY = Math.min(maze.length - 1, y + 1);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, x - 1);
        break;
      case 'ArrowRight':
        newX = Math.min(maze[0].length - 1, x + 1);
        break;
      default:
        return;
    }
    
    // Check if new position is valid
    const cell = maze[newY][newX];
    
    if (cell === wall) return; // Can't move through walls
    
    setPlayerPos({ x: newX, y: newY });
    setMoves(prev => prev + 1);
    
    // Handle special cells
    if (cell === trap) {
      // Lose time for hitting a trap
      setTimeLeft(prev => Math.max(0, prev - 8));
    } 
    else if (cell === teleport) {
      // Find the other teleport
      const teleports = [];
      maze.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === teleport && !(x === newX && y === newY)) {
            teleports.push({ x, y });
          }
        });
      });
      
      if (teleports.length > 0) {
        const randomTeleport = teleports[Math.floor(Math.random() * teleports.length)];
        setPlayerPos(randomTeleport);
      }
    }
    else if (coins.includes(cell)) {
      // Collect coin
      const newMaze = [...maze];
      newMaze[newY][newX] = path;
      setMaze(newMaze);
      setCollectedCoins(prev => prev + 1);
      // Add time bonus
      setTimeLeft(prev => prev + 2);
    }
    
    // Check if reached exit
    if (cell === exit) {
      setGameOver(true);
      setShowConfetti(true);
      setTimerActive(false);
      if (moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('mazeBestScore', moves.toString());
      }
    }
  }, [playerPos, maze, gameOver, moves, bestScore, coins]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Initialize game on first render
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Add touch handlers
  const handleTouchStart = (e, direction) => {
    e.preventDefault(); // Prevent default touch behavior
    setTouchDirection(direction);
    
    // Initial movement
    const fakeEvent = { key: `Arrow${direction}`, preventDefault: () => {} };
    handleKeyDown(fakeEvent);
    
    // Set up continuous movement
    touchInterval.current = setInterval(() => {
      handleKeyDown(fakeEvent);
    }, 150);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    setTouchDirection(null);
    if (touchInterval.current) {
      clearInterval(touchInterval.current);
      touchInterval.current = null;
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (touchInterval.current) {
        clearInterval(touchInterval.current);
      }
    };
  }, []);

  // Render maze cell
  const renderCell = (cell, x, y) => {
    if (playerPos.x === x && playerPos.y === y) {
      return player;
    }
    return cell;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {showConfetti && <Confetti 
        width={dimensions.width} 
        height={dimensions.height} 
        recycle={false}
        numberOfPieces={500}
      />}
      
      <div className="max-w-md mx-auto space-y-4">
        <a 
          className="inline-block px-4 py-1 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full
          hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" 
          href="/"
        >
          ← Home
        </a>
        
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">Maze Solver</h1>
        
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-800 font-bold">Moves: <span className="text-blue-600">{moves}</span></p>
            <p className="text-gray-800 font-bold">Best: <span className="text-purple-600">
              {bestScore === Infinity ? '--' : bestScore}
            </span></p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-800 font-bold">
              Coins: <span className="text-yellow-600">{collectedCoins}/{totalCoins}</span>
            </p>
            <p className="text-gray-800 font-bold">
              Time: <span className={timeLeft < 10 ? 'text-red-600' : 'text-green-600'}>{timeLeft}s</span>
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg mb-6 font-mono">
            {maze.map((row, y) => (
              <div key={y} className="flex justify-center">
                {row.map((cell, x) => (
                  <div 
                    key={x} 
                    className={`w-6 h-6 flex items-center justify-center text-lg
                      ${cell === wall ? 'text-gray-700' : ''}
                      ${cell === trap ? 'text-red-500' : ''}
                      ${cell === teleport ? 'text-blue-400' : ''}
                      ${coins.includes(cell) ? 'text-yellow-400' : ''}
                      ${cell === exit ? 'text-green-400' : ''}
                      ${cell === path ? 'text-gray-600' : ''}
                      ${playerPos.x === x && playerPos.y === y ? 'text-white' : ''}
                    `}
                  >
                    {renderCell(cell, x, y)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {gameOver && (
            <div className={`text-center font-bold text-xl mb-4 ${timeLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {timeLeft > 0 ? (
                <div>
                  🎉 You solved the maze in {moves} moves!<br />
                  Collected {collectedCoins}/{totalCoins} coins
                </div>
              ) : (
                '⏰ Time expired! Try again.'
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 cursor-pointer"
            >
              {gameOver ? 'New Puzzle' : 'Restart'}
            </button>
          </div>

          {/* Game controls - now visible on all devices */}
          <div className="mt-6">
            <div className="grid grid-cols-3 gap-3 max-w-[250px] mx-auto">
              <div></div>
              <button
                onTouchStart={(e) => handleTouchStart(e, 'Up')}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleTouchStart(e, 'Up')}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg transition-colors
                  ${touchDirection === 'Up' ? 'bg-blue-700' : 'hover:bg-blue-600 active:bg-blue-700'}`}
              >
                ↑
              </button>
              <div></div>
              <button
                onTouchStart={(e) => handleTouchStart(e, 'Left')}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleTouchStart(e, 'Left')}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg transition-colors
                  ${touchDirection === 'Left' ? 'bg-blue-700' : 'hover:bg-blue-600 active:bg-blue-700'}`}
              >
                ←
              </button>
              <button
                onTouchStart={(e) => handleTouchStart(e, 'Down')}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleTouchStart(e, 'Down')}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg transition-colors
                  ${touchDirection === 'Down' ? 'bg-blue-700' : 'hover:bg-blue-600 active:bg-blue-700'}`}
              >
                ↓
              </button>
              <button
                onTouchStart={(e) => handleTouchStart(e, 'Right')}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleTouchStart(e, 'Right')}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`bg-blue-500 text-white p-4 rounded-lg font-bold text-2xl shadow-lg transition-colors
                  ${touchDirection === 'Right' ? 'bg-blue-700' : 'hover:bg-blue-600 active:bg-blue-700'}`}
              >
                →
              </button>
            </div>
            <div className="text-center text-gray-600 text-sm mt-2">
              Use arrow keys or tap/hold buttons to move
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeSolver;