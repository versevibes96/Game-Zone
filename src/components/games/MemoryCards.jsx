import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

const cardEmojis = ['🎮', '🎲', '🎯', '🎨', '🧩', '🎪', '🎭', '🃏']

const generateShuffledCards = () => {
  return [...cardEmojis, ...cardEmojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({ id: index, emoji }))
}

const MemoryCards = () => {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [solved, setSolved] = useState([])
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    startNewGame()
  }, [])

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setGameWon(true)
    }
  }, [solved])

  const startNewGame = () => {
    const newCards = generateShuffledCards()
    setCards(newCards)
    setFlipped([])
    setSolved([])
    setGameWon(false)
  }

  const restartGame = () => {
    setFlipped([])
    setSolved([])
    setGameWon(false)
  }

  const handleClick = (id) => {
    if (flipped.length < 2 && !flipped.includes(id) && !solved.includes(id)) {
      const newFlipped = [...flipped, id]
      setFlipped(newFlipped)

      if (newFlipped.length === 2) {
        const [first, second] = newFlipped
        if (cards[first].emoji === cards[second].emoji) {
          setSolved([...solved, first, second])
        }
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      {gameWon && <Confetti width={width} height={height} />}

      <div className="max-w-3xl mx-auto space-y-4">
        <a class=" inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 class="text-4xl text-center font-bold mb-4">🎉Memory Match🎉</h1>
        <div class="bg-white rounded-xl shadow-2xl p-8">

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={restartGame}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
            >
              Restart
            </button>
            <button
              onClick={startNewGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              New Game
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 mt-6">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleClick(index)}
                className={`h-20 sm:h-24 text-3xl sm:text-4xl rounded-lg shadow-md transition-all duration-300 font-bold ${flipped.includes(index) || solved.includes(index)
                  ? 'bg-white text-black'
                  : 'bg-purple-300 text-purple-300'
                  }`}
              >
                {flipped.includes(index) || solved.includes(index) ? card.emoji : '❓'}
              </button>
            ))}
          </div>

          {gameWon && (
            <div className="text-green-700 font-semibold text-xl mt-4">
              Congratulations! You matched all the cards! 🎊
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemoryCards
