const axios = require("axios");

module.exports = {
  config: {
    name: "smokey2",
    version: "2.0", // ✅ Updated version
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "Reply on 'smokey' keyword with bot & owner info",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      const trigger = event.body?.toLowerCase().trim();
      if (trigger === "smokey") {
        const videoUrl = "https://files.catbox.moe/qptlr8.mp4";
        const response = await axios.get(videoUrl, { responseType: 'stream' });

        return message.reply({
          body: `──────────◊\n‣ 𝐁𝐨𝐭 & 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n\n‣ 𝐍𝐚𝐦𝐞: 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝\n‣ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: 🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 `,
          attachment: response.data
        });
      }
    } catch (err) {
      console.error("❌ Error in 'smokey' command:", err);
      return message.reply("⚠️ Sorry, kichu ekta vul hoise. Try again pore.");
    }
  }
};
