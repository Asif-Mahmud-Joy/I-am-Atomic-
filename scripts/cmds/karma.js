const axios = require('axios');

module.exports = {
  config: {
    name: "karma",
    author: "Mr.Smokey [Asif Mahmud]",
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Get a karma quote",
      bn: "একটা কার্মা উক্তি নিন"
    },
    longDescription: {
      en: "Get a random karma quote",
      bn: "একটা র‍্যান্ডম কার্মা উক্তি দেখাবে"
    },
    category: "fun",
    guide: {
      en: "{p}{n}",
      bn: "{p}{n}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get('https://karmaquotes.onrender.com/quotes');
      const karmaQuotes = response.data;

      if (!Array.isArray(karmaQuotes) || karmaQuotes.length === 0) {
        return api.sendMessage('❌ কোনো কার্মা উক্তি খুঁজে পাওয়া যায়নি। একটু পর চেষ্টা করুন।', event.threadID, event.messageID);
      }

      const randomQuote = karmaQuotes[Math.floor(Math.random() * karmaQuotes.length)].quote || "Karma is real.";

      const msg = `💬 𝗞𝗔𝗥𝗠𝗔 𝗤𝗨𝗢𝗧𝗘:

➩ ${randomQuote}`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.error("Karma command error:", error);
      return api.sendMessage('❌ কার্মা উক্তি আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।', event.threadID, event.messageID);
    }
  }
};
