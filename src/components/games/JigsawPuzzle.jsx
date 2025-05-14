import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import ReactConfetti from 'react-confetti';

const JigsawPuzzle = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [difficulty, setDifficulty] = useState('medium'); // easy: 3x3, medium: 4x4, hard: 5x5
  const [pieces, setPieces] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    const saved = localStorage.getItem('jigsawBestTime');
    return saved ? JSON.parse(saved) : { easy: Infinity, medium: Infinity, hard: Infinity };
  });
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [showImageSelect, setShowImageSelect] = useState(true);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Sample images - you can add more images here
  const sampleImages = [
    'https://picsum.photos/500/500?random=1',
    'https://picsum.photos/500/500?random=2',
    'https://picsum.photos/500/500?random=3',
    'https://picsum.photos/500/500?random=4',
  ];

  const getGridSize = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 3;
      case 'medium': return 4;
      case 'hard': return 5;
      default: return 4;
    }
  }, [difficulty]);

  const getPieceSize = useCallback(() => {
    const gridSize = getGridSize();
    // Calculate piece size based on screen width
    const maxWidth = Math.min(window.innerWidth - 32, 500); // 32px for padding
    return Math.floor(maxWidth / gridSize);
  }, [getGridSize]);

  const createPieces = useCallback((imageUrl) => {
    const gridSize = getGridSize();
    const pieceSize = getPieceSize();
    const newPieces = [];

    // Create pieces with their correct positions
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newPieces.push({
          id: `${row}-${col}`,
          correctPosition: { row, col },
          currentPosition: { row, col },
          imageUrl,
          style: {
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
            backgroundSize: `${gridSize * pieceSize}px ${gridSize * pieceSize}px`,
          }
        });
      }
    }

    // Shuffle pieces by randomly swapping positions
    const shuffledPieces = [...newPieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledPieces[i].currentPosition;
      shuffledPieces[i].currentPosition = shuffledPieces[j].currentPosition;
      shuffledPieces[j].currentPosition = temp;
    }

    return shuffledPieces;
  }, [getGridSize, getPieceSize]);

  const startGame = (imageUrl) => {
    setSelectedImage(imageUrl);
    setPieces(createPieces(imageUrl));
    setGameStarted(true);
    setGameCompleted(false);
    setTimer(0);
    setMoves(0);
    setShowImageSelect(false);
    setShowConfetti(false);
  };

  const restartGame = () => {
    if (selectedImage) {
      setPieces(createPieces(selectedImage));
      setGameCompleted(false);
      setTimer(0);
      setMoves(0);
      setShowConfetti(false);
    }
  };

  const checkWin = useCallback(() => {
    if (!pieces.length) return false;

    // Check if all pieces are in their correct positions
    const isComplete = pieces.every(piece =>
      piece.currentPosition.row === piece.correctPosition.row &&
      piece.currentPosition.col === piece.correctPosition.col
    );

    // Additional validation to ensure all positions are filled
    const gridSize = getGridSize();
    const filledPositions = new Set();

    pieces.forEach(piece => {
      filledPositions.add(`${piece.currentPosition.row}-${piece.currentPosition.col}`);
    });

    return isComplete && filledPositions.size === gridSize * gridSize;
  }, [pieces, getGridSize]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      // Recreate pieces with new size if game is in progress
      if (selectedImage && !showImageSelect) {
        setPieces(createPieces(selectedImage));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedImage, showImageSelect, createPieces]);

  // Add useEffect to monitor game completion
  useEffect(() => {
    if (gameStarted && !gameCompleted && pieces.length > 0) {
      if (checkWin()) {
        setGameCompleted(true);
        const newBestTime = { ...bestTime };
        if (timer < bestTime[difficulty]) {
          newBestTime[difficulty] = timer;
          localStorage.setItem('jigsawBestTime', JSON.stringify(newBestTime));
          triggerConfetti();
        }
        setBestTime(newBestTime);
      }
    }
  }, [pieces, gameStarted, gameCompleted, checkWin, timer, bestTime, difficulty]);

  const handleDragStart = (e, piece) => {
    e.dataTransfer.setData('text/plain', piece.id);
    setDraggedPiece(piece);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetPiece) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || !draggedPiece) return;

    const newPieces = pieces.map(piece => {
      if (piece.id === draggedId) {
        return { ...piece, currentPosition: targetPiece.currentPosition };
      }
      if (piece.id === targetPiece.id) {
        return { ...piece, currentPosition: draggedPiece.currentPosition };
      }
      return piece;
    });

    setPieces(newPieces);
    setDraggedPiece(null);
    setMoves(prev => prev + 1);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    const duration = 5 * 1000; // Increased duration to 5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#FFD700', '#FF69B4', '#00FF00', '#FF4500', '#4169E1', '#9400D3']
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Multiple bursts of confetti
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Right side burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });

      // Center burst
      confetti({
        ...defaults,
        particleCount: particleCount * 0.5,
        origin: { x: 0.5, y: 0.5 },
        angle: randomInRange(55, 125),
        spread: 70
      });

      // Top burst
      confetti({
        ...defaults,
        particleCount: particleCount * 0.3,
        origin: { x: 0.5, y: 0.1 },
        angle: randomInRange(80, 100),
        spread: 30
      });
    }, 250);

    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
    }, duration);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {gameCompleted && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          initialVelocityY={10}
          colors={['#FFD700', '#FF69B4', '#00FF00', '#FF4500', '#4169E1', '#9400D3']}
        />
      )}
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block px-4 py-2 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 mb-4 text-sm md:text-base">← Home</Link>
        <h1 className="text-2xl md:text-4xl text-center font-bold text-white mb-4">Jigsaw Puzzle</h1>
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">

          {showImageSelect ? (
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl text-gray-800 font-bold mb-4">Select Difficulty:</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all duration-300 ${
                        difficulty === level
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      onClick={() => setDifficulty(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-xl md:text-2xl text-gray-800 font-bold mb-4">Select an Image:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
                {sampleImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => startGame(image)}
                  >
                    <img
                      src={image}
                      alt={`Puzzle ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg md:text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-4 py-2 md:px-6 md:py-3 rounded-full">
                        Select
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 bg-gray-100 p-4 rounded-lg">
                <div className="text-lg md:text-xl text-gray-800 font-bold">Time: {formatTime(timer)}</div>
                <div className="text-lg md:text-xl text-gray-800 font-bold">Moves: {moves}</div>
                <div className="text-lg md:text-xl text-gray-800 font-bold">
                  Best Time: {bestTime[difficulty] === Infinity ? '--:--' : formatTime(bestTime[difficulty])}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
                <button
                  className="px-4 py-2 md:px-6 md:py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all duration-300 shadow-lg"
                  onClick={restartGame}
                >
                  Restart
                </button>
                <button
                  className="px-4 py-2 md:px-6 md:py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 shadow-lg"
                  onClick={() => setShowImageSelect(true)}
                >
                  New Game
                </button>
              </div>

              <div
                className="grid gap-1 md:gap-2 mx-auto bg-gray-100 p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto"
                style={{
                  gridTemplateColumns: `repeat(${getGridSize()}, ${getPieceSize()}px)`,
                  width: `${getGridSize() * getPieceSize()}px`,
                  maxWidth: '100%'
                }}
              >
                {Array.from({ length: getGridSize() * getGridSize() }).map((_, index) => {
                  const row = Math.floor(index / getGridSize());
                  const col = index % getGridSize();
                  const piece = pieces.find(p =>
                    p.currentPosition.row === row &&
                    p.currentPosition.col === col
                  );

                  return (
                    <div
                      key={`${row}-${col}`}
                      className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md"
                      style={{ width: `${getPieceSize()}px`, height: `${getPieceSize()}px` }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => piece && handleDrop(e, piece)}
                    >
                      {piece && (
                        <div
                          className="w-full h-full cursor-move hover:opacity-90 transition-opacity duration-200"
                          style={piece.style}
                          draggable
                          onDragStart={(e) => handleDragStart(e, piece)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {gameCompleted && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-6 md:p-8 text-center shadow-2xl max-w-md w-full">
                    <h2 className="text-2xl md:text-4xl font-bold text-purple-600 mb-4 md:mb-6">Puzzle Completed! 🎉</h2>
                    <p className="text-xl md:text-2xl mb-2 md:mb-3 text-gray-800">Time: {formatTime(timer)}</p>
                    <p className="text-xl md:text-2xl mb-4 md:mb-6 text-gray-800">Moves: {moves}</p>
                    {timer < bestTime[difficulty] && (
                      <p className="text-xl md:text-2xl text-green-600 font-bold mb-4 md:mb-6">New Best Time! 🎉</p>
                    )}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <button
                        className="px-6 py-2 md:px-8 md:py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all duration-300 shadow-lg"
                        onClick={restartGame}
                      >
                        Play Again
                      </button>
                      <button
                        className="px-6 py-2 md:px-8 md:py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 shadow-lg"
                        onClick={() => setShowImageSelect(true)}
                      >
                        New Game
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JigsawPuzzle;