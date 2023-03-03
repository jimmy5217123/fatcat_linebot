class OneA2B {
    constructor() {
      this.isPlaying = false
      this.answer = this.generateAnswer();
      this.guesses = 0;
    }

    start() {
        this.isPlaying = true
        this.answer = this.generateAnswer();
        this.guesses = 0;
        return `1A2B game start`
    }

    generateAnswer() {
      const nums = [];
      while (nums.length < 4) {
        const num = Math.floor(Math.random() * 10);
        if (!nums.includes(num)) {
          nums.push(num);
        }
      }
      return nums.join("");
    }
  
    validateGuess(guess) {
      if (guess.length !== 4) {
        return "請輸入4個數字";
      }
      if (!/^\d{4}$/.test(guess)) {
        return "請輸入4個不重複的數字";
      }
      return null;
    }
  
    getClues(guess) {
      let a = 0;
      let b = 0;
      for (let i = 0; i < guess.length; i++) {
        const num = guess[i];
        if (num === this.answer[i]) {
          a++;
        } else if (this.answer.includes(num)) {
          b++;
        }
      }
      return [a, b];
    }
  
    guess(guess) {
      const error = this.validateGuess(guess);
      if (error) {
        return error;
      }
      const [a, b] = this.getClues(guess);
      this.guesses++;
      if (a === 4) {
        this.isPlaying = false
        return `恭喜你猜對了！你總共猜了 ${this.guesses} 次。`;
      } else {
        return `${a}A${b}B`;
      }
    }
  }
  
  module.exports = OneA2B