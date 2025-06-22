module.exports = {
  config: {
    name: "tid",
    aliases: ["threadid", "groupid"],
    version: "2.0",
    author: "NTKhang & Asif",
    countDown: 3,
    role: 0,
    description: {
      en: "✨ View detailed thread information ✨"
    },
    category: "info",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  📌 THREAD INFORMATION 📌
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ Simply type: {pn}

💎 Features:
✦ Thread ID
✦ Group name
✦ Member count
✦ Creation timestamp
✦ Admin list
      `
    }
  },

  onStart: async function ({ message, event, api, getLang }) {
    try {
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      
      // Format creation timestamp
      const creationDate = threadInfo.threadMetadata?.createdAt 
        ? new Date(threadInfo.threadMetadata.createdAt).toLocaleString()
        : "Unknown";
      
      // Get admin names
      let adminList = "Not available";
      if (threadInfo.adminIDs && threadInfo.adminIDs.length > 0) {
        const adminNames = await Promise.all(
          threadInfo.adminIDs.map(async admin => {
            const userInfo = await api.getUserInfo(admin.id);
            return userInfo[admin.id]?.name || admin.id;
          })
        );
        adminList = adminNames.join("\n» ");
      }

      // Prepare the response
      const response = `
🔍 Thread Information:
━━━━━━━━━━━━━━
📌 ID: ${threadID}
📛 Name: ${threadInfo.threadName || "Unnamed Group"}
👥 Members: ${threadInfo.participantIDs.length}
📅 Created: ${creationDate}

🛡️ Admins:
» ${adminList}
━━━━━━━━━━━━━━
`;

      return message.reply(response);
    } catch (error) {
      console.error("[TID COMMAND ERROR]", error);
      return message.reply("⚠️ An error occurred while fetching thread information. Please try again later.");
    }
  }
};
