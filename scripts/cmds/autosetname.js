function checkShortCut(nickname, uid, userName) {
  return nickname
    .replace(/{userName}/gi, userName)
    .replace(/{userID}/gi, uid);
}

// ======================== ⚛️ ATOMIC DESIGN SYSTEM ⚛️ ======================== //
const ATOMIC = {
  HEADER: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛️",
  FOOTER: "🔧 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 🔧",
  SEPARATOR: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  ELEMENTS: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    NICKNAME: "🏷️",
    TOGGLE: "🔄",
    CONFIG: "⚙️",
    PROCESSING: "⏳",
    USER: "👤",
    ID: "🆔",
    ATOM: "⚛️"
  }
};

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.ELEMENTS.ATOM} ${ATOMIC.HEADER} ${ATOMIC.ELEMENTS.ATOM} ┃
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
    name: "autosetname",
    aliases: ["atomicname"],
    version: "4.0",
    author: "Asif Mahmud",
    cooldowns: 3,
    role: 1,
    shortDescription: "Atomic nickname automation",
    longDescription: "Auto-set nicknames for new members with atomic templates",
    category: "group",
    guide: {
      en: `
        ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 𝗦𝗬𝗦𝗧𝗘𝗠:
        {pn} set <template> - Set nickname template
        {pn} on/off - Enable/disable feature
        {pn} view - View current config
        
        🔹 𝗧𝗲𝗺𝗽𝗹𝗮𝘁𝗲 𝗦𝗵𝗼𝗿𝘁𝗰𝘂𝘁𝘀:
        {userName} - Member's name
        {userID} - Member's ID
        
        🔹 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        {pn} set {userName} ⚛️
        {pn} set ATOM-{userID}
        {pn} on
      `
    }
  },

  langs: {
    en: {
      missingConfig: "⚠️ Please enter a nickname template",
      configSuccess: "✅ Atomic nickname template set successfully!",
      currentConfig: "ℹ️ Current atomic nickname template:\n\n⚛️ %1",
      notSetConfig: "⚠️ No nickname template set yet",
      syntaxError: "❌ Invalid command! Use '{pn} guide' for help",
      turnOnSuccess: "🔄 Atomic Auto-Name system activated!",
      turnOffSuccess: "🔄 Atomic Auto-Name system deactivated",
      error: "❌ Failed to set nickname. Please try again later",
      nicknameSet: "🏷️ Atomic nickname set for new member: %1"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    const command = args[0]?.toLowerCase() || "";
    const value = args.slice(1).join(" ");

    if (["guide", "help"].includes(command)) {
      return message.reply(this.config.guide.en);
    }

    if (["set", "add", "config"].includes(command)) {
      if (!value) {
        return message.reply(
          formatAtomicMessage(getLang("missingConfig"), "warning")
        );
      }
      
      await threadsData.set(event.threadID, value, "data.autoSetName");
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatAtomicMessage(getLang("configSuccess"), "success")
      );
    }

    if (["view", "info"].includes(command)) {
      const config = await threadsData.get(event.threadID, "data.autoSetName");
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatAtomicMessage(
          config 
            ? getLang("currentConfig", config) 
            : getLang("notSetConfig"),
          "info"
        )
      );
    }

    if (["on", "off"].includes(command)) {
      await threadsData.set(event.threadID, command === "on", "settings.enableAutoSetName");
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatAtomicMessage(
          command === "on" 
            ? getLang("turnOnSuccess") 
            : getLang("turnOffSuccess"),
          "success"
        )
      );
    }

    return message.reply(
      formatAtomicMessage(getLang("syntaxError"), "error")
    );
  },

  onEvent: async function ({ message, event, api, threadsData, getLang }) {
    if (event.logMessageType !== "log:subscribe") return;

    const isEnabled = await threadsData.get(event.threadID, "settings.enableAutoSetName");
    if (!isEnabled) return;

    const config = await threadsData.get(event.threadID, "data.autoSetName");
    if (!config) return;

    const newMembers = event.logMessageData.addedParticipants || [];
    if (!newMembers.length) return;

    for (const member of newMembers) {
      const { userFbId: uid, fullName: name } = member;
      if (!uid || !name) continue;
      
      const nick = checkShortCut(config, uid, name);
      
      try {
        await api.changeNickname(nick, event.threadID, uid);
        await simulateTyping(api, event.threadID);
        message.reply(
          formatAtomicMessage(getLang("nicknameSet", nick), "success")
        );
      } catch (err) {
        console.error("Atomic Nickname Error:", err);
        message.reply(
          formatAtomicMessage(getLang("error"), "error")
        );
      }
    }
  }
};
