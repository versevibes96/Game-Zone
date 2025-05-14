import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';

const SimonSays = () => {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'gray', 'purple', 'pink', 'pink'];
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('simonHighScore')) || 0;
  });
  const [gamePhase, setGamePhase] = useState('waiting');
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Initialize game
  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setGameOver(false);
    setLevel(1);
    setScore(0);
    setGamePhase('computer');
    setShowConfetti(false);
    addToSequence();
    setIsPlaying(true);
  }, []);

  // Add new color to sequence
  const addToSequence = useCallback(() => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence(prev => [...prev, newColor]);
    setGamePhase('computer');
  }, [colors]);

  // Handle player input
  const handleColorClick = (color) => {
    if (!isPlaying || gameOver || gamePhase !== 'player') return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (sequence[newPlayerSequence.length - 1] !== color) {
      endGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + sequence.length * 10;
      setScore(newScore);
      
      setGamePhase('memorize');
      setPlayerSequence([]);
      setLevel(prev => prev + 1);
      
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  };

  // End game
  const endGame = () => {
    // Check if current score beats high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('simonHighScore', score.toString());
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    setGameOver(true);
    setIsPlaying(false);
    setGamePhase('waiting');
  };

  // Play sequence
  useEffect(() => {
    if (sequence.length > 0 && gamePhase === 'computer' && isPlaying && !gameOver) {
      let i = 0;
      const interval = setInterval(() => {
        if (i >= sequence.length) {
          clearInterval(interval);
          setGamePhase('player');
          return;
        }
        const color = sequence[i];
        const button = document.getElementById(color);
        button.classList.add('brightness-200');
        setTimeout(() => {
          button.classList.remove('brightness-200');
        }, 300);
        i++;
      }, 800);
      return () => clearInterval(interval);
    }
  }, [sequence, gamePhase, isPlaying, gameOver]);

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

  const getStatusMessage = () => {
    switch(gamePhase) {
      case 'computer': return 'Watch the pattern...';
      case 'player': return 'Your turn...';
      case 'memorize': return ' ';
      case 'waiting': 
      default: return '';
    }
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
        
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">🎮 Simon Says</h1>
        
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="text-center md:text-left">
              <p className="text-gray-800 font-bold">Level: <span className="text-blue-600">{level}</span></p>
              <p className="text-gray-800 font-bold">Score: <span className="text-green-600">{score}</span></p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-800 font-bold">High Score: <span className="text-purple-600">{highScore}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {colors.map(color => (
              <button
                key={color}
                id={color}
                onClick={() => handleColorClick(color)}
                className={`h-16 md:h-20 rounded-lg shadow-lg transition-all duration-200 
                            bg-${color}-500 hover:bg-${color}-600 active:brightness-200
                            ${gameOver ? 'opacity-50' : ''}`}
                disabled={gameOver || !isPlaying || gamePhase !== 'player'}
                aria-label={`${color} button`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {!isPlaying && !gameOver && (
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                Start Game
              </button>
            )}

            {gameOver && (
              <>
                <div className="text-center text-gray-800 font-bold mb-4">
                  {score > highScore ? (
                    <span className="text-green-600">New High Score: {score}!</span>
                  ) : (
                    <span>Game Over! Score: {score}</span>
                  )}
                </div>
                <button
                  onClick={startGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Play Again
                </button>
              </>
            )}

            {isPlaying && !gameOver && (
              <div className="text-center text-gray-800 font-medium">
                {getStatusMessage()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimonSays;