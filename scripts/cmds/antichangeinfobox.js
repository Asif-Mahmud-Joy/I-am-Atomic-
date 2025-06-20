const { getStreamFromURL, uploadImgbb } = global.utils;

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗚𝗨𝗔𝗥𝗗𝗜𝗔𝗡 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗔𝗜 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 ✨",
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
    SHIELD: "🛡️",
    GUARD: "💂‍♂️"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF",
    ROYAL_PURPLE: "#8A2BE2",
    GOLD: "#FFD700"
  }
};

const formatMessage = (content, type = "info", title = null) => {
  const headerTitle = title || DESIGN.HEADER;
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${headerTitle}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

const ADMIN_ID = "61571630409265";
// ====================================================================================== //

module.exports = {
  config: {
    name: "royalguard",
    aliases: ["rg", "royalprotect"],
    version: "5.0",
    author: "Asif Mahmud | Enhanced by Royal AI",
    countDown: 5,
    role: 0,
    shortDescription: "Royal protection against unauthorized changes",
    longDescription: "Premium security system to protect group information from unauthorized modifications",
    category: "security",
    guide: {
      en: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👑 𝗥𝗢𝗬𝗔𝗟 𝗚𝗨𝗔𝗥𝗗 𝗚𝗨𝗜𝗗𝗘 👑 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${DESIGN.EMOJI.GUARD} 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:
  ${DESIGN.EMOJI.SHIELD} !royalguard name on/off  - Prevent name changes
  ${DESIGN.EMOJI.SHIELD} !royalguard emoji on/off - Prevent emoji changes
  ${DESIGN.EMOJI.SHIELD} !royalguard theme on/off - Prevent theme changes
  ${DESIGN.EMOJI.SHIELD} !royalguard nickname on/off - Prevent nickname changes
  ${DESIGN.EMOJI.SHIELD} !royalguard avt on/off   - Prevent avatar changes
  ${DESIGN.EMOJI.SHIELD} !royalguard status       - View current protection status
  ${DESIGN.EMOJI.SHIELD} !royalguard guide        - Show this help menu

${DESIGN.EMOJI.INFO} 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
  ${DESIGN.EMOJI.ADMIN} !royalguard name on
  ${DESIGN.EMOJI.ADMIN} !royalguard avt off

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`
    }
  },

  langs: {
    en: {
      antiChangeAvatarOn: "🖼️ 𝗥𝗼𝘆𝗮𝗹 𝗔𝘃𝗮𝘁𝗮𝗿 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘈𝘭𝘭 𝘢𝘷𝘢𝘵𝘢𝘳 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘸𝘪𝘭𝘭 𝘣𝘦 𝘣𝘭𝘰𝘤𝘬𝘦𝘥 𝘣𝘺 𝘵𝘩𝘦 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥.",
      antiChangeAvatarOff: "🖼️ 𝗔𝘃𝗮𝘁𝗮𝗿 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ 𝘈𝘷𝘢𝘵𝘢𝘳 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢𝘭𝘭𝘰𝘸𝘦𝘥.",
      missingAvt: "⚠️ 𝗡𝗼 𝗿𝗼𝘆𝗮𝗹 𝗮𝘃𝗮𝘁𝗮𝗿 𝘀𝗲𝘁\n▸ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘴𝘦𝘵 𝘢𝘯 𝘢𝘷𝘢𝘵𝘢𝘳 𝘣𝘦𝘧𝘰𝘳𝘦 𝘦𝘯𝘢𝘣𝘭𝘪𝘯𝘨 𝘱𝘳𝘰𝘵𝘦𝘤𝘵𝘪𝘰𝘯.",
      antiChangeAvatarAlreadyOn: "👑 𝗔𝘃𝗮𝘁𝗮𝗿 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗲\n▸ 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥 𝘪𝘴 𝘢𝘭𝘳𝘦𝘢𝘥𝘺 𝘨𝘶𝘢𝘳𝘥𝘪𝘯𝘨 𝘺𝘰𝘶𝘳 𝘨𝘳𝘰𝘶𝘱'𝘴 𝘢𝘷𝘢𝘵𝘢𝘳.",
      antiChangeNameOn: "📝 𝗥𝗼𝘆𝗮𝗹 𝗻𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘈𝘭𝘭 𝘯𝘢𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘸𝘪𝘭𝘭 𝘣𝘦 𝘣𝘭𝘰𝘤𝘬𝘦𝘥 𝘣𝘺 𝘵𝘩𝘦 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥.",
      antiChangeNameOff: "📝 𝗡𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ 𝘕𝘢𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢𝘭𝘭𝘰𝘸𝘦𝘥.",
      antiChangeNameAlreadyOn: "👑 𝗡𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗲\n▸ 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥 𝘪𝘴 𝘢𝘭𝘳𝘦𝘢𝘥𝘺 𝘨𝘶𝘢𝘳𝘥𝘪𝘯𝘨 𝘺𝘰𝘶𝘳 𝘨𝘳𝘰𝘶𝘱'𝘴 𝘯𝘢𝘮𝘦.",
      antiChangeNicknameOn: "🏷️ 𝗥𝗼𝘆𝗮𝗹 𝗻𝗶𝗰𝗸𝗻𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘈𝘭𝘭 𝘯𝘪𝘤𝘬𝘯𝘢𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘸𝘪𝘭𝘭 𝘣𝘦 𝘣𝘭𝘰𝘤𝘬𝘦𝘥 𝘣𝘺 𝘵𝘩𝘦 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥.",
      antiChangeNicknameOff: "🏷️ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ 𝘕𝘪𝘤𝘬𝘯𝘢𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢𝘭𝘭𝘰𝘸𝘦𝘥.",
      antiChangeNicknameAlreadyOn: "👑 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗲\n▸ 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥 𝘪𝘴 𝘢𝘭𝘳𝘦𝘢𝘥𝘺 𝘨𝘶𝘢𝘳𝘥𝘪𝘯𝘨 𝘯𝘪𝘤𝘬𝘯𝘢𝘮𝘦𝘴.",
      antiChangeThemeOn: "🎨 𝗥𝗼𝘆𝗮𝗹 𝘁𝗵𝗲𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘈𝘭𝘭 𝘵𝘩𝘦𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘸𝘪𝘭𝘭 𝘣𝘦 𝘣𝘭𝘰𝘤𝘬𝘦𝘥 𝘣𝘺 𝘵𝘩𝘦 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥.",
      antiChangeThemeOff: "🎨 𝗧𝗵𝗲𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ 𝘛𝘩𝘦𝘮𝘦 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢𝘭𝘭𝘰𝘸𝘦𝘥.",
      antiChangeThemeAlreadyOn: "👑 𝗧𝗵𝗲𝗺𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗲\n▸ 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥 𝘪𝘴 𝘢𝘭𝘳𝘦𝘢𝘥𝘺 𝘨𝘶𝘢𝘳𝘥𝘪𝘯𝘨 𝘺𝘰𝘶𝘳 𝘨𝘳𝘰𝘶𝘱'𝘴 𝘵𝘩𝘦𝘮𝘦.",
      antiChangeEmojiOn: "😊 𝗥𝗼𝘆𝗮𝗹 𝗲𝗺𝗼𝗷𝗶 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘈𝘭𝘭 𝘦𝘮𝘰𝘫𝘪 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘸𝘪𝘭𝘭 𝘣𝘦 𝘣𝘭𝘰𝘤𝘬𝘦𝘥 𝘣𝘺 𝘵𝘩𝘦 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥.",
      antiChangeEmojiOff: "😊 𝗘𝗺𝗼𝗷𝗶 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ 𝘌𝘮𝘰𝘫𝘪 𝘤𝘩𝘢𝘯𝘨𝘦𝘴 𝘢𝘳𝘦 𝘯𝘰𝘸 𝘢𝘭𝘭𝘰𝘸𝘦𝘥.",
      antiChangeEmojiAlreadyOn: "👑 𝗘𝗺𝗼𝗷𝗶 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗲\n▸ 𝘙𝘰𝘺𝘢𝘭 𝘎𝘶𝘢𝘳𝘥 𝘪𝘴 𝘢𝘭𝘳𝘦𝘢𝘥𝘺 𝘨𝘶𝘢𝘳𝘥𝘪𝘯𝘨 𝘺𝘰𝘶𝘳 𝘨𝘳𝘰𝘶𝘱'𝘴 𝘦𝘮𝘰𝘫𝘪.",
      avatarBlocked: "🛡️ 𝗔𝘃𝗮𝘁𝗮𝗿 𝗰𝗵𝗮𝗻𝗴𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗚𝘂𝗮𝗿𝗱!\n▸ 𝘖𝘯𝘭𝘺 𝘳𝘰𝘺𝘢𝘭 𝘢𝘥𝘮𝘪𝘯𝘴 𝘤𝘢𝘯 𝘤𝘩𝘢𝘯𝘨𝘦 𝘵𝘩𝘦 𝘨𝘳𝘰𝘶𝘱 𝘢𝘷𝘢𝘵𝘢𝘳.",
      nameBlocked: "🛡️ 𝗡𝗮𝗺𝗲 𝗰𝗵𝗮𝗻𝗴𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗚𝘂𝗮𝗿𝗱!\n▸ 𝘖𝘯𝘭𝘺 𝘳𝘰𝘺𝘢𝘭 𝘢𝘥𝘮𝘪𝘯𝘴 𝘤𝘢𝘯 𝘤𝘩𝘢𝘯𝘨𝘦 𝘵𝘩𝘦 𝘨𝘳𝘰𝘶𝘱 𝘯𝘢𝘮𝘦.",
      nicknameBlocked: "🛡️ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 𝗰𝗵𝗮𝗻𝗴𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗚𝘂𝗮𝗿𝗱!\n▸ 𝘖𝘯𝘭𝘺 𝘳𝘰𝘺𝘢𝘭 𝘢𝘥𝘮𝘪𝘯𝘴 𝘤𝘢𝘯 𝘤𝘩𝘢𝘯𝘨𝘦 𝘯𝘪𝘤𝘬𝘯𝘢𝘮𝘦𝘴.",
      themeBlocked: "🛡️ 𝗧𝗵𝗲𝗺𝗲 𝗰𝗵𝗮𝗻𝗴𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗚𝘂𝗮𝗿𝗱!\n▸ 𝘖𝘯𝘭𝘺 𝘳𝘰𝘺𝘢𝘭 𝘢𝘥𝘮𝘪𝘯𝘴 𝘤𝘢𝘯 𝘤𝘩𝘢𝘯𝘨𝘦 𝘵𝘩𝘦 𝘨𝘳𝘰𝘶𝘱 𝘵𝘩𝘦𝘮𝘦.",
      emojiBlocked: "🛡️ 𝗘𝗺𝗼𝗷𝗶 𝗰𝗵𝗮𝗻𝗴𝗲 𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗚𝘂𝗮𝗿𝗱!\n▸ 𝘖𝘯𝘭𝘺 𝘳𝘰𝘺𝘢𝘭 𝘢𝘥𝘮𝘪𝘯𝘴 𝘤𝘢𝘯 𝘤𝘩𝘢𝘯𝘨𝘦 𝘵𝘩𝘦 𝘨𝘳𝘰𝘶𝘱 𝘦𝘮𝘰𝘫𝘪.",
      accessDenied: "⛔ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝘁𝗼 𝗥𝗼𝘆𝗮𝗹 𝗔𝗱𝗺𝗶𝗻𝘀 𝗼𝗻𝗹𝘆!\n▸ 𝘠𝘰𝘶 𝘮𝘶𝘴𝘵 𝘩𝘢𝘷𝘦 𝘳𝘰𝘺𝘢𝘭 𝘣𝘭𝘰𝘰𝘥 𝘵𝘰 𝘶𝘴𝘦 𝘵𝘩𝘪𝘴 𝘤𝘰𝘮𝘮𝘢𝘯𝘥.",
      invalidCommand: "⚠️ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗿𝗼𝘆𝗮𝗹 𝗱𝗲𝗰𝗿𝗲𝗲!\n▸ 𝘛𝘺𝘱𝘦 '!royalguard guide' 𝘧𝘰𝘳 𝘳𝘰𝘺𝘢𝘭 𝘢𝘴𝘴𝘪𝘴𝘵𝘢𝘯𝘤𝘦.",
      royalShield: "🛡️ 𝗥𝗼𝘆𝗮𝗹 𝗦𝗵𝗶𝗲𝗹𝗱 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ 𝘛𝘩𝘪𝘴 𝘨𝘳𝘰𝘶𝘱 𝘪𝘴 𝘯𝘰𝘸 𝘶𝘯𝘥𝘦𝘳 𝘳𝘰𝘺𝘢𝘭 𝘱𝘳𝘰𝘵𝘦𝘤𝘵𝘪𝘰𝘯.",
      protectionStatus: "🛡️ 𝗥𝗼𝘆𝗮𝗹 𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗦𝘁𝗮𝘁𝘂𝘀:\n",
      active: "✅ Active",
      inactive: "❌ Inactive"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    // Show guide if requested
    if (args[0] === "guide") {
      return message.reply(this.config.guide.en);
    }

    // Show protection status
    if (args[0] === "status") {
      const threadID = event.threadID;
      const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
      
      const statusMessage = 
        `${getLang("protectionStatus")}
        ${DESIGN.EMOJI.NAME} Name Protection: ${data.name ? getLang("active") : getLang("inactive")}
        ${DESIGN.EMOJI.NICKNAME} Nickname Protection: ${data.nickname ? getLang("active") : getLang("inactive")}
        ${DESIGN.EMOJI.AVATAR} Avatar Protection: ${data.avatar ? getLang("active") : getLang("inactive")}
        ${DESIGN.EMOJI.THEME} Theme Protection: ${data.theme ? getLang("active") : getLang("inactive")}
        ${DESIGN.EMOJI.EMOJI} Emoji Protection: ${data.emoji ? getLang("active") : getLang("inactive")}`;

      return message.reply(formatMessage(statusMessage, "info", "🛡️ Royal Protection Status"));
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
      message.reply(formatMessage(`❌ 𝗥𝗼𝘆𝗮𝗹 𝗘𝗿𝗿𝗼𝗿: ${err.message}`, "error"));
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
        console.error(`Royal Rollback failed for ${type}:`, err);
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
