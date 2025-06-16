const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ads",
    version: "2.0", // ✅ Updated
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 2,
    role: 0,
    shortDescription: "Ad poster with FB avatar",
    longDescription: "Create an advertisement post using profile picture",
    category: "image",
    guide: "{pn} [@mention | reply | leave blank]",
  },

  onStart: async function ({ event, message, usersData, args }) {
    try {
      // 🆔 Determine target UID
      const mention = Object.keys(event.mentions);
      let uid = event.senderID;

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (mention.length > 0) {
        uid = mention[0];
      }

      // 🖼️ Get user avatar URL
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Ad().getImage(avatarURL);

      // 🗂️ Ensure tmp directory exists
      const tmpPath = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);

      const savePath = `${tmpPath}/${uid}_ads.png`;
      fs.writeFileSync(savePath, Buffer.from(img));

      // 📤 Send image
      const tagName = await usersData.getName(uid);
      const bodyMsg = `🔥 Latest Brand In The Market: ${tagName} 🛍️`;

      message.reply({
        body: bodyMsg,
        attachment: fs.createReadStream(savePath)
      }, () => fs.unlinkSync(savePath));
    } catch (err) {
      message.reply("❌ Ads command e kichu problem hoise:\n" + err.message);
    }
  }
};
