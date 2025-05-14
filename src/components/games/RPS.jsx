import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const choices = [
  { emoji: '✊', name: 'Rock', color: 'bg-red-500' },
  { emoji: '✋', name: 'Paper', color: 'bg-blue-500' },
  { emoji: '✌️', name: 'Scissors', color: 'bg-green-500' }
];

const RPS = () => {
  const navigate = useNavigate();
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const playGame = (choice) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setPlayerChoice(choice);

    // Computer "thinking" animation
    let counter = 0;
    const interval = setInterval(() => {
      setComputerChoice(choices[counter % choices.length]);
      counter++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const computer = choices[Math.floor(Math.random() * choices.length)];
      setComputerChoice(computer);
      calculateResult(choice, computer);
      setIsAnimating(false);
    }, 1000);
  };

  const calculateResult = (player, computer) => {
    if (player.emoji === computer.emoji) {
      setResult('Draw!');
    } else if (
      (player.emoji === '✊' && computer.emoji === '✌️') ||
      (player.emoji === '✋' && computer.emoji === '✊') ||
      (player.emoji === '✌️' && computer.emoji === '✋')
    ) {
      setResult('You Win! 🎉');
      setScore(prev => prev + 1);
    } else {
      setResult('You Lose! 😢');
    }
    setGameCount(prev => prev + 1);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <a className="inline-block px-4 md:px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" href="/" data-discover="true">← Home</a>

        {/* Game Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-center my-4 md:my-8">Rock Paper Scissors</h1>

        {/* Game Area */}
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-8">
          {/* Choices */}
          <div className="flex justify-center gap-3 md:gap-6 mb-6 md:mb-12">
            {choices.map((choice) => (
              <motion.button
                key={choice.emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playGame(choice)}
                disabled={isAnimating}
                className={`${choice.color} text-4xl md:text-6xl p-3 md:p-6 rounded-full shadow-lg transition-all 
                  ${isAnimating ? 'opacity-50' : 'hover:shadow-xl'}`}
              >
                {choice.emoji}
              </motion.button>
            ))}
          </div>

          {/* Battle Area */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-12">
            {/* Player */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-blue-600">You</h3>
              <div className="h-32 md:h-40 flex items-center justify-center">
                <AnimatePresence>
                  {playerChoice && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`${playerChoice.color} text-6xl md:text-8xl p-4 md:p-8 rounded-full shadow-md`}
                    >
                      {playerChoice.emoji}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Computer */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-red-600">Computer</h3>
              <div className="h-32 md:h-40 flex items-center justify-center">
                <AnimatePresence>
                  {computerChoice ? (
                    <motion.div
                      key={computerChoice.emoji}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`${computerChoice.color} text-6xl md:text-8xl p-4 md:p-8 rounded-full shadow-md`}
                    >
                      {computerChoice.emoji}
                    </motion.div>
                  ) : (
                    <div className="text-2xl md:text-4xl text-gray-400">?</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4 md:mb-8"
            >
              <div className={`text-2xl md:text-4xl font-bold ${result.includes('Win') ? 'text-green-600' :
                  result.includes('Lose') ? 'text-red-600' : 'text-yellow-600'
                }`}>
                {result}
              </div>
              <p className="text-base md:text-xl mt-2 text-gray-600">
                {playerChoice && computerChoice && `${playerChoice.name} vs ${computerChoice.name}`}
              </p>
            </motion.div>
          )}

          {/* Score and Game Count */}
          <div className="flex justify-between items-center mt-4 md:mt-6 px-4 md:px-8">
            <div className="text-gray-600 text-sm md:text-base">
              Score: <span className="font-bold">{score}</span>
            </div>
            <div className="text-gray-600 text-sm md:text-base">
              Games: <span className="font-bold">{gameCount}</span>
            </div>
          </div>

          {/* New Game Button */}
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-4 md:mt-6"
            >
              <button
                onClick={resetGame}
                className="px-4 md:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                  transition-colors text-sm md:text-base"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RPS;