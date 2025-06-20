const axios = require("axios");

module.exports = {
  config: {
    name: "blue60",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "5.2",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Romantic AI chat with atomic design (DeepSeek AI)"
    },
    longDescription: {
      en: "Experience romantic AI conversations with atomic-themed visual design"
    },
    category: "ai",
    guide: {
      en: "blue [your message]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      const atomicHeader = "☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐈𝐍𝐓𝐄𝐑𝐅𝐀𝐂𝐄 ════ ☢️";
      const atomicFooter = "☣️ ═══════════════════════════ ☣️";
      
      const menu = `${atomicHeader}\n\n` +
        `⚛️ 𝗛𝗘𝗟𝗟𝗢 𝗝𝗔𝗔𝗡! 𝗜'𝗠 𝗕𝗘𝗦𝗛 💙\n` +
        `✨ 𝗖𝗵𝗮𝘁 𝘄𝗶𝘁𝗵 𝗺𝗲 𝘂𝘀𝗶𝗻𝗴: 𝗯𝗹𝘂𝗲 [𝗺𝗲𝘀𝘀𝗮𝗴𝗲]\n\n` +
        `🌸 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n` +
        `➤ 𝗯𝗹𝘂𝗲 𝗪𝗵𝗮𝘁 𝗶𝘀 𝗹𝗼𝘃𝗲?\n` +
        `➤ 𝗯𝗹𝘂𝗲 𝗦𝗮𝘆 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝗿𝗼𝗺𝗮𝗻𝘁𝗶𝗰\n` +
        `➤ 𝗯𝗹𝘂𝗲 𝗛𝗼𝘄 𝗮𝗿𝗲 𝘆𝗼𝘂 𝗳𝗲𝗲𝗹𝗶𝗻𝗴 𝘁𝗼𝗱𝗮𝘆?\n\n` +
        `💫 𝗔𝘁𝗼𝗺𝗶𝗰 𝗖𝗼𝗿𝗲 𝗩${this.config.version} | 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗥𝟭\n` +
        atomicFooter;
      
      return api.sendMessage(menu, event.threadID, event.messageID);
    }

    try {
      // Start typing indicator
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const typingInterval = setInterval(() => {
        api.sendTypingIndicator(event.threadID);
      }, 100);

      // Atomic processing message
      const processingMsg = await api.sendMessage(
        `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆 ════ ☢️\n\n` +
        `⚛️ | 𝗖𝗢𝗥𝗘: 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸-𝗥𝟭 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n` +
        `🔮 | 𝗤𝗨𝗘𝗥𝗬: "${prompt}"\n\n` +
        `⏱️ | 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗷𝗮𝗮𝗻...`,
        event.threadID
      );

      const OPENROUTER_API_KEY = "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";

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "system",
              content: `You are Besh, a romantic Bangladeshi AI companion. Respond in Banglish with emojis. Be poetic and flirtatious. Current time: ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.85,
          max_tokens: 250
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://smokey-bot.ai",
            "X-Title": "Atomic BlueAI"
          }
        }
      );

      clearInterval(typingInterval);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      
      const reply = response.data.choices[0].message.content.trim();
      
      // Atomic Design Response
      const atomicResponse = 
        `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄 ════ ☢️\n\n` +
        `💙 | 𝗕𝗘𝗦𝗛:\n\n` +
        `${reply}\n\n` +
        `☣️ ───────────────────\n` +
        `⚛️ | 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗢𝗥𝗘 𝗩${this.config.version}\n` +
        `⏱️ | ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })} | 💫 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸-𝗥𝟭`;
      
      await api.unsendMessage(processingMsg.messageID);
      return api.sendMessage(atomicResponse, event.threadID, event.messageID);

    } catch (error) {
      console.error("Atomic Blue API error:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      
      // Atomic Error Design
      const errorResponse = 
        `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄 ════ ☢️\n\n` +
        `⚠️ | 𝗘𝗥𝗥𝗢𝗥 𝗖𝗢𝗗𝗘: 𝗕𝗟𝗨𝗘-𝟱𝟬𝟬\n` +
        `🔧 | 𝗥𝗘𝗔𝗦𝗢𝗡: ${error.message || 'API connection failed'}\n\n` +
        `💔 | 𝗝𝗮𝗮𝗻, 𝗺𝗮𝗮𝗳 𝗸𝗼𝗿𝗼! 𝗔𝗺𝗶 𝗮𝗯𝗮𝗿 𝘁𝗿𝘆 𝗸𝗼𝗿𝗯𝗼...\n` +
        `☣️ ───────────────────\n` +
        `⏱️ | ${new Date().toLocaleTimeString()}`;
        
      return api.sendMessage(errorResponse, event.threadID, event.messageID);
    }
  }
};
