const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "condom",
    aliases: ["condom"],
    version: "1.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Banglish: Bondhuder nia moja koro with condom fail DP 😆",
    longDescription: "Banglish: Tag kora bondhur face ekta condom fail image-e boshe debe moja korar jonno.",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return message.reply("😑 Tag diye ekjon ke mention korte hobe!");
    }

    const uid = mention[0];

    try {
      const outputPath = await createImage(uid);
      await message.reply({
        body: "😆 Ops! Condom Fail Face Fusion Ready!",
        attachment: fs.createReadStream(outputPath)
      });

      // Auto delete file after send
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error("❌ Error in condom command:", err);
      return message.reply("❌ DP banate somossa hoise. Try again later.");
    }
  }
};

async function createImage(uid) {
  const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const [avatar, background] = await Promise.all([
    jimp.read(avatarUrl),
    jimp.read("https://i.imgur.com/cLEixM0.jpg") // condom meme background
  ]);

  background.resize(512, 512);
  avatar.resize(263, 263);
  background.composite(avatar, 256, 258);

  const outputPath = path.join(__dirname, `condom_${uid}_${Date.now()}.png`);
  await background.writeAsync(outputPath);
  return outputPath;
}
