import React, { useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";

const Disk = React.memo(({ size, onDragStart, isTop, onClick }) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
  return (
    <div
      draggable={isTop}
      onDragStart={onDragStart}
      onClick={isTop ? onClick : undefined}
      className={`h-4 md:h-6 mb-1 rounded ${colors[size % colors.length]} shadow-md transition-all duration-200 
                  ${isTop ? 'cursor-pointer hover:opacity-90 active:opacity-100' : 'cursor-default'}`}
      style={{
        width: `${20 + size * 10}px`,
      }}
      aria-label={`Disk size ${size}`}
      role="button"
      tabIndex={isTop ? 0 : -1}
    />
  );
});

const Tower = React.memo(({ disks, towerIndex, onDrop, onDragStart, onDiskClick }) => {
  return (
    <div
      className="relative bg-white w-20 md:w-32 h-48 md:h-72 border rounded border-gray-600 shadow flex flex-col-reverse items-center justify-start"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(towerIndex)}
      onClick={() => onDiskClick(towerIndex)}
      aria-label={`Tower ${towerIndex + 1}`}
    >
      {disks.map((disk, index) => (
        <Disk
          key={index}
          size={disk}
          onDragStart={() => onDragStart(disk, towerIndex)}
          onClick={() => onDiskClick(towerIndex)}
          isTop={index === disks.length - 1}
        />
      ))}
      <div className="absolute bottom-0 w-2 h-full bg-gray-700 rounded-t" />
    </div>
  );
});

const HanoiTower = () => {
  const [numDisks, setNumDisks] = useState(3);
  const [towers, setTowers] = useState([[], [], []]);
  const [moveCount, setMoveCount] = useState(0);
  const [dragDisk, setDragDisk] = useState(null);
  const [won, setWon] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  const [selectedDisk, setSelectedDisk] = useState(null);

  const initializeTowers = useCallback(() => {
    return [[...Array(numDisks).keys()].map(n => n + 1).reverse(), [], []];
  }, [numDisks]);

  useEffect(() => {
    setTowers(initializeTowers());
    setMoveCount(0);
    setWon(false);
  }, [numDisks, initializeTowers]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDiskClick = (towerIndex) => {
    if (!selectedDisk) {
      // If no disk is selected, try to select the top disk of the clicked tower
      const topDisk = towers[towerIndex][towers[towerIndex].length - 1];
      if (topDisk) {
        setSelectedDisk({ disk: topDisk, from: towerIndex });
      }
    } else {
      // If a disk is already selected, try to move it to the clicked tower
      const { disk, from } = selectedDisk;
      if (from === towerIndex) {
        setSelectedDisk(null);
        return;
      }

      const fromTower = [...towers[from]];
      const toTower = [...towers[towerIndex]];

      if (toTower.length === 0 || disk < toTower[toTower.length - 1]) {
        fromTower.pop();
        toTower.push(disk);
        const newTowers = [...towers];
        newTowers[from] = fromTower;
        newTowers[towerIndex] = toTower;

        setTowers(newTowers);
        setMoveCount(prev => prev + 1);
        if (newTowers[2].length === numDisks) {
          setWon(true);
        }
      }
      setSelectedDisk(null);
    }
  };

  const handleDragStart = (disk, towerIndex) => {
    const topDisk = towers[towerIndex][towers[towerIndex].length - 1];
    if (disk === topDisk) {
      setDragDisk({ disk, from: towerIndex });
      setSelectedDisk({ disk, from: towerIndex });
    }
  };

  const handleDrop = (to) => {
    if (!dragDisk) return;
    const { disk, from } = dragDisk;
    if (from === to) {
      setDragDisk(null);
      setSelectedDisk(null);
      return;
    }

    const fromTower = [...towers[from]];
    const toTower = [...towers[to]];

    if (toTower.length === 0 || disk < toTower[toTower.length - 1]) {
      fromTower.pop();
      toTower.push(disk);
      const newTowers = [...towers];
      newTowers[from] = fromTower;
      newTowers[to] = toTower;

      setTowers(newTowers);
      setMoveCount(prev => prev + 1);
      if (newTowers[2].length === numDisks) {
        setWon(true);
      }
    }
    setDragDisk(null);
    setSelectedDisk(null);
  };

  const restartGame = () => {
    setTowers(initializeTowers());
    setMoveCount(0);
    setWon(false);
    setSelectedDisk(null);
    setDragDisk(null);
  };

  const minMoves = Math.pow(2, numDisks) - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4 md:p-6 relative">
      {won && <Confetti 
        width={dimensions.width} 
        height={dimensions.height} 
        recycle={false}
        numberOfPieces={500}
      />}
      
      <div className="max-w-3xl mx-auto space-y-4">
        <a 
          className="inline-block px-4 py-1 md:px-6 md:py-2 bg-white bg-opacity-20 rounded-full
          hover:bg-opacity-30 transition-all duration-300 text-sm md:text-base" 
          href="/"
        >
          ← Home
        </a>
        
        <h1 className="text-2xl md:text-3xl text-center font-bold mb-4">🗼 Tower of Hanoi</h1>
        
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-4">
            <label className="font-medium text-gray-800 text-sm md:text-base">
              Disks: 
              <select
                value={numDisks}
                onChange={(e) => setNumDisks(Number(e.target.value))}
                className="ml-2 px-2 py-1 text-gray-600 rounded border border-gray-500 text-sm md:text-base"
                aria-label="Select number of disks"
              >
                {[3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            <button
              onClick={restartGame}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 md:px-3 md:py-1 rounded transition-colors text-sm md:text-base"
              aria-label="Restart game"
            >
              Restart
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-1 md:gap-0">
            <p className="text-gray-600 font-medium text-sm md:text-base">Moves: {moveCount}</p>
            <p className="text-gray-600 font-medium text-sm md:text-base">Minimum moves: {minMoves}</p>
          </div>

          <div 
            className="flex gap-2 md:gap-6 w-full justify-center"
            aria-label="Towers of Hanoi game board"
          >
            {towers.map((tower, i) => (
              <Tower
                key={i}
                disks={tower}
                towerIndex={i}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onDiskClick={handleDiskClick}
              />
            ))}
          </div>

          {won && (
            <div className="mt-4 md:mt-6 text-center text-green-600 font-bold text-lg md:text-xl">
              🎉 Congratulations! You solved it in {moveCount} moves.
              {moveCount === minMoves && " Perfect score!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HanoiTower;