const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ============================== ☣️ ATOMIC DESIGN SYSTEM ☣️ ============================== //
const design = {
  header: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗟𝗔𝗣 ⚡",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    slap: "👋",
    error: "⚠️",
    processing: "⚛️",
    success: "✅",
    user1: "👤",
    user2: "👥",
    atomic: "☢️"
  }
};

const formatMessage = (content) => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ======================================================================================== //

module.exports = {
  config: {
    name: "buttslap",
    aliases: ["atomicslap", "slap"],
    version: "3.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Deliver atomic-powered slaps",
    longDescription: "⚡ Generate high-energy slap memes with atomic precision",
    category: "entertainment",
    guide: {
      en: "{pn} @mention"
    }
  },

  langs: {
    en: {
      noTag: `${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗔𝗥𝗚𝗘𝗧 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ Please tag someone to unleash atomic slap`,
      processing: `${design.emoji.processing} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗟𝗔𝗣 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗜𝗢𝗡\n\n▸ Charging energy particles...`,
      failed: `${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Slap generation failed. Try again later.`
    }
  },

  onStart: async function ({ event, message, usersData, api, getLang }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];
      
      // Validate target
      if (!uid2) return message.reply(getLang("noTag"));
      
      // Show processing animation
      api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
      const processingMsg = await message.reply(getLang("processing"));
      
      // Get avatars
      const [avatarURL1, avatarURL2] = await Promise.all([
        usersData.getAvatarUrl(uid1),
        usersData.getAvatarUrl(uid2)
      ]);
      
      // Generate atomic slap
      const apiUrl = `https://api.memegen.link/v1/buttslap?avatar1=${encodeURIComponent(avatarURL1)}&avatar2=${encodeURIComponent(avatarURL2)}`;
      const imgResponse = await axios.get(apiUrl, { responseType: "arraybuffer" });
      
      // Save image
      const tmpPath = path.join(__dirname, "cache", `atomic_slap_${Date.now()}.png`);
      await fs.outputFile(tmpPath, imgResponse.data);
      
      // Get user names
      const userInfo = await Promise.all([
        usersData.getName(uid1),
        usersData.getName(uid2)
      ]);
      
      // Prepare success message
      const successContent = `${design.emoji.slap} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗟𝗔𝗣 𝗗𝗘𝗟𝗜𝗩𝗘𝗥𝗘𝗗!\n\n${design.emoji.user1} ${userInfo[0]}\n${design.emoji.atomic} → ${design.emoji.user2} ${userInfo[1]}`;
      
      // Send result
      await api.unsendMessage(processingMsg.messageID);
      api.setMessageReaction(design.emoji.success, event.messageID, () => {}, true);
      
      message.reply({
        body: formatMessage(successContent),
        attachment: fs.createReadStream(tmpPath)
      }, () => fs.unlink(tmpPath));
      
    } catch (err) {
      console.error("[Atomic Slap Error]", err);
      api.setMessageReaction(design.emoji.error, event.messageID, () => {}, true);
      message.reply(getLang("failed"));
    }
  }
};
