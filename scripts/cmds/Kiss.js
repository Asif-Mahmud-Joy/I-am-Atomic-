const moment = require("moment-timezone");

// ☣️⚛️ ATOMIC GROUP MANAGEMENT ⚛️☣️
const config = {
  ADMIN_IDS: ["61571630409265"],
  CONFIRMATION_TIMEOUT: 30000,
  CONFIRMATION_EMOJI: "✅",
  DESIGN: {
    HEADER: "☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐆𝐑𝐎𝐔𝐏 𝐌𝐀𝐍𝐀𝐆𝐄𝐌𝐄𝐍𝐓 ⚛️☣️",
    FOOTER: "✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡 ⚡️",
    SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
    EMOJI: {
      SUCCESS: "✅",
      ERROR: "❌",
      WARNING: "⚠️",
      PROCESSING: "⏳",
      KICK: "👢",
      SECURITY: "🛡️"
    }
  }
};

module.exports = {
  config: {
    name: "kick",
    aliases: ["remove", "atomic-kick"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍",
    countDown: 5,
    role: 1,
    shortDescription: "☣️⚛️ Remove users from group",
    longDescription: "Advanced group management with Atomic design",
    category: "admin",
    guide: {
      en: "{p}kick @mention [@mention2 ...]"
    }
  },

  langs: {
    en: {
      needAdmin: "🔒 Bot requires admin privileges",
      syntaxError: "⚠️ Mention users to remove",
      invalidUser: "⚠️ User not found: %1",
      cannotKickAdmin: "🛡️ Cannot remove admin: %1",
      cannotKickBot: "🤖 Cannot remove bot",
      confirmKick: "⚠️ Confirm removal of %1 members?",
      kickSuccess: "✅ Removed %1 from group",
      kickFailed: "❌ Failed to remove %1",
      confirmationTimeout: "⌛ Confirmation expired",
      confirmationDenied: "🚫 Removal canceled",
      error: "⚠️ System error during removal"
    }
  },

  onStart: async function ({ message, event, args, threadsData, api, getLang }) {
    const { senderID, threadID, messageID } = event;
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    // Format Atomic message
    const formatAtomicMessage = (content) => {
      return `${config.DESIGN.HEADER}\n${config.DESIGN.SEPARATOR}\n${content}\n${config.DESIGN.SEPARATOR}\n${config.DESIGN.FOOTER}`;
    };

    // Send Atomic-styled message
    const sendAtomicMessage = async (content) => {
      return api.sendMessage({
        body: formatAtomicMessage(content)
      }, threadID);
    };

    // Show processing animation
    api.setMessageReaction(config.DESIGN.EMOJI.PROCESSING, messageID, () => {}, true);
    const processingMsg = await sendAtomicMessage(
      `${config.DESIGN.EMOJI.PROCESSING} Scanning group members...`
    );

    try {
      // Check bot admin status
      const adminIDs = await threadsData.get(threadID, "adminIDs");
      const botID = api.getCurrentUserID();
      if (!adminIDs.includes(botID)) {
        await api.unsendMessage(processingMsg.messageID);
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.ERROR} ${getLang("needAdmin")}`
        );
      }

      // Identify targets
      let uids = Object.keys(event.mentions);
      let targetNames = [];
      if (uids.length === 0) {
        await api.unsendMessage(processingMsg.messageID);
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.WARNING} ${getLang("syntaxError")}`
        );
      }

      // Validate targets
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs;
      const userInfo = await api.getUserInfo(uids);
      const validUids = [];

      for (const uid of uids) {
        if (!participants.includes(uid)) {
          await api.unsendMessage(processingMsg.messageID);
          return sendAtomicMessage(
            `${config.DESIGN.EMOJI.WARNING} ${getLang("invalidUser", uid)}`
          );
        }
        if (adminIDs.includes(uid)) {
          const name = userInfo[uid]?.name || uid;
          await api.unsendMessage(processingMsg.messageID);
          return sendAtomicMessage(
            `${config.DESIGN.EMOJI.ERROR} ${getLang("cannotKickAdmin", name)}`
          );
        }
        if (uid === botID) {
          await api.unsendMessage(processingMsg.messageID);
          return sendAtomicMessage(
            `${config.DESIGN.EMOJI.ERROR} ${getLang("cannotKickBot")}`
          );
        }
        validUids.push(uid);
        targetNames.push(userInfo[uid]?.name || uid);
      }

      // Send confirmation
      const confirmMsg = await sendAtomicMessage(
        `${config.DESIGN.EMOJI.WARNING} ${getLang("confirmKick", validUids.length)}\n` +
        `▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ 50%\n` +
        `⚠️ React with ${config.CONFIRMATION_EMOJI} to confirm\n` +
        `⏱️ Timeout: ${config.CONFIRMATION_TIMEOUT/1000}s`
      );

      // Confirmation listener
      const waitForReaction = new Promise((resolve) => {
        const listener = (reactionEvent) => {
          if (
            reactionEvent.messageID === confirmMsg.messageID &&
            reactionEvent.userID === senderID &&
            reactionEvent.reaction === config.CONFIRMATION_EMOJI
          ) {
            api.removeListener(listener);
            resolve(true);
          }
        };
        api.listen(listener);

        setTimeout(() => {
          api.removeListener(listener);
          resolve(false);
        }, config.CONFIRMATION_TIMEOUT);
      });

      const confirmed = await waitForReaction;
      if (!confirmed) {
        await api.unsendMessage(confirmMsg.messageID);
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.WARNING} ${getLang("confirmationTimeout")}`
        );
      }

      // Update status
      await api.sendMessage(
        formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} Removing members...\n` +
          `▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ 75%`
        ),
        threadID
      );

      // Execute removal
      const failedRemovals = [];
      for (const uid of validUids) {
        try {
          await api.removeUserFromGroup(uid, threadID);
        } catch (err) {
          failedRemovals.push(userInfo[uid]?.name || uid);
        }
      }

      // Send results
      await api.unsendMessage(confirmMsg.messageID);
      await api.unsendMessage(processingMsg.messageID);
      
      const successNames = targetNames.filter(name => !failedRemovals.includes(name));
      if (successNames.length > 0) {
        sendAtomicMessage(
          `${config.DESIGN.EMOJI.SUCCESS} ${getLang("kickSuccess", successNames.join(", "))}\n` +
          `⏱️ ${time} | 👥 Members removed: ${successNames.length}`
        );
      }
      
      if (failedRemovals.length > 0) {
        sendAtomicMessage(
          `${config.DESIGN.EMOJI.ERROR} ${getLang("kickFailed", failedRemovals.join(", "))}\n` +
          `💡 Ensure bot has proper permissions`
        );
      }

    } catch (error) {
      console.error("Atomic kick error:", error);
      try {
        await api.unsendMessage(processingMsg.messageID);
      } catch {}
      return sendAtomicMessage(
        `${config.DESIGN.EMOJI.ERROR} ${getLang("error")}\n` +
        `🔧 Error: ${error.message || "Unknown"}\n` +
        `${config.DESIGN.SEPARATOR}\n` +
        `💡 Contact system administrator`
      );
    }
  }
};
