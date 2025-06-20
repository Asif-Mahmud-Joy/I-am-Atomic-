const fs = require("fs-extra");
const axios = require("axios");
const { shortenURL } = global.utils;

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  FRAME: {
    TOP: "╔═════ ∘◦⚛️◦∘ ═════╗",
    BOTTOM: "╚═════ ∘◦⚛️◦∘ ═════╝",
    DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰"
  },
  ELEMENTS: {
    DOWNLOAD: "📥",
    SUCCESS: "✅",
    ERROR: "❌",
    VIDEO: "🎬",
    LINK: "🔗",
    PLATFORM: "🌐",
    GEAR: "⚙️",
    CLOCK: "⏱️",
    ATOM: "⚛️",
    BLAST: "💥"
  }
};

const createAtomicMessage = (content) => {
  return `${ATOMIC.FRAME.TOP}
${content}
${ATOMIC.FRAME.DIVIDER}
${ATOMIC.FRAME.BOTTOM}`;
};

const cachePath = __dirname + "/cache/atomic_media";
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

// Platform emoji mapping
const PLATFORM_EMOJIS = {
  instagram: "📸",
  facebook: "📘",
  tiktok: "🎵",
  twitter: "🐦",
  pinterest: "📌",
  youtube: "▶️",
  other: "🌐"
};
// ============================================================================== //

module.exports = {
  config: {
    name: "autolink",
    version: "5.0",
    author: "Asif Mahmud",
    countDown: 0,
    role: 0,
    shortDescription: "⚛️ Atomic media downloader",
    longDescription: "Auto-download media with atomic precision",
    category: "media",
    guide: {
      en: "{pn} on/off - Toggle auto-download"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    
    if (args[0] === "off") {
      this.threadStates[threadID] = "off";
      return api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.GEAR} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗\n` +
        `▸ Media download deactivated\n` +
        `${ATOMIC.ELEMENTS.ATOM} Use "${this.config.name} on" to reactivate`
      ), threadID);
    }
    
    if (args[0] === "on") {
      this.threadStates[threadID] = "on";
      return api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.GEAR} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗\n` +
        `▸ Media download enabled\n` +
        `${ATOMIC.ELEMENTS.VIDEO} Ready for atomic blasts!`
      ), threadID);
    }

    return api.sendMessage(createAtomicMessage(
      `${ATOMIC.ELEMENTS.ATOM} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗠𝗘𝗗𝗜𝗔 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n\n` +
      `▸ Status: ${this.threadStates[threadID] === "off" ? "❌ Disabled" : "✅ Enabled"}\n` +
      `▸ Commands:\n` +
      `   • ${this.config.name} on → Enable\n` +
      `   • ${this.config.name} off → Disable\n\n` +
      `${ATOMIC.ELEMENTS.LINK} Just send any media link to download`
    ), threadID);
  },

  threadStates: {},

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    if (this.threadStates[threadID] === "off") return;
    
    const url = this.extractLink(event.body);
    if (!url) return;

    // Set reaction and send processing message
    api.setMessageReaction(ATOMIC.ELEMENTS.ATOM, event.messageID, () => {}, true);
    const processingMsg = await api.sendMessage(createAtomicMessage(
      `${ATOMIC.ELEMENTS.ATOM} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚\n` +
      `▸ Detecting media source...\n` +
      `${ATOMIC.ELEMENTS.CLOCK} Initializing download sequence`
    ), threadID);

    try {
      const startTime = Date.now();
      const filePath = `${cachePath}/${Date.now()}.mp4`;
      
      // Identify platform
      const platform = Object.keys(PLATFORM_EMOJIS).find(p => url.includes(p)) || "other";
      const platformEmoji = PLATFORM_EMOJIS[platform];
      
      // Download media
      const apiUrl = `https://allinonedownloader-ayan.onrender.com/download?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { timeout: 30000 });
      
      if (!response.data?.url) throw new Error("Invalid API response");
      
      const shortUrl = await shortenURL(response.data.url);
      const mediaRes = await axios({ 
        url: response.data.url, 
        responseType: "stream", 
        timeout: 60000 
      });
      
      // Check file size
      const contentLength = mediaRes.headers['content-length'];
      if (contentLength > 25 * 1024 * 1024) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(createAtomicMessage(
          `${ATOMIC.ELEMENTS.ERROR} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗟𝗘𝗥𝗧\n` +
          `▸ File exceeds 25MB limit\n` +
          `▸ Detected size: ${(contentLength/1024/1024).toFixed(1)}MB`
        ), threadID);
      }
      
      // Save file
      const writer = fs.createWriteStream(filePath);
      mediaRes.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      
      // Calculate download time
      const downloadTime = ((Date.now() - startTime)/1000).toFixed(1);
      
      // Update processing message
      await api.unsendMessage(processingMsg.messageID);
      
      // Send result
      api.sendMessage({
        body: createAtomicMessage(
          `${ATOMIC.ELEMENTS.BLAST} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗟𝗔𝗦𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘!\n\n` +
          `${platformEmoji} 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform.toUpperCase()}\n` +
          `${ATOMIC.ELEMENTS.LINK} 𝗦𝗼𝘂𝗿𝗰𝗲: ${shortUrl}\n` +
          `${ATOMIC.ELEMENTS.CLOCK} 𝗧𝗶𝗺𝗲: ${downloadTime}s\n` +
          `${ATOMIC.ELEMENTS.ATOM} 𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱`
        ),
        attachment: fs.createReadStream(filePath)
      }, threadID);
      
      // Cleanup
      fs.unlinkSync(filePath);
      
    } catch (error) {
      await api.unsendMessage(processingMsg.messageID);
      api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.ERROR} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n` +
        `▸ Error: ${error.message || "Unknown"}\n` +
        `▸ Platform: ${this.getPlatformFromUrl(url)}\n` +
        `${ATOMIC.ELEMENTS.GEAR} Try again or use different link`
      ), threadID);
    }
  },

  extractLink: function (text) {
    const regex = /https?:\/\/[^\s]+/gi;
    const match = text.match(regex);
    return match ? match[0] : null;
  },

  getPlatformFromUrl: function (url) {
    return Object.keys(PLATFORM_EMOJIS).find(p => url.includes(p)) || "Unknown";
  }
};
