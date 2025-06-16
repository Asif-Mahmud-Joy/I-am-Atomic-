const axios = require("axios");

module.exports = {
  config: {
    name: "aninews",
    aliases: ["animenews", "malnews"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Latest anime news from MAL"
    },
    longDescription: {
      en: "Gets the latest anime news headlines directly from MyAnimeList (via rapidapi proxy)."
    },
    category: "anime",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const { data } = await axios.get("https://api.jikan.moe/v4/news/anime", {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!data || !data.data || data.data.length === 0) {
        return api.sendMessage("😞 Kono anime news pawa jaini ekhon. Try again poroborti te!", event.threadID);
      }

      const newsList = data.data.slice(0, 5);
      let msg = "📰 TOP 5 LATEST ANIME NEWS (MAL based):\n\n";

      newsList.forEach((news, i) => {
        msg += `🔹 ${i + 1}. ${news.title}\n➡️ ${news.url}\n\n`;
      });

      return api.sendMessage(msg.trim(), event.threadID);
    } catch (err) {
      console.error("Anime News Error:", err.message);
      return api.sendMessage("❌ Kisu ekta problem hoise news niya. Porer try e abar chesta koro.", event.threadID);
    }
  }
};
