const fs = require("fs-extra");
const path = require("path");

// ============================== ☣ 𝐀𝐓𝐎𝐌𝐈𝐂⚛ DESIGN SYSTEM ============================== //
const DESIGN = {
  HEADER: "☣ 𝐀𝐓𝐎𝐌𝐈𝐂 𝗕𝗔𝗗𝗪𝗢𝗥𝗗𝗦 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛",
  FOOTER: "⚡ 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗 𝗧𝗘𝗖𝗛 💥",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    BANNED: "☢",
    ADMIN: "🛡️",
    LIST: "📋",
    TOGGLE: "🔛",
    UNWARN: "🧹",
    PROCESSING: "⚡",
    SHIELD: "🛡️",
    ATOM: "⚛️",
    LOCK: "🔒"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4500",
    WARNING: "#FFD700",
    INFO: "#1E90FF"
  }
};

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI.ATOM} ${DESIGN.HEADER} ${DESIGN.EMOJI.ATOM} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${DESIGN.EMOJI[type.toUpperCase()]} ${content}

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

// Enhanced typing animation with random duration
const simulateTyping = async (api, threadID, min = 800, max = 1500) => {
  api.sendTypingIndicator(threadID);
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, duration));
};

// Escape special regex characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Hide sensitive words with atomic pattern
const hideWord = (str) => {
  if (str.length <= 2) return "•".repeat(str.length);
  return str[0] + "•".repeat(str.length - 2) + str.slice(-1);
};

// Atomic visual effects
const atomicProgress = (progress) => {
  const filled = Math.floor(progress / 5);
  return `[${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${progress}%`;
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "atomicwords",
    aliases: ["aw", "atomicfilter", "afilter"],
    version: "4.0",
    author: "Asif Mahmud | Atomic Systems",
    countDown: 5,
    role: 1,
    shortDescription: "Atomic word filtering system",
    longDescription: "Manage banned words with futuristic ☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ security measures",
    category: "moderation",
    guide: {
      en: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI.INFO} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗜𝗟𝗧𝗘𝗥 𝗚𝗨𝗜𝗗𝗘 ${DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${DESIGN.EMOJI.ADMIN} {pn} add <words> - Add atomic-banned words
${DESIGN.EMOJI.ADMIN} {pn} del <words> - Remove banned words
${DESIGN.EMOJI.LIST} {pn} list [hide] - Show banned words
${DESIGN.EMOJI.TOGGLE} {pn} on/off - Toggle atomic filter
${DESIGN.EMOJI.UNWARN} {pn} unwarn <@user> - Remove warning

${DESIGN.EMOJI.INFO} Examples:
  ${DESIGN.EMOJI.ATOM} {pn} add curse,slur
  ${DESIGN.EMOJI.ATOM} {pn} del curse
  ${DESIGN.EMOJI.ATOM} {pn} list hide
  ${DESIGN.EMOJI.ATOM} {pn} on
  ${DESIGN.EMOJI.ATOM} {pn} unwarn @user

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`
    }
  },

  langs: {
    en: {
      onlyAdmin: `${DESIGN.EMOJI.ERROR} Command restricted to atomic admins!`,
      missingWords: `${DESIGN.EMOJI.WARNING} Enter words for atomic filter!`,
      addedSuccess: `${DESIGN.EMOJI.SUCCESS} Added %1 word(s) to atomic core!`,
      alreadyExist: `${DESIGN.EMOJI.WARNING} %1 word(s) already in core: %2`,
      tooShort: `${DESIGN.EMOJI.WARNING} %1 word(s) too short: %2`,
      missingWords2: `${DESIGN.EMOJI.WARNING} Enter words to remove from atomic core!`,
      deletedSuccess: `${DESIGN.EMOJI.SUCCESS} Removed %1 word(s) from atomic core!`,
      notExist: `${DESIGN.EMOJI.WARNING} %1 word(s) not in core: %2`,
      emptyList: `${DESIGN.EMOJI.WARNING} Atomic core is empty!`,
      badWordsList: `${DESIGN.EMOJI.LIST} ☣ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗢𝗥𝗘 𝗪𝗢𝗥𝗗𝗦 📋\n%1`,
      turnedOn: `${DESIGN.EMOJI.TOGGLE} Atomic filter ACTIVATED! ${DESIGN.EMOJI.SHIELD}`,
      turnedOff: `${DESIGN.EMOJI.TOGGLE} Atomic filter DEACTIVATED!`,
      missingTarget: `${DESIGN.EMOJI.WARNING} Tag user or reply to message!`,
      notWarned: `${DESIGN.EMOJI.WARNING} User %1 has no atomic warnings!`,
      unwarned: `${DESIGN.EMOJI.UNWARN} Removed atomic warning for %1`,
      warned: `${DESIGN.EMOJI.WARNING} ☢ 𝗔𝗟𝗘𝗥𝗧: Banned word detected! **%1**\n${DESIGN.EMOJI.BANNED} Next violation = SYSTEM PURGE!`,
      warned2: `${DESIGN.EMOJI.WARNING} ☢ 𝗖𝗥𝗜𝗧𝗜𝗖𝗔𝗟: Banned word detected! **%1**\n${DESIGN.EMOJI.BANNED} INITIATING SYSTEM PURGE!`,
      needAdmin: `${DESIGN.EMOJI.ERROR} Requires admin for atomic purge!`,
      userKicked: `${DESIGN.EMOJI.BANNED} User %1 PURGED from atomic grid!`,
      processing: `${DESIGN.EMOJI.PROCESSING} Processing atomic command...`,
      securityCheck: `${DESIGN.EMOJI.SHIELD} Running security protocols...`
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, role, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    // Initial security animation
    message.reply(
      formatMessage(getLang("securityCheck"), "info")
    );
    await simulateTyping(api, event.threadID, 1000, 1500);
    
    const threadID = event.threadID;
    if (!await threadsData.get(threadID, "data.badWords")) {
      await threadsData.set(threadID, { words: [], violationUsers: {} }, "data.badWords");
    }

    const badWordsData = await threadsData.get(threadID, "data.badWords");
    const words = badWordsData.words || [];
    const violations = badWordsData.violationUsers || {};

    const cmd = args[0]?.toLowerCase() || "";
    const input = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim().toLowerCase()).filter(Boolean);

    const sendAtomicResponse = (content, type = "info") => {
      return formatMessage(content, type);
    };

    if (cmd === "add") {
      if (role < 1) return message.reply(sendAtomicResponse(getLang("onlyAdmin"), "error"));
      if (!input.length) return message.reply(sendAtomicResponse(getLang("missingWords"), "error"));

      const added = [], exist = [], tooShort = [];
      for (const word of input) {
        if (word.length < 2) tooShort.push(word);
        else if (!words.includes(word)) {
          added.push(word);
          words.push(word);
        } else {
          exist.push(word);
        }
      }

      await threadsData.set(threadID, words, "data.badWords.words");

      let response = "";
      if (added.length) response += `\n${DESIGN.EMOJI.ATOM} ${getLang("addedSuccess", added.length)}`;
      if (exist.length) response += `\n${DESIGN.EMOJI.WARNING} ${getLang("alreadyExist", exist.length, exist.map(hideWord).join(", "))}`;
      if (tooShort.length) response += `\n${DESIGN.EMOJI.WARNING} ${getLang("tooShort", tooShort.length, tooShort.join(", "))}`;

      // Progress animation
      message.reply(
        sendAtomicResponse(`${DESIGN.EMOJI.PROCESSING} Updating atomic core...\n${atomicProgress(30)}`, "processing")
      );
      await simulateTyping(api, event.threadID, 800, 1200);
      
      return message.reply(sendAtomicResponse(response, "success"));
    }

    if (["delete", "del", "remove"].includes(cmd)) {
      if (role < 1) return message.reply(sendAtomicResponse(getLang("onlyAdmin"), "error"));
      if (!input.length) return message.reply(sendAtomicResponse(getLang("missingWords2"), "error"));

      const deleted = [], notFound = [];
      for (const word of input) {
        const index = words.indexOf(word);
        if (index !== -1) {
          words.splice(index, 1);
          deleted.push(word);
        } else {
          notFound.push(word);
        }
      }

      await threadsData.set(threadID, words, "data.badWords.words");

      let response = "";
      if (deleted.length) response += `\n${DESIGN.EMOJI.ATOM} ${getLang("deletedSuccess", deleted.length)}`;
      if (notFound.length) response += `\n${DESIGN.EMOJI.WARNING} ${getLang("notExist", notFound.length, notFound.join(", "))}`;

      // Progress animation
      message.reply(
        sendAtomicResponse(`${DESIGN.EMOJI.PROCESSING} Modifying atomic core...\n${atomicProgress(60)}`, "processing")
      );
      await simulateTyping(api, event.threadID, 800, 1200);
      
      return message.reply(sendAtomicResponse(response, "success"));
    }

    if (["list", "show", "core"].includes(cmd)) {
      if (!words.length) return message.reply(sendAtomicResponse(getLang("emptyList"), "warning"));

      const hideMode = args[1] === "hide";
      const list = words.map(word => 
        hideMode ? hideWord(word) : word
      ).map((w, i) => 
        `${DESIGN.EMOJI.ATOM} ${i+1}. ${w}`
      ).join("\n");
      
      return message.reply(sendAtomicResponse(
        `${getLang("badWordsList")}\n\n${list}\n\n${DESIGN.EMOJI.LOCK} Total: ${words.length}`, 
        "info"
      ));
    }

    if (["on", "off", "activate", "deactivate"].includes(cmd)) {
      if (role < 1) return message.reply(sendAtomicResponse(getLang("onlyAdmin"), "error"));

      const state = ["on", "activate"].includes(cmd);
      await threadsData.set(threadID, state, "settings.badWords");
      
      // System activation animation
      message.reply(
        sendAtomicResponse(`${DESIGN.EMOJI.PROCESSING} ${state ? "Activating" : "Deactivating"} atomic core...\n${atomicProgress(80)}`, "processing")
      );
      await simulateTyping(api, event.threadID, 1000, 1500);
      
      return message.reply(sendAtomicResponse(
        state ? getLang("turnedOn") : getLang("turnedOff"),
        "success"
      ));
    }

    if (cmd === "unwarn") {
      if (role < 1) return message.reply(sendAtomicResponse(getLang("onlyAdmin"), "error"));

      const userID = Object.keys(event.mentions)?.[0] || args[1] || event.messageReply?.senderID;
      if (!userID || isNaN(userID)) return message.reply(sendAtomicResponse(getLang("missingTarget"), "error"));

      if (!violations[userID]) return message.reply(sendAtomicResponse(getLang("notWarned", userID), "warning"));

      violations[userID]--;
      if (violations[userID] === 0) delete violations[userID];

      await threadsData.set(threadID, violations, "data.badWords.violationUsers");
      const userName = await usersData.getName(userID);

      return message.reply(sendAtomicResponse(getLang("unwarned", userName), "success"));
    }

    return message.reply(sendAtomicResponse(
      `${DESIGN.EMOJI.ERROR} Invalid atomic command!\n${DESIGN.EMOJI.INFO} Use '{pn} guide' for help`,
      "error"
    ));
  },

  onChat: async function ({ message, event, api, threadsData, getLang }) {
    if (!event.body) return;
    const threadID = event.threadID;
    const senderID = event.senderID;
    const msg = event.body.toLowerCase();

    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.badWords) return;

    const isCommand = global.GoatBot.commands.some(cmd =>
      (cmd.config.aliases || []).some(alias => msg.startsWith(global.GoatBot.config.prefix + alias))
    );
    if (isCommand) return;

    const badWords = threadData.data.badWords?.words || [];
    const violations = threadData.data.badWords?.violationUsers || {};

    const sendAtomicAlert = async (content) => {
      await simulateTyping(api, threadID, 1000, 1500);
      message.reply(formatMessage(content, "warning"));
    };

    for (const word of badWords) {
      const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
      if (regex.test(msg)) {
        if ((violations[senderID] || 0) < 1) {
          violations[senderID] = 1;
          await threadsData.set(threadID, violations, "data.badWords.violationUsers");
          await sendAtomicAlert(getLang("warned", word));
        } else {
          await sendAtomicAlert(getLang("warned2", word));
          const userName = senderID; // Using ID instead of name
          let retries = 3;
          while (retries > 0) {
            try {
              await api.removeUserFromGroup(senderID, threadID);
              await message.reply(formatMessage(getLang("userKicked", userName), "error"));
              break;
            } catch (err) {
              retries--;
              if (retries === 0) {
                await sendAtomicAlert(getLang("needAdmin"));
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        break;
      }
    }
  }
};
