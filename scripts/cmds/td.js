const axios = require('axios');

// Cache for API URL to avoid repeated requests
let apiUrlCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 3600000; // 1 hour cache

async function getBaseUrl() {
  const now = Date.now();
  if (apiUrlCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return apiUrlCache;
  }

  try {
    const res = await axios.get('https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json', {
      timeout: 5000
    });
    apiUrlCache = res.data.apiUrl || 'https://eren-td.onrender.com';
    lastCacheUpdate = now;
    return apiUrlCache;
  } catch (err) {
    console.error("Error fetching base URL:", err);
    return 'https://eren-td.onrender.com';
  }
}

async function fetchQuestion(type) {
  const baseUrl = await getBaseUrl();
  try {
    const response = await axios.get(`${baseUrl}/${type}`, {
      timeout: 8000
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return { error: `Failed to fetch ${type}. Please try again later.` };
  }
}

module.exports = {
  config: {
    name: "truthdare",
    aliases: ["td"],
    version: "2.0",
    author: "Eren Yeh & Asif",
    shortDescription: "✨ Truth or Dare Challenge ✨",
    longDescription: "Get random truth questions or daring challenges with dynamic API support",
    category: "fun",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🎭 TRUTH OR DARE 🎭
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} truth - Get a truth question
❯ {pn} dare - Get a dare challenge

💎 Examples:
❯ {pn} truth
❯ {pn} dare
      `
    }
  },

  onStart: async function ({ message, args }) {
    const type = args[0]?.toLowerCase();

    if (!type) {
      return message.reply(`
🎭 Please choose a game mode:
────────────────────
✦ Type: {pn} truth - For deep questions
✦ Type: {pn} dare - For fun challenges
      `.replace(/{pn}/g, this.config.name));
    }

    if (!['truth', 'dare'].includes(type)) {
      return message.reply("⚠️ Please specify either 'truth' or 'dare'");
    }

    try {
      message.reply("⏳ Fetching your challenge...");
      const question = await fetchQuestion(type);
      
      if (question.error) {
        return message.reply(question.error);
      }

      const formattedResponse = type === 'truth' 
        ? `✨ Truth Time! ✨\n\n💭 ${question.result}\n\n────────────────────\nReply with your honest answer!`
        : `⚡ Dare Time! ⚡\n\n🎯 ${question.result}\n\n────────────────────\nShow us what you've got!`;

      return message.reply(formattedResponse);
    } catch (error) {
      console.error("Command Error:", error);
      return message.reply("❌ An error occurred. Please try again later.");
    }
  }
};
