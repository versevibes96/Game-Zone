import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GravitySimulator = () => {
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [gravity, setGravity] = useState(0.1);
  const [collisionEnabled, setCollisionEnabled] = useState(true);
  const [trailEnabled, setTrailEnabled] = useState(false);
  const canvasRef = useRef(null);
  const lastFrameTime = useRef(0);

  // Physics constants
  const G = gravity;
  const FRICTION = 0.99;
  const MIN_DISTANCE = 20;
  const MAX_SPEED = 15;

  // Responsive canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 32, 700);
      const h = Math.max(300, Math.min(window.innerHeight - 220, 500));
      setCanvasSize({ width: w, height: h });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId;
    const animate = (timestamp) => {
      if (!lastFrameTime.current) lastFrameTime.current = timestamp;
      const deltaTime = (timestamp - lastFrameTime.current) / 16.67; // Normalize to ~60fps
      lastFrameTime.current = timestamp;

      setObjects(prev => {
        return prev.map(obj => {
          let ax = 0, ay = 0;
          // Calculate gravitational forces
          prev.forEach(other => {
            if (obj !== other) {
              const dx = other.x - obj.x;
              const dy = other.y - obj.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d > MIN_DISTANCE) {
                const force = (G * other.mass) / (d * d);
                ax += (dx / d) * force;
                ay += (dy / d) * force;
              } else if (collisionEnabled) {
                // Handle collision
                const angle = Math.atan2(dy, dx);
                const speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
                obj.vx = Math.cos(angle) * speed * 0.8;
                obj.vy = Math.sin(angle) * speed * 0.8;
              }
            }
          });
          // Update velocity with acceleration
          let newVx = (obj.vx + ax) * FRICTION;
          let newVy = (obj.vy + ay) * FRICTION;
          // Limit maximum speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > MAX_SPEED) {
            newVx = (newVx / speed) * MAX_SPEED;
            newVy = (newVy / speed) * MAX_SPEED;
          }
          // Update position
          const newX = obj.x + newVx * deltaTime;
          const newY = obj.y + newVy * deltaTime;
          // Bounce off walls
          const radius = obj.mass / 2;
          let finalX = newX;
          let finalY = newY;
          let finalVx = newVx;
          let finalVy = newVy;
          if (newX - radius < 0 || newX + radius > canvasSize.width) {
            finalVx = -newVx * 0.8;
            finalX = newX - radius < 0 ? radius : canvasSize.width - radius;
          }
          if (newY - radius < 0 || newY + radius > canvasSize.height) {
            finalVy = -newVy * 0.8;
            finalY = newY - radius < 0 ? radius : canvasSize.height - radius;
          }
          return {
            ...obj,
            x: finalX,
            y: finalY,
            vx: finalVx,
            vy: finalVy,
            trail: trailEnabled ? [...(obj.trail || []), { x: finalX, y: finalY }].slice(-20) : []
          };
        });
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gravity, collisionEnabled, trailEnabled, canvasSize]);

  const handleCanvasClick = (e) => {
    if (isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setObjects(prev => [...prev, {
      x,
      y,
      vx: 0,
      vy: 0,
      mass: Math.random() * 20 + 10,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      id: Date.now(),
      trail: []
    }]);
  };

  const handleObjectDrag = (e, obj) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setObjects(prev => prev.map(o =>
      o.id === obj.id
        ? { ...o, x, y, vx: 0, vy: 0 }
        : o
    ));
  };

  const clearObjects = () => {
    setObjects([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl mx-auto">
        {/* Home Button and Title */}
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-purple-900 font-semibold text-base md:text-lg shadow">
            ← Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white flex-1">Gravity Simulator</h1>
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 text-purple-900 font-semibold text-base md:text-lg shadow"
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8 flex flex-col items-center">
          {/* Controls Panel */}
          {showControls && (
            <div className="w-full mb-6 bg-gradient-to-r from-blue-200 to-purple-200 p-4 rounded-xl shadow-inner">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-between">
                <div className="flex-1">
                  <label className="text-purple-900 font-semibold block mb-2">Gravity: {gravity.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={gravity}
                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="collision"
                    checked={collisionEnabled}
                    onChange={(e) => setCollisionEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <label htmlFor="collision" className="text-purple-900 font-semibold">Enable Collisions</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trail"
                    checked={trailEnabled}
                    onChange={(e) => setTrailEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <label htmlFor="trail" className="text-purple-900 font-semibold">Show Trails</label>
                </div>
                <button
                  onClick={clearObjects}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-white shadow"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          {/* Canvas Area */}
          <div
            ref={canvasRef}
            className="relative w-full mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg cursor-crosshair"
            style={{ width: canvasSize.width, height: canvasSize.height, minHeight: 200, minWidth: 200, maxWidth: '100%' }}
            onClick={handleCanvasClick}
          >
            {objects.map(obj => (
              <div key={obj.id}>
                {trailEnabled && obj.trail && obj.trail.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: point.x,
                      top: point.y,
                      backgroundColor: obj.color,
                      opacity: index / obj.trail.length
                    }}
                  />
                ))}
                <div
                  className="absolute rounded-full cursor-move border-2 border-white shadow"
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.mass,
                    height: obj.mass,
                    backgroundColor: obj.color,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${obj.mass/2}px ${obj.color}`
                  }}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseMove={(e) => handleObjectDrag(e, obj)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GravitySimulator;