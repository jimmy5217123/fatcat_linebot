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