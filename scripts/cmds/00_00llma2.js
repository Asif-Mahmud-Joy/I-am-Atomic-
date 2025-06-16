const axios = require('axios');

module.exports = {
  config: {
    name: "llma2",
    version: "3.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "member",
    shortDescription: {
      en: "Generate text using LLaMA2 AI"
    },
    longDescription: {
      en: "Use this command to generate smart answers using LLaMA2 AI model."
    },
    guide: {
      en: "{pn} your prompt"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { messageID, messageReply } = event;
      let prompt = args.join(' ');

      if (messageReply && messageReply.body) {
        prompt = `${messageReply.body} ${prompt}`.trim();
      }

      if (!prompt) {
        return api.sendMessage(
          '🔎 Please provide a prompt to generate text.\n\n🧠 Example: llama What is the Kardashev scale?',
          event.threadID,
          messageID
        );
      }

      // ✅ Live public LLaMA2 API
      const apiUrl = `https://aura-ai.vercel.app/llama?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl);
      const result = res.data.response;

      if (!result) {
        return api.sendMessage("❌ API didn't return any response.", event.threadID, messageID);
      }

      api.sendMessage(result, event.threadID, messageID);
    } catch (err) {
      console.error('🔥 LLaMA2 Error:', err);
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
