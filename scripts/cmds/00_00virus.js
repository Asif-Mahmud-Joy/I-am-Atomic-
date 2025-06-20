const fs = require('fs').promises;
const path = require('path');

// Atomic Design Constants
const ATOMIC_BORDER = "☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️";
const ATOMIC_HEADER = "☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐕𝐈𝐑𝐔𝐒𝐈𝐍𝐅𝐎 ════ ☢️";
const ATOMIC_FOOTER = "☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️";

// Enhanced typing effect for atomic design
async function atomicTypingEffect(api, threadID, message = "⚛️ 𝐀𝐭𝐨𝐦𝐢𝐜 𝐬𝐲𝐬𝐭𝐞𝐦 𝐬𝐜𝐚𝐧𝐧𝐢𝐧𝐠...") {
  const symbols = ["💫", "⚡", "🔧", "💾", "🔒", "💻"];
  let sentMsg = null;
  
  try {
    sentMsg = await api.sendMessage(
      `${ATOMIC_BORDER}\n⚛️ | ${message} ${symbols[0]}\n${ATOMIC_FOOTER}`,
      threadID
    );
    
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 400));
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const newContent = `${ATOMIC_BORDER}\n⚛️ | ${message} ${symbol}\n${ATOMIC_FOOTER}`;
      
      try {
        if (sentMsg) await api.unsendMessage(sentMsg.messageID);
        sentMsg = await api.sendMessage(newContent, threadID);
      } catch {}
    }
  } catch (error) {
    // Fail silently
  } finally {
    try { 
      if (sentMsg) await api.unsendMessage(sentMsg.messageID); 
    } catch {}
  }
}

// Atomic message formatter
function formatAtomicMessage(title, content, emoji = "⚛️") {
  return (
    `${ATOMIC_HEADER}\n\n` +
    `${emoji} | ${content}\n\n` +
    `☣️ ────────────────────────────────\n` +
    `⚡ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐂𝐎𝐑𝐄 𝐕𝟐.𝟏 | ⏱️ ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n` +
    `💫 | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐕𝐈𝐑𝐔𝐒𝐈𝐍𝐅𝐎`
  );
}

module.exports = {
  config: {
    name: "virusinfo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "3.0",
    countDown: 5,
    role: 2,
    category: "admin",
    shortDescription: {
      en: "⚛️ Atomic mass command updater"
    },
    longDescription: {
      en: "Set meta fields in all commands with atomic precision"
    },
    guide: {
      en: "{pn} [credits] [category] [version] [longDesc] [shortDesc] [author] [role] [hasPermission] [usePrefix]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const commandsPath = path.join(__dirname, '..');
    const backupFolder = path.join(commandsPath, 'atomic_backup_' + Date.now());
    const threadID = event.threadID;

    try {
      // Show initial scanning animation
      await atomicTypingEffect(api, threadID, "𝐈𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠 𝐚𝐭𝐨𝐦𝐢𝐜 𝐬𝐜𝐚𝐧...");

      // Input validation
      const newCredits = args[0] || "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝";
      const newCategory = args[1] || "admin";
      const newVersion = args[2] || "3.0";
      const newLongDescription = args[3] || "Set meta fields in all commands with atomic precision";
      const newShortDescription = args[4] || "⚛️ Atomic mass command updater";
      const newAuthor = args[5] || "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝";
      const newRole = parseInt(args[6]) || 2;
      const newHasPermission = args[7] || "";
      const newUsePrefix = args[8] === "true";

      // Validation with atomic error messages
      if (!/^\d+\.\d+$/.test(newVersion)) {
        return api.sendMessage(
          formatAtomicMessage(
            "𝐕𝐀𝐋𝐈𝐃𝐀𝐓𝐈𝐎𝐍 𝐄𝐑𝐑𝐎𝐑",
            "❌ Version must follow atomic format: X.X (e.g. 3.0)\n\n💻 Example: virusinfo credits admin 3.0",
            "⚠️"
          ),
          threadID
        );
      }

      if (args[6] && isNaN(newRole)) {
        return api.sendMessage(
          formatAtomicMessage(
            "𝐕𝐀𝐋𝐈𝐃𝐀𝐓𝐈𝐎𝐍 𝐄𝐑𝐑𝐎𝐑",
            "❌ Role must be a numerical atomic identifier\n\n⚙️ Example: virusinfo credits admin 3.0 \"desc\" \"short\" author 2",
            "⚠️"
          ),
          threadID
        );
      }

      // Show backup animation
      await atomicTypingEffect(api, threadID, "𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐚𝐭𝐨𝐦𝐢𝐜 𝐛𝐚𝐜𝐤𝐮𝐩...");

      // Create atomic backup
      await fs.mkdir(backupFolder, { recursive: true });
      const files = await fs.readdir(commandsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      for (const file of jsFiles) {
        await fs.copyFile(path.join(commandsPath, file), path.join(backupFolder, file));
      }

      // Show processing animation
      await atomicTypingEffect(api, threadID, "𝐔𝐩𝐝𝐚𝐭𝐢𝐧𝐠 𝐚𝐭𝐨𝐦𝐢𝐜 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬...");

      // Update files with atomic precision
      for (const file of jsFiles) {
        const filePath = path.join(commandsPath, file);
        let content = await fs.readFile(filePath, 'utf8');

        // Enhanced regex patterns with atomic precision
        content = content
          .replace(/version:\s*["'].*?["']/g, `version: "${newVersion}"`)
          .replace(/author:\s*["'].*?["']/g, `author: "${newAuthor}"`)
          .replace(/category:\s*["'].*?["']/g, `category: "${newCategory}"`)
          .replace(/role:\s*\d+/g, `role: ${newRole}`)
          .replace(/shortDescription:\s*\{\s*en:\s*["'].*?["']\s*\}/g, `shortDescription: { en: "${newShortDescription}" }`)
          .replace(/longDescription:\s*\{\s*en:\s*["'].*?["']\s*\}/g, `longDescription: { en: "${newLongDescription}" }`);

        // Credits handling
        if (/credits:\s*["'].*?["']/g.test(content)) {
          content = content.replace(/credits:\s*["'].*?["']/g, `credits: "${newCredits}"`);
        } else {
          content = content.replace(/(config:\s*\{)/, `$1\n    credits: "${newCredits}",`);
        }

        // Permission handling
        if (/hasPermission:\s*["'].*?["']/g.test(content)) {
          content = content.replace(/hasPermission:\s*["'].*?["']/g, `hasPermission: "${newHasPermission}"`);
        } else if (newHasPermission) {
          content = content.replace(/(config:\s*\{)/, `$1\n    hasPermission: "${newHasPermission}",`);
        }

        // Prefix handling
        if (/usePrefix:\s*(true|false)/g.test(content)) {
          content = content.replace(/usePrefix:\s*(true|false)/g, `usePrefix: ${newUsePrefix}`);
        } else {
          content = content.replace(/(config:\s*\{)/, `$1\n    usePrefix: ${newUsePrefix},`);
        }

        await fs.writeFile(filePath, content, 'utf8');
      }

      // Build atomic success message
      const successMessage = formatAtomicMessage(
        "𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 𝐔𝐏𝐃𝐀𝐓𝐄",
        `⚛️ Atomic core update complete!\n\n` +
        `📌 Version: ${newVersion}\n` +
        `👤 Author: ${newAuthor}\n` +
        `📂 Category: ${newCategory}\n` +
        `🔑 Role: ${newRole}\n\n` +
        `✅ ${jsFiles.length} command files updated with atomic precision\n` +
        `💾 Backup created at: ${path.basename(backupFolder)}\n\n` +
        `🔒 Security Note: Always verify updates before deployment`,
        "✅"
      );

      // Send with typing effect
      await api.sendTyping(threadID);
      await new Promise(r => setTimeout(r, 2000));
      await api.sendMessage(successMessage, threadID);

    } catch (error) {
      console.error("☢️ Atomic Update Error:", error);
      await api.sendMessage(
        formatAtomicMessage(
          "𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄",
          `❌ Atomic core update failed:\n${error.message || 'Unknown error'}\n\n` +
          `⚠️ Please check console for diagnostics\n` +
          `💾 Backup may not have been created`,
          "❌"
        ),
        threadID
      );
    }
  }
};
