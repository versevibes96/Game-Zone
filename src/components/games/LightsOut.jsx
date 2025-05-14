import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const GRID_SIZE = 5;

const generateGrid = () =>
  Array(GRID_SIZE).fill().map(() =>
    Array(GRID_SIZE).fill().map(() => Math.random() < 0.5)
  );

const LightsOut = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(generateGrid());
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    const allOff = grid.flat().every(cell => !cell);
    if (allOff) setHasWon(true);
  }, [grid]);

  const toggleLight = (row, col) => {
    if (hasWon) return;
    const newGrid = grid.map(arr => [...arr]);

    const toggle = (i, j) => {
      if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
        newGrid[i][j] = !newGrid[i][j];
      }
    };

    toggle(row, col);
    toggle(row - 1, col);
    toggle(row + 1, col);
    toggle(row, col - 1);
    toggle(row, col + 1);

    setGrid(newGrid);
  };

  const resetGame = () => {
    setGrid(generateGrid());
    setHasWon(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-2 sm:p-4 md:p-6 relative">
      <div className="max-w-2xl mx-auto">
        <a className="inline-block px-3 sm:px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/">← Home</a>
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-center font-bold mb-4">Lights Out</h1>

        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center">
          {hasWon && <Confetti />}

          <p className="mb-4 text-base sm:text-lg text-gray-600 font-medium text-center">
            {hasWon ? "You turned off all the lights! 🎉" : "Turn off all the lights to win!"}
          </p>

          <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-4 sm:mb-6">
            {grid.map((row, i) =>
              row.map((on, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => toggleLight(i, j)}
                  className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded shadow transition-all duration-200 ${
                    on ? 'bg-yellow-400' : 'bg-gray-800'
                  }`}
                />
              ))
            )}
          </div>

          <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
            <button
              onClick={resetGame}
              className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition text-sm sm:text-base"
            >
              New Game
            </button>
            <button
              onClick={() => navigate(0)}
              className="px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded font-semibold hover:bg-yellow-600 transition text-sm sm:text-base"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightsOut;
