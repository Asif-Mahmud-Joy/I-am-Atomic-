const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "emojimix",
    version: "2.2",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      bn: "2 ta emoji mix koro",
      en: "Mix 2 emoji together"
    },
    guide: {
      bn: "   {pn} <emoji1> <emoji2>\n   উদাহরণ:  {pn} 🤣 🥰",
      en: "   {pn} <emoji1> <emoji2>\n   Example:  {pn} 🤣 🥰"
    },
    category: "fun"
  },

  langs: {
    bn: {
      error: "দুঃখিত, emoji %1 এবং %2 mix করা যায়নি",
      success: "Emoji %1 এবং %2 mix করে %3 টা ছবি পাওয়া গেছে"
    },
    en: {
      error: "Sorry, emoji %1 and %2 can't mix",
      success: "Emoji %1 and %2 mix %3 images"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2) return message.SyntaxError();

    const results = await Promise.all([
      fetchEmojiMix(emoji1, emoji2),
      fetchEmojiMix(emoji2, emoji1)
    ]);

    const validImages = results.filter(item => item !== null);

    if (validImages.length === 0) {
      return message.reply(getLang("error", emoji1, emoji2));
    }

    message.reply({
      body: getLang("success", emoji1, emoji2, validImages.length),
      attachment: validImages
    });
  }
};

async function fetchEmojiMix(emoji1, emoji2) {
  try {
    const encoded1 = encodeURIComponent(emoji1);
    const encoded2 = encodeURIComponent(emoji2);

    const apiUrl = `https://emojimix-api1.vercel.app/mix?emoji1=${encoded1}&emoji2=${encoded2}`;
    const response = await axios.get(apiUrl, { responseType: "stream" });

    const filePath = path.join(__dirname, `cache_emojimix_${Date.now()}.png`);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const readStream = fs.createReadStream(filePath);
    readStream.path = filePath;
    return readStream;
  } catch (error) {
    return null;
  }
}
