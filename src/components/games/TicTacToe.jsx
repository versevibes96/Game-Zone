// src/components/TicTacToe.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (squares) => {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || gameStatus !== 'playing') return;
    
    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    
    const win = checkWinner(newBoard);
    if (win) {
      setGameStatus('won');
      setWinner(win);
      setShowPopup(true);
    } else if (newBoard.every(square => square)) {
      setGameStatus('draw');
      setShowPopup(true);
    }
    
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('playing');
    setWinner(null);
    setShowPopup(false);
  };

  const renderCell = (index) => {
    return (
      <button
        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 sm:border-3 md:border-4 border-purple-800 text-2xl sm:text-3xl md:text-4xl font-bold
          ${board[index] === 'X' ? 'text-red-500' : 'text-blue-500'}
          ${!board[index] && 'hover:bg-purple-50 hover:bg-opacity-10'}
          transition-colors duration-200`}
        onClick={() => handleClick(index)}
        disabled={gameStatus !== 'playing'}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white text-purple-900 p-4 sm:p-6 md:p-8 rounded-2xl text-center transform scale-95 animate-scale-up mx-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {gameStatus === 'won' ? `${winner} Won! 🎉` : 'Draw! 🤝'}
            </h2>
            <button
              onClick={resetGame}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-purple-600 text-white rounded-lg
                hover:bg-purple-700 transition-all duration-300 font-bold text-base sm:text-lg md:text-xl
                hover:scale-105"
            >
              New Game
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Link 
          to="/" 
          className="inline-block px-4 sm:px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300 text-sm sm:text-base"
        >
          ← Home
        </Link>

        <h1 className="text-4xl text-center font-bold mb-4">Tic Tac Toe</h1>

        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="text-xl sm:text-2xl text-center mb-4 sm:mb-6 font-semibold text-purple-800">
            {gameStatus === 'playing' && `Move: ${isXNext ? 'X' : 'O'}`}
          </div>

          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i}>{renderCell(i)}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 rounded-lg hover:bg-red-600
                transition-colors duration-200 font-semibold text-sm sm:text-base"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default TicTacToe;

