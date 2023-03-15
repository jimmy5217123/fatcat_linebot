const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function getPhoto() {
    const url = 'https://www.ptt.cc/bbs/Beauty/index4001.html';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      Cookie: 'over18=1',
    };
  
    try {
      const response = await axios.get(url, { headers });
      if (!response.data) {
        throw new Error('adadasdasdasd');
      }
      const $ = cheerio.load(response.data);
  
      const articles = $('div.r-ent a').map((i, elem) => ({
        title: $(elem).text(),
        link: 'https://www.ptt.cc' + $(elem).attr('href'),
      })).get().filter(item => item.title.split(' ')[0] === '[正妹]');
  
      if (articles.length === 0) {
        throw new Error('No matching articles found.');
      }
      console.log(articles)
      const article = articles[Math.floor(Math.random() * articles.length)];
      const articleResponse = await axios.get(article.link, { headers });
      const $$ = cheerio.load(articleResponse.data);
  
      const images = $$('a[href$=".jpg"], a[href$=".png"]').map((i, elem) => ({
        link: $(elem).attr('href'),
      })).get();

      if (images.length === 0) {
        throw new Error('No images found.');
      }
  
      const image = images[Math.floor(Math.random() * images.length)];
  
      return {
        type: 'image',
        originalContentUrl: image.link,
        previewImageUrl: image.link,
      };

    } catch (error) {
      console.error(error);
      return null;
    }
  }
  
  module.exports = getPhoto;