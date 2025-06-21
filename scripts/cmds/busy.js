if (!global.client.busyList)
	global.client.busyList = {};

// ============================== ☣️ ATOMIC DESIGN SYSTEM ☣️ ============================== //
const design = {
  header: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗖𝗨𝗦 𝗠𝗢𝗗𝗘 ⚡",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    success: "✅",
    error: "⚠️",
    busy: "🔕",
    processing: "⚛️",
    clock: "⏱️",
    user: "👤",
    unlock: "🔓",
    lock: "🔒",
    focus: "🎯",
    available: "💫",
    warning: "☢️"
  }
};

const formatMessage = (content) => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};

const simulateProcessing = async (api, event) => {
  api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
  await new Promise(resolve => setTimeout(resolve, 1500));
  api.setMessageReaction("", event.messageID, () => {}, true);
};
// ======================================================================================== //

module.exports = {
  config: {
    name: "focus",
    aliases: ["busy", "dnd", "atomicfocus"],
    version: "4.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Activate atomic focus mode",
    longDescription: "⚡ Enable precision focus mode to minimize distractions with atomic design",
    category: "utility",
    guide: {
      en: "{pn} [reason] - Enable atomic focus\n{pn} off - Disable focus mode"
    }
  },

  langs: {
    en: {
      turnedOff: `${design.emoji.unlock} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗖𝗨𝗦 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗\n\n▸ You are now available for interactions`,
      turnedOn: `${design.emoji.lock} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗖𝗨𝗦 𝗘𝗡𝗔𝗕𝗟𝗘𝗗\n\n▸ Notifications muted ${design.emoji.busy}\n${design.emoji.clock} Activated at: %1`,
      turnedOnWithReason: `${design.emoji.lock} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗖𝗨𝗦 𝗘𝗡𝗔𝗕𝗟𝗘𝗗\n\n▸ Notifications muted ${design.emoji.busy}\n${design.emoji.clock} Activated at: %1\n${design.emoji.focus} Reason: %2`,
      busyUsers: `☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗢𝗖𝗨𝗦 𝗔𝗟𝗘𝗥𝗧\n\n▸ These users are in focus mode:\n\n%1`,
      busyUserCard: `${design.emoji.user} %1\n${design.emoji.clock} Since: %2\n${design.emoji.focus} %3`,
      noBusyUsers: `${design.emoji.available} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗜𝗟𝗜𝗧𝗬\n\n▸ All mentioned users are currently available`,
      reasonTooLong: `${design.emoji.warning} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗡𝗣𝗨𝗧 𝗘𝗥𝗥𝗢𝗥\n\n▸ Focus reason cannot exceed 100 characters`,
      error: `${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗬𝗦𝗧𝗘𝗠 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to process focus command`
    }
  },

  onStart: async function ({ args, message, event, getLang, usersData, api }) {
    try {
      await simulateProcessing(api, event);
      
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Handle focus mode deactivation
      if (args[0]?.toLowerCase() === "off") {
        await usersData.set(event.senderID, null, "data.busy");
        return message.reply(getLang("turnedOff"));
      }

      // Process focus mode activation
      const reason = args.join(" ").trim();
      
      // Validate reason length
      if (reason.length > 100) {
        return message.reply(getLang("reasonTooLong"));
      }

      // Save focus status with timestamp
      await usersData.set(event.senderID, { 
        reason, 
        time: now
      }, "data.busy");
      
      // Prepare response based on reason presence
      const response = reason ? 
        getLang("turnedOnWithReason", now, reason) : 
        getLang("turnedOn", now);
        
      message.reply(formatMessage(response));
    } catch (error) {
      console.error("Atomic Focus Error:", error);
      message.reply(getLang("error"));
    }
  },

  onChat: async function ({ event, message, getLang, api }) {
    try {
      // Only respond to messages with mentions
      if (!event.mentions || !Object.keys(event.mentions).length) return;
      
      await simulateProcessing(api, event);
      
      const busyList = [];
      
      // Check all mentioned users
      for (const userID of Object.keys(event.mentions)) {
        const user = global.db.allUserData.find(u => u.userID == userID);
        
        // If user has focus mode enabled
        if (user?.data?.busy) {
          const name = event.mentions[userID].replace("@", "");
          const { reason, time } = user.data.busy;
          
          // Create user focus card
          busyList.push(
            getLang("busyUserCard", name, time, reason || "Deep atomic focus")
          );
        }
      }

      // Send appropriate response
      if (busyList.length) {
        const formattedList = busyList.join("\n\n");
        const response = getLang("busyUsers", formattedList);
        message.reply(formatMessage(response));
      } else {
        message.reply(formatMessage(getLang("noBusyUsers")));
      }
    } catch (error) {
      console.error("Atomic Focus Chat Error:", error);
    }
  }
};
