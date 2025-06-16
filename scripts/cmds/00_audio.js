const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const audioList = {
  women: {
    message: "「 Women ☕ 」",
    file: "women.mp3",
    url: "https://files.catbox.moe/3ifzpn.mp3"
  },
  yamate: {
    message: "「 Yamate 🥵 」",
    file: "yamate.mp3",
    url: "https://files.catbox.moe/07hmj9.mp3"
  },
  dazai: {
    message: "「 ahhh~ 」",
    file: "Dazai.mp3",
    url: "https://files.catbox.moe/q83azf.mp3"
  },
  ara: {
    message: "「 ara ara 」",
    file: "ara.mp3",
    url: "https://files.catbox.moe/kl3pbc.mp3"
  },
  "good night": {
    message: "「 Good Night 🌉 」",
    file: "night.mp3",
    url: "https://files.catbox.moe/15vs8u.mp3"
  },
  sus: {
    message: "「 🦎 」",
    file: "sus.mp3",
    url: "https://files.catbox.moe/0xpi2z.mp3"
  },
  "good morning": {
    message: "「 Good Morning 🌄 」",
    file: "gm.mp3",
    url: "https://files.catbox.moe/d79j8g.mp3"
  },
  yourmom: {
    message: "「 Bujis ki nai? 」",
    file: "yourmom.mp3",
    url: "https://files.catbox.moe/hpc70p.mp3"
  },
  machikney: {
    message: "「 Machikney 」",
    file: "machikney.mp3",
    url: "https://files.catbox.moe/c1grxy.mp3"
  },
  randi: {
    message: "「 Randi ko Chora 」",
    file: "randi.mp3",
    url: "https://files.catbox.moe/czk9ij.mp3"
  },
  sachiin: {
    message: "「 GAYY 」",
    file: "sachiin.mp3",
    url: "https://files.catbox.moe/4n7jzq.mp3"
  },
  omg: {
    message: "「 OMG WoW 😳 」",
    file: "omg.mp3",
    url: "https://files.catbox.moe/0q5jru.mp3"
  }
};

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

module.exports = {
  config: {
    name: "audio",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 0,
    shortDescription: "Trigger mp3 by keywords",
    longDescription: "Send specific audio when user types predefined word",
    category: "no prefix"
  },
  onStart: async () => {},

  onChat: async function ({ event, message }) {
    if (!event.body) return;
    const keyword = event.body.toLowerCase().trim();
    if (!(keyword in audioList)) return;

    const { message: text, file, url } = audioList[keyword];
    const filePath = path.join(cacheDir, file);

    if (!fs.existsSync(filePath)) {
      try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(response.data));
      } catch (err) {
        return message.reply("❌ File download failed: " + keyword);
      }
    }

    return message.reply({
      body: text,
      attachment: fs.createReadStream(filePath)
    });
  }
};
