const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");
fs.ensureDirSync(CACHE_DIR);

module.exports = {
  threadStates: {},

  config: {
    name: 'autoinsta_v2',
    version: '2.2',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    countDown: 5,
    role: 0,
    maxVideoSizeMB: 25, // কনফিগারেবল ভিডিও সাইজ লিমিট (MB)
    shortDescription: '📥 Auto Instagram ভিডিও ডাউনলোডার',
    longDescription: 'ইনস্টাগ্রাম ভিডিও লিঙ্ক স্বয়ংক্রিয়ভাবে ডিটেক্ট করে ডাউনলোড ও শেয়ার করে।',
    category: 'media',
    guide: {
      en: "Use: autoinsta on/off দিয়ে চালু/বন্ধ করো। Instagram ভিডিও লিঙ্ক পাঠাও।"
    }
  },

  // পুরানো ক্যাশ ফাইল ডিলিট (১ ঘণ্টার বেশি পুরানো)
  async cleanOldCacheFiles() {
    try {
      const files = await fs.readdir(CACHE_DIR);
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(CACHE_DIR, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > 3600000) { // ১ ঘণ্টা
          await fs.unlink(filePath);
          console.log(`🧹 ক্যাশ ফাইল ডিলিট হয়েছে: ${file}`);
        }
      }
    } catch (err) {
      console.error("🛠 ক্যাশ ক্লিনআপ এrror:", err);
    }
  },

  onLoad: function () {
    // প্রতি ১ ঘণ্টায় ক্যাশ ক্লিনআপ চালানো হবে
    setInterval(() => {
      this.cleanOldCacheFiles();
    }, 3600000); // 3600000ms = 1 hour
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = { autoInstaEnabled: false };
    }
    const msg = (event.body || "").toLowerCase();

    if (msg.includes("autoinsta")) {
      await api.sendMessageTyping(threadID);

      if (msg.includes("on")) {
        this.threadStates[threadID].autoInstaEnabled = true;
        return api.sendMessage("✅ *AutoInsta* চালু হয়েছে! এখন Instagram ভিডিও লিঙ্ক পাঠাও। 🎉", threadID, event.messageID);
      } else if (msg.includes("off")) {
        this.threadStates[threadID].autoInstaEnabled = false;
        return api.sendMessage("❌ *AutoInsta* বন্ধ করা হয়েছে। প্রয়োজনে আবার চালু করো।", threadID, event.messageID);
      } else {
        return api.sendMessage("ℹ️ *ব্যবহার:* 'autoinsta on' অথবা 'autoinsta off' লিখে চালু/বন্ধ করো।", threadID, event.messageID);
      }
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const msg = event.body || "";

    if (this.threadStates[threadID]?.autoInstaEnabled && this.checkLink(msg)) {
      await api.sendMessageTyping(threadID);
      api.setMessageReaction("⏬", event.messageID, () => {}, true);
      this.downloadAndSendVideo(msg, api, event);
    }
  },

  // ইনস্টাগ্রামের নতুন ও পুরানো URL ফরম্যাট সাপোর্ট (Regex আপডেট)
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
        throw new Error("❌ API থেকে ভিডিও লিঙ্ক পাওয়া যায়নি।");
      }
    } catch (err) {
      console.error("🛠 API Error:", err);
      throw new Error("❌ ভিডিও লিঙ্ক আনার সময় সমস্যা হয়েছে।");
    }
  },

  downloadAndSendVideo: async function (url, api, event) {
    const threadID = event.threadID;
    try {
      await api.sendMessageTyping(threadID);
      await api.sendMessage("⏳ ভিডিও ডাউনলোড শুরু হয়েছে, অনুগ্রহ করে অপেক্ষা করুন...", threadID);

      const videoUrl = await this.getDownloadLink(url);
      const fileName = `${Date.now()}.mp4`;
      const filePath = path.join(CACHE_DIR, fileName);

      const videoResp = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.outputFile(filePath, videoResp.data);

      const stats = await fs.stat(filePath);
      const maxSize = this.config.maxVideoSizeMB * 1024 * 1024;
      if (stats.size > maxSize) {
        await fs.unlink(filePath);
        return api.sendMessage(
          `⚠️ ভিডিওর সাইজ ${this.config.maxVideoSizeMB}MB এর বেশি হওয়ায় পাঠানো যাচ্ছে না।`,
          threadID,
          event.messageID
        );
      }

      await api.sendMessage({
        body: "✅ Instagram থেকে সফলভাবে ভিডিও ডাউনলোড হয়েছে। নিচে দেখাও হলো:",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlink(filePath), event.messageID);

      // ক্যাশ ক্লিনআপ
      this.cleanOldCacheFiles();

    } catch (err) {
      console.error("🛠 Download/send error:", err);
      const customMsg = err.message || "❌ ভিডিও ডাউনলোড বা পাঠাতে সমস্যা হয়েছে। দয়া করে পরে আবার চেষ্টা করুন।";
      return api.sendMessage(customMsg, threadID, event.messageID);
    }
  }
};
