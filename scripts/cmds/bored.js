const axios = require("axios");

// ============================== ☣️ ATOMIC DESIGN SYSTEM ☣️ ============================== //
const design = {
  header: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗢𝗥𝗘𝗗𝗢𝗠 𝗕𝗨𝗦𝗧𝗘𝗥 ⚡",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    idea: "💡",
    error: "⚠️",
    loading: "⏳",
    success: "✅",
    atomic: "⚛️"
  }
};

const formatMessage = (content, type = "success") => {
  const emoji = type === "error" ? design.emoji.error : design.emoji.success;
  return `${design.header}\n${design.separator}\n${emoji} ${content}\n${design.separator}\n${design.footer}`;
};
// ======================================================================================== //

module.exports = {
  config: {
    name: "bored",
    aliases: ["boredom", "activity"],
    version: "3.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 2,
    role: 0,
    category: "entertainment",
    shortDescription: {
      en: "⚡ Get atomic activity suggestions"
    },
    longDescription: {
      en: "⚡ Generate scientifically optimized boredom solutions with atomic precision"
    },
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      suggestion: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬 𝗦𝗨𝗚𝗚𝗘𝗦𝗧𝗜𝗢𝗡\n\n▸ How about: 「%1」?",
      loading: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚\n\n▸ Calculating optimal boredom solution...",
      error: "⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to compute activity suggestion"
    }
  },

  onStart: async function({ api, args, message, event, getLang }) {
    try {
      // Start typing animation
      api.sendTyping(event.threadID);
      
      // Show processing message
      const loadingMsg = await message.reply(getLang("loading"));
      
      // Get activity from API
      const response = await axios.get("https://www.boredapi.com/api/activity/");
      const activity = response.data.activity;
      
      // Format success message
      const successMsg = formatMessage(getLang("suggestion", activity));
      
      // Delete loading message and send result
      await api.unsendMessage(loadingMsg.messageID);
      return message.reply(successMsg);
      
    } catch (error) {
      const errorMsg = formatMessage(getLang("error"), "error");
      return message.reply(errorMsg);
    }
  }
};
