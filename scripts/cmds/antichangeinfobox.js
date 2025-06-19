const { getStreamFromURL, uploadImgbb } = global.utils;

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗔𝗡𝗧𝗜 𝗖𝗛𝗔𝗡𝗚𝗘 𝗜𝗡𝗙𝗢 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    AVATAR: "🖼️",
    NAME: "📝",
    NICKNAME: "🏷️",
    THEME: "🎨",
    EMOJI: "😊",
    PROCESSING: "⏳",
    LOCKED: "🔒",
    ADMIN: "👑",
    SHIELD: "🛡️"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF"
  }
};

const formatMessage = (content, type = "info") => {
  const color = DESIGN.COLORS[type.toUpperCase()] || DESIGN.COLORS.INFO;
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
    name: "antichangeinfobox",
    version: "3.0",
    author: "Asif Mahmud | Enhanced by Royal AI",
    countDown: 5,
    role: 0,
    shortDescription: "Prevent group info changes with royal protection",
    longDescription: "Prevent unauthorized changes to group name, emoji, nickname, theme, and avatar with royal security",
    category: "security",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗔𝗡𝗧𝗜𝗖𝗛𝗔𝗡𝗚𝗘 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} name on/off  - 🛡️ Prevent name changes
        {pn} emoji on/off - 😊 Prevent emoji changes
        {pn} theme on/off - 🎨 Prevent theme changes
        {pn} nickname on/off - 🏷️ Prevent nickname changes
        {pn} avt on/off - 🖼️ Prevent avatar changes
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ Example: !antichangeinfobox name on
      `,
      bn: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 এন্টি-পরিবর্তন গাইড 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} name on/off  - 🛡️ নাম পরিবর্তন বন্ধ করুন
        {pn} emoji on/off - 😊 ইমোজি পরিবর্তন বন্ধ করুন
        {pn} theme on/off - 🎨 থিম পরিবর্তন বন্ধ করুন
        {pn} nickname on/off - 🏷️ ডাকনাম পরিবর্তন বন্ধ করুন
        {pn} avt on/off - 🖼️ অবতার পরিবর্তন বন্ধ করুন
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ উদাহরণ: !antichangeinfobox name on
      `
    }
  },

  langs: {
    en: {
      antiChangeAvatarOn: "🖼️ Group avatar protection activated!",
      antiChangeAvatarOff: "🖼️ Avatar protection deactivated",
      missingAvt: "⚠️ No avatar set for this group",
      antiChangeAvatarAlreadyOn: "🛡️ Avatar protection is already active",
      antiChangeNameOn: "📝 Group name protection activated!",
      antiChangeNameOff: "📝 Name protection deactivated",
      antiChangeNameAlreadyOn: "🛡️ Name protection is already active",
      antiChangeNicknameOn: "🏷️ Nickname protection activated!",
      antiChangeNicknameOff: "🏷️ Nickname protection deactivated",
      antiChangeNicknameAlreadyOn: "🛡️ Nickname protection is already active",
      antiChangeThemeOn: "🎨 Theme protection activated!",
      antiChangeThemeOff: "🎨 Theme protection deactivated",
      antiChangeThemeAlreadyOn: "🛡️ Theme protection is already active",
      antiChangeEmojiOn: "😊 Emoji protection activated!",
      antiChangeEmojiOff: "😊 Emoji protection deactivated",
      antiChangeEmojiAlreadyOn: "🛡️ Emoji protection is already active",
      avatarBlocked: "❗🖼️ Group avatar change blocked by security system!",
      nameBlocked: "❗📝 Group name change blocked by security system!",
      nicknameBlocked: "❗🏷️ Nickname change blocked by security system!",
      themeBlocked: "❗🎨 Group theme change blocked by security system!",
      emojiBlocked: "❗😊 Group emoji change blocked by security system!",
      accessDenied: "⛔👑 Command restricted to admin only!",
      invalidCommand: "⚠️ Invalid command! Type '!antichangeinfobox guide' for help"
    },
    bn: {
      antiChangeAvatarOn: "🖼️ গ্রুপ অবতার সুরক্ষা সক্রিয় করা হয়েছে!",
      antiChangeAvatarOff: "🖼️ অবতার সুরক্ষা নিষ্ক্রিয় করা হয়েছে",
      missingAvt: "⚠️ এই গ্রুপের জন্য কোনো অবতার সেট করা নেই",
      antiChangeAvatarAlreadyOn: "🛡️ অবতার সুরক্ষা ইতিমধ্যেই সক্রিয়",
      antiChangeNameOn: "📝 গ্রুপ নাম সুরক্ষা সক্রিয় করা হয়েছে!",
      antiChangeNameOff: "📝 নাম সুরক্ষা নিষ্ক্রিয় করা হয়েছে",
      antiChangeNameAlreadyOn: "🛡️ নাম সুরক্ষা ইতিমধ্যেই সক্রিয়",
      antiChangeNicknameOn: "🏷️ ডাকনাম সুরক্ষা সক্রিয় করা হয়েছে!",
      antiChangeNicknameOff: "🏷️ ডাকনাম সুরক্ষা নিষ্ক্রিয় করা হয়েছে",
      antiChangeNicknameAlreadyOn: "🛡️ ডাকনাম সুরক্ষা ইতিমধ্যেই সক্রিয়",
      antiChangeThemeOn: "🎨 থিম সুরক্ষা সক্রিয় করা হয়েছে!",
      antiChangeThemeOff: "🎨 থিম সুরক্ষা নিষ্ক্রিয় করা হয়েছে",
      antiChangeThemeAlreadyOn: "🛡️ থিম সুরক্ষা ইতিমধ্যেই সক্রিয়",
      antiChangeEmojiOn: "😊 ইমোজি সুরক্ষা সক্রিয় করা হয়েছে!",
      antiChangeEmojiOff: "😊 ইমোজি সুরক্ষা নিষ্ক্রিয় করা হয়েছে",
      antiChangeEmojiAlreadyOn: "🛡️ ইমোজি সুরক্ষা ইতিমধ্যেই সক্রিয়",
      avatarBlocked: "❗🖼️ গ্রুপ অবতার পরিবর্তন সুরক্ষা সিস্টেম দ্বারা ব্লক করা হয়েছে!",
      nameBlocked: "❗📝 গ্রুপ নাম পরিবর্তন সুরক্ষা সিস্টেম দ্বারা ব্লক করা হয়েছে!",
      nicknameBlocked: "❗🏷️ ডাকনাম পরিবর্তন সুরক্ষা সিস্টেম দ্বারা ব্লক করা হয়েছে!",
      themeBlocked: "❗🎨 গ্রুপ থিম পরিবর্তন সুরক্ষা সিস্টেম দ্বারা ব্লক করা হয়েছে!",
      emojiBlocked: "❗😊 গ্রুপ ইমোজি পরিবর্তন সুরক্ষা সিস্টেম দ্বারা ব্লক করা হয়েছে!",
      accessDenied: "⛔👑 কমান্ড শুধুমাত্র অ্যাডমিনের জন্য সীমাবদ্ধ!",
      invalidCommand: "⚠️ ভুল কমান্ড! সাহায্যের জন্য '!antichangeinfobox guide' টাইপ করুন"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    // Show guide if requested
    if (args[0] === "guide") {
      return message.reply(this.config.guide.en);
    }

    // Admin check
    if (event.senderID !== ADMIN_ID) {
      return message.reply(formatMessage(getLang("accessDenied"), "error"));
    }

    const [type, status] = args;
    if (!type || !["on", "off"].includes(status)) {
      return message.reply(formatMessage(getLang("invalidCommand"), "warning"));
    }

    const threadID = event.threadID;
    const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
    const enable = status === "on";

    const save = async (key, value) => {
      if (enable && data[key]) {
        return message.reply(formatMessage(getLang(`antiChange${key.slice(0, 1).toUpperCase()}${key.slice(1)}AlreadyOn`), "warning"));
      }
      
      if (!enable) {
        delete data[key];
      } else {
        data[key] = value;
      }

      await threadsData.set(threadID, data, "data.antiChangeInfoBox");
      await simulateTyping(api, event.threadID);
      message.reply(formatMessage(getLang(`antiChange${key.slice(0, 1).toUpperCase()}${key.slice(1)}${status.slice(0, 1).toUpperCase()}${status.slice(1)}`), "success"));
    };

    try {
      switch (type) {
        case "name": {
          const { threadName } = await threadsData.get(threadID);
          return save("name", threadName);
        }
        case "emoji": {
          const { emoji } = await threadsData.get(threadID);
          return save("emoji", emoji);
        }
        case "theme": {
          const { threadThemeID } = await threadsData.get(threadID);
          return save("theme", threadThemeID || "196241301102133");
        }
        case "nickname": {
          const { members } = await threadsData.get(threadID);
          const nickData = {};
          members.forEach(m => nickData[m.userID] = m.nickname);
          return save("nickname", nickData);
        }
        case "avt":
        case "avatar": {
          const { imageSrc } = await threadsData.get(threadID);
          if (!imageSrc) {
            return message.reply(formatMessage(getLang("missingAvt"), "warning"));
          }
          const uploaded = await uploadImgbb(imageSrc);
          return save("avatar", uploaded?.image?.url || imageSrc);
        }
        default:
          return message.reply(formatMessage(getLang("invalidCommand"), "warning"));
      }
    } catch (err) {
      console.error(err);
      message.reply(formatMessage(`❌ Error: ${err.message}`, "error"));
    }
  },

  onEvent: async function ({ message, event, threadsData, api, getLang }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
    
    if (!data || author === botID || author === ADMIN_ID) return;

    const rollback = async (type, action, msgKey) => {
      if (!data[type]) return;
      
      await simulateTyping(api, threadID);
      
      try {
        await action();
        await simulateTyping(api, threadID);
        message.reply(formatMessage(getLang(msgKey), "error"));
      } catch (err) {
        console.error(`Rollback failed for ${type}:`, err);
      }
    };

    switch (logMessageType) {
      case "log:thread-name":
        await rollback("name", () => api.setTitle(data.name, threadID), "nameBlocked");
        break;
      case "log:thread-icon":
        await rollback("emoji", () => api.changeThreadEmoji(data.emoji, threadID), "emojiBlocked");
        break;
      case "log:thread-color":
        await rollback("theme", () => api.changeThreadColor(data.theme || "196241301102133", threadID), "themeBlocked");
        break;
      case "log:user-nickname":
        const userNick = data.nickname?.[logMessageData.participant_id];
        if (!userNick) return;
        await rollback("nickname", () => api.changeNickname(userNick, threadID, logMessageData.participant_id), "nicknameBlocked");
        break;
      case "log:thread-image":
        if (!data.avatar) return;
        const stream = await getStreamFromURL(data.avatar);
        await rollback("avatar", () => api.changeGroupImage(stream, threadID), "avatarBlocked");
        break;
    }
  }
};
