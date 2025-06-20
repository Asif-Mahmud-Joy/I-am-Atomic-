const { getStreamFromURL } = global.utils;

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗔𝗡𝗧𝗜-𝗢𝗨𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗥𝗼𝘆𝗮𝗹 𝗔𝗜 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝘆 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    GUARD: "💂‍♂️",
    SHIELD: "🛡️",
    CROWN: "👑",
    LOCK: "🔒",
    UNLOCK: "🔓"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF",
    ROYAL_PURPLE: "#8A2BE2"
  }
};

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${content}

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

const ADMIN_ID = "61571630409265"; // Replace with actual admin ID
// ====================================================================================== //

module.exports = {
  config: {
    name: "antiout",
    aliases: ["royalguard-out"],
    version: "5.0",
    author: "Asif Mahmud | Enhanced by Royal AI",
    countDown: 3,
    role: 0,
    shortDescription: "Royal protection against exiting",
    longDescription: "Premium security to prevent members from leaving the kingdom",
    category: "royal security",
    guide: {
      en: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  👑 𝗥𝗢𝗬𝗔𝗟 𝗔𝗡𝗧𝗜-𝗢𝗨𝗧 𝗚𝗨𝗜𝗗𝗘 👑 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${DESIGN.EMOJI.GUARD} 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:
  ${DESIGN.EMOJI.CROWN} !antiout on  - Activate royal protection
  ${DESIGN.EMOJI.CROWN} !antiout off - Deactivate protection
  ${DESIGN.EMOJI.CROWN} !antiout status - Check protection status

${DESIGN.EMOJI.INFO} 𝗥𝗼𝘆𝗮𝗹 𝗙𝗲𝗮𝘁𝘂𝗿𝗲𝘀:
  ▸ Auto-adds back members who leave
  ▸ Instant royal guard intervention
  ▸ Admin-only control panel

${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`
    }
  },

  langs: {
    en: {
      activated: `${DESIGN.EMOJI.SHIELD} 𝗥𝗼𝘆𝗮𝗹 𝗔𝗻𝘁𝗶-𝗢𝘂𝘁 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱!\n▸ The kingdom is now under royal protection. No one escapes!`,
      deactivated: `${DESIGN.EMOJI.UNLOCK} 𝗔𝗻𝘁𝗶-𝗢𝘂𝘁 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n▸ Members may now leave the kingdom.`,
      alreadyActive: `${DESIGN.EMOJI.WARNING} 𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗔𝗰𝘁𝗶𝘃𝗲!\n▸ Royal guard is already protecting this kingdom.`,
      reAdded: `${DESIGN.EMOJI.GUARD} 𝗥𝗼𝘆𝗮𝗹 𝗜𝗻𝘁𝗲𝗿𝘃𝗲𝗻𝘁𝗶𝗼𝗻!\n▸ @%1 was returned to the kingdom.`,
      accessDenied: `${DESIGN.EMOJI.ERROR} 𝗥𝗼𝘆𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱!\n▸ Only the royal family may use this decree.`,
      invalidCommand: `${DESIGN.EMOJI.WARNING} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗥𝗼𝘆𝗮𝗹 𝗗𝗲𝗰𝗿𝗲𝗲!\n▸ Type "!antiout guide" for royal assistance.`,
      statusActive: `${DESIGN.EMOJI.SHIELD} 𝗥𝗼𝘆𝗮𝗹 𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻: 𝗔𝗖𝗧𝗜𝗩𝗘\n▸ The kingdom is under royal guard surveillance.`,
      statusInactive: `${DESIGN.EMOJI.UNLOCK} 𝗥𝗼𝘆𝗮𝗹 𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻: 𝗜𝗡𝗔𝗖𝗧𝗜𝗩𝗘\n▸ Members may leave freely.`
    }
  },

  onStart: async function({ message, event, args, threadsData, getLang, api }) {
    await simulateTyping(api, event.threadID);
    
    // Show guide if requested
    if (args[0] === "guide") {
      return message.reply(this.config.guide.en);
    }

    // Admin security check
    if (event.senderID !== ADMIN_ID) {
      return message.reply(formatMessage(getLang("accessDenied"), "error"));
    }

    const threadID = event.threadID;
    const action = args[0];

    // Status check
    if (action === "status") {
      const isActive = await threadsData.get(threadID, "settings.antiout") || false;
      return message.reply(
        formatMessage(
          isActive ? getLang("statusActive") : getLang("statusInactive"), 
          "info"
        )
      );
    }

    // Validate command
    if (!["on", "off"].includes(action)) {
      return message.reply(
        formatMessage(getLang("invalidCommand"), "warning")
      );
    }

    // Check current status
    const currentStatus = await threadsData.get(threadID, "settings.antiout");
    if (action === "on" && currentStatus) {
      return message.reply(
        formatMessage(getLang("alreadyActive"), "warning")
      );
    }

    // Update protection status
    await threadsData.set(threadID, action === "on", "settings.antiout");
    await simulateTyping(api, event.threadID);
    
    message.reply(
      formatMessage(
        action === "on" ? getLang("activated") : getLang("deactivated"),
        "success"
      )
    );
  },

  onEvent: async function({ api, event, threadsData, getLang, message }) {
    const threadID = event.threadID;
    const antioutActive = await threadsData.get(threadID, "settings.antiout");

    // Skip if protection inactive or bot/admin events
    if (!antioutActive || event.author === api.getCurrentUserID() || event.author === ADMIN_ID) {
      return;
    }

    // Handle member leaving
    if (event.logMessageType === "log:unsubscribe") {
      const userID = event.logMessageData.leftParticipantFbId;
      
      await simulateTyping(api, threadID);
      
      try {
        // Re-add user to kingdom
        await api.addUserToGroup(userID, threadID);
        
        // Get user info for tagging
        const userInfo = await api.getUserInfo(userID);
        const userName = userInfo[userID]?.name || "Royal Subject";
        
        // Send royal intervention alert
        message.reply(
          formatMessage(
            getLang("reAdded").replace("%1", userName),
            "info"
          ),
          () => {},
          { mentions: [{ tag: userName, id: userID }] }
        );
      } 
      catch (err) {
        console.error(`${DESIGN.EMOJI.ERROR} Royal Intervention Failed:`, err);
      }
    }
  }
};
