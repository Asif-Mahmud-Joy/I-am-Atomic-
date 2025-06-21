const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");

// ============================== ☣️ ATOMIC DESIGN SYSTEM ☣️ ============================== //
const design = {
  header: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗧𝗘𝗟𝗟𝗜𝗚𝗘𝗡𝗖𝗘 ⚡",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    group: "🏰",
    members: "👥",
    admins: "👑",
    messages: "💬",
    approval: "🔐",
    emojiIcon: "😄",
    male: "👨‍💼",
    female: "👩‍💼",
    unknown: "❓",
    processing: "⚛️",
    success: "✅",
    error: "⚠️",
    time: "⏳",
    globe: "🌐",
    lock: "🔒",
    unlock: "🔓",
    created: "📅"
  },
  colors: {
    primary: "\x1b[1;36m", // Cyan
    secondary: "\x1b[1;35m", // Magenta
    reset: "\x1b[0m"
  }
};

const formatMessage = (content) => {
  return `${design.colors.primary}${design.header}${design.colors.reset}\n${design.separator}\n${content}\n${design.separator}\n${design.colors.secondary}${design.footer}${design.colors.reset}`;
};
// ======================================================================================== //

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo", "ginfo", "atomicgroup"],
    version: "4.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ View atomic group intelligence",
    longDescription: "⚡ Access comprehensive group analytics with atomic precision",
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      groupInfo: `${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲: ${design.colors.primary}%1${design.colors.reset}\n${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: ${design.colors.secondary}%2${design.colors.reset}\n${design.emoji.messages} 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${design.colors.primary}%3${design.colors.reset}\n${design.emoji.approval} 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝗲: %4\n${design.emoji.emojiIcon} 𝗘𝗺𝗼𝗷𝗶: %5\n\n${design.emoji.members} 𝗠𝗲𝗺𝗯𝗲𝗿𝘀:\n${design.emoji.male} Male: %7\n${design.emoji.female} Female: %8\n${design.emoji.unknown} Unknown: %9\n\n${design.emoji.admins} 𝗔𝗱𝗺𝗶𝗻𝘀 (%10):\n%11`,
      noAdmins: "No administrators",
      noEmoji: "None",
      approvalOn: `${design.emoji.lock} Enabled`,
      approvalOff: `${design.emoji.unlock} Disabled`,
      unnamedGroup: "Unnamed Group",
      errorFetching: "⚠️ Failed to retrieve group intelligence",
      imageError: "⚠️ Could not access group visual data",
      created: `${design.emoji.created} Created: %1`,
      timezone: `${design.emoji.globe} Timezone: %1`,
      processing: `${design.emoji.processing} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗖𝗔𝗡𝗡𝗜𝗡𝗚\n\n▸ Analyzing group structure...`
    }
  },

  onStart: async function ({ api, event, getLang }) {
    const imagePath = __dirname + "/cache/atomic_group.png";
    
    try {
      // Show processing animation
      api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
      const processingMsg = await api.sendMessage(getLang("processing"), event.threadID);
      
      // Get group information
      const threadInfo = await api.getThreadInfo(event.threadID);
      
      // Group details
      const totalMembers = threadInfo.participantIDs.length;
      const totalMessages = threadInfo.messageCount || 0;
      const threadName = threadInfo.threadName || getLang("unnamedGroup");
      const threadID = threadInfo.threadID;
      const emoji = threadInfo.emoji || getLang("noEmoji");
      const approvalMode = threadInfo.approvalMode ? getLang("approvalOn") : getLang("approvalOff");
      const adminIDs = threadInfo.adminIDs || [];
      
      // Group creation date
      const createdDate = threadInfo.threadCreationTimestamp 
        ? moment(threadInfo.threadCreationTimestamp).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm")
        : "Unknown";
      
      // Gender analysis
      let maleCount = 0, femaleCount = 0, unknownCount = 0;
      for (const user of threadInfo.userInfo || []) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else unknownCount++;
      }

      // Admin intelligence
      const adminNames = await Promise.all(
        adminIDs.map(async (admin) => {
          const info = await api.getUserInfo(admin.id);
          return `👑 ${info[admin.id].name}`;
        })
      );
      const adminList = adminNames.length ? adminNames.join("\n") : getLang("noAdmins");

      // Prepare atomic report
      const messageBody = getLang(
        "groupInfo",
        threadName,
        threadID,
        totalMessages.toLocaleString(),
        approvalMode,
        emoji,
        totalMembers,
        maleCount,
        femaleCount,
        unknownCount,
        adminIDs.length,
        adminList
      );
      
      // Add temporal data
      const fullMessage = `${messageBody}\n\n${getLang("created", createdDate)}\n${getLang("timezone", "Asia/Dhaka")}`;

      // Atomic visual acquisition
      let attachment = null;
      if (threadInfo.imageSrc) {
        try {
          const response = await axios.get(threadInfo.imageSrc, {
            responseType: "arraybuffer"
          });
          fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));
          attachment = fs.createReadStream(imagePath);
        } catch (imageError) {
          console.error("Atomic image error:", imageError);
        }
      }

      // Send atomic intelligence report
      await api.unsendMessage(processingMsg.messageID);
      api.setMessageReaction(design.emoji.success, event.messageID, () => {}, true);
      
      const finalContent = formatMessage(fullMessage);
      await api.sendMessage({
        body: finalContent,
        attachment
      }, event.threadID, () => {
        if (attachment) fs.unlinkSync(imagePath);
      });

    } catch (error) {
      console.error("Atomic group intel error:", error);
      api.setMessageReaction(design.emoji.error, event.messageID, () => {}, true);
      const errorMsg = formatMessage(`${design.emoji.error} ${getLang("errorFetching")}`);
      api.sendMessage(errorMsg, event.threadID);
    }
  }
};
