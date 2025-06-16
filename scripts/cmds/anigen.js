const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "anigen",
    aliases: ["animegen"],
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Generate anime-style image from prompt"
    },
    longDescription: {
      en: "Bot will generate a high-quality anime image based on your given prompt."
    },
    category: "MEDIA",
    guide: {
      en: "{pn} <your anime prompt>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const path = __dirname + "/cache/anime.png";
    const tid = event.threadID;
    const mid = event.messageID;

    if (!args[0]) {
      return api.sendMessage("📌 Prompt lagbe bhai! 😅\nUsage: /anigen <prompt>", tid, mid);
    }

    const userPrompt = args.join(" ");
    const encodedPrompt = encodeURIComponent(userPrompt);

    try {
      api.sendMessage("🎨 Generating your anime image, ektu wait...", tid, mid);

      // ✅ Updated API (trusted + working)
      const apiUrl = `https://nekobot.xyz/api/imagegen?type=aiart&text=${encodedPrompt}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.message) {
        return api.sendMessage("❌ Image generate korte parlam na. Try different prompt.", tid, mid);
      }

      const imageUrl = response.data.message;
      const imageStream = (await axios.get(imageUrl, { responseType: 'stream' })).data;

      imageStream.pipe(fs.createWriteStream(path)).on("finish", () => {
        api.sendMessage({ attachment: fs.createReadStream(path) }, tid, () => fs.unlinkSync(path), mid);
      });
    } catch (err) {
      console.error("Error in anigen:", err);
      api.sendMessage("😓 Internal error hoye gese. Please try again later.", tid, mid);
    }
  }
};
