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
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  const messageArray = event.message.text.split(' ')
  if (messageArray[0] === '阿貓' && messageArray[1]) {
    const data = await getStock(messageArray[1])
    return client.replyMessage(event.replyToken, {
      type: "flex",
      altText: "阿貓大俠騰空出世",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              wrap: true,
              text: data,
              color: "#0000ff"
            }
          ],
          backgroundColor: "#80ffff"
        }
      }
    }); 
  } else {
    return Promise.resolve(null)
  }
}

async function getStock (stockNumber) {
  const tse = axios.get(`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockNumber}.tw&json=1&delay=0`)
  const otc = axios.get(`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=otc_${stockNumber}.tw&json=1&delay=0`)

  return Promise.all([tse, otc])
  .then((val) => {
    const filterArray = val.filter(data => data.data.msgArray.length > 0)
    if (filterArray.length === 0) {
      return '阿貓大俠找不到這隻股票'
    } else {
      const stockDetail = filterArray[0].data.msgArray[0]
      const result = ` 公司: ${stockDetail.n} \n 開盤: ${stockDetail.o} \n 最高: ${stockDetail.h} \n 最低: ${stockDetail.l} \n 累積成交量: ${stockDetail.v} \n 當盤成交量: ${stockDetail.tv} \n 當盤成交價: ${stockDetail.z} \n 最後成交時刻: ${stockDetail.t}`
      return result
    }
  })
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app