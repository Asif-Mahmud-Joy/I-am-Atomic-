const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "love",
    aliases: ["love2love"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: "💘 Tag kore love photo banao",
    longDescription: "FB profile photo diya ekta love dp toiri hoy",
    category: "photo",
    guide: "{pn} @user",
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    const senderID = event.senderID;

    if (mention.length == 0) {
      return message.reply("💚Apni jar sathe love dp banate chan take mention korun ✅");
    }

    const uid1 = senderID;
    const uid2 = mention[0];

    try {
      const imgPath = await createLoveImage(uid1, uid2);
      return message.reply({
        body: "💔 ইগো আর ভালোবাসার যুদ্ধে হেরে যায় ভালোবাসাই 🥀",
        attachment: fs.createReadStream(imgPath),
      });
    } catch (err) {
      console.error("Image create error:", err);
      return message.reply("😥 Image toiri korte somossa hocche. Pore try korun!");
    }
  },
};

async function createLoveImage(uid1, uid2) {
  const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
  const getAvatar = async (uid) => {
    try {
      const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${accessToken}`;
      return await jimp.read(url);
    } catch (err) {
      console.warn(`FB avatar load fail for UID ${uid}. Using placeholder.`);
      return await jimp.read("https://i.imgur.com/3z4u1fV.png"); // fallback avatar
    }
  };

  const av1 = await getAvatar(uid1);
  const av2 = await getAvatar(uid2);

  av1.circle();
  av2.circle();

  const template = await jimp.read("https://i.imgur.com/LjpG3CW.jpeg"); // love bg
  template.resize(1440, 1080)
    .composite(av1.resize(470, 470), 125, 210)
    .composite(av2.resize(470, 470), 800, 200);

  const outputPath = __dirname + "/love_output.png";
  await template.writeAsync(outputPath);
  return outputPath;
}
