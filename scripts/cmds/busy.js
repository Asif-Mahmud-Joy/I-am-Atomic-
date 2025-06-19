// ============================== 🌌 AESTHETIC DND SYSTEM 🌌 ============================== //
const moment = require("moment-timezone");

// Dreamy Design Configuration
const design = {
  header: "✨ 𝐃𝐎 𝐍𝐎𝐓 𝐃𝐈𝐒𝐓𝐔𝐑𝐁 ✨",
  footer: "🌙 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡",
  separator: "⊱⋅ ────── {⋅♬⋅} ────── ⋅⊰",
  emoji: {
    success: "🌠",   // Shooting star
    error: "🌀",     // Cyclone
    warning: "🌫️",  // Fog
    busy: "🔕",     // Bell with slash
    processing: "⏳", // Hourglass
    clock: "⏱️",    // Timer clock
    user: "👤",     // User silhouette
    moon: "🌙",     // Crescent moon
    star: "⭐",     // Glowing star
    lock: "🔒",     // Locked
    unlock: "🔓",   // Unlocked
    focus: "🎯",    // Bullseye
    available: "💫" // Sparkles
  },
  animationDelay: 1500 // 1.5 seconds
};

// Format beautiful messages
const formatMessage = (content) => {
  return `\n${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}\n`;
};

// Typing animation handler
const typingAnimation = async (api, event, callback) => {
  api.setMessageReaction(design.emoji.processing, event.messageID, () => {}, true);
  setTimeout(() => {
    callback();
    api.setMessageReaction("", event.messageID, () => {}, true);
  }, design.animationDelay);
};
// ======================================================================================== //

if (!global.client.busyList) global.client.busyList = {};

module.exports = {
  config: {
    name: "dnd",
    aliases: ["busy", "afk", "focus"],
    version: "4.0",
    author: "Asif Mahmud",
    countDown: 5,
    role: 0,
    shortDescription: "Minimalist focus mode system",
    longDescription: "Elegant do not disturb system with aesthetic design and smooth animations",
    category: "utility",
    guide: {
      en: "{pn} [reason] - Enable focus mode\n{pn} off - Disable focus mode"
    }
  },

  langs: {
    en: {
      turnedOff: `${design.emoji.unlock} Focus mode disabled`,
      turnedOn: `${design.emoji.lock} Focus mode activated\n${design.emoji.clock} ${moment().format("HH:mm | DD/MM")}`,
      turnedOnWithReason: `${design.emoji.lock} Focus mode activated\n${design.emoji.clock} ${moment().format("HH:mm | DD/MM")}\n${design.emoji.star} Reason: %1`,
      busyUsers: `${design.emoji.busy} Currently focusing:\n%1`,
      busyUserCard: `${design.emoji.user} %1\n${design.emoji.moon} %2\n${design.emoji.clock} %3`,
      noBusyUsers: `${design.emoji.available} All mentioned users are available`,
      reasonTooLong: `${design.emoji.warning} Reason cannot exceed 200 characters`,
      error: `${design.emoji.error} System encountered a dreamy disturbance`
    }
  },

  onStart: async function ({ args, message, event, getLang, usersData, api }) {
    typingAnimation(api, event, async () => {
      try {
        // Handle focus mode deactivation
        if (args[0]?.toLowerCase() === "off") {
          await usersData.set(event.senderID, null, "data.busy");
          return message.reply(formatMessage(getLang("turnedOff")));
        }

        // Process focus mode activation
        const reason = args.join(" ").trim();
        
        // Validate reason length
        if (reason.length > 200) {
          return message.reply(formatMessage(getLang("reasonTooLong")));
        }

        // Save focus status with timestamp
        await usersData.set(event.senderID, { 
          reason, 
          time: moment().format("HH:mm | DD/MM")
        }, "data.busy");
        
        // Prepare response based on reason presence
        const response = reason ? 
          getLang("turnedOnWithReason", reason) : 
          getLang("turnedOn");
          
        message.reply(formatMessage(response));
      } catch (error) {
        message.reply(formatMessage(getLang("error")));
      }
    });
  },

  onChat: async function ({ event, message, getLang, api }) {
    // Only respond to messages with mentions
    if (!event.mentions || !Object.keys(event.mentions).length) return;
    
    typingAnimation(api, event, async () => {
      try {
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
              getLang("busyUserCard", name, reason || "Deep focus", time)
            );
          }
        }

        // Send appropriate response
        if (busyList.length) {
          message.reply(formatMessage(getLang("busyUsers", busyList.join("\n\n"))));
        } else {
          message.reply(formatMessage(getLang("noBusyUsers")));
        }
      } catch {
        message.reply(formatMessage(getLang("error")));
      }
    });
  }
};
