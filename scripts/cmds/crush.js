const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "crush",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "crush gift",
    longDescription: "Make a wholesome crush-style image with your tagged person",
    category: "love",
    guide: "{pn} @crush"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0 && !event.messageReply) {
      return message.reply("🩷 Kar keu ke tag dao, na hole reply dao!");
    }

    const uid = mention[0] || (event.messageReply && event.messageReply.senderID);

    try {
      const apiUrl = `https://some-random-api.com/canvas/hug?avatar=https://graph.facebook.com/${uid}/picture?width=512&height=512`;
      const path = `${__dirname}/tmp/crush.png`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(`${__dirname}/tmp`);
      await fs.writeFile(path, Buffer.from(response.data, "utf-8"));

      const body = `🥰 Crush Moment with <@${uid}> 🩷`;
      message.reply({ body, attachment: fs.createReadStream(path) }, () => fs.unlinkSync(path));
    } catch (err) {
      console.error("❌ Error:", err);
      message.reply("😔 Kisu ekta problem hoise, abar try koro.");
    }
  }
};
