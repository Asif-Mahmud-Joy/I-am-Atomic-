const axios = require("axios");
const fs = require("fs-extra");
const { shortenURL } = global.utils;

// ======================== 🚀 ULTIMATE DOWNLOAD SYSTEM 🚀 ======================== //
const DESIGN = {
  FRAME: {
    TOP: "╔═══════════ ∘◦🚀◦∘ ═══════════╗",
    BOTTOM: "╚═══════════ ∘◦🚀◦∘ ═══════════╝",
    DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰"
  },
  ELEMENTS: {
    VIDEO: "🎬",
    DOWNLOAD: "📥",
    SUCCESS: "✅",
    ERROR: "❌",
    LOADING: "⏳",
    LINK: "🔗",
    PLATFORM: "🌐",
    CLOCK: "⏱️"
  }
};

const createDesignMessage = (content) => {
  return `${DESIGN.FRAME.TOP}
${content}
${DESIGN.FRAME.DIVIDER}
${DESIGN.FRAME.BOTTOM}`;
};

// Ensure cache folder exists
const cachePath = __dirname + "/cache/mediadl";
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
const filePath = `${cachePath}/downloaded_media_${Date.now()}.mp4`;

// Supported platforms
const SUPPORTED_PLATFORMS = [
  "tiktok.com", "facebook.com", "instagram.com", 
  "youtube.com", "youtu.be", "twitter.com", "x.com",
  "fb.watch", "pinterest.com", "snapchat.com",
  "dailymotion.com", "vimeo.com", "twitch.tv"
];

module.exports = {
  config: {
    name: "autodl",
    version: "3.0",
    author: "Asif Mahmud",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download media from 12+ platforms"
    },
    category: "media",
    guide: {
      en: "Simply send a supported media link"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const link = event.body?.trim();
    if (!link) return;

    const isSupported = SUPPORTED_PLATFORMS.some(domain => link.includes(domain));
    if (!isSupported) return;

    try {
      api.setMessageReaction(DESIGN.ELEMENTS.LOADING, event.messageID, () => {}, true);

      // Get API base URL
      const baseAPI = "https://api-samir.onrender.com"; // Using a reliable alternative API
      const apiUrl = `${baseAPI}/alldl?url=${encodeURIComponent(link)}`;
      
      const { data } = await axios.get(apiUrl, {
        timeout: 30000
      });

      if (!data.result) throw new Error("Invalid media link or API response");

      // Download media
      const videoRes = await axios.get(data.result, {
        responseType: "arraybuffer",
        timeout: 60000
      });
      fs.writeFileSync(filePath, Buffer.from(videoRes.data));

      // Shorten URL
      let shortUrl;
      try {
        shortUrl = await shortenURL(data.result);
      } catch {
        shortUrl = data.result;
      }

      // Get platform name
      const platform = SUPPORTED_PLATFORMS.find(domain => link.includes(domain));
      const platformName = platform.split('.')[0].toUpperCase();

      // Send result
      api.setMessageReaction(DESIGN.ELEMENTS.SUCCESS, event.messageID, () => {}, true);
      await api.sendMessage({
        body: createDesignMessage(
          `${DESIGN.ELEMENTS.SUCCESS} 𝗠𝗘𝗗𝗜𝗔 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!\n\n` +
          `${DESIGN.ELEMENTS.PLATFORM} 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platformName}\n` +
          `${DESIGN.ELEMENTS.LINK} 𝗦𝗼𝘂𝗿𝗰𝗲: ${shortUrl}\n` +
          `${DESIGN.ELEMENTS.CLOCK} 𝗧𝗶𝗺𝗲: ${new Date().toLocaleTimeString()}`
        ),
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // Cleanup
      fs.unlinkSync(filePath);

    } catch (error) {
      api.setMessageReaction(DESIGN.ELEMENTS.ERROR, event.messageID, () => {}, true);
      await api.sendMessage(
        createDesignMessage(
          `${DESIGN.ELEMENTS.ERROR} 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗\n\n` +
          `• ${error.message}\n` +
          `• Try again later or use another link\n` +
          `${DESIGN.ELEMENTS.LOADING} Supported: ${SUPPORTED_PLATFORMS.join(', ')}`
        ), 
        event.threadID
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};
