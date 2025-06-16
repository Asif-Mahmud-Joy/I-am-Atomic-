const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "nsfw",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    category: "NSFW",
    role: 2
  },

  onStart: async function ({ api, args, message, event }) {
    const threadID = event.threadID;
    const assistPath = path.join(__dirname, 'assist_json');
    const approvedIDsPath = path.join(assistPath, 'approved_ids.json');
    const pendingIDsPath = path.join(assistPath, 'pending_ids.json');

    // 🔧 Ensure assist_json folder exists
    fs.ensureDirSync(assistPath);

    // 🔧 Ensure both JSON files exist with default empty array
    if (!fs.existsSync(approvedIDsPath)) fs.writeJsonSync(approvedIDsPath, []);
    if (!fs.existsSync(pendingIDsPath)) fs.writeJsonSync(pendingIDsPath, []);

    const approvedIDs = fs.readJsonSync(approvedIDsPath);
    const pendingIDs = fs.readJsonSync(pendingIDsPath);

    const saveApproved = () => fs.writeJsonSync(approvedIDsPath, approvedIDs, { spaces: 2 });
    const savePending = () => fs.writeJsonSync(pendingIDsPath, pendingIDs, { spaces: 2 });

    switch (args[0]) {
      case "approved": {
        const id = args[1];
        const msg = args.slice(2).join(" ") || "No message";

        if (approvedIDs.includes(id)) {
          return message.reply("⛔ Ei thread ID already approved.");
        }

        approvedIDs.push(id);
        saveApproved();

        const approveMsg = `✅ Your request has been approved by Admin. NSFW commands now unlocked.\n\n📩 Message: ${msg}`;
        api.sendMessage(approveMsg, id);
        message.reply("✅ Thread approved for NSFW commands.");

        // remove from pending
        const index = pendingIDs.indexOf(id);
        if (index !== -1) {
          pendingIDs.splice(index, 1);
          savePending();
        }
        break;
      }

      case "remove": {
        const id = args[1];
        const reason = args.slice(2).join(" ") || "No reason";

        if (!approvedIDs.includes(id)) {
          return message.reply("❌ This thread is not approved.");
        }

        approvedIDs.splice(approvedIDs.indexOf(id), 1);
        saveApproved();

        api.sendMessage(
          `⚠️ Your NSFW access has been removed.\nReason: ${reason}`,
          id
        );
        message.reply("❌ Removed from NSFW access list.");
        break;
      }

      case "disapproved": {
        const id = args[1];
        const reason = args.slice(2).join(" ") || "No reason";

        if (!pendingIDs.includes(id)) {
          return message.reply("⚠️ This ID is not pending.");
        }

        pendingIDs.splice(pendingIDs.indexOf(id), 1);
        savePending();

        api.sendMessage(
          `❌ Your NSFW request has been denied.\nReason: ${reason}`,
          id
        );
        message.reply("✅ NSFW disapproved.");
        break;
      }

      case "check": {
        return message.reply(
          approvedIDs.includes(threadID)
            ? "✅ NSFW is ON for this thread."
            : "❌ NSFW is OFF for this thread."
        );
      }

      default:
        message.reply("⚠️ Invalid command. Use:\n$nsfw approved <id> <msg>\n$nsfw remove <id> <reason>\n$nsfw disapproved <id> <reason>\n$nsfw check");
        break;
    }
  },
};
