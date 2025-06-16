const axios = require("axios");
const fs = require("fs-extra");
const { shortenURL } = global.utils;

const cachePath = __dirname + "/cache";
const filePath = cachePath + "/autodl_video.mp4";

// Ensure cache folder exists
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

const baseApiUrl = async () => {
  const { data } = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return data.api;
};

module.exports = {
  config: {
    name: "autodl",
    version: "2.0.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from TikTok, Facebook, Instagram, YouTube, Twitter, and more",
    },
    category: "media",
    guide: {
      en: "Reply or paste any supported video link",
    },
  },

  onStart: async () => {},

  onChat: async function ({ api, event }) {
    const link = event.body?.trim();
    if (!link) return;

    const supportedDomains = [
      "tiktok.com",
      "vt.tiktok.com",
      "vm.tiktok.com",
      "facebook.com",
      "fb.watch",
      "instagram.com",
      "youtu.be",
      "youtube.com",
      "twitter.com",
      "x.com",
      "pinterest.com"
    ];

    const isSupported = supportedDomains.some(domain => link.includes(domain));
    if (!isSupported) return;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const apiUrl = `${await baseApiUrl()}/alldl?url=${encodeURIComponent(link)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.result) throw new Error("❌ | Video link invalid or unsupported API response.");

      const videoBuffer = (await axios.get(data.result, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(filePath, videoBuffer);

      const shortUrl = await shortenURL(data.result);

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage({
        body: `${data.cp || "📥 Downloaded Video"}\n🔗 Link: ${shortUrl}`,
        attachment: fs.createReadStream(filePath),
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    } catch (error) {
      api.setMessageReaction("❎", event.messageID, () => {}, true);
      api.sendMessage(`❌ | Download failed:\n${error.message}`, event.threadID, event.messageID);
    }
  },
};
