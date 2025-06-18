const axios = require("axios");

module.exports = {
  config: {
    name: "blue60",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "5.2",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Romantic AI chat with typing effect (OpenRouter DeepSeek AI)"
    },
    category: "ai",
    guide: {
      en: "blue [your message]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage("💙 Bolo jaan, ki jante chao? (e.g. blue What is love?)", event.threadID, event.messageID);
    }

    try {
      const typingInterval = setInterval(() => {
        api.sendTypingIndicator(event.threadID);
      }, 1000);

      const OPENROUTER_API_KEY = "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";

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: "You are Besh, a romantic and playful Bangladeshi friend. Use emojis and Banglish to flirt a little and sound charming."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://smokey-bot.ai",
            "X-Title": "BlueAI by Smokey"
          }
        }
      );

      clearInterval(typingInterval);

      const reply = response.data.choices[0].message.content.trim();
      const decorated = `💘 Besh er uttor:

${reply}

🌸 Tumake niyei amar moner golpo chilo jaan!`;

      return api.sendMessage(decorated, event.threadID, event.messageID);

    } catch (error) {
      console.error("Blue OpenRouter API error:", error);
      return api.sendMessage("❌ Oops jaan, kichu ekta vul hoise. Pore abar try koro na please! 😢", event.threadID, event.messageID);
    }
  }
};
