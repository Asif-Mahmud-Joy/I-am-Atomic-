const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "f84",
    aliases: [],
    version: "1.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Random Farlight video downloader",
    longDescription: "Downloads and sends a random Farlight gameplay video",
    category: "media",
    guide: {
      en: "{pn}f84"
    }
  },

  onStart: async function ({ api, event }) {
    const tempFilePath = path.join(__dirname, 'cache', 'farlight.mp4');
    try {
      await api.sendMessage('📥 Downloading a random Farlight 84 video, boss... 🎮', event.threadID);

      const { data } = await axios.get('https://farlight-api.z4f.dev/random');
      const videoUrl = data.url;

      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: '🔥 Farlight 84 Incoming!
Ready to join the fight? 💥',
          attachment: fs.createReadStream(tempFilePath)
        }, event.threadID, () => {
          fs.unlink(tempFilePath, err => {
            if (err) console.error('❌ Error deleting temp file:', err);
          });
        });
      });

      writer.on('error', (err) => {
        console.error('❌ Stream error:', err);
        api.sendMessage('Failed to save video stream.', event.threadID);
      });

    } catch (err) {
      console.error('❌ API or file error:', err);
      api.sendMessage('❌ Sorry, Farlight API is unavailable or broken.', event.threadID);
    }
  }
};
