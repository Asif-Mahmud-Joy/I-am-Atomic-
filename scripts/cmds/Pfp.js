const axios = require("axios");

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Profile picture dekhao",
    longDescription: "Kono user er profile picture dekhanor command.",
    category: "image",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const replyID = event.messageReply?.senderID;
      const mentionID = Object.keys(event.mentions || {})[0];
      const selfID = event.senderID;

      const targetID = replyID || mentionID || selfID;
      const avatarURL = await usersData.getAvatarUrl(targetID);

      message.reply({
        body: `🖼️ Profile picture` + (targetID === selfID ? ` (tomar)` : "") + `:`,
        attachment: await global.utils.getStreamFromURL(avatarURL)
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | Profile picture ber korte somossa hoyeche.");
    }
  }
};
