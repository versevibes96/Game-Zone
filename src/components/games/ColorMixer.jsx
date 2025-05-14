import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const ColorMixer = () => {
  const [targetColor, setTargetColor] = useState(null);
  const [red, setRed] = useState(128);
  const [green, setGreen] = useState(128);
  const [blue, setBlue] = useState(128);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  const [hint, setHint] = useState('');
  const [showWinEffect, setShowWinEffect] = useState(false);
  const [similarity, setSimilarity] = useState(0);

  // Initialize game
  const startGame = () => {
    const newTarget = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    setTargetColor(newTarget);
    setRed(128);
    setGreen(128);
    setBlue(128);
    setGameOver(false);
    setShowConfetti(false);
    setShowWinEffect(false);
    setSimilarity(0);
    generateHint(newTarget);
  };

  // Generate hint about the target color
  const generateHint = (color) => {
    const hints = [];
    
    // Color properties
    const brightness = Math.round((color.r * 299 + color.g * 587 + color.b * 114) / 1000);
    hints.push(brightness > 128 ? 'Light color' : 'Dark color');
    
    // Dominant channel
    const maxVal = Math.max(color.r, color.g, color.b);
    if (color.r === maxVal) hints.push('Red is dominant');
    if (color.g === maxVal) hints.push('Green is dominant');
    if (color.b === maxVal) hints.push('Blue is dominant');
    
    // Color range hints
    hints.push(`Red is between ${Math.max(0, color.r-50)}-${Math.min(255, color.r+50)}`);
    hints.push(`Green is between ${Math.max(0, color.g-50)}-${Math.min(255, color.g+50)}`);
    hints.push(`Blue is between ${Math.max(0, color.b-50)}-${Math.min(255, color.b+50)}`);
    
    // Select random hint
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setHint(`Hint: ${randomHint}`);
  };

  // Calculate color similarity (0-100%)
  const calculateSimilarity = () => {
    if (!targetColor) return 0;
    
    const maxDiff = Math.sqrt(3 * Math.pow(255, 2));
    const diff = Math.sqrt(
      Math.pow(red - targetColor.r, 2) +
      Math.pow(green - targetColor.g, 2) +
      Math.pow(blue - targetColor.b, 2)
    );
    
    return Math.round((1 - diff/maxDiff) * 100);
  };

  // Update similarity in real-time
  useEffect(() => {
    if (!gameOver) {
      const newSimilarity = calculateSimilarity();
      setSimilarity(newSimilarity);
      
      // Check for perfect match
      if (newSimilarity === 100) {
        setGameOver(true);
        setShowConfetti(true);
        setShowWinEffect(true);
      }
    }
  }, [red, green, blue]);

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

  // Current mixed color
  const mixedColor = `rgb(${red}, ${green}, ${blue})`;
  const targetColorString = targetColor ? `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative overflow-hidden">
      {showConfetti && <Confetti 
        width={dimensions.width} 
        height={dimensions.height} 
        recycle={true}
        numberOfPieces={300}
        gravity={0.1}
      />}

      {/* Winning light effect */}
      {showWinEffect && (
        <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse pointer-events-none"></div>
      )}
      
      <div className="max-w-md mx-auto space-y-4 relative z-10">
        <a 
          className="inline-block px-4 py-1 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full
          hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" 
          href="/"
        >
          ← Home
        </a>
        
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">🎨 Color Mixer Game</h1>
        
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          {hint && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
              {hint}
            </div>
          )}

          {/* Similarity Meter */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-gray-800 font-medium">Match:</span>
              <span className="text-gray-800 font-bold">{similarity}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full" 
                style={{ width: `${similarity}%` }}
              ></div>
            </div>
          </div>

          {/* Target Color */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-bold mb-2">Target Color:</h3>
            <div 
              className="w-full h-16 rounded-lg border-2 border-gray-300"
              style={{ backgroundColor: targetColorString }}
            ></div>
          </div>

          {/* Your Mixed Color */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-bold mb-2">Your Color:</h3>
            <div 
              className={`w-full h-16 rounded-lg border-2 ${gameOver ? 'border-yellow-400 border-4' : 'border-gray-300'}`}
              style={{ backgroundColor: mixedColor }}
            ></div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-gray-800 font-medium">Red: {red}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={red}
                  onChange={(e) => setRed(parseInt(e.target.value))}
                  className="w-full accent-red-600"
                  disabled={gameOver}
                />
              </div>
              <div>
                <label className="text-gray-800 font-medium">Green: {green}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={green}
                  onChange={(e) => setGreen(parseInt(e.target.value))}
                  className="w-full accent-green-600"
                  disabled={gameOver}
                />
              </div>
              <div>
                <label className="text-gray-800 font-medium">Blue: {blue}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={blue}
                  onChange={(e) => setBlue(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                  disabled={gameOver}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => generateHint(targetColor)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              Get New Hint
            </button>
            
            <button
              onClick={startGame}
              className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold ${gameOver ? 'animate-bounce' : ''}`}
            >
              {gameOver ? 'You Won! Play Again' : 'New Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMixer;