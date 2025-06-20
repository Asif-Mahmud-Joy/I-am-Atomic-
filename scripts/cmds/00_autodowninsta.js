const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  threadStates: {},

  config: {
    name: 'autoinsta_v2',
    version: '2.3',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    countDown: 5,
    role: 0,
    maxVideoSizeMB: 25,
    shortDescription: '📥 Auto Instagram Video Downloader',
    longDescription: 'Automatically detects and downloads Instagram video links',
    category: 'media',
    guide: {
      en: "Use: autoinsta on/off to enable/disable. Send Instagram video links."
    }
  },

  // Clean old cache files (older than 1 hour)
  async cleanOldCacheFiles() {
    try {
      const files = await fs.readdir(CACHE_DIR);
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(CACHE_DIR, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > 3600000) {
          await fs.unlink(filePath);
          console.log(`🧹 Deleted cache file: ${file}`);
        }
      }
    } catch (err) {
      console.error("🛠 Cache cleanup error:", err);
    }
  },

  onLoad: function () {
    // Run cache cleanup every hour
    setInterval(() => {
      this.cleanOldCacheFiles();
    }, 3600000);
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = { autoInstaEnabled: false };
    }
    const msg = (event.body || "").toLowerCase();

    if (msg.includes("autoinsta")) {
      await api.sendMessageTyping(threadID);

      // Add typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (msg.includes("on")) {
        this.threadStates[threadID].autoInstaEnabled = true;
        return api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
✅ *System Activated Successfully!*
📥 Ready to download Instagram videos
➤ Send any Instagram video link to start
━━━━━━━━━━━━━━━━━━
⚡ *Features:*
• Automatic video detection
• Fast downloading
• Cache optimization
• Size limitation: ${this.config.maxVideoSizeMB}MB
━━━━━━━━━━━━━━━━━━
🔧 Use 'autoinsta off' to disable
        `.trim(), threadID, event.messageID);
      } else if (msg.includes("off")) {
        this.threadStates[threadID].autoInstaEnabled = false;
        return api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🔴 *System Deactivated*
🚫 AutoInsta is now disabled
━━━━━━━━━━━━━━━━━━
💡 Use 'autoinsta on' to re-enable
        `.trim(), threadID, event.messageID);
      } else {
        return api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
ℹ️ *Command Usage:*
➤ 'autoinsta on' - Enable the system
➤ 'autoinsta off' - Disable the system
━━━━━━━━━━━━━━━━━━
📥 *How to use:*
1. Enable the system
2. Send any Instagram video link
3. The bot will download and send the video
━━━━━━━━━━━━━━━━━━
⚙️ *Current Status:* ${this.threadStates[threadID].autoInstaEnabled ? "🟢 ACTIVE" : "🔴 INACTIVE"}
        `.trim(), threadID, event.messageID);
      }
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const msg = event.body || "";

    if (this.threadStates[threadID]?.autoInstaEnabled && this.checkLink(msg)) {
      await api.sendMessageTyping(threadID);
      api.setMessageReaction("⏬", event.messageID, () => {}, true);
      
      // Add typing animation before processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.downloadAndSendVideo(msg, api, event);
    }
  },

  checkLink: function (text) {
    const instaRegex = /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/(?:p|tv|reel|stories)\/[^\s]+/i;
    return instaRegex.test(text);
  },

  getDownloadLink: async function (url) {
    try {
      const res = await axios.get(`https://rishadapi.deno.dev/insta?url=${encodeURIComponent(url)}`);
      if (
        res.data &&
        typeof res.data === "object" &&
        res.data.success === true &&
        typeof res.data.video === "string" &&
        res.data.video.startsWith("http")
      ) {
        return res.data.video;
      } else {
        throw new Error("❌ Couldn't retrieve video link from API");
      }
    } catch (err) {
      console.error("🛠 API Error:", err);
      throw new Error("❌ Error retrieving video link");
    }
  },

  downloadAndSendVideo: async function (url, api, event) {
    const threadID = event.threadID;
    try {
      // Send initial processing message
      await api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🔍 *Link Detected:* ${url}
⏳ Processing your request...
🔄 Connecting to Instagram servers...
      `.trim(), threadID);
      
      // Add typing animation
      await api.sendMessageTyping(threadID);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const videoUrl = await this.getDownloadLink(url);
      const fileName = `${Date.now()}.mp4`;
      const filePath = path.join(CACHE_DIR, fileName);

      // Show downloading status
      await api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
📥 *Downloading Video...*
⏳ Please wait while we fetch your content
🔄 Status: Downloading video data...
      `.trim(), threadID);
      
      const videoResp = await axios.get(videoUrl, { 
        responseType: "arraybuffer",
        onDownloadProgress: progressEvent => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Only log progress to console to avoid spamming chat
          console.log(`Download progress: ${percent}%`);
        }
      });
      
      await fs.outputFile(filePath, videoResp.data);

      const stats = await fs.stat(filePath);
      const maxSize = this.config.maxVideoSizeMB * 1024 * 1024;
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      if (stats.size > maxSize) {
        await fs.unlink(filePath);
        return api.sendMessage(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *Size Limit Exceeded!*
📏 Detected Size: ${fileSizeMB}MB
🧾 Max Allowed: ${this.config.maxVideoSizeMB}MB
━━━━━━━━━━━━━━━━━━
💡 Try shorter videos or contact admin
        `.trim(), threadID, event.messageID);
      }

      // Success message with atomic design
      await api.sendMessage({
        body: `
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
✅ *Download Successful!*
🎬 Video ready to play
📏 Size: ${fileSizeMB}MB
⏱️ Duration: Processing...
━━━━━━━━━━━━━━━━━━
🔧 Cache will auto-clean periodically
        `.trim(),
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlink(filePath), event.messageID);

      // Cache cleanup
      this.cleanOldCacheFiles();

    } catch (err) {
      console.error("🛠 Download/send error:", err);
      
      const customMsg = `
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐔𝐓𝐎𝐈𝐍𝐒𝐓𝐀 𝐕𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *Download Failed!*
🔧 Error: ${err.message || "Unknown error"}
━━━━━━━━━━━━━━━━━━
💡 Possible solutions:
• Check the link validity
• Try again later
• Contact admin if problem persists
      `.trim();
      
      return api.sendMessage(customMsg, threadID, event.messageID);
    }
  }
};
