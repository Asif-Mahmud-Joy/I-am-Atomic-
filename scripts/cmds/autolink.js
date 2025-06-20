const fs = require("fs-extra");
const axios = require("axios");
const { shortenURL } = global.utils;

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  FRAME: {
    TOP: "╔═══════ ∘◦⚛️◦∘ ═══════╗",
    BOTTOM: "╚═══════ ∘◦⚛️◦∘ ═══════╝",
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
    CLOCK: "⏱️"
  },
  COLORS: {
    PRIMARY: "#FF6B6B",
    SECONDARY: "#4ECDC4"
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

// Supported platforms with icons
const PLATFORMS = {
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
    shortDescription: "Auto-download media from 12+ platforms",
    longDescription: "Smart media downloader with atomic design",
    category: "media",
    guide: {
      en: "Send any media link | {pn} on/off"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    
    if (args[0] === "off") {
      this.threadStates[threadID] = "off";
      api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.GEAR} 𝗔𝘂𝘁𝗼𝗟𝗶𝗻𝗸 𝗗𝗶𝘀𝗮𝗯𝗹𝗲𝗱\n` +
        `▸ Media auto-download turned off\n` +
        `▸ Use "${this.config.name} on" to re-enable`
      ), threadID);
      return;
    }
    
    if (args[0] === "on") {
      this.threadStates[threadID] = "on";
      api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.GEAR} 𝗔𝘂𝘁𝗼𝗟𝗶𝗻𝗸 𝗘𝗻𝗮𝗯𝗹𝗲𝗱\n` +
        `▸ Media auto-download activated\n` +
        `▸ Supported: ${Object.keys(PLATFORMS).join(", ")}`
      ), threadID);
      return;
    }

    api.sendMessage(createAtomicMessage(
      `${ATOMIC.ELEMENTS.VIDEO} 𝗔𝘁𝗼𝗺𝗶𝗰 𝗠𝗲𝗱𝗶𝗮 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n` +
      `▸ Status: ${this.threadStates[threadID] === "off" ? "Disabled ❌" : "Enabled ✅"}\n` +
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

    api.setMessageReaction(ATOMIC.ELEMENTS.DOWNLOAD, event.messageID, () => {}, true);
    
    try {
      const startTime = Date.now();
      const filePath = `${cachePath}/${Date.now()}.mp4`;
      
      // Identify platform
      const platform = Object.keys(PLATFORMS).find(p => url.includes(p)) || "other";
      const platformIcon = PLATFORMS[platform];
      
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
        return api.sendMessage(createAtomicMessage(
          `${ATOMIC.ELEMENTS.ERROR} 𝗙𝗶𝗹𝗲 𝗧𝗼𝗼 𝗟𝗮𝗿𝗴𝗲\n` +
          `▸ Max size: 25MB\n` +
          `▸ Your file: ${(contentLength/1024/1024).toFixed(1)}MB`
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
      
      // Send result
      api.sendMessage({
        body: createAtomicMessage(
          `${ATOMIC.ELEMENTS.SUCCESS} 𝗠𝗘𝗗𝗜𝗔 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗\n\n` +
          `${platformIcon} 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform.toUpperCase()}\n` +
          `${ATOMIC.ELEMENTS.LINK} 𝗦𝗼𝘂𝗿𝗰𝗲: ${shortUrl}\n` +
          `${ATOMIC.ELEMENTS.CLOCK} 𝗧𝗶𝗺𝗲: ${downloadTime}s`
        ),
        attachment: fs.createReadStream(filePath)
      }, threadID);
      
      // Cleanup
      fs.unlinkSync(filePath);
      
    } catch (error) {
      api.setMessageReaction(ATOMIC.ELEMENTS.ERROR, event.messageID, () => {}, true);
      api.sendMessage(createAtomicMessage(
        `${ATOMIC.ELEMENTS.ERROR} 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗\n\n` +
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
    return Object.keys(PLATFORMS).find(p => url.includes(p)) || "Unknown";
  }
};
