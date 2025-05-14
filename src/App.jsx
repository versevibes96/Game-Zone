import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import TicTacToe from "./components/games/TicTacToe"
import ChessGameAI from "./components/games/Chess"
import MemoryCards from './components/games/MemoryCards'
import Snake from './components/games/Snake'
import Sudoku from './components/games/Sudoku'
import RPS from './components/games/RPS'
import Minesweeper from './components/games/Minesweeper';
import Hangman from './components/games/Hangman';
import Puzzle2048 from './components/games/Puzzle2048';
import ConnectFour from './components/games/ConnectFour';
import BrickBreaker from './components/games/BrickBreaker';
import WhackAMole from './components/games/WhackAMole';
import FlappyBird from './components/games/FlappyBird';
import SlidingPuzzle from './components/games/SlidingPuzzle';
import LightsOut from './components/games/LightsOut';
import BallBounce from './components/games/BallBounce';
import CatchGame from './components/games/CatchGame';
import SpaceInvaders from "./components/games/SpaceInvaders";
import HanoiTower from "./components/games/HanoiTower";
import SimonSays from "./components/games/SimonSays";
import NumberGuesser from "./components/games/NumberGuesser";
import ColorMixer from "./components/games/ColorMixer";
import Battleship from "./components/games/Battleship";
import RainDodge from './components/games/RainDodge';
import JigsawPuzzle from './components/games/JigsawPuzzle';
import MazeSolver from './components/games/MazeSolver';
import GravitySimulator from './components/games/GravitySimulator';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tic-tac-toe" element={<TicTacToe />} />
      <Route path="/chess" element={<ChessGameAI />} />
      <Route path="/memory" element={<MemoryCards />} />
      <Route path="/snake" element={<Snake />} />
      <Route path="/sudoku" element={<Sudoku />} />
      <Route path="/rps" element={<RPS />} />
      <Route path="/minesweeper" element={<Minesweeper />} />
      <Route path="/hangman" element={<Hangman />} />
      <Route path="/2048" element={<Puzzle2048 />} />
      <Route path="/connectfour" element={<ConnectFour />} />
      <Route path="/brickbreaker" element={<BrickBreaker />} />
      <Route path="/whackamole" element={<WhackAMole />} />
      <Route path="/flappy" element={<FlappyBird />} />
      <Route path="/puzzle15" element={<SlidingPuzzle />} />
      <Route path="/lightsout" element={<LightsOut />} />
      <Route path="/ballbounce" element={<BallBounce />} />
      <Route path="/catch" element={<CatchGame />} />
      <Route path="/space" element={<SpaceInvaders />} />
      <Route path="/hanoi" element={<HanoiTower />} />
      <Route path="/simon" element={<SimonSays />} />
      <Route path="/guess" element={<NumberGuesser />} />
      <Route path="/color" element={<ColorMixer />} />
      <Route path="/battleship" element={<Battleship />} />
      <Route path="/raindodge" element={<RainDodge />} />
      <Route path="/jigsaw" element={<JigsawPuzzle />} />
      <Route path="/maze" element={<MazeSolver />} />
      <Route path="/gravity" element={<GravitySimulator />} />
    </Routes>
  )
}

export default App