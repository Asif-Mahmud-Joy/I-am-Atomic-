const axios = require('axios');

module.exports = {
  config: {
    name: "gojo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "3.0",
    cooldowns: 0,
    role: 0,
    shortDescription: {
      en: "Talk to GOJO AI (blindfolded sorcerer style)"
    },
    category: "AI",
    guide: {
      en: "{pn} your-message\nExample: {pn} hello, who are you?"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(' ');
    const userID = event.senderID;
    const apiUrl = "https://gojo-api-mirror.onrender.com";

    function sendMessage(msg) {
      api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (!prompt) {
      return sendMessage("❌ Input nai!\nUse korar jonno example: `gojo tumi ke?`\n\nReset korte chaile: `gojo clear`");
    }

    sendMessage("🔄 Gojo AI processing... Wait koren!");

    try {
      const res = await axios.get(`${apiUrl}/gojo_gpt`, {
        params: {
          prompt,
          idd: userID
        }
      });

      if (!res.data || !res.data.gojo) {
        return sendMessage("❌ Gojo kichu bollo na. Try again porer somoy.");
      }

      sendMessage(`👁️‍🗨️ Gojo:
${res.data.gojo}`);
    } catch (error) {
      console.error("Gojo API Error:", error);
      sendMessage("⚠️ Somossa hoise. Gojo ekhono Infinity domain e atka ache.");
    }
  }
};
