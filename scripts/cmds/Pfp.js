const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ☣️⚛️ ATOMIC PROFILE VIEWER ⚛️☣️
const config = {
  TMP_DIR: path.join(__dirname, 'cache'),
  DESIGN: {
    HEADER: "☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ⚛️☣️",
    FOOTER: "✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡 ⚡️",
    SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
    EMOJI: {
      SUCCESS: "✅",
      ERROR: "❌",
      PROCESSING: "⏳",
      PROFILE: "👤",
      INFO: "📝"
    }
  }
};

// ▰▰▰▰▰▰▰▰▰▰ PROGRESS BAR ▰▰▰▰▰▰▰▰▰▰
function generateProgressBar(percentage) {
  const blocks = 15;
  const completed = Math.round(blocks * (percentage / 100));
  return `▰`.repeat(completed) + `▱`.repeat(blocks - completed);
}

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp", "userinfo"],
    version: "4.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "☣️⚛️ View user profiles",
    longDescription: "Display detailed user profiles with Atomic design",
    category: "info",
    guide: {
      en: "{p}profile [@mention|reply]"
    }
  },

  langs: {
    en: {
      processing: "🔍 Retrieving profile data...",
      success: "👤 User profile retrieved",
      noAvatar: "⚠️ No profile picture available",
      invalidUser: "⚠️ User not found",
      error: "⚠️ System error during profile retrieval"
    }
  },

  onStart: async function ({ event, api, message, getLang, usersData, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    // Format Atomic message
    const formatAtomicMessage = (content) => {
      return `${config.DESIGN.HEADER}\n${config.DESIGN.SEPARATOR}\n${content}\n${config.DESIGN.SEPARATOR}\n${config.DESIGN.FOOTER}`;
    };

    // Send Atomic-styled message
    const sendAtomicMessage = async (content, attachment = null) => {
      return api.sendMessage({
        body: formatAtomicMessage(content),
        attachment
      }, threadID);
    };

    // Show processing animation
    api.setMessageReaction(config.DESIGN.EMOJI.PROCESSING, messageID, () => {}, true);
    const processingMsg = await sendAtomicMessage(
      `${config.DESIGN.EMOJI.PROCESSING} ${getLang("processing")}\n` +
      `${generateProgressBar(30)} 30%`
    );

    try {
      // Create temp directory
      await fs.ensureDir(config.TMP_DIR);
      
      // Update progress
      await api.sendMessage(
        formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} Accessing user data...\n` +
          `${generateProgressBar(60)} 60%`
        ),
        threadID
      );

      // Determine target user
      let targetID = senderID;
      if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      } else if (messageReply) {
        targetID = messageReply.senderID;
      }

      // Fetch user info
      const userInfo = await api.getUserInfo(targetID);
      if (!userInfo[targetID]) {
        await api.unsendMessage(processingMsg.messageID);
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.ERROR} ${getLang("invalidUser")}`
        );
      }

      const user = userInfo[targetID];
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const profilePath = path.join(config.TMP_DIR, `profile_${targetID}_${Date.now()}.jpg`);

      // Update progress
      await api.sendMessage(
        formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} Loading profile image...\n` +
          `${generateProgressBar(90)} 90%`
        ),
        threadID
      );

      // Download profile picture
      try {
        const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(profilePath, Buffer.from(response.data, 'binary'));
      } catch (e) {
        // If download fails, proceed without attachment
      }

      // Format user information
      const genderMap = {
        1: "👨 Male",
        2: "👩 Female",
        3: "⚧️ Custom"
      };

      const userData = await usersData.get(targetID);
      const joinDate = moment(userData.createdAt).format("DD/MM/YYYY");
      const lastActive = moment(userData.lastUpdated).fromNow();
      
      const infoMessage = `
👤 ${user.name}'s Profile:
${config.DESIGN.SEPARATOR}
📝 Name: ${user.name}
🆔 UID: ${targetID}
📅 Join Date: ${joinDate}
🕒 Last Active: ${lastActive}
${config.DESIGN.SEPARATOR}
🔍 Additional Info:
• Gender: ${genderMap[user.gender] || "❓ Unknown"}
• Followers: ${user.follow || "N/A"}
• Relationship: ${user.relationship_status || "❓ Unknown"}
${config.DESIGN.SEPARATOR}
⏱️ Retrieved: ${time}
      `.trim();

      // Send final result
      await api.unsendMessage(processingMsg.messageID);
      
      if (fs.existsSync(profilePath)) {
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.SUCCESS} ${getLang("success")}\n${infoMessage}`,
          fs.createReadStream(profilePath)
        );
      } else {
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.WARNING} ${getLang("noAvatar")}\n${infoMessage}`
        );
      }

    } catch (error) {
      console.error("Atomic profile error:", error);
      await api.unsendMessage(processingMsg.messageID);
      return sendAtomicMessage(
        `${config.DESIGN.EMOJI.ERROR} ${getLang("error")}\n` +
        `🔧 Error: ${error.message || "Unknown"}\n` +
        `${config.DESIGN.SEPARATOR}\n` +
        `💡 Try again later or contact support`
      );
    }
  }
};
