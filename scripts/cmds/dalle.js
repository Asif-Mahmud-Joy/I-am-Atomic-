const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dalle",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    countDown: 0,
    longDescription: {
      en: "Generate unique and captivating images using DALL-E (via public API)"
    },
    category: "ai",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) {
      message.reply("⚠️ Prompt dao bhai! Egulo chara to image generate hobe na.");
      return;
    }

    message.reply("🧠 AI image generate hocche... 1-2 sec wait koro ⏳");

    try {
      const res = await axios.get(`https://api.azzureapi.com/api/dalle?prompt=${encodeURIComponent(prompt)}`);
      const data = res.data;

      if (!data || !data.url) {
        message.reply("❌ Image generate korte problem hoise. Prompt bhalo kore dao.");
        return;
      }

      const imgResponse = await axios.get(data.url, { responseType: 'stream' });
      message.reply({
        body: `✅ AI Image Ready!\nPrompt: ${prompt}`,
        attachment: imgResponse.data
      });

    } catch (err) {
      console.error(err);
      message.reply("😓 Error: Image generate kora gelo na. Try again later.");
    }
  }
};
