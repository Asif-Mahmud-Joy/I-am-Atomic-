let games = {};
let points = {}; // Point system added

function checkWinner(board) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

function displayBoard(board) {
  let out = "";
  for (let i = 0; i < 9; i++) {
    out += board[i] ?? "⬛";
    out += (i + 1) % 3 === 0 ? "\n" : " ";
  }
  return out;
}

function makeBotMove(board) {
  const bot = "⭕";
  const player = "❌";

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = bot;
      if (checkWinner(board)) return;
      board[i] = null;
    }
  }

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWinner(board)) {
        board[i] = bot;
        return;
      }
      board[i] = null;
    }
  }

  const empty = board.map((v, i) => v === null ? i : -1).filter(v => v !== -1);
  const rand = empty[Math.floor(Math.random() * empty.length)];
  if (rand !== undefined) board[rand] = bot;
}

function resetGame(playerID) {
  games[playerID] = {
    board: Array(9).fill(null),
    currentPlayer: "❌"
  };
}

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tictactoe"],
    version: "2.0",
    author: "Upgraded by ChatGPT",
    category: "game",
  },
  onStart: async function ({ event, api }) {
    const id = event.senderID;
    if (!games[id] || isBoardFull(games[id].board) || checkWinner(games[id].board)) {
      resetGame(id);
    }

    if (!points[id]) points[id] = { win: 0, draw: 0, lose: 0 };

    const msg = `🎮 Let's play TicTacToe!
You're ❌, Bot is ⭕
Reply with number 1-9

Current Score:
✅ Wins: ${points[id].win}
🤝 Draws: ${points[id].draw}
❌ Losses: ${points[id].lose}`;

    api.sendMessage(msg, event.threadID);
    api.sendMessage(displayBoard(games[id].board), event.threadID);
  },

  onChat: async function ({ event, api, args }) {
    const id = event.senderID;

    if (!games[id]) {
      api.sendMessage("Start the game first by typing: ttt", event.threadID);
      return;
    }

    const pos = parseInt(args[0]);
    if (isNaN(pos) || pos < 1 || pos > 9 || games[id].board[pos - 1]) {
      return api.sendMessage("❗ Invalid move. Try a number (1-9) in an empty cell.", event.threadID);
    }

    games[id].board[pos - 1] = "❌";

    let winner = checkWinner(games[id].board);
    if (winner) {
      points[id].win++;
      api.sendMessage(displayBoard(games[id].board), event.threadID);
      return api.sendMessage("🎉 You win! 🎉", event.threadID);
    }

    if (isBoardFull(games[id].board)) {
      points[id].draw++;
      api.sendMessage(displayBoard(games[id].board), event.threadID);
      return api.sendMessage("🤝 It's a draw!", event.threadID);
    }

    makeBotMove(games[id].board);

    winner = checkWinner(games[id].board);
    if (winner) {
      points[id].lose++;
      api.sendMessage(displayBoard(games[id].board), event.threadID);
      return api.sendMessage("😢 You lost!", event.threadID);
    }

    if (isBoardFull(games[id].board)) {
      points[id].draw++;
      api.sendMessage(displayBoard(games[id].board), event.threadID);
      return api.sendMessage("🤝 It's a draw!", event.threadID);
    }

    api.sendMessage(displayBoard(games[id].board), event.threadID);
  },
};
