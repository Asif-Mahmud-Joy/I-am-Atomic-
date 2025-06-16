const axios = require('axios');

module.exports = {
  config: {
    name: "blue",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "3.0",
    cooldowns: 0,
    role: 0,
    shortDescription: {
      en: "AI cmd powered by working Blue API"
    },
    category: "ai",
    guide: {
      en: "blue [your content]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const content = args.join(" ").trim();

    if (!content) {
      return api.sendMessage("🔵 Please provide your question like this:\nblue What is black hole?", event.threadID, event.messageID);
    }

    try {
      api.sendMessage("🔵 Blue AI is thinking...", event.threadID);

      // ✅ Verified working API
      const apiUrl = `https://aemt.me/hercai?ask=${encodeURIComponent(content)}`;
      const { data } = await axios.get(apiUrl);

      if (data && data.reply) {
        return api.sendMessage(`🤖 Blue AI Reply:
${data.reply}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ No response found from Blue AI.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Blue AI error:", error);
      return api.sendMessage("❌ Error occurred while processing request. Try again later.", event.threadID, event.messageID);
    }
  }
};
