const UltimateNumberGame = require('./game/UltimateNumberGame')
const OneA2BGame = require('./game/OneA2B')
const getPhoto = require('./method/getBeauty')
const Game = require('./game/fiveCheet')
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require('axios');
const e = require('express');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new line.Client(config);


// const { createCanvas } = require('canvas');


const app = express();
app.post("/", line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent)).then((result) =>
      res.json(result)
    );
});

async function replyTextMessage(event, text) {
  await client.replyMessage(event.replyToken, { type: 'text', text: text})
}

async function replyImageMessage(event, imageObj) {
  await client.replyMessage(event.replyToken, imageObj)
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

const games = new Map();

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

async function handleEvent(event) {

  if (event.type !== "message") {
    return Promise.resolve(null);
  }
  const clientMessage = event.message.text
  const messageArray = clientMessage.split(' ')
  const keyman = messageArray[0]
  messageArray.splice(0, 1)
  const keyMessage = messageArray.join(' ')
  const chatType = event.source.type
  const chatroomId = chatType === 'group' ? event.source.groupId : chatType === 'user' ? event.source.userId : '2313213'
  const myUltimateNumberGame = getUltimateNumberGame(chatroomId);
  const myOneA2BGame = getOneA2Bgame(chatroomId)

  if (keyman === '阿貓' && keyMessage) {
    const res = await chatAI(keyMessage)
    return client.replyMessage(event.replyToken, {
        type: "text",
        text: res.status === 200 ? `${res.data.choices[0].text.replace(/^\s*/,"")}` : `${JSON.stringify(res)}`
    }); 
  }

  if (keyman === '新增菜單' && keyMessage) {
    const addFood = await axios.post('https://6wcs35.deta.dev/addFood', {
      name: keyMessage
    })
    if (addFood.status === 201) await replyTextMessage(event, '新增成功')
  }
  
  if (clientMessage === '我是誰') {
    const user = await client.getProfile(event.source.userId)
    const displayNamre = user.displayName
    await replyTextMessage(event, displayNamre)
  }

  if (clientMessage === '吃啥') {
    const getfood = await axios.get('https://6wcs35.deta.dev/allFood')
    const food = getfood.data
    const randomFood =  food[Math.floor(Math.random() * food.length)].name
    await replyTextMessage(event, randomFood)
  }

  if (clientMessage === '菜單') {
    const getfood = await axios.get('https://6wcs35.deta.dev/allFood')
    const food = getfood.data
    let foodListString = ''
    food.forEach(item => {
      foodListString += `${item.name}\n`
    });
    await replyTextMessage(event, foodListString)
  }

  if (clientMessage === '閃電五連抽') {
    try {
      const imageArray = []
      for (let i = 0; i < 5; i++) {
        const imageObj = await getPhoto()
        imageArray.push(imageObj)
      }
      await replyImageMessage(event, imageArray)
    } catch (error) {
      console.log(error)
    }
  }

  if (clientMessage === '抽') {
    try {
      const imageObj = await getPhoto()
      await replyImageMessage(event, imageObj)
    } catch (error) {
      console.log(error)
    }
  }

  if (clientMessage === '1A2B') {
    const replyText = myOneA2BGame.start()
    await replyTextMessage(event, replyText)
  } else if (myOneA2BGame.isPlaying && clientMessage.length === 4 && !isNaN(clientMessage)) {
    const guess = clientMessage;
    const replyText = myOneA2BGame.guess(guess)
    await replyTextMessage(event, replyText)
  }

  if (clientMessage === '終極密碼') {
    const replyText = myUltimateNumberGame.startGame();
    await replyTextMessage(event, replyText)
  } else if (myUltimateNumberGame.isPlaying && clientMessage === 'out') {
    const replyText = myUltimateNumberGame.endGame();
    await replyTextMessage(event, replyText)
  } else if (myUltimateNumberGame.isPlaying && !isNaN(clientMessage)) {
    const guess = Number(clientMessage);
    const replyText = myUltimateNumberGame.makeGuess(guess)
    await replyTextMessage(event, replyText)
  }





  const message = event.message.text;
  const groupId = event.source.groupId;
  const userId = event.source.userId;
  const userData = await client.getProfile(event.source.userId)

  if (message === 'start') {
    games.set(groupId, new Game());
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '遊戲已開始！請使用 "join" 命令加入遊戲。',
    });
  }

  if (message === 'join') {
    const game = games.get(groupId);
    if (!game) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '請開始遊戲。',
      });
    }

    const joinResult = game.joinGame(userId, userData.displayName);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: joinResult,
    });
  }

  const game = games.get(groupId);
  if (!game) {
    return Promise.resolve(null);
  }

  const [row, col] = message.split(' ').map(Number);
  const moveResult = game.makeMove(userId, row, col);

  if (moveResult) {
    try {
      const image = generateGameBoardImage(game.gameBoard, game.players);
      return client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: moveResult,
        },
        {
          type: 'image',
          originalContentUrl: image,
          previewImageUrl: image,
        },
      ]);
    } catch(err) {
      console.log(err)
    }
  }


  return Promise.resolve(null)
}

function generateGameBoardText(gameBoard, players) {
  let gameBoardText = '';
  for (let row = 0; row < gameBoard.length; row++) {
    for (let col = 0; col < gameBoard[row].length; col++) {
      if (gameBoard[row][col] === '-') {
        gameBoardText += '- ';
      } else if (gameBoard[row][col] === players[0]) {
        gameBoardText += 'O ';
      } else if (gameBoard[row][col] === players[1]) {
        gameBoardText += '@ ';
      }
    }
    gameBoardText += '\n';
  }
  return gameBoardText;
}


function generateGameBoardImage(gameBoard, players) {
  const canvasSize = 400; // 棋盘画布的尺寸
  const cellSize = canvasSize / gameBoard.length; // 每个格子的尺寸

  // 创建画布
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  // 绘制棋盘背景
  ctx.fillStyle = '#F5DEB3'; // 棋盘背景颜色
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // 绘制棋盘格子
  ctx.strokeStyle = '#000000'; // 格子边框颜色
  ctx.lineWidth = 1;
  for (let row = 0; row < gameBoard.length; row++) {
    for (let col = 0; col < gameBoard[row].length; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      ctx.beginPath();
      ctx.rect(x, y, cellSize, cellSize);
      ctx.stroke();

      // 绘制棋子
      const chessPiece = gameBoard[row][col];
      if (chessPiece === players[0]) {
        ctx.fillStyle = '#FF0000'; // 玩家1棋子颜色
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 5, 0, Math.PI * 2);
        ctx.fill();
      
      } else if (chessPiece === players[1]) {
        ctx.fillStyle = '#0000FF'; // 玩家2棋子颜色
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 将画布转换为图片
  const image = canvas.toDataURL();
  return image;
}




// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app