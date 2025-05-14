// ChessGameAI.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState('human');
  const [position, setPosition] = useState('start');
  const [isWhite, setIsWhite] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState('Playing');
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionMove, setPromotionMove] = useState(null);
  const [timer, setTimer] = useState({ white: 600, black: 600 }); // 10 minutes per player
  const [activeTimer, setActiveTimer] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [customSquareStyles, setCustomSquareStyles] = useState({});
  const [hintMove, setHintMove] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState(null);

  // Sound effects
  const playMoveSound = useCallback(() => {
    const audio = new Audio('/sounds/move.mp3');
    audio.play().catch(() => { });
  }, []);

  const playCaptureSound = useCallback(() => {
    const audio = new Audio('/sounds/capture.mp3');
    audio.play().catch(() => { });
  }, []);

  const playCheckSound = useCallback(() => {
    const audio = new Audio('/sounds/check.mp3');
    audio.play().catch(() => { });
  }, []);

  const restartGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameStatus('Playing');
    setTimer({ white: 600, black: 600 });
    setActiveTimer('white');
  };

  const getSquareStyles = useCallback(() => {
    const styles = {};

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(0, 0, 255, 0.4)',
      };
    }

    // Highlight legal moves
    legalMoves.forEach((square) => {
      styles[square] = {
        backgroundColor: 'rgba(0, 255, 0, 0.4)',
      };
    });

    // Highlight hint move
    if (hintMove) {
      styles[hintMove.from] = {
        backgroundColor: 'rgba(255, 165, 0, 0.6)', // Orange color for hint
      };
      styles[hintMove.to] = {
        backgroundColor: 'rgba(255, 165, 0, 0.6)', // Orange color for hint
      };
    }

    return styles;
  }, [lastMove, selectedSquare, legalMoves, hintMove]);

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const showWinningAnimation = (winner) => {
    setWinner(winner);
    setShowWinner(true);
    triggerConfetti();

    // Hide the winner text after 5 seconds
    setTimeout(() => {
      setShowWinner(false);
    }, 5000);
  };

  const handlePromotion = (piece) => {
    if (promotionMove) {
      const move = {
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: piece
      };
      makeMove(move);
      setShowPromotionDialog(false);
      setPromotionMove(null);
    }
  };

  const makeMove = (move) => {
    try {
      // Check if it's a pawn promotion
      const piece = game.get(move.from);
      if (piece && piece.type === 'p' &&
        ((piece.color === 'w' && move.to[1] === '8') ||
          (piece.color === 'b' && move.to[1] === '1'))) {
        if (!move.promotion) {
          setShowPromotionDialog(true);
          setPromotionMove(move);
          return false;
        }
      }

      // In multiplayer mode, try to make the move without checking legality
      if (difficulty === 'human') {
        try {
          const result = game.move(move);
          if (result) {
            updateGameState(result);
            return true;
          }
        } catch (e) {
          // If move is invalid, just return false
          return false;
        }
      } else {
        // In AI mode, use normal move validation
        const result = game.move(move);
        if (result) {
          updateGameState(result);
          return true;
        }
      }
    } catch { }
    return false;
  };

  const updateGameState = (result) => {
    setPosition(game.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove({ from: result.from, to: result.to });
    setHintMove(null);

    // Update captured pieces
    if (result.captured) {
      const color = result.color === 'w' ? 'white' : 'black';
      setCapturedPieces(prev => ({
        ...prev,
        [color]: [...prev[color], result.captured]
      }));
      playCaptureSound();
    } else {
      playMoveSound();
    }

    // Check for check
    if (game.isCheck()) {
      playCheckSound();
    }

    // Update timer
    setActiveTimer(game.turn() === 'w' ? 'white' : 'black');

    // Check for game over conditions
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        showWinningAnimation(winner);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'Playing') return;

    const timerInterval = setInterval(() => {
      setTimer(prev => {
        const newTimer = { ...prev };
        newTimer[activeTimer] = Math.max(0, newTimer[activeTimer] - 1);

        if (newTimer[activeTimer] === 0) {
          setGameStatus(`${activeTimer === 'white' ? 'Black' : 'White'} wins by timeout!`);
          clearInterval(timerInterval);
        }

        return newTimer;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeTimer, gameStatus]);

  const getHint = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Clear previous hint
    setHintMove(null);

    // Get a new hint move
    const bestMove = moves[Math.floor(Math.random() * moves.length)];
    setHintMove({ from: bestMove.from, to: bestMove.to });

    // Clear hint after 3 seconds
    setTimeout(() => {
      setHintMove(null);
    }, 3000);
  };

  const getAIMove = () => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;
    let move;
    switch (difficulty) {
      case 'easy':
        move = moves[Math.floor(Math.random() * moves.length)];
        break;
      case 'medium':
        move = moves.find((m) => m.flags.includes('c')) || moves[0];
        break;
      case 'hard':
        move = moves.find((m) => m.san.includes('#')) || moves.find((m) => m.san.includes('+')) || moves[0];
        break;
      default:
        return;
    }
    game.move(move);
    setPosition(game.fen());

    // Check game over after AI move
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        alert(`Cheakmat! ${winner} Winner`);
      } else if (game.isDraw()) {
        alert('Drow');
      }
    }
  };

  useEffect(() => {
    if (
      difficulty !== 'human' &&
      game.turn() === (isWhite ? 'b' : 'w') &&
      !game.isGameOver()
    ) {
      setTimeout(getAIMove, 500);
    }
  }, [position, difficulty]);

  const getLegalMoves = useCallback((square) => {
    if (!square) return [];
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to);
  }, [game]);

  const onSquareClick = (square) => {
    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // In multiplayer mode, allow any move without restrictions
      if (difficulty === 'human') {
        makeMove({ from: selectedSquare, to: square });
        return;
      }

      // If clicking a legal move square, make the move
      if (legalMoves.includes(square)) {
        makeMove({ from: selectedSquare, to: square });
        return;
      }

      // If clicking a different piece of the same color, select that piece instead
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        const moves = getLegalMoves(square);
        setSelectedSquare(square);
        setLegalMoves(moves);
        return;
      }
    }

    // If no square is selected, select the clicked square if it has a piece
    const piece = game.get(square);
    if (piece) {
      const moves = getLegalMoves(square);
      setSelectedSquare(square);
      setLegalMoves(moves);
    }
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    // In multiplayer mode, allow any move without restrictions
    if (difficulty === 'human') {
      const move = { from: sourceSquare, to: targetSquare };
      return makeMove(move);
    }
    // In AI mode, check for legal moves
    const moves = getLegalMoves(sourceSquare);
    if (moves.includes(targetSquare)) {
      return makeMove({ from: sourceSquare, to: targetSquare });
    }
    return false;
  };

  // Update square styles whenever relevant state changes
  useEffect(() => {
    setCustomSquareStyles(getSquareStyles());
  }, [getSquareStyles]);

  const isDraggable = (piece, sourceSquare) => {
    // In multiplayer mode, allow all pieces to be dragged
    if (difficulty === 'human') {
      return true;
    }
    // In AI mode, only allow human player's pieces
    return piece.color === (isWhite ? 'w' : 'b');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderCapturedPieces = (color) => {
    return (
      <div className="flex flex-wrap gap-1">
        {capturedPieces[color].map((piece, index) => (
          <div key={index} className="w-4 h-4">
            {piece.toUpperCase()}
          </div>
        ))}
      </div>
    );
  };

  const getPromotionPieceSymbol = (piece) => {
    const symbols = {
      'q': '♛', // Queen
      'r': '♜', // Rook
      'b': '♝', // Bishop
      'n': '♞'  // Knight
    };
    return symbols[piece];
  };

  const getPromotionPieceName = (piece) => {
    const names = {
      'q': 'Queen',
      'r': 'Rook',
      'b': 'Bishop',
      'n': 'Knight'
    };
    return names[piece];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 mb-4">← Home</Link>
        <h1 className="text-4xl text-center font-bold mb-4">Chess</h1>
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">


          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {['human', 'easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  className={`px-4 py-2 rounded transition-all duration-300 ${difficulty === level
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  onClick={() => setDifficulty(level)}
                >
                  {level === 'human' ? 'Multiplayer' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            {/* Timer display */}
            <div className="flex gap-4 mb-2">
              <div className={`px-4 py-2 rounded ${activeTimer === 'white' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                White: {formatTime(timer.white)}
              </div>
              <div className={`px-4 py-2 rounded ${activeTimer === 'black' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                Black: {formatTime(timer.black)}
              </div>
            </div>

            {difficulty !== 'human' && (
              <button
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-all duration-300"
                onClick={getHint}
              >
                Hint
              </button>
            )}

            <div className="rounded-lg overflow-hidden shadow-xl">
              <Chessboard
                position={position}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                customSquareStyles={customSquareStyles}
                arePiecesDraggable={({ piece, sourceSquare }) => isDraggable(piece, sourceSquare)}
                boardWidth={Math.min(window.innerWidth - 40, 500)}
              />
            </div>

            <button
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-all duration-300"
              onClick={restartGame}
            >
              Restart Game
            </button>
          </div>
        </div>

        {/* Winner Animation */}
        {showWinner && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center transform transition-all duration-500 animate-bounce">
              <h2 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {winner} Wins!
              </h2>
              <div className="text-2xl text-yellow-300 animate-pulse">
                Checkmate!
              </div>
            </div>
          </div>
        )}

        {/* Promotion Dialog */}
        {showPromotionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl transform transition-all">
              <h3 className="text-black text-2xl mb-6 text-center font-bold">Choose your promotion piece</h3>
              <div className="grid grid-cols-2 gap-4">
                {['q', 'r', 'b', 'n'].map((piece) => (
                  <button
                    key={piece}
                    className="group relative bg-gray-100 rounded-lg p-4 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                    onClick={() => handlePromotion(piece)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl font-chess">{getPromotionPieceSymbol(piece)}</span>
                      <span className="text-sm font-medium group-hover:text-white text-gray-700">
                        {getPromotionPieceName(piece)}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white transition-all duration-300"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;