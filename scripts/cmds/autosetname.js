function checkShortCut(nickname, uid, userName) {
  return nickname
    .replace(/{userName}/gi, userName)
    .replace(/{userID}/gi, uid);
}

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗔𝗨𝗧𝗢-𝗡𝗔𝗠𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    NICKNAME: "🏷️",
    TOGGLE: "🔄",
    CONFIG: "⚙️",
    PROCESSING: "⏳",
    CROWN: "👑",
    USER: "👤",
    ID: "🆔"
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

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "autosetname",
    version: "3.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Royal AI",
    cooldowns: 5,
    role: 1,
    shortDescription: "Royal auto nickname system",
    longDescription: "Automatically set nicknames for new members with royal templates",
    category: "group",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗥𝗢𝗬𝗔𝗟 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} set <template> - Set nickname template
        {pn} on/off - Enable/disable feature
        {pn} view - View current config
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ 𝗧𝗲𝗺𝗽𝗹𝗮𝘁𝗲 𝗦𝗵𝗼𝗿𝘁𝗰𝘂𝘁𝘀:
        {userName} - Member's name
        {userID} - Member's ID
        
        ✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        !autosetname set {userName} 👑
        !autosetname set VIP-{userID}
        !autosetname on
      `,
      bn: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗥𝗢𝗬𝗔𝗟 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} set <টেমপ্লেট> - ডাকনাম টেমপ্লেট সেট করুন
        {pn} on/off - ফিচার চালু/বন্ধ করুন
        {pn} view - বর্তমান কনফিগ দেখুন
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ 𝗧𝗲𝗺𝗽𝗹𝗮𝘁𝗲 𝗦𝗵𝗼𝗿𝘁𝗰𝘂𝘁𝘀:
        {userName} - সদস্যের নাম
        {userID} - সদস্যের আইডি
        
        ✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        !autosetname set {userName} 👑
        !autosetname set VIP-{userID}
        !autosetname on
      `
    }
  },

  langs: {
    en: {
      missingConfig: "Please enter a nickname template",
      configSuccess: "Royal nickname template set successfully!",
      currentConfig: "Current royal nickname template:\n\n✨ %1",
      notSetConfig: "No nickname template set yet",
      syntaxError: "Invalid command! Use '!autosetname guide' for help",
      turnOnSuccess: "👑 Royal Auto-Name system activated!",
      turnOffSuccess: "👑 Royal Auto-Name system deactivated",
      error: "Failed to set nickname. Please try again later",
      nicknameSet: "👑 Royal nickname set for new member: %1"
    },
    bn: {
      missingConfig: "দয়া করে একটি ডাকনাম টেমপ্লেট লিখুন",
      configSuccess: "রয়্যাল ডাকনাম টেমপ্লেট সফলভাবে সেট করা হয়েছে!",
      currentConfig: "বর্তমান রয়্যাল ডাকনাম টেমপ্লেট:\n\n✨ %1",
      notSetConfig: "কোনো ডাকনাম টেমপ্লেট এখনো সেট করা হয়নি",
      syntaxError: "ভুল কমান্ড! সাহায্যের জন্য '!autosetname guide' ব্যবহার করুন",
      turnOnSuccess: "👑 রয়্যাল অটো-নেম সিস্টেম সক্রিয় করা হয়েছে!",
      turnOffSuccess: "👑 রয়্যাল অটো-নেম সিস্টেম নিষ্ক্রিয় করা হয়েছে",
      error: "ডাকনাম সেট করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন",
      nicknameSet: "👑 নতুন সদস্যের জন্য রয়্যাল ডাকনাম সেট করা হয়েছে: %1"
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
          formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("missingConfig")}`, "error")
        );
      }
      
      await threadsData.set(event.threadID, value, "data.autoSetName");
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatMessage(`${DESIGN.EMOJI.SUCCESS} ${getLang("configSuccess")}`, "success")
      );
    }

    if (["view", "info"].includes(command)) {
      const config = await threadsData.get(event.threadID, "data.autoSetName");
      
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatMessage(
          config
            ? `${DESIGN.EMOJI.CONFIG} ${getLang("currentConfig", config)}`
            : `${DESIGN.EMOJI.WARNING} ${getLang("notSetConfig")}`,
          "info"
        )
      );
    }

    if (["on", "off"].includes(command)) {
      await threadsData.set(event.threadID, command === "on", "settings.enableAutoSetName");
      await simulateTyping(api, event.threadID);
      
      return message.reply(
        formatMessage(
          `${DESIGN.EMOJI.TOGGLE} ${getLang(command === "on" ? "turnOnSuccess" : "turnOffSuccess")}`,
          "success"
        )
      );
    }

    return message.reply(
      formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("syntaxError")}`, "error")
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
          formatMessage(`${DESIGN.EMOJI.SUCCESS} ${getLang("nicknameSet", nick)}`, "success")
        );
      } catch (err) {
        console.error("Royal Auto-Name Error:", err);
        message.reply(
          formatMessage(`${DESIGN.EMOJI.ERROR} ${getLang("error")}`, "error")
        );
      }
    }
  }
};
