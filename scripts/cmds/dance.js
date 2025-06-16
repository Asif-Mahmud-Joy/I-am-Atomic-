const axios = require('axios');

module.exports = {
  config: {
    name: "dance",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "💃 Anime dance gif/video",
    longDescription: "Sends a random anime dance gif or short video.",
    category: "anime",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const BASE_URL = `https://api.waifu.pics/sfw/dance`; // ✅ Working API
    try {
      const res = await axios.get(BASE_URL);
      const dance = res.data.url;

      if (!dance) return message.reply("❌ No dance found. Try again later.");

      const form = {
        body: `🕺 *Let's Dance!* 💃`,
        attachment: await global.utils.getStreamFromURL(dance)
      };

      message.reply(form);
    } catch (err) {
      console.error("[DANCE CMD ERROR]", err);
      message.reply("❌ Error fetching dance. Try again later.");
    }
  }
};
