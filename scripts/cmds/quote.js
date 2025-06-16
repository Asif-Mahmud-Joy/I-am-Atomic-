const axios = require('axios');

module.exports = {
  config: {
    name: "quote",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    version: "2.1",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Get a random quote from a specific category",
      bn: "একটি নির্দিষ্ট বিভাগের এলোমেলো কোটস নিন",
    },
    guide: {
      en: "{pn} [category]\nAvailable: age, alone, art, attitude, beauty, best, birthday, business, car, change, courage, dad, death, dream, education, experience, failure, faith, family, famous, fear, fitness, etc.",
      bn: "{pn} [বিভাগ] উদাহরণ: age, art, death, family, faith...",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage(
          "📝 Category dao bhai. Example: age, alone, art, beauty, courage, death, family, faith, fear, dream, etc.",
          event.threadID
        );
      }

      const category = args[0].toLowerCase();
      const response = await axios.get(
        `https://zenquotes.io/api/quotes` // ✅ FREE PUBLIC API (doesn't need key)
      );

      if (!response.data || !Array.isArray(response.data)) {
        return api.sendMessage(
          "⚠️ Sorry, quote pai nai. Try again later.",
          event.threadID
        );
      }

      const randomQuote = response.data[Math.floor(Math.random() * response.data.length)];
      const quoteText = randomQuote.q;
      const quoteAuthor = randomQuote.a || "Unknown";

      const finalMessage = `🧠 ${quoteText}\n\n— ✍️ ${quoteAuthor}`;

      return api.sendMessage(finalMessage, event.threadID);
    } catch (error) {
      console.error("[QUOTE ERROR]", error);
      return api.sendMessage(
        "❌ Quote anar somoy somossa hoise. Pore abar try koro.",
        event.threadID
      );
    }
  },
};
