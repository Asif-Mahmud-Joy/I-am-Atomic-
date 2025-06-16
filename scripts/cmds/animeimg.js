const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'animeimg',
    version: '2.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    role: 0,
    category: 'anime',
    shortDescription: {
      en: 'Random anime image dekhao'
    },
    longDescription: {
      en: 'Real-time working anime image API diye random anime photo pathabe'
    },
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event }) {
    const loading = await api.sendMessage('⏳ Anime image toiri hocche...', event.threadID);

    try {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu');

      if (!res.data || !res.data.url) {
        return api.sendMessage('❌ API theke kono image pawa jay nai.', event.threadID);
      }

      const imageStream = await global.utils.getStreamFromURL(res.data.url);

      await api.sendMessage({
        body: '✨ Tumar random anime image:',
        attachment: imageStream
      }, event.threadID, () => {
        api.unsendMessage(loading.messageID);
      }, event.messageID);

    } catch (err) {
      console.error('Error fetching anime image:', err);
      api.sendMessage('❌ Sorry, anime image pathate somossa hocche.', event.threadID);
    }
  }
};
