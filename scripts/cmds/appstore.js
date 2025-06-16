const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "appstore",
    version: "2.1",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      en: "Search for apps on the Apple App Store"
    },
    category: "software",
    guide: {
      en: "{pn} <app name>\nExample: {pn} TikTok"
    },
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    en: {
      missingKeyword: "❌ You haven’t entered any keyword.",
      noResult: "❌ No results found for: %1"
    }
  },

  onStart: async function ({ message, args, commandName, envCommands, getLang }) {
    if (!args[0]) return message.reply(getLang("missingKeyword"));

    const searchTerm = args.join(" ");
    const limit = envCommands[commandName]?.limitResult || 3;

    try {
      const response = await axios.get("https://itunes.apple.com/search", {
        params: {
          term: searchTerm,
          country: "US",
          entity: "software",
          limit
        }
      });

      const results = response.data.results;

      if (!results || results.length === 0) {
        return message.reply(getLang("noResult", searchTerm));
      }

      let replyMessage = "";
      const attachments = [];

      for (const app of results) {
        const rating = app.averageUserRating ? `${"🌟".repeat(Math.round(app.averageUserRating))} (${app.averageUserRating.toFixed(1)}/5)` : "No Rating";
        replyMessage += `\n\n🔹 ${app.trackCensoredName}\n👨‍💻 Developer: ${app.artistName}\n💵 Price: ${app.formattedPrice || "Free"}\n⭐ Rating: ${rating}\n🔗 ${app.trackViewUrl}`;
        attachments.push(await getStreamFromURL(app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60));
      }

      message.reply({
        body: replyMessage,
        attachment: attachments
      });

    } catch (error) {
      console.error("Appstore Search Error:", error);
      return message.reply(getLang("noResult", searchTerm));
    }
  }
};
