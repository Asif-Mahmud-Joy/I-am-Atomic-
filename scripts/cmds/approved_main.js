const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "main",
    version: "2.0.0-realworld",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    category: "owner",
    role: 2,
    guide: {
      en: "{pn} approve/remove/disapproved/check"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const approvedIDsPath = path.join(__dirname, "assist_json", "approved_main.json");
    const pendingIDsPath = path.join(__dirname, "assist_json", "pending_main.json");

    // Ensure safe file existence
    let approvedIDs = [];
    let pendingIDs = [];
    try {
      approvedIDs = fs.readJsonSync(approvedIDsPath, { throws: false }) || [];
      pendingIDs = fs.readJsonSync(pendingIDsPath, { throws: false }) || [];
    } catch (e) {
      console.error("File read error:", e);
    }

    const id = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided.";

    switch (args[0]) {
      case "approve": {
        if (!id) return message.reply("❌ Thread ID missing.");
        if (approvedIDs.includes(id)) {
          return message.reply(`✅ Ei thread ID already approved: ${id}`);
        }
        approvedIDs.push(id);
        fs.writeJsonSync(approvedIDsPath, approvedIDs);
        if (pendingIDs.includes(id)) {
          pendingIDs = pendingIDs.filter(x => x !== id);
          fs.writeJsonSync(pendingIDsPath, pendingIDs);
        }

        api.sendMessage(
          `🔓 Main Command Access Approved

🎩 Approver: 🌫 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🎩
👤 Owner: 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝

📩 Message: ${reason}

📽️: https://files.catbox.moe/qptlr8.mp4
🖼️: https://files.catbox.moe/k8kwue.jpg
🌐 FB: https://www.facebook.com/share/1HPjorq8ce/

To join support: Type ${p}support`,
          id
        );

        return message.reply("✅ Approved successfully.");
      }

      case "remove": {
        if (!id) return message.reply("❌ Thread ID missing.");
        if (!approvedIDs.includes(id)) {
          return message.reply("❌ This thread is not approved.");
        }

        approvedIDs = approvedIDs.filter(x => x !== id);
        fs.writeJsonSync(approvedIDsPath, approvedIDs);

        api.sendMessage(
          `⛔ Main Command Permission Removed

❌ Reason: ${reason}
👤 Owner: 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝
🌐 FB: https://www.facebook.com/share/1HPjorq8ce/

Type ${p}support to get help.`,
          id
        );

        return message.reply("✅ Removed successfully.");
      }

      case "disapproved": {
        if (!id) return message.reply("❌ Thread ID missing.");
        if (!pendingIDs.includes(id)) {
          return message.reply("❌ Ei thread ID pending list e nai.");
        }

        pendingIDs = pendingIDs.filter(x => x !== id);
        fs.writeJsonSync(pendingIDsPath, pendingIDs);

        api.sendMessage(
          `⛔ Request Disapproved

❌ Reason: ${reason}
👤 Owner: 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝
🌐 FB: https://www.facebook.com/share/1HPjorq8ce/

Join support box by typing ${p}support`,
          id
        );

        return message.reply("✅ Disapproved successfully.");
      }

      case "check": {
        return approvedIDs.includes(threadID)
          ? message.reply("✅ Ei thread approved. Main cmds active.")
          : message.reply("❌ Ei thread not approved. Main cmds locked.");
      }

      default:
        return message.reply(`⚠️ Invalid usage. Try: ${p}main approve/remove/disapproved/check <uid>`);
    }
  }
};
