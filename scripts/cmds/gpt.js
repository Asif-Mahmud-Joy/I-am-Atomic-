const axios = require('axios');

// ✅ Public API Proxy Key Setup
const apiKey = "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"; // 👈 Free HuggingFace-compatible GPT Proxy Key (limited use)

const maxTokens = 500;
const numberGenerateImage = 4;
const maxStorageMessage = 4;

if (!global.temp.openAIUsing)
  global.temp.openAIUsing = {};
if (!global.temp.openAIHistory)
  global.temp.openAIHistory = {};

const { openAIUsing, openAIHistory } = global.temp;

module.exports = {
  config: {
    name: "gpt",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Use ChatGPT or draw images",
      bn: "ChatGPT diye kotha bolo ba chobi toiri koro"
    },
    longDescription: {
      en: "Chat with ChatGPT, generate images with prompts",
      bn: "ChatGPT er shathe kotha bolo, prompt diye chobi toiri koro"
    },
    category: "ai chat",
    guide: {
      en: "{pn} <message>\n{pn} draw <prompt>\n{pn} clear",
      bn: "{pn} <message>\n{pn} draw <prompt> - chobi toiri\n{pn} clear - chat clear"
    }
  },

  langs: {
    en: {
      apiKeyEmpty: "❌ Please add your OpenAI API key in this script.",
      invalidContentDraw: "⚠️ Please type the content to draw.",
      yourAreUsing: "⚙️ You are already chatting. Please wait...",
      processingRequest: "⏳ Processing... Please wait a moment.",
      invalidContent: "❗ Please enter a message to chat.",
      error: "❌ Error: %1",
      clearHistory: "🧹 Your chat history has been cleared."
    },
    bn: {
      apiKeyEmpty: "❌ OpenAI API key dao ei script er moddhe.",
      invalidContentDraw: "⚠️ Ki chobi banate chao ta bolo.",
      yourAreUsing: "⚙️ Tumi already chat korcho. Ektu wait koro...",
      processingRequest: "⏳ Request process hocche. Ektu wait koro...",
      invalidContent: "❗ Chat korar jonno kichu likho.",
      error: "❌ Error: %1",
      clearHistory: "🧹 Tomar chat history clear kora hoyeche."
    }
  },

  onStart: async function ({ message, event, args, getLang, prefix }) {
    if (!apiKey) return message.reply(getLang('apiKeyEmpty'));

    const userInput = args.join(" ");
    const firstArg = args[0]?.toLowerCase();

    switch (firstArg) {
      case "draw":
      case "img":
      case "image": {
        if (!args[1]) return message.reply(getLang('invalidContentDraw'));
        if (openAIUsing[event.senderID]) return message.reply(getLang('yourAreUsing'));

        openAIUsing[event.senderID] = true;
        let sending;

        try {
          sending = await message.reply(getLang('processingRequest'));

          const res = await axios.post("https://api-inference.huggingface.co/models/prompthero/openjourney", {
            inputs: args.slice(1).join(" ")
          }, {
            headers: {
              Authorization: `Bearer ${apiKey}`
            },
            responseType: "arraybuffer"
          });

          const buffer = Buffer.from(res.data, 'binary');
          return message.reply({ attachment: [buffer] });

        } catch (e) {
          return message.reply(getLang('error', e.response?.data?.error || e.message));
        } finally {
          delete openAIUsing[event.senderID];
          if (sending?.messageID) message.unsend(sending.messageID);
        }
      }

      case "clear": {
        openAIHistory[event.senderID] = [];
        return message.reply(getLang('clearHistory'));
      }

      default: {
        if (!args[0]) return message.reply(getLang('invalidContent'));
        return handleGpt(event, message, args, getLang);
      }
    }
  }
};

async function handleGpt(event, message, args, getLang) {
  try {
    if (openAIUsing[event.senderID]) return message.reply(getLang('yourAreUsing'));
    openAIUsing[event.senderID] = true;

    openAIHistory[event.senderID] = openAIHistory[event.senderID] || [];
    if (openAIHistory[event.senderID].length >= maxStorageMessage) openAIHistory[event.senderID].shift();

    openAIHistory[event.senderID].push({ role: 'user', content: args.join(" ") });

    const res = await axios.post("https://api.deepinfra.com/v1/openai/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: openAIHistory[event.senderID],
      max_tokens: maxTokens,
      temperature: 0.7
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const answer = res.data.choices[0].message.content;

    openAIHistory[event.senderID].push({ role: 'assistant', content: answer });

    return message.reply(answer);

  } catch (e) {
    return message.reply(getLang('error', e.response?.data?.error?.message || e.message));
  } finally {
    delete openAIUsing[event.senderID];
  }
}
