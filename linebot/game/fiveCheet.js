// game.js
class Game  {
  constructor() {
    this.gameBoard = [];
    this.size = 10;
    this.players = [];
    this.currentPlayer = null;
    this.playerNames = new Map();
    this.initGameBoard();
  }

  initGameBoard() {
    for (let i = 0; i < this.size; i++) {
      this.gameBoard[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.gameBoard[i][j] = '-';
      }
    }
  }

  checkGameOver(row, col) {
    const player = this.gameBoard[row][col];
    let count = 1;

    for (let i = col - 1; i >= 0 && this.gameBoard[row][i] === player; i--, count++);
    for (let i = col + 1; i < this.size && this.gameBoard[row][i] === player; i++, count++);

    if (count >= 5) {
      return true;
    }

    count = 1;
    for (let i = row - 1; i >= 0 && this.gameBoard[i][col] === player; i--, count++);
    for (let i = row + 1; i < this.size && this.gameBoard[i][col] === player; i++, count++);

    if (count >= 5) {
      return true;
    }

    count = 1;
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0 && this.gameBoard[i][j] === player; i--, j--, count++);
    for (let i = row + 1, j = col + 1; i < this.size && j < this.size && this.gameBoard[i][j] === player; i++, j++, count++);

    if (count >= 5) {
      return true;
    }

    count = 1;
    for (let i = row - 1, j = col + 1; i >= 0 && j < this.size && this.gameBoard[i][j] === player; i--, j++, count++);
    for (let i = row + 1, j = col - 1; i < this.size && j >= 0 && this.gameBoard[i][j] === player; i++, j--, count++);

    if (count >= 5) {
      return true;
    }

    return false;
  }

  startGame() {
    this.initGameBoard();
    this.players = [];
    this.currentPlayer = null;
  }

  joinGame(userId, playerName) {
    if (this.players.length >= 2) {
      return '遊戲已滿，無法加入。';
    }

    if (this.players.includes(userId)) {
      return '你已經加入了遊戲。';
    }

    this.players.push(userId);
    this.playerNames.set(userId, playerName);

    if (this.players.length === 1) {
      return '你已加入遊戲，請等待另一位玩家加入...';
    }

    this.currentPlayer = this.players[0];
    const currentPlayerName = this.playerNames.get(this.currentPlayer);
    return `遊戲開始！當前玩家為：${currentPlayerName}`;
  }

  makeMove(userId, row, col) {
    if (!this.currentPlayer || !this.players.includes(this.currentPlayer)) {
      return null;
    }

    if (userId !== this.currentPlayer) {
      if (
        isNaN(row) || isNaN(col) ||
        row < 0 || row >= this.size ||
        col < 0 || col >= this.size ||
        this.gameBoard[row][col] !== '-'
      ) {
        return null;
      }
      const currentPlayerName = this.playerNames.get(this.currentPlayer);
      return `現在不是你的回合！輪到玩家：${currentPlayerName}`;
    }

    if (
      isNaN(row) || isNaN(col) ||
      row < 0 || row >= this.size ||
      col < 0 || col >= this.size ||
      this.gameBoard[row][col] !== '-'
    ) {
      return null;
    }

    this.gameBoard[row][col] = this.currentPlayer;

    if (this.checkGameOver(row, col)) {
      const currentPlayerName = this.playerNames.get(this.currentPlayer);
      return `遊戲結束！${currentPlayerName} 獲勝！`;
    }

    this.currentPlayer = (this.currentPlayer === this.players[0]) ? this.players[1] : this.players[0];
    const currentPlayerName = this.playerNames.get(this.currentPlayer);
    return `下一位玩家：${currentPlayerName}`;
  }
}

module.exports = Game;
