// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗗𝗪𝗢𝗥𝗗𝗦 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    BANNED: "🚫",
    ADMIN: "👑",
    LIST: "📜",
    TOGGLE: "🔄",
    UNWARN: "🧹",
    PROCESSING: "⏳",
    SHIELD: "🛡️"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF"
  }
};

const ADMIN_ID = "61571630409265"; // Replace with actual admin ID

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━┛
${content}
${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

// Hide sensitive words
function hideWord(str) {
  if (str.length <= 2) return str[0] + "*";
  return str[0] + "*".repeat(str.length - 2) + str.slice(-1);
}
// ====================================================================================== //

module.exports = {
  config: {
    name: "badwords",
    aliases: ["bw", "wordfilter"],
    version: "3.0",
    author: "NTKhang & Asif Mahmud | Enhanced by Royal AI",
    countDown: 5,
    role: 1,
    shortDescription: "Royal word filtering system",
    longDescription: "Manage banned words with royal security measures",
    category: "moderation",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗕𝗔𝗗𝗪𝗢𝗥𝗗𝗦 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} add <words> - Add banned words (comma separated)
        {pn} del <words> - Remove banned words
        {pn} list [hide] - Show banned words (hide obscures words)
        {pn} on/off - Enable/disable detection
        {pn} unwarn <@user> - Remove warning
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ Examples:
        !badwords add curse,slur
        !badwords del curse
        !badwords list hide
        !badwords on
        !badwords unwarn @user
      `
    }
  },

  langs: {
    en: {
      onlyAdmin: "👑 Command restricted to admins only!",
      missingWords: "⚠️ Please enter words to add",
      addedSuccess: "🛡️ Added %1 banned word(s) to royal list",
      alreadyExist: "⚠️ %1 word(s) already in list: %2",
      tooShort: "⚠️ %1 word(s) too short (< 2 chars): %2",
      missingWords2: "⚠️ Please enter words to delete",
      deletedSuccess: "🛡️ Removed %1 banned word(s) from royal list",
      notExist: "⚠️ %1 word(s) not in list: %2",
      emptyList: "📜 Royal banned words list is empty",
      badWordsList: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗡𝗡𝗘𝗗 𝗪𝗢𝗥𝗗𝗦 𝗟𝗜𝗦𝗧:\n%1",
      turnedOn: "🛡️ Royal word filter activated!",
      turnedOff: "🛡️ Royal word filter deactivated",
      missingTarget: "⚠️ Please tag user, enter UID, or reply to message",
      notWarned: "⚠️ User %1 has no royal warnings",
      unwarned: "🧹 Removed royal warning for %1",
      warned: "🚫 Royal alert: Banned word \"%1\" detected!\n⚠️ One more violation = kick!",
      warned2: "🚫 Royal alert: Banned word \"%1\" detected again!\n👑 You're being removed from the kingdom!",
      needAdmin: "❌ Bot needs admin power to enforce royal decrees!",
      userKicked: "👑 User %1 has been banished from the kingdom!"
    }
  },

  onStart: async function ({ message, event, args, threadsData, usersData, role, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    const threadID = event.threadID;
    if (!await threadsData.get(threadID, "data.badWords")) {
      await threadsData.set(threadID, { words: [], violationUsers: {} }, "data.badWords");
    }

    const badWordsData = await threadsData.get(threadID, "data.badWords");
    const words = badWordsData.words || [];
    const violations = badWordsData.violationUsers || {};

    const cmd = args[0]?.toLowerCase() || "";
    const input = args.slice(1).join(" ").split(/[,|]/).map(w => w.trim().toLowerCase()).filter(Boolean);

    const sendRoyalResponse = async (content, type = "info") => {
      await simulateTyping(api, event.threadID);
      message.reply(formatMessage(content, type));
    };

    if (cmd === "add") {
      if (role < 1) return sendRoyalResponse(getLang("onlyAdmin"), "error");
      if (!input.length) return sendRoyalResponse(getLang("missingWords"), "error");

      const added = [], exist = [], tooShort = [];
      for (const word of input) {
        if (word.length < 2) tooShort.push(word);
        else if (!words.includes(word)) added.push(word), words.push(word);
        else exist.push(word);
      }
      
      await threadsData.set(threadID, words, "data.badWords.words");
      
      let response = "";
      if (added.length) response += `${DESIGN.EMOJI.SUCCESS} ${getLang("addedSuccess", added.length)}\n`;
      if (exist.length) response += `${DESIGN.EMOJI.WARNING} ${getLang("alreadyExist", exist.length, exist.map(hideWord).join(", "))}\n`;
      if (tooShort.length) response += `${DESIGN.EMOJI.WARNING} ${getLang("tooShort", tooShort.length, tooShort.join(", "))}`;
      
      return sendRoyalResponse(response, "success");
    }

    if (["delete", "del", "remove"].includes(cmd)) {
      if (role < 1) return sendRoyalResponse(getLang("onlyAdmin"), "error");
      if (!input.length) return sendRoyalResponse(getLang("missingWords2"), "error");

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
      if (deleted.length) response += `${DESIGN.EMOJI.SUCCESS} ${getLang("deletedSuccess", deleted.length)}\n`;
      if (notFound.length) response += `${DESIGN.EMOJI.WARNING} ${getLang("notExist", notFound.length, notFound.join(", "))}`;
      
      return sendRoyalResponse(response, "success");
    }

    if (["list", "show"].includes(cmd)) {
      if (!words.length) return sendRoyalResponse(getLang("emptyList"), "warning");
      
      const hideMode = args[1] === "hide";
      const list = words.map(word => hideMode ? hideWord(word) : word).join(", ");
      return sendRoyalResponse(getLang("badWordsList", list), "info");
    }

    if (["on", "off"].includes(cmd)) {
      if (role < 1) return sendRoyalResponse(getLang("onlyAdmin"), "error");
      
      await threadsData.set(threadID, cmd === "on", "settings.badWords");
      return sendRoyalResponse(
        cmd === "on" ? getLang("turnedOn") : getLang("turnedOff"),
        "success"
      );
    }

    if (cmd === "unwarn") {
      if (role < 1) return sendRoyalResponse(getLang("onlyAdmin"), "error");
      
      const userID = Object.keys(event.mentions)?.[0] || args[1] || event.messageReply?.senderID;
      if (!userID || isNaN(userID)) return sendRoyalResponse(getLang("missingTarget"), "error");
      
      if (!violations[userID]) return sendRoyalResponse(getLang("notWarned", userID), "warning");
      
      violations[userID]--;
      if (violations[userID] === 0) delete violations[userID];
      
      await threadsData.set(threadID, violations, "data.badWords.violationUsers");
      const userName = await usersData.getName(userID);
      
      return sendRoyalResponse(getLang("unwarned", userName), "success");
    }

    return sendRoyalResponse("👑 Invalid royal command! Use '!badwords guide' for assistance", "error");
  },

  onChat: async function ({ message, event, api, threadsData, getLang }) {
    if (!event.body) return;
    const threadID = event.threadID;
    const senderID = event.senderID;
    const msg = event.body.toLowerCase();

    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.badWords) return;

    // Avoid triggering on command itself
    const isCommand = global.GoatBot.commands.some(cmd => 
      cmd.config.aliases?.some(alias => msg.startsWith(global.GoatBot.config.prefix + alias))
    );
    if (isCommand) return;

    const badWords = threadData.data.badWords?.words || [];
    const violations = threadData.data.badWords?.violationUsers || {};

    const sendRoyalAlert = async (content) => {
      await simulateTyping(api, threadID);
      message.reply(formatMessage(content, "warning"));
    };

    for (const word of badWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(msg)) {
        if ((violations[senderID] || 0) < 1) {
          violations[senderID] = 1;
          await threadsData.set(threadID, violations, "data.badWords.violationUsers");
          return sendRoyalAlert(getLang("warned", word));
        } else {
          await sendRoyalAlert(getLang("warned2", word));
          
          try {
            await api.removeUserFromGroup(senderID, threadID);
            const userName = await global.utils.getUserName(api, senderID);
            message.reply(formatMessage(getLang("userKicked", userName), "error"));
          } catch (err) {
            sendRoyalAlert(getLang("needAdmin"));
          }
        }
        break;
      }
    }
  }
};
