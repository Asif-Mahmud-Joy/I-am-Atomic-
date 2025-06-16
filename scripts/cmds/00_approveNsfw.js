const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "nsfw",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    category: "NSFW",
    role: 2,
    shortDescription: "Manage NSFW access per thread",
    guide: {
      en: `
        {pn} approved [threadID] [optionalMessage] ✔ approve a thread
        {pn} remove [threadID] [reason] ❌ remove approval
        {pn} disapproved [threadID] [reason] ⚠ disapprove request
        {pn} check 📊 check current thread status
      `
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const threadID = event.threadID;
    const approvedIDsPath = path.join(__dirname, "assist_json", "approved_ids.json");
    const pendingIDsPath = path.join(__dirname, "assist_json", "pending_ids.json");

    await fs.ensureFile(approvedIDsPath);
    await fs.ensureFile(pendingIDsPath);
    let approvedIDs = await fs.readJson(approvedIDsPath).catch(() => []);
    let pendingIDs = await fs.readJson(pendingIDsPath).catch(() => []);

    const send = (msg) => message.reply(msg);

    if (args[0] === "approved" && args[1]) {
      const id = args[1];
      const adminMsg = args.slice(2).join(" ") || "No message";

      if (approvedIDs.includes(id)) return send("✅ Ei thread ID already approved!");
      approvedIDs.push(id);
      await fs.writeJson(approvedIDsPath, approvedIDs);

      if (pendingIDs.includes(id)) {
        pendingIDs = pendingIDs.filter(e => e !== id);
        await fs.writeJson(pendingIDsPath, pendingIDs);
      }

      api.sendMessage(`📌 NSFW Approved!
Now you can use NSFW commands in this thread.

Message from admin: ${adminMsg}`, id);
      return send("✅ This thread has been approved for NSFW access.");

    } else if (args[0] === "remove" && args[1]) {
      const id = args[1];
      const reason = args.slice(2).join(" ") || "No reason provided";

      if (!approvedIDs.includes(id)) return send("⚠️ Ei thread ID approve chilo na.");
      approvedIDs = approvedIDs.filter(e => e !== id);
      await fs.writeJson(approvedIDsPath, approvedIDs);

      api.sendMessage(`❌ NSFW Permission Removed.
Reason: ${reason}
Contact admin for more info.`, id);
      return send("✅ Removed NSFW access from this thread.");

    } else if (args[0] === "disapproved" && args[1]) {
      const id = args[1];
      const reason = args.slice(2).join(" ") || "No reason provided";

      if (!pendingIDs.includes(id)) return send("⚠️ Ei thread ID kono pending list e nai.");
      pendingIDs = pendingIDs.filter(e => e !== id);
      await fs.writeJson(pendingIDsPath, pendingIDs);

      api.sendMessage(`⚠ NSFW Request Disapproved.
Reason: ${reason}
Type $support to get help from admin.`, id);
      return send("✅ Thread disapproved for NSFW access.");

    } else if (args[0] === "check") {
      return send(approvedIDs.includes(threadID)
        ? "✅ NSFW is currently ON for this thread."
        : "❌ NSFW is currently OFF for this thread.");

    } else {
      return send("❓ Invalid usage. Type '$help nsfw' for full guide.");
    }
  }
};
