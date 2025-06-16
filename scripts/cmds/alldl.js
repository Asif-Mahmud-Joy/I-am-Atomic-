const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return base.data.api;
};

module.exports = {
  config: {
    name: "alldl",
    version: "2.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 2,
    role: 0,
    description: {
      en: "Download video from TikTok, Facebook, Instagram, YouTube, and more."
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{pn} <video_link> or reply to a message containing a link."
    }
  },

  onStart: async function ({ api, args, event }) {
    const inputUrl = event.messageReply?.body || args[0];
    const threadID = event.threadID;
    const messageID = event.messageID;

    if (!inputUrl) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❗ Please provide a valid link to download.", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(`${apiUrl}/alldl?url=${encodeURIComponent(inputUrl)}`);

      const filePath = path.join(__dirname, "cache", "video_download.mp4");
      await fs.ensureDir(path.join(__dirname, "cache"));

      const videoData = await axios.get(data.result, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, Buffer.from(videoData.data, "binary"));

      const shortUrl = await global.utils.shortenURL(data.result);

      await api.sendMessage({
        body: `${data.cp || "✅ Download complete."}\n🔗 Link: ${shortUrl}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);

      // Extra support for imgur direct download
      if (inputUrl.startsWith("https://i.imgur.com")) {
        const ext = path.extname(inputUrl);
        const imgPath = path.join(__dirname, "cache", `imgur_download${ext}`);
        const imgData = await axios.get(inputUrl, { responseType: "arraybuffer" });
        await fs.writeFile(imgPath, Buffer.from(imgData.data, "binary"));

        await api.sendMessage({
          body: `🖼️ Image downloaded from Imgur`,
          attachment: fs.createReadStream(imgPath)
        }, threadID, () => fs.unlinkSync(imgPath), messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❎", messageID, () => {}, true);
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
