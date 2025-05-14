import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const GRID_SIZE = 4;
const WIN_TILE = 8192;

const generateEmptyBoard = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
const getRandomEmptyCell = (board) => {
  const empty = [];
  board.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === 0) empty.push([i, j]);
    })
  );
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
};
const addNewTile = (board) => {
  const cell = getRandomEmptyCell(board);
  if (cell) {
    const [i, j] = cell;
    board[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
};
const cloneBoard = (board) => board.map(row => [...row]);
const boardsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const canMove = (board) => {
  if (board.some(row => row.includes(0))) return true;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE - 1; j++) {
      if (board[i][j] === board[i][j + 1]) return true;
    }
  }
  for (let j = 0; j < GRID_SIZE; j++) {
    for (let i = 0; i < GRID_SIZE - 1; i++) {
      if (board[i][j] === board[i + 1][j]) return true;
    }
  }
  return false;
};

const move = (board, direction) => {
  let moved = false;
  let newBoard = cloneBoard(board);
  const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  const rotateBack = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
  const operate = (row) => {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr[i + 1] = 0;
      }
    }
    return arr.filter(x => x !== 0).concat(Array(GRID_SIZE - arr.filter(x => x !== 0).length).fill(0));
  };

  if (direction === 'left') {
    newBoard = newBoard.map(row => {
      const operated = operate(row);
      if (!boardsEqual(row, operated)) moved = true;
      return operated;
    });
  } else if (direction === 'right') {
    newBoard = newBoard.map(row => {
      const reversed = [...row].reverse();
      const operated = operate(reversed).reverse();
      if (!boardsEqual(row, operated)) moved = true;
      return operated;
    });
  } else if (direction === 'up') {
    newBoard = rotate(newBoard);
    newBoard = newBoard.map(row => operate(row));
    newBoard = rotateBack(newBoard);
    moved = true;
  } else if (direction === 'down') {
    newBoard = rotate(newBoard);
    newBoard = newBoard.map(row => operate(row.reverse()).reverse());
    newBoard = rotateBack(newBoard);
    moved = true;
  }

  return { newBoard, moved };
};

const Puzzle2048 = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(() => {
    const b = generateEmptyBoard();
    addNewTile(b);
    addNewTile(b);
    return b;
  });
  const [hasWon, setHasWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('best2048')) || 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const touchStartRef = useRef(null);

  const getScore = (b) => Math.max(...b.flat());

  const updateBestScore = (newBoard) => {
    const current = getScore(newBoard);
    if (current > bestScore) {
      setBestScore(current);
      localStorage.setItem('best2048', current);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Confetti for 3 sec
    }
  };

  const handleMove = (direction) => {
    if (hasWon || isGameOver) return;
    const { newBoard, moved } = move(board, direction);
    if (moved) {
      addNewTile(newBoard);
      updateBestScore(newBoard);
      setBoard(newBoard);
      if (newBoard.flat().includes(WIN_TILE)) setHasWon(true);
      else if (!canMove(newBoard)) setIsGameOver(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowUp') handleMove('down');
    else if (e.key === 'ArrowDown') handleMove('up');
    else if (e.key === 'ArrowLeft') handleMove('left');
    else if (e.key === 'ArrowRight') handleMove('right');
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) handleMove(dx > 0 ? 'right' : 'left');
      else handleMove(dy > 0 ? 'down' : 'up');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });

  const restartGame = () => {
    const b = generateEmptyBoard();
    addNewTile(b);
    addNewTile(b);
    setBoard(b);
    setHasWon(false);
    setIsGameOver(false);
  };

  const getTileColor = (num) => {
    const colors = {
      0: 'bg-gray-300',
      2: 'bg-yellow-100 text-gray-800',
      4: 'bg-yellow-200 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-orange-600 text-white',
      128: 'bg-green-400 text-white',
      256: 'bg-green-500 text-white',
      512: 'bg-blue-400 text-white',
      1024: 'bg-blue-500 text-white',
      2048: 'bg-purple-500 text-white',
      4096: 'bg-purple-600 text-white',
      8192: 'bg-black text-white'
    };
    return colors[num] || 'bg-black text-white';
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/" data-discover="true">← Home</a>
        <h1 className="text-2xl md:text-4xl text-white text-center font-bold mb-4">🧩 2048 Game</h1>
        {showConfetti && <Confetti />}
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl mx-auto p-4 md:p-6">
            <div className="mb-2 text-base md:text-lg text-center font-medium text-gray-700">
              Best: {bestScore} | Current: {getScore(board)}
            </div>
            {hasWon && (
              <div className="mb-4 text-purple-700 font-semibold text-base md:text-lg animate-bounce">
                🎉 You Win! You've reached {WIN_TILE}!
              </div>
            )}
            {isGameOver && (
              <div className="mb-4 text-red-600 font-semibold text-base md:text-lg animate-pulse">
                ❌ Game Over! No moves left.
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {board.flat().map((num, i) => (
                <div
                  key={i}
                  className={`aspect-square w-full flex items-center justify-center text-xl md:text-2xl font-bold rounded ${getTileColor(num)}`}
                >
                  {num !== 0 ? num : ''}
                </div>
              ))}
            </div>
            <div className="mt-4 md:mt-6 text-center space-x-3 md:space-x-5">
              <button 
                onClick={restartGame} 
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base"
              >
                🔁 Restart
              </button>
              <button 
                onClick={restartGame} 
                className="px-3 md:px-4 py-1.5 md:py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm md:text-base"
              >
                🎯 New Game
              </button>
            </div>

            {/* Arrow Keys for Touch Devices */}
            <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 max-w-[200px] md:max-w-xs mx-auto">
              <div></div>
              <button
                onClick={() => handleMove('down')}
                className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => handleMove('left')}
                className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => handleMove('up')}
                className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                ↓
              </button>
              <button
                onClick={() => handleMove('right')}
                className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl md:text-2xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Puzzle2048;
