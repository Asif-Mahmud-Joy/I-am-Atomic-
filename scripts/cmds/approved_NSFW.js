const fs = require('fs-extra');
const path = require('path');

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  HEADER: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗦𝗙𝗪 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟 ⚛️",
  FOOTER: "🔐 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 🔐",
  SEPARATOR: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    LOCK: "🔒",
    UNLOCK: "🔓",
    GEAR: "⚙️",
    THREAD: "🧵",
    ADMIN: "👨‍💻"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4040",
    WARNING: "#FFA500",
    INFO: "#1E90FF"
  }
};

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI[type.toUpperCase()] || ATOMIC.EMOJI.INFO} ${ATOMIC.HEADER}  ${ATOMIC.EMOJI[type.toUpperCase()] || ATOMIC.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

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
    name: "nsfw",
    aliases: ["ns"],
    version: "3.0",
    author: "SiAM | Enhanced by Atomic",
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
    
    const approvedIDsPath = path.join(dataPath, "approved_ids.json");
    const pendingIDsPath = path.join(dataPath, "pending_ids.json");

    // Initialize files if not exists
    if (!fs.existsSync(approvedIDsPath)) fs.writeFileSync(approvedIDsPath, "[]");
    if (!fs.existsSync(pendingIDsPath)) fs.writeFileSync(pendingIDsPath, "[]");

    const loadIDs = (filePath) => JSON.parse(fs.readFileSync(filePath));
    const saveIDs = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const action = args[0];
    const targetID = args[1];
    const note = args.slice(2).join(" ");

    switch (action) {
      case "approve": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Provide a thread ID to approve\n${ATOMIC.EMOJI.GEAR} Usage: ${p}nsfw approve [threadID] [note]`,
            "error"
          ));
        }

        const approvedIDs = loadIDs(approvedIDsPath);
        if (approvedIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.INFO} Thread ${targetID} is already approved`,
            "info"
          ));
        }

        approvedIDs.push(targetID);
        saveIDs(approvedIDsPath, approvedIDs);

        // Remove from pending
        const pendingIDs = loadIDs(pendingIDsPath);
        if (pendingIDs.includes(targetID)) {
          pendingIDs.splice(pendingIDs.indexOf(targetID), 1);
          saveIDs(pendingIDsPath, pendingIDs);
        }

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} NSFW Access Granted!\n\n` +
          `⚛️ Your thread has been approved for NSFW commands\n` +
          `📝 Admin Note: ${note || "No note provided"}\n\n` +
          `${ATOMIC.EMOJI.INFO} Use commands responsibly`,
          "success"
        ), targetID);

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} Approved Thread ${targetID}\n` +
          `${ATOMIC.EMOJI.THREAD} NSFW commands are now enabled`,
          "success"
        ));
      }

      case "remove": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Provide a thread ID to remove\n${ATOMIC.EMOJI.GEAR} Usage: ${p}nsfw remove [threadID] [reason]`,
            "error"
          ));
        }

        const approvedIDs = loadIDs(approvedIDsPath);
        if (!approvedIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.WARNING} Thread ${targetID} is not approved`,
            "warning"
          ));
        }

        approvedIDs.splice(approvedIDs.indexOf(targetID), 1);
        saveIDs(approvedIDsPath, approvedIDs);

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.WARNING} NSFW Access Revoked!\n\n` +
          `⚛️ Your thread's NSFW permissions have been removed\n` +
          `📝 Reason: ${note || "Not specified"}\n\n` +
          `${ATOMIC.EMOJI.INFO} Contact admin for more information`,
          "warning"
        ), targetID);

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.SUCCESS} Removed NSFW access from ${targetID}`,
          "success"
        ));
      }

      case "disapproved": {
        if (!targetID) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.ERROR} Provide a thread ID to disapprove\n${ATOMIC.EMOJI.GEAR} Usage: ${p}nsfw disapproved [threadID] [reason]`,
            "error"
          ));
        }

        const pendingIDs = loadIDs(pendingIDsPath);
        if (!pendingIDs.includes(targetID)) {
          return message.reply(formatAtomicMessage(
            `${ATOMIC.EMOJI.WARNING} Thread ${targetID} is not pending approval`,
            "warning"
          ));
        }

        pendingIDs.splice(pendingIDs.indexOf(targetID), 1);
        saveIDs(pendingIDsPath, pendingIDs);

        // Notify target thread
        api.sendMessage(formatAtomicMessage(
          `${ATOMIC.EMOJI.WARNING} Request Disapproved!\n\n` +
          `⚛️ Your NSFW access request has been denied\n` +
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
        const approvedIDs = loadIDs(approvedIDsPath);
        const status = approvedIDs.includes(targetID || threadID) ? 
          `${ATOMIC.EMOJI.SUCCESS} NSFW Access: ENABLED` : 
          `${ATOMIC.EMOJI.ERROR} NSFW Access: DISABLED`;

        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.THREAD} Thread Status:\n` +
          `▸ ID: ${targetID || threadID}\n` +
          `▸ ${status}\n\n` +
          `${ATOMIC.EMOJI.INFO} ${targetID ? "Target Thread" : "Current Thread"}`,
          "info"
        ));
      }

      default: {
        return message.reply(formatAtomicMessage(
          `${ATOMIC.EMOJI.ERROR} Invalid Command\n\n` +
          `${ATOMIC.EMOJI.GEAR} Available Commands:\n` +
          `▸ ${p}nsfw approve [threadID]\n` +
          `▸ ${p}nsfw remove [threadID]\n` +
          `▸ ${p}nsfw disapproved [threadID]\n` +
          `▸ ${p}nsfw check [threadID?]\n\n` +
          `${ATOMIC.EMOJI.INFO} Add notes after threadID for context`,
          "error"
        ));
      }
    }
  },
};
