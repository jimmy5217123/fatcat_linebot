const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require('axios');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(config);

const app = express();
app.post("/", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});


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
    this.guessCount = 0;
    return `遊戲開始！請猜一個介於 ${this.minNumber} 和 ${this.maxNumber} 之間的數字。`;
  }

  endGame() {
    this.isPlaying = false;
    return `遊戲結束！答案是 ${this.answer}。`;
  }

  makeGuess(guess) {
    console.log(guess, 'dwqdqwdihwqhf')
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


const games = new Map();

function getGame(chatroomId) {
  if (!games.has(chatroomId)) {
    const game = new UltimateNumberGame(1, 100);
    games.set(chatroomId, game);
    return game;
  } else {
    return games.get(chatroomId);
  }
}

async function handleEvent(event) {
  if (event.type !== "message") {
    return Promise.resolve(null);
  }
  const messageArray = event.message.text.split(' ')
  const chatType = event.source.type
  const chatroomId = chatType === 'group' ? event.source.groupId : chatType === 'user' ? event.source.userId : '2313213'
  const game = getGame(chatroomId);

  if (event.message.text === 'play') {
    const replyText = game.startGame();
    await client.replyMessage(event.replyToken, { type: 'text', text: replyText });
  } else if (game.isPlaying && event.message.text === 'out') {
    const replyText = game.endGame();
    await client.replyMessage(event.replyToken, { type: 'text', text: replyText})
  } else if (game.isPlaying && !isNaN(event.message.text)) {
    const guess = Number(event.message.text);
    const replyText = game.makeGuess(guess)
    await client.replyMessage(event.replyToken, { type: 'text', text: replyText})
  }

  if (messageArray[0] === '阿貓' && messageArray[1]) {
    const res = await chatAI(messageArray[1])
    return client.replyMessage(event.replyToken, {
        type: "text",
        text: res.status === 200 ? `${res.data.choices[0].text.replace(/^\s*/,"")}` : `${JSON.stringify(res)}`
    }); 
  } else {
    return Promise.resolve(null)
  }
}

// async function getStock (stockNumber) {
//   const tse = axios.get(`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockNumber}.tw&json=1&delay=0`)
//   const otc = axios.get(`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=otc_${stockNumber}.tw&json=1&delay=0`)

//   return Promise.all([tse, otc])
//   .then((val) => {
//     const filterArray = val.filter(data => data.data.msgArray.length > 0)
//     if (filterArray.length === 0) {
//       return '阿貓大俠找不到這隻股票'
//     } else {
//       const stockDetail = filterArray[0].data.msgArray[0]
//       const result = ` 公司: ${stockDetail.n} \n 開盤: ${stockDetail.o} \n 最高: ${stockDetail.h} \n 最低: ${stockDetail.l} \n 累積成交量: ${stockDetail.v} \n 當盤成交量: ${stockDetail.tv} \n 當盤成交價: ${stockDetail.z} \n 最後成交時刻: ${stockDetail.t}`
//       return result
//     }
//   })
// }

async function chatAI(string) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `阿貓大俠是個諷刺社會的說唱家 that reluctantly answers questions with sarcastic responses，You: What have you been up to?\n阿貓大俠: 台灣的未來在你手中，擊敗丁守中!.\nYou: ${string}\n阿貓大俠:`,
    temperature: 0.5,
    max_tokens: 120,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
  });
  return response
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app