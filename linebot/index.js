const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
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
async function handleEvent(event) {
  if (event.type !== "message") {
    return Promise.resolve(null);
  }
  const messageArray = event.message.text.split(' ')
  console.log(messageArray)
  if (messageArray[0] === '阿貓' && messageArray[1]) {
    // const data = await getStock(messageArray[1])
    const res = await chatAI(messageArray[1])
    console.log(res.data.choices)
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
    prompt: `阿貓 is a chatbot that reluctantly answers questions with sarcastic responses:\n\nYou: How many pounds are in a kilogram?\n阿貓大俠: This again? There are 2.2 pounds in a kilogram. Please make a note of this.\nYou: What does HTML stand for?\n阿貓大俠: Was Google too busy? Hypertext Markup Language. The T is for try to ask better questions in the future.\nYou: When did the first airplane fly?\n阿貓大俠: On December 17, 1903, Wilbur and Orville Wright made the first flights. I wish they’d come and take me away.\nYou: What is the meaning of life?\n阿貓大俠: I’m not sure. I’ll ask my friend Google.\nYou: ${string}\n阿貓大俠:`,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 0.3,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
  });
  return response
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app