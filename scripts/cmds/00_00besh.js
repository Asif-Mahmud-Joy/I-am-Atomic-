const axios = require("axios");
const typingInterval = 85; // Typing speed in ms

module.exports = {
  config: {
    name: "besh24",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "5.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Chat with Besh using OpenAI",
    longDescription: "Chat with your gossip bestie Besh powered by OpenAI!",
    category: "ai",
    guide: "{p}besh24 <your text>"
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    const lang = /[^\x00-\x7F]/.test(input) ? "bn" : "en";

    if (!input || input.length < 2) {
      const lines = [
        "oii-🥺🥹-ek🥄 chamoch bhalobasha diba-🤏🏻🙂",
        "janu-😇💕-ekta chumu debe-💋🥰",
        "babu-🌙✨-rater shopne dekha dibe-😴💖",
        "jaan-🌹🥰-ek fota hasi pathabe-😊✉️",
        "tumi-🌟😌-amar bhalobashar karon-🥰🎶",
        "love-😍🔥-tumi chhara nishash ta theme jai-😮‍💨💖",
        "love-❤️🥺-chokhe chokh rakhle hariye jabo-😍🌟",
        "😌-ami shudhu tomar kotha vabbo-💭🌟"
      ];
      const resp = lines[Math.floor(Math.random() * lines.length)];
      return api.sendMessage(resp, event.threadID, event.messageID);
    }

    try {
      // Show typing animation
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      const typing = setInterval(() => {
        api.sendTypingIndicator(event.threadID);
      }, typingInterval);

      // Atomic Design Header
      const atomicHeader = "☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️";
      const atomicFooter = "☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️";
      
      // Processing message with atomic design
      const processingMsg = await api.sendMessage(
        `${atomicHeader}\n\n⚛️ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐂𝐎𝐑𝐄 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆...\n🔮 | 𝐐𝐔𝐄𝐑𝐘: ${input}\n\n${atomicFooter}`,
        event.threadID
      );

      // API call
      const completion = await axios.post(
        "https://openai.angfuzsoft.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: `You're Besh - a flirty Bangladeshi gossip bestie. Respond in Banglish with emojis. Be playful and dramatic! Current time: ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`
            },
            { role: "user", content: input }
          ],
          max_tokens: 150,
          temperature: 0.85,
          presence_penalty: 0.5,
          frequency_penalty: 0.5
        }
      );

      clearInterval(typing);
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      
      const reply = completion.data.choices[0].message.content;
      
      // Atomic Design Response
      const atomicResponse = 
        `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄 ════ ☢️\n\n` +
        `💫 | 𝐁𝐄𝐒𝐇: ${reply}\n\n` +
        `☣️ ────────────────\n` +
        `⚡ | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐓𝐎𝐌𝐈𝐂 𝐂𝐎𝐑𝐄 𝐕𝟓.𝟎\n` +
        `🌐 | 𝐒𝐓𝐀𝐓𝐔𝐒: 𝟐𝟎𝟎 𝐎𝐊 | ⏱️ ${new Date().toLocaleTimeString()}`;
      
      await api.unsendMessage(processingMsg.messageID);
      return api.sendMessage(atomicResponse, event.threadID, event.messageID);
      
    } catch (err) {
      console.error("🛑 API error:", err);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      
      // Atomic Error Design
      const errorResponse = 
        `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄 ════ ☢️\n\n` +
        `⚠️ | 𝐄𝐑𝐑𝐎𝐑 𝐂𝐎𝐃𝐄: 𝐁𝐄𝐒𝐇-𝟓𝟎𝟎\n` +
        `🔧 | 𝐑𝐄𝐀𝐒𝐎𝐍: ${err.message || 'API connection failed'}\n` +
        `🛠️ | 𝐒𝐎𝐋𝐔𝐓𝐈𝐎𝐍: Please try again later\n\n` +
        `☣️ ────────────────\n` +
        `⏰ | 𝐓𝐈𝐌𝐄𝐒𝐓𝐀𝐌𝐏: ${new Date().toLocaleString()}`;
        
      return api.sendMessage(errorResponse, event.threadID, event.messageID);
    }
  }
};
