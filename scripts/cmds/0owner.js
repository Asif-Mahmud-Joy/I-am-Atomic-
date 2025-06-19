const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "ownerinfo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "Owner and bot info with video",
    longDescription: "Real-time styled owner & bot info with animated flair",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const owner = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        gender: 'Male ♂️',
        age: '18±',
        height: '5+ft 📏',
        choice: 'Islam ☪️',
        nick: '𝐉𝐚𝐦𝐚𝐢',
        fb: 'https://www.facebook.com/share/1HPjorq8ce/',
        bot: '🌫 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🎩',
        uid: '61571630409265'
      };

      const videoUrl = 'https://files.catbox.moe/qptlr8.mp4';
      const tmpFolder = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder);

      const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const videoPath = path.join(tmpFolder, 'owner_video.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoBuffer.data, 'binary'));

      const now = new Date();
      const options = {
        timeZone: 'Asia/Dhaka',
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      const timestamp = now.toLocaleString('en-BD', options);

      // Typing feel
      await new Promise(res => setTimeout(res, 600));

      const message = `
╭━━━━━━━⌈ ⚡ 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 ⚡ ⌋━━━━━━━╮
┃
┃ ❖ 📛 𝗡𝗮𝗺𝗲: ${owner.name}
┃ ❖ 🚹 𝗚𝗲𝗻𝗱𝗲𝗿: ${owner.gender}
┃ ❖ 🎂 𝗔𝗴𝗲: ${owner.age}
┃ ❖ 🐾 𝗡𝗶𝗰𝗸: ${owner.nick}
┃ ❖ 💫 𝗖𝗵𝗼𝗶𝗰𝗲: ${owner.choice}
┃ ❖ 📏 𝗛𝗲𝗶𝗴𝗵𝘁: ${owner.height}
┃ ❖ 🤖 𝗕𝗼𝘁: ${owner.bot}
┃ ❖ 🔗 𝗙𝗕: ${owner.fb}
┃ ❖ 🆔 𝗨𝗜𝗗: ${owner.uid}
┃
╰━━━━━━━⌈ 🕓 ${timestamp} ⌋━━━━━━━╯

✨ Stay Smoke-tastic! Bot powered by your jamai 😎
`;

      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

    } catch (e) {
      console.log('❌ Owner info error:', e.message);
      return api.sendMessage('❌ Somossa hoise. Try again later.', event.threadID);
    }
  }
};
