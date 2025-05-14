// src/components/games/Battleship.jsx
import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

const BOARD_SIZE = 10;
const SHIPS = [
  { size: 5, name: 'Carrier' },
  { size: 4, name: 'Battleship' },
  { size: 3, name: 'Cruiser' },
  { size: 3, name: 'Submarine' },
  { size: 2, name: 'Destroyer' },
];

const Battleship = () => {
  const navigate = useNavigate();
  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());
  const [computerBoard, setComputerBoard] = useState(createEmptyBoard());
  const [playerShips, setPlayerShips] = useState([]);
  const [computerShips, setComputerShips] = useState([]);
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, gameOver
  const [currentShip, setCurrentShip] = useState(0);
  const [shipOrientation, setShipOrientation] = useState('horizontal');
  const [message, setMessage] = useState('Place your ships!');
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (winner === 'player') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [winner]);

  function createEmptyBoard() {
    return Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
  }

  function placeShip(board, ship, startRow, startCol, orientation) {
    const newBoard = [...board];
    const shipCells = [];

    for (let i = 0; i < ship.size; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;

      if (row >= BOARD_SIZE || col >= BOARD_SIZE || newBoard[row][col] !== null) {
        return null;
      }

      newBoard[row][col] = ship.name;
      shipCells.push({ row, col });
    }

    return { board: newBoard, cells: shipCells };
  }

  function placeComputerShips() {
    const newBoard = createEmptyBoard();
    const ships = [];

    SHIPS.forEach(ship => {
      let placed = false;
      while (!placed) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const startRow = Math.floor(Math.random() * BOARD_SIZE);
        const startCol = Math.floor(Math.random() * BOARD_SIZE);

        const result = placeShip(newBoard, ship, startRow, startCol, orientation);
        if (result) {
          ships.push({ ...ship, cells: result.cells });
          Object.assign(newBoard, result.board);
          placed = true;
        }
      }
    });

    setComputerBoard(newBoard);
    setComputerShips(ships);
  }

  function handleCellClick(row, col) {
    if (gamePhase === 'setup') {
      if (currentShip >= SHIPS.length) return;

      const result = placeShip(playerBoard, SHIPS[currentShip], row, col, shipOrientation);
      if (result) {
        setPlayerBoard(result.board);
        setPlayerShips([...playerShips, { ...SHIPS[currentShip], cells: result.cells }]);
        setCurrentShip(currentShip + 1);

        if (currentShip + 1 === SHIPS.length) {
          setGamePhase('playing');
          placeComputerShips();
          setMessage('Game started! Your turn.');
        }
      }
    } else if (gamePhase === 'playing') {
      if (computerBoard[row][col] === 'hit' || computerBoard[row][col] === 'miss') return;

      const newComputerBoard = [...computerBoard];
      const hitShip = computerShips.find(ship => 
        ship.cells.some(cell => cell.row === row && cell.col === col)
      );

      if (hitShip) {
        newComputerBoard[row][col] = 'hit';
        setMessage('Hit!');
      } else {
        newComputerBoard[row][col] = 'miss';
        setMessage('Miss!');
      }

      setComputerBoard(newComputerBoard);

      // Check if player won
      if (computerShips.every(ship => 
        ship.cells.every(cell => newComputerBoard[cell.row][cell.col] === 'hit')
      )) {
        setGamePhase('gameOver');
        setWinner('player');
        setMessage('You won!');
        return;
      }

      // Computer's turn
      setTimeout(() => {
        let computerRow, computerCol;
        do {
          computerRow = Math.floor(Math.random() * BOARD_SIZE);
          computerCol = Math.floor(Math.random() * BOARD_SIZE);
        } while (playerBoard[computerRow][computerCol] === 'hit' || playerBoard[computerRow][computerCol] === 'miss');

        const newPlayerBoard = [...playerBoard];
        const hitShip = playerShips.find(ship => 
          ship.cells.some(cell => cell.row === computerRow && cell.col === computerCol)
        );

        if (hitShip) {
          newPlayerBoard[computerRow][computerCol] = 'hit';
          setMessage('Computer hit your ship!');
        } else {
          newPlayerBoard[computerRow][computerCol] = 'miss';
          setMessage('Computer missed!');
        }

        setPlayerBoard(newPlayerBoard);

        // Check if computer won
        if (playerShips.every(ship => 
          ship.cells.every(cell => newPlayerBoard[cell.row][cell.col] === 'hit')
        )) {
          setGamePhase('gameOver');
          setWinner('computer');
          setMessage('Computer won!');
        }
      }, 1000);
    }
  }

  function toggleOrientation() {
    setShipOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  }

  function resetGame() {
    setPlayerBoard(createEmptyBoard());
    setComputerBoard(createEmptyBoard());
    setPlayerShips([]);
    setComputerShips([]);
    setGamePhase('setup');
    setCurrentShip(0);
    setShipOrientation('horizontal');
    setMessage('Place your ships!');
    setWinner(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center p-4 md:p-6">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      <div className="w-full max-w-5xl mx-auto">
        {/* Home Button */}
        <div className="pt-6 pb-2 flex justify-start">
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-purple-900 font-semibold text-base md:text-lg shadow"
          >
            ← Home
          </button>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-900 mb-2">Battleship</h1>
          {/* Message & Controls */}
          <div className="text-center mb-4 w-full">
            <p className="text-lg md:text-xl font-semibold text-purple-700">{message}</p>
            {gamePhase === 'setup' && (
              <button
                onClick={toggleOrientation}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 shadow"
              >
                Toggle Orientation: {shipOrientation}
              </button>
            )}
            {gamePhase === 'gameOver' && (
              <button
                onClick={resetGame}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 shadow"
              >
                Play Again
              </button>
            )}
          </div>
          {/* Boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-800">Your Board</h2>
              <div className="grid grid-cols-10 gap-1 bg-blue-100 p-2 rounded-xl shadow-inner">
                {playerBoard.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={
                        `w-8 h-8 border border-gray-300 cursor-pointer flex items-center justify-center
                        ${cell === null ? 'bg-blue-100' :
                          cell === 'hit' ? 'bg-red-500 text-white font-bold' :
                          cell === 'miss' ? 'bg-gray-300' :
                          'bg-blue-500 text-white font-bold'}
                        rounded`
                      }
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell === 'hit' ? '✕' : cell === 'miss' ? '•' : ''}
                    </div>
                  ))
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-800">Computer's Board</h2>
              <div className="grid grid-cols-10 gap-1 bg-blue-100 p-2 rounded-xl shadow-inner">
                {computerBoard.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={
                        `w-8 h-8 border border-gray-300 cursor-pointer flex items-center justify-center
                        ${cell === null ? 'bg-blue-100' :
                          cell === 'hit' ? 'bg-red-500 text-white font-bold' :
                          cell === 'miss' ? 'bg-gray-300' :
                          'bg-blue-100'}
                        rounded`
                      }
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell === 'hit' ? '✕' : cell === 'miss' ? '•' : ''}
                    </div>
                  ))
                ))}
              </div>
            </div>
          </div>
          {gamePhase === 'setup' && (
            <div className="mt-8 text-center">
              <p className="text-lg text-purple-700">
                Placing: {currentShip < SHIPS.length ? SHIPS[currentShip].name : 'Done'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Battleship;