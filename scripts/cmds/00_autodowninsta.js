const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  threadStates: {},

  config: {
    name: 'autoinsta',
    version: '2.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto Instagram video downloader',
    longDescription: 'Automatically detects and downloads Instagram videos from messages when enabled',
    category: 'media',
    guide: {
      en: 'Use: autoinsta on/off to toggle feature. Just send any Instagram link when ON.'
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = {
        autoInstaEnabled: false
      };
    }

    const msg = event.body.toLowerCase();

    if (msg.includes('autoinsta')) {
      if (msg.includes('on')) {
        this.threadStates[threadID].autoInstaEnabled = true;
        return api.sendMessage("✅ AutoInsta is now ON. Just send any Instagram video link.", threadID, event.messageID);
      } else if (msg.includes('off')) {
        this.threadStates[threadID].autoInstaEnabled = false;
        return api.sendMessage("❌ AutoInsta is now OFF.", threadID, event.messageID);
      } else {
        return api.sendMessage("ℹ️ Type 'autoinsta on' to enable or 'autoinsta off' to disable.", threadID, event.messageID);
      }
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const msg = event.body;

    if (this.threadStates[threadID]?.autoInstaEnabled && this.checkLink(msg)) {
      api.setMessageReaction("⏬", event.messageID, () => {}, true);
      this.downloadInsta(msg, api, event);
    }
  },

  checkLink: function (text) {
    return text.includes("instagram.com") || text.includes("instagr.am");
  },

  getDownloadLink: async function (url) {
    try {
      const res = await axios.get(`https://rishadapi.deno.dev/insta?url=${encodeURIComponent(url)}`);
      if (res.data.success && res.data.video) return res.data.video;
      else throw new Error("Download link not found.");
    } catch (err) {
      throw new Error("❌ Failed to fetch video link.");
    }
  },

  downloadInsta: async function (url, api, event) {
    try {
      const videoUrl = await this.getDownloadLink(url);
      const fileName = `${Date.now()}.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      const videoStream = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.outputFile(filePath, videoStream.data);

      const stats = fs.statSync(filePath);
      if (stats.size > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage("⚠️ File is too large to send (>25MB).", event.threadID, event.messageID);
      }

      await api.sendMessage({
        body: "📥 Downloaded from Instagram:",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlink(filePath), event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(err.message || "❌ Error downloading video.", event.threadID);
    }
  }
};
