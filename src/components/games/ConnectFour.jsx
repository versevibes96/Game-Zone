import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const ROWS = 6;
const COLS = 7;

const createBoard = () => Array(ROWS).fill().map(() => Array(COLS).fill(null));

const ConnectFour = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState('🔴');
  const [winner, setWinner] = useState(null);

  const checkWinner = (board) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = board[row][col];
        if (!cell) continue;
        for (let [dx, dy] of directions) {
          let count = 1;
          for (let step = 1; step < 4; step++) {
            const r = row + dx * step;
            const c = col + dy * step;
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== cell) break;
            count++;
          }
          if (count === 4) return cell;
        }
      }
    }
    return null;
  };

  const dropPiece = (col) => {
    if (winner) return;

    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = currentPlayer;
        const win = checkWinner(newBoard);
        setBoard(newBoard);
        if (win) {
          setWinner(win);
        } else {
          setCurrentPlayer(prev => (prev === '🔴' ? '🔵' : '🔴'));
        }
        break;
      }
    }
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer('🔴');
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4 md:p-8 flex flex-col text-white items-center relative">
      {winner && <Confetti width={width} height={height} />}
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/" data-discover="true">← Home</a>
        <h2 className="text-2xl md:text-4xl text-center font-bold mb-4">🔴🔵 Connect Four</h2>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="mb-4 text-lg md:text-xl text-black text-center font-semibold">
            {winner ? (
              <span className="animate-pulse">{winner} Wins! 🎉</span>
            ) : (
              <span>Turn: {currentPlayer}</span>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2 bg-blue-600 p-2 md:p-3 rounded-xl shadow-md">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => dropPiece(colIndex)}
                  className="aspect-square w-full max-w-[3rem] md:max-w-[4rem] mx-auto bg-white rounded-full cursor-pointer relative flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {cell && (
                    <div className={`w-[85%] h-[85%] rounded-full ${cell === '🔴' ? 'bg-red-500' : 'bg-blue-500'} animate-pop`}></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 md:mt-6 flex justify-center">
            <button
              onClick={resetGame}
              className="px-4 md:px-6 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 transition text-sm md:text-base"
            >
              Restart
            </button>
          </div>

          {/* Tailwind keyframe animation */}
          <style>{`
            @keyframes pop {
              0% { transform: scale(0.3); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop {
              animation: pop 0.3s ease-out;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ConnectFour;
