const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cry",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 1,
    role: 0,
    shortDescription: "cry meme",
    longDescription: "cry meme with user avatar",
    category: "meme",
    guide: "{pn} [tag or reply]"
  },

  langs: {
    en: {
      noTag: "Tag koro ba reply dao karo message, naile nijer photo diye cry banabo 😢",
      crySelf: "Tui nijer upor nijer e cry korteso 😭",
      cryOther: "E jon tomae cry kortese 😭"
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    try {
      const mention = Object.keys(event.mentions);
      let uid;

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (mention[0]) {
        uid = mention[0];
      } else {
        uid = event.senderID;
      }

      const avatarUrl = await usersData.getAvatarUrl(uid);
      const apiUrl = `https://some-random-api.com/canvas/cry?avatar=${encodeURIComponent(avatarUrl)}`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(response.data);

      const tempPath = path.join(__dirname, "tmp", `cry_${uid}.png");
      fs.ensureDirSync(path.dirname(tempPath));
      fs.writeFileSync(tempPath, imgBuffer);

      const body = (uid === event.senderID)
        ? getLang("crySelf")
        : getLang("cryOther");

      message.reply({ body, attachment: fs.createReadStream(tempPath) }, () => fs.unlinkSync(tempPath));
    } catch (err) {
      console.error("[cry] error:", err);
      message.reply("⛔ Cry command e error lagse. Try again later.");
    }
  }
};
