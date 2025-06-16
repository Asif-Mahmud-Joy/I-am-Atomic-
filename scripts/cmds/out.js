const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "out",
    aliases: ["l", "leave"],
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: "⛔ Bot ke GC theke ber kore dao",
    longDescription: "Ei command use kore bot ke kono group theke leave korano jay.",
    category: "admin",
    guide: {
      en: "{pn} [tid] — Bot will leave the specified group or current group if none provided"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const targetTID = args[0] ? parseInt(args[0]) : event.threadID;

      // Optional: Permission check (Only group admin can use)
      const threadInfo = await api.getThreadInfo(targetTID);
      const senderID = event.senderID;

      if (threadInfo.adminIDs.some(e => e.id === senderID) === false) {
        return api.sendMessage("⚠️ Tumi ei command chalate parba na. Only group admin der jonno!", event.threadID, event.messageID);
      }

      // Send farewell message
      await api.sendMessage(
        `👋𝗠𝗥.𝗦𝗠𝗢𝗞𝗘𝗬 𝗕𝗢𝗧 𝗟𝗘𝗔𝗩𝗘 𝗔𝗡𝗢𝗨𝗡𝗖𝗘𝗠𝗘𝗡𝗧:

🥲 Ami toder sukh dewar jonno aschilam...
😞 Kintu tora amar joggo na...

📤𝗕𝗢𝗧 𝗖𝗛𝗢𝗟𝗘 𝗚𝗘𝗟𝗢... 𝗚𝗢𝗢𝗗𝗕𝗬𝗘!`,
        targetTID
      );

      // Remove bot from group
      return api.removeUserFromGroup(api.getCurrentUserID(), targetTID);
    } catch (err) {
      console.error("[ERROR - out command]", err);
      return api.sendMessage("❌ Bot ke ber korar somoy somossa hoise. TID thik ache to?", event.threadID);
    }
  }
};const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
module.exports = {
config: {
name: "Out",
aliases: ["l"],
version: "1.0",
author: "Sandy",
countDown: 5,
role: 2,
shortDescription: "bot will leave gc",
longDescription: "",
category: "admin",
guide: {
vi: "{pn} [tid,blank]",
en: "{pn} [tid,blank]"
}
},

onStart: async function ({ api,event,args, message }) {
var id;
if (!args.join(" ")) {
id = event.threadID;
} else {
id = parseInt(args.join(" "));
}
return api.sendMessage('▣𝗔𝗬𝗔𝗡 𝗕𝗢𝗧 𝗟𝗘𝗔𝗩𝗘:\n》Ami toder sukh dewar jonno Ashchilam tora etar joggo na.\n\n➤𝗕𝗘𝗬 𝗟𝗘𝗦 𝗡𝗔𝗭𝗘𝗦', id, () => api.removeUserFromGroup(api.getCurrentUserID(), id))
}
}
