const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rbg",
    aliases: [],
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    version: "3.1",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Remove background from image"
    },
    longDescription: {
      en: "Remove the background from an image by replying to it. Uses open-source free API."
    },
    category: "image",
    guide: {
      en: "{p}{n} [reply to an image]"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;
    const tempPath = path.join(__dirname, "cache", `removed_bg_${Date.now()}.png`);

    if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
      return api.sendMessage("📸 Please reply to a photo to remove background.", threadID, messageID);
    }

    const imageURL = messageReply.attachments[0].url;
    const processingMsg = "🕟 Removing background, please wait...";
    api.sendMessage(processingMsg, threadID, async () => {
      try {
        // Using open-source free API
        const response = await axios.get(`https://bg.remove.bgdev.online/remove?image_url=${encodeURIComponent(imageURL)}`, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(tempPath, response.data);

        api.sendMessage({
          body: "✅ Background removed successfully (Open Source API)!",
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath), messageID);
      } catch (error) {
        console.error("OpenSource RemoveBG Error:", error.response?.data || error.message);
        api.sendMessage("❌ Background removal failed. Please try again later.", threadID, messageID);
      }
    });
  }
};
