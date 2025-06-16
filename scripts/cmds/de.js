const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "de",
    aliases: ["del"],
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 2,
    category: "system",
    shortDescription: "Delete a file from command folder",
    guide: "{pn} <filename>"
  },

  onStart: async function ({ api, event, args }) {
    const fileName = args[0];

    if (!fileName) {
      return api.sendMessage(
        "📦 | File name dao delete korar jonno. Example: de test.js",
        event.threadID, event.messageID
      );
    }

    const filePath = path.join(__dirname, fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("❌ Delete Error:", err);
        return api.sendMessage(
          `❌ File ta delete kora jay nai: ${fileName}\n• Error: File name vul naki exist kore na.`,
          event.threadID, event.messageID
        );
      }

      api.sendMessage(
        `✅ File delete kora hoise: ( ${fileName} ) 🎉`,
        event.threadID, event.messageID
      );
    });
  }
};
