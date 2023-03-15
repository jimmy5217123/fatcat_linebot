class UltimateNumberGame {
  constructor(minNumber, maxNumber) {
    this.minNumber = minNumber;
    this.maxNumber = maxNumber;
    this.answer = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    this.isPlaying = false;
    this.guessCount = 0;
  }

  startGame() {
    this.isPlaying = true;
    this.minNumber = 1;
    this.maxNumber = 100;
    this.answer = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    this.guessCount = 0;
    return `遊戲開始！請猜一個介於 ${this.minNumber} 和 ${this.maxNumber} 之間的數字。`;
  }

  endGame() {
    this.isPlaying = false;
    return `遊戲結束！答案是 ${this.answer}。`;
  }

  makeGuess(guess) {
    this.guessCount++;
    if (guess < this.minNumber || guess > this.maxNumber) {
      return `請輸入一個介於 ${this.minNumber} 和 ${this.maxNumber} 之間的有效數字！`;
    } else if (guess === this.answer) {
      this.isPlaying = false;
      return `恭喜你猜對了！你總共猜了 ${this.guessCount} 次。`;
    } else if (guess < this.answer) {
      this.minNumber = guess;
      return `你猜的數字 ${guess} 太小了，介於 ${this.minNumber} 和 ${this.maxNumber}`;
    } else {
      this.maxNumber = guess;
      return `你猜的數字 ${guess} 太大了，介於 ${this.minNumber} 和 ${this.maxNumber}`;
    }
  }
}

  module.exports = UltimateNumberGame