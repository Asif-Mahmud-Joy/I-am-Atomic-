const axios = require("axios");

module.exports = {
  config: {
    name: "calculate",
    version: "3.0", // ✅ Upgraded with API fallback
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    cooldown: 5,
    shortDescription: {
      en: "Calculate math expressions",
      bn: "গাণিতিক হিসাব করুন"
    },
    category: "utility",
    guide: {
      en: "{pn} <expression>",
      bn: "{pn} <গাণিতিক হিসাব>"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const expression = args.join(" ");

    if (!expression) {
      return message.reply(
        "📌 Please provide an expression to calculate.\nExample: calculate 5 * (3 + 2)"
      );
    }

    try {
      const res = await axios.get(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`);
      return message.reply(`✅ Result of \`${expression}\` is: ${res.data}`);
    } catch (error) {
      console.error("❌ API Error:", error);
      return message.reply("❌ Invalid expression or failed to fetch result. Please check your syntax.");
    }
  }
};
