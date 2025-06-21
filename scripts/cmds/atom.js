const axios = require('axios');

// ☣️ ATOMIC API KEYS ⚛️
const OPENROUTER_KEY = "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";
const HF_IMAGE_KEY = "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";

// ⚙️ SYSTEM CONFIGURATION
const MAX_TOKENS = 500;
const MAX_HISTORY = 5;
const IMAGE_COUNT = 4;

// 💾 MEMORY MANAGEMENT
if (!global.temp.atomChat) global.temp.atomChat = {
  sessions: {},
  history: {}
};

module.exports = {
  config: {
    name: "atom",
    aliases: ["atomicgpt", "nuclearchat"],
    version: "3.0",
    author: "☢️ ATOMIC ASIF ⚛️",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Nuclear-powered AI assistant",
    longDescription: "🔬 Advanced AI with atomic knowledge and creative capabilities",
    category: "ai",
    guide: {
      en: "▸ {pn} <query> - Chat with atomic AI\n▸ {pn} draw <prompt> - Generate quantum art\n▸ {pn} clear - Reset memory core"
    }
  },

  langs: {
    en: {
      processing: "⚛️ ACTIVATING NEURAL MATRIX...",
      thinking: "🔭 PROCESSING QUANTUM THOUGHTS...",
      drawing: "🎨 GENERATING ATOMIC ART...",
      cleared: "♻️ MEMORY CORE PURGED",
      error: "☢️ QUANTUM ENTANGLEMENT FAILURE:\n%1"
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    const { atomChat } = global.temp;
    const userId = event.senderID;
    const command = args[0]?.toLowerCase();

    // 🖼️ IMAGE GENERATION MODE
    if (["draw", "img", "image"].includes(command)) {
      if (!args[1]) return message.reply("⚡ Please provide an art prompt");
      if (atomChat.sessions[userId]) return message.reply("⏳ Quantum processor busy");

      atomChat.sessions[userId] = true;
      const processingMsg = await message.reply(getLang('drawing'));

      try {
        const artPrompt = args.slice(1).join(" ");
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/prompthero/openjourney",
          { inputs: artPrompt },
          {
            headers: { Authorization: `Bearer ${HF_IMAGE_KEY}` },
            responseType: "arraybuffer"
          }
        );

        await message.reply({
          body: `🖼️ QUANTUM ART GENERATED:\n"${artPrompt}"`,
          attachment: Buffer.from(response.data)
        });
      } catch (e) {
        message.reply(getLang('error', e.response?.data?.error || e.message));
      } finally {
        delete atomChat.sessions[userId];
        message.unsend(processingMsg.messageID);
      }
      return;
    }

    // 🧹 MEMORY CLEARANCE
    if (command === "clear") {
      atomChat.history[userId] = [];
      return message.reply(getLang('cleared'));
    }

    // 💬 CHAT MODE
    if (!args[0]) return message.reply("⚡ Please provide a query");
    if (atomChat.sessions[userId]) return message.reply("⏳ Neural network busy");

    atomChat.sessions[userId] = true;
    const thinkingMsg = await message.reply(getLang('thinking'));

    try {
      // Initialize memory core
      if (!atomChat.history[userId]) atomChat.history[userId] = [];
      
      // Maintain quantum memory limits
      if (atomChat.history[userId].length >= MAX_HISTORY) {
        atomChat.history[userId].shift();
      }

      // Add user query to history
      atomChat.history[userId].push({
        role: "user",
        content: args.join(" ")
      });

      // 🌌 QUANTUM API REQUEST
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "moonshotai/kimi-dev-72b:free",
          messages: atomChat.history[userId],
          max_tokens: MAX_TOKENS
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "atomic-asif-system",
            "X-Title": "☢️ ATOMIC GPT"
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Store AI response in memory
      atomChat.history[userId].push({
        role: "assistant",
        content: aiResponse
      });

      // 🧪 FORMAT ATOMIC RESPONSE
      const formattedResponse = `☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘 ⚛️\n` +
                               `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
                               `${aiResponse}\n` +
                               `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
                               `⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗤𝘂𝗮𝗻𝘁𝘂𝗺 𝗞𝗶𝗺𝗶-𝟳𝟮𝗕`;

      await message.reply(formattedResponse);
    } catch (e) {
      message.reply(getLang('error', e.response?.data?.error?.message || e.message));
    } finally {
      delete atomChat.sessions[userId];
      message.unsend(thinkingMsg.messageID);
    }
  }
};
