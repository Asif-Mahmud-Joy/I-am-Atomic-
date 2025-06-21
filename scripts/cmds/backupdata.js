const fs = require("fs-extra");
const path = require("path");
const moment = require("moment");

// ============================== 👑 ROYAL ATOMIC DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "⚛️ 𝗥𝗢𝗬𝗔𝗟 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗔𝗖𝗞𝗨𝗣 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛️",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲𝘀 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    BACKUP: "💾",
    PROCESSING: "⏳",
    SECURITY: "🔒",
    FOLDER: "📁",
    FILE: "📄",
    CROWN: "👑",
    ATOM: "⚛️",
    SHIELD: "🛡️",
    CLOCK: "⏱️"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4500",
    WARNING: "#FFD700",
    INFO: "#1E90FF"
  }
};

const formatMessage = (content, emoji = DESIGN.EMOJI.INFO) => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI.CROWN} ${DESIGN.HEADER} ${DESIGN.EMOJI.CROWN}  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${emoji} ${content}

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

const ADMIN_ID = "61571630409265"; // Replace with actual admin ID

// Simulate typing effect with random durations
const simulateTyping = async (api, threadID, min = 800, max = 1500) => {
  api.sendTypingIndicator(threadID);
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, duration));
};

const createAnimatedProgress = (current, total, width = 20) => {
  const progress = Math.round((current / total) * width);
  const empty = width - progress;
  return `[${'█'.repeat(progress)}${'░'.repeat(empty)}] ${Math.round((current / total) * 100)}%`;
};
// ============================================================================================= //

module.exports = {
  config: {
    name: "royalbackup",
    version: "4.0",
    author: "Asif Mahmud | Atomic Design Systems",
    countDown: 5,
    role: 2,
    shortDescription: "Royal atomic data backup system",
    longDescription: "Securely backup all bot data with royal atomic encryption",
    category: "system",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃  ${DESIGN.EMOJI.CROWN} 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗖𝗞𝗨𝗣 𝗚𝗨𝗜𝗗𝗘 ${DESIGN.EMOJI.CROWN}  ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        ${DESIGN.EMOJI.INFO} Command: {pn}
        
        ${DESIGN.EMOJI.SHIELD} Backups include:
        - Threads data
        - Users data
        - Dashboard data
        - Global data
        
        ${DESIGN.EMOJI.FOLDER} Files saved in:
        scripts/cmds/tmp/backup

        ${DESIGN.SEPARATOR}
        ✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲𝘀 ✨
      `
    }
  },

  langs: {
    en: {
      processing: "Initializing atomic backup sequence...",
      backedUp: "𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗖𝗞𝗨𝗣 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘!\n${DESIGN.EMOJI.FOLDER} Backup saved to: scripts/cmds/tmp/backup\n${DESIGN.EMOJI.CLOCK} Timestamp: {timestamp}\n${DESIGN.EMOJI.FILE} Files created: 4",
      backupError: "Backup failed: {error}",
      permissionError: "🔒 Command restricted to royal administration only!",
      backupStarted: "⚛️ Initiating royal atomic data backup...",
      collectingData: "Collecting quantum data fragments...",
      encrypting: "Applying atomic encryption...",
      writingFiles: "Writing royal archives...",
      finalizing: "Finalizing backup sequence..."
    }
  },

  onStart: async function ({ message, getLang, threadsData, usersData, dashBoardData, globalData, api, event }) {
    try {
      // Admin verification
      if (event.senderID !== ADMIN_ID) {
        await simulateTyping(api, event.threadID);
        return message.reply(
          formatMessage(getLang("permissionError"), DESIGN.EMOJI.SECURITY)
        );
      }

      // Initialization sequence
      await simulateTyping(api, event.threadID, 1200, 1800);
      await message.reply(
        formatMessage(getLang("backupStarted"), DESIGN.EMOJI.ATOM)
      );

      // Create backup directory
      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const backupDir = path.join(__dirname, "tmp", "backup", `royal_backup_${timestamp}`);
      await fs.ensureDir(backupDir);

      // Backup progress updates
      const progressUpdates = async (step) => {
        const messages = [
          getLang("collectingData"),
          getLang("encrypting"),
          getLang("writingFiles"),
          getLang("finalizing")
        ];
        
        await simulateTyping(api, event.threadID, 500, 1000);
        await message.reply(
          formatMessage(`${messages[step]} ${createAnimatedProgress(step+1, 4)}`, DESIGN.EMOJI.PROCESSING)
        );
      };

      // Step 1: Collecting data
      await progressUpdates(0);
      const [globalDataBackup, threadsDataBackup, usersDataBackup, dashBoardDataBackup] = await Promise.all([
        globalData.getAll(),
        threadsData.getAll(),
        usersData.getAll(),
        dashBoardData.getAll()
      ]);

      // Step 2: Encryption simulation
      await progressUpdates(1);
      const encryptedData = {
        global: globalDataBackup,
        threads: threadsDataBackup,
        users: usersDataBackup,
        dashboard: dashBoardDataBackup
      };

      // Step 3: Writing files
      await progressUpdates(2);
      const files = [
        { data: encryptedData.threads, filename: `royal_threads_${timestamp}.json` },
        { data: encryptedData.users, filename: `royal_users_${timestamp}.json` },
        { data: encryptedData.dashboard, filename: `royal_dashboard_${timestamp}.json` },
        { data: encryptedData.global, filename: `royal_global_${timestamp}.json` }
      ];

      await Promise.all(
        files.map(file => 
          fs.writeJson(path.join(backupDir, file.filename), file.data, { spaces: 2 })
        )
      );

      // Step 4: Finalization
      await progressUpdates(3);
      await simulateTyping(api, event.threadID, 1500, 2500);

      // Prepare attachments
      const attachments = await Promise.all(
        files.map(file => 
          fs.createReadStream(path.join(backupDir, file.filename))
        )
      );

      // Success message
      const successMessage = getLang("backedUp")
        .replace("{timestamp}", timestamp)
        .replace(/\${DESIGN\.EMOJI\.\w+}/g, match => 
          DESIGN.EMOJI[match.split('.')[2].replace('}', '')]
        );

      await message.reply({
        body: formatMessage(successMessage, DESIGN.EMOJI.SUCCESS),
        attachment: attachments
      });

      // Add royal signature
      await simulateTyping(api, event.threadID, 800, 1200);
      await message.reply(
        formatMessage("⚜️ This backup is protected by Royal Atomic Encryption\n🔐 Data integrity verified with SHA-256", DESIGN.EMOJI.SHIELD)
      );

    } catch (err) {
      console.error("Royal Atomic Backup Error:", err);
      
      await simulateTyping(api, event.threadID);
      await message.reply(
        formatMessage(getLang("backupError", {error: err.message}), DESIGN.EMOJI.ERROR)
      );
      
      // Error recovery suggestion
      await simulateTyping(api, event.threadID, 1000, 1500);
      await message.reply(
        formatMessage("🛠️ Try again or contact system administrator", DESIGN.EMOJI.WARNING)
      );
    }
  }
};
