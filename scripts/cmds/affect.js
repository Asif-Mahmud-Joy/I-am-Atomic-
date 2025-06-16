const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "affect",
    version: "2.0", // ✅ Updated
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Affect meme with your avatar",
    longDescription: "Apnar avatar diye 'affect' meme banay.",
    category: "image",
    guide: {
      en: "{pn} [@mention | reply | blank]",
      bn: "{pn} [@mention koren | reply den | na hole nijer dp nibe]"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      const uid =
        Object.keys(event.mentions)[0] ||
        (event.type === "message_reply" ? event.messageReply.senderID : event.senderID);

      const avatarURL = await usersData.getAvatarUrl(uid);

      const res = await axios.get(`https://some-random-api.com/canvas/affect?avatar=${encodeURIComponent(avatarURL)}`, {
        responseType: 'arraybuffer'
      });

      const imgBuffer = Buffer.from(res.data, "binary");
      const imgPath = path.join(__dirname, "tmp", `${uid}_affect.png");

      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, imgBuffer);

      message.reply({
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));
    } catch (err) {
      console.error(err);
      message.reply("❌ Bhai, meme generate korte problem hoise. Please abar try koren!");
    }
  }
};
