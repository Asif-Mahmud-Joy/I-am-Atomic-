const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "nsfw_approve", // ✅ Renamed to prevent conflict
    aliases: ["ns_approve"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    category: "owner",
    role: 2,
    guide: {
      en: "{pn} approve/remove/disapproved/check [threadID] [optional: message/reason]"
    }
  },

  onStart: async function({ api, args, message, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const approvedIDsPath = path.join(__dirname, "assist_json", "approved_ids.json");
    const pendingIDsPath = path.join(__dirname, "assist_json", "pending_ids.json");

    const loadIDs = (filePath) => fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
    const saveIDs = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const action = args[0];
    const id = args[1];
    const extra = args.slice(2).join(" ");

    switch (action) {
      case "approve": {
        if (!id) return message.reply(`🔴 Provide a thread ID to approve.`);
        const approvedIDs = loadIDs(approvedIDsPath);
        if (approvedIDs.includes(id)) {
          return message.reply(`✅ This thread ID is already approved.`);
        }
        approvedIDs.push(id);
        saveIDs(approvedIDsPath, approvedIDs);

        const pendingIDs = loadIDs(pendingIDsPath);
        const pendingIndex = pendingIDs.indexOf(id);
        if (pendingIndex !== -1) {
          pendingIDs.splice(pendingIndex, 1);
          saveIDs(pendingIDsPath, pendingIDs);
        }

        api.sendMessage(`✅ Your thread has been approved to use NSFW commands.\n📝 Message from admin: ${extra || "None"}`, id);
        return message.reply(`✅ Approved thread ${id}. Now able to use NSFW.`);
      }

      case "remove": {
        if (!id) return message.reply(`🔴 Provide a thread ID to remove.`);
        const approvedIDs = loadIDs(approvedIDsPath);
        const index = approvedIDs.indexOf(id);
        if (index === -1) {
          return message.reply(`❌ This thread ID is not approved.`);
        }
        approvedIDs.splice(index, 1);
        saveIDs(approvedIDsPath, approvedIDs);

        api.sendMessage(`⚠️ Your NSFW command access has been removed.\nReason: ${extra || "No reason provided"}`, id);
        return message.reply(`❌ Removed NSFW access for thread ${id}.`);
      }

      case "disapproved": {
        if (!id) return message.reply(`🔴 Provide a thread ID to disapprove.`);
        const pendingIDs = loadIDs(pendingIDsPath);
        const index = pendingIDs.indexOf(id);
        if (index === -1) {
          return message.reply(`❌ This thread ID is not pending.`);
        }
        pendingIDs.splice(index, 1);
        saveIDs(pendingIDsPath, pendingIDs);

        api.sendMessage(`❌ Your request for NSFW access has been disapproved.\nReason: ${extra || "No reason provided"}`, id);
        return message.reply(`❌ Disapproved thread ${id} from using NSFW.`);
      }

      case "check": {
        const approvedIDs = loadIDs(approvedIDsPath);
        return message.reply(
          approvedIDs.includes(threadID)
            ? `✅ NSFW is enabled for this thread.`
            : `❌ NSFW is disabled for this thread.`
        );
      }

      default:
        return message.reply(`⚠️ Invalid command. Use: \"${p}nsfw_approve approve/remove/disapproved/check [threadID]\"`);
    }
  },
};
