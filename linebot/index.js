const UltimateNumberGame = require('./UltimateNumberGame')
const OneA2BGame = require('./OneA2B')

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

async function replyTextMessage(event, text) {
  await client.replyMessage(event.replyToken, { type: 'text', text: text})
}


const UltimateNumberGames = new Map();
function getUltimateNumberGame(chatroomId) {
  if (!UltimateNumberGames.has(chatroomId)) {
    const game = new UltimateNumberGame(1, 100);
    UltimateNumberGames.set(chatroomId, game);
    return game;
  } else {
    return UltimateNumberGames.get(chatroomId);
  }
}

const OneA2BGames = new Map();
function getOneA2Bgame(chatroomId) {
  if (!OneA2BGames.has(chatroomId)) {
    const game = new OneA2BGame();
    OneA2BGames.set(chatroomId, game);
    return game;
  } else {
    return OneA2BGames.get(chatroomId);
  }
}

async function handleEvent(event) {

  if (event.type !== "message") {
    return Promise.resolve(null);
  }
  const messageArray = event.message.text.split(' ')
  const chatType = event.source.type
  const chatroomId = chatType === 'group' ? event.source.groupId : chatType === 'user' ? event.source.userId : '2313213'
  const myUltimateNumberGame = getUltimateNumberGame(chatroomId);
  const myOneA2BGame = getOneA2Bgame(chatroomId)

  if (event.message.text === '1a2b') {
    const replyText = myOneA2BGame.start()
    await replyTextMessage(event, replyText)
  } else if (myOneA2BGame.isPlaying && event.message.text.length === 4 && !isNaN(event.message.text)) {
    const guess = event.message.text;
    const replyText = myOneA2BGame.guess(guess)
    await replyTextMessage(event, replyText)
  }

  if (event.message.text === 'play') {
    const replyText = myUltimateNumberGame.startGame();
    await replyTextMessage(event, replyText)
  } else if (myUltimateNumberGame.isPlaying && event.message.text === 'out') {
    const replyText = myUltimateNumberGame.endGame();
    await replyTextMessage(event, replyText)
  } else if (myUltimateNumberGame.isPlaying && !isNaN(event.message.text)) {
    const guess = Number(event.message.text);
    const replyText = myUltimateNumberGame.makeGuess(guess)
    await replyTextMessage(event, replyText)
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