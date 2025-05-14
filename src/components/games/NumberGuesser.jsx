import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const NumberGuesser = () => {
  const [targetNumber, setTargetNumber] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('numberGuesserHighScore')) || Infinity;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [hint, setHint] = useState('');
  const [prevGuess, setPrevGuess] = useState(null);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Initialize game
  const startGame = () => {
    const newTarget = Math.floor(Math.random() * 1000) + 1;
    setTargetNumber(newTarget);
    setGuess('');
    setMessage('Guess a number between 1 and 1000');
    setAttempts(0);
    setGameOver(false);
    setShowConfetti(false);
    setHint('');
    setPrevGuess(null);
    generateComplexHint(newTarget);
  };

  // Generate complex mathematical hint
  const generateComplexHint = (number) => {
    const hints = [];
    
    // Number properties
    hints.push(`The number is ${number % 2 === 0 ? 'even' : 'odd'}`);
    
    // Multiples
    const multiples = [];
    if (number % 5 === 0) multiples.push(5);
    if (number % 10 === 0) multiples.push(10);
    if (number % 25 === 0) multiples.push(25);
    if (number % 50 === 0) multiples.push(50);
    if (number % 100 === 0) multiples.push(100);
    
    if (multiples.length > 0) {
      hints.push(`Divisible by ${multiples.join(', ')}`);
    }
    
    // Squares and cubes
    const sqrt = Math.sqrt(number);
    const cbrt = Math.cbrt(number);
    if (Number.isInteger(sqrt)) hints.push(`Perfect square (${sqrt} × ${sqrt})`);
    if (Number.isInteger(cbrt)) hints.push(`Perfect cube (${cbrt}³)`);
    
    // Prime and factors
    if (isPrime(number)) {
      hints.push('Prime number');
    } else if (number > 1) {
      const factors = getFactors(number).slice(0, 3);
      if (factors.length > 1) {
        hints.push(`Has factors like ${factors.join(', ')}`);
      }
    }
    
    // Digit properties
    const digits = String(number).split('');
    const sumDigits = digits.reduce((sum, d) => sum + parseInt(d), 0);
    hints.push(`Digit sum is ${sumDigits}`);
    
    // Number range
    hints.push(`Between ${Math.max(1, number-100)} and ${Math.min(1000, number+100)}`);
    
    // Select 2 random hints
    const selectedHints = [];
    while (selectedHints.length < 2 && hints.length > 0) {
      const randomIndex = Math.floor(Math.random() * hints.length);
      if (!selectedHints.includes(hints[randomIndex])) {
        selectedHints.push(hints[randomIndex]);
      }
    }
    
    setHint(`Hints: ${selectedHints.join(' | ')}`);
  };

  // Check if number is prime
  const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  };

  // Get factors of a number
  const getFactors = (num) => {
    const factors = [];
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push(i);
        if (i !== num / i) factors.push(num / i);
      }
    }
    return factors.sort((a, b) => a - b);
  };

  // Handle guess submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const guessedNumber = parseInt(guess);

    if (isNaN(guessedNumber) || guessedNumber < 1 || guessedNumber > 1000) {
      setMessage('Please enter a valid number between 1 and 1000');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setPrevGuess(guessedNumber);

    if (guessedNumber === targetNumber) {
      // Game won
      setMessage(`🎉 Correct! You guessed it in ${newAttempts} attempts!`);
      setGameOver(true);
      
      // Check if new high score
      if (newAttempts < highScore) {
        setHighScore(newAttempts);
        localStorage.setItem('numberGuesserHighScore', newAttempts.toString());
      }
      // Show continuous confetti on win (regardless of high score)
      setShowConfetti(true);
    } else {
      const difference = Math.abs(targetNumber - guessedNumber);
      const percentage = Math.round((difference / 1000) * 100);
      
      let feedback = '';
      if (difference <= 10) {
        feedback = guessedNumber < targetNumber ? 'Extremely close but low!' : 'Extremely close but high!';
      } else if (difference <= 50) {
        feedback = guessedNumber < targetNumber ? 'Very close but low!' : 'Very close but high!';
      } else if (difference <= 100) {
        feedback = guessedNumber < targetNumber ? 'Close but low!' : 'Close but high!';
      } else if (difference <= 250) {
        feedback = guessedNumber < targetNumber ? 'Low!' : 'High!';
      } else {
        feedback = guessedNumber < targetNumber ? 'Way too low!' : 'Way too high!';
      }
      
      setMessage(`${feedback} (${percentage}% away)`);
      generateComplexHint(targetNumber);
    }

    setGuess('');
  };

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

  // Initialize game on first render
  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {showConfetti && <Confetti 
        width={dimensions.width} 
        height={dimensions.height} 
        recycle={true} // Continuous confetti
        numberOfPieces={300}
        gravity={0.2}
      />}
      
      <div className="max-w-md mx-auto space-y-4">
        <a 
          className="inline-block px-4 py-1 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full
          hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" 
          href="/"
        >
          ← Home
        </a>
        
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">🔢 Number Guesser</h1>
        
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-800 font-bold">Attempts: <span className="text-blue-600">{attempts}</span></p>
            <p className="text-gray-800 font-bold">Best: <span className="text-purple-600">
              {highScore === Infinity ? '--' : highScore}
            </span></p>
          </div>

          {hint && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
              {hint}
            </div>
          )}

          {prevGuess !== null && !gameOver && (
            <div className="mb-4 text-gray-800 text-sm">
              Your last guess was: {prevGuess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col space-y-4">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your guess (1-1000)"
                disabled={gameOver}
                min="1"
                max="1000"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                disabled={gameOver}
              >
                {gameOver ? 'Game Won!' : 'Submit Guess'}
              </button>
            </div>
          </form>

          <div className="text-center text-gray-800 font-medium mb-6 min-h-12">
            {message}
          </div>

          <div className="flex justify-center">
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberGuesser;