const axios = require("axios");
const { getStreamFromURL } = global.utils;

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  HEADER: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗣𝗣 𝗦𝗧𝗢𝗥𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 ⚛️",
  FOOTER: "🔍 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 🔍",
  SEPARATOR: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    SEARCH: "🔍",
    APP: "📱",
    DEVELOPER: "👨‍💻",
    PRICE: "💲",
    RATING: "⭐",
    LINK: "🔗",
    PROCESSING: "⏳",
    STORE: "🏪",
    DOWNLOAD: "📥"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4040",
    WARNING: "#FFA500",
    INFO: "#1E90FF"
  }
};

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI[type.toUpperCase()] || ATOMIC.EMOJI.INFO} ${ATOMIC.HEADER}  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

const createRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? "½" : "";
  const emptyStars = 5 - Math.ceil(rating);
  return ATOMIC.EMOJI.RATING.repeat(fullStars) + halfStar + "☆".repeat(emptyStars);
};
// ============================================================================ //

module.exports = {
  config: {
    name: "appstore",
    aliases: ["appsearch", "iosapp"],
    version: "5.0",
    author: "Asif",
    countDown: 3,
    role: 0,
    shortDescription: "Search iOS apps on App Store",
    longDescription: "Find applications with detailed information from Apple's App Store",
    category: "utility",
    guide: {
      en: `
        ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗣𝗣𝗦𝗧𝗢𝗥𝗘 𝗚𝗨𝗜𝗗𝗘:
        {pn} <app name>
        
        🔹 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        {pn} TikTok
        {pn} WhatsApp
        {pn} Instagram
      `
    },
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    en: {
      missingKeyword: "⚠️ Please enter an app name to search",
      noResult: "❌ No apps found for: %1",
      networkError: "❌ Failed to connect to App Store. Please try again later",
      searchResults: "🔍 Search results for: %1",
      appTemplate: `
📱 𝗔𝗣𝗣 𝗡𝗔𝗠𝗘: %1
👨‍💻 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥: %2
💲 𝗣𝗥𝗜𝗖𝗘: %3
⭐ 𝗥𝗔𝗧𝗜𝗡𝗚: %4 (%5/5)
📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗: %6`
    }
  },

  onStart: async function({ message, event, args, commandName, envCommands, getLang, api }) {
    const threadID = event.threadID;
    await simulateTyping(api, threadID);
    
    if (!args[0]) {
      return message.reply(
        formatAtomicMessage(
          `${ATOMIC.EMOJI.ERROR} ${getLang("missingKeyword")}\n${ATOMIC.EMOJI.INFO} Usage: ${this.config.name} <app name>`,
          "error"
        )
      );
    }

    const searchTerm = args.join(" ");
    const limit = envCommands[commandName]?.limitResult || 3;

    try {
      // Show processing indicator
      await simulateTyping(api, threadID, 2000);
      
      const response = await axios.get("https://itunes.apple.com/search", {
        params: {
          term: searchTerm,
          country: "US",
          entity: "software",
          limit,
          media: "software"
        },
        timeout: 15000
      });

      const results = response.data.results;

      if (!results || results.length === 0) {
        return message.reply(
          formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} ${getLang("noResult", searchTerm)}`,
            "error"
          )
        );
      }

      let replyMessage = `\n${ATOMIC.EMOJI.SEARCH} ${getLang("searchResults", `"${searchTerm}"`)}\n\n`;
      const appIcons = [];

      for (const [index, app] of results.entries()) {
        // Create visual rating
        const ratingValue = app.averageUserRating || 0;
        const ratingStars = createRatingStars(ratingValue);
        
        // Format price display
        const price = app.formattedPrice === "Free" ? 
          `${ATOMIC.EMOJI.SUCCESS} FREE` : 
          `${ATOMIC.EMOJI.PRICE} ${app.formattedPrice}`;

        // Add app info
        replyMessage += getLang(
          "appTemplate",
          app.trackName,
          app.artistName,
          price,
          ratingStars,
          ratingValue.toFixed(1),
          app.trackViewUrl
        );
        
        if (index < results.length - 1) {
          replyMessage += `\n\n${ATOMIC.SEPARATOR}\n\n`;
        }
        
        // Get highest quality icon
        const iconUrl = app.artworkUrl512 || 
                       app.artworkUrl100 || 
                       app.artworkUrl60;
        appIcons.push(await getStreamFromURL(iconUrl));
      }

      // Simulate final processing
      await simulateTyping(api, threadID, 1500);
      
      return message.reply({
        body: formatAtomicMessage(replyMessage, "info"),
        attachment: appIcons
      });

    } catch (error) {
      console.error("Atomic App Store Error:", error);
      return message.reply(
        formatAtomicMessage(
          `${ATOMIC.EMOJI.ERROR} ${getLang("networkError")}`,
          "error"
        )
      );
    }
  }
};
