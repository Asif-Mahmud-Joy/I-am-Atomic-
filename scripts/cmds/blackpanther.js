const axios = require('axios');
const fs = require('fs-extra');
const request = require('request');

module.exports = {
  config: {
    name: "blackpanther",
    aliases: ["blackpanther"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Write something on Black Panther meme template",
    longDescription: "Generate a Black Panther meme image with two lines of custom text",
    category: "write",
    guide: {
      en: "{pn} text1 | text2",
      bn: "{pn} লেখাটি১ | লেখাটি২"
    }
  },

  langs: {
    en: {
      missingInput: "Please enter text in the correct format: text1 | text2",
      errorAPI: "Failed to generate meme. Please try again later."
    },
    bn: {
      missingInput: "দয়া করে সঠিক ফরম্যাটে লিখুন: লেখাটি১ | লেখাটি২",
      errorAPI: "মেমে তৈরি করা যায়নি। অনুগ্রহ করে পরে চেষ্টা করুন।"
    }
  },

  onStart: async function ({ message, args, api, event, getLang }) {
    const input = args.join(" ");
    if (!input.includes("|")) return message.reply(getLang("missingInput"));

    const [text1, text2] = input.split("|").map(t => t.trim());

    if (!text1 || !text2) return message.reply(getLang("missingInput"));

    const outputPath = __dirname + "/cache/blackpanther.png";
    const imageURL = `https://api.memegen.link/images/wddth/${encodeURIComponent(text1)}/${encodeURIComponent(text2)}.png`;

    try {
      request(encodeURI(imageURL))
        .pipe(fs.createWriteStream(outputPath))
        .on('close', () => {
          api.sendMessage({
            body: `🖼️ Here's your Black Panther meme:`,
            attachment: fs.createReadStream(outputPath)
          }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
        });
    } catch (e) {
      console.error(e);
      message.reply(getLang("errorAPI"));
    }
  }
};
