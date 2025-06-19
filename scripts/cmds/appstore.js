const axios = require("axios");
const { getStreamFromURL } = global.utils;

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗔𝗣𝗣 𝗦𝗧𝗢𝗥𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    SEARCH: "🔍",
    APP: "📱",
    DEVELOPER: "👨‍💻",
    PRICE: "💲",
    RATING: "⭐",
    LINK: "🔗",
    PROCESSING: "⏳",
    STORE: "🏪"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF"
  }
};

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━┛
${content}
${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "appstore",
    version: "3.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Royal AI",
    countDown: 5,
    role: 0,
    shortDescription: "Search apps on Apple App Store",
    longDescription: "Find applications with detailed information from the App Store",
    category: "utility",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗔𝗣𝗣𝗦𝗧𝗢𝗥𝗘 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} <app name>
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ Example: 
        !appstore TikTok
        !appstore WhatsApp
      `,
      bn: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 অ্যাপস্টোর গাইড 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} <অ্যাপের নাম>
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ উদাহরণ: 
        !appstore TikTok
        !appstore WhatsApp
      `
    },
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    en: {
      missingKeyword: "Please enter an app name to search",
      noResult: "No apps found for: %1",
      networkError: "Failed to connect to App Store. Please try again later",
      searchResults: "🔍 Search results for: %1",
      appTemplate: `
📱 𝗔𝗣𝗣 𝗡𝗔𝗠𝗘: %1
👨‍💻 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥: %2
💲 𝗣𝗥𝗜𝗖𝗘: %3
⭐ 𝗥𝗔𝗧𝗜𝗡𝗚: %4 (%5/5)
🔗 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗: %6
━━━━━━━━━━━━━━━━━━━━━━━━━━`
    },
    bn: {
      missingKeyword: "অনুসন্ধান করার জন্য একটি অ্যাপের নাম লিখুন",
      noResult: "%1 এর জন্য কোনো অ্যাপ পাওয়া যায়নি",
      networkError: "অ্যাপ স্টোরে সংযোগ করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন",
      searchResults: "🔍 %1 এর জন্য অনুসন্ধান ফলাফল",
      appTemplate: `
📱 𝗔𝗣𝗣 𝗡𝗔𝗠𝗘: %1
👨‍💻 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥: %2
💲 𝗣𝗥𝗜𝗖𝗘: %3
⭐ 𝗥𝗔𝗧𝗜𝗡𝗚: %4 (%5/5)
🔗 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗: %6
━━━━━━━━━━━━━━━━━━━━━━━━━━`
    }
  },

  onStart: async function ({ message, event, args, commandName, envCommands, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    if (!args[0]) {
      return message.reply(
        formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("missingKeyword")}`, "error")
      );
    }

    const searchTerm = args.join(" ");
    const limit = envCommands[commandName]?.limitResult || 3;

    try {
      await simulateTyping(api, event.threadID);
      
      const response = await axios.get("https://itunes.apple.com/search", {
        params: {
          term: searchTerm,
          country: "US",
          entity: "software",
          limit
        }
      });

      const results = response.data.results;

      if (!results || results.length === 0) {
        return message.reply(
          formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("noResult", searchTerm)}`, "error")
        );
      }

      let replyMessage = `${DESIGN.EMOJI.SEARCH} ${getLang("searchResults", searchTerm)}\n\n`;
      const appIcons = [];

      for (const [index, app] of results.entries()) {
        const rating = app.averageUserRating
          ? `${"⭐".repeat(Math.min(5, Math.round(app.averageUserRating)))} (${app.averageUserRating.toFixed(1)}/5)`
          : getLang("noRating", "No rating");
        
        replyMessage += getLang(
          "appTemplate",
          app.trackCensoredName,
          app.artistName,
          app.formattedPrice || "Free",
          rating,
          app.averageUserRating?.toFixed(1) || "0.0",
          app.trackViewUrl
        );
        
        if (index < results.length - 1) {
          replyMessage += "\n\n";
        }
        
        // Get highest quality icon available
        const iconUrl = app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60;
        appIcons.push(await getStreamFromURL(iconUrl));
      }

      await simulateTyping(api, event.threadID);
      
      message.reply({
        body: formatMessage(replyMessage, "info"),
        attachment: appIcons
      });

    } catch (error) {
      console.error("App Store Error:", error);
      message.reply(
        formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("networkError")}`, "error")
      );
    }
  }
};
