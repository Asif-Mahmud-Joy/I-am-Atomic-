const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "ownerinfo",
    author: "Mr.Smokey",
    role: 0,
    shortDescription: "Owner info with BD style 💥",
    longDescription: "Displays Bangladeshi styled owner's information with an attached video.",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: '🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠',
        choise: '🕋 ইসলামিক জীবনধারা',
        habit: '🎧 গান শোনা, 🎮 গেম খেলা, 📚 নতুন কিছু শেখা',
        gender: '👨 ছেলে',
        age: '🔞 ১৮+',
        height: '📏 ৫ ফুট+',
        facebookLink: '🌐 https://www.facebook.com/share/1HPjorq8ce/',
        nick: '🔥 Mr.Smokey 🔥'
      };

      const videoUrl = 'https://i.imgur.com/LbneO8C.mp4';
      const tmpFolderPath = path.join(__dirname, 'tmp');
      const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

      await fs.ensureDir(tmpFolderPath);

      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(videoPath, Buffer.from(videoResponse.data));

      const response = `
╭━━━[💫 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 💫]━━━╮
┃ 👤 নাম        : ${ownerInfo.name}
┃ 🛐 পছন্দ     : ${ownerInfo.choise}
┃ 🧠 অভ্যাস   : ${ownerInfo.habit}
┃ 🚹 লিঙ্গ     : ${ownerInfo.gender}
┃ 🔞 বয়স      : ${ownerInfo.age}
┃ 📏 উচ্চতা  : ${ownerInfo.height}
┃ 🌐 ফেসবুক : ${ownerInfo.facebookLink}
┃ 🐲 ডাকনাম : ${ownerInfo.nick}
╰━━━━━━━━━━━━━━━━━━━╯`;

      await api.sendMessage({
        body: response,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlinkSync(videoPath), event.messageID);

      if ((event.body || '').toLowerCase().includes('ownerinfo')) {
        api.setMessageReaction('🔥', event.messageID, () => {}, true);
      }

    } catch (error) {
      console.error('❌ Owner command error:', error);
      return api.sendMessage('❌ ভাই সমস্যা হইসে! একটু পর আবার চেস্টা করুন 🔧', event.threadID);
    }
  },
};
