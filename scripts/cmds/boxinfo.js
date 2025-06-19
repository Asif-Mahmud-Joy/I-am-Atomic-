// ============================== 👑 ROYAL CONFIGURATION 👑 ============================== //
const ADMIN_IDS = ["61571630409265"]; // Replace with your admin IDs
// ====================================================================================== //

// =============================== 🎨 ROYAL DESIGN SYSTEM 🎨 =============================== //
const design = {
  header: "👑 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  separator: "✨══════════════════════════✨",
  emoji: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "📋",
    group: "🏰",
    members: "👥",
    admins: "👑",
    messages: "💬",
    approval: "🔐",
    emojiIcon: "😄",
    male: "👨‍💼",
    female: "👩‍💼",
    unknown: "❓",
    processing: "⏳",
    crown: "👑",
    lock: "🔒",
    unlock: "🔓"
  }
};

const formatMessage = (content) => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ======================================================================================== //

const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo", "ginfo"],
    version: "3.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Royal Designer",
    countDown: 5,
    role: 0,
    shortDescription: "View royal group information",
    longDescription: "Display comprehensive group details with royal design and animations",
    category: "box chat",
    guide: {
      en: `{pn}: Display group information\nExample: {pn}`,
      vi: `{pn}: Hiển thị thông tin nhóm\nVí dụ: {pn}`,
      bn: `{pn}: গ্রুপের তথ্য দেখান\nউদাহরণ: {pn}`
    }
  },

  langs: {
    en: {
      groupInfo: `${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲: %1\n${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: %2\n${design.emoji.messages} 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: %3\n${design.emoji.approval} 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗠𝗼𝗱𝗲: %4\n${design.emoji.emojiIcon} 𝗘𝗺𝗼𝗷𝗶: %5\n\n${design.emoji.members} 𝗠𝗲𝗺𝗯𝗲𝗿𝘀:\n${design.emoji.male} Male: %7\n${design.emoji.female} Female: %8\n${design.emoji.unknown} Unknown: %9\n\n${design.emoji.admins} 𝗔𝗱𝗺𝗶𝗻𝘀 (%10):\n%11`,
      noAdmins: "No administrators",
      noEmoji: "None",
      approvalOn: `${design.emoji.lock} Enabled`,
      approvalOff: `${design.emoji.unlock} Disabled`,
      unnamedGroup: "Unnamed Group",
      errorFetching: "Failed to fetch group information",
      imageError: "Could not retrieve group image",
      created: "📅 Created: %1",
      timezone: "🌐 Timezone: %1"
    },
    vi: {
      groupInfo: `${design.emoji.group} 𝗧𝗲̂𝗻 𝗻𝗵𝗼́𝗺: %1\n${design.emoji.group} 𝗜𝗗 𝗻𝗵𝗼́𝗺: %2\n${design.emoji.messages} 𝗧𝗼̂̉𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻: %3\n${design.emoji.approval} 𝗖𝗵𝗲̂́ đ𝗼̣̂ 𝗽𝗵𝗲̂ 𝗱𝘂𝘆𝗲̣̂𝘁: %4\n${design.emoji.emojiIcon} 𝗕𝗶𝗲̂̉𝘂 𝘁𝘂̛𝗼̛̣𝗻𝗴 𝗰𝗮̉𝗺 𝘅𝘂́𝗰: %5\n\n${design.emoji.members} 𝗧𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻:\n${design.emoji.male} Nam: %7\n${design.emoji.female} Nữ: %8\n${design.emoji.unknown} K𝗵𝗼̂𝗻𝗴 𝘅𝗮́𝗰 đ𝗶̣𝗻𝗵: %9\n\n${design.emoji.admins} 𝗤𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻 (%10):\n%11`,
      noAdmins: "Không có quản trị viên",
      noEmoji: "Không có",
      approvalOn: `${design.emoji.lock} Bật`,
      approvalOff: `${design.emoji.unlock} Tắt`,
      unnamedGroup: "Nhóm Không Tên",
      errorFetching: "Đã xảy ra lỗi khi lấy thông tin nhóm",
      imageError: "Không thể lấy hình ảnh nhóm",
      created: "📅 Ngày tạo: %1",
      timezone: "🌐 Múi giờ: %1"
    },
    bn: {
      groupInfo: `${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽𝗲𝗿 𝗡𝗮𝗺: %1\n${design.emoji.group} 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: %2\n${design.emoji.messages} 𝗠𝗼𝘁 𝗯𝗮𝗿𝘁𝗮: %3\n${design.emoji.approval} 𝗔𝗻𝘂𝗺𝗼𝗱𝗼𝗻 𝗺𝗼𝗱: %4\n${design.emoji.emojiIcon} 𝗜𝗺𝗼𝗷𝗶: %5\n\n${design.emoji.members} 𝗦𝗱𝗮𝗺𝘀𝘆𝗮:\n${design.emoji.male} Purush: %7\n${design.emoji.female} Mohila: %8\n${design.emoji.unknown} Ajana: %9\n\n${design.emoji.admins} 𝗔𝗱𝗺𝗶𝗻 (%10):\n%11`,
      noAdmins: "কোনো অ্যাডমিন নেই",
      noEmoji: "কিছুই নেই",
      approvalOn: `${design.emoji.lock} চালু`,
      approvalOff: `${design.emoji.unlock} বন্ধ`,
      unnamedGroup: "নামহীন গ্রুপ",
      errorFetching: "গ্রুপের তথ্য আনতে ত্রুটি হয়েছে",
      imageError: "গ্রুপের ছবি আনতে ব্যর্থ হয়েছে",
      created: "📅 তৈরি হয়েছে: %1",
      timezone: "🌐 সময় অঞ্চল: %1"
    }
  },

  onStart: async function ({ api, event, getLang }) {
    const imagePath = __dirname + "/cache/groupImage.png";
    
    // Show typing animation
    api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
    
    const sendRoyalMessage = (content, attachment = null) => {
      setTimeout(() => {
        api.sendMessage(
          { 
            body: formatMessage(content),
            attachment 
          },
          event.threadID,
          () => {
            api.setMessageReaction("", event.messageID, () => {}, true);
            if (attachment) fs.unlinkSync(imagePath);
          },
          event.messageID
        );
      }, 1500);
    };

    try {
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
        ? moment(threadInfo.threadCreationTimestamp).tz(global.GoatBot.config.timeZone).format("DD/MM/YYYY HH:mm")
        : "Unknown";
      
      // Gender breakdown
      let maleCount = 0, femaleCount = 0, unknownCount = 0;
      for (const user of threadInfo.userInfo || []) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else unknownCount++;
      }

      // Admin list
      const adminNames = await Promise.all(
        adminIDs.map(async (admin) => {
          const info = await api.getUserInfo(admin.id);
          return `👑 ${info[admin.id].name}`;
        })
      );
      const adminList = adminNames.length ? adminNames.join("\n") : getLang("noAdmins");

      // Prepare message
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
      
      // Add creation date and timezone
      const fullMessage = `${messageBody}\n\n${getLang("created", createdDate)}\n${getLang("timezone", global.GoatBot.config.timeZone)}`;

      // Image fetch
      if (threadInfo.imageSrc) {
        try {
          const response = await axios.get(threadInfo.imageSrc, {
            responseType: "arraybuffer"
          });
          fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));
          sendRoyalMessage(fullMessage, fs.createReadStream(imagePath));
        } catch (imageError) {
          console.error("Image fetch error:", imageError);
          sendRoyalMessage(`${getLang("imageError")}\n\n${fullMessage}`);
        }
      } else {
        sendRoyalMessage(fullMessage);
      }
    } catch (error) {
      console.error("Group info error:", error);
      sendRoyalMessage(`${design.emoji.error} ${getLang("errorFetching")}`);
    }
  }
};
