const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "out",
    aliases: ["l", "leave"],
    version: "2.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: "⛔ Bot ke GC theke ber kore dao",
    longDescription: "Ei command use kore bot ke kono group theke leave korano jay.",
    category: "admin",
    guide: {
      en: "{pn} [tid] — Bot will leave the specified group or current group if none provided",
      bn: "{pn} [tid] — Bot ke specific group (tid) ba current group theke ber kore dibe"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const targetTID = args[0] ? parseInt(args[0]) : event.threadID;
      const threadInfo = await api.getThreadInfo(targetTID);
      const senderID = event.senderID;

      if (!threadInfo.adminIDs.some(e => e.id === senderID)) {
        return api.sendMessage("⚠️ Ei command shudhu group admin ra use korte parbe!", event.threadID);
      }

      // Send farewell message
      await api.sendMessage(
        `👋𝗠𝗥.𝗦𝗠𝗢𝗞𝗘𝗬 𝗕𝗢𝗧 𝗟𝗘𝗔𝗩𝗘 𝗔𝗡𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧:

🥲 Ami toder sukh dewar jonno aschilam...
😞 Kintu tora amar joggo na...

📤𝗕𝗢𝗧 𝗖𝗛𝗢𝗟𝗘 𝗚𝗘𝗟𝗢... 𝗚𝗢𝗢𝗗𝗕𝗬𝗘!`,
        targetTID
      );

      // Leave the group
      return api.removeUserFromGroup(api.getCurrentUserID(), targetTID);
    } catch (err) {
      console.error("[out command error]", err);
      return api.sendMessage("❌ Bot ke group theke ber korte giye error hoise. TID tik ache to?", event.threadID);
    }
  }
};
