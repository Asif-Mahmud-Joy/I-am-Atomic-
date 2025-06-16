const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "approved",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "owner",
    shortDescription: {
      en: "Manage approved/pending thread IDs"
    },
  },

  onLoad: async function () {
    const dirPath = path.join(__dirname, "cache");
    const dataPath = path.join(dirPath, "approvedThreads.json");
    const pendingPath = path.join(dirPath, "pendingThreads.json");

    await fs.ensureDir(dirPath);
    await fs.ensureFile(dataPath);
    await fs.ensureFile(pendingPath);

    if ((await fs.readFile(dataPath, "utf8")) === "")
      await fs.writeFile(dataPath, JSON.stringify([]));
    if ((await fs.readFile(pendingPath, "utf8")) === "")
      await fs.writeFile(pendingPath, JSON.stringify([]));
  },

  onStart: async function ({ event, api, args }) {
    const { threadID, messageID } = event;
    const dataPath = path.join(__dirname, "cache", "approvedThreads.json");
    const pendingPath = path.join(__dirname, "cache", "pendingThreads.json");

    let approved = await fs.readJson(dataPath);
    let pending = await fs.readJson(pendingPath);
    let msg = "";
    let idBox = args[1] || args[0] || threadID;

    if (args[0] === "list") {
      msg = "✅ Approved Boxes List:\n";
      approved.forEach((e, i) => (msg += `${i + 1}. ID: ${e}\n`));
      return api.sendMessage(msg || "No approved boxes found.", threadID, messageID);
    }

    if (args[0] === "del") {
      if (!approved.includes(idBox)) {
        return api.sendMessage("❌ This box was not approved.", threadID, messageID);
      }

      approved = approved.filter(id => id !== idBox);
      if (!pending.includes(idBox)) pending.push(idBox);
      await fs.writeJson(dataPath, approved, { spaces: 2 });
      await fs.writeJson(pendingPath, pending, { spaces: 2 });

      return api.sendMessage(`✅ Removed ${idBox} from approved list.`, threadID, messageID);
    }

    if (args[0] === "pending") {
      msg = "⏳ Pending Approval List:\n";
      let count = 1;
      for (const id of pending) {
        try {
          const info = await api.getThreadInfo(id);
          msg += `${count++}. ${info.name || "Unnamed Group"}\nID: ${id}\n`;
        } catch (err) {
          msg += `${count++}. Unknown Group\nID: ${id}\n`;
        }
      }
      return api.sendMessage(msg || "No pending approvals.", threadID, messageID);
    }

    if (isNaN(parseInt(idBox))) {
      return api.sendMessage("⚠️ Invalid ID format.", threadID, messageID);
    }

    if (approved.includes(idBox)) {
      return api.sendMessage(`✅ ID ${idBox} is already approved.`, threadID, messageID);
    }

    api.sendMessage(
      "✅ Your thread has been approved. You can now use bot commands.",
      idBox,
      async (error) => {
        if (error) {
          return api.sendMessage(
            "❌ Failed to send approval message. Check if bot is in that box.",
            threadID,
            messageID
          );
        }

        approved.push(idBox);
        pending = pending.filter(id => id !== idBox);
        await fs.writeJson(dataPath, approved, { spaces: 2 });
        await fs.writeJson(pendingPath, pending, { spaces: 2 });

        api.sendMessage(`✅ Successfully approved box ID: ${idBox}`, threadID, messageID);
      }
    );
  },
};
