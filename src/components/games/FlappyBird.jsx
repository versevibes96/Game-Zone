import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const FlappyBird = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedHighScore = localStorage.getItem('flappyHighScore');
    return savedHighScore ? parseInt(savedHighScore) : 0;
  });
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(false);
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const gameAreaRef = useRef(null);
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const gravity = 0.5;
  const jumpForce = -6;
  const pipeWidth = 60;
  const pipeGap = 190;
  const pipeInterval = 1500;

  // Sound effects
  const playJumpSound = useCallback(() => {
    const audio = new Audio('/sounds/jump.mp3');
    audio.play().catch(() => {});
  }, []);

  const playScoreSound = useCallback(() => {
    const audio = new Audio('/sounds/score.mp3');
    audio.play().catch(() => {});
  }, []);

  const playHitSound = useCallback(() => {
    const audio = new Audio('/sounds/hit.mp3');
    audio.play().catch(() => {});
  }, []);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
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

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setPipes([]);
      setBirdPosition(250);
      setBirdVelocity(0);
    }
    if (!gameOver && !isPaused) {
      setBirdVelocity(jumpForce);
      playJumpSound();
    }
  }, [gameStarted, gameOver, isPaused, playJumpSound]);

  const generatePipe = useCallback(() => {
    if (!gameAreaRef.current) return;
    const minHeight = 50;
    const maxHeight = gameAreaRef.current.clientHeight - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    return {
      x: gameAreaRef.current.clientWidth,
      topHeight: height,
      bottomHeight: gameAreaRef.current.clientHeight - height - pipeGap,
      passed: false
    };
  }, []);

  const checkCollision = useCallback((pipe) => {
    if (!gameAreaRef.current) return false;
    
    const birdWidth = 30;
    const birdHeight = 30;
    const birdRight = 50 + birdWidth;
    const birdLeft = 50;
    const birdTop = birdPosition;
    const birdBottom = birdPosition + birdHeight;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;

    // Check if bird is within pipe's horizontal range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      // Check collision with top pipe
      if (birdTop < pipe.topHeight) return true;
      // Check collision with bottom pipe
      if (birdBottom > (gameAreaRef.current.clientHeight - pipe.bottomHeight)) return true;
    }

    return false;
  }, [birdPosition]);

  const handleGameOver = useCallback(() => {
    if (!gameOver) {
      setGameOver(true);
      playHitSound();
      
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappyHighScore', score.toString());
        setShowNewHighScore(true);
        triggerConfetti();
        
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
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
          confetti({
            ...defaults,
            particleCount: particleCount / 2,
            origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 }
          });
        }, 250);

        setTimeout(() => {
          setShowNewHighScore(false);
        }, 3000);
      }
    }
  }, [score, highScore, playHitSound, gameOver]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setPipes([]);
    setBirdPosition(250);
    setBirdVelocity(0);
    setShowNewHighScore(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const gameLoop = useCallback((time) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;

    if (!isPaused && gameStarted && !gameOver) {
      // Update bird position
      setBirdPosition((prev) => {
        const newPosition = prev + birdVelocity;
        // Only game over if bird hits top or bottom of screen
        if (newPosition < 0 || newPosition > gameAreaRef.current.clientHeight - 30) {
          handleGameOver();
          return prev; // Keep previous position to prevent visual glitch
        }
        return newPosition;
      });

      // Update bird velocity
      setBirdVelocity((prev) => prev + gravity);

      // Update pipes
      setPipes((prevPipes) => {
        const newPipes = prevPipes.map((pipe) => {
          // Check for collision
          if (checkCollision(pipe)) {
            handleGameOver();
            return pipe;
          }

          // Check if pipe is passed
          if (!pipe.passed && pipe.x + pipeWidth < 50) {
            setScore((prev) => prev + 1);
            playScoreSound();
            return { ...pipe, passed: true };
          }

          return {
            ...pipe,
            x: pipe.x - 2
          };
        }).filter((pipe) => pipe.x > -pipeWidth);

        // Generate new pipe
        if (deltaTime > pipeInterval) {
          const newPipe = generatePipe();
          if (newPipe) {
            newPipes.push(newPipe);
          }
          previousTimeRef.current = time;
        }

        return newPipes;
      });
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, isPaused, birdVelocity, checkCollision, generatePipe, playScoreSound, handleGameOver]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        jump();
      } else if (e.code === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, togglePause]);

  // Add score animation effect
  useEffect(() => {
    if (score > displayScore) {
      setScoreAnimation(true);
      const timer = setTimeout(() => {
        setDisplayScore(score);
        setScoreAnimation(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [score]);

  // Check for milestones
  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setMilestoneReached(true);
      const timer = setTimeout(() => {
        setMilestoneReached(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 mb-4">← Home</Link>
        
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <div className={`text-2xl font-bold text-gray-600 transition-all duration-200 ${scoreAnimation ? 'scale-125' : ''}`}>
                Score: {displayScore}
              </div>
              {milestoneReached && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold animate-bounce">
                  +10 Points! 🎯
                </div>
              )}
            </div>
            <div className="text-xl text-gray-600 flex items-center gap-2">
              <span className="text-yellow-400">🏆</span>
              High Score: {highScore}
            </div>
          </div>

          <div 
            ref={gameAreaRef}
            className="relative w-full h-[500px] bg-gradient-to-b from-blue-300 to-blue-500 rounded-lg overflow-hidden cursor-pointer"
            onClick={jump}
          >
            {/* Bird */}
            <div 
              className="absolute w-[30px] h-[30px] bg-yellow-400 rounded-full"
              style={{ 
                top: `${birdPosition}px`,
                left: '50px',
                transform: `rotate(${birdVelocity * 2}deg)`,
                transition: 'transform 0.1s'
              }}
            >
              <div className="absolute w-3 h-3 bg-white rounded-full top-1 left-1"></div>
              <div className="absolute w-2 h-2 bg-black rounded-full top-2 left-2"></div>
              <div className="absolute w-4 h-2 bg-orange-500 rounded-full bottom-1 left-4"></div>
            </div>

            {/* Pipes */}
            {pipes.map((pipe, index) => (
              <div key={index}>
                {/* Top pipe */}
                <div
                  className="absolute bg-green-600"
                  style={{
                    left: `${pipe.x}px`,
                    top: 0,
                    width: `${pipeWidth}px`,
                    height: `${pipe.topHeight}px`
                  }}
                >
                  <div className="absolute bottom-0 w-full h-4 bg-green-700"></div>
                </div>
                {/* Bottom pipe */}
                <div
                  className="absolute bg-green-600"
                  style={{
                    left: `${pipe.x}px`,
                    bottom: 0,
                    width: `${pipeWidth}px`,
                    height: `${pipe.bottomHeight}px`
                  }}
                >
                  <div className="absolute top-0 w-full h-4 bg-green-700"></div>
                </div>
              </div>
            ))}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                  <div className="text-3xl text-white mb-4">
                    Final Score: <span className="text-yellow-400">{score}</span>
                  </div>
                  {showNewHighScore && (
                    <div className="text-2xl text-yellow-400 mb-4 animate-bounce">
                      New High Score! 🎉
                      <div className="text-lg mt-2">Previous: {highScore}</div>
                    </div>
                  )}
                  <button
                    className="px-6 py-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
                    onClick={resetGame}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Flappy Bird</h2>
                  <p className="text-xl text-white mb-4">Press Space or Click to Start</p>
                  <button
                    className="px-6 py-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all duration-300"
                    onClick={jump}
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}

            {/* Pause Button */}
            {gameStarted && !gameOver && (
              <button
                className="absolute top-2 right-2 px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300"
                onClick={togglePause}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;