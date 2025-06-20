const fs = require('fs-extra');
const path = require('path');

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  HEADER: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗠𝗔𝗜𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗣𝗔𝗡𝗘𝗟 ⚛️",
  FOOTER: "🔐 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆 𝗦𝘆𝘀𝘁𝗲𝗺𝘀 🔐",
  SEPARATOR: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    LOCK: "🔒",
    UNLOCK: "🔓",
    THREAD: "🧵",
    ADMIN: "👑",
    KEY: "🔑",
    TOOLS: "🛠️"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4040",
    WARNING: "#FFA500",
    INFO: "#1E90FF"
  }
};

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI[type.toUpperCase()] || ATOMIC.EMOJI.INFO} ${ATOMIC.HEADER} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ============================================================================ //

module.exports = {
  config: {
    name: "main",
    aliases: ["cmdcontrol"],
    version: "3.0",
    author: "Atomic Systems",
    countDown: 3,
    category: "owner",
    role: 2,
    guide: {
      en: "{pn} approve/remove/disapproved/check [threadID]"
    }
  },

  onStart: async function({ api, args, message, event }) {
    await simulateTyping(api, event.threadID);
    
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const dataPath = path.join(__dirname, "assist_json");
    
    // Ensure directory exists
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    const approvedPath = path.join(dataPath, "approved_main.json");
    const pendingPath = path.join(dataPath, "pending_main.json");

    // Initialize files if not exists
    if (!fs.existsSync(approvedPath)) fs.writeFileSync(approvedPath, "[]");
    if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, "[]");

    const loadData = (filePath) => JSON.parse(fs.readFileSync(filePath));
    const saveData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const action = args[0];
    const targetID = args[1];
    const note = args.slice(2).join(" ");

    switch (action) {
      case "approve": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Missing Thread ID\n${ATOMIC.EMOJI.TOOLS} Usage: ${p}main approve [threadID] [note]`,
            "error"
          ));
        }

        const approvedIDs = loadData(approvedPath);
        if (approvedIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.INFO} Thread already approved\n${ATOMIC.EMOJI.THREAD} ID: ${targetID}`,
            "info"
          ));
        }

        approvedIDs.push(targetID);
        saveData(approvedPath, approvedIDs);

        // Remove from pending
        const pendingIDs = loadData(pendingPath);
        if (pendingIDs.includes(targetID)) {
          pendingIDs.splice(pendingIDs.indexOf(targetID), 1);
          saveData(pendingPath, pendingIDs);
        }

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.UNLOCK} Main Command Access Granted\n\n` +
          `⚛️ Your thread has been approved for all commands\n` +
          `📝 Admin Note: ${note || "No note provided"}\n\n` +
          `${ATOMIC.EMOJI.KEY} Full functionality unlocked`,
          "success"
        ), targetID);

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} Approved Thread ${targetID}\n` +
          `${ATOMIC.EMOJI.TOOLS} Main commands enabled`,
          "success"
        ));
      }

      case "remove": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Missing Thread ID\n${ATOMIC.EMOJI.TOOLS} Usage: ${p}main remove [threadID] [reason]`,
            "error"
          ));
        }

        const approvedIDs = loadData(approvedPath);
        if (!approvedIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.WARNING} Thread not approved\n${ATOMIC.EMOJI.THREAD} ID: ${targetID}`,
            "warning"
          ));
        }

        approvedIDs.splice(approvedIDs.indexOf(targetID), 1);
        saveData(approvedPath, approvedIDs);

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.LOCK} Command Access Revoked\n\n` +
          `⚛️ Your main command permissions have been removed\n` +
          `📝 Reason: ${note || "Not specified"}\n\n` +
          `${ATOMIC.EMOJI.INFO} Contact admin for assistance`,
          "warning"
        ), targetID);

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} Removed access from ${targetID}`,
          "success"
        ));
      }

      case "disapproved": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Missing Thread ID\n${ATOMIC.EMOJI.TOOLS} Usage: ${p}main disapproved [threadID] [reason]`,
            "error"
          ));
        }

        const pendingIDs = loadData(pendingPath);
        if (!pendingIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.WARNING} No pending request\n${ATOMIC.EMOJI.THREAD} ID: ${targetID}`,
            "warning"
          ));
        }

        pendingIDs.splice(pendingIDs.indexOf(targetID), 1);
        saveData(pendingPath, pendingIDs);

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.WARNING} Request Disapproved\n\n` +
          `⚛️ Your main command access request was denied\n` +
          `📝 Reason: ${note || "Not specified"}\n\n` +
          `${ATOMIC.EMOJI.INFO} Contact admin for clarification`,
          "warning"
        ), targetID);

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} Disapproved thread ${targetID}`,
          "success"
        ));
      }

      case "check": {
        const approvedIDs = loadData(approvedPath);
        const status = approvedIDs.includes(targetID || threadID) ? 
          `${ATOMIC.EMOJI.UNLOCK} Command Access: ENABLED` : 
          `${ATOMIC.EMOJI.LOCK} Command Access: DISABLED`;

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.THREAD} Thread Status\n\n` +
          `▸ ID: ${targetID || threadID}\n` +
          `▸ ${status}\n\n` +
          `${ATOMIC.EMOJI.INFO} ${targetID ? "Target Thread" : "Current Thread"}`,
          "info"
        ));
      }

      default: {
        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.ERROR} Invalid Command\n\n` +
          `${ATOMIC.EMOJI.TOOLS} Available Operations:\n` +
          `▸ ${p}main approve [threadID] [note]\n` +
          `▸ ${p}main remove [threadID] [reason]\n` +
          `▸ ${p}main disapproved [threadID] [reason]\n` +
          `▸ ${p}main check [threadID?]\n\n` +
          `${ATOMIC.EMOJI.INFO} Add notes/reasons after threadID`,
          "error"
        ));
      }
    }
  },
};
