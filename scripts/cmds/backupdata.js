const fs = require("fs-extra");
const path = require("path");

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗖𝗞𝗨𝗣 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    BACKUP: "💾",
    PROCESSING: "⏳",
    SECURITY: "🔒",
    FOLDER: "📁",
    FILE: "📄"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF"
  }
};

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━┛
${content}
${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

const ADMIN_ID = "61571630409265"; // Replace with actual admin ID

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "backupdata",
    version: "3.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Royal AI",
    countDown: 10,
    role: 2,
    shortDescription: "Royal data backup system",
    longDescription: "Securely backup all bot data with royal encryption",
    category: "owner",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗕𝗔𝗖𝗞𝗨𝗣 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} - Backup all bot data
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ Backups include:
        - Threads data
        - Users data
        - Dashboard data
        - Global data
        
        ✨ Files saved in:
        scripts/cmds/tmp/backup
      `
    }
  },

  langs: {
    en: {
      processing: "👑 Preparing royal backup, please wait...",
      backedUp: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗖𝗞𝗨𝗣 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘!\n${DESIGN.EMOJI.FOLDER} Backup saved to: scripts/cmds/tmp/backup\n${DESIGN.EMOJI.FILE} 4 files created",
      backupError: "❌ Royal backup failed: %1",
      permissionError: "🔒 Command restricted to admin only!",
      backupStarted: "👑 Initiating royal data backup sequence..."
    }
  },

  onStart: async function ({ message, getLang, threadsData, usersData, dashBoardData, globalData, api, event }) {
    try {
      // Admin check
      if (event.senderID !== ADMIN_ID) {
        return message.reply(
          formatMessage(getLang("permissionError"), "error")
        );
      }

      await simulateTyping(api, event.threadID);
      message.reply(
        formatMessage(getLang("backupStarted"), "info")
      );

      // Create backup directory with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = path.join(__dirname, "tmp", "backup", `backup-${timestamp}`);
      await fs.ensureDir(backupDir);

      // Backup notification
      message.reply(
        formatMessage(getLang("processing"), "info")
      );

      // Get all data
      const [globalDataBackup, threadsDataBackup, usersDataBackup, dashBoardDataBackup] = await Promise.all([
        globalData.getAll(),
        threadsData.getAll(),
        usersData.getAll(),
        dashBoardData.getAll()
      ]);

      // File definitions
      const files = [
        { data: threadsDataBackup, filename: "threadsData.json" },
        { data: usersDataBackup, filename: "usersData.json" },
        { data: dashBoardDataBackup, filename: "dashBoardData.json" },
        { data: globalDataBackup, filename: "globalData.json" }
      ];

      // Save files
      await Promise.all(
        files.map(file => 
          fs.writeJson(path.join(backupDir, file.filename), file.data, { spaces: 2 })
        )
      );

      // Get file streams
      const attachments = await Promise.all(
        files.map(file => 
          fs.createReadStream(path.join(backupDir, file.filename))
        )
      );

      await simulateTyping(api, event.threadID);
      
      // Send success message with files
      message.reply({
        body: formatMessage(
          getLang("backedUp")
            .replace("${DESIGN.EMOJI.FOLDER}", DESIGN.EMOJI.FOLDER)
            .replace("${DESIGN.EMOJI.FILE}", DESIGN.EMOJI.FILE),
          "success"
        ),
        attachment: attachments
      });

    } catch (err) {
      console.error("Royal Backup Error:", err);
      message.reply(
        formatMessage(getLang("backupError", err.message), "error")
      );
    }
  }
};
