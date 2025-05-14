import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

const BOARD_SIZE = 8
const MINE_COUNT = 10

const createBoard = (size, mines) => {
  const board = Array(size)
    .fill()
    .map(() => Array(size).fill(0))

  let minesPlaced = 0
  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * size)
    const y = Math.floor(Math.random() * size)
    if (board[x][y] !== 'X') {
      board[x][y] = 'X'
      minesPlaced++
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === 'X') continue
      let count = 0
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = i + dx,
            ny = j + dy
          if (
            nx >= 0 &&
            nx < size &&
            ny >= 0 &&
            ny < size &&
            board[nx][ny] === 'X'
          )
            count++
        }
      }
      board[i][j] = count
    }
  }
  return board
}

const Minesweeper = () => {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [board, setBoard] = useState([])
  const [revealed, setRevealed] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    setBoard(createBoard(BOARD_SIZE, MINE_COUNT))
    setRevealed(
      Array(BOARD_SIZE)
        .fill()
        .map(() => Array(BOARD_SIZE).fill(false))
    )
    setGameOver(false)
    setGameWon(false)
    setScore(0)
  }

  const restartGame = () => {
    setRevealed(
      Array(BOARD_SIZE)
        .fill()
        .map(() => Array(BOARD_SIZE).fill(false))
    )
    setGameOver(false)
    setGameWon(false)
    setScore(0)
  }

  const handleClick = (x, y) => {
    if (gameOver || gameWon || revealed[x][y]) return

    if (board[x][y] === 'X') {
      setGameOver(true)
      const allRevealed = revealed.map(row => row.map(() => true))
      setRevealed(allRevealed)
      return
    }

    const newRevealed = revealed.map(row => [...row])
    revealCell(newRevealed, x, y)
    setRevealed(newRevealed)

    const totalSafe = BOARD_SIZE * BOARD_SIZE - MINE_COUNT
    const totalRevealed = newRevealed.flat().filter(Boolean).length
    setScore(totalRevealed)

    if (totalRevealed === totalSafe) {
      setGameWon(true)
    }
  }

  const revealCell = (revealedBoard, x, y) => {
    if (
      x < 0 ||
      x >= BOARD_SIZE ||
      y < 0 ||
      y >= BOARD_SIZE ||
      revealedBoard[x][y]
    )
      return

    revealedBoard[x][y] = true

    if (board[x][y] === 0) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            revealCell(revealedBoard, x + dx, y + dy)
          }
        }
      }
    }
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-6 relative">
      {gameWon && <Confetti width={width} height={height} />}

      <div class="max-w-2xl mx-auto">
        <a class="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full
            hover:bg-opacity-30 transition-all duration-300" href="/" data-discover="true">← Home</a>
        <h1 class="text-4xl font-bold text-center mb-8">💣 Minesweeper</h1>
        <div class="bg-white rounded-xl shadow-2xl p-8">

          <div className="flex justify-center gap-3">
            <button
              onClick={restartGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-4 rounded"
            >
              Restart
            </button>
            <button
              onClick={startNewGame}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
            >
              New Game
            </button>
          </div>

          <p className="text-lg font-medium text-gray-700">Score: {score}</p>

          <div className="grid grid-cols-8 gap-1 mt-2">
            {board.map((row, x) =>
              row.map((cell, y) => (
                <button
                  key={`${x}-${y}`}
                  onClick={() => handleClick(x, y)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base rounded text-black font-bold flex items-center justify-center border ${revealed[x][y]
                    ? cell === 'X'
                      ? 'bg-red-400 text-white'
                      : 'bg-gray-200'
                    : 'bg-indigo-300 hover:bg-indigo-400'
                    }`}
                >
                  {revealed[x][y] ? (cell === 0 ? '' : cell === 'X' ? '💣' : cell) : ''}
                </button>
              ))
            )}
          </div>

          {gameOver && (
            <div className="text-red-600 font-bold text-lg mt-4">💥 Game Over!</div>
          )}
          {gameWon && (
            <div className="text-green-600 font-bold text-lg mt-4">
              🎉 You Win! Great Job!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Minesweeper
