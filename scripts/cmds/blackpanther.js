const axios = require('axios');
const fs = require('fs-extra');
const request = require('request');

module.exports = {
  config: {
    name: "blackpanther",
    aliases: ["bpanther", "wakanda"],
    version: "3.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "⚡ Generate Black Panther memes with atomic style"
    },
    longDescription: {
      en: "⚡ Create stunning Black Panther memes with custom text and atomic design"
    },
    category: "entertainment",
    guide: {
      en: "{pn} <text1> | <text2>"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    try {
      // Start typing animation
      api.sendTyping(event.threadID);
      
      const input = args.join(" ");
      if (!input.includes("|")) {
        const formatMessage = `☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗥𝗠𝗔𝗧 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ Please use: ${this.config.guide.en.replace("{pn}", this.config.name)}\n▸ Example: ${this.config.name} WAKANDA | FOREVER`;
        return message.reply(formatMessage);
      }

      const [text1, text2] = input.split("|").map(t => t.trim());
      if (!text1 || !text2) {
        return message.reply("⚠️ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗜𝗡𝗣𝗨𝗧\n\n▸ Both text fields must contain content");
      }

      // Simulate processing animation
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const outputPath = __dirname + "/cache/atomic_bpanther.png";
      const imageURL = `https://api.memegen.link/images/wddth/${encodeURIComponent(text1)}/${encodeURIComponent(text2)}.png?font=impact&background=https://i.imgur.com/7bDfYjK.png`;

      const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, Buffer.from(response.data, 'binary'));

      // Success reaction and message
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      
      const successMessage = 
        `⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗟𝗔𝗖𝗞 𝗣𝗔𝗡𝗧𝗛𝗘𝗥 𝗠𝗘𝗠𝗘\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `▸ 𝗧𝗲𝘅𝘁 𝟭: 「${text1}」\n` +
        `▸ 𝗧𝗲𝘅𝘁 𝟮: 「${text2}」\n\n` +
        `☣️ Successfully generated with atomic precision!`;
      
      message.reply({
        body: successMessage,
        attachment: fs.createReadStream(outputPath)
      }, () => fs.unlinkSync(outputPath));

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to generate meme. Please try again later.");
    }
  }
};
