import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: "Tic Tac Toe",
      path: "/tic-tac-toe",
      icon: "❌⭕",
      bgColor: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
    },
    {
      title: "Chess",
      path: "/chess",
      icon: "♟️",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-800"
    },
    {
      title: "Memory Cards",
      path: "/memory",
      icon: "🧠", bgColor:
        "bg-gradient-to-r from-purple-500 to-pink-600"
    },
    {
      title: "Snake Game",
      path: "/snake",
      icon: "🐍",
      bgColor: "bg-gradient-to-r from-green-500 to-green-700"
    },
    {
      title: "Sudoku",
      path: "/sudoku",
      icon: "9️⃣",
      bgColor: "bg-gradient-to-r from-yellow-500 to-orange-600"
    },
    {
      title: "Rock Paper Scissors",
      path: "/rps",
      icon: "✊",
      bgColor: "bg-gradient-to-r from-red-500 to-yellow-500"
    },
    {
      title: "Minesweeper",
      path: "/minesweeper",
      icon: "💣",
      bgColor: "bg-gradient-to-r from-gray-600 to-gray-800"
    },
    {
      title: "Hangman",
      path: "/hangman",
      icon: "🎭",
      bgColor: "bg-gradient-to-r from-red-600 to-red-800"
    },
    {
      title: "2048 Puzzle",
      path: "/2048",
      icon: "🧩",
      bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600"
    },
    {
      title: "Connect Four",
      path: "/connectfour",
      icon: "🔴🔵",
      bgColor: "bg-gradient-to-r from-blue-600 to-blue-900"
    },
    {
      title: "Brick Breaker",
      path: "/brickbreaker",
      icon: "🏓",
      bgColor: "bg-gradient-to-r from-blue-400 to-blue-600"
    },
    {
      title: "Whack-a-Mole",
      path: "/whackamole",
      icon: "🕳️",
      bgColor: "bg-gradient-to-r from-green-400 to-green-600"
    },
    {
      title: "Flappy Bird",
      path: "/flappy",
      icon: "🐦",
      bgColor: "bg-gradient-to-r from-blue-300 to-blue-500"
    },
    {
      title: "15 Puzzle",
      path: "/puzzle15",
      icon: "🧩",
      bgColor: "bg-gradient-to-r from-purple-400 to-purple-600"
    },
    {
      title: "Lights Out",
      path: "/lightsout",
      icon: "💡",
      bgColor: "bg-gradient-to-r from-yellow-300 to-yellow-500"
    },
    {
      title: "Ball Bounce",
      path: "/ballbounce",
      icon: "🏀",
      bgColor: "bg-gradient-to-r from-red-400 to-red-600"
    },
    {
      title: "Catch Game",
      path: "/catch",
      icon: "🍎",
      bgColor: "bg-gradient-to-r from-green-400 to-green-500"
    },
    {
      title: "Space Invaders",
      path: "/space",
      icon: "👾",
      bgColor: "bg-gradient-to-r from-black to-gray-800"
    },
    {
      title: "Tower of Hanoi",
      path: "/hanoi",
      icon: "🗼",
      bgColor: "bg-gradient-to-r from-orange-400 to-orange-600"
    },
    {
      title: "Simon Says",
      path: "/simon",
      icon: "🔄",
      bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600"
    },

    {
      title: "Number Guesser",
      path: "/guess",
      icon: "🔢",
      bgColor: "bg-gradient-to-r from-teal-500 to-teal-700"
    },
    {
      title: "Color Mixer",
      path: "/color",
      icon: "🎨",
      bgColor: "bg-gradient-to-r from-pink-400 to-pink-600"
    },
    {
      title: "Battleship",
      path: "/battleship",
      icon: "🚢",
      bgColor: "bg-gradient-to-r from-blue-900 to-blue-800"
    },
    {
      title: "Rain Dodge",
      path: "/raindodge",
      icon: "🌧️",
      bgColor: "bg-gradient-to-r from-blue-800 to-blue-900"
    },
    {
      title: "Jigsaw Puzzle",
      path: "/jigsaw",
      icon: "🧩",
      bgColor: "bg-gradient-to-r from-yellow-600 to-yellow-700"
    },
    {
      title: "Maze Solver",
      path: "/maze",
      icon: "🌳",
      bgColor: "bg-gradient-to-r from-green-800 to-green-900"
    },
    {
      title: "Gravity Sim",
      path: "/gravity",
      icon: "🌌",
      bgColor: "bg-gradient-to-r from-purple-800 to-purple-900"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-gradient bg-[length:400%_400%] transition-all duration-500">

      {/* Header */}
      <header className="relative flex flex-col items-center justify-center text-white py-8">

        <h1 className="text-5xl font-extrabold tracking-wide animate-glowText">
          🎮 GameZone
        </h1>
        <p className="text-gray-300 mt-2 text-lg">Choose a game and start playing!</p>
      </header>

      {/* Game Cards */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <div
              key={game.title}
              onClick={() => navigate(game.path)}
              className={`relative bg-gradient-to-br ${game.bgColor} rounded-xl p-6 text-white cursor-pointer transform transition-all hover:scale-105 hover:rotate-[-1deg] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]`}
            >
              <div className="absolute top-3 right-3 text-4xl animate-bounce-slow">
                {game.icon}
              </div>
              <div className="mt-12 text-center">
                <h2 className="text-2xl font-bold">{game.title}</h2>
              </div>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent hover:border-white transition-all"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;