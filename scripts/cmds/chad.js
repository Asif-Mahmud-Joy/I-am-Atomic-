const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "chad",
    aliases: ["gigachad", "chadface"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Create giga chad image with 2 faces",
    longDescription: "Generate a Giga Chad image using 2 profile pictures",
    category: "image",
    guide: {
      en: "{pn} @user1 @user2"
    }
  },

  onStart: async function ({ message, event }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length < 1) return message.reply("⚠️ Please tag at least one person.");

    const id1 = mentions.length === 1 ? event.senderID : mentions[0];
    const id2 = mentions.length === 1 ? mentions[0] : mentions[1];

    try {
      const imgPath = await generateChadImage(id1, id2);
      await message.reply({ body: "💪 Here's your Giga Chad transformation!", attachment: fs.createReadStream(imgPath) });
      fs.unlinkSync(imgPath);
    } catch (err) {
      console.error("[CHAD ERROR]", err);
      message.reply("❌ Something went wrong while generating image.");
    }
  }
};

async function generateChadImage(id1, id2) {
  const avatar1 = await jimp.read(`https://graph.facebook.com/${id1}/picture?width=512&height=512`);
  const avatar2 = await jimp.read(`https://graph.facebook.com/${id2}/picture?width=512&height=512`);
  avatar1.circle();
  avatar2.circle();

  const bg = await jimp.read("https://i.postimg.cc/5y4vNVG9/desktop-wallpaper-giga-chad-ideas-chad-memes-muscle-men-thumbnail.jpg");
  bg.resize(1080, 1350);

  const pos1 = { x: 120, y: 150 };
  const pos2 = { x: 650, y: 170 };

  bg.composite(avatar1.resize(300, 300), pos1.x, pos1.y);
  bg.composite(avatar2.resize(300, 300), pos2.x, pos2.y);

  const outputPath = path.join(__dirname, `chad_${Date.now()}.png`);
  await bg.writeAsync(outputPath);
  return outputPath;
}
