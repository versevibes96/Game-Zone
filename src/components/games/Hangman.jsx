import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

const words = ['DEVELOPER', 'MANGO', 'FRUITS', 'PLAY', 'GAME', 'HANGMAN', 'WORLD']
const MAX_WRONG = 6

const getRandomWord = () => words[Math.floor(Math.random() * words.length)]

const Hangman = () => {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [word, setWord] = useState(getRandomWord)
  const [guessed, setGuessed] = useState(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'lost'

  const guessedWord = word
    .split('')
    .map(letter => (guessed.has(letter) ? letter : '_'))
    .join(' ')

  const handleGuess = e => {
    const letter = e.target.value.toUpperCase()
    if (!/^[A-Z]$/.test(letter) || guessed.has(letter) || gameStatus !== 'playing') return

    const updatedGuessed = new Set([...guessed, letter])
    setGuessed(updatedGuessed)

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1
      setWrongGuesses(newWrong)
      if (newWrong >= MAX_WRONG) setGameStatus('lost')
    } else {
      const allLettersGuessed = word.split('').every(l => updatedGuessed.has(l))
      if (allLettersGuessed) setGameStatus('won')
    }
  }

  const resetSameWord = () => {
    setGuessed(new Set())
    setWrongGuesses(0)
    setGameStatus('playing')
  }

  const startNewGame = () => {
    setWord(getRandomWord())
    setGuessed(new Set())
    setWrongGuesses(0)
    setGameStatus('playing')
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      {(gameStatus === 'won') && <Confetti width={width} height={height} />}

      <div class="max-w-2xl mx-auto">
        <a class="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 class="text-4xl font-bold text-center mb-8">🎭Hangman</h1>
        <div class="bg-white rounded-xl shadow-2xl p-8">
        <div className="text-black text-2xl font-mono text-center tracking-widest">{guessedWord}</div>
        <p className="text-lg text-center pt-5 text-gray-700">
          Wrong guesses: {wrongGuesses}/{MAX_WRONG}
        </p>
        <p className="text-green-600 text-center py-5 font-semibold">Score: {word.split('').filter(l => guessed.has(l)).length}</p>

        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 26 }, (_, i) => {
            const letter = String.fromCharCode(65 + i)
            return (
              <button
                key={letter}
                value={letter}
                onClick={handleGuess}
                disabled={guessed.has(letter) || gameStatus !== 'playing'}
                className={`w-9 h-9 text-sm font-bold rounded ${guessed.has(letter)
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {gameStatus === 'won' && (
          <div className="text-green-600 text-center font-bold text-lg mt-4">🎉 You guessed it right!</div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-red-600 text-center font-bold text-lg mt-4">💀 Game Over! Word was: {word}</div>
        )}

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={resetSameWord}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-4 rounded"
          >
            🔁 Restart
          </button>
          <button
            onClick={startNewGame}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
          >
            🔤 New Word
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Hangman
