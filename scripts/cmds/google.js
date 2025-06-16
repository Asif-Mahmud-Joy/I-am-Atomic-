const axios = require('axios');

module.exports = {
  config: {
    name: "google",
    aliases: ["search", "g"],
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: {
      en: "Search Google for a given query."
    },
    longDescription: {
      en: "Search Google for a given query and return the top 5 results."
    },
    category: "utility",
    guide: {
      en: "{pn} <query>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
      return api.sendMessage("🔍 Please provide a search query.", event.threadID);
    }

    try {
      // ✅ Public Google search proxy API (real-world working)
      const response = await axios.get(`https://ddg-api.herokuapp.com/search?q=${encodeURIComponent(query)}`);
      const results = response.data.results;

      if (!results || results.length === 0) {
        return api.sendMessage("❌ Kono result pawa jai nai.", event.threadID);
      }

      const topResults = results.slice(0, 5);
      let message = `🔎 Top 5 Google results for: "${query}"\n\n`;

      topResults.forEach((result, i) => {
        message += `${i + 1}. ${result.title}\n${result.url}\n\n`;
      });

      return api.sendMessage(message.trim(), event.threadID);
    } catch (err) {
      console.error("[google command error]", err);
      return api.sendMessage("⚠️ Somossa hoise search korar somoy. Try again porer bar.", event.threadID);
    }
  }
};
