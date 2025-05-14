import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';

const SlidingPuzzle = () => {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [level, setLevel] = useState(1);
  const [isSolved, setIsSolved] = useState(false);
  const [hintTile, setHintTile] = useState(null);

  // Initialize game
  const initGame = () => {
    const numbers = [...Array(15).keys()].map(n => n + 1);
    let shuffled;
    let inversions;

    do {
      shuffled = [...numbers, null];
      inversions = 0;

      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Count inversions for solvability
      for (let i = 0; i < shuffled.length; i++) {
        for (let j = i + 1; j < shuffled.length; j++) {
          if (shuffled[i] && shuffled[j] && shuffled[i] > shuffled[j]) {
            inversions++;
          }
        }
      }
    } while (inversions % 2 !== 0); // Ensure puzzle is solvable

    setTiles(shuffled);
    setMoves(0);
    setTime(0);
    setIsRunning(true);
    setIsSolved(false);
    setHintTile(null);
  };

  // Check if puzzle is solved
  const checkSolved = (currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[currentTiles.length - 1] === null;
  };

  // Move tile
  const moveTile = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / 4);
    const emptyRow = Math.floor(emptyIndex / 4);

    if (
      (Math.abs(index - emptyIndex) === 1 && row === emptyRow) ||
      Math.abs(index - emptyIndex) === 4
    ) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      setHintTile(null); // Clear hint after move

      if (checkSolved(newTiles)) {
        setIsRunning(false);
        setIsSolved(true);
        fireConfetti();
      }
    }
  };

  // Show hint
  const showHint = () => {
    const emptyIndex = tiles.indexOf(null);
    const possibleMoves = [];

    // Find all movable tiles
    tiles.forEach((tile, index) => {
      if (tile === null) return;
      const row = Math.floor(index / 4);
      const emptyRow = Math.floor(emptyIndex / 4);

      if (
        (Math.abs(index - emptyIndex) === 1 && row === emptyRow) ||
        Math.abs(index - emptyIndex) === 4
      ) {
        possibleMoves.push(index);
      }
    });

    if (possibleMoves.length > 0) {
      const randomHint = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      setHintTile(randomHint);

      // Auto-hide hint after 2 seconds
      setTimeout(() => setHintTile(null), 2000);
    }
  };

  // Confetti effect
  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !isSolved) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isSolved]);

  // Initialize on mount and level change
  useEffect(() => {
    initGame();
  }, [level]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Difficulty levels
  const levels = [
    { id: 1, name: 'Easy', size: 4 },
    { id: 2, name: 'Medium', size: 5 },
    { id: 3, name: 'Hard', size: 6 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4 md:p-8 flex flex-col text-white items-center relative">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 className="text-xl md:text-2xl font-bold text-center">🧩 Sliding Puzzle</h1>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Game Info */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 p-3 md:p-4 bg-indigo-50">
              <div className="text-center">
                <div className="text-xs md:text-sm text-indigo-600">Moves</div>
                <div className="text-lg md:text-xl text-gray-600 font-bold">{moves}</div>
              </div>
              <div className="text-center">
                <div className="text-xs md:text-sm text-indigo-600">Time</div>
                <div className="text-lg md:text-xl text-gray-600 font-bold">{formatTime(time)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs md:text-sm text-indigo-600">Level</div>
                <select
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                  className="bg-white rounded text-gray-600 px-1 md:px-2 py-1 text-xs md:text-sm border border-indigo-300 w-full"
                >
                  {levels.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Puzzle Board */}
            <div className="p-2 md:p-4">
              <div className={`grid grid-cols-4 gap-1 md:gap-2 bg-indigo-100 p-1 md:p-2 rounded-lg 
              ${isSolved ? 'opacity-75' : ''}`}>
                {tiles.map((num, i) => (
                  <button
                    key={num || `empty-${i}`}
                    onClick={() => moveTile(i)}
                    className={`aspect-square flex items-center justify-center text-base md:text-xl font-bold rounded-lg transition-all duration-200 relative
                    ${num ?
                        'bg-white text-indigo-700 hover:bg-indigo-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' :
                        'bg-transparent'}
                    ${isSolved && num ? 'bg-green-100 text-green-700' : ''}
                    ${hintTile === i ? 'ring-2 md:ring-4 ring-yellow-400' : ''}`}
                  >
                    {num}
                    {hintTile === i && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-pulse w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full opacity-70"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="p-3 md:p-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={showHint}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
                disabled={isSolved}
              >
                <LightBulbIcon className="h-4 w-4 md:h-5 md:w-5" />
                Hint
              </button>

              <button
                onClick={initGame}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                <ArrowPathIcon className="h-4 w-4 md:h-5 md:w-5" />
                Restart
              </button>
            </div>

            {/* Solved Message */}
            {isSolved && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 md:p-6 rounded-xl text-center max-w-[90%] md:max-w-xs animate-bounce-in">
                  <h2 className="text-xl md:text-2xl font-bold text-green-600 mb-2">Puzzle Solved!</h2>
                  <p className="text-sm md:text-base mb-2">Moves: {moves}</p>
                  <p className="text-sm md:text-base mb-4">Time: {formatTime(time)}</p>
                  <button
                    onClick={initGame}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm md:text-base"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingPuzzle;