const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "Owner and bot info with video",
    longDescription: "Sends owner details with image and video attachment",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        gender: '𝐌𝐚𝐥𝐞',
        age: '18±',
        height: '5+',
        choise: 'islam',
        nick: '𝐉𝐚𝐦𝐚𝐢',
        facebook: 'https://www.facebook.com/share/1HPjorq8ce/',
        bot: '🌫 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🎩',
        uid: '61571630409265'
      };

      const videoUrl = 'https://files.catbox.moe/qptlr8.mp4';
      const imageUrl = 'https://files.catbox.moe/k8kwue.jpg';
      const tmpFolderPath = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpFolderPath)) fs.mkdirSync(tmpFolderPath);

      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

      const response = `
╭── ⭑ 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨 ⭑ ──╮
├ 📛 Name: ${ownerInfo.name}
├ 🚹 Gender: ${ownerInfo.gender}
├ 🎂 Age: ${ownerInfo.age}
├ 🐾 Nickname: ${ownerInfo.nick}
├ 🎯 Choice: ${ownerInfo.choise}
├ 📏 Height: ${ownerInfo.height}
├ 🤖 Bot: ${ownerInfo.bot}
├ 🔗 FB: ${ownerInfo.facebook}
├ 🆔 UID: ${ownerInfo.uid}
╰────────────────────╯`;

      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error('❌ Error in owner command:', error);
      return api.sendMessage('❌ Somossa hoise. Bot owner info pathate parlam na.', event.threadID);
    }
  }
};
