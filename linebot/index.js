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

const app = express();


app.post("/", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

let isPlaying = false;
let minNumber = 1;
let maxNumber = 100;
let answer = 0;
let guessCount = 0;

function startGame(event) {
  isPlaying = true;
  minNumber = 1;
  maxNumber = 100;
  answer = Math.floor(Math.random() * 100) + 1;
  guessCount = 0;
  client.replyMessage(event.replyToken, {
    type: 'text',
    text: '猜一個 1-100 的數字。',
  });
}

function endGame(event) {
  isPlaying = false;
  client.replyMessage(event.replyToken, {
    type: 'text',
    text: '遊戲結束。',
  });
}


async function handleEvent(event) {
  if (event.type !== "message") {
    return Promise.resolve(null);
  }
  const messageArray = event.message.text.split(' ')
  console.log(event.message.text)

  if (event.message.text === 'play') {
    startGame(event);
  } else if (isPlaying && event.message.text === 'out') {
    endGame(event);
  } else if (isPlaying && !isNaN(event.message.text)) {
    const guess = Number(event.message.text);
    guessCount++;

    if (guess < minNumber || guess > maxNumber) {
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: `請輸入一個介於 ${minNumber} 和 ${maxNumber} 之間的數字！`,
      });
    } else if (guess === answer) {
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: `猜對了，總共猜了 ${guessCount} 次。`,
      });
      endGame(event);
    } else if (guess < answer) {
      minNumber = guess;
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: `${guess} 太小了，${minNumber}-${maxNumber}`,
      });
    } else {
      maxNumber = guess;
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: `${guess} 太大了，${minNumber}-${maxNumber}`,
      });
    }
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